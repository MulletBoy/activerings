"""Integration tests with a fake Life Dashboard entry. All activity numbers are invented."""

import json
from datetime import UTC, datetime, timedelta
from pathlib import Path
from unittest.mock import patch

import pytest
from homeassistant.config_entries import SOURCE_USER
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResultType
from homeassistant.helpers import entity_registry as er
from pytest_homeassistant.common import MockConfigEntry, async_fire_time_changed

from custom_components.active_rings.const import (
    CONF_SOURCE,
    CONF_SOURCE_ENTRY,
    DOMAIN,
    SOURCE_LIFE_DASHBOARD,
)
from custom_components.active_rings.diagnostics import async_get_config_entry_diagnostics
from custom_components.active_rings.manager import ActiveRingsManager, storage_key

MANIFEST = Path(__file__).parent.parent / "custom_components/active_rings/manifest.json"
SOURCE_ENTRY_ID = "01TESTSOURCE0000000000000A"
STAT = f"life_dashboard:{SOURCE_ENTRY_ID.lower()}_"

# Sydney is UTC+11 in March. "Now" is 14:30 local on 10 March 2030.
NOW = datetime(2030, 3, 10, 3, 30, tzinfo=UTC)
MIDNIGHT = datetime(2030, 3, 9, 13, 0, tzinfo=UTC)  # 00:00 local on 10 March

WALK = {
    "type": "walking",
    "start": "2030-03-10T08:00:00+11:00",
    "end": "2030-03-10T08:25:00+11:00",
    "minutes": 25,
    "distance_km": 2.1,
    "steps": 2600,
}
WEIGHTS = {
    "type": "strength_training",
    "start": "2030-03-10T12:00:00+11:00",
    "end": "2030-03-10T12:20:00+11:00",
    "minutes": 20,
    "heart_rate_avg": 112,
    "heart_rate_max": 139,
}
RUN = {
    "type": "running",
    "start": "2030-03-09T17:05:00+11:00",
    "end": "2030-03-09T17:47:00+11:00",
    "minutes": 42,
    "active_calories": 410,
    "distance_km": 7.2,
    "heart_rate_avg": 148,
}

SOURCE_SENSORS = {
    "steps_today": ("6500", {"unit_of_measurement": "steps", "date": "2030-03-10"}),
    "distance_today": ("4.8", {"unit_of_measurement": "km", "date": "2030-03-10"}),
    "active_calories_today": ("350", {"unit_of_measurement": "kcal", "date": "2030-03-10"}),
    "total_calories_today": ("1500", {"unit_of_measurement": "kcal", "date": "2030-03-10"}),
    "exercise_today": (
        "45",
        {"unit_of_measurement": "min", "date": "2030-03-10", "sessions": [WALK, WEIGHTS]},
    ),
    "exercise_yesterday": (
        "42",
        {"unit_of_measurement": "min", "date": "2030-03-09", "sessions": [RUN]},
    ),
    "last_health_sync": ("2030-03-10T03:22:00+00:00", {}),
}

# What each complete day totals, by how many days back it is; "*" is every other day.
DAILY = {
    "steps": {1: 12000.0, 2: 11000.0, 3: 10500.0, 4: 4000.0, "*": 8000.0, 0: 6000.0},
    "distance": {"*": 6.0, 0: 4.5},
    "active_calories": {"*": 400.0, 0: 340.0},
    "total_calories": {"*": 2200.0, 0: 1480.0},
    "exercise_minutes": {1: 42.0, 3: 35.0, "*": 20.0, 0: 44.0},
}
# Statistics the fake recorder has no rows for (filled by a test, emptied before each).
NO_STATISTICS: set[str] = set()


def entity_id(key: str) -> str:
    return f"sensor.phone_{key}"


def day_rows(key: str, start: datetime, end: datetime) -> list[dict]:
    """One row per local day from 60 days back until today, inside the window asked for."""
    rows = []
    for back in range(60, -1, -1):
        at = MIDNIGHT - timedelta(days=back)
        if at < start - timedelta(hours=3) or at >= end:
            continue
        values = DAILY[key]
        if back == 0 and 0 not in values:
            # Nothing counted for today yet: a day without an amount has no row.
            continue
        rows.append(
            {
                "start": at.timestamp(),
                "end": (at + timedelta(days=1)).timestamp(),
                "change": values.get(back, values["*"]),
            }
        )
    return rows


