// Core engine types. Pure data shapes — no DOM, no player-facing copy.

/** Difficulty target ids (SPEC §2). */
export type Target = "near_term" | "durable" | "stretch";

/** How a dollar figure is stated, driving counting + realization (SPEC §6). */
export type Basis =
  | "annual"
  | "one_time"
  | "upfront_cost"
  | "ten_year_cumulative"
  | "ten_year_pv";

/** Dissent direction, derived from verify.dissent_taxonomy (SPEC §4). */
export type Direction =
  | "too_far"
  | "not_far_enough"
  | "alternative_or_caution"
  | "opposing_both";

/** A {low, high} dollar range as stored in the data. */
export interface DollarRange {
  low: number;
  high: number;
}

/** dollar_estimate as it appears in the data: point, range, or absent. */
export type DollarEstimate = number | DollarRange | null;

/** verify.figure block (subset the engine consumes; extra fields allowed). */
export interface VerifyFigure {
  basis: Basis;
  annual_equivalent: number | null;
  annual_equivalent_approx?: boolean;
  dollar_estimate: DollarEstimate;
  [key: string]: unknown;
}

/** Per-option verify block (subset consumed; extra fields allowed). */
export interface VerifyBlock {
  domain: string;
  contested: boolean;
  leverage_tier: string;
  figure: VerifyFigure | null;
  [key: string]: unknown;
}

/** One reform/revenue/savings option from sources.enriched.json. */
export interface Option {
  id: string;
  name: string;
  source_body: string;
  report: string;
  page: number;
  lever_type: string;
  timing: string;
  dollar_estimate: DollarEstimate;
  unit: string | null;
  who_is_affected: string;
  feasibility_note: string;
  has_dissent: boolean;
  dissent_summary: string | null;
  verbatim_anchor: string;
  verify: VerifyBlock;
  [key: string]: unknown;
}

/** verify.overlap_groups[] entry (SPEC §7b dedup). */
export interface OverlapGroup {
  kind: string;
  member_ids: string[];
  name: string;
  citation: string;
  rationale: string;
}

/** A structural_gap[] entry (SPEC §2 difficulty targets cite these). */
export interface StructuralGap {
  amount: number | DollarRange | string;
  fiscal_year_or_basis: string;
  page: number;
  report: string;
  source_body: string;
  verbatim_anchor: string;
}

/** The four meters (SPEC §8). gap_progress is dollars; the rest are scores. */
export interface Meters {
  gap_progress: number;
  political_capital: number;
  equity: number;
  long_term_health: number;
}

/** A meter movement (no gap_progress; that comes from realized dollars). */
export interface MeterDelta {
  political_capital: number;
  equity: number;
  long_term_health: number;
}

/** No-invented-numbers traceability for a banked outcome (SPEC §5). */
export interface Provenance {
  option_id: string;
  report: string;
  page: number;
  verbatim_anchor: string;
}

/** A structured outcome emitted by the engine for one banked choice (SPEC §5). */
export interface LeverOutcome {
  decision_id: string;
  option_id: string;
  choice: string;
  dollar_impact: number;
  /**
   * Of `dollar_impact`, the dollars NOT counted toward the gap because the lever
   * needs Springfield/Illinois action (E1). 0 for City-controlled levers and dials.
   * gap_progress accrues `dollar_impact - at_risk_dollars`.
   */
  at_risk_dollars?: number;
  basis: Basis;
  counts_toward: Target[];
  affected_groups: string;
  meter_deltas: Meters;
  provenance: Provenance;
}

/** Running game state (SPEC §5). */
export interface GameState {
  target: Target;
  banked: LeverOutcome[];
  meters: Meters;
}
