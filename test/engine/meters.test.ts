import { describe, expect, test } from "vitest";
import { getOption } from "../../src/engine/data";
import { realizeDollar } from "../../src/engine/realize";
import { dialBand } from "../../src/engine/decisions";
import { METER_WEIGHTS, meterLeverDeltas, meterDialDeltas } from "../../src/engine/meters";
import type { Basis, MeterDelta } from "../../src/engine/types";
import type { Variant } from "../../src/engine/realize";

const add = (...rows: MeterDelta[]): MeterDelta =>
  rows.reduce(
    (a, r) => ({
      political_capital: a.political_capital + r.political_capital,
      equity: a.equity + r.equity,
      long_term_health: a.long_term_health + r.long_term_health,
    }),
    { political_capital: 0, equity: 0, long_term_health: 0 },
  );

const W = METER_WEIGHTS;
const basisOf = (id: string): Basis => getOption(id).verify.figure?.basis ?? "annual";

// Build a lever meter input straight from a real option by id (no money literals).
function leverInput(
  id: string,
  direction: Parameters<typeof meterLeverDeltas>[0]["direction"],
  variant: Variant,
  stateDependent = false,
) {
  const o = getOption(id);
  return {
    direction,
    leverType: o.lever_type,
    variant,
    basis: basisOf(id),
    realizedDollar: realizeDollar(o, variant),
    stateDependent,
  };
}

describe("meterLeverDeltas — §8 row selection", () => {
  test("too_far base lever → regressive row", () => {
    expect(meterLeverDeltas(leverInput("adjust-city-property-tax", "too_far", "base"))).toEqual(
      W.too_far_base,
    );
  });

  test("too_far scaled_back fork → scaled-back row", () => {
    expect(
      meterLeverDeltas(leverInput("adjust-city-property-tax", "too_far", "scaled_back")),
    ).toEqual(W.too_far_scaled_back);
  });

  test("alternative_or_caution base → alt/caution row", () => {
    expect(
      meterLeverDeltas(
        leverInput("cfftf-re-increase-lgdf-share-rate", "alternative_or_caution", "base"),
      ),
    ).toEqual(W.alt_caution_base);
  });

  test("structural lever base → structural/pension row (priority over direction)", () => {
    // secure-cps is lever_type structural AND alternative_or_caution direction.
    expect(
      meterLeverDeltas(
        leverInput(
          "cfftf-ltl-secure-cps-pension-contributions",
          "alternative_or_caution",
          "base",
        ),
      ),
    ).toEqual(W.structural);
  });

  test("study-and-delay (defer) fork → study-and-delay row", () => {
    expect(
      meterLeverDeltas(
        leverInput(
          "cfftf-ltl-secure-cps-pension-contributions",
          "alternative_or_caution",
          "defer",
        ),
      ),
    ).toEqual(W.study_and_delay);
  });

  test("opposing placate branch banks $0 → placate row only", () => {
    expect(
      meterLeverDeltas(leverInput("institute-vacancy-freeze", "opposing_both", "opposing_zero")),
    ).toEqual(W.opposing_placate);
  });

  test("opposing money branch banks one-time $ → other row + one-time plug", () => {
    expect(
      meterLeverDeltas(leverInput("institute-vacancy-freeze", "opposing_both", "opposing_max")),
    ).toEqual(add(W.opposing_other, W.one_time_plug));
  });

  test("too_far one-time plug banked → regressive row + one-time plug", () => {
    // declare-maximum-tif-surplus: lever_type one-time, basis one_time.
    expect(
      meterLeverDeltas(leverInput("declare-maximum-tif-surplus", "too_far", "base")),
    ).toEqual(add(W.too_far_base, W.one_time_plug));
  });

  test("uncontested base lever → base row", () => {
    expect(
      meterLeverDeltas(leverInput("ey-procurement-category-management", null, "base")),
    ).toEqual(W.base_lever);
  });

  test("State-dependent lever banking $ → row + state surcharge (E1)", () => {
    // lgdf is alternative_or_caution AND state-dependent: alt/caution row + the
    // extra political-capital cost of needing Springfield.
    expect(
      meterLeverDeltas(
        leverInput("cfftf-re-increase-lgdf-share-rate", "alternative_or_caution", "base", true),
      ),
    ).toEqual(add(W.alt_caution_base, W.state_dependent_extra));
  });

  test("State-dependent lever banking $0 (deferred) → no surcharge (E1)", () => {
    // Deferring the lever doesn't spend capital in Springfield, so no surcharge.
    expect(
      meterLeverDeltas(
        leverInput("cfftf-re-increase-lgdf-share-rate", "alternative_or_caution", "defer", true),
      ),
    ).toEqual(W.study_and_delay);
  });

  test("a City-controlled lever never takes the state surcharge (E1)", () => {
    expect(
      meterLeverDeltas(leverInput("reinstitute-head-tax", "too_far", "base", false)),
    ).toEqual(W.too_far_base);
  });
});

describe("meterDialDeltas — §8 dial rows", () => {
  test("LOW / MED / HIGH map to their rows", () => {
    expect(meterDialDeltas({ level: "low", oneTimeDollar: 0 })).toEqual(W.dial_low);
    expect(meterDialDeltas({ level: "med", oneTimeDollar: 0 })).toEqual(W.dial_med);
    expect(meterDialDeltas({ level: "high", oneTimeDollar: 0 })).toEqual(W.dial_high);
  });

  test("HIGH with a one-time portion adds the one-time plug", () => {
    // personnel HIGH carries a real one-time band (furlough), driving the plug.
    const oneTimeDollar = dialBand("personnel_benefits", "high").oneTime;
    expect(oneTimeDollar).toBeGreaterThan(0);
    expect(meterDialDeltas({ level: "high", oneTimeDollar })).toEqual(
      add(W.dial_high, W.one_time_plug),
    );
  });
});
