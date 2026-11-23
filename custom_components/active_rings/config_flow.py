"""Config flow for ActiveRings."""

from __future__ import annotations

from typing import Any

import voluptuous as vol
from homeassistant.config_entries import (
    ConfigEntry,
    ConfigFlow,
    ConfigFlowResult,
    OptionsFlow,
)
from homeassistant.const import CONF_NAME
from homeassistant.core import callback
from homeassistant.helpers import selector

from .activity import number
from .const import (
    CONF_FOCUS_ACTIVITY,
    CONF_FOCUS_GOAL,
    CONF_SOURCE,
    CONF_SOURCE_ENTRY,
    DOMAIN,
    GOALS,
    STEPS,
)
from .sources import SOURCES, source_for_domain
from .workouts import FOCUS_GROUPS, clean_focus, parse_focus

DEFAULT_NAME = "Activity"
MAX_NAME_LENGTH = 60


def _goals_schema(current: dict[str, Any]) -> dict[Any, Any]:
    """The goals and the focus activity, each with its current value."""
    schema: dict[Any, Any] = {}
    for key, (default, low, high) in GOALS.items():
        if key == CONF_FOCUS_GOAL:
            # The activity sits just above its goal. Any name can be typed: a
            # sport that is not in the list is matched by its own name.
            focus = clean_focus(current.get(CONF_FOCUS_ACTIVITY))
            schema[vol.Required(CONF_FOCUS_ACTIVITY, default=focus)] = selector.SelectSelector(
                selector.SelectSelectorConfig(
                    mode=selector.SelectSelectorMode.DROPDOWN,
                    options=list(FOCUS_GROUPS),
                    translation_key="focus_activity",
                    custom_value=True,
                )
            )
        value = number(current.get(key), (low, high))
        schema[vol.Required(key, default=int(default if value is None else value))] = (
            selector.NumberSelector(
                selector.NumberSelectorConfig(
                    mode=selector.NumberSelectorMode.BOX, min=low, max=high, step=1
                )
            )
        )
    return schema


def _goals_options(user_input: dict[str, Any]) -> dict[str, Any] | None:
    """Check the answers on the server; the selector limits are only a UI hint."""
    options: dict[str, Any] = {}
    for key, (_default, low, high) in GOALS.items():
        value = number(user_input.get(key), (low, high))
        if value is None:
            return None
        options[key] = round(value)
    focus = parse_focus(user_input.get(CONF_FOCUS_ACTIVITY))
    if focus is None:
        return None
    options[CONF_FOCUS_ACTIVITY] = focus
    return options


class ActiveRingsConfigFlow(ConfigFlow, domain=DOMAIN):
    """Set up the figures for one person."""

    VERSION = 1

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> ActiveRingsOptionsFlow:
        """Return the options flow."""
        return ActiveRingsOptionsFlow()

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        """Pick whose activity data to use: an entry of a supported integration."""
        candidates = [
            entry
            for source in SOURCES.values()
            for entry in self.hass.config_entries.async_entries(source.domain)
        ]
        if not candidates:
            return self.async_abort(reason="no_source")

        errors: dict[str, str] = {}
        if user_input is not None:
            entry = self.hass.config_entries.async_get_entry(user_input[CONF_SOURCE_ENTRY])
            source = source_for_domain(entry.domain) if entry is not None else None
            name = str(user_input.get(CONF_NAME, "")).strip()
            if not 0 < len(name) <= MAX_NAME_LENGTH:
                errors[CONF_NAME] = "invalid_name"
            elif entry is None or source is None:
                errors[CONF_SOURCE_ENTRY] = "not_a_source"
            elif STEPS not in source.entities(self.hass, entry.entry_id):
                errors[CONF_SOURCE_ENTRY] = "no_steps"
            else:
                await self.async_set_unique_id(entry.entry_id)
                self._abort_if_unique_id_configured()
                return self.async_create_entry(
                    title=name,
                    data={CONF_SOURCE: source.key, CONF_SOURCE_ENTRY: entry.entry_id},
                )

        schema = vol.Schema(
            {
                vol.Required(CONF_NAME, default=DEFAULT_NAME): selector.TextSelector(),
                vol.Required(CONF_SOURCE_ENTRY): selector.SelectSelector(
                    selector.SelectSelectorConfig(
                        mode=selector.SelectSelectorMode.DROPDOWN,
                        options=[
                            selector.SelectOptionDict(value=entry.entry_id, label=entry.title)
                            for entry in candidates
                        ],
                    )
                ),
            }
        )
        return self.async_show_form(
            step_id="user",
            data_schema=self.add_suggested_values_to_schema(schema, user_input),
            errors=errors,
        )


class ActiveRingsOptionsFlow(OptionsFlow):
    """Change the goals the rings are filled against, and the focus activity."""

    async def async_step_init(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        """Show the goals and the focus activity."""
        errors: dict[str, str] = {}
        if user_input is not None:
            options = _goals_options(user_input)
            if options is not None:
                return self.async_create_entry(data=options)
            errors["base"] = "invalid_goal"
        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema(_goals_schema(dict(self.config_entry.options))),
            errors=errors,
        )
