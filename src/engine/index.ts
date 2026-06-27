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
export { directionFor, getOption, structuralGap } from "./data";
export { targetAmount, gapClosedPct, oneTimeShare } from "./endings";
export type { Ending } from "./endings";
export type { Variant } from "./realize";
