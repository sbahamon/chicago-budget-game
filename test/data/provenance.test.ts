// "No made-up numbers", extended to all three number sources (REVAMP §4):
//   report      — data/sources.enriched.json (unchanged rules)
//   public      — data/public/*.json, each figure with link, locator, download date, script
//   modeled     — data/modeled.json (+ data/assumptions.json), each with formula + inputs
// Every money/percent figure in src/ must trace to one of them. A planted fake must fail.

import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import {
  extractFigures,
  findUnsourcedNumbers,
  buildRegistry,
  validatePublicFile,
  validateAssumptions,
  validateModeled,
  type PublicFile,
  type AssumptionsFile,
  type ModeledFile,
} from "../../src/engine/provenance";
import {
  realRegistry,
  reportData,
  publicFiles,
  assumptionsFile,
  modeledFile,
  knownRefs,
  assumptionValue,
} from "../../src/engine/sources";
import { STATE_CONFIRMED_SHARE } from "../../src/engine/realize";

const ROOT = fileURLToPath(new URL("../..", import.meta.url));

// --- fixtures: valid records for each source, so each test breaks exactly one rule ---

function goodPublic(): PublicFile {
  return {
    dataset: "fixture_budget",
    script: "data/pipeline/fixture_budget.py",
    figures: [
      {
        id: "planted_total",
        label: "A fixture total",
        value: 123450000,
        unit: "USD",
        source: {
          url: "https://example.org/budget.pdf",
          locator: "p. 12",
          downloaded: "2026-10-29",
          raw_file: "data/raw/public/budget.pdf",
        },
      },
    ],
  };
}

function goodAssumptions(): AssumptionsFile {
  return {
    assumptions: [
      {
        id: "bill_lag_years",
        label: "Years between a change in taxable value and the tax bill",
        value: 1,
        unit: "count",
        basis: "sourced",
        url: "https://example.org/bill-calendar",
        used_by: ["src/engine/example.ts"],
      },
      {
        id: "a_judgment_call",
        label: "A judgment call",
        value: 0.373,
        unit: "share",
        basis: "judgment",
        rationale: "Why we chose it.",
        used_by: ["src/engine/example.ts"],
      },
    ],
  };
}

function goodModeled(): ModeledFile {
  return {
    models: [
      {
        id: "fixture_model",
        label: "A fixture model",
        formula: "planted_total × a_judgment_call",
        inputs: ["public:fixture_budget#planted_total"],
        assumptions: ["a_judgment_call"],
        unit: "USD",
        value: 46046850,
      },
    ],
    interaction_rules: [
      {
        id: "fixture_group",
        kind: "shrinks",
        members: ["report:declare-maximum-tif-surplus", "modeled:fixture_model"],
        rationale: "Ending a district leaves no surplus in it to release.",
      },
    ],
  };
}

function fixtureRefs(): Set<string> {
  return new Set([...knownRefs(), "public:fixture_budget#planted_total", "modeled:fixture_model"]);
}

// --- figure extraction --------------------------------------------------------

describe("extractFigures — money and percent figures in text", () => {
  const values = (text: string) => extractFigures(text).map((f) => [f.value, f.unit]);

  it("reads dollar figures with a scale word or letter", () => {
    expect(values("a $882 million gap")).toEqual([[882e6, "USD"]]);
    expect(values("about $1.15B")).toEqual([[1.15e9, "USD"]]);
    expect(values("$113.8M budgeted")).toEqual([[113.8e6, "USD"]]);
    expect(values("$25 a month per worker")).toEqual([[25, "USD"]]);
    expect(values("$1,234,000")).toEqual([[1234000, "USD"]]);
  });

  it("applies a range's trailing scale to both ends", () => {
    expect(values("$35–250M")).toEqual([
      [35e6, "USD"],
      [250e6, "USD"],
    ]);
    expect(values("$10.2 to $25.6 million")).toEqual([
      [10.2e6, "USD"],
      [25.6e6, "USD"],
    ]);
  });

  it("reads percents, and bare million/billion amounts", () => {
    expect(values("62% closed")).toEqual([[62, "percent"]]);
    expect(values("12.5 percent")).toEqual([[12.5, "percent"]]);
    expect(values("over 1 billion")).toEqual([[1e9, "any"]]);
  });

  it("ignores plain counts, years and code that isn't a figure", () => {
    expect(extractFigures("Phase 2 of 10 years in FY2027, act 4")).toEqual([]);
    expect(extractFigures("const x = `$${amount}`; n >= 1e9")).toEqual([]);
  });
});

