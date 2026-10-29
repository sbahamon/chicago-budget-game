# Worklog — Chicago Budget Game v1 build

> **APPEND-ONLY.** Add new PROGRESS notes at the bottom. Never edit or reorder prior entries.
> This file is the source of truth for build progress. On resume, read it back first.
> Golden pins (humane-path ceiling) and any §8/§7c tuning are logged here as explicit, reviewed acts.

---

## 2026-06-27 — PROGRESS: scaffolding
- RED: n/a (harness setup; config is the TDD exception). No engine code yet.
- CHANGED: added package.json, tsconfig.json, vite.config.ts, index.html (TS + Vite + Vitest, vanilla view per approved plan).
- GREEN: pending `npm install` + first `vitest run` (expect "no tests" until first RED test is written).
- NEXT: install deps; write first failing test for `src/engine/data.ts` (getOption by real id) and watch it fail.

## 2026-06-27 — PROGRESS: data + realize layers green
- RED: data.test.ts then realize.test.ts each failed first on "module does not exist" (expected).
- CHANGED: added src/engine/types.ts, data.ts (getOption/directionFor/overlapGroups/isDollarRange; direction parsed from verify.dissent_taxonomy member lists, filtered to real ids), realize.ts (midpoint, basisNormalize ÷10 for ten_year_*, realizedBase, realizeDollar variants, countsToward).
- GREEN: 30/30 tests pass; `tsc --noEmit` clean (strict).
- NOTE: realize uses verify.figure as the verified source of dollar+basis; no figure → 0. Variants cover §6/§7c (scaled_back=LOW or 50%, defer/opposing_zero=0, opposing_max=base). push_harder defined but untested (not_far_enough dead code, §7c).
- NEXT: decisions.ts §7 — 15 standalone levers + 3 dials (band membership by leverage_tier, contested→HIGH, overlap dedup, recurring/one-time split) + forks. Write failing dial-band test first.

## 2026-06-27 — PROGRESS: decisions.ts §7 green (dials reproduce §7b)
- RED: decisions.test.ts failed first on missing module (expected).
- VERIFIED FIRST: a data-derived script reproduced ALL nine §7b band totals exactly (Fees 24.65/78.12/288.07; Personnel 11.80/58.10/177.80 rec + 14.10 1×; Ops 6.52/38.87/175.87) — banding algorithm locked before coding.
- CHANGED: src/engine/decisions.ts — 15 levers + 3 dials; dialMembers/dialBand (dedup reps + carve-outs ey-fees-vehicle-sticker-tax & institute-vacancy-freeze; positional cumulative banding, empty leading tiers collapse; recurring/one-time split by basis); leverVariants by direction.
- GREEN: 42/42 pass; tsc clean. No money literals in decisions.ts (all dollars via realize by id).
- NEXT: meters.ts §8 (METER_WEIGHTS config + meterDeltas) and endings.ts §9 (gapClosedPct, oneTimeShare excl upfront_cost, evaluateEnding). Write failing meter/ending tests first.

## 2026-06-27 — PROGRESS: meters §8 + endings §9 green
- RED: meters.test.ts + endings.test.ts failed first on missing modules (expected). One follow-on RED: a meters test wrongly used leverType "structural" for the TIF-surplus plug case — corrected to "one-time" (declare-maximum-tif-surplus is lever_type one-time per data), not an impl bug.
- CHANGED: src/engine/meters.ts (METER_WEIGHTS §8 config + meterLeverDeltas/meterDialDeltas; structural row takes priority, one_time/pv plug stacks when dollars>0); endings.ts (targetAmount from structural_gap by source+page, gapClosedPct, oneTimeShare excl upfront_cost, evaluateEnding §9 ordered branches); types.ts gained Meters/LeverOutcome/GameState/etc.
- GREEN: 67/67 pass; tsc clean.
- NEXT: engine.ts public API (createGame/applyChoice/evaluateEnding) + the per-decision/dial/fork matrix test asserting banked dollar_impact+basis+meter deltas match data by id.

