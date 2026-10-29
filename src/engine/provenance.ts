// "No made-up numbers" across the three number sources (REVAMP §4). Pure: no file
// access here (sources.ts loads the real files), so tests can feed fixtures.
//
//   report      — data/sources.enriched.json: the 194 report options + gap figures
//   public      — data/public/*.json: each figure records link, locator, download
//                 date, raw file and the pipeline script that made it
//   modeled     — data/modeled.json: our calculations (formula + inputs + assumptions)
//                 and the double-counting rules; data/assumptions.json: each
//                 assumption labeled "sourced" (with a link) or "judgment" (with why)
//
// The registry is every number those sources hold. extractFigures finds the money
// and percent figures in any text; findUnsourcedNumbers flags those that match no
// registered number within the rounding they're displayed at.

import type { Option, StructuralGap } from "./types";

/** Units a registered number can carry. "any" = a bare "N million" with no $ or unit. */
export type NumberUnit = "USD" | "percent" | "share" | "count" | "any";

export type NumberSource = "report" | "public" | "modeled" | "assumption";

export interface SourcedNumber {
  value: number;
  unit: NumberUnit;
  source: NumberSource;
  /** Where it came from, e.g. "report:<option-id>" or "public:<dataset>#<figure-id>". */
  ref: string;
}

// --- file shapes ---------------------------------------------------------------

export interface PublicFigure {
  id: string;
  label: string;
  value: number;
  unit: NumberUnit;
  source: {
    url: string;
    /** Dataset id, table name or PDF page the value was read from. */
    locator: string;
    /** YYYY-MM-DD the raw file was downloaded. */
    downloaded: string;
    /** The committed raw download, under data/raw/public/. */
    raw_file: string;
  };
}

export interface PublicFile {
  dataset: string;
  /** The data/pipeline/*.py script that produced this file. */
  script: string;
  figures: PublicFigure[];
}

export interface Assumption {
  id: string;
  label: string;
  value: number;
  unit: NumberUnit;
  basis: "sourced" | "judgment";
  /** Required when basis is "sourced". */
  url?: string;
  /** Required when basis is "judgment". */
  rationale?: string;
  used_by: string[];
}

export interface AssumptionsFile {
  assumptions: Assumption[];
}

export interface Model {
  id: string;
  label: string;
  formula: string;
  /** Refs to the numbers that go in: report:, public:, modeled: or assumption:. */
  inputs: string[];
  /** Ids in assumptions.json this model relies on. */
  assumptions: string[];
  unit: NumberUnit;
  /** A stored result (a single value or ten yearly values), if any. */
  value?: number | number[];
}

/** A double-counting rule (REVAMP §6): options that exclude or shrink each other. */
export interface InteractionRule {
  id: string;
  kind: "exclusive" | "shrinks";
  /** Option refs: report:<option-id> or modeled:<model-id>. */
  members: string[];
  rationale: string;
}

export interface ModeledFile {
  models: Model[];
  interaction_rules: InteractionRule[];
}

export interface ReportData {
  options: Option[];
  structural_gap: StructuralGap[];
}

// --- figure extraction -----------------------------------------------------------

export interface ExtractedFigure {
  /** The matched text, e.g. "$35–250M". */
  raw: string;
  value: number;
  unit: "USD" | "percent" | "any";
  /** Half the place value of the last digit shown: the display's rounding slack. */
  halfUnit: number;
}

const NUM = String.raw`\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?`;
const SCALE = String.raw`(?:\s*(billion|million|thousand)\b|(bn|[bmk])\b)`;
const MONEY = new RegExp(
  String.raw`\$\s?(${NUM})${SCALE}?(?:\s*(?:-|–|—|to)\s*\$?\s?(${NUM})${SCALE}?)?`,
  "gi",
);
const PERCENT = new RegExp(String.raw`(?<![\w.])(${NUM})\s?(?:%|percent\b)`, "gi");
const BARE_SCALE = new RegExp(String.raw`(?<![\w.,$])(${NUM})\s*(billion|million)\b`, "gi");

const SCALES: Record<string, number> = {
  billion: 1e9,
  bn: 1e9,
  b: 1e9,
  million: 1e6,
  m: 1e6,
  thousand: 1e3,
  k: 1e3,
};