async def fake_statistics(self, statistic_ids, start, end, period):
    """Stand-in for the recorder: invented rows for the ids asked for."""
    result = {}
    for statistic_id in statistic_ids:
        key = statistic_id.removeprefix(STAT)
        if key in NO_STATISTICS or key not in DAILY:
            continue
        days = day_rows(key, start, end)
        if period == "day":
            result[statistic_id] = days
        elif days:
            # One bar for the whole stretch is enough to test weeks and months.
            result[statistic_id] = [
                {
                    "start": days[0]["start"],
                    "end": days[-1]["end"],
                    "change": sum(row["change"] for row in days),
                }
            ]
    return result


@pytest.fixture(autouse=True)
async def _setup(hass: HomeAssistant, hass_storage, freezer):
    freezer.move_to(NOW)
    NO_STATISTICS.clear()
    await hass.config.async_set_time_zone("Australia/Sydney")
    with patch.object(ActiveRingsManager, "_async_statistics", fake_statistics):
        yield


def add_source(
    hass: HomeAssistant, *, without: tuple[str, ...] = (), changed: dict | None = None
) -> MockConfigEntry:
    """A Life Dashboard entry with its sensors, as that integration creates them."""
    source = MockConfigEntry(domain="life_dashboard", title="Phone", entry_id=SOURCE_ENTRY_ID)
    source.add_to_hass(hass)
    registry = er.async_get(hass)
    for key, (state, attributes) in {**SOURCE_SENSORS, **(changed or {})}.items():
        if key in without:
            continue
        registry.async_get_or_create(
            "sensor",
            "life_dashboard",
            f"{SOURCE_ENTRY_ID}_{key}",
            config_entry=source,
            suggested_object_id=f"phone_{key}",
        )
        hass.states.async_set(entity_id(key), state, attributes)
    return source


async def setup_entry(
    hass: HomeAssistant, options: dict | None = None, **kwargs
) -> MockConfigEntry:
    add_source(hass, **kwargs)
    entry = MockConfigEntry(
        domain=DOMAIN,
        title="Sample",
        unique_id=SOURCE_ENTRY_ID,
        data={CONF_SOURCE: SOURCE_LIFE_DASHBOARD, CONF_SOURCE_ENTRY: SOURCE_ENTRY_ID},
        options=options or {},
    )
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


def test_manifest_is_complete() -> None:
    manifest = json.loads(MANIFEST.read_text())
    assert manifest["domain"] == DOMAIN
    assert manifest["config_flow"] is True
    assert manifest["version"]


async def test_config_flow(hass: HomeAssistant) -> None:
    add_source(hass)
    result = await hass.config_entries.flow.async_init(DOMAIN, context={"source": SOURCE_USER})
    assert result["type"] is FlowResultType.FORM
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {"name": "Sample", "source_entry": SOURCE_ENTRY_ID}
    )
    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert result["title"] == "Sample"
    assert result["data"] == {
        CONF_SOURCE: SOURCE_LIFE_DASHBOARD,
        CONF_SOURCE_ENTRY: SOURCE_ENTRY_ID,
    }
    await hass.async_block_till_done()

    # The same health data cannot be set up twice.
    result = await hass.config_entries.flow.async_init(DOMAIN, context={"source": SOURCE_USER})
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {"name": "Again", "source_entry": SOURCE_ENTRY_ID}
    )
    assert result["type"] is FlowResultType.ABORT


async def test_config_flow_without_a_source_or_steps(hass: HomeAssistant) -> None:
    result = await hass.config_entries.flow.async_init(DOMAIN, context={"source": SOURCE_USER})
    assert result["type"] is FlowResultType.ABORT
    assert result["reason"] == "no_source"

    add_source(hass, without=("steps_today",))
    result = await hass.config_entries.flow.async_init(DOMAIN, context={"source": SOURCE_USER})
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {"name": "Sample", "source_entry": SOURCE_ENTRY_ID}
    )
    assert result["errors"] == {"source_entry": "no_steps"}
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {"name": "   ", "source_entry": SOURCE_ENTRY_ID}
    )
    assert result["errors"] == {"name": "invalid_name"}