## 2026-06-27 — PROGRESS: engine.ts API + per-decision matrix green
- RED: engine.test.ts failed first on missing module (expected).
- CHANGED: src/engine/engine.ts — createGame, applyChoice (levers→1 outcome; dials→recurring + optional one-time outcome since they count toward different targets; pure, no input mutation), re-exports availableDecisions/getDecision/evaluateEnding.
- GREEN: 108/108 pass; tsc clean. The 41-test engine matrix asserts every lever×variant and dial×level banked dollar_impact+basis+counts_toward+meter deltas match the data-by-id building blocks (realize/meters/decisions).
- NEXT: §11 playthrough tests — aggressive (≥100% all targets + near-term within epsilon of §7d), humane ceiling (surface ending, then pin golden, NOT ≥100%), upfront_cost guard. Add playThrough() helper.

## 2026-06-27 — PROGRESS: §11 playthrough tests green + humane golden pinned
- RED: playthrough.test.ts failed first (missing playThrough + fixture). Implemented playThrough() and ran a throwaway probe to OBSERVE the humane result before pinning.
- AGGRESSIVE (real playthrough): near_term 1758.14M (==SPEC §7d ~1758M oracle, constraint (b) satisfied), durable/stretch 1424.8M recurring — all ≥100%. ✓
- HUMANE ceiling (surfaced before pinning): 61.98% closed → "Midnight Budget Standoff" (NOT the §7d provisional 35-45%/Crisis). Reason: alt_caution/structural levers have base equity ≥0, so the equity-max path banks the menu's big non-regressive recurring revenue (secure-CPS/LGDF/procurement) at base; tragedy still holds (<100%). Pinned to test/fixtures/humane-ceiling.json with rationale; re-pin = explicit reviewed act.
- COMPLIANCE: refactored realize/endings/meters/data/playthrough tests so every dollar traces to a real option by id; money-literal scan of test/ is clean. GREEN: 115/115, tsc clean.
- NEXT: build the vanilla mayor-mode web view (engine untouched) + `npm run build`; grep src/ for stray money literals; commit.

## 2026-06-27 — PROGRESS: vanilla web view + final verification (BUILD COMPLETE)
- CHANGED: src/view (copy.ts = all player-facing strings; render.ts = DOM + formatUSD; main.ts = target→18 decisions→ending state machine), style.css, index.html wiring, src/engine/index.ts barrel, src/vite-env.d.ts. Engine untouched (SPEC §3 separation held).
- VERIFY: `npm run build` clean (tsc strict + vite, static dist/). Money-literal grep of src/ shows only fiscal-year labels, comments, and formatUSD display-unit thresholds — no hardcoded budget figures. Browser smoke test (Playwright) played a full 18-decision near-term game to an ending screen; only console error is favicon 404.
- GREEN: full suite 115/115; all SPEC §11 tests pass on real playthroughs.
- STATUS: v1 mayor mode complete and playable. NEXT (future): playtest-tune §8 weights; consider whether humane ceiling should read as Crisis vs near-miss (currently Midnight Budget Standoff, pinned).