// --- validators: each source records what REVAMP §4 requires ---------------------

describe("validatePublicFile — link, locator, download date, raw file, script", () => {
  it("accepts a complete record", () => {
    expect(validatePublicFile(goodPublic())).toEqual([]);
  });

  it("rejects a figure missing its download date", () => {
    const f = goodPublic();
    delete (f.figures[0]!.source as Partial<PublicFile["figures"][0]["source"]>).downloaded;
    expect(validatePublicFile(f).join()).toMatch(/downloaded/);
  });

  it("rejects a download date that isn't YYYY-MM-DD", () => {
    const f = goodPublic();
    f.figures[0]!.source.downloaded = "Oct 29";
    expect(validatePublicFile(f).join()).toMatch(/downloaded/);
  });

  it("rejects a figure with no link or locator", () => {
    const f = goodPublic();
    f.figures[0]!.source.url = "";
    f.figures[0]!.source.locator = "";
    const errors = validatePublicFile(f).join();
    expect(errors).toMatch(/url/);
    expect(errors).toMatch(/locator/);
  });

  it("rejects a raw file kept outside data/raw/public/", () => {
    const f = goodPublic();
    f.figures[0]!.source.raw_file = "Downloads/budget.pdf";
    expect(validatePublicFile(f).join()).toMatch(/raw_file/);
  });

  it("rejects a file that doesn't name the pipeline script that made it", () => {
    const f = goodPublic();
    f.script = "scripts/elsewhere.py";
    expect(validatePublicFile(f).join()).toMatch(/script/);
  });

  it("rejects a non-numeric value and duplicate ids", () => {
    const f = goodPublic();
    f.figures.push({ ...f.figures[0]!, value: Number.NaN });
    const errors = validatePublicFile(f).join();
    expect(errors).toMatch(/value/);
    expect(errors).toMatch(/duplicate/);
  });
});

describe("validateAssumptions — every assumption is sourced (link) or judgment (why)", () => {
  it("accepts a complete record", () => {
    expect(validateAssumptions(goodAssumptions())).toEqual([]);
  });

  it("rejects a 'sourced' assumption with no link", () => {
    const a = goodAssumptions();
    delete a.assumptions[0]!.url;
    expect(validateAssumptions(a).join()).toMatch(/url/);
  });

  it("rejects a 'judgment' assumption with no rationale", () => {
    const a = goodAssumptions();
    delete a.assumptions[1]!.rationale;
    expect(validateAssumptions(a).join()).toMatch(/rationale/);
  });

  it("rejects an unlabeled basis and duplicate ids", () => {
    const a = goodAssumptions();
    (a.assumptions[1] as { basis: string }).basis = "vibes";
    a.assumptions.push({ ...a.assumptions[0]! });
    const errors = validateAssumptions(a).join();
    expect(errors).toMatch(/basis/);
    expect(errors).toMatch(/duplicate/);
  });
});

describe("validateModeled — formula, inputs and assumptions all resolve", () => {
  it("accepts a complete record", () => {
    expect(validateModeled(goodModeled(), fixtureRefs(), goodAssumptions())).toEqual([]);
  });

  it("rejects a model with no formula", () => {
    const m = goodModeled();
    m.models[0]!.formula = "";
    expect(validateModeled(m, fixtureRefs(), goodAssumptions()).join()).toMatch(/formula/);
  });

  it("rejects an input that doesn't trace to a known number", () => {
    const m = goodModeled();
    m.models[0]!.inputs.push("public:nowhere#made_up");
    expect(validateModeled(m, fixtureRefs(), goodAssumptions()).join()).toMatch(/nowhere#made_up/);
  });

  it("rejects an assumption that isn't in assumptions.json", () => {
    const m = goodModeled();
    m.models[0]!.assumptions.push("unlisted_assumption");
    expect(validateModeled(m, fixtureRefs(), goodAssumptions()).join()).toMatch(/unlisted_assumption/);
  });

  it("rejects a double-counting rule over an unknown option or a bad kind", () => {
    const m = goodModeled();
    m.interaction_rules[0]!.members.push("report:no-such-option");
    (m.interaction_rules[0] as { kind: string }).kind = "sometimes";
    const errors = validateModeled(m, fixtureRefs(), goodAssumptions()).join();
    expect(errors).toMatch(/no-such-option/);
    expect(errors).toMatch(/kind/);
  });
});

// --- the real data files ------------------------------------------------------

describe("the real data files pass their own rules", () => {
  it("data/assumptions.json is valid", () => {
    expect(validateAssumptions(assumptionsFile())).toEqual([]);
  });

  it("data/modeled.json is valid against every known number and assumption", () => {
    expect(validateModeled(modeledFile(), knownRefs(), assumptionsFile())).toEqual([]);
  });

  it("every data/public/*.json file is valid and its raw download is committed", () => {
    for (const file of publicFiles()) {
      expect(validatePublicFile(file)).toEqual([]);
      for (const fig of file.figures) {
        expect(existsSync(join(ROOT, fig.source.raw_file))).toBe(true);
      }
      expect(existsSync(join(ROOT, file.script))).toBe(true);
    }
  });

  it("the engine's Springfield partial-credit share is read from assumptions.json", () => {
    expect(STATE_CONFIRMED_SHARE).toBe(assumptionValue("state_confirmed_share"));
  });

  it("the registry carries numbers from the reports and from assumptions", () => {
    const reg = realRegistry();
    const reportGap = reportData().structural_gap[0]!.amount as number;
    expect(reg.some((n) => n.source === "report" && n.value === reportGap)).toBe(true);
    expect(reg.some((n) => n.source === "assumption" && n.value === STATE_CONFIRMED_SHARE)).toBe(true);
  });
});

// --- the scan: every figure in src/ is sourced; planted fakes are caught -------

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(ts|html)$/.test(name) ? [path] : [];
  });
}