async def test_todays_rings_fill_against_their_goals(hass: HomeAssistant) -> None:
    entry = await setup_entry(hass)
    metrics = entry.runtime_data.metrics
    assert metrics["steps"]["value"] == 6500
    assert (metrics["steps"]["goal"], metrics["steps"]["percent"], metrics["steps"]["score"]) == (
        10000,
        65,
        65,
    )
    # Past the goal: the share says so, the score stops at 100.
    assert (metrics["exercise"]["percent"], metrics["exercise"]["score"]) == (150, 100)
    assert metrics["active_energy"]["score"] == 70
    assert metrics["today_score"] == {"value": 78, "rings": 3}
    assert metrics["distance"]["value"] == 4.8
    assert metrics["resting_energy"]["value"] == 1150
    assert metrics["steps"]["average_7d"] == 8786
    assert metrics["active_energy"]["average_30d"] == 400
    assert hass.states.get("sensor.sample_today_score").state == "78"
    assert hass.states.get("sensor.sample_resting_energy_today").state == "1150.0"


async def test_the_weeks_rings_streak_and_best_day(hass: HomeAssistant) -> None:
    entry = await setup_entry(hass)
    metrics = entry.runtime_data.metrics
    # The six complete days, oldest first, and today's 45.
    assert metrics["exercise_week"]["days"] == [20, 20, 20, 35, 20, 42, 45]
    assert metrics["exercise_week"]["value"] == 202
    assert (metrics["exercise_week"]["percent"], metrics["exercise_week"]["score"]) == (135, 100)
    # Three of the seven days reached the daily goal of 30 minutes.
    assert metrics["active_days_week"]["days"] == [False, False, False, True, False, True, True]
    assert metrics["active_days_week"]["value"] == 3
    assert (metrics["active_days_week"]["goal"], metrics["active_days_week"]["score"]) == (5, 60)
    assert metrics["steps_average"]["value"] == 8786
    assert metrics["steps_average"]["days"] == 7
    # The average of the days is a figure, not a ring: steps are a ring of today only.
    assert "score" not in metrics["steps_average"]
    assert metrics["workouts_week"]["value"] == 3
    assert metrics["workouts_week"]["minutes"] == 87
    # The workouts of the week are a figure, not a ring.
    assert "score" not in metrics["workouts_week"]
    # The focus activity is strength training unless another is chosen: one day of two.
    assert metrics["focus_week"]["activity"] == "strength"
    assert metrics["focus_week"]["days"] == [False] * 6 + [True]
    assert (metrics["focus_week"]["value"], metrics["focus_week"]["score"]) == (1, 50)
    assert metrics["week_score"] == {"value": 70, "rings": 3}
    assert metrics["steps_streak"] == {"value": 3, "best": 3, "goal": 10000}
    assert metrics["steps_best"] == {"value": 12000, "date": "2030-03-09"}
    state = hass.states.get("sensor.sample_steps_goal_streak")
    assert state.state == "3"
    assert state.attributes["best"] == 3
    assert hass.states.get("sensor.sample_workouts_last_7_days").state == "3"
    assert hass.states.get("sensor.sample_active_days_last_7_days").state == "3"
    focus = hass.states.get("sensor.sample_focus_activity_days_last_7_days")
    assert focus.state == "1"
    assert focus.attributes["activity"] == "strength"


async def test_goals_are_options(hass: HomeAssistant) -> None:
    entry = await setup_entry(hass)
    result = await hass.config_entries.options.async_init(entry.entry_id)
    assert result["type"] is FlowResultType.FORM
    answers = {
        "steps_goal": 6500,
        "exercise_goal": 40,
        "energy_goal": 700,
        "weekly_exercise_goal": 404,
        "active_days_goal": 4,
        "focus_activity": "Running",
        "focus_goal": 2,
    }
    result = await hass.config_entries.options.async_configure(result["flow_id"], answers)
    assert result["type"] is FlowResultType.CREATE_ENTRY
    await hass.async_block_till_done()
    manager = entry.runtime_data
    await manager.async_refresh()
    metrics = manager.metrics
    assert metrics["steps"]["score"] == 100
    assert metrics["exercise"]["score"] == 100
    assert metrics["active_energy"]["score"] == 50
    assert metrics["exercise_week"]["score"] == 50
    # A day now needs 40 minutes to be active: yesterday and today, of a goal of 4.
    assert (metrics["active_days_week"]["value"], metrics["active_days_week"]["score"]) == (2, 50)
    # The focus is running now: yesterday's run, one day of two.
    assert entry.options["focus_activity"] == "running"
    assert metrics["focus_week"]["activity"] == "running"
    assert metrics["focus_week"]["days"] == [False] * 5 + [True, False]
    assert metrics["focus_week"]["score"] == 50
    assert metrics["week_score"]["value"] == 50
    assert [workout.get("focus", False) for workout in manager.workouts] == [False, False, True]
    # On a goal of 6500 every one of the complete days but one was on goal.
    assert metrics["steps_streak"]["value"] == 4


