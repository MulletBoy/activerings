"""Constants for ActiveRings."""

from __future__ import annotations

from datetime import timedelta

DOMAIN = "active_rings"

CONF_SOURCE = "source"
CONF_SOURCE_ENTRY = "source_entry"
# The goals the rings are filled against.
CONF_STEPS_GOAL = "steps_goal"
CONF_EXERCISE_GOAL = "exercise_goal"
CONF_ENERGY_GOAL = "energy_goal"
CONF_WEEKLY_EXERCISE_GOAL = "weekly_exercise_goal"
CONF_ACTIVE_DAYS_GOAL = "active_days_goal"
CONF_FOCUS_GOAL = "focus_goal"
# The kind of workout the third ring of the week follows.
CONF_FOCUS_ACTIVITY = "focus_activity"

SOURCE_LIFE_DASHBOARD = "life_dashboard"

# What a source can provide: today's totals, each with a daily statistic...
STEPS = "steps"
DISTANCE = "distance"
ACTIVE_ENERGY = "active_energy"
TOTAL_ENERGY = "total_energy"
EXERCISE = "exercise"
# ...and the entities that carry workouts and the time of the last sync.
WORKOUTS_TODAY = "workouts_today"
WORKOUTS_YESTERDAY = "workouts_yesterday"
LAST_SYNC = "last_sync"

# Figures ActiveRings works out itself.
RESTING_ENERGY = "resting_energy"
STEPS_AVERAGE = "steps_average"
EXERCISE_WEEK = "exercise_week"
WORKOUTS_WEEK = "workouts_week"
ACTIVE_DAYS_WEEK = "active_days_week"
FOCUS_WEEK = "focus_week"
STEPS_STREAK = "steps_streak"
STEPS_BEST = "steps_best"
# The two sets of rings: the mean score of the three rings in each.
TODAY_SCORE = "today_score"
WEEK_SCORE = "week_score"

# Metrics with a daily total in the statistics, which the card may chart.
SERIES_METRICS = (STEPS, DISTANCE, ACTIVE_ENERGY, TOTAL_ENERGY, EXERCISE)

# Goals: the default, and the smallest and largest value that can be set.
# 150 minutes a week of moderate activity and muscle strengthening on two days
# a week are the World Health Organization's guidelines for adults (2020).
GOALS: dict[str, tuple[float, float, float]] = {
    CONF_STEPS_GOAL: (10000, 1000, 60000),
    CONF_EXERCISE_GOAL: (30, 5, 600),  # minutes a day
    CONF_ENERGY_GOAL: (500, 50, 5000),  # active kilocalories a day
    CONF_WEEKLY_EXERCISE_GOAL: (150, 30, 3000),  # minutes in seven days
    CONF_ACTIVE_DAYS_GOAL: (5, 1, 7),  # days of the seven that reached the daily exercise goal
    CONF_FOCUS_GOAL: (2, 1, 7),  # days of the seven with the focus activity
}

# The rings: each set's metrics and the goal that fills them, outermost ring
# first. Today's rings are totals since midnight; the week's rings look back
# over seven days: how much, on how many days, and how often the activity the
# person wants to keep up.
TODAY_RINGS: dict[str, str] = {
    STEPS: CONF_STEPS_GOAL,
    EXERCISE: CONF_EXERCISE_GOAL,
    ACTIVE_ENERGY: CONF_ENERGY_GOAL,
}
WEEK_RINGS: dict[str, str] = {
    EXERCISE_WEEK: CONF_WEEKLY_EXERCISE_GOAL,
    ACTIVE_DAYS_WEEK: CONF_ACTIVE_DAYS_GOAL,
    FOCUS_WEEK: CONF_FOCUS_GOAL,
}

# Daily totals outside these are a wrong unit or a broken record, and are ignored.
LIMITS: dict[str, tuple[float, float]] = {
    STEPS: (0, 200_000),
    DISTANCE: (0, 500),  # kilometres
    ACTIVE_ENERGY: (0, 20_000),  # kilocalories
    TOTAL_ENERGY: (0, 30_000),
    EXERCISE: (0, 24 * 60),  # minutes
}

# The week is the last seven days, today included.
WEEK_DAYS = 7
# Days of daily totals read at every refresh: enough for the averages, the
# streak and the best day.
HISTORY_DAYS = 366
AVERAGE_LONG_DAYS = 30

# The workout log: how much is kept, and how many the card is sent.
MAX_WORKOUT_AGE_DAYS = 400
MAX_WORKOUTS = 3000
RECENT_WORKOUTS = 12
# A source may list this many workouts for one day; more is a broken record.
MAX_WORKOUTS_PER_DAY = 40
SAVE_DELAY = 30

REFRESH_INTERVAL = timedelta(minutes=15)
# Several source entities change in the same sync: wait for them all.
REFRESH_COOLDOWN = 10

# Limits on what one chart request may ask for.
MAX_SERIES_POINTS = 800
MAX_SERIES_SPAN = {
    "day": timedelta(days=400),
    "week": timedelta(days=366 * 3),
    "month": timedelta(days=366 * 25),
}
