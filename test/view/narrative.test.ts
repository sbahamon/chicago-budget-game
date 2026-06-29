// View-layer narrative logic (pure, DOM-free) exercised against real options from
// sources.enriched.json. No engine logic is touched; these helpers only compose
// engine outputs + copy. CLAUDE.md: every number stays sourced from the data.

import { describe, it, expect } from "vitest";
import {
  characterFor,
  dissentSpeech,
  choiceLabels,
  consequenceLine,
  consequenceIcon,
  parseFeasibility,
  splitCrossRefs,
  choiceStatus,
  shortfall,
  actFor,
  stateFriction,
  meterWarnings,
  biteLine,
  splashFacts,
} from "../../src/view/narrative";
import {
  CHARACTERS,
  CHOICE_LABELS,
  CONSEQUENCE,
  ACTS,
  SHORTFALL_LINE,
  INTRO,
  STATE_FRICTION,
  WARNINGS,
  BITE,
  SPLASH,
} from "../../src/view/copy";
import {
  createGame,
  applyChoice,
  availableDecisions,
  getOption,
  getDecision,
  directionFor,
  leverVariants,
  targetAmount,
  gapClosedPct,
} from "../../src/engine/index";

describe("characterFor — generic archetype per dissent direction", () => {
  it("gives a distinct, non-empty archetype for each contested direction", () => {
    const a = characterFor("too_far");
    const b = characterFor("alternative_or_caution");
    const c = characterFor("opposing_both");
    for (const ch of [a, b, c]) {
      expect(ch).not.toBeNull();
      expect(ch!.archetype.length).toBeGreaterThan(0);
      expect(ch!.role.length).toBeGreaterThan(0);
    }
    const archetypes = [a!.archetype, b!.archetype, c!.archetype];
    expect(new Set(archetypes).size).toBe(3); // all distinct
  });

  it("returns null when there is no dissent (direction null)", () => {
    expect(characterFor(null)).toBeNull();
  });

  it("never names a real task-force member — archetypes are role descriptors", () => {
    // Generic-archetype guard: an archetype should describe a role, not a person.
    for (const ch of Object.values(CHARACTERS)) {
      expect(ch.archetype.toLowerCase()).toContain("task force");
    }
  });
});

describe("dissentSpeech — fictional speaker, faithful cited argument", () => {
  it("carries the option's real dissent_summary verbatim as the argument", () => {
    const option = getOption("reinstitute-head-tax"); // too_far, has dissent
    const speech = dissentSpeech(option, directionFor(option.id));
    expect(speech).not.toBeNull();
    expect(speech!.argument).toBe(option.dissent_summary);
    expect(speech!.speaker).toBe(characterFor(directionFor(option.id))!.archetype);
  });

  it("keeps the page cite that lives in the source dissent text", () => {
    const option = getOption("reinstitute-head-tax");
    const speech = dissentSpeech(option, directionFor(option.id))!;
    expect(speech.argument).toMatch(/\(p\.?\s?\d+\)/); // e.g. "(p59)"
  });

  it("returns null for an uncontested option with no dissent", () => {
    const option = getOption("ey-procurement-category-management");
    expect(dissentSpeech(option, directionFor(option.id))).toBeNull();
  });
});

describe("choiceLabels — side-with vs overrule framing per direction", () => {
  it("offers a label for every variant the lever actually presents", () => {
    for (const decision of availableDecisions()) {
      if (decision.kind !== "lever") continue;
      const labels = choiceLabels(decision.direction);
      for (const v of leverVariants(decision.direction)) {
        expect(labels[v]).toBeTruthy();
      }
    }
  });

  it("frames a too_far lever as overrule (base) vs side-with (scaled_back)", () => {
    const labels = choiceLabels("too_far");
    expect(labels.base!.toLowerCase()).toContain("overrule");
    expect(labels.scaled_back!.toLowerCase()).toContain("side with");
  });
});

describe("consequenceLine — second-order meaning from basis + target", () => {
  it("calls a recurring lever a recurring fix", () => {
    const option = getOption("reinstitute-head-tax"); // annual
    expect(consequenceLine(option, "near_term")).toBe(CONSEQUENCE.recurring);
  });

  it("warns a one-time fix reopens the gap under near_term (where it still counts)", () => {
    const option = getOption("declare-maximum-tif-surplus"); // one_time
    expect(consequenceLine(option, "near_term")).toBe(CONSEQUENCE.one_time_counts);
  });

  it("flags that one-time money doesn't count under the durable target", () => {
    const option = getOption("declare-maximum-tif-surplus"); // one_time
    expect(consequenceLine(option, "durable")).toBe(CONSEQUENCE.one_time_no_count);
    expect(consequenceLine(option, "stretch")).toBe(CONSEQUENCE.one_time_no_count);
  });
});

