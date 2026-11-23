export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
}

/** The small part of the Home Assistant frontend object this card uses. */
export interface HomeAssistant {
  states: Record<string, HassEntity>;
  entities?: Record<string, { platform?: string }>;
  locale?: { language?: string; time_format?: string };
  config?: { time_zone?: string; unit_system?: { length?: string } };
  callWS?: <T>(message: Record<string, unknown>) => Promise<T>;
}

export const COLOR_KEYS = [
  // The six rings, each with an optional second colour it fades to.
  "steps",
  "exercise",
  "energy",
  "minutes",
  "days",
  "focus",
  "steps_end",
  "exercise_end",
  "energy_end",
  "minutes_end",
  "days_end",
  "focus_end",
  // Tiles
  "distance",
  "resting",
  "total",
  "streak",
  // Workout list: everything that is not the focus activity (that has its ring's colour)
  "cardio",
  // Chart goal line; "Synced ... ago" marker and the dot of a set
  "goal",
  "fresh",
  "recent",
  "stale",
] as const;
export type ColorKey = (typeof COLOR_KEYS)[number];
export type Colors = Partial<Record<ColorKey, string>>;

export const STEPS_RANGES = ["30d", "6m", "1y", "all"] as const;
export type StepsRange = (typeof STEPS_RANGES)[number];
export const EXERCISE_RANGES = ["3m", "6m", "1y"] as const;
export type ExerciseRange = (typeof EXERCISE_RANGES)[number];

export interface ActiveRingsCardConfig {
  type: string;
  /** Any entity of an ActiveRings device. */
  entity?: string;
  name?: string;
  preset?: string;
  /** Keep the dashboard theme's card background even if the preset has its own. */
  theme_background?: boolean;
  /** Tinted, glowing boxes around each part. Defaults to the preset's choice. */
  tiles?: boolean;
  show_rows?: boolean;
  show_today?: boolean;
  show_steps?: boolean;
  show_exercise?: boolean;
  show_workouts?: boolean;
  /** How many workouts the list shows: 1 to 12. */
  workouts_shown?: number;
  /** Period of the steps chart when the card opens. */
  steps_range?: StepsRange;
  /** Period of the exercise chart when the card opens. */
  exercise_range?: ExerciseRange;
  distance_unit?: "km" | "mi";
  energy_unit?: "kcal" | "kJ";
  colors?: Colors;
}

/** One figure as the integration reports it. Which fields exist depends on the metric. */
export interface Metric {
  value?: number | null;
  // Rings: the goal, the share of it reached (may pass 100) and the score (stops at 100)
  goal?: number | null;
  percent?: number | null;
  score?: number | null;
  rings?: number;
  // What is usual
  average_7d?: number | null;
  average_30d?: number | null;
  /** A count of days, or for a ring of the week one value for each of the last seven days. */
  days?: number | Array<number | boolean>;
  // Streak and best day
  best?: number | null;
  date?: string;
  // Workouts of the week
  minutes?: number | null;
  days_known?: number | null;
  // The week's rings: the focus activity, and the daily exercise goal that makes a day active
  activity?: string;
  threshold?: number | null;
}

/** One workout as the integration keeps it. */
export interface Workout {
  type: string;
  start: string;
  end: string;
  minutes: number;
  active_calories?: number;
  total_calories?: number;
  distance_km?: number;
  pace_min_per_km?: number;
  heart_rate_avg?: number;
  heart_rate_min?: number;
  heart_rate_max?: number;
  steps?: number;
  /** Set on a workout of the focus activity. */
  focus?: boolean;
}

export interface Summary {
  updated: string | null;
  synced: string | null;
  metrics: Record<string, Metric>;
  /** The focus activity: a group such as "strength" or "swimming", or a kind of workout. */
  focus: string;
  workouts: Workout[];
  /** The first day the workout log knows about (YYYY-MM-DD). */
  workouts_since: string | null;
}

export interface SeriesPoint {
  start: number;
  end: number;
  value: number;
  /** How many days of the period have begun. */
  days: number;
}

export interface Series {
  metric: string;
  period: string;
  points: SeriesPoint[];
}