## 2026-06-29 — PROGRESS: urgency & State-friction design pass (V1+V2+V3 view + E1 engine)
Design diagnosis (5 Playwright playthroughs) found the urgency drains: monotonic-shrinking gap, no clock, 18 equally-weighted cards, no escape hatch, consequences that only INFORM before a choice (the one-time no-count was a silent non-event), invisible meter cliffs, and the biggest levers adoptable as if Springfield were a rubber stamp. User chose bundle V1+V2+V3 (view) + E1 (engine), golden re-pin authorized. Test-first throughout (red→green); plan at ~/.claude/plans/this-is-the-chicago-glistening-karp.md.
- FOUNDATION: data.ts `stateStatus(id)` + curated STATE_DEPENDENT_IDS (cps/lgdf/sales/drones) / STATE_MIXED_IDS, each cited to its feasibility_note phrase. RED→GREEN in data.test.ts.
- V1 (view, golden untouched): copy STATE_CHIPS/STATE_FRICTION; narrative `stateFriction(option)`; render a "⚠ Needs Springfield" callout on State levers + a ledger "At risk, pending Springfield $X" tally (X = sum of engine at_risk_dollars).
- V3 (view, golden untouched): endings.ts exports ENDING_THRESHOLDS (the §9 branch numbers — no new figures); narrative `meterWarnings(meters)`; render colors PC/equity meters + a one-line cliff banner when crossed.
- V2 (view, golden untouched): copy BITE; narrative `biteLine(outcome,target)` (no_count → state_at_risk → opposing → regressive → structural); main.ts shows the bite as a flash on the next card, cleared on navigation. The no_count bite finally makes the durable one-time-plug "silent non-event" speak.
- E1 (ENGINE; **golden RE-PINNED**): realize.ts `STATE_CONFIRMED_SHARE=0.7` + `atRiskDollar` (§8-class tunable, scales a real data figure — no new budget number); LeverOutcome gains `at_risk_dollars`; meters.ts `state_dependent_extra=d(-4,0,0)` stacks when a State lever banks >0; engine.ts counts only confirmed dollars toward the gap. State levers' 30% at-risk share is "pending Springfield" and doesn't count.
- GOLDEN RE-PIN (explicit reviewed act, SPEC §11): humane near-term ceiling 0.6198→**0.5166**, ending **still Midnight Budget Standoff** (near-miss category preserved), PC −10→−22 (the −4×3 Springfield surcharge on adopted CPS/LGDF/sales). Fixture + rationale in test/fixtures/humane-ceiling.json. Cause: the humane path adopts CPS/LGDF at base + scales back sales — all State-dependent, so 30% now at-risk. Aggressive STILL closes ≥100% on all three targets (§7d invariant holds; near-term over-close $1.76B→$1.61B).
- VERIFY: full suite **164/164** green (was 145; +19 new); `tsc --noEmit` clean; `npm run build` clean; money-literal grep of src/ clean (only FY labels, formatUSD thresholds, the §8-class tunables). Live Playwright replay confirmed: Springfield tag + $52.5M at-risk on CPS adopt (gap counts $122.5M not $175M); state-at-risk + no_count bites fire (durable TIF surplus → "the gap doesn't move at all", still-to-close frozen $680M); PC/equity danger warnings + red meters on the aggressive crash.
- DOCS: synced after the pass — CLAUDE.md (no-invented-numbers rule now carves out §8-class
  tuning constants like STATE_CONFIRMED_SHARE/meter weights), SPEC.md (new §13 v1.1 addendum),
  new README.md (front door + run/test + file map).

## 2026-06-29 — PROGRESS: honesty splash screen (portfolio framing)
For the public portfolio build, added a dedicated click-through landing that makes the model's
limits unmistakable BEFORE play. View-only; engine + golden untouched (166/166 green).
- `narrative.splashFacts()` (pure, node-tested) derives the honest counts from the data/engine
  so they can't drift or read as invented: reports 3, options 194, dissents 45, decisions 18
  (15 levers + 3 dials), meters 4, targets 3, endings 7, stateLevers 4.
- `copy.SPLASH` — first-person, credited (Steffany Bahamon + Website/GitHub/LinkedIn href="#"
  TODO placeholders). Prose strings stay digit-free (numbers injected at render via splashFacts,
  same pattern as INTRO(gap)); no-invented-numbers guard extended to scan SPLASH.
- `main.renderSplash()` is the new landing (entry call `renderSplash()`); CTA "Take office →" →
  difficulty select; "Play again" still returns to difficulty (splash shows on fresh load only).
  Five real-vs-model blocks (red left-rule = my modeling: money/scoring, compressed, layered;
  blue = faithful: dissents, the point) + a by-the-numbers stat strip + a Sources line.
- VERIFY: tsc + build clean; suite 166/166; live Playwright confirmed the strip shows
  3/194/45/18/4/7, body lines inject ("4 of them need Springfield … 7 possible endings"), and
  the CTA advances to difficulty select. NEXT (user): fill the three link href placeholders in
  copy.ts SPLASH.links.

