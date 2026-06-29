// SPEC §9 — endings. gap_closed_pct + one_time_share, then the ordered branch
// table. Target amounts come from structural_gap[] (selected by provenance, not
// hardcoded money).

import { structuralGap } from "./data";
import type { DollarRange, GameState, Target } from "./types";

export type Ending =
  | "Crisis Deepens"
  | "Midnight Budget Standoff"
  | "Kicked the Can"
  | "The Austerity Mayor"
  | "The Lame-Duck Reformer"
  | "The Structural Reformer"
  | "The Pragmatist";

/**
 * The §9 ending-branch thresholds, named so the view can surface the cliffs
 * (SPEC §9 / V3) without re-deriving numbers. These ARE the ending constants —
 * no new figures are introduced.
 */
export const ENDING_THRESHOLDS = {
  austerity_equity: -40, // equity ≤ this → The Austerity Mayor
  lame_duck_pc: 20, // political_capital ≤ this → The Lame-Duck Reformer
  reformer_pc: 40, // political_capital floor for The Structural Reformer
  reformer_health: 30, // long_term_health floor for The Structural Reformer
} as const;

/** Difficulty-target dollar amount, read from structural_gap[] (SPEC §2). */
export function targetAmount(target: Target): number {
  const gaps = structuralGap();
  switch (target) {
    case "near_term": {
      // EY p4 FY2026 ~$1.15B Corporate Fund gap.
      const g = gaps.find(
        (x) => x.source_body === "EY" && x.page === 4 && typeof x.amount === "number",
      );
      if (g && typeof g.amount === "number") return g.amount;
      break;
    }
    case "durable": {
      // CFFTF Final p5 $680M recurring FY2027 shortfall.
      const g = gaps.find((x) => x.source_body === "CFFTF" && x.page === 5);
      if (g && typeof g.amount === "number") return g.amount;
      break;
    }
    case "stretch": {
      // CFFTF Final p10 long-term baseline range; stretch = the high end ($780M).
      const g = gaps.find(
        (x) => x.source_body === "CFFTF" && x.page === 10 && typeof x.amount === "object",
      );
      if (g && typeof g.amount === "object") return (g.amount as DollarRange).high;
      break;
    }
  }
  throw new Error(`No structural_gap entry for target: ${target}`);
}

/** Fraction of the chosen target closed by banked dollars (SPEC §9). */
export function gapClosedPct(state: GameState): number {
  return state.meters.gap_progress / targetAmount(state.target);
}

/**
 * Share of closure that rests on one-time plugs (SPEC §6/§9):
 * (one_time + ten_year_pv dollars) / (all banked dollars EXCEPT upfront_cost).
 * upfront_cost is excluded from both numerator and denominator. 0 when no dollars.
 */
export function oneTimeShare(state: GameState): number {
  let numerator = 0;
  let denominator = 0;
  for (const o of state.banked) {
    if (o.basis === "upfront_cost") continue;
    denominator += o.dollar_impact;
    if (o.basis === "one_time" || o.basis === "ten_year_pv") {
      numerator += o.dollar_impact;
    }
  }
  if (denominator === 0) return 0;
  return numerator / denominator;
}

/** Evaluate the final ending (SPEC §9 ordered branches). */
export function evaluateEnding(state: GameState): Ending {
  const closed = gapClosedPct(state);
  if (closed < 0.5) return "Crisis Deepens";
  if (closed < 1.0) return "Midnight Budget Standoff";

  const oneTime = oneTimeShare(state);
  const { equity, political_capital, long_term_health } = state.meters;

  const T = ENDING_THRESHOLDS;
  if (oneTime >= 0.4) return "Kicked the Can";
  if (equity <= T.austerity_equity) return "The Austerity Mayor";
  if (political_capital <= T.lame_duck_pc) return "The Lame-Duck Reformer";
  if (
    oneTime <= 0.2 &&
    equity >= 0 &&
    political_capital >= T.reformer_pc &&
    long_term_health >= T.reformer_health
  ) {
    return "The Structural Reformer";
  }
  return "The Pragmatist";
}