describe("shortfall — composes engine gap math, invents nothing", () => {
  it("matches targetAmount − gap_progress and gapClosedPct after real choices", () => {
    let game = createGame("near_term");
    game = applyChoice(game, "reinstitute-head-tax", "base").state;
    game = applyChoice(game, "adjust-city-property-tax", "base").state;

    const s = shortfall(game);
    const target = targetAmount("near_term");
    expect(s.target).toBe(target);
    expect(s.closed).toBe(game.meters.gap_progress);
    expect(s.short).toBe(target - game.meters.gap_progress);
    expect(s.pct).toBeCloseTo(gapClosedPct(game), 10);
  });

  it("never reports a negative shortfall once the gap is over-closed", () => {
    let game = createGame("near_term");
    // gap_progress is a raw sum; shortfall floors at 0 for display sanity.
    game = { ...game, meters: { ...game.meters, gap_progress: targetAmount("near_term") + 1 } };
    expect(shortfall(game).short).toBe(0);
  });
});

describe("actFor — contiguous acts over the fixed 18-decision sequence", () => {
  it("assigns every decision index to exactly one act, contiguously", () => {
    const n = availableDecisions().length;
    expect(n).toBe(18);
    const acts = Array.from({ length: n }, (_, i) => actFor(i).number);
    // contiguous & non-decreasing: each act is an unbroken run
    for (let i = 1; i < acts.length; i++) {
      expect(acts[i]).toBeGreaterThanOrEqual(acts[i - 1]!);
      expect(acts[i]! - acts[i - 1]!).toBeLessThanOrEqual(1);
    }
    expect(new Set(acts).size).toBe(ACTS.length);
    expect(acts[0]).toBe(1);
    expect(acts[n - 1]).toBe(ACTS.length);
  });

  it("gives each act a title and blurb", () => {
    const a = actFor(0);
    expect(a.title.length).toBeGreaterThan(0);
    expect(a.blurb.length).toBeGreaterThan(0);
  });
});

// Whitespace-insensitive word multiset, to prove parsing drops/alters no text.
function tokens(s: string): string[] {
  return s.trim().split(/\s+/).filter(Boolean).sort();
}

describe("parseFeasibility — pull the Impact/Feasibility/Timing lead into badges", () => {
  it("extracts the three grades, keeping any parenthetical qualifier", () => {
    const note = getOption(
      "cfftf-re-expand-sales-tax-base-consumer-services",
    ).feasibility_note;
    const { badges, body } = parseFeasibility(note);
    expect(badges).toEqual([
      { label: "Impact", value: "High" },
      { label: "Feasibility", value: "Medium (state legislation required)" },
      { label: "Timing", value: "Long" },
    ]);
    expect(body.startsWith("After State adoption")).toBe(true);
  });

  it("leaves notes without the triplet untouched (no badges)", () => {
    const note = getOption("expand-congestion-surcharge-rideshare").feasibility_note;
    const { badges, body } = parseFeasibility(note);
    expect(badges).toEqual([]);
    expect(body).toBe(note);
  });

  it("is lossless — badges + body reconstruct the original note word-for-word", () => {
    for (const id of [
      "cfftf-re-expand-sales-tax-base-consumer-services",
      "cfftf-ltl-secure-cps-pension-contributions",
      "expand-congestion-surcharge-rideshare",
      "reinstitute-head-tax",
    ]) {
      const note = getOption(id).feasibility_note;
      const { badges, body } = parseFeasibility(note);
      const recon = badges.length
        ? `Impact ${badges[0]!.value} / Feasibility ${badges[1]!.value} / Timing ${badges[2]!.value}. ${body}`
        : body;
      expect(tokens(recon)).toEqual(tokens(note));
    }
  });
});

