import { describe, expect, test } from "vitest";
import { getOption, directionFor, overlapGroups } from "../../src/engine/data";
import { realizedBase } from "../../src/engine/realize";
import {
  availableDecisions,
  getDecision,
  leverVariants,
  dialBand,
  dialMembers,
  DIAL_IDS,
} from "../../src/engine/decisions";

const EPS = 1e-6;
const sum = (ids: string[]) =>
  ids.reduce((t, id) => t + realizedBase(getOption(id)), 0);

describe("fixed decision set (SPEC §7)", () => {
  test("has 15 standalone levers + 3 dials = 18 decisions", () => {
    const decisions = availableDecisions();
    expect(decisions.filter((d) => d.kind === "lever")).toHaveLength(15);
    expect(decisions.filter((d) => d.kind === "dial")).toHaveLength(3);
    expect(decisions).toHaveLength(18);
  });

  test("real-estate is a standalone one_time lever, not a dial", () => {
    const d = getDecision("optimize-real-estate-portfolio");
    expect(d.kind).toBe("lever");
    expect(getOption("optimize-real-estate-portfolio").verify.figure!.basis).toBe(
      "one_time",
    );
  });

  test("vacancy-freeze is a standalone lever (pulled out of the personnel dial)", () => {
    expect(getDecision("institute-vacancy-freeze").kind).toBe("lever");
  });
});

describe("lever fork variants follow dissent direction (SPEC §7c)", () => {
  test("too_far lever offers base + scaled_back", () => {
    expect(new Set(leverVariants(directionFor("adjust-city-property-tax")))).toEqual(
      new Set(["base", "scaled_back"]),
    );
  });

  test("alternative_or_caution lever offers base + defer", () => {
    expect(
      new Set(leverVariants(directionFor("cfftf-ltl-secure-cps-pension-contributions"))),
    ).toEqual(new Set(["base", "defer"]));
  });

  test("opposing_both lever offers the two opposing branches", () => {
    expect(
      new Set(leverVariants(directionFor("institute-vacancy-freeze"))),
    ).toEqual(new Set(["opposing_max", "opposing_zero"]));
  });

  test("a lever with no dissent offers base only", () => {
    expect(leverVariants(directionFor("ey-procurement-category-management"))).toEqual([
      "base",
    ]);
  });
});

describe("dial banding (SPEC §7b)", () => {
  test("bands are cumulative: LOW ⊆ MED ⊆ HIGH member sets", () => {
    for (const id of DIAL_IDS) {
      const low = new Set(dialMembers(id, "low").all);
      const med = new Set(dialMembers(id, "med").all);
      const high = new Set(dialMembers(id, "high").all);
      for (const m of low) expect(med.has(m)).toBe(true);
      for (const m of med) expect(high.has(m)).toBe(true);
    }
  });

  test("all contested domain members live only in HIGH", () => {
    for (const id of DIAL_IDS) {
      const med = new Set(dialMembers(id, "med").all);
      const high = dialMembers(id, "high").all;
      for (const m of high) {
        if (getOption(m).verify.contested) expect(med.has(m)).toBe(false);
      }
    }
  });

  test("deduped/carved ids never appear in any band", () => {
    const kept = new Set([
      "ey-special-events-cost-recovery-program",
      "explore-employee-contribution-opportunities",
      "identify-cost-saving-options-not-covered-by-cbas",
      "explore-healthcare-plan-design",
      "explore-pbm-carrier-cost-savings",
      "assess-loa-health-coverage-continuation",
    ]);
    const dropped = new Set<string>();
    for (const g of overlapGroups())
      for (const m of g.member_ids) if (!kept.has(m)) dropped.add(m);
    dropped.add("ey-fees-vehicle-sticker-tax");
    dropped.add("institute-vacancy-freeze");

    const inBands = new Set<string>();
    for (const id of DIAL_IDS)
      for (const m of dialMembers(id, "high").all) inBands.add(m);
    for (const m of dropped) expect(inBands.has(m)).toBe(false);
  });

  test("band dollars equal the realize-sum of band members by id (recurring/one-time split)", () => {
    for (const id of DIAL_IDS) {
      for (const level of ["low", "med", "high"] as const) {
        const m = dialMembers(id, level);
        const band = dialBand(id, level);
        expect(band.recurring).toBeCloseTo(sum(m.recurring), EPS);
        expect(band.oneTime).toBeCloseTo(sum(m.oneTime), EPS);
      }
    }
  });

  test("HIGH is monotonic and ≥ LOW for every dial (real money on the table)", () => {
    for (const id of DIAL_IDS) {
      expect(dialBand(id, "high").recurring).toBeGreaterThanOrEqual(
        dialBand(id, "low").recurring,
      );
    }
  });
});
