// Pure DOM rendering helpers. They read engine outcomes/state + data and produce
// elements; they never compute dollars themselves.

import { getOption, getDecision } from "../engine/index";
import {
  leverVariants,
  dialBand,
  directionFor,
  type Decision,
  type LeverDecision,
  type DialDecision,
  type DialLevel,
  type Target,
} from "../engine/index";
import type { GameState, Meters } from "../engine/index";
import { targetAmount, gapClosedPct } from "../engine/index";
import {
  METER_LABELS,
  METER_HELP,
  STATUS_LABELS,
  DIAL_LEVEL_LABELS,
  DIAL_TITLES,
  DIAL_BLURBS,
  CONSEQUENCE,
  UI,
} from "./copy";
import {
  dissentSpeech,
  choiceLabels,
  consequenceLine,
  consequenceIcon,
  parseFeasibility,
  splitCrossRefs,
  choiceStatus,
  shortfall,
  actFor,
  type Badge,
  type ChoiceStatus,
} from "./narrative";

/** Display name for a decision (option name, or dial title). */
function decisionName(id: string, optionId: string): string {
  return optionId in DIAL_TITLES ? DIAL_TITLES[optionId]! : getOption(optionId).name;
}

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

/** The four-meter dashboard, led by the live "still to close" hero. */
export function renderMeters(state: GameState): HTMLElement {
  const wrap = el("section", "meters");
  const target = targetAmount(state.target);
  const pct = Math.max(0, Math.min(1, gapClosedPct(state)));

  // V3: the gap is the hero — a big remaining-to-close figure that shrinks live.
  const s = shortfall(state);
  const hero = el("div", "gap-hero");
  const heroLabel = el("div", "gap-hero__label", UI.stillToClose);
  heroLabel.title = METER_HELP.gap_progress;
  hero.appendChild(heroLabel);
  hero.appendChild(el("div", "gap-hero__value", formatUSD(s.short)));
  wrap.appendChild(hero);

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
    const label = el("div", "meter__label", METER_LABELS[key]);
    label.title = METER_HELP[key]; // hover help; full text is on the intro screen
    m.appendChild(label);
    m.appendChild(el("div", "meter__value", String((state.meters as Meters)[key])));
    wrap.appendChild(m);
  }
  return wrap;
}

function sourceLine(report: string, page: number): HTMLElement {
  return el("p", "card__source", `${UI.source}: ${report}, p.${page}`);
}

/** A labeled text block (small caps label over body) for the decision meta. */
function labeled(label: string, text: string): HTMLElement {
  const wrap = el("div", "field");
  wrap.appendChild(el("div", "field__label", label));
  wrap.appendChild(el("p", "field__body", text));
  return wrap;
}

/** The Impact / Feasibility / Timing chip row (null when no triplet present). */
function badgeRow(badges: Badge[]): HTMLElement | null {
  if (badges.length === 0) return null;
  const row = el("div", "badges");
  for (const b of badges) {
    const chip = el("span", "badge");
    chip.appendChild(el("span", "badge__label", b.label));
    chip.appendChild(el("span", "badge__value", b.value));
    row.appendChild(chip);
  }
  return row;
}

/** Icon + plain-language durability callout for a lever choice. */
function consequenceCallout(option: ReturnType<typeof getOption>, target: Target): HTMLElement {
  const c = el("div", "consequence");
  c.appendChild(el("span", "consequence__icon", consequenceIcon(option)));
  c.appendChild(el("span", "consequence__text", consequenceLine(option, target)));
  return c;
}

/** Demoted cross-reference footnote (null when there are none). */
function footnote(refs: string[]): HTMLElement | null {
  if (refs.length === 0) return null;
  const f = el("div", "refs");
  for (const r of refs) f.appendChild(el("p", "refs__item", `↳ ${r}`));
  return f;
}

/** Small act badge ("Act II · Taxes & TIF") for the current decision index. */
function actBadge(index: number): HTMLElement {
  const act = actFor(index - 1); // index is 1-based; actFor is 0-based
  return el("p", "card__act", `Act ${act.number} · ${act.title}`);
}

/** A single decision card with choice buttons. onChoose advances the game. */
export function renderDecision(
  decision: Decision,
  index: number,
  total: number,
  target: Target,
  selected: string | null,
  onChoose: (choice: string) => void,
): HTMLElement {
  return decision.kind === "lever"
    ? renderLever(decision, index, total, target, selected, onChoose)
    : renderDial(decision, index, total, selected, onChoose);
}

/** A choice button, marked selected when it is the player's current pick. */
function choiceButton(
  value: string,
  label: string,
  selected: string | null,
  onChoose: (choice: string) => void,
  sub?: string,
): HTMLButtonElement {
  const cls = value === selected ? "choice choice--selected" : "choice";
  const b = el("button", cls);
  b.appendChild(el("span", "choice__label", label));
  if (sub !== undefined) b.appendChild(el("span", "choice__sub", sub));
  b.addEventListener("click", () => onChoose(value));
  return b;
}

