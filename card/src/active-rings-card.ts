import { LitElement, html, nothing, svg, type PropertyValues, type TemplateResult } from "lit";
import { styleMap } from "lit/directives/style-map.js";

import { renderBars, type Bar } from "./bars";
import "./editor";
import {
  KCAL_TO_KJ,
  KM_TO_MI,
  ago,
  count,
  dateIn,
  field,
  formatDate,
  formatDay,
  formatDayTime,
  formatDuration,
  formatPace,
  formatTime,
  minutesSince,
  num,
  show,
  workoutName,
} from "./format";
import { presetTiles, styleVars } from "./presets";
import { styles } from "./styles";
import {
  EXERCISE_RANGES,
  STEPS_RANGES,
  type ActiveRingsCardConfig,
  type ExerciseRange,
  type HassEntity,
  type HomeAssistant,
  type Metric,
  type Series,
  type SeriesPoint,
  type StepsRange,
  type Summary,
  type Workout,
} from "./types";

export const CARD_VERSION = "1.0.0";
const CARD_TAG = "active-rings-card";

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

/** A ring: its colour, the figure it shows and the text that explains it. */
type RingId = "steps" | "exercise" | "energy" | "minutes" | "days" | "focus";
interface Ring {
  id: RingId;
  label: string;
  metric: string;
}
interface RingSet {
  key: "today" | "week";
  /** The word in the middle of the rings. */
  label: string;
  /** The heading above the set, and the small note beside it. */
  heading: string;
  note: string;
  score: string;
  rings: Ring[];
}

/**
 * The two sets; in each, the outermost ring first. Today's rings are totals
 * since midnight. The week's rings look back over the last seven days: how
 * much, on how many days, and how often the focus activity (its ring is added
 * when the card knows which activity that is).
 */
const SETS: RingSet[] = [
  {
    key: "today",
    label: "Today",
    heading: "Today",
    note: "Since midnight",
    score: "today_score",
    rings: [
      { id: "steps", label: "Steps", metric: "steps" },
      { id: "exercise", label: "Exercise", metric: "exercise" },
      { id: "energy", label: "Energy", metric: "active_energy" },
    ],
  },
  {
    key: "week",
    label: "7 days",
    heading: "Last 7 days",
    note: "Rolling week",
    score: "week_score",
    rings: [
      { id: "minutes", label: "Active minutes", metric: "exercise_week" },
      { id: "days", label: "Active days", metric: "active_days_week" },
    ],
  },
];

/** Names of the focus activities the integration offers; any other is named after its kind. */
const FOCUS_LABELS: Record<string, string> = {
  strength: "Strength",
  running: "Running",
  walking: "Walking",
  hiking: "Hiking",
  cycling: "Cycling",
  swimming: "Swimming",
  rowing: "Rowing",
  yoga: "Yoga",
  pilates: "Pilates",
  hiit: "HIIT",
  dancing: "Dancing",
};

/** What each ring counts and what fills it, shown when a row is hovered or tapped. */
const RING_INFO: Record<Exclude<RingId, "days" | "focus">, { title: string; about: string; scoring: string }> = {
  steps: {
    title: "Steps today",
    about: "Every step your phone and watch have counted since midnight.",
    scoring: "Full at your daily steps goal.",
  },
  exercise: {
    title: "Exercise today",
    about:
      "Minutes of brisk movement today: workouts, and any other stretch your watch counts as exercise.",
    scoring: "Full at your daily exercise goal.",
  },
  energy: {
    title: "Active energy today",
    about:
      "The energy you have burned by moving today, on top of what your body uses at rest.",
    scoring: "Full at your daily active energy goal.",
  },
  minutes: {
    title: "Active minutes, last 7 days",
    about: "Your exercise minutes over the last seven days, today included.",
    scoring:
      "Full at your goal for seven days. The World Health Organization advises adults at least 150 minutes of moderate activity a week.",
  },
};

const STEPS_RANGE: Record<StepsRange, { label: string; days: number; period: string }> = {
  "30d": { label: "30D", days: 30, period: "day" },
  "6m": { label: "6M", days: 183, period: "week" },
  "1y": { label: "1Y", days: 366, period: "week" },
  all: { label: "All", days: 365 * 24, period: "month" },
};
const EXERCISE_RANGE: Record<ExerciseRange, { label: string; days: number }> = {
  "3m": { label: "3M", days: 92 },
  "6m": { label: "6M", days: 183 },
  "1y": { label: "1Y", days: 366 },
};

type ChartId = "steps" | "exercise";
const CHARTS: ChartId[] = ["steps", "exercise"];

