// SPEC §8 — meter weights + delta selection. These are game-design constants
// (NOT money), flagged TUNABLE by the spec; they live here as one typed source.

import type { Basis, Direction, MeterDelta } from "./types";
import type { DialLevel } from "./decisions";
import type { Variant } from "./realize";

const d = (
  political_capital: number,
  equity: number,
  long_term_health: number,
): MeterDelta => ({ political_capital, equity, long_term_health });

/** The §8 default-weight table (tunable by playtesting, not finalized). */
export const METER_WEIGHTS = {
  base_lever: d(-5, 0, 0),
  too_far_base: d(-10, -12, 0),
  too_far_scaled_back: d(-5, -5, 0),
  not_far_enough_harder: d(-15, 6, 4),
  alt_caution_base: d(-8, 0, 0),
  opposing_placate: d(-10, 8, 0),
  opposing_other: d(-10, -8, 0),
  dial_low: d(-3, 0, 0),
  dial_med: d(-7, -3, 0),
  dial_high: d(-15, -12, 0),
  one_time_plug: d(-2, 0, -10),
  structural: d(-8, 4, 12),
  study_and_delay: d(-1, 0, -5),
  // E1: extra political-capital cost of a lever that needs Springfield to act
  // (you must spend capital in the General Assembly). Tunable, §8-class constant.
  state_dependent_extra: d(-4, 0, 0),
} as const;

function add(...rows: MeterDelta[]): MeterDelta {
  return rows.reduce((a, r) =>
    d(
      a.political_capital + r.political_capital,
      a.equity + r.equity,
      a.long_term_health + r.long_term_health,
    ),
  );
}

function banksOneTimePlug(basis: Basis, realizedDollar: number): boolean {
  return (basis === "one_time" || basis === "ten_year_pv") && realizedDollar > 0;
}

export interface LeverMeterInput {
  direction: Direction | null;
  leverType: string;
  variant: Variant;
  basis: Basis;
  realizedDollar: number;
  /** True when this lever needs Springfield/Illinois action (E1). */
  stateDependent?: boolean;
}

/**
 * Meter movement for a banked lever choice (SPEC §8). Selects one primary row by
 * (variant, direction, leverType), then stacks the one-time-plug row when the
 * choice banks one-time / asset-monetization dollars, and the state-dependent
 * surcharge (E1) when a State-reliant lever actually banks a positive ask.
 */
export function meterLeverDeltas(input: LeverMeterInput): MeterDelta {
  const { direction, leverType, variant, basis, realizedDollar, stateDependent } = input;
  const W = METER_WEIGHTS;

  let row: MeterDelta;
  if (variant === "defer") row = W.study_and_delay;
  else if (variant === "opposing_zero") row = W.opposing_placate;
  else if (variant === "opposing_max") row = W.opposing_other;
  else if (leverType === "structural") row = W.structural;
  else if (direction === "too_far")
    row = variant === "scaled_back" ? W.too_far_scaled_back : W.too_far_base;
  else if (direction === "not_far_enough")
    row = variant === "push_harder" ? W.not_far_enough_harder : W.base_lever;
  else if (direction === "alternative_or_caution") row = W.alt_caution_base;
  else row = W.base_lever;

  if (banksOneTimePlug(basis, realizedDollar)) row = add(row, W.one_time_plug);
  // The Springfield surcharge applies only when you actually pursue the ask ($ > 0).
  if (stateDependent === true && realizedDollar > 0) row = add(row, W.state_dependent_extra);
  return row;
}

export interface DialMeterInput {
  level: DialLevel;
  oneTimeDollar: number;
}

/** Meter movement for a banked dial choice (SPEC §8), with one-time-plug stack. */
export function meterDialDeltas(input: DialMeterInput): MeterDelta {
  const W = METER_WEIGHTS;
  const row =
    input.level === "low"
      ? W.dial_low
      : input.level === "med"
        ? W.dial_med
        : W.dial_high;
  return input.oneTimeDollar > 0 ? add(row, W.one_time_plug) : row;
}
