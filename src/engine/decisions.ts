// SPEC §7 — the fixed v1 mayor-mode decision set: 15 standalone levers + 3 domain
// dials. Config is option ids + structure only; every dollar is computed from the
// data via realize.ts (no money literals here).

import { allOptions, getOption, overlapGroups } from "./data";
import { realizedBase } from "./realize";
import type { Basis, Direction, Option } from "./types";
import type { Variant } from "./realize";

export type DialLevel = "low" | "med" | "high";

export interface LeverDecision {
  kind: "lever";
  id: string;
  optionId: string;
  contested: boolean;
  direction: Direction | null;
}

export interface DialDecision {
  kind: "dial";
  id: string;
  domain: string;
}

export type Decision = LeverDecision | DialDecision;

// --- Standalone levers (SPEC §7a, in spec order) -----------------------------
const LEVER_IDS: readonly string[] = [
  "cfftf-ltl-secure-cps-pension-contributions",
  "cfftf-re-increase-lgdf-share-rate",
  "cfftf-re-expand-sales-tax-base-consumer-services",
  "expand-congestion-surcharge-rideshare",
  "ey-procurement-category-management",
  "adjust-city-property-tax",
  "reinstitute-head-tax",
  "establish-autonomous-taxi-framework",
  "favor-natural-expiration-of-tifs",
  "declare-maximum-tif-surplus",
  "disband-cpd-mounted-unit",
  "increase-autonomous-drones-cpd",
  "cfftf-ltl-advanced-supplemental-payment",
  "institute-vacancy-freeze",
  "optimize-real-estate-portfolio",
];

// --- Domain dials (SPEC §7b) -------------------------------------------------
export const DIAL_IDS = [
  "fees_fines",
  "personnel_benefits",
  "operations_efficiency",
] as const;
export type DialId = (typeof DIAL_IDS)[number];

const LADDER: readonly string[] = ["small", "medium", "large", "mega"];

// Overlap-group representations to KEEP; every other group member is dropped from
// the dials (SPEC §7b dedup table). The benefits grouping layer = 5 CFFTF Interim
// recs; the EY granular rows are the dropped layer.
const DEDUP_KEEP: ReadonlySet<string> = new Set([
  "ey-special-events-cost-recovery-program",
  "explore-employee-contribution-opportunities",
  "identify-cost-saving-options-not-covered-by-cbas",
  "explore-healthcare-plan-design",
  "explore-pbm-carrier-cost-savings",
  "assess-loa-health-coverage-continuation",
]);

// Manual carve-outs: vehicle-sticker is a Vehicle-Fund line (not Corporate);
// vacancy-freeze is surfaced as standalone lever #14 (SPEC §7a/§7b).
const DIAL_CARVE_OUT: ReadonlySet<string> = new Set([
  "ey-fees-vehicle-sticker-tax",
  "institute-vacancy-freeze",
]);

const DEDUP_DROP: ReadonlySet<string> = (() => {
  const drop = new Set<string>();
  for (const g of overlapGroups())
    for (const m of g.member_ids) if (!DEDUP_KEEP.has(m)) drop.add(m);
  return drop;
})();

function isRecurringBasis(basis: Basis): boolean {
  return basis === "annual" || basis === "ten_year_cumulative";
}
function isOneTimeBasis(basis: Basis): boolean {
  return basis === "one_time" || basis === "ten_year_pv";
}

/** Priced, deduped, carve-out-filtered options for a dial's domain. */
function dialPool(domain: string): Option[] {
  return allOptions().filter(
    (o) =>
      o.verify.domain === domain &&
      o.verify.figure !== null &&
      !DEDUP_DROP.has(o.id) &&
      !DIAL_CARVE_OUT.has(o.id),
  );
}

/**
 * Member ids selected by a dial at a given level (SPEC §7b banding):
 * uncontested options occupy ladder tiers (empty leading tiers collapse); LOW =
 * first occupied tier, MED = first two, HIGH = all tiers + every contested member.
 * Returns the member ids split by recurring vs one-time basis.
 */
export function dialMembers(
  dialId: string,
  level: DialLevel,
): { all: string[]; recurring: string[]; oneTime: string[] } {
  const pool = dialPool(dialId);
  const contested = pool.filter((o) => o.verify.contested);
  const uncontested = pool.filter((o) => !o.verify.contested);

  const occupied = LADDER.filter((tier) =>
    uncontested.some((o) => o.verify.leverage_tier === tier),
  );
  const tierOptions = (i: number): Option[] =>
    i < occupied.length
      ? uncontested.filter((o) => o.verify.leverage_tier === occupied[i])
      : [];

  let selected: Option[];
  if (level === "low") selected = tierOptions(0);
  else if (level === "med") selected = [...tierOptions(0), ...tierOptions(1)];
  else selected = [...uncontested, ...contested];

  const all = selected.map((o) => o.id);
  const recurring = selected
    .filter((o) => isRecurringBasis(o.verify.figure!.basis))
    .map((o) => o.id);
  const oneTime = selected
    .filter((o) => isOneTimeBasis(o.verify.figure!.basis))
    .map((o) => o.id);
  return { all, recurring, oneTime };
}

/** Dollar bands for a dial level: recurring + one-time, summed from the data. */
export function dialBand(
  dialId: string,
  level: DialLevel,
): { recurring: number; oneTime: number; memberIds: string[] } {
  const m = dialMembers(dialId, level);
  const sum = (ids: string[]) =>
    ids.reduce((t, id) => t + realizedBase(getOption(id)), 0);
  return { recurring: sum(m.recurring), oneTime: sum(m.oneTime), memberIds: m.all };
}

/** Choice variants offered by a lever, per its dissent direction (SPEC §7c). */
export function leverVariants(direction: Direction | null): Variant[] {
  switch (direction) {
    case "too_far":
      return ["base", "scaled_back"];
    case "alternative_or_caution":
      return ["base", "defer"];
    case "opposing_both":
      return ["opposing_max", "opposing_zero"];
    case "not_far_enough":
      return ["base", "push_harder"]; // defined for v2; dead code in v1 (SPEC §7c)
    case null:
      // No dissent, but still a real decision: adopt (base) or pass (defer = $0).
      return ["base", "defer"];
  }
}

// --- The fixed decision sequence ---------------------------------------------
import { directionFor } from "./data";

const LEVER_DECISIONS: LeverDecision[] = LEVER_IDS.map((optionId) => {
  const option = getOption(optionId);
  return {
    kind: "lever",
    id: optionId,
    optionId,
    contested: option.verify.contested,
    direction: directionFor(optionId),
  };
});

const DIAL_DECISIONS: DialDecision[] = DIAL_IDS.map((id) => ({
  kind: "dial",
  id,
  domain: id,
}));

const DECISIONS: Decision[] = [...LEVER_DECISIONS, ...DIAL_DECISIONS];

/** The fixed v1 decision sequence (SPEC §7): 15 levers then 3 dials. */
export function availableDecisions(): readonly Decision[] {
  return DECISIONS;
}

/** Look up a decision by id, or throw. */
export function getDecision(id: string): Decision {
  const d = DECISIONS.find((x) => x.id === id);
  if (d === undefined) throw new Error(`Unknown decision id: ${id}`);
  return d;
}
