import { describe, expect, test } from "vitest";
import { getOption } from "../../src/engine/data";
import { realizeDollar, atRiskDollar } from "../../src/engine/realize";
import {
  availableDecisions,
  dialBand,
  type Decision,
} from "../../src/engine/decisions";
import {
  createGame,
  applyChoice,
  playThrough,
  evaluateEnding,
} from "../../src/engine/engine";
import { targetAmount, gapClosedPct, oneTimeShare } from "../../src/engine/endings";
import type { GameState, LeverOutcome, Target } from "../../src/engine/types";
import humaneGolden from "../fixtures/humane-ceiling.json";

const EPS = 1; // dollars; bands are integral or half-dollar, so 1 is generous
const TARGETS: Target[] = ["near_term", "durable", "stretch"];

// --- Aggressive path: maximize dollars (SPEC §7d / §11) ----------------------
function aggressiveChoice(d: Decision): string {
  if (d.kind === "dial") return "high";
  return d.direction === "opposing_both" ? "opposing_max" : "base";
}

describe("aggressive path closes every target (SPEC §11)", () => {
  for (const target of TARGETS) {
    test(`${target}: gap_closed_pct >= 100%`, () => {
      const final = playThrough(createGame(target), aggressiveChoice);
      expect(gapClosedPct(final)).toBeGreaterThanOrEqual(1.0);
    });
  }

  test("near-term total equals the data-derived §7d oracle (engine math == spec math)", () => {
    // Independently recompute the aggressive near-term total from the data by id,
    // using the documented realization. Cross-check (SPEC §7d): ~$1.758B.
    let expected = 0;
    for (const d of availableDecisions()) {
      if (d.kind === "lever") {
        const option = getOption(d.optionId);
        const realized = realizeDollar(option, aggressiveChoice(d) as never);
        // Only the confirmed (non-at-risk) share of a State-dependent lever counts (E1).
        expected += realized - atRiskDollar(option, realized);
      } else {
        const band = dialBand(d.id, "high");
        expected += band.recurring + band.oneTime; // both count toward near_term
      }
    }
    const final = playThrough(createGame("near_term"), aggressiveChoice);
    expect(final.meters.gap_progress).toBeCloseTo(expected, EPS);
    // sanity: the oracle is comfortably above the $1.15B near-term target
    expect(expected).toBeGreaterThan(targetAmount("near_term"));
  });
});

// --- Humane path: equity-maximizing, characterized then pinned (SPEC §11) -----
function humaneChoice(d: Decision): string {
  if (d.kind === "dial") return "low";
  if (d.direction === "opposing_both") return "opposing_zero"; // placate vulnerable
  if (d.direction === "too_far") return "scaled_back";
  return "base"; // alt/caution & structural base equity >= 0; null → base
}

describe("humane path ceiling (characterization / golden — SPEC §11)", () => {
  test("near-term humane path matches the pinned golden ceiling", () => {
    const final = playThrough(createGame("near_term"), humaneChoice);
    const closed = gapClosedPct(final);
    const ending = evaluateEnding(final);
    expect(ending).toBe(humaneGolden.ending);
    expect(closed).toBeCloseTo(humaneGolden.gap_closed_pct, 4);
  });

  test("the humane path deliberately falls short — does NOT close the gap", () => {
    const final = playThrough(createGame("near_term"), humaneChoice);
    expect(gapClosedPct(final)).toBeLessThan(1.0);
  });
});

// --- upfront_cost guard (SPEC §6/§9/§11) -------------------------------------
function outcome(dollar: number, basis: LeverOutcome["basis"]): LeverOutcome {
  return {
    decision_id: "x",
    option_id: "x",
    choice: "base",
    dollar_impact: dollar,
    basis,
    counts_toward: basis === "annual" ? ["near_term", "durable", "stretch"] : ["near_term"],
    affected_groups: "",
    meter_deltas: { gap_progress: 0, political_capital: 0, equity: 0, long_term_health: 0 },
    provenance: { option_id: "x", report: "", page: 0, verbatim_anchor: "" },
  };
}

describe("upfront_cost guard — one_time_share stays well-defined (SPEC §11)", () => {
  test("a real upfront_cost option banked alongside plugs keeps one_time_share in [0,1]", () => {
    const upfront = getOption("rent-opsa-regional-training-facility");
    expect(upfront.verify.figure!.basis).toBe("upfront_cost");
    // All dollars traced to real options by id; expected ratio derived, not hardcoded.
    const annualD = realizeDollar(getOption("reinstitute-head-tax"), "base"); // annual
    const oneTimeD = realizeDollar(getOption("declare-maximum-tif-surplus"), "base"); // one_time
    const upfrontD = realizeDollar(upfront, "base"); // negative cost

    const state: GameState = {
      target: "near_term",
      banked: [
        outcome(annualD, "annual"),
        outcome(oneTimeD, "one_time"),
        outcome(upfrontD, "upfront_cost"),
      ],
      meters: {
        gap_progress: annualD + oneTimeD + upfrontD,
        political_capital: 100,
        equity: 0,
        long_term_health: 0,
      },
    };

    const share = oneTimeShare(state);
    expect(Number.isFinite(share)).toBe(true);
    expect(share).toBeGreaterThanOrEqual(0);
    expect(share).toBeLessThanOrEqual(1);
    // upfront_cost excluded from both sides: oneTimeD / (annualD + oneTimeD)
    expect(share).toBeCloseTo(oneTimeD / (annualD + oneTimeD), 6);
  });
});
