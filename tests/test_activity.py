"""Tests of the arithmetic. All numbers are invented."""

from custom_components.active_rings.activity import (
    DAY_SECONDS,
    Day,
    average_before,
    best_day,
    elapsed_days,
    number,
    progress,
    streak,
    total_since,
    totals,
    week_values,
)

TODAY = 1_900_000_800.0  # the start of "today"; any moment will do


def day(back: int, value: float) -> Day:
    """A complete day, ``back`` days before today."""
    start = TODAY - back * DAY_SECONDS
    return Day(start=start, end=start + DAY_SECONDS, value=value)


def test_number_refuses_what_is_not_a_plain_number() -> None:
    assert number("12.5") == 12.5
    assert number(7, (0, 10)) == 7.0
    assert number(11, (0, 10)) is None
    assert number("nan") is None
    assert number("inf") is None
    assert number(None) is None
    assert number(True) is None
    assert number("steps") is None


def test_totals_read_the_change_of_each_period() -> None:
    rows = [
        {"start": 200.0, "end": 300.0, "change": 5000.0},
        {"start": 100.0, "end": 200.0, "change": 8000.0},
        {"start": 300.0, "end": 400.0, "change": None},
        {"start": 400.0, "end": 500.0, "change": -3.0},
        {"start": 500.0, "end": 500.0, "change": 10.0},
        {"start": 600.0, "end": 700.0, "change": 999_999.0},
    ]
    found = totals(rows, (0, 200_000))
    assert [(item.start, item.value) for item in found] == [(100.0, 8000.0), (200.0, 5000.0)]


def test_a_week_may_hold_seven_days_worth() -> None:
    week = {"start": 0.0, "end": 7 * DAY_SECONDS, "change": 600.0}
    assert totals([week], (0, 100)) == []
    assert totals([week], (0, 100), per_day=False)[0].value == 600.0


def test_average_uses_complete_days_that_have_a_total() -> None:
    # No total three days ago: that day is left out, not read as zero.
    days = [day(8, 1000), day(7, 4000), day(6, 6000), day(4, 8000), day(2, 10000), day(1, 12000)]
    days.append(Day(start=TODAY, end=TODAY + DAY_SECONDS, value=50))  # today, not complete
    average, count = average_before(days, TODAY, 7)
    assert count == 5
    assert average == (4000 + 6000 + 8000 + 10000 + 12000) / 5
    assert average_before([], TODAY, 7) is None
    assert average_before([day(40, 5000)], TODAY, 7) is None


def test_total_since_adds_the_days_of_a_window() -> None:
    days = [day(7, 10), day(6, 20), day(1, 30)]
    assert total_since(days, TODAY - 6 * DAY_SECONDS, TODAY) == 50


def test_streak_counts_days_in_a_row_on_goal() -> None:
    days = [day(6, 12000), day(5, 11000), day(4, 3000), day(3, 10000), day(2, 10500), day(1, 14000)]
    run = streak(days, 10000, TODAY, today=4000)
    assert (run.current, run.best) == (3, 3)
    # Today joins the run once it has reached the goal.
    assert streak(days, 10000, TODAY, today=10000).current == 4


def test_streak_is_broken_by_a_missing_day_and_by_yesterday() -> None:
    gap = [day(4, 12000), day(3, 12000), day(1, 12000)]
    assert streak(gap, 10000, TODAY, today=None).current == 1
    assert streak(gap, 10000, TODAY, today=None).best == 2
    not_yesterday = [day(3, 12000), day(2, 12000)]
    run = streak(not_yesterday, 10000, TODAY, today=None)
    assert (run.current, run.best) == (0, 2)
    assert streak([], 10000, TODAY, today=12000).current == 1
    assert streak(gap, 0, TODAY, today=5).current == 0


def test_streak_survives_a_clock_change() -> None:
    # The day before yesterday was 23 hours long.
    days = [
        Day(start=TODAY - 2 * DAY_SECONDS + 3600, end=TODAY - DAY_SECONDS, value=11000),
        day(1, 11000),
    ]
    assert streak(days, 10000, TODAY, today=None).current == 2


def test_week_values_line_the_days_up() -> None:
    starts = [TODAY - back * DAY_SECONDS for back in (3, 2, 1, 0)]
    # The recorder's day may start an hour off; a day without a total is 0.
    days = [day(3, 20), Day(start=TODAY - DAY_SECONDS + 3600, end=TODAY, value=35), day(9, 99)]
    assert week_values(days, starts) == [20, 0, 35, 0]


def test_best_day() -> None:
    assert best_day([day(3, 9000), day(2, 15000), day(1, 12000)]).value == 15000
    assert best_day([]) is None


def test_progress_passes_the_goal_but_the_score_does_not() -> None:
    reached = progress(12500, 10000)
    assert (reached.percent, reached.score) == (125.0, 100.0)
    assert progress(2500, 10000).score == 25.0
    assert progress(0, 10000).score == 0.0
    assert progress(None, 10000) is None
    assert progress(5, 0) is None
    assert progress(-1, 10) is None


def test_a_running_week_counts_only_the_days_begun() -> None:
    start = 0.0
    end = 7 * DAY_SECONDS
    assert elapsed_days(start, end, now=2.5 * DAY_SECONDS) == 3
    assert elapsed_days(start, end, now=30 * DAY_SECONDS) == 7
    assert elapsed_days(start, end, now=10.0) == 1
