import { describe, expect, test } from "vitest";
import { getOption, stateStatus } from "../../src/engine/data";
import { realizeDollar, countsToward, atRiskDollar } from "../../src/engine/realize";
import {
  availableDecisions,
  leverVariants,
  dialBand,
  DIAL_IDS,
  type LeverDecision,
  type DialDecision,
} from "../../src/engine/decisions";
import { meterLeverDeltas, meterDialDeltas } from "../../src/engine/meters";
import { createGame, applyChoice } from "../../src/engine/engine";
import type { Basis } from "../../src/engine/types";

const EPS = 1e-6;
const leverBasis = (optionId: string): Basis =>
  getOption(optionId).verify.figure?.basis ?? "annual";

describe("createGame", () => {
  test("starts with empty banked and the §8 starting meters", () => {
    const s = createGame("near_term");
    expect(s.target).toBe("near_term");
    expect(s.banked).toEqual([]);
    expect(s.meters).toEqual({
      gap_progress: 0,
      political_capital: 100,
      equity: 0,
      long_term_health: 0,
    });
  });
});

describe("applyChoice — per-lever × per-variant matrix matches data by id (SPEC §5/§6/§7c/§8)", () => {
  const levers = availableDecisions().filter(
    (d): d is LeverDecision => d.kind === "lever",
  );

  for (const lever of levers) {
    for (const variant of leverVariants(lever.direction)) {
      test(`${lever.id} [${variant}]`, () => {
        const option = getOption(lever.optionId);
        const basis = leverBasis(lever.optionId);
        const expectedDollar = realizeDollar(option, variant);
        const stateDependent = stateStatus(lever.optionId) === "state";
        const expectedAtRisk = atRiskDollar(option, expectedDollar); // 0 for City levers
        const expectedConfirmed = expectedDollar - expectedAtRisk;
        const expectedMeter = meterLeverDeltas({
          direction: lever.direction,
          leverType: option.lever_type,
          variant,
          basis,
          realizedDollar: expectedDollar,
          stateDependent,
        });

        const { state, outcomes } = applyChoice(
          createGame("near_term"),
          lever.id,
          variant,
        );
        expect(outcomes).toHaveLength(1);
        const o = outcomes[0]!;

        expect(o.dollar_impact).toBeCloseTo(expectedDollar, EPS); // full data figure
        expect(o.at_risk_dollars ?? 0).toBeCloseTo(expectedAtRisk, EPS);
        expect(o.basis).toBe(basis);
        expect(o.counts_toward).toEqual(countsToward(basis));
        expect(o.meter_deltas.political_capital).toBe(expectedMeter.political_capital);
        expect(o.meter_deltas.equity).toBe(expectedMeter.equity);
        expect(o.meter_deltas.long_term_health).toBe(expectedMeter.long_term_health);
        expect(o.provenance.option_id).toBe(lever.optionId);

        // state advanced: banked appended, meters moved by the deltas. Only the
        // confirmed (non-at-risk) dollars accrue to the gap (E1).
        expect(state.banked).toHaveLength(1);
        expect(state.meters.political_capital).toBe(100 + expectedMeter.political_capital);
        const towardNearTerm = countsToward(basis).includes("near_term");
        expect(state.meters.gap_progress).toBeCloseTo(
          towardNearTerm ? expectedConfirmed : 0,
          EPS,
        );
      });
    }
  }
});

describe("applyChoice — per-dial × per-level matches §7b/§8 by id", () => {
  const dials = availableDecisions().filter(
    (d): d is DialDecision => d.kind === "dial",
  );

  for (const dial of dials) {
    for (const level of ["low", "med", "high"] as const) {
      test(`${dial.id} [${level}]`, () => {
        const band = dialBand(dial.id, level);
        const expectedMeter = meterDialDeltas({
          level,
          oneTimeDollar: band.oneTime,
        });

        const { outcomes } = applyChoice(createGame("near_term"), dial.id, level);

        const recurring = outcomes.find((o) => o.basis === "annual");
        expect(recurring).toBeDefined();
        expect(recurring!.dollar_impact).toBeCloseTo(band.recurring, EPS);

        const oneTime = outcomes.find((o) => o.basis === "one_time");
        if (band.oneTime > 0) {
          expect(oneTime).toBeDefined();
          expect(oneTime!.dollar_impact).toBeCloseTo(band.oneTime, EPS);
        } else {
          expect(oneTime).toBeUndefined();
        }

        // full dial meter delta carried by the recurring outcome
        expect(recurring!.meter_deltas.political_capital).toBe(
          expectedMeter.political_capital,
        );
        expect(recurring!.meter_deltas.equity).toBe(expectedMeter.equity);
        expect(recurring!.meter_deltas.long_term_health).toBe(
          expectedMeter.long_term_health,
        );
      });
    }
  }
});

describe("applyChoice is pure", () => {
  test("does not mutate the input state", () => {
    const s0 = createGame("near_term");
    const snapshot = JSON.stringify(s0);
    applyChoice(s0, "adjust-city-property-tax", "base");
    expect(JSON.stringify(s0)).toBe(snapshot);
  });
});

describe("DIAL_IDS sanity", () => {
  test("there are three dials", () => {
    expect(DIAL_IDS).toHaveLength(3);
  });
});
