"""Workouts, and the log ActiveRings keeps of them. Nothing here knows about Home Assistant.

A source lists the workouts of today and yesterday and forgets older ones, so
this is the one thing ActiveRings stores itself: every workout it has seen,
for the week's rings and the list on the card. A day's list from the source is
complete, so it replaces what the log held for that day: a workout deleted or
corrected on the phone is deleted or corrected here.
"""

from __future__ import annotations

import re
from collections.abc import Iterable, Mapping
from dataclasses import dataclass
from datetime import UTC, date, datetime, timedelta, tzinfo
from typing import Any

from .activity import number

MAX_KIND_LENGTH = 40
MAX_WORKOUT_HOURS = 24
# A name is cut to this before it is cleaned, however long a source makes it.
MAX_RAW_NAME = 200
# A workout outside these years is a broken clock or a broken record. Staying
# well inside the calendar also keeps every later change of time zone safe.
EARLIEST_START = datetime(2000, 1, 1, tzinfo=UTC)
LATEST_START = datetime(2200, 1, 1, tzinfo=UTC)
_KIND = re.compile(r"[^a-z0-9_]+")

# The focus activity: the kind of workout a person wants to keep up. Each of
# these names stands for every kind of workout whose name holds one of its
# words, so "cycling" counts a ride outdoors and one on a stationary bike.
# Any other name is taken as it is, so a sport that is not listed can be
# typed in ("tennis", "rock_climbing").
FOCUS_GROUPS: dict[str, tuple[str, ...]] = {
    "strength": ("strength", "weightlifting", "calisthenics", "core_training"),
    "running": ("running",),
    "walking": ("walking",),
    "hiking": ("hiking",),
    "cycling": ("biking", "cycling"),
    "swimming": ("swim",),
    "rowing": ("rowing",),
    "yoga": ("yoga",),
    "pilates": ("pilates",),
    "hiit": ("hiit", "high_intensity"),
    "dancing": ("danc",),
}
DEFAULT_FOCUS = "strength"

# The optional details of a workout, with the limits a value must be inside.
DETAILS: dict[str, tuple[float, float]] = {
    "active_calories": (0, 20_000),
    "total_calories": (0, 30_000),
    "distance_km": (0, 500),
    "pace_min_per_km": (0.5, 120),
    "heart_rate_avg": (20, 250),
    "heart_rate_min": (20, 250),
    "heart_rate_max": (20, 250),
    "steps": (0, 200_000),
}


@dataclass(frozen=True, slots=True)
class Workout:
    """One workout: what it was, when, how long, and the details the source knew."""

    kind: str
    start: datetime
    end: datetime
    minutes: float
    details: tuple[tuple[str, float], ...] = ()

    @property
    def key(self) -> str:
        """What the workout is stored under: when it began and what it was."""
        return f"{self.start.astimezone(UTC).isoformat()}|{self.kind}"

    def as_dict(self) -> dict[str, Any]:
        """The workout as it is stored and sent to the card."""
        return {
            "type": self.kind,
            "start": self.start.isoformat(),
            "end": self.end.isoformat(),
            "minutes": round(self.minutes, 1),
            **{name: round(value, 2) for name, value in self.details},
        }


def parse_focus(value: Any) -> str | None:
    """A focus activity as it is kept: a clean name, or None when it is not one."""
    if not isinstance(value, str):
        return None
    name = _KIND.sub("_", value[:MAX_RAW_NAME].strip().lower()).strip("_")[:MAX_KIND_LENGTH]
    return name or None


def clean_focus(value: Any) -> str:
    """The focus activity in force: the one given when it is usable, else the default."""
    return parse_focus(value) or DEFAULT_FOCUS


def matches_focus(kind: str, focus: str) -> bool:
    """Whether a kind of workout counts for a focus activity."""
    return any(word in kind for word in FOCUS_GROUPS.get(focus, (focus,)))


def _moment(value: Any, tz: tzinfo) -> datetime | None:
    if isinstance(value, datetime):
        parsed = value
    elif isinstance(value, str) and len(value) <= 40:
        try:
            parsed = datetime.fromisoformat(value)
        except ValueError:
            return None
    else:
        return None
    return parsed if parsed.tzinfo else parsed.replace(tzinfo=tz)


