"""Works out the activity figures and keeps them current.

The totals are read from the source's entities and its long-term statistics
each time, so they can be worked out again at any time. Only the workouts are
kept (see workouts.py): the source forgets them after two days.
"""

from __future__ import annotations

import asyncio
import logging
from collections.abc import Callable
from datetime import date, datetime, timedelta
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import CALLBACK_TYPE, Event, HomeAssistant, State, callback
from homeassistant.helpers.debounce import Debouncer
from homeassistant.helpers.event import async_track_state_change_event, async_track_time_interval
from homeassistant.helpers.start import async_at_started
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .activity import (
    Day,
    average_before,
    best_day,
    elapsed_days,
    number,
    progress,
    streak,
    totals,
    week_values,
)
from .const import (
    ACTIVE_DAYS_WEEK,
    ACTIVE_ENERGY,
    AVERAGE_LONG_DAYS,
    CONF_EXERCISE_GOAL,
    CONF_FOCUS_ACTIVITY,
    CONF_SOURCE,
    CONF_SOURCE_ENTRY,
    CONF_STEPS_GOAL,
    DOMAIN,
    EXERCISE,
    EXERCISE_WEEK,
    FOCUS_WEEK,
    GOALS,
    HISTORY_DAYS,
    LAST_SYNC,
    LIMITS,
    MAX_SERIES_POINTS,
    MAX_WORKOUT_AGE_DAYS,
    MAX_WORKOUTS,
    RECENT_WORKOUTS,
    REFRESH_COOLDOWN,
    REFRESH_INTERVAL,
    RESTING_ENERGY,
    SAVE_DELAY,
    SERIES_METRICS,
    STEPS,
    STEPS_AVERAGE,
    STEPS_BEST,
    STEPS_STREAK,
    TODAY_RINGS,
    TODAY_SCORE,
    TOTAL_ENERGY,
    WEEK_DAYS,
    WEEK_RINGS,
    WEEK_SCORE,
    WORKOUTS_TODAY,
    WORKOUTS_WEEK,
    WORKOUTS_YESTERDAY,
)
from .sources import SOURCES, ActivitySource
from .workouts import WorkoutLog, clean_focus, matches_focus

_LOGGER = logging.getLogger(__name__)

type ActiveRingsConfigEntry = ConfigEntry[ActiveRingsManager]

STORAGE_VERSION = 1
# Statistics are always read in these units, whatever the source keeps them in.
STATISTIC_UNITS = {"distance": "km", "energy": "kcal", "duration": "min"}
# Decimals each total is rounded to.
DIGITS = {STEPS: 0, EXERCISE: 0, ACTIVE_ENERGY: 0, TOTAL_ENERGY: 0}


def storage_key(entry_id: str) -> str:
    """The name of the file an entry's workout log is kept in."""
    return f"{DOMAIN}.{entry_id}"


def _iso(value: datetime | None) -> str | None:
    return None if value is None else value.isoformat()


def _round(value: float | None, digits: int = 0) -> float | None:
    if value is None:
        return None
    return round(value, digits) if digits else float(round(value))


def goals(options: dict[str, Any]) -> dict[str, float]:
    """The goals in force: the options where they are usable, else the defaults."""
    result: dict[str, float] = {}
    for key, (default, low, high) in GOALS.items():
        value = number(options.get(key), (low, high))
        result[key] = default if value is None else value
    return result