describe("splitCrossRefs — demote 'also analyzed in' notes to a footnote, losslessly", () => {
  it("peels a trailing 'Also analyzed in …' sentence", () => {
    const { main, refs } = splitCrossRefs(
      "After State adoption, the City would review existing consumption-based taxes to ensure economic growth. Also analyzed in CFFTF Interim Report (p.53).",
    );
    expect(main).toBe(
      "After State adoption, the City would review existing consumption-based taxes to ensure economic growth.",
    );
    expect(refs).toEqual(["Also analyzed in CFFTF Interim Report (p.53)."]);
  });

  it("peels a trailing '(Also included in …)' parenthetical", () => {
    const affected = getOption(
      "cfftf-re-expand-sales-tax-base-consumer-services",
    ).who_is_affected;
    const { main, refs } = splitCrossRefs(affected);
    expect(refs).toEqual(["(Also included in the Interim Report.)"]);
    expect(main.endsWith("(requires State legislation).")).toBe(true);
  });

  it("returns the text unchanged when there is no cross-reference", () => {
    const note = getOption("reinstitute-head-tax").feasibility_note;
    expect(splitCrossRefs(note)).toEqual({ main: note, refs: [] });
  });

  it("is lossless — main + refs reconstruct the original word-for-word", () => {
    for (const id of [
      "cfftf-re-expand-sales-tax-base-consumer-services",
      "cfftf-ltl-secure-cps-pension-contributions",
      "increase-autonomous-drones-cpd",
    ]) {
      const o = getOption(id);
      for (const text of [o.who_is_affected, o.feasibility_note]) {
        const { main, refs } = splitCrossRefs(text);
        expect(tokens([main, ...refs].join(" "))).toEqual(tokens(text));
      }
    }
  });
});

describe("consequenceIcon — a glyph cueing recurring vs one-time", () => {
  it("distinguishes a recurring lever from a one-time plug", () => {
    const recurring = consequenceIcon(getOption("reinstitute-head-tax"));
    const oneTime = consequenceIcon(getOption("declare-maximum-tif-surplus"));
    expect(recurring.length).toBeGreaterThan(0);
    expect(oneTime.length).toBeGreaterThan(0);
    expect(recurring).not.toBe(oneTime);
  });
});

describe("choiceStatus — categorize a decision for the map + split ledger", () => {
  it("marks an undecided decision (no choice yet)", () => {
    expect(choiceStatus(getDecision("adjust-city-property-tax"), null)).toBe("undecided");
  });

  it("marks adopting at full strength", () => {
    expect(choiceStatus(getDecision("adjust-city-property-tax"), "base")).toBe("adopted");
    expect(choiceStatus(getDecision("institute-vacancy-freeze"), "opposing_max")).toBe(
      "adopted",
    );
    expect(choiceStatus(getDecision("ey-procurement-category-management"), "base")).toBe(
      "adopted",
    );
  });

  it("marks scaling a too_far lever back", () => {
    expect(choiceStatus(getDecision("adjust-city-property-tax"), "scaled_back")).toBe("scaled");
  });

  it("marks passing — defer or hold-the-line bank $0", () => {
    expect(choiceStatus(getDecision("cfftf-ltl-secure-cps-pension-contributions"), "defer")).toBe(
      "passed",
    );
    expect(choiceStatus(getDecision("institute-vacancy-freeze"), "opposing_zero")).toBe("passed");
    expect(choiceStatus(getDecision("ey-procurement-category-management"), "defer")).toBe("passed");
  });

  it("treats any chosen dial level as adopted", () => {
    expect(choiceStatus(getDecision("fees_fines"), "low")).toBe("adopted");
    expect(choiceStatus(getDecision("fees_fines"), "high")).toBe("adopted");
    expect(choiceStatus(getDecision("fees_fines"), null)).toBe("undecided");
  });
});

describe("stateFriction — surface who actually controls a lever (V1)", () => {
  it("tags a State-dependent lever as needing Springfield", () => {
    const f = stateFriction(getOption("cfftf-re-increase-lgdf-share-rate"));
    expect(f).not.toBeNull();
    expect(f!.status).toBe("state");
    expect(f!.tag.length).toBeGreaterThan(0);
    expect(f!.line).toBe(STATE_FRICTION.state);
  });

  it("tags a mixed-jurisdiction lever distinctly from a State-dependent one", () => {
    const mixed = stateFriction(getOption("establish-autonomous-taxi-framework"));
    expect(mixed!.status).toBe("mixed");
    expect(mixed!.line).toBe(STATE_FRICTION.mixed);
    expect(mixed!.tag).not.toBe(stateFriction(getOption("cfftf-re-increase-lgdf-share-rate"))!.tag);
  });

  it("returns null for a City-controlled lever", () => {
    expect(stateFriction(getOption("reinstitute-head-tax"))).toBeNull();
  });
});

