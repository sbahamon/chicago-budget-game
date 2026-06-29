// Public engine barrel — the entire surface a view (mayor or v2 Chicagoan) needs.
// Pure, DOM-free, persona-agnostic.

export * from "./types";
export {
  createGame,
  applyChoice,
  playThrough,
  availableDecisions,
  getDecision,
  evaluateEnding,
} from "./engine";
export type { Decision, LeverDecision, DialDecision, DialLevel } from "./decisions";
export { leverVariants, dialBand, dialMembers, DIAL_IDS } from "./decisions";
export { directionFor, getOption, structuralGap, stateStatus, allOptions } from "./data";
export type { StateStatus } from "./data";
export { targetAmount, gapClosedPct, oneTimeShare, ENDING_THRESHOLDS } from "./endings";
export type { Ending } from "./endings";
export type { Variant } from "./realize";
// Pure re-export only (no logic change): lets the view say whether a choice's
// basis counts toward the selected target, without reimplementing engine logic.
export { countsToward } from "./realize";