async def test_a_focus_activity_that_is_not_in_the_list(hass: HomeAssistant) -> None:
    entry = await setup_entry(hass, options={"focus_activity": "walking", "focus_goal": 1})
    metrics = entry.runtime_data.metrics
    assert metrics["focus_week"]["activity"] == "walking"
    assert (metrics["focus_week"]["value"], metrics["focus_week"]["score"]) == (1, 100)

    # A sport typed in by name, of which there is no workout.
    hass.config_entries.async_update_entry(entry, options={"focus_activity": "tennis"})
    await hass.async_block_till_done()
    metrics = entry.runtime_data.metrics
    assert metrics["focus_week"]["activity"] == "tennis"
    assert (metrics["focus_week"]["value"], metrics["focus_week"]["score"]) == (0, 0)

    # An option that is not a name falls back to strength training.
    hass.config_entries.async_update_entry(entry, options={"focus_activity": 7})
    await hass.async_block_till_done()
    assert entry.runtime_data.metrics["focus_week"]["activity"] == "strength"


async def test_options_refuse_an_impossible_goal(hass: HomeAssistant) -> None:
    entry = await setup_entry(hass)
    result = await hass.config_entries.options.async_init(entry.entry_id)
    answers = {
        "steps_goal": 5,
        "exercise_goal": 30,
        "energy_goal": 500,
        "weekly_exercise_goal": 150,
        "active_days_goal": 5,
        "focus_activity": "strength",
        "focus_goal": 2,
    }
    with pytest.raises(Exception):  # noqa: B017, PT011 - the selector refuses it first
        await hass.config_entries.options.async_configure(result["flow_id"], answers)


async def test_after_midnight_the_new_day_starts_at_what_the_statistics_say(
    hass: HomeAssistant,
) -> None:
    # The sensors still hold yesterday's totals.
    stale = {
        key: (state, {**attributes, "date": "2030-03-09"})
        for key, (state, attributes) in SOURCE_SENSORS.items()
        if key.endswith("_today")
    }
    entry = await setup_entry(hass, changed=stale)
    metrics = entry.runtime_data.metrics
    assert metrics["steps"]["value"] == 6000
    assert metrics["exercise"]["value"] == 44

    # And with nothing counted for today yet, the day starts at zero.
    for values in DAILY.values():
        values["hidden"] = values.pop(0)
    try:
        await entry.runtime_data.async_refresh()
        assert entry.runtime_data.metrics["steps"]["value"] == 0
        assert entry.runtime_data.metrics["steps"]["score"] == 0
    finally:
        for values in DAILY.values():
            values[0] = values.pop("hidden")


async def test_a_sync_refreshes_after_a_short_wait(hass: HomeAssistant, freezer) -> None:
    entry = await setup_entry(hass)
    state, attributes = SOURCE_SENSORS["steps_today"]
    hass.states.async_set(entity_id("steps_today"), "9000", attributes)
    await hass.async_block_till_done()
    assert entry.runtime_data.metrics["steps"]["value"] == 6500
    freezer.tick(timedelta(seconds=11))
    async_fire_time_changed(hass)
    await hass.async_block_till_done()
    assert entry.runtime_data.metrics["steps"]["value"] == 9000
    assert state == "6500"


