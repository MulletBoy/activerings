"""Activity data sources.

A source says where another integration keeps its activity data: which
entities carry today's totals, which long-term statistics hold the daily
history, and how to read its workouts. To support another source:
write a class with the ``ActivitySource`` shape and add it to ``SOURCES``.
Nothing else in the integration knows where the data comes from.

The daily statistics must be totals (a ``sum`` in the recorder) with a unit
the recorder can convert: kilometres or another length for distance, an energy
unit for the calories, a duration for exercise.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date, tzinfo
from typing import Protocol

from homeassistant.core import HomeAssistant, State

from ..const import SOURCE_LIFE_DASHBOARD
from ..workouts import Workout


@dataclass(frozen=True, slots=True)
class DayTotal:
    """A total for one day, as an entity carries it."""

    day: date | None
    value: float


@dataclass(frozen=True, slots=True)
class DayWorkouts:
    """The complete list of one day's workouts."""

    day: date
    workouts: list[Workout]


class ActivitySource(Protocol):
    """What the integration needs from a source."""

    key: str
    domain: str

    def entities(self, hass: HomeAssistant, source_entry_id: str) -> dict[str, str]:
        """Return the entity id for each metric the source provides."""

    def statistic_id(self, source_entry_id: str, metric: str) -> str | None:
        """Return the id of a metric's daily statistic, if it has one."""

    def day_total(self, metric: str, state: State) -> DayTotal | None:
        """Return the total an entity carries and the day it belongs to."""

    def workouts(self, state: State, tz: tzinfo) -> DayWorkouts | None:
        """Return the day's workouts carried by a workouts entity."""

    async def async_past_workouts(
        self, hass: HomeAssistant, source_entry_id: str, start: date, tz: tzinfo
    ) -> list[Workout] | None:
        """Return every workout the source keeps since ``start``, oldest first.

        The list must be complete from its first workout on. None when the
        source keeps no past workouts or cannot be asked right now; the days'
        lists of ``workouts`` are used then.
        """


def _sources() -> dict[str, ActivitySource]:
    # Imported here: the source modules import the classes above.
    from .life_dashboard import LifeDashboardSource  # noqa: PLC0415

    return {SOURCE_LIFE_DASHBOARD: LifeDashboardSource()}


SOURCES: dict[str, ActivitySource] = _sources()


def source_for_domain(domain: str) -> ActivitySource | None:
    """Return the source that reads an integration's data."""
    for source in SOURCES.values():
        if source.domain == domain:
            return source
    return None
