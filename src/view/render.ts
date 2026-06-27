// Pure DOM rendering helpers. They read engine outcomes/state + data and produce
// elements; they never compute dollars themselves.

import { getOption } from "../engine/index";
import {
  leverVariants,
  dialBand,
  type Decision,
  type LeverDecision,
  type DialDecision,
  type DialLevel,
} from "../engine/index";
import type { GameState, Meters } from "../engine/index";
import { targetAmount, gapClosedPct } from "../engine/index";
import {
  METER_LABELS,
  VARIANT_LABELS,
  DIAL_LEVEL_LABELS,
  DIAL_TITLES,
  DIAL_BLURBS,
  UI,
} from "./copy";

/** Format a dollar amount (engine-provided) for display. */
export function formatUSD(n: number): string {
  const sign = n < 0 ? "−" : "";
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `${sign}$${(abs / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(0)}K`;
  return `${sign}$${abs.toFixed(0)}`;
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/** The four-meter dashboard. */
export function renderMeters(state: GameState): HTMLElement {
  const wrap = el("section", "meters");
  const target = targetAmount(state.target);
  const pct = Math.max(0, Math.min(1, gapClosedPct(state)));

  const gap = el("div", "meter meter--gap");
  gap.appendChild(el("div", "meter__label", METER_LABELS.gap_progress));
  gap.appendChild(
    el(
      "div",
      "meter__value",
      `${formatUSD(state.meters.gap_progress)} / ${formatUSD(target)} (${(pct * 100).toFixed(0)}%)`,
    ),
  );
  const bar = el("div", "meter__bar");
  const fill = el("div", "meter__fill");
  fill.style.width = `${pct * 100}%`;
  bar.appendChild(fill);
  gap.appendChild(bar);
  wrap.appendChild(gap);

  for (const key of ["political_capital", "equity", "long_term_health"] as const) {
    const m = el("div", "meter");
    m.appendChild(el("div", "meter__label", METER_LABELS[key]));
    m.appendChild(el("div", "meter__value", String((state.meters as Meters)[key])));
    wrap.appendChild(m);
  }
  return wrap;
}

function sourceLine(report: string, page: number): HTMLElement {
  return el("p", "card__source", `${UI.source}: ${report}, p.${page}`);
}

/** A single decision card with choice buttons. onChoose advances the game. */
export function renderDecision(
  decision: Decision,
  index: number,
  total: number,
  onChoose: (choice: string) => void,
): HTMLElement {
  return decision.kind === "lever"
    ? renderLever(decision, index, total, onChoose)
    : renderDial(decision, index, total, onChoose);
}

function renderLever(
  decision: LeverDecision,
  index: number,
  total: number,
  onChoose: (choice: string) => void,
): HTMLElement {
  const option = getOption(decision.optionId);
  const card = el("article", "card");
  card.appendChild(el("p", "card__step", UI.decisionOf(index, total)));
  card.appendChild(el("h2", "card__title", option.name));

  const meta = el("div", "card__meta");
  meta.appendChild(el("p", "", `${UI.whoAffected}: ${option.who_is_affected}`));
  if (option.feasibility_note)
    meta.appendChild(el("p", "", `${UI.feasibility}: ${option.feasibility_note}`));
  if (option.has_dissent && option.dissent_summary)
    meta.appendChild(el("p", "card__dissent", `${UI.dissent}: ${option.dissent_summary}`));
  card.appendChild(meta);

  const choices = el("div", "choices");
  for (const variant of leverVariants(decision.direction)) {
    const b = el("button", "choice", VARIANT_LABELS[variant]);
    b.addEventListener("click", () => onChoose(variant));
    choices.appendChild(b);
  }
  card.appendChild(choices);
  card.appendChild(sourceLine(option.report, option.page));
  return card;
}

function renderDial(
  decision: DialDecision,
  index: number,
  total: number,
  onChoose: (choice: string) => void,
): HTMLElement {
  const card = el("article", "card");
  card.appendChild(el("p", "card__step", UI.decisionOf(index, total)));
  card.appendChild(el("h2", "card__title", DIAL_TITLES[decision.id] ?? decision.id));
  card.appendChild(el("p", "card__meta", DIAL_BLURBS[decision.id] ?? ""));

  const choices = el("div", "choices");
  for (const level of ["low", "med", "high"] as const) {
    const band = dialBand(decision.id, level as DialLevel);
    const total$ = band.recurring + band.oneTime;
    const b = el("button", "choice");
    b.appendChild(el("span", "choice__label", DIAL_LEVEL_LABELS[level]));
    b.appendChild(el("span", "choice__sub", formatUSD(total$)));
    b.addEventListener("click", () => onChoose(level));
    choices.appendChild(b);
  }
  card.appendChild(choices);
  return card;
}

/** Running ledger of banked outcomes. */
export function renderLedger(state: GameState): HTMLElement {
  const wrap = el("section", "ledger");
  if (state.banked.length === 0) return wrap;
  wrap.appendChild(el("h3", "ledger__title", UI.banked));
  const list = el("ul", "ledger__list");
  for (const o of state.banked) {
    if (o.dollar_impact === 0) continue;
    const li = el("li");
    const name = o.option_id in DIAL_TITLES ? DIAL_TITLES[o.option_id]! : getOption(o.option_id).name;
    li.textContent = `${name} — ${formatUSD(o.dollar_impact)} (${o.basis})`;
    list.appendChild(li);
  }
  wrap.appendChild(list);
  return wrap;
}