function scaleOf(word: string | undefined): number | undefined {
  return word === undefined ? undefined : SCALES[word.toLowerCase()];
}

function parseNum(text: string, scale: number): { value: number; halfUnit: number } {
  const plain = text.replace(/,/g, "");
  const decimals = plain.includes(".") ? plain.split(".")[1]!.length : 0;
  return { value: Number(plain) * scale, halfUnit: 0.5 * 10 ** -decimals * scale };
}

/** Every money and percent figure in `text`, in order of appearance. */
export function extractFigures(text: string): ExtractedFigure[] {
  const found: Array<ExtractedFigure & { index: number }> = [];
  // Mask each match so a later, looser pattern can't re-read the same digits.
  let masked = text;
  const mask = (index: number, length: number) => {
    masked = masked.slice(0, index) + " ".repeat(length) + masked.slice(index + length);
  };

  for (const m of text.matchAll(MONEY)) {
    const [raw, a, aWord, aLetter, b, bWord, bLetter] = m;
    const bScale = scaleOf(bWord ?? bLetter);
    // In a range like "$35–250M" the trailing scale applies to both ends.
    const aScale = scaleOf(aWord ?? aLetter) ?? bScale ?? 1;
    found.push({ raw, unit: "USD", index: m.index, ...parseNum(a!, aScale) });
    if (b !== undefined) {
      found.push({ raw, unit: "USD", index: m.index, ...parseNum(b, bScale ?? aScale) });
    }
    mask(m.index, raw.length);
  }
  for (const m of masked.matchAll(PERCENT)) {
    found.push({ raw: text.slice(m.index, m.index + m[0].length), unit: "percent", index: m.index, ...parseNum(m[1]!, 1) });
    mask(m.index, m[0].length);
  }
  for (const m of masked.matchAll(BARE_SCALE)) {
    found.push({ raw: text.slice(m.index, m.index + m[0].length), unit: "any", index: m.index, ...parseNum(m[1]!, scaleOf(m[2])!) });
  }
  return found
    .sort((x, y) => x.index - y.index)
    .map(({ index: _index, ...figure }) => figure);
}

// --- registry ---------------------------------------------------------------------

function allStringLeaves(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (typeof value !== "object" || value === null) return [];
  return Object.values(value).flatMap(allStringLeaves);
}

function dollarValues(estimate: unknown): number[] {
  if (typeof estimate === "number") return [estimate];
  if (typeof estimate === "object" && estimate !== null) {
    return Object.values(estimate).filter((v): v is number => typeof v === "number");
  }
  return [];
}

/** Every number the three sources hold, tagged with where it came from. */
export function buildRegistry(sources: {
  report: ReportData;
  publicFiles: readonly PublicFile[];
  modeled: ModeledFile;
  assumptions: AssumptionsFile;
}): SourcedNumber[] {
  const reg: SourcedNumber[] = [];
  const add = (value: number, unit: NumberUnit, source: NumberSource, ref: string) =>
    reg.push({ value, unit, source, ref });

  const { report } = sources;
  for (const o of report.options) {
    const ref = `report:${o.id}`;
    for (const v of dollarValues(o.dollar_estimate)) add(v, "USD", "report", ref);
    const fig = o.verify?.figure;
    if (fig) {
      for (const v of dollarValues(fig.dollar_estimate)) add(v, "USD", "report", ref);
      if (typeof fig.annual_equivalent === "number") add(fig.annual_equivalent, "USD", "report", ref);
    }
    // Figures the report states in words (e.g. "$25 per employee per month").
    for (const f of extractFigures(allStringLeaves(o).join("  "))) add(f.value, f.unit, "report", ref);
  }
  report.structural_gap.forEach((g, i) => {
    const ref = `report:structural_gap/${i}`;
    for (const v of dollarValues(g.amount)) add(v, "USD", "report", ref);
    for (const f of extractFigures(allStringLeaves(g).join("  "))) add(f.value, f.unit, "report", ref);
  });

  for (const file of sources.publicFiles) {
    for (const fig of file.figures) add(fig.value, fig.unit, "public", `public:${file.dataset}#${fig.id}`);
  }
  for (const model of sources.modeled.models) {
    const values = model.value === undefined ? [] : [model.value].flat();
    for (const v of values) add(v, model.unit, "modeled", `modeled:${model.id}`);
  }
  for (const a of sources.assumptions.assumptions) add(a.value, a.unit, "assumption", `assumption:${a.id}`);
  return reg;
}