function renderLever(
  decision: LeverDecision,
  index: number,
  total: number,
  target: Target,
  selected: string | null,
  onChoose: (choice: string) => void,
): HTMLElement {
  const option = getOption(decision.optionId);
  const card = el("article", "card");
  card.appendChild(actBadge(index));
  card.appendChild(el("p", "card__step", UI.decisionOf(index, total)));
  card.appendChild(el("h2", "card__title", option.name));

  // Restructure the dense report prose into scannable blocks. Source wording is
  // preserved exactly — parsing only splits structure out, never rewrites text.
  const { badges, body } = parseFeasibility(option.feasibility_note ?? "");
  const affected = splitCrossRefs(option.who_is_affected);
  const feas = splitCrossRefs(body);

  const br = badgeRow(badges);
  if (br) card.appendChild(br);
  card.appendChild(consequenceCallout(option, target)); // V2 durability cue

  const meta = el("div", "card__meta");
  meta.appendChild(labeled(UI.whoAffected, affected.main));
  if (feas.main) meta.appendChild(labeled(UI.feasibility, feas.main));
  card.appendChild(meta);

  const fn = footnote([...affected.refs, ...feas.refs]);
  if (fn) card.appendChild(fn);

  // V1: dissent voiced by a fictional archetype carrying the real cited argument.
  const speech = dissentSpeech(option, directionFor(option.id));
  if (speech) {
    const block = el("div", "dissent");
    block.appendChild(el("p", "dissent__speaker", `${speech.speaker} —`));
    block.appendChild(el("p", "dissent__arg", `"${speech.argument}"`));
    card.appendChild(block);
  }

  const choices = el("div", "choices");
  const labels = choiceLabels(decision.direction);
  for (const variant of leverVariants(decision.direction)) {
    choices.appendChild(choiceButton(variant, labels[variant] ?? variant, selected, onChoose));
  }
  card.appendChild(choices);
  card.appendChild(sourceLine(option.report, option.page));
  return card;
}

function renderDial(
  decision: DialDecision,
  index: number,
  total: number,
  selected: string | null,
  onChoose: (choice: string) => void,
): HTMLElement {
  const card = el("article", "card");
  card.appendChild(actBadge(index));
  card.appendChild(el("p", "card__step", UI.decisionOf(index, total)));
  card.appendChild(el("h2", "card__title", DIAL_TITLES[decision.id] ?? decision.id));
  card.appendChild(el("p", "card__meta", DIAL_BLURBS[decision.id] ?? ""));
  card.appendChild(el("p", "card__consequence", CONSEQUENCE.recurring));

  const choices = el("div", "choices");
  for (const level of ["low", "med", "high"] as const) {
    const band = dialBand(decision.id, level as DialLevel);
    const total$ = band.recurring + band.oneTime;
    choices.appendChild(
      choiceButton(level, DIAL_LEVEL_LABELS[level], selected, onChoose, formatUSD(total$)),
    );
  }
  card.appendChild(choices);
  return card;
}

const STATUS_GLYPH: Record<ChoiceStatus, string> = {
  adopted: "✓",
  scaled: "◐",
  passed: "✕",
  undecided: "○",
};

/**
 * Clickable map of every decision, grouped by act, showing each one's status.
 * Doubles as navigation (jump to any) and the "what am I passing on" tracker.
 */
export function renderDecisionMap(
  decisions: readonly Decision[],
  choices: readonly (string | null)[],
  current: number,
  onJump: (index: number) => void,
): HTMLElement {
  const wrap = el("section", "map");
  wrap.appendChild(el("h3", "map__title", UI.mapTitle));

  let lastAct = -1;
  decisions.forEach((d, i) => {
    const act = actFor(i);
    if (act.number !== lastAct) {
      wrap.appendChild(el("div", "map__act", `Act ${act.number} · ${act.title}`));
      lastAct = act.number;
    }
    const status = choiceStatus(d, choices[i] ?? null);
    const cls =
      `map__item map__item--${status}` + (i === current ? " map__item--current" : "");
    const row = el("button", cls);
    const name = decisionName(d.id, d.kind === "lever" ? d.optionId : d.id);
    row.title = name; // full name on hover (rows are truncated with ellipsis)
    row.appendChild(el("span", "map__glyph", STATUS_GLYPH[status]));
    row.appendChild(el("span", "map__name", name));
    row.appendChild(el("span", "map__status", STATUS_LABELS[status]));
    row.addEventListener("click", () => onJump(i));
    wrap.appendChild(row);
  });
  return wrap;
}

/** Ledger split into Adopted / Scaled back / Passed on (collapses dial outcomes). */
export function renderLedger(state: GameState): HTMLElement {
  const wrap = el("section", "ledger");
  if (state.banked.length === 0) return wrap;

  // Collapse a decision's outcome(s) into one row (dials emit two).
  const rows = new Map<string, { name: string; status: ChoiceStatus; dollars: number }>();
  for (const o of state.banked) {
    const status = choiceStatus(getDecision(o.decision_id), o.choice);
    const name = decisionName(o.decision_id, o.option_id);
    const cur = rows.get(o.decision_id) ?? { name, status, dollars: 0 };
    cur.dollars += o.dollar_impact;
    rows.set(o.decision_id, cur);
  }

  const section = (
    head: string,
    items: { name: string; dollars: number }[],
    showDollars: boolean,
  ): void => {
    if (items.length === 0) return;
    wrap.appendChild(el("h3", "ledger__title", head));
    const list = el("ul", "ledger__list");
    for (const it of items) {
      const li = el("li");
      li.appendChild(el("span", "led__name", it.name));
      if (showDollars) li.appendChild(el("span", "led__amt", formatUSD(it.dollars)));
      list.appendChild(li);
    }
    wrap.appendChild(list);
  };

  const all = [...rows.values()];
  section(UI.adoptedHead, all.filter((r) => r.status === "adopted"), true);
  section(UI.scaledHead, all.filter((r) => r.status === "scaled"), true);
  section(UI.passedHead, all.filter((r) => r.status === "passed"), false);
  return wrap;
}