describe("meterWarnings — make the cliffs visible before you fall off (V3)", () => {
  it("warns when political capital is fracturing and danger when it is collapsing", () => {
    const fracturing = meterWarnings({ political_capital: 35, equity: 0 });
    expect(fracturing.some((w) => w.meter === "political_capital" && w.level === "warn")).toBe(true);

    const collapsing = meterWarnings({ political_capital: 10, equity: 0 });
    expect(collapsing.some((w) => w.meter === "political_capital" && w.level === "danger")).toBe(
      true,
    );
  });

  it("raises the austerity-equity danger once equity crosses the ending threshold", () => {
    const w = meterWarnings({ political_capital: 100, equity: -45 });
    expect(w.some((x) => x.meter === "equity" && x.level === "danger")).toBe(true);
    expect(w.every((x) => WARNINGS[`${x.meter}_${x.level}` as keyof typeof WARNINGS] === x.text)).toBe(
      true,
    );
  });

  it("is silent while every meter is healthy", () => {
    expect(meterWarnings({ political_capital: 100, equity: 0 })).toEqual([]);
  });
});

describe("biteLine — consequences that bite right after the choice (V2)", () => {
  it("calls out the silent non-event: a one-time plug that doesn't count under durable", () => {
    const { outcomes } = applyChoice(createGame("durable"), "declare-maximum-tif-surplus", "base");
    expect(biteLine(outcomes[0]!, "durable")).toBe(BITE.no_count);
  });

  it("bites that a State-dependent lever's money is at risk pending Springfield", () => {
    const { outcomes } = applyChoice(
      createGame("near_term"),
      "cfftf-re-increase-lgdf-share-rate",
      "base",
    );
    expect(biteLine(outcomes[0]!, "near_term")).toBe(BITE.state_at_risk);
  });

  it("bites the no-win when you take an opposing-both branch", () => {
    const { outcomes } = applyChoice(
      createGame("near_term"),
      "institute-vacancy-freeze",
      "opposing_max",
    );
    expect(biteLine(outcomes[0]!, "near_term")).toBe(BITE.opposing);
  });

  it("says nothing for a clean recurring city lever that counts in full", () => {
    const { outcomes } = applyChoice(createGame("near_term"), "ey-procurement-category-management", "base");
    expect(biteLine(outcomes[0]!, "near_term")).toBeNull();
  });
});

describe("splashFacts — the honesty numbers, derived from the data (not hardcoded)", () => {
  it("reports the real corpus + game-shape counts", () => {
    const f = splashFacts();
    expect(f.options).toBe(194); // the verified data of record
    expect(f.reports).toBe(3); // CFFTF interim + final, EY
    expect(f.decisions).toBe(18); // what the player actually faces
    expect(f.levers).toBe(15);
    expect(f.dials).toBe(3);
    expect(f.levers + f.dials).toBe(f.decisions);
    expect(f.targets).toBe(3); // near-term / durable / stretch
    expect(f.endings).toBe(7);
    expect(f.meters).toBe(4);
  });

  it("counts the real dissents and the State-dependent levers honestly", () => {
    const f = splashFacts();
    expect(f.dissents).toBe(45); // options carrying a dissent in the data of record
    expect(f.stateLevers).toBe(4); // cps, lgdf, sales-base, drones
  });
});

describe("no-invented-numbers guard — copy holds no hardcoded figures", () => {
  it("contains no $-amount, %-amount, or million/billion literal in any template", () => {
    const strings: string[] = [];
    for (const ch of Object.values(CHARACTERS)) strings.push(ch.archetype, ch.role);
    for (const dir of Object.values(CHOICE_LABELS))
      for (const v of Object.values(dir)) strings.push(v as string);
    for (const c of Object.values(CONSEQUENCE)) strings.push(c);
    for (const s of Object.values(STATE_FRICTION)) strings.push(s);
    for (const w of Object.values(WARNINGS)) strings.push(w);
    for (const b of Object.values(BITE)) strings.push(b);
    // SPLASH: prose (strings) only — its numbers are injected at render from splashFacts.
    for (const v of Object.values(SPLASH)) if (typeof v === "string") strings.push(v);
    for (const a of ACTS) strings.push(a.title, a.blurb);
    // template fns: feed digit-free sentinels so any literal digit must be the template's own
    strings.push(SHORTFALL_LINE({ pct: "<PCT>", short: "<SHORT>" }));
    strings.push(INTRO("<GAP>"));

    const blob = strings.join("  ");
    expect(blob).not.toMatch(/\$\s*\d/); // "$1.15B"
    expect(blob).not.toMatch(/\d\s*%/); // "62%"
    expect(blob).not.toMatch(/\b\d[\d,.]*\s*(million|billion|m\b|b\b|k\b)/i);
  });
});
