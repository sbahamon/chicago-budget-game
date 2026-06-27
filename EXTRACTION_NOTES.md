# Extraction Notes — `data/sources.json`

Handoff per CLAUDE.md. This seeds verification; it is **not** the data itself (see
`data/sources.json`). Raw per-report extractions are preserved in `data/raw/` so the
merge can be re-run without re-reading the PDFs (`uv run data/merge.py`).

## 1. Counts
- **Total options: 194** (after merge). Raw extracted: 224 → 30 clean 1:1 duplicates collapsed.
- **Source split: CFFTF = 137, EY = 57.**
  - Raw by report: CFFTF Final 58, CFFTF Interim 89, EY 77.
  - `source_body` is the *primary* source on each row; 30 rows carry an `also_reported_in`
    pointer to the other report(s) where the same lever appears.
- Lever types: revenue 72, cut 59, structural 57, one-time 6.
- Timing: recurring 185, one-time 9.
- Options with a dollar estimate: 122 (the 72 without are mostly the Final report's
  qualitative policy/governance recommendations, which it rates High/Med/Low rather than $).

## 2. Structural gap — ALL figures captured (the reports disagree; per your instruction)
`structural_gap` is an array of 13 figures, each with source + page. The headline framings:
- **CFFTF Final — $680M, FY2027** projected Corporate Fund structural shortfall (p.5); a
  CTBA-attributed long-term range of **$680M–$780M/yr beginning FY27** (p.10). The Final
  report *characterizes the Interim's gap as "$1.2B" FY2026* (p.6).
- **CFFTF Interim — ~$1.1B / "over $1.1 billion" FY2026** (p.7, p.10) and **$982.4M FY2025**
  (p.10). Note: the Interim itself says **$1.1B**, while the Final report quotes it as $1.2B
  — an inconsistency *between* the two CFFTF reports, now both captured verbatim.
- **EY — ~$1.15B FY2026** Corporate Fund gap and **~$146M FY2025** deficit (p.4).
- Context figures also captured: City unfunded pension liabilities **$35.9B** (Interim p.11);
  CPS pension share **~$175M/yr** (EY p.4); City supplemental pension payments **>$820M since
  2023** (EY p.4); EY total identified savings **$530M–$1.396B** across nine workstreams (p.5).

➡️ The "which gap does the player close" decision is deferred to game-design time, as agreed.

## 3. Dissents — 45 options carry a faithful, direction-preserving dissent
Direction is preserved explicitly in each summary (goes TOO FAR vs DOES NOT GO FAR ENOUGH vs
alternative/caution; Dissent A/B/C splits kept). One-line gist of each:

