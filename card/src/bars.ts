import { html, nothing, type TemplateResult } from "lit";

import { niceScale, tickLabel } from "./format";

export interface Bar {
  value: number;
  /** First line of the hover box, e.g. "Sat 9 Mar" or "Week of 3 Mar". */
  title: string;
  /** Shown under the bar where there is room, e.g. "Mar". */
  tick?: string;
  /** A period that is still running is drawn lighter. */
  running?: boolean;
}

export interface BarsOptions {
  /** Colour class: k-steps, k-exercise... */
  kind: string;
  bars: Bar[];
  /** A dashed line across the chart; bars that reach it are drawn in full colour. */
  goal?: number | null;
  /** How a value reads in the hover box, e.g. "8,152 steps". */
  format: (value: number) => string;
  /** Name of the value in the hover box. */
  label: string;
  hover: number | null;
  onHover: (index: number | null) => void;
  description: string;
}

// Upper bound on what one chart draws, whatever the integration sends.
export const MAX_BARS = 160;

const clamp = (value: number, low = 0, high = 100) => Math.min(high, Math.max(low, value));

/** 12000 -> "12k" when the axis runs into the thousands; small numbers as they are. */
function axisLabel(value: number, top: number): string {
  if (top >= 10000 && value !== 0) return `${tickLabel(value / 1000)}k`;
  return tickLabel(value);
}

/** A bar chart from zero, with a goal line, hover detail and labels under some bars. */
export function renderBars(o: BarsOptions): TemplateResult {
  const bars = o.bars.filter((bar) => Number.isFinite(bar.value) && bar.value >= 0).slice(-MAX_BARS);
  if (!bars.length) {
    return html`<div class="chart-empty">Nothing recorded in this period yet.</div>`;
  }
  const goal = typeof o.goal === "number" && o.goal > 0 ? o.goal : null;
  const highest = Math.max(...bars.map((bar) => bar.value), goal ?? 0, 1);
  const { top } = niceScale(0, highest, 1);
  const y = (value: number) => clamp((value / top) * 100);
  const width = 100 / bars.length;
  const picked = o.hover !== null ? bars[o.hover] : undefined;
  const pickedX = picked && o.hover !== null ? (o.hover + 0.5) * width : 0;
  const axis = [top, top / 2, 0];

  return html`
    <div class="chart ${o.kind}">
      <div class="yaxis">${axis.map((tick) => html`<span>${axisLabel(tick, top)}</span>`)}</div>
      <div class="plot" role="img" aria-label=${o.description} @pointerleave=${() => o.onHover(null)}>
        ${axis.map((_, i) => html`<div class="grid" style="top:${i * 50}%"></div>`)}
        ${goal !== null
          ? html`<div class="goal" style="bottom:${y(goal)}%"><span>Goal</span></div>`
          : nothing}
        ${bars.map(
          (bar, i) => html`<button
            class="col ${goal !== null && bar.value >= goal ? "met" : ""} ${bar.running ? "running" : ""} ${o.hover === i
              ? "picked"
              : ""}"
            style="left:${i * width}%;width:${width}%"
            aria-label="${bar.title}: ${o.label} ${o.format(bar.value)}"
            @pointerenter=${() => o.onHover(i)}
            @focus=${() => o.onHover(i)}
            @blur=${() => o.onHover(null)}
            @click=${() => o.onHover(i)}
          >
            <i style="height:${y(bar.value)}%"></i>
          </button>`,
        )}
        ${picked
          ? html`<div class="tip ${pickedX > 55 ? "left" : ""}" style="left:${pickedX}%">
              <b>${picked.title}</b>
              <span class="avg"><i></i>${o.label}<u>${o.format(picked.value)}</u></span>
              ${goal !== null
                ? html`<span class="goal-row"><i></i>Goal<u>${o.format(goal)}</u></span>`
                : nothing}
            </div>`
          : nothing}
      </div>
      <div class="xaxis">
        ${bars.map((bar, i) => {
          if (!bar.tick) return nothing;
          const at = (i + 0.5) * width;
          const align = at < 6 ? "" : at > 94 ? "end" : "centered";
          return html`<span class=${align} style="left:${at}%">${bar.tick}</span>`;
        })}
      </div>
    </div>
  `;
}