def parse_workout(item: Any, tz: tzinfo) -> Workout | None:
    """Read one workout from a source's list, or None when it cannot be used."""
    if not isinstance(item, Mapping):
        return None
    raw_kind = item.get("type")
    if not isinstance(raw_kind, str):
        return None
    kind = _KIND.sub("_", raw_kind[:MAX_RAW_NAME].strip().lower()).strip("_")[:MAX_KIND_LENGTH]
    start = _moment(item.get("start"), tz)
    end = _moment(item.get("end"), tz)
    if not kind or start is None or end is None:
        return None
    try:
        length = end - start
        in_range = EARLIEST_START <= start.astimezone(UTC) <= LATEST_START
        local_start = start.astimezone(tz).date()
        local_end = end.astimezone(tz).date()
    except OverflowError, ValueError:
        return None
    if not in_range:
        return None
    if not timedelta(0) < length <= timedelta(hours=MAX_WORKOUT_HOURS):
        return None
    whole = length.total_seconds() / 60
    minutes = number(item.get("minutes"), (0, MAX_WORKOUT_HOURS * 60))
    # A source may split a workout that crosses midnight between its two days:
    # the log keeps it once, at its whole length.
    if minutes is None or minutes <= 0 or minutes > whole + 1 or local_start != local_end:
        minutes = whole
    details = tuple(
        (name, value)
        for name, limits in DETAILS.items()
        if (value := number(item.get(name), limits)) is not None
    )
    return Workout(kind=kind, start=start, end=end, minutes=minutes, details=details)


def parse_workouts(items: Any, tz: tzinfo, limit: int) -> list[Workout]:
    """Read a source's list of workouts: the usable ones, oldest first, each once."""
    if not isinstance(items, (list, tuple)):
        return []
    found: dict[str, Workout] = {}
    for item in items[:limit]:
        workout = parse_workout(item, tz)
        if workout is not None:
            found[workout.key] = workout
    return sorted(found.values(), key=lambda workout: workout.start)


class WorkoutLog:
    """Every workout seen so far, by key."""

    def __init__(self) -> None:
        """Start with an empty log."""
        self._workouts: dict[str, Workout] = {}
        # The first day the log was told about: before it, nothing is known.
        self.since: date | None = None

    def __len__(self) -> int:
        """Return how many workouts are kept."""
        return len(self._workouts)

    def merge(self, day: date, workouts: Iterable[Workout], tz: tzinfo) -> bool:
        """Take a source's complete list for one day. Returns whether anything changed.

        A day's list holds the workouts that began on that day, and one that
        began the evening before and ran past midnight. Anything else in it is
        a broken record and is left out.
        """
        before = dict(self._workouts)
        since = self.since
        days = (day, day - timedelta(days=1))
        listed = {
            workout.key: workout
            for workout in workouts
            if workout.start.astimezone(tz).date() in days
        }
        for key, workout in list(self._workouts.items()):
            if workout.start.astimezone(tz).date() == day and key not in listed:
                del self._workouts[key]
        self._workouts.update(listed)
        if self.since is None or day < self.since:
            self.since = day
        return self._workouts != before or self.since != since

    def prune(self, today: date, max_age_days: int, max_count: int) -> bool:
        """Drop what is too old or lies in the future, and the oldest when there are too many."""
        earliest = today - timedelta(days=max_age_days)
        latest = today + timedelta(days=1)
        kept = [
            (key, workout)
            for key, workout in self._workouts.items()
            if earliest <= workout.start.date() <= latest
        ]
        kept.sort(key=lambda item: item[1].start)
        kept = kept[-max_count:]
        changed = len(kept) != len(self._workouts)
        if self.since is not None and self.since > today:
            self.since = today
            changed = True
        self._workouts = dict(kept)
        return changed

    def between(self, start: datetime, end: datetime) -> list[Workout]:
        """The workouts that began in a window, oldest first."""
        return sorted(
            (workout for workout in self._workouts.values() if start <= workout.start < end),
            key=lambda workout: workout.start,
        )

    def recent(self, count: int) -> list[Workout]:
        """The newest workouts, newest first."""
        newest = sorted(self._workouts.values(), key=lambda workout: workout.start, reverse=True)
        return newest[:count]

    def as_dict(self) -> dict[str, Any]:
        """The log as it is stored."""
        return {
            "since": self.since.isoformat() if self.since else None,
            "workouts": [
                workout.as_dict()
                for workout in sorted(self._workouts.values(), key=lambda item: item.start)
            ],
        }

    @classmethod
    def from_dict(cls, data: Any, tz: tzinfo, max_count: int) -> WorkoutLog:
        """Read a stored log, checking every workout as if it came from a source."""
        log = cls()
        if not isinstance(data, Mapping):
            return log
        since = data.get("since")
        if isinstance(since, str):
            try:
                log.since = date.fromisoformat(since)
            except ValueError:
                log.since = None
        stored = data.get("workouts")
        if isinstance(stored, list):
            for item in stored[-max_count:]:
                workout = parse_workout(item, tz)
                if workout is not None:
                    log._workouts[workout.key] = workout
        return log
