import { css } from "lit";

/**
 * Colour resolution, most specific first:
 *   --ar-*                      set inline from the card's preset / colors
 *   --active-rings-*-color      optional, from a Home Assistant theme
 *   built-in fallback           mid-tones that read on light and dark cards
 */
export const styles = css`
  :host {
    display: block;
    container-type: inline-size;
  }

  /* Colour tokens live on ha-card, where the preset's --ar-* values are set inline. */
  ha-card {
    --_steps: var(--ar-steps, var(--active-rings-steps-color, #d946ef));
    --_exercise: var(--ar-exercise, var(--active-rings-exercise-color, #14b8a6));
    --_energy: var(--ar-energy, var(--active-rings-energy-color, #f59e0b));
    --_minutes: var(--ar-minutes, var(--active-rings-minutes-color, #6366f1));
    --_days: var(--ar-days, var(--active-rings-days-color, #ec4899));
    --_distance: var(--ar-distance, var(--active-rings-distance-color, #0ea5e9));
    --_resting: var(--ar-resting, var(--active-rings-resting-color, #8b5cf6));
    --_total: var(--ar-total, var(--active-rings-total-color, #ec4899));
    --_streak: var(--ar-streak, var(--active-rings-streak-color, #f59e0b));
    --_focus: var(--ar-focus, var(--active-rings-focus-color, #22c55e));
    --_cardio: var(--ar-cardio, var(--active-rings-cardio-color, #0ea5e9));
    --_fresh: var(--ar-fresh, var(--active-rings-fresh-color, #22c55e));
    --_recent: var(--ar-recent, var(--active-rings-recent-color, #f59e0b));
    --_stale: var(--ar-stale, var(--active-rings-stale-color, #ef4444));
    --_text: var(--ar-text, var(--primary-text-color, #1c1c1e));
    --_text2: var(--ar-secondary-text, var(--secondary-text-color, #6b6b70));
    --_goal: var(--ar-goal, var(--active-rings-goal-color, var(--_text)));
    --_divider: var(--ar-divider, var(--divider-color, rgba(127, 127, 127, 0.25)));
    --_accent-text: var(--ar-accent-text, var(--_text));
    --_glow: var(--ar-glow, 0px);
    --_surface: var(--ha-card-background, var(--card-background-color, #fff));
  }

  ha-card {
    display: block;
    padding: 16px;
    color: var(--_text);
    overflow: hidden;
  }

  .header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 12px;
  }
  .title {
    font-size: 16px;
    font-weight: 600;
  }

  /* Marker beside the title: how long ago the health data last arrived */
  .age {
    display: inline-block;
    padding: 1px 8px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 600;
    white-space: nowrap;
    border: 1px solid color-mix(in srgb, currentColor 45%, transparent);
    background: color-mix(in srgb, currentColor 12%, transparent);
  }
  .age.fresh {
    color: var(--_fresh);
  }
  .age.recent {
    color: var(--_recent);
  }
  .age.stale {
    color: var(--_stale);
  }

  /* Two sets of rings, each under a heading that says which stretch of time it
     covers; in each, the rings sit beside a row per ring */
  .group {
    min-width: 0;
  }
  .set-head {
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin-bottom: 10px;
    font-size: 12px;
    color: var(--_text2);
  }
  .set-head b {
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--_text);
  }
  .set-head em {
    margin-left: auto;
    padding: 1px 8px;
    border-radius: 999px;
    font-style: normal;
    font-size: 11px;
    font-weight: 600;
    white-space: nowrap;
    border: 1px solid var(--_divider);
  }
  .sets {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }
  .set {
    display: flex;
    align-items: center;
    gap: 20px;
    min-width: 0;
  }
  .rings {
    position: relative;
    flex: 0 0 164px;
    width: 164px;
    height: 164px;
  }
  .rings svg {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
    overflow: visible;
  }
  .track,
  .fill {
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
  }
  .track {
    stroke: var(--ar-track, currentColor);
    opacity: var(--ar-track-opacity, 0.16);
  }
  .fill {
    transition:
      stroke-dashoffset 0.7s ease,
      stroke-dasharray 0.7s ease;
    filter: drop-shadow(0 0 calc(var(--_glow) * 0.5) color-mix(in srgb, currentColor 55%, transparent));
  }
  .fill.empty {
    opacity: 0;
  }
  .c-steps {
    color: var(--_steps);
    --end: var(--ar-steps-end, var(--_steps));
  }
  .c-exercise {
    color: var(--_exercise);
    --end: var(--ar-exercise-end, var(--_exercise));
  }
  .c-energy {
    color: var(--_energy);
    --end: var(--ar-energy-end, var(--_energy));
  }
  .c-minutes {
    color: var(--_minutes);
    --end: var(--ar-minutes-end, var(--_minutes));
  }
  .c-days {
    color: var(--_days);
    --end: var(--ar-days-end, var(--_days));
  }
  .c-focus {
    color: var(--_focus);
    --end: var(--ar-focus-end, var(--_focus));
  }

  .center {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    pointer-events: none;
    color: var(--_text);
  }
  .score {
    font-size: 30px;
    font-weight: 800;
    line-height: 1;
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.02em;
  }
  .band {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-top: 4px;
    font-size: 10px;
    font-weight: 600;
    white-space: nowrap;
    color: var(--_text2);
  }
  .band-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--band, var(--_text2));
    box-shadow: 0 0 var(--_glow) var(--band, transparent);
  }
  /* How far the set is: the colour of the dot and of the glow. A part-filled
     set is on its way, not poor, so there is no red here. */
  .b-done {
    --band: var(--_fresh);
  }
  .b-close {
    --band: var(--_recent);
  }

  .rows {
    flex: 1 1 0;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .row-head {
    display: flex;
    align-items: baseline;
    gap: 6px;
    font-size: 13px;
  }
  .dot {
    align-self: center;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: currentColor;
    flex: none;
  }
  .row-name {
    flex: 1;
    font-weight: 600;
    color: var(--_accent-text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .row-value {
    color: var(--_text2);
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
  .row-value b {
    color: var(--_text);
    font-size: 15px;
    font-weight: 700;
  }
  .bar {
    height: 5px;
    margin: 5px 0 4px;
    border-radius: 3px;
    background: var(--ar-track, color-mix(in srgb, currentColor 16%, transparent));
    overflow: hidden;
  }
  .bar-fill {
    height: 100%;
    border-radius: 3px;
    background: linear-gradient(90deg, currentColor, var(--end, currentColor));
    box-shadow: 0 0 var(--_glow) color-mix(in srgb, currentColor 60%, transparent);
    transition: width 0.7s ease;
  }
  /* A ring of the week shows its seven days: a small column for each, today last */
  .strip {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 4px;
    margin: 6px 0 5px;
  }
  .strip span {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    min-width: 0;
  }
  .strip i {
    position: relative;
    display: block;
    width: 100%;
    height: 16px;
    border-radius: 4px;
    background: var(--ar-track, color-mix(in srgb, currentColor 16%, transparent));
    overflow: hidden;
  }
  .strip i::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: var(--f, 0%);
    background: linear-gradient(0deg, var(--end, currentColor), currentColor);
    opacity: 0.4;
    transition: height 0.7s ease;
  }
  .strip .on i::after {
    opacity: 1;
    box-shadow: 0 0 var(--_glow) color-mix(in srgb, currentColor 60%, transparent);
  }
  .strip u {
    font-size: 9px;
    line-height: 10px;
    text-decoration: none;
    color: var(--_text2);
  }
  .strip .now u {
    font-weight: 700;
    color: var(--_text);
  }
  .row-detail {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    font-size: 12px;
    color: var(--_text2);
  }
  .row-detail span:first-child {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .row-detail span:last-child {
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
  }
  .row-detail .reached {
    color: var(--_fresh);
    font-weight: 600;
  }

  /* Information box of a ring: floats under its row, or above it near the card's bottom edge */
  .row {
    position: relative;
    cursor: help;
  }
  .row:focus-visible {
    outline: 2px solid var(--_text2);
    outline-offset: 2px;
    border-radius: 14px;
  }
  .info {
    position: absolute;
    z-index: 5;
    top: calc(100% + 6px);
    right: 0;
    width: max(100%, 250px);
    max-width: 340px;
    box-sizing: border-box;
    padding: 9px 11px;
    border-radius: 10px;
    font-size: 12px;
    line-height: 1.4;
    color: #f4f1fa;
    background: #120e1c;
    border: 1px solid color-mix(in srgb, currentColor 55%, rgba(255, 255, 255, 0.14));
    box-shadow: 0 8px 22px rgba(0, 0, 0, 0.45);
    pointer-events: none;
  }
  .info.above {
    top: auto;
    bottom: calc(100% + 6px);
  }
  .info b {
    display: block;
    font-size: 13px;
    font-weight: 600;
  }
  .info p {
    margin: 5px 0 0;
    color: #d9d2ea;
  }
  .info i {
    font-style: normal;
    font-weight: 600;
    color: #f4f1fa;
    margin-right: 6px;
  }

  /* Sections under the rings */
  .section {
    margin-top: 16px;
    padding-top: 12px;
    border-top: 1px solid var(--_divider);
    min-width: 0;
  }
  .section-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    min-height: 24px;
    font-size: 12px;
    color: var(--_text2);
    margin-bottom: 8px;
  }
  .section-head > span:first-child {
    font-weight: 600;
    color: var(--_text);
  }
  .section.today {
    --tint: var(--ar-today-tint, var(--_energy));
  }
  .section.steps {
    --tint: var(--ar-steps-tint, var(--_steps));
  }
  .section.exercise {
    --tint: var(--ar-exercise-tint, var(--_exercise));
  }
  .section.workouts {
    --tint: var(--ar-workouts-tint, var(--_cardio));
  }

  /* Small switch for a chart's period */
  .seg {
    display: inline-flex;
    border: 1px solid var(--_divider);
    border-radius: 8px;
    overflow: hidden;
  }
  .seg button {
    font: inherit;
    font-size: 11px;
    font-weight: 600;
    line-height: 1;
    padding: 5px 8px;
    border: 0;
    background: none;
    color: var(--_text2);
    cursor: pointer;
  }
  .seg button + button {
    border-left: 1px solid var(--_divider);
  }
  .seg button:hover {
    color: var(--_text);
  }
  .seg button[aria-pressed="true"] {
    color: var(--_text);
    background: color-mix(in srgb, var(--tint, var(--_text)) 22%, transparent);
  }
  .seg button:focus-visible {
    outline: 2px solid var(--_text2);
    outline-offset: -2px;
  }

  /* Colour of a tile, a chart or a workout */
  .k-steps {
    --k: var(--_steps);
    --k2: var(--ar-steps-end, var(--_steps));
  }
  .k-exercise {
    --k: var(--_exercise);
    --k2: var(--ar-exercise-end, var(--_exercise));
  }
  .k-energy {
    --k: var(--_energy);
  }
  .k-distance {
    --k: var(--_distance);
  }
  .k-resting {
    --k: var(--_resting);
  }
  .k-total {
    --k: var(--_total);
  }
  .k-streak {
    --k: var(--_streak);
  }
  .k-minutes {
    --k: var(--_minutes);
  }
  .k-focus {
    --k: var(--_focus);
  }
  .k-cardio {
    --k: var(--_cardio);
  }

  /* Figures: name, value and a note */
  .stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(118px, 1fr));
    gap: 12px 16px;
  }
  .stat {
    min-width: 0;
    color: var(--k, currentColor);
  }
  .stat-head {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
  }
  .stat-name {
    color: var(--_text2);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .stat-value {
    margin-top: 2px;
    font-size: 12px;
    color: var(--_text2);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .stat-value b {
    color: var(--_text);
    font-size: 20px;
    font-weight: 700;
    letter-spacing: -0.01em;
  }
  .stat-note {
    margin-top: 3px;
    font-size: 11px;
    color: var(--_text2);
    font-variant-numeric: tabular-nums;
  }

  /* Bar charts */
  .chart {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    column-gap: 6px;
  }
  .yaxis {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 112px;
    margin: -5px 0;
    font-size: 10px;
    line-height: 10px;
    text-align: right;
    color: var(--_text2);
    font-variant-numeric: tabular-nums;
  }
  .plot {
    position: relative;
    height: 102px;
  }
  .grid {
    position: absolute;
    left: 0;
    right: 0;
    border-top: 1px dashed var(--_divider);
  }
  /* One column per bar, full height so the whole column answers to the pointer */
  .col {
    position: absolute;
    top: 0;
    bottom: 0;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding: 0;
    border: 0;
    background: none;
    cursor: crosshair;
  }
  .col i {
    display: block;
    width: 72%;
    max-width: 22px;
    min-height: 2px;
    border-radius: 3px 3px 1px 1px;
    background: linear-gradient(0deg, var(--k2, var(--k)), var(--k));
    opacity: 0.45;
    transition: height 0.5s ease;
  }
  .col.met i {
    opacity: 1;
    box-shadow: 0 0 var(--_glow) color-mix(in srgb, var(--k) 45%, transparent);
  }
  .col.running i {
    background: repeating-linear-gradient(
      -45deg,
      var(--k),
      var(--k) 3px,
      color-mix(in srgb, var(--k) 45%, transparent) 3px,
      color-mix(in srgb, var(--k) 45%, transparent) 6px
    );
  }
  .col.picked i,
  .col:hover i {
    opacity: 1;
    filter: brightness(1.15);
  }
  .col:focus-visible {
    outline: 1px solid var(--_text2);
    outline-offset: -1px;
  }
  .goal {
    position: absolute;
    left: 0;
    right: 0;
    height: 0;
    z-index: 1;
    border-top: 1px dashed color-mix(in srgb, var(--_goal) 70%, transparent);
    pointer-events: none;
  }
  .goal span {
    position: absolute;
    right: 0;
    bottom: 2px;
    padding: 0 4px;
    border-radius: 4px;
    font-size: 9px;
    font-weight: 600;
    line-height: 12px;
    color: var(--_goal);
    background: color-mix(in srgb, var(--_surface) 70%, transparent);
  }
  /* The box floats over the chart, so showing it never moves the layout. */
  .tip {
    position: absolute;
    pointer-events: none;
    top: 4px;
    z-index: 2;
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin-left: 10px;
    padding: 6px 9px;
    border-radius: 8px;
    font-size: 11px;
    white-space: nowrap;
    color: #f4f1fa;
    background: rgba(18, 14, 28, 0.94);
    border: 1px solid rgba(255, 255, 255, 0.14);
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
  }
  .tip.left {
    margin-left: -10px;
    transform: translateX(-100%);
  }
  .tip b {
    font-weight: 600;
  }
  .tip span {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .tip u {
    margin-left: auto;
    padding-left: 12px;
    text-decoration: none;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }
  .tip i {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--k);
  }
  .tip .goal-row i {
    height: 0;
    border-radius: 0;
    background: none;
    border-top: 2px dashed #f4f1fa;
  }
  .xaxis {
    position: relative;
    grid-column: 2;
    height: 14px;
    margin-top: 3px;
    font-size: 10px;
    color: var(--_text2);
  }
  .xaxis span {
    position: absolute;
    white-space: nowrap;
  }
  .xaxis span.centered {
    transform: translateX(-50%);
  }
  .xaxis span.end {
    transform: translateX(-100%);
  }
  .chart-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 119px;
    font-size: 12px;
    color: var(--_text2);
    text-align: center;
  }
  .chart-note {
    margin-top: 4px;
    font-size: 11px;
    color: var(--_text2);
    text-align: center;
  }

  /* Workouts: one line each, newest first */
  .workouts-list {
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .workout {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    column-gap: 8px;
    align-items: baseline;
    padding: 7px 0;
    color: var(--k);
  }
  .workout + .workout {
    border-top: 1px solid color-mix(in srgb, var(--_divider) 70%, transparent);
  }
  .workout .dot {
    align-self: center;
    box-shadow: 0 0 var(--_glow) currentColor;
  }
  .workout-name {
    font-size: 13px;
    font-weight: 600;
    color: var(--_text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .workout-name small {
    font-size: 12px;
    font-weight: 400;
    color: var(--_text2);
  }
  .workout-when {
    font-size: 11px;
    color: var(--_text2);
    white-space: nowrap;
  }
  .workout-detail {
    grid-column: 2 / -1;
    margin-top: 1px;
    font-size: 12px;
    color: var(--_text2);
    font-variant-numeric: tabular-nums;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .workouts-foot {
    margin-top: 6px;
    padding-top: 8px;
    border-top: 1px solid var(--_divider);
    font-size: 11px;
    color: var(--_text2);
  }
  .empty-note {
    padding: 14px 0;
    font-size: 12px;
    color: var(--_text2);
    text-align: center;
  }

  /* Tiles: every part in its own tinted, softly glowing box */
  ha-card.tiles {
    --_glow: var(--ar-glow, 3px);
  }
  .tiles .rows {
    gap: 8px;
  }
  .tiles .row,
  .tiles .section {
    padding: 10px 12px;
    border-radius: 14px;
    border: 1px solid color-mix(in srgb, var(--tint, currentColor) var(--ar-tile-border, 24%), transparent);
    background: color-mix(in srgb, var(--tint, currentColor) var(--ar-tile-fill, 7%), transparent);
    box-shadow:
      0 0 16px color-mix(in srgb, var(--tint, currentColor) var(--ar-tile-glow, 9%), transparent),
      inset 0 0 20px color-mix(in srgb, var(--tint, currentColor) var(--ar-tile-inset, 0%), transparent);
  }
  .tiles .section {
    margin-top: 12px;
  }
  .tiles .section-head > span:first-child {
    color: color-mix(in srgb, var(--tint) var(--ar-title-tint, 0%), var(--_text));
  }
  .tiles .bar {
    margin-bottom: 5px;
  }
  .tiles .rings {
    isolation: isolate;
  }
  .tiles .rings::before {
    content: "";
    position: absolute;
    inset: -14px;
    z-index: -1;
    border-radius: 50%;
    background: radial-gradient(
      circle,
      color-mix(in srgb, var(--band, transparent) var(--ar-halo, 7%), transparent) 0%,
      transparent 68%
    );
    pointer-events: none;
  }
  .tiles .score {
    text-shadow: 0 0 12px color-mix(in srgb, var(--band, transparent) var(--ar-score-glow, 0%), transparent);
  }

  .message {
    font-size: 13px;
    color: var(--_text2);
    padding: 8px 0;
  }

  /* A slim card: rings above their rows */
  @container (max-width: 419px) {
    .set {
      flex-direction: column;
      align-items: stretch;
      gap: 14px;
    }
    .rings {
      align-self: center;
    }
  }

  /* Two dashboard columns and wider: the two sets side by side, today's
     figures across the card, then the charts side by side and the workouts
     across the card. */
  @container (min-width: 640px) {
    .sets {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      gap: 12px 28px;
      align-items: stretch;
    }
    /* The two sets stand side by side with rows of different heights (a week's
       row holds seven columns). Both sets take the height of the taller one and
       today's rows grow to match, so the rings are level and so are the rows. */
    .group {
      display: flex;
      flex-direction: column;
    }
    .group > .set {
      flex: 1 1 auto;
      align-items: stretch;
    }
    .rings {
      align-self: center;
    }
    .rows > .row {
      flex: 1 1 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .panels {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      column-gap: 28px;
      align-items: stretch;
    }
    .tiles .panels {
      column-gap: 12px;
    }
    .panels > .section.today,
    .panels > .section.workouts,
    .panels.n1 > .section {
      grid-column: 1 / -1;
    }
    /* A chart alone in its row takes the row. */
    .panels.one-chart > .section.steps,
    .panels.one-chart > .section.exercise {
      grid-column: 1 / -1;
    }
    .section.today .stats {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }

  /* Between two and three columns each set is slim: rings above the rows */
  @container (min-width: 640px) and (max-width: 959px) {
    .set {
      flex-direction: column;
      align-items: stretch;
      gap: 14px;
    }
    .rings {
      align-self: center;
    }
  }

  /* Three columns: steps, exercise and workouts side by side */
  @container (min-width: 960px) {
    .panels.three {
      grid-template-columns: minmax(0, 6fr) minmax(0, 5fr) minmax(0, 5fr);
    }
    .panels.three > .section.workouts {
      grid-column: auto;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .fill,
    .bar-fill,
    .strip i::after,
    .col i {
      transition: none;
    }
  }
`;