- **Prioritize the Advanced Supplemental Payment** (CFFTF, p.30): argues the slate should also address the pension *liability* itself, not just the contribution side (one-sided/incomplete — not "too far").
- **Secure CPS Contributions to City Pensions** (CFFTF, p.31): City/CPS/State relationship is complex; more analysis needed; may be better aimed at State legislation.
- **Offer Voluntary Buy-Outs** (CFFTF, p.31): produces no net pension benefit (NPV-neutral) and could strain plan assets via accelerated withdrawals.
- **Dedicate External Funding to Pay ADC** (CFFTF, p.32): Two dissents. A — targeting 100% funding (vs 90% State law) overburdens today's taxpayers; B — better to evaluate lowering the funding-percentage target.
- **Require State Fiscal Note for New Pension Legislation** (CFFTF, p.33): City already can estimate fiscal impact and advise the GA; existing tools may be more practical than new legislation.
- **Require State-Dedicated Funding for State Actions Increasing Pension Costs** (CFFTF, p.33): unintended consequences — could commit existing revenues and give the GA a role in the City's budget.
- **Benchmark Taxes, Fees, and Expenditures Continuously** (CFFTF, p.46): should fully explore higher-income/large-business taxing options alongside benchmarking (not far enough).
- **Pursue Graduated Income Tax Authorization** (CFFTF, p.48): tax-structure changes should be weighed in the broader State/City structural and economic context.
- **Restructure Electricity Tax Rates** (CFFTF, p.49): consider business-climate impact; do comprehensive analysis before changing.
- **Consolidate CPL Management Reporting** (CFFTF, p.55): shared library dissent (recs 16–20) — library items are more operational than the rest of the slate.
- **Develop CPL Systemwide Strategic Plan** (CFFTF, p.56): shared library dissent (recs 16–20) — operational-lens concern.
- **Define CPL Branch Service Priorities** (CFFTF, p.56): shared library dissent (recs 16–20) — operational-lens concern.
- **Tailor CPL Services by Neighborhood** (CFFTF, p.57): shared library dissent (recs 16–20) — operational-lens concern.
- **Analyze and Scale CPL Branch Best Practices** (CFFTF, p.57): shared library dissent (recs 16–20) — operational-lens concern.
- **Limit PPRT Diversions** (CFFTF, p.58): shared dissents on recs 21–25 — A: prefer progressive Springfield authority; etc.
- **Increase LGDF Share Rate** (CFFTF, p.58): shared dissents on recs 21–25 — A: prefer progressive taxing authority from Springfield.
- **Resume CPI-Based Property Tax Increases** (CFFTF, p.59): shared recs 21–25 — Dissent C: auto-indexing real estate taxes to CPI is concerning (regressivity / housing-cost coupling).
- **Expand the Sales Tax Base to Include Consumer Services** (CFFTF, p.59): shared recs 21–25 — Dissent C: expanding sales tax to consumer services merits further analysis (regressivity).
- **Implement Cordon Model Congestion Pricing** (CFFTF, p.59): shared dissents on recs 21–25 — prefer progressive authority; equity concerns.
- **Expand Missing Middle Infill / Market-Rate Housing** (CFFTF, p.77): subsidized units should carry affordability requirements (does NOT go far enough).
- **Institute a Vacancy Freeze** (CFFTF, p.15): Two OPPOSING dissents — A: goes TOO FAR (overtime/burnout/contractor reliance); B: does NOT go far enough (eliminate 1,126 CPD vacancies >2yrs, shift parking enforcement to Finance, route mental-health calls to CARE team).
- **Continue Overtime Reduction** (CFFTF, p.17): does NOT go far enough — should eliminate CPD overtime (>2× over budget recently).
- **Implement Flexible Furlough Days** (CFFTF, p.18): goes too far / counterproductive — morale, turnover, and may trigger overtime.
- **Explore Employee Contribution Opportunities** (CFFTF, p.20): goes too far — raising healthcare costs degrades benefits and hurts recruitment/retention.
- **Explore Healthcare Plan Design Opportunities** (CFFTF, p.21): goes too far — same benefits-degradation concern.
- **Assess Health Coverage Continuation on Extended LOA** (CFFTF, p.22): goes too far — most groups already pay 100% on LOA after FMLA; most leaves are health-related.
- **Disband CPD Mounted Unit Division** (CFFTF, p.24): goes too far — horses remain effective for crowd control and ceremonial roles.
- **CFD EMS Cost Recovery — Treat-No-Transport (TNT)** (CFFTF, p.24): goes too far — ~$1,000 fee harms underinsured and may deter 911 calls for <$1M.
- **Increase Use of Autonomous Drones at CPD** (CFFTF, p.24): Two OPPOSING dissents — A: goes TOO FAR (surveillance/tracking concerns); B: INADEQUATE (drones can't replace a helicopter / won't meet CPD needs).
- **Rent OPSA Regional Training Facility** (CFFTF, p.24): goes too far / objectionable — CPD misconduct history and community opposition to PSTC.
- **Expand OPSA Cameras in CFD/CPD Vehicles** (CFFTF, p.24): goes too far — punitive, fosters distrust; prefer training/de-escalation.
- **Utilize Full Overtime Rate (Special Events)** (CFFTF, p.38): alternative — provide free services for small events via CARE Team / violence-interruption staff.
- **Expand Congestion Surcharge (Rideshare)** (CFFTF, p.51): goes too far / misguided — unclear purpose, exempts taxis/commercial, regressive.
- **Increase Garbage Fee to Improve Cost Recovery** (CFFTF, p.51): goes too far / regressive — prefer progressive revenue from wealthier sources.
- **Index Fees and Fines to Inflation Annually** (CFFTF, p.52): goes too far for regressive charges — towing/immobilization/storage/city-sticker should be excluded.
- **Adjust the City's Property Tax** (CFFTF, p.53): goes too far / should not be automated — Chicago already has very high commercial property taxes.
- **Reinstitute the Head Tax** (CFFTF, p.59): goes too far — disincentivizes hiring/expansion; cites Amazon/Seattle.
- **Pursue PILOT Program** (CFFTF, p.59): goes too far / improper — circumvents nonprofit property-tax exemption; ad hoc and coercive.
- **Optimize the City's Real Estate Portfolio** (CFFTF, p.61): partially too far — selling vacant office buildings forfeits future revenue; give assets time to reactivate.
- **Declare Maximum TIF Surplus** (CFFTF, p.61): goes too far / short-sighted — TIF funds are for capital projects (CTA, schools, parks).
- **Favor Allowing Natural Expiration of TIFs** (CFFTF, p.61): opposes prioritizing expiration — extensions already need GA approval.
- **Explore Early Termination of TIFs** (CFFTF, p.61): goes too far — short-term cash undermines TIFs' long-term purpose and community investment.
- **Shift to Outcome-Based Budgeting** (CFFTF, p.65): goes too far without guardrails — outcome metrics can set unrealistic standards and cut access.
- **Establish Autonomous Taxi Framework** (CFFTF, p.66): caution — don't let permitting stifle innovation/investment.
- **Establish Autonomous Freight Drone Framework** (CFFTF, p.67): caution — same innovation/investment caveat.

