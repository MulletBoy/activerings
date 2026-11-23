"""The arithmetic behind ActiveRings. Nothing here knows about Home Assistant."""

from __future__ import annotations

from collections.abc import Iterable, Mapping, Sequence
from dataclasses import dataclass
from math import ceil, isfinite
from typing import Any

DAY_SECONDS = 86400.0
# Two days are "one after the other" when their starts are about a day apart:
# a day with a clock change is 23 or 25 hours long.
_NEXT_DAY = (20 * 3600.0, 28 * 3600.0)


@dataclass(frozen=True, slots=True)
class Day:
    """A period's total: one day, or a week or month for a chart."""

    start: float  # seconds since the epoch
    end: float
    value: float


@dataclass(frozen=True, slots=True)
class Streak:
    """Days in a row on which a goal was met."""

    current: int
    best: int


@dataclass(frozen=True, slots=True)
class Progress:
    """How far a value is towards its goal."""

    percent: float  # may pass 100
    score: float  # 0 to 100


def number(value: Any, limits: tuple[float, float] | None = None) -> float | None:
    """Return a finite number inside the limits, or None."""
    if isinstance(value, bool):
        return None
    try:
        result = float(value)
    except TypeError, ValueError, OverflowError:
        return None
    if not isfinite(result):
        return None
    if limits is not None and not limits[0] <= result <= limits[1]:
        return None
    return result


def totals(
    rows: Iterable[Mapping[str, Any]],
    limits: tuple[float, float] | None = None,
    *,
    per_day: bool = True,
) -> list[Day]:
    """Turn recorder statistics rows (a ``change`` per period) into totals.

    ``limits`` are for one day; a week or a month (``per_day`` False) may hold
    as many days' worth as it is long. Implausible rows are dropped.
    """
    result: list[Day] = []
    for row in rows:
        start = number(row.get("start"))
        end = number(row.get("end"))
        if start is None or end is None or end <= start:
            continue
        allowed = limits
        if limits is not None and not per_day:
            allowed = (limits[0], limits[1] * ceil((end - start) / DAY_SECONDS))
        value = number(row.get("change"), allowed)
        if value is None:
            continue
        result.append(Day(start=start, end=end, value=value))
    result.sort(key=lambda day: day.start)
    return result


def mean(values: Sequence[float]) -> float | None:
    """The plain average, or None when there is nothing to average."""
    return sum(values) / len(values) if values else None


def average_before(days: Sequence[Day], before: float, count: int) -> tuple[float, int] | None:
    """Average the days that started in the ``count`` days before a moment.

    Only complete days count (``before`` is the start of today), and only days
    that have a total: a day the phone was off is left out rather than read as
    zero. Returns the average and how many days it is made of.
    """
    earliest = before - count * DAY_SECONDS - 3 * 3600
    values = [day.value for day in days if earliest <= day.start < before]
    values = values[-count:]
    average = mean(values)
    return None if average is None else (average, len(values))


def total_since(days: Sequence[Day], since: float, before: float) -> float:
    """Add up the days that started in a window."""
    return sum(day.value for day in days if since <= day.start < before)


def streak(days: Sequence[Day], goal: float, today_start: float, today: float | None) -> Streak:
    """Count the days in a row that reached the goal.

    Today counts once it has reached the goal, and does not break the run
    before then: the day is not over. ``days`` holds complete days only.
    """
    if goal <= 0:
        return Streak(current=0, best=0)
    best = 0
    run = 0
    previous: Day | None = None
    for day in days:
        if day.start >= today_start:
            break
        follows = (
            previous is not None and _NEXT_DAY[0] <= day.start - previous.start <= _NEXT_DAY[1]
        )
        if day.value < goal:
            run = 0
        elif follows and run:
            run += 1
        else:
            run = 1
        best = max(best, run)
        previous = day
    # The run only stands if it reaches yesterday.
    reaches_yesterday = previous is not None and today_start - previous.start <= _NEXT_DAY[1]
    current = run if reaches_yesterday else 0
    if today is not None and today >= goal:
        current += 1
    return Streak(current=current, best=max(best, current))


def week_values(days: Sequence[Day], starts: Sequence[float]) -> list[float]:
    """Each day's total for a row of days given by their starts; a day without one is 0.

    A total belongs to a day when it starts within three hours of it: the
    recorder rounds a half-hour time zone's midnight to the hour.
    """
    values = [0.0] * len(starts)
    for day in days:
        for index, start in enumerate(starts):
            if abs(day.start - start) <= 3 * 3600:
                values[index] = day.value
                break
    return values


def best_day(days: Sequence[Day]) -> Day | None:
    """The day with the highest total."""
    return max(days, key=lambda day: day.value) if days else None


def progress(value: float | None, goal: float | None) -> Progress | None:
    """A value against its goal: the share reached, and a score capped at 100."""
    if value is None or goal is None or goal <= 0 or value < 0:
        return None
    percent = value / goal * 100
    return Progress(percent=percent, score=min(100.0, percent))


def elapsed_days(start: float, end: float, now: float) -> int:
    """How many days of a period have begun: a running week counts only so far."""
    until = min(end, now)
    return max(1, ceil((until - start) / DAY_SECONDS - 1e-6))
