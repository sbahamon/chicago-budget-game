// View-layer narrative logic: pure, DOM-free. It composes engine outputs + copy
// into player-facing strings/data. It computes no dollars — every figure comes
// from the engine; this module only selects copy and floors a display value.
// Kept css-free and DOM-free so it runs under the node test environment.

import type {
  Direction,
  Option,
  GameState,
  Target,
  Basis,
  Decision,
} from "../engine/index";
import {
  targetAmount,
  gapClosedPct,
  countsToward,
} from "../engine/index";
import type { Variant } from "../engine/index";
import {
  CHARACTERS,
  CHOICE_LABELS,
  CONSEQUENCE,
  ACTS,
  type Character,
} from "./copy";

/** A dissent rendered as a fictional archetype voicing the real cited argument. */
export interface Speech {
  speaker: string;
  argument: string;
}

/** Generic archetype for a dissent direction (null when there's no dissent). */
export function characterFor(direction: Direction | null): Character | null {
  return direction === null ? null : CHARACTERS[direction];
}

/**
 * The dissent as a fictional speaker + the option's real, cited dissent_summary.
 * Returns null when the option has no dissent. Never rewrites the argument.
 */
export function dissentSpeech(
  option: Option,
  direction: Direction | null,
): Speech | null {
  const character = characterFor(direction);
  if (character === null || !option.has_dissent || option.dissent_summary === null) {
    return null;
  }
  return { speaker: character.archetype, argument: option.dissent_summary };
}

/** Choice-button labels for a lever, framed as taking a side on the dissent. */
export function choiceLabels(
  direction: Direction | null,
): Partial<Record<Variant, string>> {
  return CHOICE_LABELS[direction ?? "none"];
}

/** Plain-language second-order meaning of a choice, by basis + selected target. */
export function consequenceLine(option: Option, target: Target): string {
  const basis: Basis = option.verify.figure?.basis ?? "annual";
  if (basis === "annual" || basis === "ten_year_cumulative") {
    return CONSEQUENCE.recurring;
  }
  if (basis === "upfront_cost") {
    return CONSEQUENCE.upfront_cost;
  }
  // one_time | ten_year_pv
  return countsToward(basis).includes(target)
    ? CONSEQUENCE.one_time_counts
    : CONSEQUENCE.one_time_no_count;
}

/** A glyph cueing a choice's durability, by basis. */
export function consequenceIcon(option: Option): string {
  const basis: Basis = option.verify.figure?.basis ?? "annual";
  if (basis === "annual" || basis === "ten_year_cumulative") return "🔁";
  if (basis === "upfront_cost") return "⏳";
  return "💵"; // one_time | ten_year_pv
}

/** One Impact/Feasibility/Timing grade badge. */
export interface Badge {
  label: "Impact" | "Feasibility" | "Timing";
  value: string;
}

// "Impact <v> / Feasibility <v> / Timing <v>. <rest>" — values may contain spaces,
// hyphens, and parentheticals; the rest follows the first period after Timing.
const TRIPLET =
  /^Impact\s+(.+?)\s*\/\s*Feasibility\s+(.+?)\s*\/\s*Timing\s+(.+?)\.\s*([\s\S]*)$/;

/**
 * Split a feasibility note's leading Impact/Feasibility/Timing grades into badges.
 * Faithful: when the triplet is absent, badges are empty and body is the note
 * verbatim; when present, no source word is dropped (badges + body reconstruct it).
 */
export function parseFeasibility(note: string): { badges: Badge[]; body: string } {
  const m = note.match(TRIPLET);
  if (m === null) return { badges: [], body: note };
  return {
    badges: [
      { label: "Impact", value: m[1]!.trim() },
      { label: "Feasibility", value: m[2]!.trim() },
      { label: "Timing", value: m[3]!.trim() },
    ],
    body: m[4]!.trim(),
  };
}

// Trailing cross-references the report appends; peeled to a footnote, never dropped.
const CROSS_REFS: RegExp[] = [
  /\s*\(Also included in [^)]*\)\s*$/i,
  /\s*Also analyzed in [\s\S]*$/i,
];

/**
 * Peel trailing "Also analyzed in …" / "(Also included in …)" cross-references off
 * a text block so the view can demote them. Lossless: main + refs reconstruct the
 * original word-for-word. Returns refs in source order.
 */
export function splitCrossRefs(text: string): { main: string; refs: string[] } {
  let main = text.trim();
  const refs: string[] = [];
  let peeled = true;
  while (peeled) {
    peeled = false;
    for (const re of CROSS_REFS) {
      const m = main.match(re);
      if (m && m.index !== undefined) {
        refs.unshift(m[0].trim());
        main = main.slice(0, m.index).trim();
        peeled = true;
      }
    }
  }
  return { main, refs };
}

/** Gap progress composed from engine math (floors shortfall at 0 for display). */
export function shortfall(state: GameState): {
  closed: number;
  target: number;
  short: number;
  pct: number;
} {
  const target = targetAmount(state.target);
  const closed = state.meters.gap_progress;
  return {
    closed,
    target,
    short: Math.max(0, target - closed),
    pct: gapClosedPct(state),
  };
}

/** How a decision was resolved, for the decision map + split ledger. */
export type ChoiceStatus = "adopted" | "scaled" | "passed" | "undecided";

/** Categorize a decision's current choice (null = not yet decided). */
export function choiceStatus(decision: Decision, choice: string | null): ChoiceStatus {
  if (choice === null || choice === undefined) return "undecided";
  if (decision.kind === "dial") return "adopted"; // any chosen level adopts something
  if (choice === "scaled_back") return "scaled";
  if (choice === "defer" || choice === "opposing_zero") return "passed";
  return "adopted"; // base | opposing_max | push_harder
}

/** Which act a 0-based decision index belongs to (contiguous over the sequence). */
export function actFor(index: number): {
  number: number;
  title: string;
  blurb: string;
} {
  let act = ACTS[0]!;
  for (const a of ACTS) {
    if (index >= a.start) act = a;
  }
  return { number: act.number, title: act.title, blurb: act.blurb };
}
