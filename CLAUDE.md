# Chicago Budget Game — Project Rules

## What this is
An interactive, data-grounded game where the player acts as Chicago's mayor closing
the city's structural budget gap by choosing among real reform options drawn from the
three reports in ./reports/. Modeled on the "you are the developer" structure of
Daniel Kay Hertz's affordable housing game. v1 is MAYOR MODE ONLY. A persona-based
"Chicagoan mode" is planned for v2 — keep the engine persona-agnostic so v2 is
additive, not a rewrite.

## Standing rules (apply every session, every turn)
- Test-first, red/green: write a failing test, make it pass, refactor. No feature
  without a test exercising a real playthrough — never placeholder/tautological tests.
- No dollar figure, percentage, or savings/revenue number may appear anywhere in the
  game or code that is not present in ./data/sources.json. If it's not in the data,
  it doesn't exist.
- Never edit, move, or overwrite the PDFs in ./reports/. They are read-only source.
- Any Python script uses uv (e.g. `uv run script.py`).
- Keep game logic (the engine) separate from rendering (the view). The engine emits
  structured outcomes — a lever's dollar impact, the group(s) affected, meter
  movements — and the view renders them. v2 adds a second view, not new engine logic.

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
- contested        — true | false (drives forks + dial HIGH routing per SPEC §7)
- leverage_tier    — small | medium | large | mega | one_time | none | zero
                     (banding for domain dials, SPEC §7b; thresholds in verify.meta)
- lever_type       — verified lever_type; lever_type_ok (bool),
                     lever_type_suggested (string|null) flag/justify any mismatch
- figure           — verified dollar figure, or null when no figure applies. Fields:
  - basis              — annual | one_time | upfront_cost | ten_year_cumulative |
                         ten_year_pv (drives target counting + realization, SPEC §6)
  - annual_equivalent  — basis-normalized recurring value (annual as-is; ten_year_*
                         ÷10; one_time/upfront_cost null); records the range HIGH end
  - annual_equivalent_approx — true when the normalization is approximate
  - dollar_estimate    — {low, high} (or point) figure as verified against the PDF
  - cited_page / found_pages / page_match — where the figure was located + match grade
  - basis_evidence / note / source_figure_note — verbatim/justification trail
  - figure_matches_source — bool; status — pass | flag; rechecked — bool

### structural_gap[] — list of 13 headline gap figures (NOT a single value)
Each: amount, fiscal_year_or_basis, page, report, source_body, verbatim_anchor.
The three difficulty targets (SPEC §2) cite specific entries from this list.

### top-level verify{} — corpus-wide verification artifacts
- dissent_taxonomy — { taxonomy[], total_dissents, opposing_split_ids[], validated[],
  notes }. `taxonomy[]` has 4 direction categories; each entry's `definition` lists its
  member ids. Engine derives a lever's dissent **direction** — one of {too_far,
  not_far_enough, alternative_or_caution, opposing_both} — from these member lists
  (SPEC §4). `opposing_split_ids` flags the A/B dual-dissent options (note: only
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