/** Every ref a model input or a double-counting rule may point to. */
export function refsOf(sources: {
  report: ReportData;
  publicFiles: readonly PublicFile[];
  modeled: ModeledFile;
  assumptions: AssumptionsFile;
}): Set<string> {
  return new Set([
    ...sources.report.options.map((o) => `report:${o.id}`),
    ...sources.report.structural_gap.map((_, i) => `report:structural_gap/${i}`),
    ...sources.publicFiles.flatMap((f) => f.figures.map((fig) => `public:${f.dataset}#${fig.id}`)),
    ...sources.modeled.models.map((m) => `modeled:${m.id}`),
    ...sources.assumptions.assumptions.map((a) => `assumption:${a.id}`),
  ]);
}

// Floating-point slack so e.g. 123.45 vs a displayed "123.5" isn't lost to binary rounding.
const FLOAT_SLACK = 1e-9;

function unitsCompatible(shown: ExtractedFigure["unit"], registered: NumberUnit): boolean {
  if (shown === "USD") return registered === "USD" || registered === "any";
  if (shown === "percent") return registered === "percent" || registered === "share";
  return registered === "USD" || registered === "count" || registered === "any";
}

function matches(figure: ExtractedFigure, n: SourcedNumber): boolean {
  if (!unitsCompatible(figure.unit, n.unit)) return false;
  // A share (0.7) is displayed as a percent (70%).
  const value = n.unit === "share" ? n.value * 100 : n.value;
  return Math.abs(value - figure.value) <= figure.halfUnit * (1 + FLOAT_SLACK) + FLOAT_SLACK;
}

/** The raw text of each figure in `text` that no registered number accounts for. */
export function findUnsourcedNumbers(text: string, registry: readonly SourcedNumber[]): string[] {
  const offenders = extractFigures(text)
    .filter((f) => !registry.some((n) => matches(f, n)))
    .map((f) => f.raw);
  return [...new Set(offenders)];
}

// --- validators ---------------------------------------------------------------------

