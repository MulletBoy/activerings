import { LitElement, html, nothing, type TemplateResult } from "lit";

import { DEFAULT_PRESET, presetTiles } from "./presets";
import { COLOR_KEYS, type ActiveRingsCardConfig, type HomeAssistant } from "./types";

const EDITOR_TAG = "active-rings-card-editor";

const LABELS: Record<string, string> = {
  entity: "ActiveRings entity",
  name: "Title",
  preset: "Colour preset",
  show_rows: "A row for each ring",
  show_today: "Today's distance and energy",
  show_steps: "Steps chart, average, streak and best day",
  show_exercise: "Exercise chart",
  show_workouts: "Recent workouts",
  tiles: "Tinted boxes",
  theme_background: "Use the theme's card background",
  workouts_shown: "Workouts in the list",
  steps_range: "Steps chart opens on",
  exercise_range: "Exercise chart opens on",
  distance_unit: "Distance unit",
  energy_unit: "Energy unit",
  colors: "Colours",
  steps: "Ring and chart: Steps",
  steps_end: "Ring and chart: Steps (gradient end)",
  exercise: "Ring and chart: Exercise",
  exercise_end: "Ring and chart: Exercise (gradient end)",
  energy: "Ring: Energy",
  energy_end: "Ring: Energy (gradient end)",
  minutes: "Ring: Active minutes",
  minutes_end: "Ring: Active minutes (gradient end)",
  days: "Ring: Active days",
  days_end: "Ring: Active days (gradient end)",
  focus: "Ring: Focus activity, and its workouts in the list",
  focus_end: "Ring: Focus activity (gradient end)",
  distance: "Distance",
  resting: "Resting energy",
  total: "Total burn",
  streak: "Goal streak",
  cardio: "Workout list: everything but the focus activity",
  goal: "Goal line on the charts",
  fresh: "Good: synced recently, set complete",
  recent: "Fair: synced hours ago, set nearly complete",
  stale: "Poor: synced long ago",
};

const HELPERS: Record<string, string> = {
  entity: "Any entity of the ActiveRings device. The card reads all its figures from the integration.",
  colors: "Any CSS colour, for example #ff2fd6. Leave a field empty to use the preset.",
  theme_background: "Off: the Synthwave preset paints its own dark card.",
  distance_unit: "Empty: follows Home Assistant's unit system.",
  workouts_shown: "1 to 12.",
};

const toggle = (name: string) => ({ name, selector: { boolean: {} } });
const dropdown = (name: string, options: { value: string; label: string }[]) => ({
  name,
  selector: { select: { mode: "dropdown", options } },
});

const SCHEMA = [
  {
    name: "entity",
    required: true,
    selector: { entity: { filter: { integration: "active_rings", domain: "sensor" } } },
  },
  { name: "name", selector: { text: {} } },
  dropdown("preset", [
    { value: "synthwave", label: "Synthwave" },
    { value: "theme", label: "Follow the theme (light or dark)" },
    { value: "vivid", label: "Vivid" },
  ]),
  {
    type: "grid",
    name: "",
    schema: [
      toggle("show_rows"),
      toggle("show_today"),
      toggle("show_steps"),
      toggle("show_exercise"),
      toggle("show_workouts"),
      toggle("tiles"),
      toggle("theme_background"),
    ],
  },
  {
    type: "grid",
    name: "",
    schema: [
      dropdown("steps_range", [
        { value: "30d", label: "30 days" },
        { value: "6m", label: "6 months" },
        { value: "1y", label: "1 year" },
        { value: "all", label: "Everything" },
      ]),
      dropdown("exercise_range", [
        { value: "3m", label: "3 months" },
        { value: "6m", label: "6 months" },
        { value: "1y", label: "1 year" },
      ]),
      dropdown("distance_unit", [
        { value: "km", label: "Kilometres" },
        { value: "mi", label: "Miles" },
      ]),
      dropdown("energy_unit", [
        { value: "kcal", label: "Kilocalories" },
        { value: "kJ", label: "Kilojoules" },
      ]),
    ],
  },
  { name: "workouts_shown", selector: { number: { min: 1, max: 12, step: 1, mode: "box" } } },
  {
    type: "expandable",
    name: "colors",
    title: LABELS.colors,
    schema: COLOR_KEYS.map((key) => ({ name: key, selector: { text: {} } })),
  },
];

export class ActiveRingsCardEditor extends LitElement {
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
  };

  declare hass?: HomeAssistant;
  declare _config?: ActiveRingsCardConfig;

  setConfig(config: ActiveRingsCardConfig): void {
    this._config = config;
  }

  protected render(): TemplateResult | typeof nothing {
    if (!this._config) return nothing;
    // Show what the card does when an option is left out.
    const data = {
      preset: DEFAULT_PRESET,
      show_rows: true,
      show_today: true,
      show_steps: true,
      show_exercise: true,
      show_workouts: true,
      steps_range: "30d",
      exercise_range: "6m",
      energy_unit: "kcal",
      workouts_shown: 5,
      theme_background: false,
      tiles: presetTiles(this._config.preset),
      ...this._config,
    };
    return html`
      <ha-form
        .hass=${this.hass}
        .data=${data}
        .schema=${SCHEMA}
        .computeLabel=${(field: { name: string }) => LABELS[field.name] ?? field.name}
        .computeHelper=${(field: { name: string }) => HELPERS[field.name]}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
  }

  private _valueChanged(event: CustomEvent<{ value: Record<string, unknown> }>): void {
    event.stopPropagation();
    const config = { ...event.detail.value } as unknown as ActiveRingsCardConfig;
    if (!config.distance_unit) delete config.distance_unit;
    const shown = Number(config.workouts_shown);
    if (Number.isFinite(shown) && shown >= 1) config.workouts_shown = Math.min(12, Math.round(shown));
    else delete config.workouts_shown;
    // Drop empty colour fields so the preset's colour applies again.
    if (config.colors) {
      const colors = Object.fromEntries(
        Object.entries(config.colors).filter(
          ([, value]) => typeof value === "string" && value.trim(),
        ),
      );
      if (Object.keys(colors).length) config.colors = colors;
      else delete config.colors;
    }
    this.dispatchEvent(
      new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }),
    );
  }
}

if (!customElements.get(EDITOR_TAG)) {
  customElements.define(EDITOR_TAG, ActiveRingsCardEditor);
}
