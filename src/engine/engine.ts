// SPEC §3/§5 — the public engine API. Pure, deterministic, DOM-free,
// persona-agnostic. v1 mayor mode and v2 Chicagoan mode share this exact engine;
// only the view differs.

import { getOption, stateStatus } from "./data";
import { realizeDollar, countsToward, atRiskDollar } from "./realize";
import {
  availableDecisions,
  getDecision,
  leverVariants,
  dialBand,
  type Decision,
  type DialLevel,
} from "./decisions";
import { meterLeverDeltas, meterDialDeltas } from "./meters";
import { evaluateEnding } from "./endings";
import type {
  Basis,
  GameState,
  LeverOutcome,
  Meters,
  Option,
  Target,
} from "./types";
import type { Variant } from "./realize";

export { availableDecisions, getDecision, evaluateEnding };
export type { Decision };

const STARTING_METERS: Meters = {
  gap_progress: 0,
  political_capital: 100,
  equity: 0,
  long_term_health: 0,
};

/** Begin a new game at a difficulty target (SPEC §2/§8 starting meters). */
export function createGame(target: Target): GameState {
  return { target, banked: [], meters: { ...STARTING_METERS } };
}

function leverBasis(option: Option): Basis {
  return option.verify.figure?.basis ?? "annual";
}

function provenanceOf(option: Option) {
  return {
    option_id: option.id,
    report: option.report,
    page: option.page,
    verbatim_anchor: option.verbatim_anchor,
  };
}

function buildLeverOutcome(
  decisionId: string,
  option: Option,
  variant: Variant,
): LeverOutcome {
  const basis = leverBasis(option);
  const dollar = realizeDollar(option, variant);
  const stateDependent = stateStatus(option.id) === "state";
  const atRisk = atRiskDollar(option, dollar); // 0 for City-controlled levers
  const meter = meterLeverDeltas({
    direction: getDecisionDirection(decisionId),
    leverType: option.lever_type,
    variant,
    basis,
    realizedDollar: dollar,
    stateDependent,
  });
  return {
    decision_id: decisionId,
    option_id: option.id,
    choice: variant,
    dollar_impact: dollar,
    at_risk_dollars: atRisk,
    basis,
    counts_toward: countsToward(basis),
    affected_groups: option.who_is_affected,
    meter_deltas: { gap_progress: 0, ...meter },
    provenance: provenanceOf(option),
  };
}

function getDecisionDirection(decisionId: string) {
  const d = getDecision(decisionId);
  return d.kind === "lever" ? d.direction : null;
}

function buildDialOutcomes(
  dialId: string,
  level: DialLevel,
): LeverOutcome[] {
  const band = dialBand(dialId, level);
  const meter = meterDialDeltas({ level, oneTimeDollar: band.oneTime });
  const provenance = {
    option_id: dialId,
    report: "(domain dial)",
    page: 0,
    verbatim_anchor: band.memberIds.join(", "),
  };

  const recurring: LeverOutcome = {
    decision_id: dialId,
    option_id: dialId,
    choice: level,
    dollar_impact: band.recurring,
    basis: "annual",
    counts_toward: countsToward("annual"),
    affected_groups: "",
    meter_deltas: { gap_progress: 0, ...meter },
    provenance,
  };

  const outcomes = [recurring];
  if (band.oneTime > 0) {
    outcomes.push({
      decision_id: dialId,
      option_id: dialId,
      choice: level,
      dollar_impact: band.oneTime,
      basis: "one_time",
      counts_toward: countsToward("one_time"),
      affected_groups: "",
      // meter delta already carried by the recurring outcome (no double-count)
      meter_deltas: { gap_progress: 0, political_capital: 0, equity: 0, long_term_health: 0 },
      provenance,
    });
  }
  return outcomes;
}

const DIAL_LEVELS: ReadonlySet<string> = new Set(["low", "med", "high"]);

/**
 * Apply one mayor decision and return the next state plus the emitted outcome(s).
 * Levers emit one outcome; dials emit a recurring outcome and (when present) a
 * one-time outcome, since the two count toward different targets (SPEC §6).
 */
export function applyChoice(
  state: GameState,
  decisionId: string,
  choice: string,
): { state: GameState; outcomes: LeverOutcome[] } {
  const decision: Decision = getDecision(decisionId);

  let outcomes: LeverOutcome[];
  if (decision.kind === "lever") {
    const allowed = leverVariants(decision.direction);
    if (!allowed.includes(choice as Variant)) {
      throw new Error(`Invalid choice "${choice}" for lever ${decisionId}`);
    }
    outcomes = [buildLeverOutcome(decisionId, getOption(decision.optionId), choice as Variant)];
  } else {
    if (!DIAL_LEVELS.has(choice)) {
      throw new Error(`Invalid level "${choice}" for dial ${decisionId}`);
    }
    outcomes = buildDialOutcomes(decisionId, choice as DialLevel);
  }

  // Fold outcomes into a fresh state (pure — never mutate the input).
  const meters: Meters = { ...state.meters };
  for (const o of outcomes) {
    if (o.counts_toward.includes(state.target)) {
      // Only confirmed dollars accrue; a State-dependent lever's at-risk share is
      // pending Springfield and does not count toward the gap (E1).
      const counted = o.dollar_impact - (o.at_risk_dollars ?? 0);
      meters.gap_progress += counted;
      o.meter_deltas.gap_progress = counted;
    }
    meters.political_capital += o.meter_deltas.political_capital;
    meters.equity += o.meter_deltas.equity;
    meters.long_term_health += o.meter_deltas.long_term_health;
  }

  return {
    state: { target: state.target, banked: [...state.banked, ...outcomes], meters },
    outcomes,
  };
}

/**
 * Play every decision in the fixed sequence, choosing via `choose`, and return
 * the final state. Used by full-playthrough tests and by the view's auto-paths.
 */
export function playThrough(
  start: GameState,
  choose: (decision: Decision) => string,
): GameState {
  let state = start;
  for (const decision of availableDecisions()) {
    state = applyChoice(state, decision.id, choose(decision)).state;
  }
  return state;
}