// How often an open card asks again, in minutes.
const SUMMARY_EVERY = 2;
const SERIES_EVERY = 10;
// Upper bounds on what the card accepts, whatever it is sent.
const MAX_POINTS = 800;
const MAX_WORKOUTS = 12;
const MAX_TICKS = 6;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export class ActiveRingsCard extends LitElement {
  static styles = styles;

  static properties = {
    hass: { attribute: false },
    _config: { state: true },
    _summary: { state: true },
    _series: { state: true },
    _stepsRange: { state: true },
    _exerciseRange: { state: true },
    _hover: { state: true },
    _tip: { state: true },
    _tipAbove: { state: true },
    _error: { state: true },
    _now: { state: true },
    _ready: { state: true },
  };

  declare hass?: HomeAssistant;
  declare _config?: ActiveRingsCardConfig;
  declare _summary: Summary | null;
  declare _series: Partial<Record<ChartId, SeriesPoint[]>>;
  declare _stepsRange: StepsRange;
  declare _exerciseRange: ExerciseRange;
  declare _hover: { chart: ChartId; index: number } | null;
  /** The ring whose information box is open. */
  declare _tip: RingId | null;
  declare _tipAbove: boolean;
  declare _error: string | null;
  declare _now: number;
  declare _ready: boolean;

  private _timer?: number;
  private _ticks = 0;
  private _token = 0;
  private _seriesTokens: Partial<Record<ChartId, number>> = {};
  private _seen?: HassEntity;
  private _loadedFor?: string;

  constructor() {
    super();
    this._summary = null;
    this._series = {};
    this._stepsRange = "30d";
    this._exerciseRange = "6m";
    this._hover = null;
    this._tip = null;
    this._tipAbove = false;
    this._error = null;
    this._now = Date.now();
    this._ready = false;
  }

  static getConfigElement(): HTMLElement {
    return document.createElement("active-rings-card-editor");
  }

  static getStubConfig(hass?: HomeAssistant): Partial<ActiveRingsCardConfig> {
    const entity = Object.keys(hass?.entities ?? {}).find(
      (id) => id.startsWith("sensor.") && hass?.entities?.[id]?.platform === "active_rings",
    );
    return { entity: entity ?? "" };
  }

  setConfig(config: ActiveRingsCardConfig): void {
    if (!config || typeof config !== "object") {
      throw new Error("Active Rings: the card configuration is missing");
    }
    this._config = {
      show_rows: true,
      show_today: true,
      show_steps: true,
      show_exercise: true,
      show_workouts: true,
      ...config,
    };
    const steps = this._config.steps_range;
    this._stepsRange = steps && (STEPS_RANGES as readonly string[]).includes(steps) ? steps : "30d";
    const exercise = this._config.exercise_range;
    this._exerciseRange =
      exercise && (EXERCISE_RANGES as readonly string[]).includes(exercise) ? exercise : "6m";
    this._loadedFor = undefined;
  }

  getCardSize(): number {
    const config = this._config;
    return (
      4 +
      (config?.show_today ? 2 : 0) +
      (config?.show_steps ? 4 : 0) +
      (config?.show_exercise ? 4 : 0) +
      (config?.show_workouts ? 4 : 0)
    );
  }

  getGridOptions(): Record<string, number | string> {
    return { columns: 12, min_columns: 6, rows: "auto" };
  }

  connectedCallback(): void {
    super.connectedCallback();
    // Once a minute: keep "12m ago" current, and ask for fresh figures now and then.
    this._timer = window.setInterval(() => this._tick(), 60_000);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.clearInterval(this._timer);
    this._timer = undefined;
  }

  private _tick(): void {
    this._now = Date.now();
    this._ticks += 1;
    if (this._ticks % SUMMARY_EVERY === 0) void this._load(this._ticks % SERIES_EVERY === 0);
  }

  protected shouldUpdate(changed: PropertyValues): boolean {
    if (changed.size > 1 || !changed.has("hass")) return true;
    const entity = this._config?.entity;
    if (!entity || !this._summary) return true;
    const previous = changed.get("hass") as HomeAssistant | undefined;
    return previous?.states[entity] !== this.hass?.states[entity];
  }

  protected firstUpdated(): void {
    // Draw empty first, then fill, so the rings and bars animate in.
    requestAnimationFrame(() => (this._ready = true));
  }

  protected updated(): void {
    const entity = this._config?.entity;
    if (!this.hass || !entity) return;
    const state = this.hass.states[entity];
    // The integration's sensors change when new activity data has been worked in.
    if (this._loadedFor !== entity || state !== this._seen) {
      const first = this._loadedFor !== entity;
      this._loadedFor = entity;
      this._seen = state;
      if (first) {
        this._summary = null;
        this._series = {};
      }
      void this._load(true);
    }
  }

  /** Ask the integration for the figures and, if wanted, the charts' bars. */
  private async _load(series: boolean): Promise<void> {
    const entity = this._config?.entity;
    const callWS = this.hass?.callWS;
    if (!entity || !callWS) return;
    const token = ++this._token;
    try {
      const summary = await callWS<Summary>({ type: "active_rings/summary", entity_id: entity });
      if (token !== this._token) return;
      const metrics = summary && typeof summary.metrics === "object" && summary.metrics ? summary.metrics : {};
      this._summary = {
        updated: summary?.updated ?? null,
        synced: summary?.synced ?? null,
        metrics,
        focus: typeof summary?.focus === "string" && summary.focus ? summary.focus.slice(0, 40) : "strength",
        workouts: Array.isArray(summary?.workouts) ? summary.workouts.slice(0, MAX_WORKOUTS) : [],
        workouts_since: typeof summary?.workouts_since === "string" ? summary.workouts_since : null,
      };
      this._error = null;
      this._now = Date.now();
    } catch {
      if (token === this._token) {
        this._error = "ActiveRings did not answer. Check that the integration is set up and loaded.";
      }
      return;
    }
    if (series) for (const chart of CHARTS) void this._loadSeries(chart);
  }

  private _request(chart: ChartId): { metric: string; period: string; start: number } {
    if (chart === "steps") {
      const range = STEPS_RANGE[this._stepsRange];
      return { metric: "steps", period: range.period, start: Date.now() - range.days * DAY };
    }
    return {
      metric: "exercise",
      period: "week",
      start: Date.now() - EXERCISE_RANGE[this._exerciseRange].days * DAY,
    };
  }

  private _wanted(chart: ChartId): boolean {
    const config = this._config;
    return chart === "steps" ? config?.show_steps !== false : config?.show_exercise !== false;
  }

  private async _loadSeries(chart: ChartId): Promise<void> {
    const entity = this._config?.entity;
    const callWS = this.hass?.callWS;
    if (!entity || !callWS || !this._wanted(chart)) return;
    const token = (this._seriesTokens[chart] ?? 0) + 1;
    this._seriesTokens[chart] = token;
    const request = this._request(chart);
    let points: SeriesPoint[] = [];
    try {
      const reply = await callWS<Series>({
        type: "active_rings/series",
        entity_id: entity,
        metric: request.metric,
        period: request.period,
        start: new Date(request.start).toISOString(),
      });
      if (Array.isArray(reply?.points)) {
        points = reply.points
          .filter(
            (p) =>
              Number.isFinite(p?.start) &&
              Number.isFinite(p?.end) &&
              Number.isFinite(p?.value) &&
              p.end > p.start &&
              p.value >= 0 &&
              // A week or month that began before the period asked for is only part of itself.
              p.start >= request.start - 2 * HOUR,
          )
          .map((p) => ({
            start: p.start,
            end: p.end,
            value: p.value,
            days: Number.isFinite(p.days) && p.days >= 1 ? p.days : 1,
          }))
          .slice(-MAX_POINTS);
      }
    } catch {
      // No history for this metric: the chart says so.
    }
    // Ignore the answer if the viewer has switched period meanwhile.
    if (this._seriesTokens[chart] === token) this._series = { ...this._series, [chart]: points };
  }

  private _metric(name: string): Metric | undefined {
    return this._summary?.metrics[name];
  }

  private get _language(): string | undefined {
    return this.hass?.locale?.language;
  }

  private get _timeZone(): string | undefined {
    return this.hass?.config?.time_zone;
  }

  private get _miles(): boolean {
    const unit = this._config?.distance_unit;
    if (unit === "km" || unit === "mi") return unit === "mi";
    return this.hass?.config?.unit_system?.length === "mi";
  }

  private get _energyUnit(): "kcal" | "kJ" {
    return this._config?.energy_unit === "kJ" ? "kJ" : "kcal";
  }

  private get _energyFactor(): number {
    return this._energyUnit === "kJ" ? KCAL_TO_KJ : 1;
  }

  private _count(value: number | null): string {
    return count(value, this._language);
  }

  protected render(): TemplateResult | typeof nothing {
    const config = this._config;
    if (!config) return nothing;
    const vars = styleVars(config.preset, config.colors, config.theme_background);
    const entity = config.entity ? this.hass?.states[config.entity] : undefined;
    const summary = this._summary;

    let message = "";
    if (!config.entity) message = "Choose an ActiveRings entity in the card settings.";
    else if (this.hass && !entity) message = `Entity not found: ${config.entity}`;
    else if (this._error) message = this._error;
    else if (summary && !Object.keys(summary.metrics).length) {
      message = "No activity data yet. The figures appear after the next sync.";
    }

    const steps = config.show_steps ? this._renderSteps() : nothing;
    const exercise = config.show_exercise ? this._renderExercise() : nothing;
    const workouts = config.show_workouts ? this._renderWorkouts() : nothing;
    const panels = [config.show_today ? this._renderToday() : nothing, steps, exercise, workouts].filter(
      (part) => part !== nothing,
    );
    const charts = (steps !== nothing ? 1 : 0) + (exercise !== nothing ? 1 : 0);
    const layout = [
      `n${panels.length}`,
      charts === 1 ? "one-chart" : "",
      charts === 2 && workouts !== nothing ? "three" : "",
    ].join(" ");

    return html`
      <ha-card class=${(config.tiles ?? presetTiles(config.preset)) ? "tiles" : ""} style=${styleMap(vars)}>
        <div class="header">
          <span class="title">${config.name ?? "Activity"}</span>
          ${this._renderSynced()}
        </div>
        ${message ? html`<div class="message">${message}</div>` : nothing}
        <div class="body">
          <div class="sets">${this._sets.map((set) => this._renderSet(set, config.show_rows !== false))}</div>
          ${panels.length ? html`<div class="panels ${layout}">${panels}</div>` : nothing}
        </div>
      </ha-card>
    `;
  }

  /** "Synced 12m ago": green while fresh, amber and red as the data ages. */
  private _renderSynced(): TemplateResult | typeof nothing {
    const synced = this._summary?.synced;
    const minutes = minutesSince(synced, this._now);
    const text = ago(synced, this._now);
    if (minutes === null || text === null) return nothing;
    const tone = minutes <= 120 ? "fresh" : minutes <= 360 ? "recent" : "stale";
    const title = `Health data last arrived ${formatDayTime(Date.parse(synced as string), this._language, this._timeZone)}`;
    return html`<span class="age ${tone}" title=${title}>${text === "now" ? "Synced just now" : `Synced ${text} ago`}</span>`;
  }

  private _fraction(score: number | null): number {
    if (!this._ready || score === null) return 0;
    return clamp01(score / 100);
  }

  /** A value with its unit as a ring's row writes it: "6,500 steps", "45 min". */
  private _amount(id: RingId, value: number): string {
    if (id === "steps") return `${this._count(value)} steps`;
    if (id === "exercise" || id === "minutes") return `${this._count(value)} min`;
    if (id === "energy") return `${this._count(value * this._energyFactor)} ${this._energyUnit}`;
    const whole = Math.round(value);
    return `${whole} ${whole === 1 ? "day" : "days"}`;
  }

  /** A ring's figure against its goal: "6,500 of 10,000 steps". */
  private _reading(ring: Ring, metric: Metric | undefined): string {
    const value = field(metric);
    const goal = field(metric, "goal");
    if (value === null) return "Nothing counted yet";
    if (goal === null) return this._amount(ring.id, value);
    const whole = this._amount(ring.id, goal);
    const number = ring.id === "energy" ? this._count(value * this._energyFactor) : this._count(value);
    return `${number} of ${whole}`;
  }

  /** What is left to the goal, or that it is reached. */
  private _left(ring: Ring, metric: Metric | undefined): { text: string; reached: boolean } {
    const value = field(metric);
    const goal = field(metric, "goal");
    if (value === null || goal === null) return { text: "", reached: false };
    if (value >= goal) return { text: "Goal reached", reached: true };
    return { text: `${this._amount(ring.id, goal - value)} to go`, reached: false };
  }

  /** Open a ring's information box on the side of its row where the card has more room. */
  private _openTip(id: RingId, event: Event): void {
    const row = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const card = this.getBoundingClientRect();
    this._tipAbove = card.bottom - row.bottom < 200 && row.top - card.top > card.bottom - row.bottom;
    this._tip = id;
  }

  /** The information box of a ring: what it counts, what fills it, and your numbers. */
  /** What a ring counts and what fills it. The week's two day-counting rings depend on the options. */
  private _info(ring: Ring, metric: Metric | undefined): { title: string; about: string; scoring: string } {
    if (ring.id === "days") {
      const threshold = field(metric, "threshold");
      return {
        title: "Active days, last 7 days",
        about: `On how many of the last seven days you reached your daily exercise goal${
          threshold !== null ? ` of ${this._count(threshold)} minutes` : ""
        }. Today counts once it gets there. The seven columns are the seven days, today last.`,
        scoring: "Full at your active days goal.",
      };
    }
    if (ring.id === "focus") {
      const strength = this._summary?.focus === "strength";
      return {
        title: `${ring.label}, last 7 days`,
        about: `On how many of the last seven days you recorded your focus activity, ${ring.label.toLowerCase()}${
          strength ? " (weights, functional strength, core or bodyweight training)" : ""
        }. You choose the focus activity under the integration's Configure.`,
        scoring: `Full at your goal for the focus activity.${
          strength ? " The World Health Organization advises muscle strengthening on 2 or more days a week." : ""
        }`,
      };
    }
    return RING_INFO[ring.id];
  }

  private _renderInfo(ring: Ring, metric: Metric | undefined): TemplateResult {
    const info = this._info(ring, metric);
    const percent = field(metric, "percent");
    const known = field(metric, "days_known");
    const since = this._summary?.workouts_since;
    const young =
      ring.id === "focus" && known !== null && known < 7 && since
        ? ` ActiveRings has kept your workouts since ${formatDay(Date.parse(`${since}T12:00:00`), this._language)}, so this counts ${known} ${known === 1 ? "day" : "days"} so far.`
        : "";
    return html`
      <div class="info ${this._tipAbove ? "above" : ""}" id="ar-tip-${ring.id}" role="tooltip">
        <b>${info.title}</b>
        <p>${info.about}${young}</p>
        <p><i>Full</i>${info.scoring} Goals are set under the integration's Configure.</p>
        <p>
          <i>Yours</i>${this._reading(ring, metric)}${percent !== null ? `, ${Math.round(percent)} % of the goal` : ""}
        </p>
      </div>
    `;
  }

  /** One set: three rings, each filled to its share of the goal, and a row per ring. */
  private _renderSet(set: RingSet, rows: boolean): TemplateResult {
    const total = field(this._metric(set.score));
    const band = total === null ? "" : total >= 100 ? "done" : total >= 60 ? "close" : "";
    const radii = [70, 56, 42];
    const rings = set.rings.map((ring) => {
      const metric = this._metric(ring.metric);
      return { ring, data: metric, score: field(metric, "score"), percent: field(metric, "percent") };
    });
    const label =
      `${set.label}: ${total === null ? "not available" : `${Math.round(total)} of 100`}. ` +
      rings.map((item) => `${item.ring.label} ${show(item.percent)} % of the goal`).join(", ");
    return html`
      <div class="group">
      <div class="set-head"><b>${set.heading}</b><span>${this._span(set.key)}</span><em>${set.note}</em></div>
      <div class="set">
        <div class="rings ${band ? `b-${band}` : ""}" role="img" aria-label=${label}>
          <svg viewBox="0 0 160 160" aria-hidden="true">
            <defs>
              ${rings.map(
                ({ ring }) => svg`
                  <linearGradient id="ar-grad-${ring.id}" class="c-${ring.id}" gradientUnits="userSpaceOnUse"
                    x1="0" y1="0" x2="0" y2="160">
                    <stop offset="0" style="stop-color:currentColor"></stop>
                    <stop offset="1" style="stop-color:var(--end, currentColor)"></stop>
                  </linearGradient>`,
              )}
            </defs>
            ${rings.map(({ ring, score }, index) => {
              const r = radii[index];
              const length = 2 * Math.PI * r;
              const f = this._fraction(score);
              return svg`
                <circle class="track c-${ring.id}" cx="80" cy="80" r=${r} stroke-width="10"></circle>
                <circle style="stroke:url(#ar-grad-${ring.id})" class="fill c-${ring.id} ${f <= 0 ? "empty" : ""}"
                  cx="80" cy="80" r=${r} stroke-width="10"
                  stroke-dasharray=${length} stroke-dashoffset=${length * (1 - f)}></circle>`;
            })}
          </svg>
          <div class="center">
            <span class="score">${total === null ? "--" : Math.round(total)}</span>
            <span class="band"><span class="band-dot"></span><span>${set.label}</span></span>
          </div>
        </div>
        ${rows
          ? html`<div class="rows">
              ${rings.map(({ ring, data, score, percent }) => {
                const left = this._left(ring, data);
                return html`
                  <div
                    class="row c-${ring.id}"
                    tabindex="0"
                    aria-describedby=${this._tip === ring.id ? `ar-tip-${ring.id}` : nothing}
                    @pointerenter=${(event: Event) => this._openTip(ring.id, event)}
                    @pointerleave=${() => (this._tip = null)}
                    @focus=${(event: Event) => this._openTip(ring.id, event)}
                    @blur=${() => (this._tip = null)}
                  >
                    <div class="row-head">
                      <span class="dot"></span>
                      <span class="row-name">${ring.label}</span>
                      <span class="row-value"><b>${show(percent)}</b>%</span>
                    </div>
                    ${set.key === "week"
                      ? this._renderStrip(ring)
                      : html`<div class="bar">
                          <div class="bar-fill" style="width:${this._fraction(score) * 100}%"></div>
                        </div>`}
                    <div class="row-detail">
                      <span>${this._reading(ring, data)}</span
                      ><span class=${left.reached ? "reached" : ""}>${left.text}</span>
                    </div>
                    ${this._tip === ring.id ? this._renderInfo(ring, data) : nothing}
                  </div>
                `;
              })}
            </div>`
          : nothing}
      </div>
      </div>
    `;
  }

  /** The sets, with the focus activity as the week's third ring. */
  private get _sets(): RingSet[] {
    const focus = this._summary?.focus ?? "strength";
    const label = Object.prototype.hasOwnProperty.call(FOCUS_LABELS, focus)
      ? FOCUS_LABELS[focus]
      : workoutName(focus);
    return SETS.map((set) =>
      set.key === "week"
        ? { ...set, rings: [...set.rings, { id: "focus" as const, label, metric: "focus_week" }] }
        : set,
    );
  }

  /** The stretch of time a set covers: "Mon 23 Nov", or "17 Nov – 23 Nov". */
  private _span(key: "today" | "week"): string {
    const language = this._language;
    const timeZone = this._timeZone;
    if (key === "today") return formatDay(this._now, language, timeZone);
    const short = (ms: number) => {
      const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
      try {
        return new Date(ms).toLocaleDateString(language, { ...options, timeZone });
      } catch {
        return new Date(ms).toLocaleDateString(language, options);
      }
    };
    return `${short(this._now - 6 * DAY)} ${"–"} ${short(this._now)}`;
  }

  /**
   * The seven days behind a ring of the week, today last: a column for each,
   * filled by how much of the day's goal was reached, lit when the day counts.
   */
  private _renderStrip(ring: Ring): TemplateResult | typeof nothing {
    const minutes = this._week("exercise_week").map((value) => Number(value) || 0);
    let cells: { fill: number; on: boolean }[];
    if (ring.id === "focus") {
      cells = this._week("focus_week").map((value) => ({ fill: value ? 1 : 0, on: value === true }));
    } else if (!minutes.length) {
      return nothing;
    } else if (ring.id === "days") {
      const threshold = field(this._metric("active_days_week"), "threshold") ?? 30;
      cells = minutes.map((value) => ({
        fill: threshold > 0 ? clamp01(value / threshold) : 0,
        on: threshold > 0 && value >= threshold,
      }));
    } else {
      const most = Math.max(...minutes, 1);
      cells = minutes.map((value) => ({ fill: value / most, on: value > 0 }));
    }
    if (cells.length !== 7) return nothing;
    const language = this._language;
    const timeZone = this._timeZone;
    const letter = (ms: number) => {
      try {
        return new Date(ms).toLocaleDateString(language, { weekday: "narrow", timeZone });
      } catch {
        return new Date(ms).toLocaleDateString(language, { weekday: "narrow" });
      }
    };
    return html`
      <div class="strip" aria-hidden="true">
        ${cells.map((cell, index) => {
          const fill = this._ready ? Math.round(cell.fill * 100) : 0;
          return html`<span class="${cell.on ? "on" : ""} ${index === 6 ? "now" : ""}"
            ><i style="--f:${fill}%"></i><u>${letter(this._now - (6 - index) * DAY)}</u></span
          >`;
        })}
      </div>
    `;
  }

  /** A week ring's seven values, oldest first; empty unless there are exactly seven. */
  private _week(name: string): Array<number | boolean> {
    const days = this._metric(name)?.days;
    return Array.isArray(days) && days.length === 7 ? days : [];
  }

  private _seg<T extends string | number>(
    name: string,
    options: readonly { value: T; label: string }[],
    current: T,
    pick: (value: T) => void,
  ): TemplateResult {
    return html`
      <span class="seg" role="group" aria-label=${name}>
        ${options.map(
          (option) => html`<button
            type="button"
            aria-pressed=${option.value === current ? "true" : "false"}
            @click=${() => pick(option.value)}
          >
            ${option.label}
          </button>`,
        )}
      </span>
    `;
  }

  private _hoverOf(chart: ChartId): number | null {
    return this._hover?.chart === chart ? this._hover.index : null;
  }

  private _setHover(chart: ChartId, index: number | null): void {
    this._hover = index === null ? null : { chart, index };
  }

  private _stat(kind: string, name: string, value: TemplateResult | string, note = ""): TemplateResult {
    return html`
      <div class="stat k-${kind}">
        <div class="stat-head"><span class="dot"></span><span class="stat-name">${name}</span></div>
        <div class="stat-value">${value}</div>
        ${note ? html`<div class="stat-note">${note}</div>` : nothing}
      </div>
    `;
  }

  private _monthShort(ms: number): string {
    try {
      return new Date(ms).toLocaleDateString(this._language, { month: "short", timeZone: this._timeZone });
    } catch {
      return new Date(ms).toLocaleDateString(this._language, { month: "short" });
    }
  }

  private _monthLong(ms: number): string {
    const options: Intl.DateTimeFormatOptions = { month: "long", year: "numeric" };
    try {
      return new Date(ms).toLocaleDateString(this._language, { ...options, timeZone: this._timeZone });
    } catch {
      return new Date(ms).toLocaleDateString(this._language, options);
    }
  }

  /**
   * The bars of a chart from its points. A day's bar is its total; a week's or
   * month's bar is the total (exercise) or the average per day (steps).
   */
  private _bars(chart: ChartId, period: string, perDay: boolean): Bar[] | null {
    const series = this._series[chart];
    if (!series) return null;
    const language = this._language;
    const timeZone = this._timeZone;
    const bars: Bar[] = [];
    const marks: number[] = [];
    let previous = "";
    series.forEach((point, index) => {
      // A moment safely inside the period names it, whatever the clocks did.
      const inside = point.start + Math.min(DAY / 2, (point.end - point.start) / 2);
      const date = dateIn(inside, timeZone);
      let title: string;
      let tick = "";
      if (period === "day") {
        title = formatDay(inside, language, timeZone);
        if ((series.length - 1 - index) % 7 === 0) {
          tick = `${Number(date.slice(8, 10))} ${this._monthShort(inside)}`;
        }
      } else if (period === "week") {
        title = `Week of ${formatDate(inside, language, timeZone)}`;
        // The first week that begins in a month carries the month's name.
        const month = date.slice(0, 7);
        if (previous && month !== previous) tick = this._monthShort(inside);
        previous = month;
      } else {
        const middle = point.start + (point.end - point.start) / 2;
        title = this._monthLong(middle);
        if (dateIn(middle, timeZone).slice(5, 7) === "01") tick = dateIn(middle, timeZone).slice(0, 4);
      }
      if (tick) marks.push(index);
      bars.push({
        value: perDay ? point.value / point.days : point.value,
        title: perDay && period !== "day" ? `${title} · average a day` : title,
        tick,
        running: point.end > this._now,
      });
    });
    // Too many labels: keep every so-many-th, counted from the newest.
    const every = Math.ceil(marks.length / MAX_TICKS);
    if (every > 1) {
      marks.forEach((index, position) => {
        if ((marks.length - 1 - position) % every) bars[index].tick = "";
      });
    }
    return bars;
  }

  private _renderToday(): TemplateResult | typeof nothing {
    if (!this._summary) return nothing;
    const distance = this._metric("distance");
    const active = this._metric("active_energy");
    const resting = this._metric("resting_energy");
    const total = this._metric("total_energy");
    if ([distance, active, resting, total].every((metric) => field(metric) === null)) return nothing;
    const miles = this._miles;
    const length = miles ? KM_TO_MI : 1;
    const lengthUnit = miles ? "mi" : "km";
    const energy = this._energyFactor;
    const unit = this._energyUnit;
    const usual = (metric: Metric | undefined, text: (value: number) => string) => {
      const average = field(metric, "average_7d");
      return average === null ? "" : `7-day average ${text(average)}`;
    };
    return html`
      <div class="section today">
        <div class="section-head"><span>Today</span></div>
        <div class="stats">
          ${field(distance) !== null
            ? this._stat(
                "distance",
                "Distance",
                html`<b>${show((field(distance) as number) * length, 1)}</b> ${lengthUnit}`,
                usual(distance, (value) => `${show(value * length, 1)} ${lengthUnit}`),
              )
            : nothing}
          ${field(active) !== null
            ? this._stat(
                "energy",
                "Active energy",
                html`<b>${this._count((field(active) as number) * energy)}</b> ${unit}`,
                usual(active, (value) => `${this._count(value * energy)}`),
              )
            : nothing}
          ${field(resting) !== null
            ? this._stat(
                "resting",
                "Resting energy",
                html`<b>${this._count((field(resting) as number) * energy)}</b> ${unit}`,
                "What your body uses at rest",
              )
            : nothing}
          ${field(total) !== null
            ? this._stat(
                "total",
                "Total burn",
                html`<b>${this._count((field(total) as number) * energy)}</b> ${unit}`,
                usual(total, (value) => `${this._count(value * energy)}`),
              )
            : nothing}
        </div>
      </div>
    `;
  }

  private _renderSteps(): TemplateResult | typeof nothing {
    if (!this._summary) return nothing;
    const today = this._metric("steps");
    const average = this._metric("steps_average");
    const streak = this._metric("steps_streak");
    const best = this._metric("steps_best");
    const range = STEPS_RANGE[this._stepsRange];
    const bars = this._bars("steps", range.period, true);
    if (field(today) === null && !bars?.length) return nothing;
    const goal = field(today, "goal") ?? field(average, "goal");
    const run = field(streak);
    const longest = field(streak, "best");
    const bestDate = best?.date ? Date.parse(`${String(best.date).slice(0, 10)}T12:00:00`) : NaN;
    const month = field(average, "average_30d");
    return html`
      <div class="section steps">
        <div class="section-head">
          <span>Steps</span>
          ${this._seg(
            "Period of the steps chart",
            STEPS_RANGES.map((value) => ({ value, label: STEPS_RANGE[value].label })),
            this._stepsRange,
            (value) => {
              this._stepsRange = value;
              this._hover = null;
              // Empty the chart first: the old bars belong to another period.
              this._series = { ...this._series, steps: undefined };
              void this._loadSeries("steps");
            },
          )}
        </div>
        ${bars === null
          ? html`<div class="chart-empty">${"Loading…"}</div>`
          : renderBars({
              kind: "k-steps",
              bars,
              goal,
              format: (value) => `${this._count(value)} steps`,
              label: range.period === "day" ? "Steps" : "A day",
              hover: this._hoverOf("steps"),
              onHover: (index) => this._setHover("steps", index),
              description:
                range.period === "day" ? "Steps on each day" : `Average steps a day in each ${range.period}`,
            })}
        ${bars?.length && range.period !== "day"
          ? html`<div class="chart-note">Average steps a day in each ${range.period}</div>`
          : nothing}
        <div class="stats" style="margin-top:12px">
          ${field(average) !== null
            ? this._stat(
                "steps",
                "7-day average",
                html`<b>${this._count(field(average))}</b> a day`,
                month !== null ? `30-day average ${this._count(month)}` : "",
              )
            : nothing}
          ${run !== null
            ? this._stat(
                "streak",
                "Goal streak",
                html`<b>${Math.round(run)}</b> ${Math.round(run) === 1 ? "day" : "days"}`,
                longest !== null && longest > 0 ? `Longest in a year ${Math.round(longest)}` : "",
              )
            : nothing}
          ${field(best) !== null
            ? this._stat(
                "energy",
                "Best day",
                html`<b>${this._count(field(best))}</b>`,
                Number.isFinite(bestDate) ? formatDate(bestDate, this._language) : "",
              )
            : nothing}
        </div>
      </div>
    `;
  }

  private _renderExercise(): TemplateResult | typeof nothing {
    if (!this._summary) return nothing;
    const today = this._metric("exercise");
    const week = this._metric("exercise_week");
    const bars = this._bars("exercise", "week", false);
    if (field(today) === null && !bars?.length) return nothing;
    const goal = field(week, "goal");
    const usual = field(today, "average_7d");
    return html`
      <div class="section exercise">
        <div class="section-head">
          <span>Exercise each week</span>
          ${this._seg(
            "Period of the exercise chart",
            EXERCISE_RANGES.map((value) => ({ value, label: EXERCISE_RANGE[value].label })),
            this._exerciseRange,
            (value) => {
              this._exerciseRange = value;
              this._hover = null;
              this._series = { ...this._series, exercise: undefined };
              void this._loadSeries("exercise");
            },
          )}
        </div>
        ${bars === null
          ? html`<div class="chart-empty">${"Loading…"}</div>`
          : renderBars({
              kind: "k-exercise",
              bars,
              goal,
              format: (value) => `${this._count(value)} min`,
              label: "Exercise",
              hover: this._hoverOf("exercise"),
              onHover: (index) => this._setHover("exercise", index),
              description: "Exercise minutes in each week",
            })}
        <div class="stats" style="margin-top:12px">
          ${field(week) !== null
            ? this._stat(
                "minutes",
                "Last 7 days",
                html`<b>${this._count(field(week))}</b> min`,
                goal !== null ? `Goal ${this._count(goal)} min` : "",
              )
            : nothing}
          ${field(today) !== null
            ? this._stat(
                "exercise",
                "Today",
                html`<b>${this._count(field(today))}</b> min`,
                usual !== null ? `7-day average ${this._count(usual)} min` : "",
              )
            : nothing}
        </div>
      </div>
    `;
  }

  /** "Today 17:05", "Yesterday 08:10" or "Sat 9 Mar, 17:05". */
  private _when(start: number): string {
    const language = this._language;
    const timeZone = this._timeZone;
    const day = dateIn(start, timeZone);
    if (day === dateIn(this._now, timeZone)) return `Today ${formatTime(start, language, timeZone)}`;
    if (day === dateIn(this._now - DAY, timeZone)) return `Yesterday ${formatTime(start, language, timeZone)}`;
    return formatDayTime(start, language, timeZone);
  }

  /** A workout's details in one line: "7.2 km · 5:50 /km · 410 kcal · 148 bpm". */
  private _workoutDetail(workout: Workout): string {
    const parts: string[] = [];
    const miles = this._miles;
    const distance = num(workout.distance_km);
    if (distance !== null && distance >= 0.05) {
      parts.push(`${show(distance * (miles ? KM_TO_MI : 1), 1)} ${miles ? "mi" : "km"}`);
      const pace = num(workout.pace_min_per_km);
      if (pace !== null && pace > 0) {
        parts.push(`${formatPace(miles ? pace / KM_TO_MI : pace)} /${miles ? "mi" : "km"}`);
      }
    }
    const energy = num(workout.active_calories) ?? num(workout.total_calories);
    if (energy !== null && energy > 0) {
      parts.push(`${this._count(energy * this._energyFactor)} ${this._energyUnit}`);
    }
    const heart = num(workout.heart_rate_avg);
    if (heart !== null) {
      const highest = num(workout.heart_rate_max);
      parts.push(`${show(heart)} bpm${highest !== null ? ` (max ${show(highest)})` : ""}`);
    }
    return parts.join(" · ");
  }

  private _renderWorkouts(): TemplateResult | typeof nothing {
    const summary = this._summary;
    if (!summary) return nothing;
    const week = this._metric("workouts_week");
    const shown = Math.min(MAX_WORKOUTS, Math.max(1, Math.round(num(this._config?.workouts_shown) ?? 5)));
    const workouts = summary.workouts
      .filter(
        (workout) =>
          workout &&
          typeof workout === "object" &&
          typeof workout.type === "string" &&
          Number.isFinite(Date.parse(String(workout.start))),
      )
      .slice(0, shown);
    if (!workouts.length && !week && !summary.workouts_since) return nothing;
    const known = field(week, "days_known");
    const since = summary.workouts_since ? Date.parse(`${summary.workouts_since.slice(0, 10)}T12:00:00`) : NaN;
    const total = field(week);
    const minutes = field(week, "minutes");
    const foot =
      total !== null
        ? `Last 7 days: ${Math.round(total)} ${Math.round(total) === 1 ? "workout" : "workouts"}` +
          (minutes !== null && total > 0 ? ` · ${formatDuration(minutes)}` : "") +
          (known !== null && known < 7 && Number.isFinite(since)
            ? ` · counting since ${formatDay(since, this._language)}`
            : "")
        : "";
    return html`
      <div class="section workouts">
        <div class="section-head"><span>Workouts</span></div>
        ${workouts.length
          ? html`<ul class="workouts-list">
              ${workouts.map((workout) => {
                const length = num(workout.minutes);
                const detail = this._workoutDetail(workout);
                return html`<li class="workout k-${workout.focus === true ? "focus" : "cardio"}">
                  <span class="dot"></span>
                  <span class="workout-name"
                    >${workoutName(workout.type)}
                    ${length !== null ? html`<small>${` · ${formatDuration(length)}`}</small>` : nothing}</span
                  >
                  <span class="workout-when">${this._when(Date.parse(workout.start))}</span>
                  ${detail ? html`<span class="workout-detail">${detail}</span>` : nothing}
                </li>`;
              })}
            </ul>`
          : html`<div class="empty-note">No workouts yet. They appear here after the next sync.</div>`}
        ${foot ? html`<div class="workouts-foot">${foot}</div>` : nothing}
      </div>
    `;
  }
}

if (!customElements.get(CARD_TAG)) {
  customElements.define(CARD_TAG, ActiveRingsCard);
}

declare global {
  interface Window {
    customCards?: Array<Record<string, unknown>>;
  }
}

window.customCards = window.customCards ?? [];
if (!window.customCards.some((card) => card.type === CARD_TAG)) {
  window.customCards.push({
    type: CARD_TAG,
    name: "Active Rings",
    description:
      "Two sets of rings filled against your goals (today, and the last 7 days), steps and exercise charts and your recent workouts.",
    preview: true,
  });
}

console.info(`%c ACTIVE-RINGS-CARD %c ${CARD_VERSION} `, "background:#d61fb6;color:#fff", "");