class ActiveRingsManager:
    """Holds one person's figures and tells the sensors when they change."""

    def __init__(self, hass: HomeAssistant, entry: ActiveRingsConfigEntry) -> None:
        """Initialise the manager."""
        self.hass = hass
        self.entry = entry
        self.source: ActivitySource = SOURCES[entry.data[CONF_SOURCE]]
        self.source_entry_id: str = entry.data[CONF_SOURCE_ENTRY]
        self.entities: dict[str, str] = {}
        self.metrics: dict[str, dict[str, Any]] = {}
        self.workouts: list[dict[str, Any]] = []
        self.updated: datetime | None = None
        self.synced: datetime | None = None
        self.log = WorkoutLog()
        self._store: Store[dict[str, Any]] = Store(
            hass, STORAGE_VERSION, storage_key(entry.entry_id), private=True
        )
        self._unsaved = False
        # Set when the entry is unloaded: a refresh still under way must not
        # write the log again (the entry may just have been deleted).
        self._closed = False
        self._listeners: list[Callable[[], None]] = []
        self._unsubscribe: list[CALLBACK_TYPE] = []
        # One statistics read at a time, however many charts ask at once.
        self._statistics_lock = asyncio.Lock()
        self._debouncer = Debouncer(
            hass,
            _LOGGER,
            cooldown=REFRESH_COOLDOWN,
            immediate=False,
            function=self.async_refresh,
        )

    @property
    def goals(self) -> dict[str, float]:
        """The goals the rings are filled against."""
        return goals(dict(self.entry.options))

    @property
    def focus(self) -> str:
        """The kind of workout the third ring of the week follows."""
        return clean_focus(self.entry.options.get(CONF_FOCUS_ACTIVITY))

    async def async_setup(self) -> None:
        """Read the workout log, find the source's entities and start following them."""
        try:
            stored = await self._store.async_load()
        except Exception:  # noqa: BLE001 - an unreadable log must not stop the figures
            _LOGGER.warning("The workout log could not be read; starting a new one")
            stored = None
        self.log = WorkoutLog.from_dict(stored, dt_util.DEFAULT_TIME_ZONE, MAX_WORKOUTS)
        self.entities = self.source.entities(self.hass, self.source_entry_id)
        if self.entities:
            self._unsubscribe.append(
                async_track_state_change_event(
                    self.hass, sorted(set(self.entities.values())), self._handle_source_change
                )
            )
        self._unsubscribe.append(
            async_track_time_interval(self.hass, self._handle_timer, REFRESH_INTERVAL)
        )
        # The recorder answers once Home Assistant has started.
        self._unsubscribe.append(async_at_started(self.hass, self._handle_started))

    async def async_unload(self) -> None:
        """Stop following the source, and write the log if it is waiting to be written."""
        self._closed = True
        self._debouncer.async_shutdown()
        while self._unsubscribe:
            self._unsubscribe.pop()()
        if self._unsaved:
            await self._store.async_save(self.log.as_dict())
            self._unsaved = False

    @callback
    def async_add_listener(self, listener: Callable[[], None]) -> CALLBACK_TYPE:
        """Call ``listener`` whenever the figures change."""
        self._listeners.append(listener)

        @callback
        def remove() -> None:
            self._listeners.remove(listener)

        return remove

    @callback
    def _handle_source_change(self, event: Event) -> None:
        self._debouncer.async_schedule_call()

    async def _handle_timer(self, now: datetime) -> None:
        await self.async_refresh()

    async def _handle_started(self, hass: HomeAssistant) -> None:
        await self.async_refresh()

    def value(self, metric: str, field: str = "value") -> Any:
        """Return one field of one metric, or None."""
        return self.metrics.get(metric, {}).get(field)

    def summary(self) -> dict[str, Any]:
        """Everything the card shows apart from the charts."""
        return {
            "updated": _iso(self.updated),
            "synced": _iso(self.synced),
            "metrics": self.metrics,
            "focus": self.focus,
            "workouts": self.workouts,
            "workouts_since": self.log.since.isoformat() if self.log.since else None,
        }

    async def async_refresh(self) -> None:
        """Work every figure out again and tell the listeners if any changed."""
        try:
            metrics = await self._async_metrics()
        except Exception:  # noqa: BLE001 - a broken source must not break the rest
            _LOGGER.exception("Could not work out the figures")
            return
        if self._closed:
            return
        self.updated = dt_util.utcnow()
        focus = self.focus
        workouts = [
            workout.as_dict() | ({"focus": True} if matches_focus(workout.kind, focus) else {})
            for workout in self.log.recent(RECENT_WORKOUTS)
        ]
        if metrics == self.metrics and workouts == self.workouts:
            return
        self.metrics = metrics
        self.workouts = workouts
        for listener in list(self._listeners):
            listener()

    def _state(self, metric: str) -> State | None:
        entity_id = self.entities.get(metric)
        state = self.hass.states.get(entity_id) if entity_id else None
        if state is None or state.state in ("unknown", "unavailable"):
            return None
        return state

    def _today_total(self, metric: str, today: date, days: list[Day], start: float) -> float | None:
        """Today's total: the source entity's when it is for today, else the statistic's.

        Right after midnight the entity still holds yesterday's total; nothing
        has been counted for the new day then, which is a total of zero.
        """
        state = self._state(metric)
        try:
            carried = self.source.day_total(metric, state) if state else None
        except Exception:  # noqa: BLE001 - one odd entity must not stop the rest
            _LOGGER.debug("Could not read a total of today", exc_info=True)
            carried = None
        if carried is not None and carried.day == today:
            return carried.value
        for day in reversed(days):
            if day.start >= start:
                return day.value
        if carried is not None or days:
            return 0.0
        return None

    async def _async_metrics(self) -> dict[str, dict[str, Any]]:
        now = dt_util.utcnow()
        local_now = dt_util.as_local(now)
        today = local_now.date()
        midnight = dt_util.start_of_local_day(local_now)
        today_start = midnight.timestamp()
        # The last seven days, oldest first, today last.
        week = [today - timedelta(days=back) for back in range(WEEK_DAYS - 1, -1, -1)]
        targets = self.goals
        metrics: dict[str, dict[str, Any]] = {}

        sync = self._state(LAST_SYNC)
        synced = None
        if sync is not None:
            try:
                synced = dt_util.parse_datetime(sync.state)
            except ValueError:
                synced = None

        history = await self._async_history(midnight)

        # Today's totals, with what is usual: the averages of the complete days before.
        for metric in SERIES_METRICS:
            days = history.get(metric, [])
            value = self._today_total(metric, today, days, today_start)
            if value is None:
                continue
            digits = DIGITS.get(metric, 2)
            entry: dict[str, Any] = {"value": _round(value, digits)}
            for name, count in (("average_7d", WEEK_DAYS), ("average_30d", AVERAGE_LONG_DAYS)):
                usual = average_before(days, today_start, count)
                if usual is not None:
                    entry[name] = _round(usual[0], digits)
            metrics[metric] = entry

        active = metrics.get(ACTIVE_ENERGY, {}).get("value")
        total = metrics.get(TOTAL_ENERGY, {}).get("value")
        if active is not None and total is not None and total >= active:
            metrics[RESTING_ENERGY] = {"value": _round(total - active)}

        # Steps: the average of the last seven complete days, the run of days on
        # goal and the best day of the last year.
        steps_days = history.get(STEPS, [])
        steps_goal = targets[CONF_STEPS_GOAL]
        usual = average_before(steps_days, today_start, WEEK_DAYS)
        if usual is not None:
            metrics[STEPS_AVERAGE] = {
                "value": _round(usual[0]),
                "days": usual[1],
                "goal": steps_goal,
            }
            month = average_before(steps_days, today_start, AVERAGE_LONG_DAYS)
            if month is not None:
                metrics[STEPS_AVERAGE]["average_30d"] = _round(month[0])
        if steps_days or STEPS in metrics:
            complete = [day for day in steps_days if day.start < today_start]
            run = streak(complete, steps_goal, today_start, metrics.get(STEPS, {}).get("value"))
            metrics[STEPS_STREAK] = {"value": run.current, "best": run.best, "goal": steps_goal}
            best = best_day(complete)
            if best is not None:
                when = dt_util.as_local(dt_util.utc_from_timestamp(best.start + 12 * 3600))
                metrics[STEPS_BEST] = {"value": _round(best.value), "date": when.date().isoformat()}

        # Exercise over the last seven days, today included: how much in all, and
        # on how many of the days the daily goal was reached.
        if EXERCISE in metrics:
            starts = [dt_util.start_of_local_day(day).timestamp() for day in week]
            minutes = week_values(history.get(EXERCISE, []), starts)
            minutes[-1] = metrics[EXERCISE]["value"]
            metrics[EXERCISE_WEEK] = {
                "value": _round(sum(minutes)),
                "days": [round(amount) for amount in minutes],
            }
            threshold = targets[CONF_EXERCISE_GOAL]
            active = [amount >= threshold for amount in minutes]
            metrics[ACTIVE_DAYS_WEEK] = {
                "value": sum(active),
                "days": active,
                "threshold": threshold,
            }

        # Workouts: take in what the source lists, then count the week.
        self._take_in_workouts(today)
        if self.log.since is not None:
            since = midnight - timedelta(days=WEEK_DAYS - 1)
            listed = self.log.between(since, now + timedelta(days=1))
            tz = dt_util.DEFAULT_TIME_ZONE
            focus = self.focus
            focus_days = {
                workout.start.astimezone(tz).date()
                for workout in listed
                if matches_focus(workout.kind, focus)
            }
            # In its first week the log has not seen the whole seven days yet.
            known = min(WEEK_DAYS, (today - self.log.since).days + 1)
            metrics[WORKOUTS_WEEK] = {
                "value": len(listed),
                "minutes": _round(sum(workout.minutes for workout in listed)),
                "days_known": known,
            }
            metrics[FOCUS_WEEK] = {
                "value": len(focus_days),
                "activity": focus,
                "days": [day in focus_days for day in week],
                "days_known": known,
            }

        self._add_scores(metrics, targets)
        # Only now: a failed refresh must not look freshly synced.
        self.synced = synced
        return metrics

    def _take_in_workouts(self, today: date) -> None:
        """Fold the source's lists for today and yesterday into the log."""
        tz = dt_util.DEFAULT_TIME_ZONE
        changed = False
        for metric in (WORKOUTS_YESTERDAY, WORKOUTS_TODAY):
            state = self._state(metric)
            try:
                listed = self.source.workouts(state, tz) if state else None
            except Exception:  # noqa: BLE001 - one odd entity must not stop the rest
                _LOGGER.debug("Could not read a list of workouts", exc_info=True)
                listed = None
            # A list for a day in the future is a broken clock: leave the log alone.
            if listed is None or listed.day > today + timedelta(days=1):
                continue
            changed = self.log.merge(listed.day, listed.workouts, tz) or changed
        changed = self.log.prune(today, MAX_WORKOUT_AGE_DAYS, MAX_WORKOUTS) or changed
        if changed and not self._closed:
            self._unsaved = True
            self._store.async_delay_save(self._data_to_save, SAVE_DELAY)

    @callback
    def _data_to_save(self) -> dict[str, Any]:
        self._unsaved = False
        return self.log.as_dict()

    def _add_scores(self, metrics: dict[str, dict[str, Any]], targets: dict[str, float]) -> None:
        """Fill every ring against its goal, and score each set of three."""

        def fill(metric: str, goal_key: str) -> float | None:
            values = metrics.get(metric)
            reached = progress(values.get("value") if values else None, targets[goal_key])
            if values is None or reached is None:
                return None
            values["goal"] = targets[goal_key]
            values["percent"] = round(reached.percent)
            values["score"] = round(reached.score)
            return reached.score

        today = [fill(metric, goal_key) for metric, goal_key in TODAY_RINGS.items()]
        week = [fill(metric, goal_key) for metric, goal_key in WEEK_RINGS.items()]
        for key, scores in ((TODAY_SCORE, today), (WEEK_SCORE, week)):
            found = [score for score in scores if score is not None]
            if found:
                metrics[key] = {"value": round(sum(found) / len(found)), "rings": len(found)}

    async def _async_history(self, midnight: datetime) -> dict[str, list[Day]]:
        """Each metric's daily totals over the last year, today included."""
        ids = {
            metric: statistic_id
            for metric in SERIES_METRICS
            if (statistic_id := self.source.statistic_id(self.source_entry_id, metric))
        }
        if not ids:
            return {}
        end = dt_util.as_utc(midnight) + timedelta(days=1, hours=2)
        start = dt_util.as_utc(midnight) - timedelta(days=HISTORY_DAYS)
        rows = await self._async_statistics(set(ids.values()), start, end, "day")
        return {
            metric: totals(rows.get(statistic_id, []), LIMITS[metric])
            for metric, statistic_id in ids.items()
        }

    async def async_series(
        self, metric: str, period: str, start: datetime, end: datetime
    ) -> dict[str, Any] | None:
        """Chart points for one metric; None if the source has no such history."""
        if metric not in SERIES_METRICS:
            return None
        statistic_id = self.source.statistic_id(self.source_entry_id, metric)
        if statistic_id is None:
            return None
        rows = await self._async_statistics({statistic_id}, start, end, period)
        points = totals(rows.get(statistic_id, []), LIMITS[metric], per_day=period == "day")
        now = dt_util.utcnow().timestamp()
        return {
            "metric": metric,
            "period": period,
            "points": [
                {
                    "start": round(point.start * 1000),
                    "end": round(point.end * 1000),
                    "value": round(point.value, 2),
                    # A running week or month has fewer days behind it than it is long.
                    "days": elapsed_days(point.start, point.end, now),
                }
                for point in points[-MAX_SERIES_POINTS:]
            ],
        }

    async def _async_statistics(
        self, statistic_ids: set[str], start: datetime, end: datetime, period: str
    ) -> dict[str, list[dict[str, Any]]]:
        """Read long-term statistics; empty when there is no recorder."""
        if not statistic_ids or "recorder" not in self.hass.config.components:
            return {}
        # Imported here: the recorder is an optional dependency.
        from homeassistant.components.recorder import get_instance  # noqa: PLC0415
        from homeassistant.components.recorder.statistics import (  # noqa: PLC0415
            statistics_during_period,
        )

        async with self._statistics_lock:
            return await get_instance(self.hass).async_add_executor_job(
                statistics_during_period,
                self.hass,
                start,
                end,
                statistic_ids,
                period,
                STATISTIC_UNITS,
                {"change"},
            )
