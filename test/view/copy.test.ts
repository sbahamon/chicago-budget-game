// v2 on-screen text (REVAMP §5, §7): English + Spanish copy files and the
// plain-language rules every on-screen string must follow.

import { describe, it, expect } from "vitest";
import { en } from "../../src/view/copy.en";
import { es } from "../../src/view/copy.es";
import { copyFor, LANGS } from "../../src/view/i18n";
import { PAGES } from "../../src/view/router";
import {
  allStrings,
  sentences,
  wordCount,
  longSentences,
  MAX_SENTENCE_WORDS,
} from "../../src/view/plainLanguage";

/** Every key path in a nested copy object, e.g. "glossary.levy.term". */
function keyPaths(value: unknown, prefix = ""): string[] {
  if (typeof value !== "object" || value === null) return [prefix];
  return Object.entries(value).flatMap(([k, v]) => keyPaths(v, prefix ? `${prefix}.${k}` : k));
}

describe("copy files — English and Spanish stay in lockstep", () => {
  it("Spanish has exactly the same keys as English", () => {
    expect(keyPaths(es).sort()).toEqual(keyPaths(en).sort());
  });

  it("no on-screen string is empty in either language", () => {
    for (const s of [...allStrings(en), ...allStrings(es)]) {
      expect(s.trim().length).toBeGreaterThan(0);
    }
  });

  it("copyFor picks the language, and every language is listed", () => {
    expect(LANGS).toEqual(["en", "es"]);
    expect(copyFor("en")).toBe(en);
    expect(copyFor("es")).toBe(es);
  });

  it("has a nav label and a page title for each of the five pages", () => {
    for (const page of PAGES) {
      expect(en.nav[page].length).toBeGreaterThan(0);
      expect(en.pages[page].title.length).toBeGreaterThan(0);
      expect(en.pages[page].lede.length).toBeGreaterThan(0);
    }
  });
});

describe("glossary — the REVAMP word list, defined the same way", () => {
  const WORDS = [
    "levy",
    "taxRate",
    "taxableValue",
    "tifDistrict",
    "tifSurplus",
    "corporateFund",
    "oneTimeMoney",
    "recurringMoney",
    "springfield",
  ];

  it("defines all nine words in both languages", () => {
    expect(Object.keys(en.glossary).sort()).toEqual([...WORDS].sort());
    for (const w of WORDS) {
      const key = w as keyof typeof en.glossary;
      expect(en.glossary[key].term.length).toBeGreaterThan(0);
      expect(en.glossary[key].definition.length).toBeGreaterThan(0);
      expect(es.glossary[key].definition.length).toBeGreaterThan(0);
    }
  });

  it("never shows the term EAV on screen — it's 'taxable value' (REVAMP §7)", () => {
    for (const s of [...allStrings(en), ...allStrings(es)]) {
      expect(s).not.toMatch(/\bEAV\b/);
    }
  });
});

describe("plainLanguage — sentence-length checker (REVAMP §7)", () => {
  it("splits text into sentences and counts words", () => {
    expect(sentences("One two. Three four five? Six!")).toEqual([
      "One two.",
      "Three four five?",
      "Six!",
    ]);
    expect(wordCount("The city's main day-to-day budget.")).toBe(5);
  });

  it("catches a planted sentence that runs over the limit", () => {
    const planted = Array.from({ length: MAX_SENTENCE_WORDS + 1 }, () => "word").join(" ") + ".";
    expect(longSentences(["Short and fine.", planted])).toEqual([planted]);
  });

  it("allows a sentence of exactly the limit", () => {
    const ok = Array.from({ length: MAX_SENTENCE_WORDS }, () => "word").join(" ") + ".";
    expect(longSentences([ok])).toEqual([]);
  });

  it("no on-screen sentence in either language runs over 30 words", () => {
    expect(MAX_SENTENCE_WORDS).toBe(30);
    expect(longSentences(allStrings(en))).toEqual([]);
    expect(longSentences(allStrings(es))).toEqual([]);
  });
});
