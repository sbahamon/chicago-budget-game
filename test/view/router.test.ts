// v2 page routing (REVAMP §5): pure hash <-> route parsing, DOM-free.

import { describe, it, expect } from "vitest";
import { PAGES, parseRoute, formatRoute } from "../../src/view/router";

describe("PAGES — the five v2 pages", () => {
  it("lists follow, gap, grow, math, sources in reading order", () => {
    expect(PAGES).toEqual(["follow", "gap", "grow", "math", "sources"]);
  });
});

describe("parseRoute", () => {
  it("parses each bare page hash", () => {
    for (const page of PAGES) {
      expect(parseRoute(`#${page}`)).toEqual({ page, params: {} });
    }
  });

  it("parses query params after the page, e.g. a shared plan link", () => {
    expect(parseRoute("#gap?plan=abc123&view=bill")).toEqual({
      page: "gap",
      params: { plan: "abc123", view: "bill" },
    });
  });

  it("decodes URL-encoded param values", () => {
    expect(parseRoute("#gap?plan=a%2Cb%20c")).toEqual({
      page: "gap",
      params: { plan: "a,b c" },
    });
  });

  it("accepts a hash without the leading #", () => {
    expect(parseRoute("math")).toEqual({ page: "math", params: {} });
  });

  it("returns null for an empty hash (the legacy v1 landing keeps the root)", () => {
    expect(parseRoute("")).toBeNull();
    expect(parseRoute("#")).toBeNull();
  });

  it("returns null for an unknown page", () => {
    expect(parseRoute("#mayor")).toBeNull();
    expect(parseRoute("#gapx?plan=1")).toBeNull();
  });
});

describe("formatRoute", () => {
  it("formats a bare page", () => {
    expect(formatRoute({ page: "follow", params: {} })).toBe("#follow");
  });

  it("round-trips params through parseRoute, including characters that need encoding", () => {
    const route = { page: "gap" as const, params: { plan: "a,b c&d", view: "bill" } };
    expect(parseRoute(formatRoute(route))).toEqual(route);
  });
});
