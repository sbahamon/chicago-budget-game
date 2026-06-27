// All player-facing mayor-mode copy lives here, kept apart from the engine so v2
// (Chicagoan mode) swaps a view + this copy, not the engine. No dollar figures —
// every number the player sees comes from the engine/data at render time.

import type { Target } from "../engine/types";
import type { Variant } from "../engine/realize";
import type { DialLevel } from "../engine/decisions";
import type { Ending } from "../engine/endings";

export const TITLE = "Chicago Budget Game";
export const SUBTITLE = "You are the Mayor. Close the structural budget gap.";

export const METER_LABELS = {
  gap_progress: "Gap closed",
  political_capital: "Political capital",
  equity: "Equity",
  long_term_health: "Long-term health",
} as const;

export const TARGET_COPY: Record<Target, { name: string; blurb: string }> = {
  near_term: {
    name: "Near-term (FY2026)",
    blurb:
      "Close the one-year gap. One-time fixes and recurring reforms both count — but lean on plugs and the gap returns next year.",
  },
  durable: {
    name: "Durable (FY2027)",
    blurb:
      "Only recurring reforms count. One-time plugs don't help. Harder, but it actually fixes the structural gap.",
  },
  stretch: {
    name: "Stretch (FY2027)",
    blurb: "Recurring only, at the high end of the long-term gap. The toughest target.",
  },
};

export const VARIANT_LABELS: Record<Variant, string> = {
  base: "Adopt as recommended",
  scaled_back: "Scale it back",
  push_harder: "Push it further",
  defer: "Study it & delay",
  opposing_max: "Go all in",
  opposing_zero: "Hold the line",
};

export const DIAL_LEVEL_LABELS: Record<DialLevel, string> = {
  low: "Modest",
  med: "Moderate",
  high: "Aggressive",
};

export const DIAL_TITLES: Record<string, string> = {
  fees_fines: "Fees & Fines",
  personnel_benefits: "Personnel & Benefits",
  operations_efficiency: "Operations & Org Efficiency",
};

export const DIAL_BLURBS: Record<string, string> = {
  fees_fines: "Adjust the city's fees, fines, and cost-recovery programs.",
  personnel_benefits: "Tighten personnel costs and employee-benefit design.",
  operations_efficiency: "Consolidate operations and cut organizational overhead.",
};

export const ENDING_COPY: Record<Ending, string> = {
  "Crisis Deepens":
    "You closed less than half the gap. The city slides deeper into crisis.",
  "Midnight Budget Standoff":
    "Close, but not closed. The budget stalls in a midnight standoff — a near miss.",
  "Kicked the Can":
    "Balanced on paper — but on one-time plugs. The structural gap returns in FY2027.",
  "The Austerity Mayor":
    "Balanced on the backs of the most vulnerable. The numbers work; the city is angry.",
  "The Lame-Duck Reformer":
    "Structurally sound — but your governing coalition collapsed getting there.",
  "The Structural Reformer":
    "Balanced, durable, fair, and politically survivable. A genuinely structural fix. (Gold.)",
  "The Pragmatist":
    "A solid, middling budget. Not a triumph, not a disaster — you governed.",
};

export const UI = {
  chooseTarget: "Choose your difficulty",
  start: "Take office",
  decisionOf: (i: number, n: number) => `Decision ${i} of ${n}`,
  whoAffected: "Who's affected",
  feasibility: "Feasibility",
  dissent: "Dissent",
  banked: "Your decisions so far",
  seeEnding: "See how it ends",
  playAgain: "Play again",
  source: "Source",
} as const;
