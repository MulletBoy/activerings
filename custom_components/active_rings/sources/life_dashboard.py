"""Life Dashboard (https://github.com/owen282000/life-dashboard-ha).

Life Dashboard gives every value its own sensor (unique id
``<entry id>_<key>``) and writes each day's totals to long-term statistics
named ``life_dashboard:<entry id>_<key>``. Its "today" sensors say in the
attribute ``date`` which day their total is for. The sensors Exercise today
and Exercise yesterday list that day's workouts in the attribute ``sessions``.
Life Dashboard 1.5.0 and newer also keeps the workouts from before those two
days and returns them all with its action ``life_dashboard.get_workouts``.
"""

from __future__ import annotations

import logging
from collections.abc import Mapping
from datetime import date, datetime, tzinfo
from typing import Any

import voluptuous as vol
from homeassistant.const import ATTR_UNIT_OF_MEASUREMENT, UnitOfLength
from homeassistant.core import HomeAssistant, State
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers import entity_registry as er
from homeassistant.util.unit_conversion import DistanceConverter

from ..activity import number
from ..const import (
    ACTIVE_ENERGY,
    DISTANCE,
    EXERCISE,
    LAST_SYNC,
    LIMITS,
    MAX_WORKOUTS,
    MAX_WORKOUTS_PER_DAY,
    SOURCE_LIFE_DASHBOARD,
    STEPS,
    TOTAL_ENERGY,
    WORKOUTS_TODAY,
    WORKOUTS_YESTERDAY,
)
from ..workouts import Workout, parse_workouts
from . import DayTotal, DayWorkouts

_LOGGER = logging.getLogger(__name__)

LIFE_DASHBOARD_DOMAIN = "life_dashboard"
ACTION_GET_WORKOUTS = "get_workouts"
# Life Dashboard's option for the shortest workout its sensors count, in minutes.
# Its action returns every workout and leaves that choice to the reader.
OPTION_SHORTEST_WORKOUT = "min_workout_minutes"

# The end of each sensor's unique id, and the metrics it carries.
UNIQUE_ID_KEYS: dict[str, tuple[str, ...]] = {
    "steps_today": (STEPS,),
    "distance_today": (DISTANCE,),
    "active_calories_today": (ACTIVE_ENERGY,),
    "total_calories_today": (TOTAL_ENERGY,),
    "exercise_today": (EXERCISE, WORKOUTS_TODAY),
    "exercise_yesterday": (WORKOUTS_YESTERDAY,),
    "last_health_sync": (LAST_SYNC,),
}
# The end of each daily statistic's id.
STATISTIC_KEYS = {
    STEPS: "steps",
    DISTANCE: "distance",
    ACTIVE_ENERGY: "active_calories",
    TOTAL_ENERGY: "total_calories",
    # Named after minutes, kept in hours: the recorder converts it.
    EXERCISE: "exercise_minutes",
}


def _parse_date(value: Any) -> date | None:
    # A datetime is a date too, and must not pass as one.
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, date):
        return value
    try:
        return date.fromisoformat(str(value))
    except ValueError:
        return None


class LifeDashboardSource:
    """Adapter for the Life Dashboard integration."""

    key = SOURCE_LIFE_DASHBOARD
    domain = LIFE_DASHBOARD_DOMAIN

    def entities(self, hass: HomeAssistant, source_entry_id: str) -> dict[str, str]:
        """Find the entry's sensors by the end of their unique ids."""
        prefix = f"{source_entry_id.lower()}_"
        found: dict[str, str] = {}
        registry = er.async_get(hass)
        for entry in er.async_entries_for_config_entry(registry, source_entry_id):
            unique_id = str(entry.unique_id).lower()
            if entry.disabled_by is not None or not unique_id.startswith(prefix):
                continue
            for metric in UNIQUE_ID_KEYS.get(unique_id[len(prefix) :], ()):
                found[metric] = entry.entity_id
        return found

    def statistic_id(self, source_entry_id: str, metric: str) -> str | None:
        """Life Dashboard names a statistic after its entry and the key."""
        key = STATISTIC_KEYS.get(metric)
        if key is None:
            return None
        return f"{LIFE_DASHBOARD_DOMAIN}:{source_entry_id.lower()}_{key}"

    def day_total(self, metric: str, state: State) -> DayTotal | None:
        """Read a "today" sensor: its value, and the day its ``date`` names."""
        value = number(state.state)
        if value is None:
            return None
        if metric == DISTANCE:
            unit = state.attributes.get(ATTR_UNIT_OF_MEASUREMENT)
            if isinstance(unit, str) and unit in DistanceConverter.VALID_UNITS:
                try:
                    value = DistanceConverter.convert(value, unit, UnitOfLength.KILOMETERS)
                except ValueError:
                    return None
        value = number(value, LIMITS.get(metric))
        if value is None:
            return None
        return DayTotal(day=_parse_date(state.attributes.get("date")), value=value)

    def workouts(self, state: State, tz: tzinfo) -> DayWorkouts | None:
        """Read a day's workouts. Without the day they are for, they are not used."""
        day = _parse_date(state.attributes.get("date"))
        sessions = state.attributes.get("sessions")
        if day is None or not isinstance(sessions, (list, tuple)):
            return None
        return DayWorkouts(day=day, workouts=parse_workouts(sessions, tz, MAX_WORKOUTS_PER_DAY))

    async def async_past_workouts(
        self, hass: HomeAssistant, source_entry_id: str, start: date, tz: tzinfo
    ) -> list[Workout] | None:
        """Ask Life Dashboard for every workout it keeps (1.5.0 and newer).

        Workouts shorter than Life Dashboard's own "shortest workout" option are
        left out, as its sensors leave them out.
        """
        if not hass.services.has_service(LIFE_DASHBOARD_DOMAIN, ACTION_GET_WORKOUTS):
            return None
        try:
            response = await hass.services.async_call(
                LIFE_DASHBOARD_DOMAIN,
                ACTION_GET_WORKOUTS,
                {"config_entry": source_entry_id, "start": start.isoformat()},
                blocking=True,
                return_response=True,
            )
        except HomeAssistantError, vol.Invalid:
            _LOGGER.debug("Life Dashboard did not return its workouts", exc_info=True)
            return None
        listed = response.get("workouts") if isinstance(response, Mapping) else None
        if not isinstance(listed, list):
            return None
        entry = hass.config_entries.async_get_entry(source_entry_id)
        shortest = (
            number(entry.options.get(OPTION_SHORTEST_WORKOUT), (0, 24 * 60)) if entry else None
        )
        # The list is oldest first: if it is longer than the log may be, the newest count.
        return [
            workout
            for workout in parse_workouts(listed[-MAX_WORKOUTS:], tz, MAX_WORKOUTS)
            if workout.minutes >= (shortest or 0)
        ]
