// Loads the three number sources (REVAMP §4) and exposes them to the engine.
// provenance.ts holds the pure rules; this file is the one place that reads the
// real data/public/*.json, data/modeled.json and data/assumptions.json.

import report from "../../data/sources.enriched.json";
import assumptions from "../../data/assumptions.json";
import modeled from "../../data/modeled.json";
import {
  buildRegistry,
  refsOf,
  type AssumptionsFile,
  type ModeledFile,
  type PublicFile,
  type ReportData,
  type SourcedNumber,
} from "./provenance";

// Every pipeline output in data/public/ is picked up automatically.
const PUBLIC = import.meta.glob<PublicFile>("../../data/public/*.json", {
  eager: true,
  import: "default",
});

export function reportData(): ReportData {
  return report as unknown as ReportData;
}

export function publicFiles(): PublicFile[] {
  return Object.values(PUBLIC);
}

export function assumptionsFile(): AssumptionsFile {
  return assumptions as unknown as AssumptionsFile;
}

export function modeledFile(): ModeledFile {
  return modeled as unknown as ModeledFile;
}

function all() {
  return {
    report: reportData(),
    publicFiles: publicFiles(),
    modeled: modeledFile(),
    assumptions: assumptionsFile(),
  };
}

/** Every number the site may show, from all three sources. */
export function realRegistry(): SourcedNumber[] {
  return buildRegistry(all());
}

/** Every ref a model input or a double-counting rule may point to. */
export function knownRefs(): Set<string> {
  return refsOf(all());
}

/** The value of an assumption in data/assumptions.json; throws if it isn't listed. */
export function assumptionValue(id: string): number {
  const found = assumptionsFile().assumptions.find((a) => a.id === id);
  if (found === undefined) throw new Error(`Unknown assumption id: ${id}`);
  return found.value;
}
