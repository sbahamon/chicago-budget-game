import { describe, expect, test } from "vitest";
import rawData from "../../data/sources.enriched.json";
import {
  getOption,
  directionFor,
  overlapGroups,
  isDollarRange,
} from "../../src/engine/data";

const rawOptions = rawData.options as Array<Record<string, unknown>>;

describe("getOption", () => {
  test("returns the full option record for a known id", () => {
    const id = "cfftf-ltl-secure-cps-pension-contributions";
    const raw = rawOptions.find((o) => o.id === id);
    expect(getOption(id)).toEqual(raw);
  });

  test("throws for an unknown id", () => {
    expect(() => getOption("does-not-exist")).toThrow();
  });
});

describe("isDollarRange", () => {
  test("true only for a {low, high} object", () => {
    expect(isDollarRange({ low: 1, high: 2 })).toBe(true);
  });

  test("false for a point number", () => {
    const point = getOption("cfftf-ltl-secure-cps-pension-contributions")
      .dollar_estimate;
    expect(isDollarRange(point)).toBe(false);
  });

  test("false for null", () => {
    expect(isDollarRange(null)).toBe(false);
  });
});

describe("directionFor — derived from verify.dissent_taxonomy (SPEC §4)", () => {
  test("maps a 'goes too far' option to too_far", () => {
    expect(directionFor("adjust-city-property-tax")).toBe("too_far");
  });

  test("maps an 'alternative/caution' option to alternative_or_caution", () => {
    expect(directionFor("cfftf-ltl-secure-cps-pension-contributions")).toBe(
      "alternative_or_caution",
    );
  });

  test("maps the two genuine dual-dissent options to opposing_both", () => {
    expect(directionFor("institute-vacancy-freeze")).toBe("opposing_both");
    expect(directionFor("increase-autonomous-drones-cpd")).toBe("opposing_both");
  });

  test("returns null for an option carrying no dissent", () => {
    expect(directionFor("ey-procurement-category-management")).toBeNull();
  });
});

describe("overlapGroups", () => {
  test("exposes the verify.overlap_groups list with member_ids", () => {
    const groups = overlapGroups();
    const raw = (rawData.verify as Record<string, unknown>)
      .overlap_groups as unknown[];
    expect(groups).toHaveLength(raw.length);
    for (const g of groups) {
      expect(Array.isArray(g.member_ids)).toBe(true);
      expect(g.member_ids.length).toBeGreaterThan(0);
    }
  });
});