async def test_bad_source_data_is_ignored(hass: HomeAssistant) -> None:
    broken = {
        "steps_today": ("lots", {"date": "2030-03-10"}),
        "active_calories_today": ("99999999", {"date": "2030-03-10"}),
        "exercise_today": (
            "45",
            {
                "date": "2030-03-10",
                "sessions": [WALK, "a walk", {"type": "running"}, {**WEIGHTS, "end": "never"}],
            },
        ),
        "exercise_yesterday": ("42", {"date": "sometime", "sessions": [RUN]}),
        "last_health_sync": ("yesterday-ish", {}),
    }
    entry = await setup_entry(hass, changed=broken)
    manager = entry.runtime_data
    # Steps and active energy fall back to the statistics for today.
    assert manager.metrics["steps"]["value"] == 6000
    assert manager.metrics["active_energy"]["value"] == 340
    assert manager.metrics["workouts_week"]["value"] == 1
    assert [workout["type"] for workout in manager.workouts] == ["walking"]
    assert manager.synced is None


async def test_without_statistics_the_totals_still_show(hass: HomeAssistant) -> None:
    NO_STATISTICS.update(DAILY)
    entry = await setup_entry(hass)
    metrics = entry.runtime_data.metrics
    assert metrics["steps"]["value"] == 6500
    assert "average_7d" not in metrics["steps"]
    assert "steps_average" not in metrics
    assert metrics["exercise_week"]["value"] == 45
    assert metrics["steps_streak"]["value"] == 0
    assert metrics["week_score"]["rings"] == 3


async def test_card_reads_the_summary_and_chart_bars(hass: HomeAssistant, hass_ws_client) -> None:
    await setup_entry(hass)
    client = await hass_ws_client(hass)
    await client.send_json_auto_id(
        {"type": "active_rings/summary", "entity_id": "sensor.sample_today_score"}
    )
    reply = await client.receive_json()
    assert reply["success"]
    summary = reply["result"]
    assert summary["metrics"]["steps"]["value"] == 6500
    assert summary["workouts_since"] == "2030-03-09"
    assert summary["focus"] == "strength"
    assert [workout.get("focus", False) for workout in summary["workouts"]] == [True, False, False]
    assert [workout["type"] for workout in summary["workouts"]] == [
        "strength_training",
        "walking",
        "running",
    ]
    assert summary["workouts"][2]["distance_km"] == 7.2
    assert summary["synced"] == "2030-03-10T03:22:00+00:00"

    await client.send_json_auto_id(
        {
            "type": "active_rings/series",
            "entity_id": "sensor.sample_today_score",
            "metric": "steps",
            "period": "day",
            "start": (NOW - timedelta(days=5)).isoformat(),
        }
    )
    reply = await client.receive_json()
    assert reply["success"]
    points = reply["result"]["points"]
    assert [point["value"] for point in points][-3:] == [11000, 12000, 6000]
    assert points[-1]["days"] == 1

    await client.send_json_auto_id(
        {
            "type": "active_rings/series",
            "entity_id": "sensor.sample_today_score",
            "metric": "exercise",
            "period": "week",
            "start": (MIDNIGHT - timedelta(days=13)).isoformat(),
        }
    )
    reply = await client.receive_json()
    assert reply["result"]["points"][0]["value"] == 11 * 20 + 42 + 35 + 44

    await client.send_json_auto_id(
        {"type": "active_rings/summary", "entity_id": entity_id("steps_today")}
    )
    assert not (await client.receive_json())["success"]


async def test_chart_requests_are_bounded(hass: HomeAssistant, hass_ws_client) -> None:
    await setup_entry(hass)
    client = await hass_ws_client(hass)
    for request in (
        {"metric": "steps", "period": "day", "start": (NOW - timedelta(days=900)).isoformat()},
        {"metric": "steps", "period": "day", "start": (NOW + timedelta(days=2)).isoformat()},
        {"metric": "steps", "period": "hour", "start": NOW.isoformat()},
        {"metric": "heart_rate", "period": "day", "start": NOW.isoformat()},
    ):
        await client.send_json_auto_id(
            {"type": "active_rings/series", "entity_id": "sensor.sample_today_score", **request}
        )
        assert not (await client.receive_json())["success"]


async def test_card_is_served_and_loaded(hass: HomeAssistant, hass_client) -> None:
    await setup_entry(hass)
    client = await hass_client()
    response = await client.get("/active_rings/active-rings-card.js")
    assert response.status == 200
    assert "active-rings-card" in await response.text()


