"""Tests of the workouts and their log. All numbers are invented."""

from datetime import UTC, date, datetime, timedelta, timezone

from custom_components.active_rings.workouts import (
    WorkoutLog,
    clean_focus,
    matches_focus,
    parse_focus,
    parse_workout,
    parse_workouts,
)

TZ = timezone(timedelta(hours=11))
DAY = date(2030, 3, 10)


def session(
    kind: str = "running", start: str = "2030-03-10T17:05:00+11:00", minutes: int = 42, **more
):
    begin = datetime.fromisoformat(start)
    return {
        "type": kind,
        "start": start,
        "end": (begin + timedelta(minutes=minutes)).isoformat(),
        "minutes": minutes,
        **more,
    }


def test_a_workout_is_read_with_its_details() -> None:
    workout = parse_workout(
        session(active_calories=410, distance_km=7.2, heart_rate_avg=148, heart_rate_max=171),
        TZ,
    )
    assert workout.kind == "running"
    assert workout.minutes == 42
    assert workout.as_dict() == {
        "type": "running",
        "start": "2030-03-10T17:05:00+11:00",
        "end": "2030-03-10T17:47:00+11:00",
        "minutes": 42,
        "active_calories": 410,
        "distance_km": 7.2,
        "heart_rate_avg": 148,
        "heart_rate_max": 171,
    }


def test_what_cannot_be_a_workout_is_refused() -> None:
    assert parse_workout("running", TZ) is None
    assert parse_workout({"type": "running"}, TZ) is None
    assert parse_workout(session(kind=""), TZ) is None
    assert parse_workout({**session(), "start": "not a time"}, TZ) is None
    # Ends before it starts, or lasts longer than a day.
    assert parse_workout({**session(), "end": "2030-03-10T16:00:00+11:00"}, TZ) is None
    assert parse_workout({**session(), "end": "2030-03-12T18:00:00+11:00"}, TZ) is None
    assert parse_workout({**session(), "type": 7}, TZ) is None


def test_a_workout_at_the_edge_of_the_calendar_is_refused() -> None:
    # Without an offset the first moment of the calendar cannot be moved to UTC.
    edge = {"type": "running", "start": "0001-01-01T00:00:00", "end": "0001-01-01T00:30:00"}
    assert parse_workout(edge, TZ) is None
    assert parse_workout(session(start="1999-12-31T10:00:00+11:00"), TZ) is None
    assert parse_workout(session(start="9999-06-01T10:00:00+11:00"), TZ) is None
    assert parse_workout(session(kind="x" * 5000), TZ).kind == "x" * 40


def test_odd_details_are_dropped_and_names_are_cleaned() -> None:
    workout = parse_workout(
        session(kind="  Hiking <b>Trail</b> ", heart_rate_avg=900, steps="many", distance_km=-1),
        TZ,
    )
    assert workout.kind == "hiking_b_trail_b"
    assert workout.details == ()
    # Minutes that do not fit the times give way to the times.
    assert parse_workout({**session(), "minutes": 500}, TZ).minutes == 42


def test_a_workout_across_midnight_is_kept_once_at_its_whole_length() -> None:
    late = session(start="2030-03-09T23:30:00+11:00", minutes=60)
    # The source books half an hour on each day.
    workouts = parse_workouts([{**late, "minutes": 30}], TZ, 40)
    assert len(workouts) == 1
    assert workouts[0].minutes == 60


def test_a_focus_activity_stands_for_its_kinds_of_workout() -> None:
    assert matches_focus("strength_training", "strength")
    assert matches_focus("functional_strength_training", "strength")
    assert matches_focus("calisthenics", "strength")
    assert not matches_focus("running", "strength")
    assert matches_focus("biking_stationary", "cycling")
    assert matches_focus("swimming_open_water", "swimming")
    assert matches_focus("running_treadmill", "running")
    assert not matches_focus("walking", "running")
    # A kind that is not in the list is matched by its own name.
    assert matches_focus("tennis", "tennis")
    assert not matches_focus("table_tennis", "squash")


def test_a_focus_activity_is_cleaned_like_a_kind_of_workout() -> None:
    assert parse_focus(" Rock Climbing ") == "rock_climbing"
    assert parse_focus("") is None
    assert parse_focus("!!!") is None
    assert parse_focus(7) is None
    assert clean_focus(None) == "strength"
    assert clean_focus("Swimming") == "swimming"


