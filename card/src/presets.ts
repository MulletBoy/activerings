import { COLOR_KEYS, type ColorKey, type Colors } from "./types";

interface Preset {
  colors: Colors;
  /** Extra CSS custom properties (text colour, glow...). */
  vars?: Record<string, string>;
  /** Card background, skipped when the card is told to keep the theme's. */
  background?: Record<string, string>;
  /** Draw each row and section as a tinted, glowing box. */
  tiles?: boolean;
}

export const DEFAULT_PRESET = "synthwave";

/**
 * "theme" sets almost nothing: the stylesheet's fallbacks apply, so the card
 * follows the Home Assistant theme (light or dark), and a theme can override
 * colours with --active-rings-<name>-color.
 */
export const PRESETS: Record<string, Preset> = {
  theme: {
    // Base colours come from the stylesheet (and the HA theme); only the
    // second colour of each ring's gradient is set here.
    colors: {
      steps_end: "#a78bfa",
      exercise_end: "#38bdf8",
      energy_end: "#f97316",
      minutes_end: "#8b5cf6",
      days_end: "#f43f5e",
      focus_end: "#14b8a6",
    },
    tiles: true,
  },
  synthwave: {
    colors: {
      steps: "#ff2fd6",
      exercise: "#5df0a8",
      energy: "#ffb224",
      minutes: "#4df3ff",
      days: "#ff5c8a",
      focus: "#c8f55a",
      steps_end: "#a46bff",
      exercise_end: "#4df3ff",
      energy_end: "#ff7a3d",
      minutes_end: "#3d7bff",
      days_end: "#ff2fd6",
      focus_end: "#5df0a8",
      distance: "#4df3ff",
      resting: "#a46bff",
      total: "#ff5c8a",
      streak: "#ffb224",
      cardio: "#4df3ff",
      goal: "#f1e8ff",
      fresh: "#5df0a8",
      recent: "#ffb224",
      stale: "#ff2fd6",
    },
    vars: {
      "--ar-text": "#f1e8ff",
      "--ar-secondary-text": "#b9a6d6",
      "--ar-divider": "#3b1c66",
      "--ar-track": "rgba(185,166,214,0.10)",
      "--ar-track-opacity": "1",
      "--ar-accent-text": "currentColor",
      "--ar-glow": "6px",
      "--ar-tile-fill": "12%",
      "--ar-tile-border": "45%",
      "--ar-tile-glow": "18%",
      "--ar-tile-inset": "7%",
      "--ar-title-tint": "100%",
      "--ar-halo": "13%",
      "--ar-score-glow": "45%",
      "--ar-today-tint": "#ffb224",
      "--ar-steps-tint": "#ff2fd6",
      "--ar-exercise-tint": "#5df0a8",
      "--ar-workouts-tint": "#4df3ff",
    },
    tiles: true,
    // A neon palette needs a dark card, whatever the dashboard theme is.
    background: { "--ha-card-background": "#16082b", "--ha-card-border-color": "#3b1c66" },
  },
  vivid: {
    colors: {
      steps: "#bf5af2",
      exercise: "#32ade6",
      energy: "#ff9f0a",
      minutes: "#30d158",
      days: "#ff6482",
      focus: "#ffd60a",
      steps_end: "#5e5ce6",
      exercise_end: "#64d2ff",
      energy_end: "#ff6b5e",
      minutes_end: "#a4e03a",
      days_end: "#bf5af2",
      focus_end: "#ff9f0a",
      distance: "#32ade6",
      resting: "#5e5ce6",
      total: "#ff6482",
      streak: "#ff9f0a",
      cardio: "#32ade6",
      fresh: "#30d158",
      recent: "#ff9f0a",
      stale: "#ff453a",
    },
    tiles: true,
  },
};

const SAFE_COLOR =
  /^(#[0-9a-f]{3,8}|[a-z]+|(rgb|rgba|hsl|hsla)\([0-9.,%\s/deg-]+\)|var\(--[a-z0-9-]+\))$/i;

/** Only let plain colour values into the style attribute. */
export function safeColor(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return SAFE_COLOR.test(trimmed) ? trimmed : undefined;
}

/** Look a preset up by name; anything unknown (including "constructor") gets the default. */
function getPreset(name: string | undefined): Preset {
  const key = typeof name === "string" ? name : DEFAULT_PRESET;
  return Object.prototype.hasOwnProperty.call(PRESETS, key) ? PRESETS[key] : PRESETS[DEFAULT_PRESET];
}

/** Whether a preset draws tinted boxes unless the card says otherwise. */
export function presetTiles(preset: string | undefined): boolean {
  return getPreset(preset).tiles ?? false;
}

/** CSS custom properties for a preset plus per-card colour overrides. */
export function styleVars(
  preset: string | undefined,
  colors: Colors | undefined,
  themeBackground = false,
): Record<string, string> {
  const chosen = getPreset(preset);
  const vars: Record<string, string> = {
    ...(chosen.vars ?? {}),
    ...(themeBackground ? {} : (chosen.background ?? {})),
  };
  for (const key of COLOR_KEYS) {
    const value = safeColor(colors?.[key]) ?? chosen.colors[key as ColorKey];
    if (value) vars[`--ar-${key.replace("_", "-")}`] = value;
  }
  return vars;
}
