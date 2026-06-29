// All player-facing mayor-mode copy lives here, kept apart from the engine so v2
// (Chicagoan mode) swaps a view + this copy, not the engine. No dollar figures —
// every number the player sees comes from the engine/data at render time.

import type { Target, Direction } from "../engine/types";
import type { Variant } from "../engine/realize";
import type { DialLevel } from "../engine/decisions";
import type { Ending } from "../engine/endings";

export const TITLE = "Chicago Budget Game";
export const SUBTITLE = "You are the Mayor. Close the structural budget gap.";
export const MASTHEAD_EYEBROW = "Office of the Mayor · City of Chicago";

export const METER_LABELS = {
  gap_progress: "Gap closed",
  political_capital: "Political capital",
  equity: "Equity",
  long_term_health: "Long-term health",
} as const;

// Plain-language gauge explanations (faithful to engine behavior; no figures).
export const METER_HELP: Record<keyof typeof METER_LABELS, string> = {
  gap_progress: "How much of the target your choices have closed so far.",
  political_capital:
    "Your governing coalition. Every decision spends some; the bruising fights cost more.",
  equity:
    "Who bears the cost. Regressive choices push it down; progressive ones lift it up.",
  long_term_health:
    "Structural durability. Recurring reforms build it; one-time plugs erode it.",
};

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

// --- V1: dissents as characters ---------------------------------------------
// Speakers are FICTIONAL, generic archetypes — never named after, nor written to
// resemble, real CFFTF task-force members. The archetype is the delivery wrapper;
// the *argument* is always the option's real, cited dissent_summary (see
// narrative.dissentSpeech). Never put words in a real person's mouth.
export interface Character {
  archetype: string;
  role: string;
}

export const CHARACTERS: Record<Direction, Character> = {
  too_far: {
    archetype: "A fiscal hawk on the task force",
    role: "warns this one reaches too far",
  },
  alternative_or_caution: {
    archetype: "A cautious analyst on the task force",
    role: "wants a closer look before you commit",
  },
  opposing_both: {
    archetype: "Two camps on the task force",
    role: "pulling in opposite directions",
  },
  not_far_enough: {
    archetype: "A reformer on the task force",
    role: "says this is too timid",
  },
};

// Choice-button copy reframed as taking a side on the dissent. Keyed by direction;
// "none" covers an uncontested lever. Only the variants a direction actually offers
// (see engine leverVariants) need a label.
export const CHOICE_LABELS: Record<Direction | "none", Partial<Record<Variant, string>>> = {
  too_far: {
    base: "Overrule them — adopt as recommended",
    scaled_back: "Side with them — scale it back",
  },
  alternative_or_caution: {
    base: "Overrule them — adopt it now",
    defer: "Side with them — study it & delay",
  },
  opposing_both: {
    opposing_max: "Go all in",
    opposing_zero: "Hold the line",
  },
  not_far_enough: {
    base: "Adopt as recommended",
    push_harder: "Side with them — push it further",
  },
  none: {
    base: "Adopt as recommended",
    defer: "Pass — set it aside",
  },
};

// --- V2: second-order consequence lines -------------------------------------
// Plain-language meaning of a choice, selected by basis + whether it counts toward
// the chosen target. No numeric literals — figures arrive via formatUSD elsewhere.
export const CONSEQUENCE = {
  recurring: "A recurring fix — it keeps working year after year.",
  one_time_counts:
    "A one-time fix — it plugs this year's gap, but the gap reopens next year.",
  one_time_no_count:
    "Under this target, one-time money doesn't count toward your gap.",
  upfront_cost: "An upfront cost — you spend now to set up future savings.",
} as const;

// --- V3: dramatized gap + near-miss -----------------------------------------
// Shown on the ending; numbers are passed in pre-formatted (formatUSD / percent).
export const SHORTFALL_LINE = (ctx: { pct: string; short: string }): string =>
  `You closed ${ctx.pct} of the gap — ${ctx.short} short.`;

// Extra dramatization layered on top of ENDING_COPY, by ending name.
export const ENDING_DRAMA: Partial<Record<Ending, string>> = {
  "Midnight Budget Standoff":
    "You refused to balance the books on the backs of the most vulnerable — and it cost you the gap. So close.",
  "Crisis Deepens": "The shortfall swallows the room. There was no plan B.",
  "Kicked the Can": "It balances tonight. Next year's mayor inherits the same hole.",
};

// --- V4: arc / acts ----------------------------------------------------------
// Opening stakes screen. The gap figure is passed in pre-formatted from the
// SELECTED target (formatUSD(targetAmount(target))) — never hardcoded.
export const INTRO = (gap: string): string =>
  `It's budget season. You take office facing a ${gap} structural hole. ` +
  `Eighteen decisions stand between you and a balanced budget. Choose.`;

export interface Act {
  number: number;
  title: string;
  blurb: string;
  /** First decision index (0-based, inclusive) covered by this act. */
  start: number;
}

// Contiguous partition of the fixed 18-decision sequence (15 levers then 3 dials).
// Order is never changed; acts are pure view grouping. `start` indices ascend.
export const ACTS: Act[] = [
  { number: 1, title: "The Big Levers", blurb: "Pensions and the largest revenue moves.", start: 0 },
  { number: 2, title: "Taxes & TIF", blurb: "Property tax, the head tax, and the TIF question.", start: 5 },
  { number: 3, title: "Hard Choices", blurb: "Where the politics — and the values — get loud.", start: 10 },
  { number: 4, title: "Turning the Dials", blurb: "Fees, personnel, and operating efficiency.", start: 15 },
];

// Map/ledger status wording, keyed by choiceStatus.
export const STATUS_LABELS = {
  adopted: "Adopted",
  scaled: "Scaled back",
  passed: "Passed",
  undecided: "Not yet decided",
} as const;

export const UI = {
  chooseTarget: "Choose your difficulty",
  start: "Take office",
  begin: "Take office →",
  continueAct: "Continue →",
  stillToClose: "Still to close",
  gaugesTitle: "Your four gauges",
  decisionOf: (i: number, n: number) => `Decision ${i} of ${n}`,
  whoAffected: "Who's affected",
  feasibility: "Feasibility",
  dissent: "Dissent",
  banked: "Your decisions so far",
  mapTitle: "Your budget plan",
  adoptedHead: "Adopted",
  scaledHead: "Scaled back",
  passedHead: "Passed on",
  back: "← Back",
  next: "Next →",
  seeEnding: "See how it ends",
  reviseChoices: "← Revise choices",
  playAgain: "Play again",
  source: "Source",
} as const;
