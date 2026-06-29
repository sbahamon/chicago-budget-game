import { describe, expect, test } from "vitest";
import { getOption } from "../../src/engine/data";
import {
  midpoint,
  basisNormalize,
  realizedBase,
  realizeDollar,
  countsToward,
  STATE_CONFIRMED_SHARE,
  atRiskDollar,
} from "../../src/engine/realize";
import type { DollarRange } from "../../src/engine/types";

const EPS = 1e-6;

describe("midpoint (SPEC §6)", () => {
  test("range banks (low+high)/2", () => {
    const est = getOption("cfftf-re-increase-lgdf-share-rate")
      .dollar_estimate as DollarRange;
    expect(midpoint(est)).toBeCloseTo((est.low + est.high) / 2, EPS);
  });

  test("point figure banks the point", () => {
    const est = getOption("declare-maximum-tif-surplus").dollar_estimate;
    expect(midpoint(est)).toBe(est as number);
  });

  test("null banks 0", () => {
    expect(midpoint(null)).toBe(0);
  });
});

describe("basisNormalize (SPEC §6 / §7b)", () => {
  test("ten_year_cumulative divides by 10", () => {
    const f = getOption("ey-svcopt-oemc-traffic-parking-enforcement").verify
      .figure!;
    const v = f.dollar_estimate as number;
    expect(basisNormalize(v, "ten_year_cumulative")).toBeCloseTo(v / 10, EPS);
  });

  test("ten_year_pv divides by 10", () => {
    const v = getOption("ey-realestate-sell-industrial-buildings").verify.figure!
      .dollar_estimate as number;
    expect(basisNormalize(v, "ten_year_pv")).toBeCloseTo(v / 10, EPS);
  });

  test("annual / one_time / upfront_cost pass through unchanged", () => {
    const annual = getOption("adjust-city-property-tax").verify.figure!
      .dollar_estimate as number;
    const oneTime = getOption("declare-maximum-tif-surplus").verify.figure!
      .dollar_estimate as number;
    const upfront = getOption("rent-opsa-regional-training-facility").verify
      .figure!.dollar_estimate as number;
    expect(basisNormalize(annual, "annual")).toBe(annual);
    expect(basisNormalize(oneTime, "one_time")).toBe(oneTime);
    expect(basisNormalize(upfront, "upfront_cost")).toBe(upfront);
  });
});

describe("realizedBase — basis-normalized midpoint (SPEC §6)", () => {
  test("ranged annual option banks normalized midpoint", () => {
    const o = getOption("reinstitute-head-tax");
    const est = o.dollar_estimate as DollarRange;
    expect(realizedBase(o)).toBeCloseTo((est.low + est.high) / 2, EPS);
  });

  test("ten_year_cumulative option banks midpoint/10", () => {
    const o = getOption("ey-svcopt-oemc-traffic-parking-enforcement");
    const v = o.verify.figure!.dollar_estimate as number;
    expect(realizedBase(o)).toBeCloseTo(v / 10, EPS);
  });

  test("option with no figure banks 0", () => {
    const o = getOption("cfftf-ltl-advanced-supplemental-payment");
    expect(realizedBase(o)).toBe(0);
  });
});

describe("realizeDollar variants (SPEC §6 / §7c)", () => {
  test("base equals realizedBase", () => {
    const o = getOption("reinstitute-head-tax");
    expect(realizeDollar(o, "base")).toBeCloseTo(realizedBase(o), EPS);
  });

  test("too_far scaled_back banks range LOW", () => {
    const o = getOption("reinstitute-head-tax");
    const est = o.dollar_estimate as DollarRange;
    expect(realizeDollar(o, "scaled_back")).toBeCloseTo(est.low, EPS);
  });

  test("too_far scaled_back banks 50% of a point figure", () => {
    const o = getOption("adjust-city-property-tax");
    const point = o.dollar_estimate as number;
    expect(realizeDollar(o, "scaled_back")).toBeCloseTo(point * 0.5, EPS);
  });

  test("defer (alternative_or_caution / study-and-delay) banks 0", () => {
    const o = getOption("cfftf-ltl-secure-cps-pension-contributions");
    expect(realizeDollar(o, "defer")).toBe(0);
  });

  test("opposing money branch banks the base figure", () => {
    const o = getOption("institute-vacancy-freeze");
    expect(realizeDollar(o, "opposing_max")).toBeCloseTo(realizedBase(o), EPS);
  });

  test("opposing placate branch banks 0", () => {
    const o = getOption("institute-vacancy-freeze");
    expect(realizeDollar(o, "opposing_zero")).toBe(0);
  });
});

describe("atRiskDollar — State-dependent levers ride on Springfield (E1)", () => {
  test("a State-dependent lever puts (1 - share) of its realized yield at risk", () => {
    const o = getOption("cfftf-ltl-secure-cps-pension-contributions"); // state-dependent
    const realized = realizeDollar(o, "base");
    expect(atRiskDollar(o, realized)).toBeCloseTo(realized * (1 - STATE_CONFIRMED_SHARE), EPS);
    expect(STATE_CONFIRMED_SHARE).toBeGreaterThan(0);
    expect(STATE_CONFIRMED_SHARE).toBeLessThan(1);
  });

  test("a City-controlled lever has nothing at risk", () => {
    const o = getOption("reinstitute-head-tax"); // city-controlled
    expect(atRiskDollar(o, realizeDollar(o, "base"))).toBe(0);
  });

  test("a State-dependent lever banking $0 (deferred) has $0 at risk", () => {
    const o = getOption("cfftf-ltl-secure-cps-pension-contributions");
    expect(atRiskDollar(o, realizeDollar(o, "defer"))).toBe(0);
  });
});

describe("countsToward (SPEC §6 basis→target table)", () => {
  test("annual counts toward all three targets", () => {
    expect(new Set(countsToward("annual"))).toEqual(
      new Set(["near_term", "durable", "stretch"]),
    );
  });

  test("ten_year_cumulative counts toward all three targets", () => {
    expect(new Set(countsToward("ten_year_cumulative"))).toEqual(
      new Set(["near_term", "durable", "stretch"]),
    );
  });

  test("one_time counts toward near_term only", () => {
    expect(countsToward("one_time")).toEqual(["near_term"]);
  });

  test("ten_year_pv counts toward near_term only", () => {
    expect(countsToward("ten_year_pv")).toEqual(["near_term"]);
  });

  test("upfront_cost counts toward near_term only", () => {
    expect(countsToward("upfront_cost")).toEqual(["near_term"]);
  });
});