async def test_diagnostics_hold_nothing_personal(hass: HomeAssistant) -> None:
    entry = await setup_entry(hass, options={"steps_goal": 12345})
    diagnostics = await async_get_config_entry_diagnostics(hass, entry)
    text = json.dumps(diagnostics)
    assert diagnostics["workouts_kept"] == 3
    assert "steps" in diagnostics["metrics"]
    for private in ("6500", "12345", "sensor.", "2030", "running", "8786"):
        assert private not in text


async def test_the_workout_log_is_kept_and_goes_with_the_entry(
    hass: HomeAssistant, hass_storage
) -> None:
    entry = await setup_entry(hass)
    key = storage_key(entry.entry_id)
    # Unloading writes what was waiting to be written.
    assert await hass.config_entries.async_unload(entry.entry_id)
    await hass.async_block_till_done()
    assert len(hass_storage[key]["data"]["workouts"]) == 3
    assert hass_storage[key]["data"]["since"] == "2030-03-09"

    # The source has moved on a day: yesterday's run is no longer listed anywhere.
    hass.states.async_set(
        entity_id("exercise_yesterday"),
        "45",
        {"date": "2030-03-10", "sessions": [WALK, WEIGHTS]},
    )
    hass.states.async_set(entity_id("exercise_today"), "0", {"date": "2030-03-11", "sessions": []})
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    assert [workout["type"] for workout in entry.runtime_data.workouts] == [
        "strength_training",
        "walking",
        "running",
    ]

    assert await hass.config_entries.async_remove(entry.entry_id)
    await hass.async_block_till_done()
    assert key not in hass_storage


async def test_an_unreadable_workout_log_starts_a_new_one(
    hass: HomeAssistant, hass_storage
) -> None:
    add_source(hass)
    entry = MockConfigEntry(
        domain=DOMAIN,
        title="Sample",
        unique_id=SOURCE_ENTRY_ID,
        data={CONF_SOURCE: SOURCE_LIFE_DASHBOARD, CONF_SOURCE_ENTRY: SOURCE_ENTRY_ID},
    )
    entry.add_to_hass(hass)
    key = storage_key(entry.entry_id)
    # Written by a newer version than this one can read.
    hass_storage[key] = {"version": 99, "minor_version": 1, "key": key, "data": {"workouts": "?"}}
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    assert entry.runtime_data.metrics["workouts_week"]["value"] == 3


async def test_odd_attributes_of_one_entity_do_not_stop_the_rest(hass: HomeAssistant) -> None:
    odd = {
        "distance_today": ("4.8", {"unit_of_measurement": ["km"], "date": "2030-03-10"}),
        "exercise_today": (
            "45",
            {"date": datetime(2030, 3, 10, 9, 0, tzinfo=UTC), "sessions": [WALK, WEIGHTS]},
        ),
    }
    entry = await setup_entry(hass, changed=odd)
    metrics = entry.runtime_data.metrics
    assert metrics["steps"]["value"] == 6500
    assert metrics["distance"]["value"] == 4.8
    assert metrics["exercise"]["value"] == 45
    assert metrics["workouts_week"]["value"] == 3


async def test_nothing_is_written_once_the_entry_is_unloaded(
    hass: HomeAssistant, hass_storage
) -> None:
    entry = await setup_entry(hass)
    manager = entry.runtime_data
    key = storage_key(entry.entry_id)
    assert await hass.config_entries.async_remove(entry.entry_id)
    await hass.async_block_till_done()
    assert key not in hass_storage
    # A refresh that was still under way when the entry went.
    hass.states.async_set(
        entity_id("exercise_today"), "20", {"date": "2030-03-10", "sessions": [WEIGHTS]}
    )
    await manager.async_refresh()
    async_fire_time_changed(hass, NOW + timedelta(minutes=2))
    await hass.async_block_till_done()
    assert key not in hass_storage


async def test_unload_and_reload(hass: HomeAssistant) -> None:
    entry = await setup_entry(hass)
    assert await hass.config_entries.async_reload(entry.entry_id)
    await hass.async_block_till_done()
    assert hass.states.get("sensor.sample_week_score").state == "70"
    assert await hass.config_entries.async_unload(entry.entry_id)
    await hass.async_block_till_done()
    assert hass.states.get("sensor.sample_week_score").state == "unavailable"
