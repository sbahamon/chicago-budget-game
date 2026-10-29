// SPEC §6 — basis → counting + dollar realization.
// The verified figure (verify.figure) is the source of both the dollar value and
// the basis. Options with no figure realize 0 (e.g. structural pension plays).

import { isDollarRange, stateStatus } from "./data";
import { assumptionValue } from "./sources";
import type { Basis, DollarEstimate, Option, Target } from "./types";

/**
 * Realization variant for a banked choice:
 * - base         — basis-normalized midpoint (standalone base lever / dial member)
 * - scaled_back  — too_far fork: range LOW, or 50% of a point figure
 * - push_harder  — not_far_enough fork: range HIGH, or +25% of a point figure
 *                  (defined for completeness/v2; dead code in v1 per SPEC §7c)
 * - defer        — alternative_or_caution / study-and-delay: banks 0 now
 * - opposing_max — opposing_both money branch: banks the base figure
 * - opposing_zero— opposing_both placate branch: banks 0
 */
export type Variant =
  | "base"
  | "scaled_back"
  | "push_harder"
  | "defer"
  | "opposing_max"
  | "opposing_zero";

/** Range → (low+high)/2; point → point; null → 0 (SPEC §6). */
export function midpoint(estimate: DollarEstimate): number {
  if (estimate === null) return 0;
  if (isDollarRange(estimate)) return (estimate.low + estimate.high) / 2;
  return estimate;
}

/** Ten-year bases divide by 10; all other bases pass through (SPEC §6 / §7b). */
export function basisNormalize(value: number, basis: Basis): number {
  if (basis === "ten_year_cumulative" || basis === "ten_year_pv") {
    return value / 10;
  }
  return value;
}

/** Basis-normalized midpoint of an option's verified figure (0 if no figure). */
export function realizedBase(option: Option): number {
  const figure = option.verify.figure;
  if (figure === null) return 0;
  return basisNormalize(midpoint(figure.dollar_estimate), figure.basis);
}

/** Dollar realized for a given choice variant (SPEC §6 / §7c conventions). */
export function realizeDollar(option: Option, variant: Variant): number {
  const figure = option.verify.figure;
  if (figure === null) return 0;
  const { dollar_estimate, basis } = figure;

  switch (variant) {
    case "base":
    case "opposing_max":
      return realizedBase(option);
    case "defer":
    case "opposing_zero":
      return 0;
    case "scaled_back": {
      if (isDollarRange(dollar_estimate)) {
        return basisNormalize(dollar_estimate.low, basis);
      }
      if (dollar_estimate === null) return 0;
      return basisNormalize(dollar_estimate * 0.5, basis);
    }
    case "push_harder": {
      if (isDollarRange(dollar_estimate)) {
        return basisNormalize(dollar_estimate.high, basis);
      }
      if (dollar_estimate === null) return 0;
      return basisNormalize(dollar_estimate * 1.25, basis);
    }
  }
}

// --- State friction (E1) -----------------------------------------------------
// A State-dependent lever (data.stateStatus === "state") is not the City's to pull
// alone — Springfield/Illinois action is required. Only a tunable share of its
// realized yield is treated as confirmed/countable; the remainder is "at risk,
// pending Springfield." STATE_CONFIRMED_SHARE is a game-design tuning constant in
// the same category as the §8 meter weights and the §6 midpoint/÷10 rules — it
// scales a real data figure, it does not assert any new budget figure. Its value and
// rationale live in data/assumptions.json (REVAMP §4) so the Math page can list it.

/** Share of a State-dependent lever's yield that counts toward the gap (E1, tunable). */
export const STATE_CONFIRMED_SHARE = assumptionValue("state_confirmed_share");

/** Share of `option`'s yield that actually counts (1 for City-controlled levers). */
export function stateConfirmedShare(option: Option): number {
  return stateStatus(option.id) === "state" ? STATE_CONFIRMED_SHARE : 1;
}

/** Dollars of a realized yield that are at risk pending Springfield (0 for City levers). */
export function atRiskDollar(option: Option, realizedDollar: number): number {
  return realizedDollar * (1 - stateConfirmedShare(option));
}

/** Targets a basis contributes toward (SPEC §6 table). */
export function countsToward(basis: Basis): Target[] {
  switch (basis) {
    case "annual":
    case "ten_year_cumulative":
      return ["near_term", "durable", "stretch"];
    case "one_time":
    case "upfront_cost":
    case "ten_year_pv":
      return ["near_term"];
  }
}
