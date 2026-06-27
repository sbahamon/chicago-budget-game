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