const UNITS: ReadonlySet<string> = new Set(["USD", "percent", "share", "count", "any"]);
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function nonEmpty(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function isUrl(value: unknown): boolean {
  return typeof value === "string" && /^https?:\/\/\S+$/.test(value);
}

function isIsoDate(value: unknown): boolean {
  return typeof value === "string" && ISO_DATE.test(value) && !Number.isNaN(Date.parse(value));
}

function duplicateIds(ids: string[], where: string): string[] {
  const seen = new Set<string>();
  const errors: string[] = [];
  for (const id of ids) {
    if (seen.has(id)) errors.push(`${where}: duplicate id "${id}"`);
    seen.add(id);
  }
  return errors;
}

/** Errors in a data/public/*.json file (empty when valid). */
export function validatePublicFile(file: PublicFile): string[] {
  const errors: string[] = [];
  const where = `public:${file.dataset}`;
  if (!nonEmpty(file.dataset)) errors.push(`${where}: missing dataset name`);
  if (typeof file.script !== "string" || !/^data\/pipeline\/[\w/-]+\.py$/.test(file.script)) {
    errors.push(`${where}: script must be a data/pipeline/*.py path`);
  }
  for (const fig of file.figures ?? []) {
    const at = `${where}#${fig.id}`;
    if (!nonEmpty(fig.id)) errors.push(`${at}: missing id`);
    if (!nonEmpty(fig.label)) errors.push(`${at}: missing label`);
    if (typeof fig.value !== "number" || !Number.isFinite(fig.value)) errors.push(`${at}: value must be a finite number`);
    if (!UNITS.has(fig.unit)) errors.push(`${at}: unknown unit "${fig.unit}"`);
    const s = fig.source ?? ({} as PublicFigure["source"]);
    if (!isUrl(s.url)) errors.push(`${at}: source.url must be an http(s) link`);
    if (!nonEmpty(s.locator)) errors.push(`${at}: source.locator (dataset or PDF page) is missing`);
    if (!isIsoDate(s.downloaded)) errors.push(`${at}: source.downloaded must be a YYYY-MM-DD date`);
    if (typeof s.raw_file !== "string" || !s.raw_file.startsWith("data/raw/public/")) {
      errors.push(`${at}: source.raw_file must be kept under data/raw/public/`);
    }
  }
  errors.push(...duplicateIds((file.figures ?? []).map((f) => f.id), where));
  return errors;
}

/** Errors in data/assumptions.json (empty when valid). */
export function validateAssumptions(file: AssumptionsFile): string[] {
  const errors: string[] = [];
  for (const a of file.assumptions) {
    const at = `assumption:${a.id}`;
    if (!nonEmpty(a.id)) errors.push(`${at}: missing id`);
    if (!nonEmpty(a.label)) errors.push(`${at}: missing label`);
    if (typeof a.value !== "number" || !Number.isFinite(a.value)) errors.push(`${at}: value must be a finite number`);
    if (!UNITS.has(a.unit)) errors.push(`${at}: unknown unit "${a.unit}"`);
    if (a.basis === "sourced") {
      if (!isUrl(a.url)) errors.push(`${at}: a sourced assumption needs a url`);
    } else if (a.basis === "judgment") {
      if (!nonEmpty(a.rationale)) errors.push(`${at}: a judgment assumption needs a rationale`);
    } else {
      errors.push(`${at}: basis must be "sourced" or "judgment"`);
    }
    if (!Array.isArray(a.used_by)) errors.push(`${at}: used_by must list where it's used`);
  }
  errors.push(...duplicateIds(file.assumptions.map((a) => a.id), "assumptions"));
  return errors;
}

/** Errors in data/modeled.json, resolving refs against every known number (empty when valid). */
export function validateModeled(
  file: ModeledFile,
  knownRefs: ReadonlySet<string>,
  assumptions: AssumptionsFile,
): string[] {
  const errors: string[] = [];
  const refs = new Set([...knownRefs, ...file.models.map((m) => `modeled:${m.id}`)]);
  const assumptionIds = new Set(assumptions.assumptions.map((a) => a.id));

  for (const m of file.models) {
    const at = `modeled:${m.id}`;
    if (!nonEmpty(m.label)) errors.push(`${at}: missing label`);
    if (!nonEmpty(m.formula)) errors.push(`${at}: missing formula`);
    if (!UNITS.has(m.unit)) errors.push(`${at}: unknown unit "${m.unit}"`);
    if (m.inputs.length === 0) errors.push(`${at}: lists no inputs`);
    for (const input of m.inputs) {
      if (!refs.has(input)) errors.push(`${at}: input "${input}" traces to no known number`);
    }
    for (const id of m.assumptions) {
      if (!assumptionIds.has(id)) errors.push(`${at}: assumption "${id}" is not in assumptions.json`);
    }
    const values = m.value === undefined ? [] : [m.value].flat();
    if (values.some((v) => typeof v !== "number" || !Number.isFinite(v))) {
      errors.push(`${at}: value must be finite number(s)`);
    }
  }
  for (const rule of file.interaction_rules) {
    const at = `interaction_rule:${rule.id}`;
    if (rule.kind !== "exclusive" && rule.kind !== "shrinks") {
      errors.push(`${at}: kind must be "exclusive" or "shrinks"`);
    }
    if (rule.members.length < 2) errors.push(`${at}: needs at least two members`);
    for (const member of rule.members) {
      const isOption = member.startsWith("report:") || member.startsWith("modeled:");
      if (!isOption || !refs.has(member)) errors.push(`${at}: member "${member}" is not a known option`);
    }
    if (!nonEmpty(rule.rationale)) errors.push(`${at}: missing rationale`);
  }
  errors.push(...duplicateIds(file.models.map((m) => m.id), "models"));
  errors.push(...duplicateIds(file.interaction_rules.map((r) => r.id), "interaction_rules"));
  return errors;
}