def test_a_days_list_replaces_what_the_log_held_for_that_day() -> None:
    log = WorkoutLog()
    walk = session("walking", "2030-03-10T08:00:00+11:00", 20)
    run = session()
    assert log.merge(DAY, parse_workouts([walk, run], TZ, 40), TZ)
    assert len(log) == 2
    assert log.since == DAY
    # The same list again changes nothing.
    assert not log.merge(DAY, parse_workouts([walk, run], TZ, 40), TZ)
    # The walk was deleted on the phone and the run corrected.
    longer = {**run, "heart_rate_avg": 150}
    assert log.merge(DAY, parse_workouts([longer], TZ, 40), TZ)
    assert [workout.as_dict().get("heart_rate_avg") for workout in log.recent(5)] == [150]


def test_another_days_workouts_stay() -> None:
    log = WorkoutLog()
    yesterday = session("yoga", "2030-03-09T07:00:00+11:00", 30)
    log.merge(DAY - timedelta(days=1), parse_workouts([yesterday], TZ, 40), TZ)
    log.merge(DAY, parse_workouts([session()], TZ, 40), TZ)
    assert [workout.kind for workout in log.recent(5)] == ["running", "yoga"]
    assert log.since == DAY - timedelta(days=1)
    # An empty list for today removes today's only.
    log.merge(DAY, [], TZ)
    assert [workout.kind for workout in log.recent(5)] == ["yoga"]
    window = log.between(
        datetime(2030, 3, 8, 13, 0, tzinfo=UTC), datetime(2030, 3, 9, 13, 0, tzinfo=UTC)
    )
    assert [workout.kind for workout in window] == ["yoga"]


def test_the_log_survives_being_stored_and_drops_what_is_broken() -> None:
    log = WorkoutLog()
    log.merge(DAY, parse_workouts([session(distance_km=5)], TZ, 40), TZ)
    stored = log.as_dict()
    stored["workouts"].append({"type": "running", "start": "garbage", "end": "garbage"})
    again = WorkoutLog.from_dict(stored, TZ, 100)
    assert len(again) == 1
    assert again.since == DAY
    assert again.as_dict() == log.as_dict()
    assert len(WorkoutLog.from_dict(None, TZ, 100)) == 0
    assert len(WorkoutLog.from_dict({"since": "soon", "workouts": "none"}, TZ, 100)) == 0


def test_a_days_list_takes_only_workouts_of_that_day_or_the_evening_before() -> None:
    log = WorkoutLog()
    listed = parse_workouts(
        [
            session(),
            session("yoga", "2030-03-09T23:40:00+11:00", 45),
            session("hiking", "2030-03-07T09:00:00+11:00", 90),
            session("cycling", "2099-01-01T09:00:00+11:00", 60),
        ],
        TZ,
        40,
    )
    log.merge(DAY, listed, TZ)
    assert [workout.kind for workout in log.recent(5)] == ["running", "yoga"]


def test_a_workout_in_the_future_does_not_stay() -> None:
    log = WorkoutLog()
    ahead = DAY + timedelta(days=30)
    start = f"{ahead.isoformat()}T10:00:00+11:00"
    # The clock was wrong when it was taken in.
    log.merge(ahead, parse_workouts([session(start=start)], TZ, 40), TZ)
    log.merge(DAY, parse_workouts([session()], TZ, 40), TZ)
    assert len(log) == 2
    assert log.prune(DAY, max_age_days=400, max_count=100)
    assert [workout.start.date() for workout in log.recent(5)] == [DAY]


def test_a_log_that_says_it_began_in_the_future_begins_today() -> None:
    log = WorkoutLog.from_dict({"since": "2099-01-01", "workouts": []}, TZ, 100)
    assert log.prune(DAY, max_age_days=400, max_count=100)
    assert log.since == DAY


EARLIEST = DAY - timedelta(days=400)
THROUGH = DAY + timedelta(days=1)