(All 45 are CFFTF — the Interim's 25 + the Final's 20 dissents survive the merge. EY records
no formal dissents; it is a consultant analysis. Union/CBA constraints in EY are captured in
`feasibility_note`, not as dissents.)

## 4. Merge / dedup methodology
- **Only clean 1:1 duplicates collapsed** (same discrete lever named in >1 report) → 30
  collapses. Each merged row keeps the fullest framing, adopts a stated dollar figure where
  the primary was qualitative, OR-combines dissent, lists other sources in `also_reported_in`,
  and appends a cross-reference (incl. the secondary's own figure) to `feasibility_note`.
  Collapsed families: 6 Fleet items (Interim↔EY, **identical** figures), Procurement Category
  Management ($55–111M, identical), 17 Public-Safety items (Interim↔EY), the $11.9M non-city
  parade item, LOA health continuation, streamline-hiring/position-management ($25M),
  outcome/performance-based budgeting, two Final↔Interim revenue items (sales-tax-on-services,
  LGDF share), and CPS pension contributions.
- **Result is 194 rows, higher than the ~120–150 I estimated at plan time.** Deliberate: I
  did *not* force-merge "bundle-vs-split" overlaps, because collapsing them would destroy
  named-recommendation detail and conflate figures. See §5.

## 5. ⚠️ Critical caveats for downstream use (do NOT blindly sum dollar_estimates)
1. **Unit/time-basis mismatch (biggest one).** EY **Service Optimization (Workstream 9)**
   standalone items carry **10-YEAR CUMULATIVE** dollar figures (e.g. CFD Minimum Manning
   **$517.4M**, CFD BLS ambulances $131.1M, the three OEMC items, OPSA timekeeper $25.1M),
   and EY **Real Estate** figures are **10-yr PV @5%** (e.g. sell industrial buildings $57.9M).
   These are **not annual** and must not be summed with the annual figures elsewhere. For the
   17 public-safety levers that appear in BOTH reports, the merged row keeps the **Interim's
   annual** figure as `dollar_estimate` and notes EY's 10-yr figure in `feasibility_note`
   (the Interim explicitly states its figures are Year-1, with savings over a 10-yr horizon — p.24 footnote).
2. **Bundle-vs-split overlaps left as separate rows** (flag against double-counting):
   - **Special Events:** EY's umbrella "$6.3–21M" cost-recovery row overlaps the Interim's
     granular component rows (maximize CPD event recovery, other/non-personnel personnel costs,
     athletic events, full-overtime rate). Only the discrete $11.9M parade item was 1:1-merged.
   - **Employee Benefits:** EY splits into ~20 granular levers; the Interim groups into ~5.
     Only LOA continuation was a clean 1:1. The EY granular levers and the Interim groupings
     cover overlapping savings.
   - **Real Estate / Asset Monetization:** Final ("Inventory and Monetize Non-Core Assets",
     qualitative) ↔ Interim ("Optimize Real Estate Portfolio", $29.5M one-time) ↔ EY (granular
     office/industrial/land/Riverwalk rows) all address the same territory at different
     granularity; kept separate.
3. **Special Events internal double-count (within EY):** the $11.9M parade row is a *component*
   of EY's $6.3–21M umbrella (noted in the EY raw `notes`).
4. **Fees/Fines scope:** EY's $20–74M Fees/Fines total **excludes** the Vehicle Sticker Tax,
   captured as a separate row (`ey-fees-vehicle-sticker-tax`, $0–187.5M; Vehicle Fund, not Corporate Fund).
5. **Redacted in source:** EY Procurement per-category figures are redacted; only the
   $55–111M total exists (captured once, merged with the Interim's identical figure).
6. **TBD:** Performance-Based Budgeting savings are stated as TBD → `dollar_estimate: null`.

## 6. Ambiguous / ranged / hard-to-page figures
- Many figures are **ranges** (low/high), captured as `{low, high}` exactly as stated — e.g.
  Interim Garbage Fee $19.6M–$296.9M, Expand Sales Tax on Services $78M–$305M, EY Org
  Consolidate Divisions $30M–$70M.
- **Negative "savings"** in the Interim Public Safety table are upfront Year-1 costs (e.g.
  CPD Early Warning System −$1.5M, OPSA cameras −$0.5M); preserved as negative numbers with
  the table's footnote meaning noted in `feasibility_note`.
- The **FY2026 gap inconsistency** ($1.1B Interim vs $1.2B as quoted by the Final vs $1.15B
  EY) is real and intentional to preserve — see §2.
- A handful of Final menu items appear on a table page (Appendix B, p.87–92) and a detailed
  page; `page` points to the detailed/recommendation page, `also_reported_in`/anchors locate them.

## 7. Verification performed
- `uv run data/validate.py` → **PASS** (194 options, unique ids, all enums valid, dissent
  flag/text consistency, `also_reported_in` well-formed, anchors ≤15 words, structural_gap present).
- **No-invented-numbers spot check** against the PDFs (figure + page + anchor): Disband Mounted
  Unit $5.9M (Interim p.24/25 ✓), Garbage Fee $19.6–296.9M (p.51 ✓), Reinstitute Head Tax
  $10.2–25.6M + dissent (p.59 ✓), Declare Max TIF Surplus $137M (p.61 ✓), CFD Minimum Manning
  $517.4M 10-yr (EY p.76 ✓), Sell Industrial Buildings $57.9M PV (EY p.26 ✓), CPS pensions
  $175M (Final p.31 ✓). Dissent direction confirmed faithful on Head Tax, ADC (A/B), and
  Advanced Supplemental Payment.

schema additions this session: also_reported_in; dollar_estimate now allows negatives/null; structural_gap is an array

**Status: stopping here for your review per CLAUDE.md. No engine/view/game logic built.**