describe("no made-up numbers — scan of every source file", () => {
  it("finds no unsourced money or percent figure anywhere in src/ or index.html", () => {
    const registry = realRegistry();
    const files = [...sourceFiles(join(ROOT, "src")), join(ROOT, "index.html")];
    const offenders = files.flatMap((path) =>
      findUnsourcedNumbers(readFileSync(path, "utf8"), registry).map(
        (raw) => `${relative(ROOT, path)}: ${raw}`,
      ),
    );
    expect(offenders).toEqual([]);
  });

  it("catches a fake number planted in real copy", () => {
    const registry = realRegistry();
    const copy = readFileSync(join(ROOT, "src/view/copy.en.ts"), "utf8");
    const planted = `${copy}\nconst fake = "This saves $123.45 million a year, or 37.3% of the gap.";`;
    expect(findUnsourcedNumbers(planted, registry)).toEqual(["$123.45 million", "37.3%"]);
  });

  it("accepts a real report figure written the way people write it", () => {
    const registry = realRegistry();
    const gap = reportData().structural_gap[0]!.amount as number; // CFFTF Final p.5
    expect(findUnsourcedNumbers(`a $${gap / 1e6} million shortfall`, registry)).toEqual([]);
  });

  it("accepts the planted figure once it's registered from public data, a model or an assumption", () => {
    const text = "This saves $123.45 million a year.";
    expect(findUnsourcedNumbers(text, realRegistry())).toEqual(["$123.45 million"]);

    const withPublic = buildRegistry({ report: reportData(), publicFiles: [goodPublic()], modeled: { models: [], interaction_rules: [] }, assumptions: { assumptions: [] } });
    expect(findUnsourcedNumbers(text, withPublic)).toEqual([]);

    const model = goodModeled();
    model.models[0]!.value = 123.45e6;
    const withModel = buildRegistry({ report: reportData(), publicFiles: [], modeled: model, assumptions: { assumptions: [] } });
    expect(findUnsourcedNumbers(text, withModel)).toEqual([]);

    const pct = "Counts 37.3% toward the gap.";
    expect(findUnsourcedNumbers(pct, realRegistry())).toEqual(["37.3%"]);
    const withAssumption = buildRegistry({ report: reportData(), publicFiles: [], modeled: { models: [], interaction_rules: [] }, assumptions: goodAssumptions() });
    expect(findUnsourcedNumbers(pct, withAssumption)).toEqual([]);
  });

  it("matches within the displayed rounding only", () => {
    const reg = buildRegistry({ report: { options: [], structural_gap: [] }, publicFiles: [goodPublic()], modeled: { models: [], interaction_rules: [] }, assumptions: { assumptions: [] } });
    expect(findUnsourcedNumbers("$123M", reg)).toEqual([]); // 123.45M rounds to 123M
    expect(findUnsourcedNumbers("$123.5M", reg)).toEqual([]);
    expect(findUnsourcedNumbers("$124M", reg)).toEqual(["$124M"]);
    expect(findUnsourcedNumbers("$123.3M", reg)).toEqual(["$123.3M"]);
  });
});