## 2026-10-29 — PROGRESS: v2 Phase 0 (REVAMP.md §13) — set up, no visible change at the root
v2 brief committed as REVAMP.md (it wins over CLAUDE.md on conflicts). Test-first throughout.
- DOCS: SPEC.md moved to docs/SPEC-v1.md (git mv); new SPEC.md (v2) written from REVAMP.
  CLAUDE.md rewritten for v2: three number sources, plan-based logic, plain-language rules;
  data-of-record schema + extraction contract kept (their SPEC refs now point to SPEC-v1).
- NUMBERS (RED→GREEN, test/data/provenance.test.ts): src/engine/provenance.ts (pure:
  extractFigures for $/ranges/percents/bare millions; registry over report + public +
  modeled + assumptions; findUnsourcedNumbers matching within displayed rounding;
  validators for each source's required provenance) + src/engine/sources.ts (loads the
  real files; data/public/*.json picked up by import.meta.glob). The scan covers every file
  in src/ + index.html: the existing v1 code had zero unsourced figures. A planted fake
  ("$123.45 million", "37.3%") fails; the same figure passes once registered in a source.
- DATA: data/assumptions.json (state_confirmed_share 0.7 moved here as a "judgment"
  assumption; realize.ts now reads it by id, value unchanged so the humane golden is
  untouched); data/modeled.json (empty models + interaction_rules, schema in "about");
  data/public/ + data/raw/public/ (empty, .gitkeep).
- PIPELINE: data/pipeline/ uv project (pyproject + uv.lock, pytest); provenance.py writes
  the public envelope deterministically and rejects missing provenance (10 tests, RED first).
- ROUTING + COPY (RED→GREEN): src/view/router.ts (parse/format `#page?params`, round-trips);
  copy.en.ts + copy.es.ts (same keys via the Copy type; nav, page titles/ledes, the nine
  glossary words) + i18n.ts; plainLanguage.ts (30-word sentence test, planted-long-sentence
  test, no "EAV" on screen). pages.ts renders placeholder v2 shells; main.ts routes the five
  hashes there and leaves the empty hash on the v1 game. `?lang=es` previews Spanish.
  Spanish copy is a DRAFT pending native review (ships Phase 4).
- METERS/ENDINGS: deliberately NOT deleted yet — the v1 game still serves the root and
  Phase 0 is "no visible changes". They go (with their tests) in Phase 2 when #gap replaces
  the v1 game. Old tests all still pass.
- CI: added .github/workflows/ci.yml (npm test + build; uv run pytest) on PRs and main.
  Added @types/node (dev) for the file scan.
- VERIFY: vitest 215/215 (was 166; +49), tsc clean, `npm run build` clean, pipeline 10/10.
  Playwright smoke at phone width: root still shows the v1 splash; each v2 hash renders its
  shell; nav + "back to the game" work; no console errors.
- NETWORK (for Phase 1+): reachable — data.cityofchicago.org, datacatalog.cookcountyil.gov,
  api.census.gov, cps.edu, pypi. Blocked (403) — cookcountyclerkil.gov, BGA
  (chicagobudget.bettergov.org), news.wttw.com. Clerk tax-rate/TIF reports will likely need
  a manual download into data/raw/public/.
- NEXT: Phase 1 (after Steffany answers REVAMP §14 Q5 — whether Strong Towns Chicago's City
  Finance Decoder already covers Part 1).

## 2026-10-29 — PROGRESS: Phase 0 decisions from Steffany (PR #1)
- Q5: Strong Towns Chicago's City Finance Decoder = inspiration only, numbers not trusted →
  Part 1 is built from primary sources in data/public/; no Decoder figures (SPEC §7).
- v1 game stays at the site root until Phase 2 (meters/endings deletion deferred, confirmed).
- Spanish draft: Steffany will get it reviewed by a Spanish speaker.
- ten_year_pv: spread figure ÷ 10 per year like v1, still labeled one-time. Recorded as
  judgment assumption `asset_sale_spread_years` (10) in data/assumptions.json; SPEC §5, §12.
- Still open for Phase 2: REVAMP §14 Q1, Q2, Q3, Q7. Phase 3: Q4. Launch: Q6.
