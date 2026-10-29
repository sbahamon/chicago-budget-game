# Chicago Budget Game — Project Rules

## What this is
A data-grounded website about Chicago's budget, in three parts that share one 10-year
scoreboard: **Follow the dollar** (`#follow`), **Close the gap** (`#gap`, build a plan
from real options in any order) and **Grow the base** (`#grow`, zoning and long-term tax
value), plus `#math` and `#sources`. v2 replaces the v1 mayor game (fixed decision order,
four meters, seven endings). `REVAMP.md` is the brief and phase plan; `SPEC.md` is the
design of record (v1 spec archived at `docs/SPEC-v1.md`). **If REVAMP.md and this file
disagree, follow REVAMP.md and fix this file.** Work one REVAMP §13 phase per session,
one pull request per phase. REVAMP §14 questions are Steffany's to answer: ask, don't guess.

Until Phase 2 replaces it, the v1 game still serves the site root (empty hash); its
meters/endings/decision-sequence code is deleted together with its tests when `#gap` ships.

## Standing rules (apply every session, every turn)
- Test-first, red/green: write a failing test, make it pass, refactor. No feature
  without a test exercising real data or a real plan — never placeholder/tautological tests.
- **No made-up numbers.** Every dollar figure, percentage, or savings/revenue number in
  the site or code must trace to one of three sources (SPEC §3):
  1. **report** — `data/sources.enriched.json` (rules below, unchanged);
  2. **public** — `data/public/*.json`, built by `data/pipeline/*.py`; each figure records
     its link, dataset or PDF page, download date and raw file (kept in
     `data/raw/public/`), and the file names its script;
  3. **modeled** — `data/modeled.json` (formula + input refs + assumption ids) and
     `data/assumptions.json` (each assumption `sourced` with a link, or `judgment` with a
     rationale; the Math page lists them all).
  `test/data/provenance.test.ts` validates all three and scans every file in `src/` and
  `index.html`: a money/percent figure that matches no registered number fails the build.
  Game-design scaling factors (e.g. `state_confirmed_share`, the Springfield partial
  credit) are `judgment` assumptions in `assumptions.json`, read by the engine by id —
  never inline magic numbers. They scale a real figure; they assert no budget number.
- Never edit, move, or overwrite the PDFs in ./reports/. New PDFs may be added there.
- Any Python script uses uv (e.g. `uv run script.py`); the pipeline is a uv project in
  `data/pipeline/` (`uv run pytest`). Pipeline scripts are deterministic and each has a
  test checking a total against its source document.
- Keep game logic (the engine, `src/engine/`) separate from rendering (the view,
  `src/view/`). The engine emits facts; the view decides how to show them.

## Plan-based game logic (SPEC §5)
- A **plan** is an unordered set of chosen options, each with a setting (how far it's
  turned up) and any switches. Order never matters. Plans are encoded in the link
  (`#gap?plan=...`) so a shared link reopens the same plan.
- Every option yields **ten yearly amounts** (FY2027 on): one-time money in year 1 only;
  recurring money every year; growth ramps per `assumptions.json`. Springfield partial
  credit applies every year. The baseline is the city's 2027 budget forecast.
- Each option reports: its yearly amounts (city, and CPS where relevant), one-time vs
  recurring, who pays or loses a service, Springfield status, confidence, source refs,
  and any recorded dissent.
- **No double counting:** `modeled.json` `interaction_rules` (`exclusive` | `shrinks`)
  are enforced by the engine.
- The scoreboard reports baseline vs plan gap over 10 years, closed in year 1 and year
  10, and the one-time share; a whole-bill view adds CPS (whole-bill = city + CPS).

## Plain-language rules (everything on screen; SPEC §6)
- All on-screen text lives in `src/view/copy.en.ts` and `src/view/copy.es.ts` (same
  keys, enforced). No dollar/percent figure in copy: numbers come from data at render.
- Write for someone who has never read a budget; aim under 20 words per sentence. A test
  fails any on-screen sentence over 30 words.
- Never show "EAV" on screen — say "taxable value" (tested). Use the glossary words
  defined the same way, with tap-to-define on first use.
- Turn big numbers into personal ones (per household, per dollar). Name what an option
  does, with the report title in smaller text underneath.
- Stay neutral in Parts 1 and 2: every side presented the same way, credited to its
  source; never say which plan "wins".

## Source of truth: ./data/sources.enriched.json
The data of record (194 options). `data/sources.json` is the pre-verification raw
extract; the engine and SPEC read `sources.enriched.json`, which adds a per-option
`verify` block and a top-level `verify` object. Reconciliation: `data/VERIFY_REPORT.md`.

Top-level shape: `{ options[], structural_gap[], verify{} }`.