def test_the_log_follows_a_source_that_keeps_its_past_workouts() -> None:
    log = WorkoutLog()
    # Taken from the days' lists, before the source kept its past workouts.
    early = session("hiking", "2030-01-05T09:00:00+11:00", 90)
    yoga = session("yoga", "2030-03-07T07:00:00+11:00", 30)
    run = session()
    for item in (early, yoga, run):
        when = date.fromisoformat(item["start"][:10])
        log.merge(when, parse_workouts([item], TZ, 40), TZ)
    assert log.since == date(2030, 1, 5)

    # The source now lists its own: a swim the log never saw, the yoga and the run.
    swim = session("swimming_pool", "2030-02-20T06:30:00+11:00", 40)
    assert log.sync(parse_workouts([swim, yoga, run], TZ, 100), EARLIEST, THROUGH, TZ)
    assert [workout.kind for workout in log.recent(5)] == [
        "running",
        "yoga",
        "swimming_pool",
        "hiking",
    ]
    # Then the yoga is deleted on the phone and the run corrected.
    corrected = {**run, "heart_rate_avg": 151}
    assert log.sync(parse_workouts([swim, corrected], TZ, 100), EARLIEST, THROUGH, TZ)
    assert [workout.kind for workout in log.recent(5)] == ["running", "swimming_pool", "hiking"]
    assert log.recent(1)[0].as_dict()["heart_rate_avg"] == 151
    # The hike stays: the source never listed it, so its absence says nothing.
    assert log.since == date(2030, 1, 5)
    # The same list again changes nothing, and an empty list says nothing.
    assert not log.sync(parse_workouts([swim, corrected], TZ, 100), EARLIEST, THROUGH, TZ)
    assert not log.sync([], EARLIEST, THROUGH, TZ)
    assert len(log) == 3


def test_a_workout_the_source_never_listed_is_not_dropped() -> None:
    # The source is still being sent its history and lists only old workouts so far.
    log = WorkoutLog()
    log.merge(DAY, parse_workouts([session()], TZ, 40), TZ)
    old = session("cycling", "2029-11-02T08:00:00+11:00", 60)
    assert log.sync(parse_workouts([old], TZ, 100), EARLIEST, THROUGH, TZ)
    assert [workout.kind for workout in log.recent(5)] == ["running", "cycling"]


def test_what_the_list_has_held_is_remembered_in_the_stored_log() -> None:
    log = WorkoutLog()
    log.merge(DAY, parse_workouts([session("yoga", "2030-03-10T07:00:00+11:00", 30)], TZ, 40), TZ)
    log.sync(parse_workouts([session()], TZ, 100), EARLIEST, THROUGH, TZ)
    stored = log.as_dict()
    assert [item.get("listed", False) for item in stored["workouts"]] == [False, True]
    again = WorkoutLog.from_dict(stored, TZ, 100)
    # After a restart the run is still known to have been listed, so it goes when it is deleted.
    swim = session("swimming_pool", "2030-03-09T06:30:00+11:00", 40)
    again.sync(parse_workouts([swim], TZ, 100), EARLIEST, THROUGH, TZ)
    assert sorted(workout.kind for workout in again.recent(5)) == ["swimming_pool", "yoga"]
    # The card is not told which workouts were listed.
    assert all("listed" not in workout.as_dict() for workout in again.recent(5))


def test_a_source_that_reaches_further_back_moves_the_start_of_the_log() -> None:
    log = WorkoutLog()
    log.merge(DAY, parse_workouts([session()], TZ, 40), TZ)
    old = session("cycling", "2029-11-02T08:00:00+11:00", 60)
    ahead = session("running", "2030-06-01T08:00:00+11:00", 30)
    # A workout dated after tomorrow is a broken clock and is not taken.
    assert log.sync(parse_workouts([old, session(), ahead], TZ, 100), EARLIEST, THROUGH, TZ)
    assert log.since == date(2029, 11, 2)
    assert [workout.kind for workout in log.recent(5)] == ["running", "cycling"]


def test_old_workouts_are_pruned() -> None:
    log = WorkoutLog()
    for back in (500, 30, 2, 1):
        when = DAY - timedelta(days=back)
        start = f"{when.isoformat()}T10:00:00+11:00"
        log.merge(when, parse_workouts([session(start=start)], TZ, 40), TZ)
    assert log.prune(DAY, max_age_days=400, max_count=100)
    assert len(log) == 3
    assert log.prune(DAY, max_age_days=400, max_count=2)
    assert [workout.start.date() for workout in log.recent(5)] == [
        DAY - timedelta(days=1),
        DAY - timedelta(days=2),
    ]
    assert not log.prune(DAY, max_age_days=400, max_count=2)
