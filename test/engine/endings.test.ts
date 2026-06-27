import { describe, expect, test } from "vitest";
import { getOption, structuralGap } from "../../src/engine/data";
import { realizedBase } from "../../src/engine/realize";
import {
  targetAmount,
  gapClosedPct,
  oneTimeShare,
  evaluateEnding,
} from "../../src/engine/endings";
import type { Basis, GameState, LeverOutcome, Target } from "../../src/engine/types";

// Minimal banked outcome for unit-testing the pure ending math.
function outcome(dollar: number, basis: Basis): LeverOutcome {
  return {
    decision_id: "x",
    option_id: "x",
    choice: "base",
    dollar_impact: dollar,
    basis,
    counts_toward: [],
    affected_groups: "",
    meter_deltas: { gap_progress: 0, political_capital: 0, equity: 0, long_term_health: 0 },
    provenance: { option_id: "x", report: "", page: 0, verbatim_anchor: "" },
  };
}

function state(
  target: Target,
  gap_progress: number,
  banked: LeverOutcome[],
  meters: Partial<GameState["meters"]> = {},
): GameState {
  return {
    target,
    banked,
    meters: {
      gap_progress,
      political_capital: 100,
      equity: 0,
      long_term_health: 0,
      ...meters,
    },
  };
}

describe("targetAmount (SPEC §2, from structural_gap[])", () => {
  test("near_term reads EY p4 FY2026 Corporate Fund gap", () => {
    const ey = structuralGap().find(
      (g) =>
        g.source_body === "EY" &&
        g.page === 4 &&
        /FY2026 Corporate Fund projected gap/.test(g.fiscal_year_or_basis),
    )!;
    expect(targetAmount("near_term")).toBe(ey.amount);
  });

  test("durable reads CFFTF p5 $680M", () => {
    const c = structuralGap().find((g) => g.source_body === "CFFTF" && g.page === 5)!;
    expect(targetAmount("durable")).toBe(c.amount);
  });

  test("stretch reads the high end of the CFFTF p10 range ($780M)", () => {
    const c = structuralGap().find(
      (g) =>
        g.source_body === "CFFTF" &&
        g.page === 10 &&
        typeof g.amount === "object",
    )!;
    expect(targetAmount("stretch")).toBe((c.amount as { high: number }).high);
  });
});

describe("gapClosedPct", () => {
  test("is gap_progress / target amount", () => {
    const t = targetAmount("near_term");
    expect(gapClosedPct(state("near_term", t / 2, []))).toBeCloseTo(0.5, 6);
  });
});

describe("oneTimeShare (SPEC §6/§9)", () => {
  // All dollars traced to real options by id; the expected ratio is derived from
  // those same figures, never hardcoded.
  const annualD = realizedBase(getOption("reinstitute-head-tax")); // annual
  const oneTimeD = realizedBase(getOption("declare-maximum-tif-surplus")); // one_time
  const pvD = realizedBase(getOption("ey-realestate-sell-industrial-buildings")); // ten_year_pv
  const upfrontD = realizedBase(getOption("rent-opsa-regional-training-facility")); // upfront_cost

  test("one_time + ten_year_pv over all banked except upfront_cost", () => {
    const banked = [
      outcome(annualD, "annual"),
      outcome(oneTimeD, "one_time"),
      outcome(pvD, "ten_year_pv"),
    ];
    const expected = (oneTimeD + pvD) / (annualD + oneTimeD + pvD);
    expect(oneTimeShare(state("near_term", 0, banked))).toBeCloseTo(expected, 6);
  });

  test("upfront_cost is excluded from BOTH numerator and denominator", () => {
    const banked = [outcome(annualD, "annual"), outcome(upfrontD, "upfront_cost")];
    // numerator 0; denominator excludes the upfront_cost => 0
    expect(oneTimeShare(state("near_term", 0, banked))).toBeCloseTo(0, 6);
  });

  test("no banked dollars → well-defined 0 (not NaN)", () => {
    expect(oneTimeShare(state("near_term", 0, []))).toBe(0);
  });
});

describe("evaluateEnding branch table (SPEC §9)", () => {
  const t = targetAmount("near_term");

  test("< 50% closed → Crisis Deepens", () => {
    expect(evaluateEnding(state("near_term", t * 0.4, [outcome(t * 0.4, "annual")]))).toBe(
      "Crisis Deepens",
    );
  });

  test("50–99% closed → Midnight Budget Standoff", () => {
    expect(evaluateEnding(state("near_term", t * 0.75, [outcome(t * 0.75, "annual")]))).toBe(
      "Midnight Budget Standoff",
    );
  });

  test(">=100% with one_time_share >= 40% → Kicked the Can", () => {
    const banked = [outcome(t * 0.5, "annual"), outcome(t * 0.5, "one_time")];
    expect(evaluateEnding(state("near_term", t, banked, { equity: 10 }))).toBe(
      "Kicked the Can",
    );
  });

  test(">=100%, low one-time, equity <= -40 → The Austerity Mayor", () => {
    const banked = [outcome(t, "annual")];
    expect(evaluateEnding(state("near_term", t, banked, { equity: -50 }))).toBe(
      "The Austerity Mayor",
    );
  });

  test(">=100%, low one-time, equity ok, political_capital <= 20 → The Lame-Duck Reformer", () => {
    const banked = [outcome(t, "annual")];
    expect(
      evaluateEnding(state("near_term", t, banked, { equity: 10, political_capital: 15 })),
    ).toBe("The Lame-Duck Reformer");
  });

  test(">=100% structural-sound path → The Structural Reformer", () => {
    const banked = [outcome(t, "annual")];
    expect(
      evaluateEnding(
        state("near_term", t, banked, {
          equity: 10,
          political_capital: 60,
          long_term_health: 40,
        }),
      ),
    ).toBe("The Structural Reformer");
  });

  test(">=100% middling → The Pragmatist", () => {
    const banked = [outcome(t, "annual")];
    expect(
      evaluateEnding(
        state("near_term", t, banked, {
          equity: 10,
          political_capital: 60,
          long_term_health: 10,
        }),
      ),
    ).toBe("The Pragmatist");
  });
});