### options[] — one entry per reform/revenue/savings option
Base fields (as originally extracted, exactly as stated; null if none):
- id               — short stable slug
- name             — option name as titled in the report
- source_body      — "CFFTF" or "EY" (which report family it comes from)
- report           — specific report + ./reports/ filename
- page             — page number
- lever_type       — "revenue" | "cut" | "structural" | "one-time"
- timing           — "one-time" | "recurring", as stated
- dollar_estimate  — number or {low, high} range, exactly as stated; null if none
- unit             — e.g. "USD/year"
- who_is_affected  — who bears the cost / who benefits, as the report frames it
- feasibility_note — stated constraints, agreement level, or caveats
- has_dissent      — true | false
- dissent_summary  — faithful paraphrase of the dissent + page cite; null if none
- verbatim_anchor  — a short (<15 word) phrase to locate it in the PDF
- also_reported_in — list of other reports/ids carrying the same option ([] if none)

Per-option `verify{}` block (verification + engine-facing enrichment):
- domain           — option domain, one of: fees_fines, fleet, governance_process,
                     library_culture, operations_efficiency, other, pensions,
                     personnel_benefits, procurement, public_safety,
                     real_estate_assets, revenue_tax, tif, transportation_mobility
- contested        — true | false (drives forks + dial HIGH routing per SPEC-v1 §7)
- leverage_tier    — small | medium | large | mega | one_time | none | zero
                     (banding for domain dials, SPEC-v1 §7b; thresholds in verify.meta)
- lever_type       — verified lever_type; lever_type_ok (bool),
                     lever_type_suggested (string|null) flag/justify any mismatch
- figure           — verified dollar figure, or null when no figure applies. Fields:
  - basis              — annual | one_time | upfront_cost | ten_year_cumulative |
                         ten_year_pv (drives target counting + realization, SPEC-v1 §6)
  - annual_equivalent  — basis-normalized recurring value (annual as-is; ten_year_*
                         ÷10; one_time/upfront_cost null); records the range HIGH end
  - annual_equivalent_approx — true when the normalization is approximate
  - dollar_estimate    — {low, high} (or point) figure as verified against the PDF
  - cited_page / found_pages / page_match — where the figure was located + match grade
  - basis_evidence / note / source_figure_note — verbatim/justification trail
  - figure_matches_source — bool; status — pass | flag; rechecked — bool

### structural_gap[] — list of 13 headline gap figures (NOT a single value)
Each: amount, fiscal_year_or_basis, page, report, source_body, verbatim_anchor.
The three difficulty targets (SPEC-v1 §2) cite specific entries from this list.

### top-level verify{} — corpus-wide verification artifacts
- dissent_taxonomy — { taxonomy[], total_dissents, opposing_split_ids[], validated[],
  notes }. `taxonomy[]` has 4 direction categories; each entry's `definition` lists its
  member ids. Engine derives a lever's dissent **direction** — one of {too_far,
  not_far_enough, alternative_or_caution, opposing_both} — from these member lists
  (SPEC-v1 §4). `opposing_split_ids` flags the A/B dual-dissent options (note: only
  institute-vacancy-freeze and increase-autonomous-drones-cpd are genuinely opposing).
- overlap_groups — list of dedup groups; each: kind (umbrella_vs_components |
  internal_component | granular_vs_grouping | multi_way_same_asset), member_ids[],
  name, citation, rationale. The engine/dials keep ONE representation per group (§7b).
- figure_summary — corpus counts by_basis / by_leverage_tier + pass/flag totals.
- gap_reconcile — { targets, figures, narrative } reconciling the structural_gap set.
- meta — generation method, page rule, annual_equivalent_rule, tier_thresholds.

## Extraction contract (subagents)
Subagents return ONLY structured data matching the schema above — never raw report
text dumped into the parent context. Capture figures and dissents exactly as stated;
do not estimate, round, or editorialize. Verification/enrichment is faithful too:
- `dollar_estimate` is verified against the PDF, never re-estimated; `figure.basis`
  classifies HOW the figure is stated (annual vs one-time vs 10-yr), it does not
  change the number. `annual_equivalent` only normalizes per the stated rule.
- Dissent **direction** is preserved exactly. A dissent arguing an option goes TOO FAR
  and one arguing it DOESN'T GO FAR ENOUGH are different; `opposing_both` (genuine A/B
  too_far + not_far_enough) is distinct from `alternative_or_caution`. Classify by what
  the dissenter actually argued, cited to a page — never collapse the four directions.
- `overlap_groups` record real double-counting risks; do not invent groups to dedup
  options the data of record keeps distinct.

## End-of-extraction handoff: ./EXTRACTION_NOTES.md
As the final step of extraction, write a short EXTRACTION_NOTES.md (not the full data)
covering: total option count and CFFTF/EY split; how many options carry a dissent
plus a one-line gist of each; the structural_gap figure as captured; and any figures
that were ambiguous, ranged, or hard to pin to a page. This seeds verification.