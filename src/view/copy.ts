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

// --- State friction (V1): who actually controls a lever ----------------------
// Surfaces the data's own feasibility language — several of the biggest levers
// need Springfield/Illinois action and aren't the City's to pull alone. The chips
// label it; the line explains it. No figures (the at-risk dollars arrive via the
// engine's at_risk_dollars and formatUSD at render time).
export const STATE_CHIPS = {
  state: "⚠ Needs Springfield",
  mixed: "◑ Partly Springfield",
} as const;

export const STATE_FRICTION = {
  state:
    "Not yours to pull alone — this needs the Illinois General Assembly to act, so part of the money is at risk until Springfield moves.",
  mixed:
    "Shared jurisdiction — the City can act, but the State has a hand in how far this one goes.",
} as const;

// --- Meter cliff warnings (V3): make the thresholds visible ------------------
// Keyed `${meter}_${level}`; surfaced when a meter crosses a §9 ending threshold.
// These describe the existing ending branches; they introduce no new numbers.
export const WARNINGS = {
  political_capital_warn: "Your governing coalition is fracturing.",
  political_capital_danger: "Your coalition is collapsing — you're becoming a lame duck.",
  equity_danger: "You're balancing the budget on the backs of the most vulnerable.",
} as const;

// --- Post-choice consequence bite (V2): a beat that lands AFTER the choice ----
// Selected from the engine's emitted LeverOutcome (basis/counts, at_risk, branch).
// Paraphrases the data's framing; carries no figures.
export const BITE = {
  no_count:
    "That plugs nothing toward a durable fix — under this target, the gap doesn't move at all.",
  state_at_risk:
    "Springfield hasn't signed off — part of this money is at risk and isn't counting yet.",
  opposing: "You picked a side — one camp gets what it wanted, the other is furious.",
  regressive: "The bill for this lands on those least able to pay it.",
  structural: "A structural fix — this one keeps working long after you leave office.",
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

// --- Splash / honesty screen (the landing) ----------------------------------
// First-person, transparent: this is a GAME and a simplified model. The numbers
// in the body lines are INJECTED at render from splashFacts() — the prose strings
// stay digit-free so the no-invented-numbers guard keeps passing, and the counts
// can never drift from the data. `import type { SplashFacts }` is the shape passed
// to the template lines.
import type { SplashFacts } from "./narrative";

export const SPLASH = {
  eyebrow: "A note before you start",
  title: "This is a game.",
  lede:
    "It's a simplified model of a real problem — the structural gap in Chicago's city budget. It's a way to feel the hard trade-offs the city budget recommendations have, and to decide, choice by choice, which ones you'd actually make.",

  realHead: "The money is real. The scoring is not.",
  realBody: (f: SplashFacts): string =>
    `Every dollar figure comes from ${f.reports} official reports on the city's finances and ${f.options} reform options I verified against them. But the ${f.meters} meters — and how much each choice costs you in political capital, equity, and long-term health — are a layer I added to make the trade-offs legible. Reasonable people would weight them differently.`,

  compressHead: "What I compressed.",
  compressBody: (f: SplashFacts): string =>
    `Those ${f.options} options become ${f.decisions} decisions — the rest are grouped into broad dials or left out. Dollar ranges are taken at their midpoint; ten-year figures are annualized. You are one mayor, in one budget year, with no City Council, no courts, and no negotiation beyond the meters.`,

  layeredHead: "What I layered on top.",
  layeredBody: (f: SplashFacts): string =>
    `Some of the biggest levers aren't the City's to pull alone — ${f.stateLevers} of them need Springfield. The reports say so; the game turns that into a risk, where those levers only partly count until the State acts. The size of that haircut, the meter weights, and the ${f.endings} possible endings are my game design, not findings from the reports.`,

  faithfulHead: "What I kept faithful.",
  faithfulBody: (f: SplashFacts): string =>
    `When a task-force member objected to an option, you hear that objection — quoted and cited to a page. The ${f.dissents} dissents in the game are real arguments; only the voice delivering them is a fictional stand-in. No words are ever put in a real person's mouth.`,

  pointHead: "The point.",
  pointBody:
    "There is no perfect budget in here. Every path that closes the gap changes something of the Chicago we know today. You decide what's worth it.",

  numbersLabel: "By the numbers",
  // Stat strip; each value is filled from splashFacts at render (no literals here).
  stats: [
    { key: "reports", label: "source reports" },
    { key: "options", label: "verified options" },
    { key: "dissents", label: "real dissents" },
    { key: "decisions", label: "decisions you make" },
    { key: "meters", label: "meters (1 is real $)" },
    { key: "endings", label: "possible endings" },
  ] as const,

  sourcesLabel: "Built from",
  sources: [
    "Chicago's Fiscal Futures Task Force — Interim & Final Reports",
    "EY — Financial & Strategic Reform Options",
  ],

  byline: "Built by Steffany Bahamon",
  bylineNote: "A data-grounded portfolio piece. The engine and every figure are open to inspection.",
  links: [
    { label: "Website", href: "https://sbahamon.github.io/" },
    { label: "GitHub", href: "https://github.com/sbahamon" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/steffanybahamon/" },
  ],

  cta: "Take office →",
} as const;

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
  pendingSpringfield: "At risk, pending Springfield",
} as const;
