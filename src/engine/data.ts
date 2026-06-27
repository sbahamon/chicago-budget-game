// Single point of contact with data/sources.enriched.json (the data of record).
// Every other engine module reads options through these typed accessors, so the
// schema lives in one place and no money figure is ever hardcoded elsewhere.

import rawData from "../../data/sources.enriched.json";
import type {
  Direction,
  DollarRange,
  Option,
  OverlapGroup,
  StructuralGap,
} from "./types";

interface RawData {
  options: Option[];
  structural_gap: StructuralGap[];
  verify: {
    overlap_groups: OverlapGroup[];
    dissent_taxonomy: {
      taxonomy: Array<{ category: string; count: number; definition: string }>;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
}

const data = rawData as unknown as RawData;

const OPTIONS_BY_ID: ReadonlyMap<string, Option> = new Map(
  data.options.map((o) => [o.id, o]),
);

/** Return the full option record for an id, or throw if it does not exist. */
export function getOption(id: string): Option {
  const option = OPTIONS_BY_ID.get(id);
  if (option === undefined) {
    throw new Error(`Unknown option id: ${id}`);
  }
  return option;
}

/** All options, in source order. */
export function allOptions(): readonly Option[] {
  return data.options;
}

/** Type guard: true only for a {low, high} dollar range object. */
export function isDollarRange(value: unknown): value is DollarRange {
  return (
    typeof value === "object" &&
    value !== null &&
    "low" in value &&
    "high" in value &&
    typeof (value as DollarRange).low === "number" &&
    typeof (value as DollarRange).high === "number"
  );
}

/** verify.overlap_groups[] (SPEC §7b dedup pools). */
export function overlapGroups(): readonly OverlapGroup[] {
  return data.verify.overlap_groups;
}

/** Top-level structural_gap[] (SPEC §2 difficulty targets cite these). */
export function structuralGap(): readonly StructuralGap[] {
  return data.structural_gap;
}

// --- Dissent direction, derived from verify.dissent_taxonomy (SPEC §4) -------
// Each taxonomy entry lists its member option ids inside the `definition` text
// ("... Members: id-a, id-b, ..."). We extract id-shaped tokens and keep only
// those that are real option ids (this drops stray phrases like ">2yr-old").

const CATEGORY_TO_DIRECTION: ReadonlyArray<[RegExp, Direction]> = [
  [/opposing dual dissents/i, "opposing_both"],
  [/goes too far|overreach/i, "too_far"],
  [/does not go far enough|too timid/i, "not_far_enough"],
  [/alternative|caution|incomplete/i, "alternative_or_caution"],
];

function categoryToDirection(category: string): Direction | null {
  for (const [pattern, direction] of CATEGORY_TO_DIRECTION) {
    if (pattern.test(category)) return direction;
  }
  return null;
}

const DIRECTION_BY_ID: ReadonlyMap<string, Direction> = (() => {
  const map = new Map<string, Direction>();
  const idTokens = /[a-z0-9]+(?:-[a-z0-9]+)+/g;
  for (const entry of data.verify.dissent_taxonomy.taxonomy) {
    const direction = categoryToDirection(entry.category);
    if (direction === null) continue;
    const marker = entry.definition.indexOf("Members:");
    if (marker === -1) continue;
    const memberText = entry.definition.slice(marker + "Members:".length);
    for (const token of memberText.match(idTokens) ?? []) {
      if (OPTIONS_BY_ID.has(token)) map.set(token, direction);
    }
  }
  return map;
})();

/**
 * Dissent direction for an option, derived from the taxonomy member lists.
 * Returns null for options that carry no dissent.
 */
export function directionFor(id: string): Direction | null {
  return DIRECTION_BY_ID.get(id) ?? null;
}
