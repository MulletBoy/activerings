"""Sensors for the figures ActiveRings works out."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from homeassistant.components.sensor import (
    SensorEntity,
    SensorEntityDescription,
    SensorStateClass,
)
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.device_registry import DeviceEntryType, DeviceInfo
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .const import (
    ACTIVE_DAYS_WEEK,
    DOMAIN,
    EXERCISE_WEEK,
    FOCUS_WEEK,
    RESTING_ENERGY,
    STEPS_AVERAGE,
    STEPS_STREAK,
    TODAY_SCORE,
    WEEK_SCORE,
    WORKOUTS_WEEK,
)
from .manager import ActiveRingsConfigEntry, ActiveRingsManager


@dataclass(frozen=True, kw_only=True)
class ActiveRingsSensorDescription(SensorEntityDescription):
    """Describes an ActiveRings sensor: which metric, which field, which extras."""

    metric: str
    field: str = "value"
    attributes: tuple[str, ...] = ()


SENSORS: tuple[ActiveRingsSensorDescription, ...] = (
    ActiveRingsSensorDescription(
        key="today_score",
        translation_key="today_score",
        metric=TODAY_SCORE,
        attributes=("rings",),
    ),
    ActiveRingsSensorDescription(
        key="week_score",
        translation_key="week_score",
        metric=WEEK_SCORE,
        attributes=("rings",),
    ),
    ActiveRingsSensorDescription(
        key="steps_average",
        translation_key="steps_average",
        metric=STEPS_AVERAGE,
        native_unit_of_measurement="steps",
        attributes=("average_30d", "days", "goal"),
    ),
    ActiveRingsSensorDescription(
        key="exercise_week",
        translation_key="exercise_week",
        metric=EXERCISE_WEEK,
        native_unit_of_measurement="min",
        attributes=("goal", "percent"),
    ),
    ActiveRingsSensorDescription(
        key="workouts_week",
        translation_key="workouts_week",
        metric=WORKOUTS_WEEK,
        attributes=("minutes",),
    ),
    ActiveRingsSensorDescription(
        key="active_days_week",
        translation_key="active_days_week",
        metric=ACTIVE_DAYS_WEEK,
        native_unit_of_measurement="d",
        attributes=("goal", "percent", "threshold"),
    ),
    ActiveRingsSensorDescription(
        key="focus_week",
        translation_key="focus_week",
        metric=FOCUS_WEEK,
        native_unit_of_measurement="d",
        attributes=("activity", "goal", "percent"),
    ),
    ActiveRingsSensorDescription(
        key="steps_streak",
        translation_key="steps_streak",
        metric=STEPS_STREAK,
        native_unit_of_measurement="d",
        attributes=("best", "goal"),
    ),
    ActiveRingsSensorDescription(
        key="resting_energy",
        translation_key="resting_energy",
        metric=RESTING_ENERGY,
        native_unit_of_measurement="kcal",
    ),
)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ActiveRingsConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Add the sensors of one config entry."""
    manager = entry.runtime_data
    async_add_entities(ActiveRingsSensor(manager, description) for description in SENSORS)


class ActiveRingsSensor(SensorEntity):
    """One figure, kept current by the manager."""

    entity_description: ActiveRingsSensorDescription
    _attr_has_entity_name = True
    _attr_should_poll = False
    _attr_state_class = SensorStateClass.MEASUREMENT
    _attr_suggested_display_precision = 0

    def __init__(
        self, manager: ActiveRingsManager, description: ActiveRingsSensorDescription
    ) -> None:
        """Initialise the sensor."""
        self.entity_description = description
        self._manager = manager
        entry = manager.entry
        self._attr_unique_id = f"{entry.entry_id}_{description.key}"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, entry.entry_id)},
            name=entry.title,
            manufacturer="ActiveRings",
            model="Steps, exercise and workouts",
            entry_type=DeviceEntryType.SERVICE,
        )

    async def async_added_to_hass(self) -> None:
        """Follow the manager."""
        self.async_on_remove(self._manager.async_add_listener(self._handle_update))

    @callback
    def _handle_update(self) -> None:
        self.async_write_ha_state()

    @property
    def native_value(self) -> Any:
        """Return the figure."""
        description = self.entity_description
        return self._manager.value(description.metric, description.field)

    @property
    def extra_state_attributes(self) -> dict[str, Any] | None:
        """Return the details that belong to the figure."""
        description = self.entity_description
        values = self._manager.metrics.get(description.metric)
        if not values:
            return None
        return {name: values.get(name) for name in description.attributes if name in values}
