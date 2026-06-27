# Chicago Budget Game — SPEC v1 (Mayor Mode)

Specification for v1 of the Chicago Budget Game. **Mayor mode only.** No engine/view/game
code is defined here beyond shapes and rules — implementation is test-first per `CLAUDE.md`.

Every dollar figure in this spec traces to `data/sources.enriched.json`, cited by option
id. No number appears in the game or its code that is not in the data. The engine is
persona-agnostic so v2 ("Chicagoan mode") adds a second **view** over the same engine, not
new engine logic.

**Data basis:** `data/sources.enriched.json` — 194 options, 13 `structural_gap` figures, a
per-option `verify` block (`domain`, `leverage_tier`, `figure.basis`,
`figure.annual_equivalent`, `figure.dollar_estimate`, `contested`), and
`verify.overlap_groups` / `verify.dissent_taxonomy`. Reconciliation in `data/VERIFY_REPORT.md`.

---

## 1. Game overview
The player is Chicago's mayor closing the city's structural budget gap by choosing among
real reform options. The player picks a **difficulty target**, then moves through a fixed
sequence of **decisions** (standalone levers, domain dials, dissent forks). Each choice
banks a dollar impact and moves four meters. At the end the engine evaluates the final
state and the view renders one of several **endings**.

## 2. Gap targets (difficulty)
Selectable at game start. Default = Near-term.

| target | amount | FY | counting rule | cite (`structural_gap`) |
|---|---|---|---|---|
| **Near-term** (DEFAULT) | **~$1.15B** | FY2026 | one-time AND recurring both count | EY p.4 |
| **Durable** | **$680M** | FY2027 | recurring ONLY; one-time plugs do not count toward victory | CFFTF Final p.5 |
| **Stretch** | **$780M** | FY2027 | recurring ONLY; harder | CFFTF Final p.10 |

"Recurring vs one-time" is decided by each banked lever's **basis** (see §6).

## 3. Engine / view separation
- **Engine** = pure functions over option data + player choices. Emits structured
  `LeverOutcome` objects and a running `GameState`. Knows nothing about text/UI.
- **View** = renders outcomes/state. v1 ships one mayor-mode view. v2 adds a Chicagoan
  view reading the SAME `LeverOutcome`/`GameState`.
- No dollar/percent/savings number anywhere except read from `sources.enriched.json`.

## 4. Option schema (read from `data/sources.enriched.json`)
The engine reads each `options[]` row. Fields consumed:
- `id`, `name`, `lever_type` (revenue|cut|structural|one-time), `timing`
- `dollar_estimate` (number | {low,high} | null), `unit`
- `who_is_affected`, `feasibility_note`, `has_dissent`, `dissent_summary`
- `report`, `page`, `verbatim_anchor` (provenance for traceability)
- `verify.domain`, `verify.contested`, `verify.leverage_tier`
- `verify.figure.basis` (annual|one_time|upfront_cost|ten_year_cumulative|ten_year_pv)
- `verify.figure.annual_equivalent`, `verify.figure.annual_equivalent_approx`,
  `verify.figure.dollar_estimate` {low,high}
- Top-level `structural_gap[]` (gap targets); `verify.overlap_groups` (dedup).

Dissent **direction** is derived from `verify.dissent_taxonomy.taxonomy[].definition`
member lists → one of {too_far, not_far_enough, alternative_or_caution, opposing_both}.

## 5. Engine structured outcome shape
```
LeverOutcome {
  decision_id        # which mayor decision produced this
  option_id          # source option (or dial id)
  choice             # 'low'|'med'|'high' (dial) | 'base'|'fork' (lever) | fork variant
  dollar_impact      # number, from data (range -> realized per §6 rule)
  basis              # annual|one_time|upfront_cost|ten_year_cumulative|ten_year_pv
  counts_toward      # subset of ['near_term','durable','stretch'] per §6
  affected_groups    # from who_is_affected
  meter_deltas { gap_progress, political_capital, equity, long_term_health }
  provenance { option_id, report, page, verbatim_anchor }   # no-invented-numbers trace
}

GameState {
  target,
  banked: LeverOutcome[],
  meters { gap_progress, political_capital, equity, long_term_health },
  derived { one_time_share, gap_closed_pct }
}
```

## 6. Basis → counting + dollar realization
**Counts toward each target:**
| basis | near_term | durable | stretch | flavor |
|---|---|---|---|---|
| annual | ✓ | ✓ | ✓ | recurring |
| ten_year_cumulative | ✓ | ✓ | ✓ | recurring (EY 10-yr op savings; bank figure/10) |
| one_time | ✓ | ✗ | ✗ | one-time plug → "Kicked the Can" |
| upfront_cost | ✓ (as cost) | ✗ | ✗ | one-time |
| ten_year_pv | ✓ | ✗ | ✗ | asset monetization = one-time plug ("asset sales"); bank figure/10 |

**Dollar realized from a range: MIDPOINT.** A ranged option banks `(low+high)/2`; a point
figure banks the point; ten-year bases bank `(midpoint)/10`. A `too_far` scaled-back fork
banks the range LOW instead. (The midpoint of a range therefore sits below the data's
`annual_equivalent` field, which records the high end.)

**`upfront_cost` in the one_time_share ratio.** An `upfront_cost` outcome adjusts
`gap_progress` only — it is a negative near-term cost, never a positive plug. It is
therefore **excluded from BOTH the numerator and the denominator** of `one_time_share`
(§9). Including a negative in either would make the ratio ill-defined. Concretely:
`one_time_share = (one_time + ten_year_pv dollars) / (all banked dollars EXCEPT
upfront_cost)`. `upfront_cost` still subtracts from `gap_progress` and still counts only
toward near-term (§6 table).

## 7. Choice architecture
~**18 decisions**: 15 standalone levers + 3 domain dials + dissent forks attached to the
contested standalone levers. Dials carry their own HIGH-tier equity/political-capital cost;
forks live on the contested standalone levers.

### 7a. Standalone levers (one option per decision)
Material and/or contested, spread across domains. Each `*` carries a dissent → gets a fork
(§7c). `$` realized at MIDPOINT per §6.
| # | id | domain | $ (data) | realized | basis | dissent dir |
|---|---|---|---|---|---|---|
| 1 | `cfftf-ltl-secure-cps-pension-contributions` * | pensions | $175.0M | $175.0M | annual | alternative_or_caution |
| 2 | `cfftf-re-increase-lgdf-share-rate` * | revenue_tax | $35.0–250.0M | $142.5M | annual | alternative_or_caution |
| 3 | `cfftf-re-expand-sales-tax-base-consumer-services` * | revenue_tax | $78.0–305.0M | $191.5M | annual | too_far |
| 4 | `expand-congestion-surcharge-rideshare` * | transportation_mobility | $26.0–103.0M | $64.5M | annual | too_far |
| 5 | `ey-procurement-category-management` | procurement | $55.0–111.0M | $83.0M | annual | — |
| 6 | `adjust-city-property-tax` * | revenue_tax | $56.0M | $56.0M | annual | too_far |
| 7 | `reinstitute-head-tax` * | revenue_tax | $10.2–25.6M | $17.9M | annual | too_far |
| 8 | `establish-autonomous-taxi-framework` * | transportation_mobility | $34.5–36.3M | $35.4M | annual | alternative_or_caution |
| 9 | `favor-natural-expiration-of-tifs` * | tif | $11.0M | $11.0M | annual | too_far |
| 10 | `declare-maximum-tif-surplus` * | tif | $137.0M | $137.0M | one_time | too_far |
| 11 | `disband-cpd-mounted-unit` * | public_safety | $5.9M | $5.9M | annual | too_far |
| 12 | `increase-autonomous-drones-cpd` * | public_safety | $0.4M | $0.4M | annual | **opposing_both** |
| 13 | `cfftf-ltl-advanced-supplemental-payment` * | pensions | null | $0 | annual (structural) | alternative_or_caution |
| 14 | `institute-vacancy-freeze` * | personnel_benefits | $143.7–161.7M | $152.7M | one_time | **opposing_both** |
| 15 | `optimize-real-estate-portfolio` * | real_estate_assets | $29.5M | $29.5M | one_time | too_far |

**#13 (ADC) is a long_term_health play, not a dead $0 option.** It banks $0 toward the gap
but takes the structural/pension meter row (§8): +12 long_term_health, +4 equity, −8 PC.
A player chasing the **Structural Reformer** ending (needs long_term_health ≥ 30) has a real
reason to spend a decision on it. Same logic makes #1 (secure-cps) doubly valuable: $175M
recurring AND +12 long_term_health.

**#14 (vacancy-freeze) was pulled out of the Personnel dial.** It is one of only two genuine
dual-dissent options in the data (the other is #12 drones; VERIFY_REPORT §5). Material +
spread selection had absorbed it as an anonymous one-time line inside the dial's HIGH tier;
that wasted its `opposing_both` character. It is surfaced as its own decision with an
`opposing_both` fork (§7c), and removed from the dial's one-time pool (§7b math re-shown).

**#15 (real-estate) is a single one-time toggle, demoted from a dial** (see §7b note).

**#12 (drones) is an intentional KEEP, not redundancy.** At ~$0.4M it carries effectively
no budget weight — its entire value is the surveillance-vs-"can't-replace-a-helicopter"
fork. It pairs with #14 as two `opposing_both` showcases of *different texture*: #14 is the
high-stakes money-vs-people no-win ($152.7M one-time on the line), #12 is the pure-values /
~$0 no-win (a choice with no fiscal payoff at all). Keeping both demonstrates the mechanic
across both registers.

**No v1 selected decision produces an `upfront_cost` outcome.** Every basis in §7a is
`annual` or `one_time`. The `upfront_cost` handling in §6/§9 is an engine-correctness guard
(the data contains such options, e.g. `rent-opsa-regional-training-facility`), not a live
v1 path — see the §11 unit-test stub.

### 7b. Domain dials (one low/med/high dial per big/low-interest domain)
**Band source field:** each member's contribution = a **basis-normalized midpoint** —
identical to the normalization in `verify.figure.annual_equivalent` (annual / one-time
as-is; `ten_year_cumulative` and `ten_year_pv` ÷ 10), but using the range MIDPOINT not the
field's high end (per §6). Bands are therefore built from the basis-normalized value, never
a raw 10-yr `dollar_estimate`. (Worked example: `ey-svcopt-oemc-traffic-parking-enforcement`
$84.2M ten_year_cumulative → $8.42M; `ey-svcopt-oemc-311-call-center` $40.1M → $4.01M.)

**Banding rule:** cumulative by `leverage_tier` over UNCONTESTED priced options
(LOW=small, MED=+medium, HIGH=+large/mega); ALL contested ids route into HIGH — pushing a
dial to HIGH is what triggers its equity/political-capital cost. Empty leading tiers
collapse. Overlap pools (VERIFY_REPORT §3) deduped to ONE representation. Dollar = sum of
basis-normalized midpoints, **split recurring vs one-time** (drives target counting per §6).

| dial | LOW (rec/1×) | MED (rec/1×) | HIGH (rec/1×) | representation / notes |
|---|---|---|---|---|
| **Fees & Fines** | $24.65M / $0 | $78.12M / $0 | **$288.07M / $0** | all recurring. Special-events deduped to EY umbrella `ey-special-events-cost-recovery-program`; `ey-fees-vehicle-sticker-tax` dropped (Vehicle Fund, not Corporate). HIGH adds garbage-fee ($158.25M mid) + TNT + `index-fees-fines-inflation-annually` (no-$; meter cost only) — all too_far. |
| **Personnel & Benefits** | $11.80M / $0 | $58.10M / $0 | **$177.80M / $14.10M** | benefits pool = CFFTF Interim 5 groupings (EY granular dropped). HIGH one-time = `implement-flexible-furlough-days` ($14.1M) only — `institute-vacancy-freeze` removed to standalone #14. On durable/stretch HIGH yields $177.80M. |
| **Operations & Org Efficiency** | $6.52M / $0 | $38.87M / $0 | **$175.87M / $0** | all recurring; no contested members. HIGH = org-consolidate ($50M mid) + shared-labor ($50M mid) + spans-of-control ($37M) levers. |

**Real Estate is NOT a dial.** It became standalone toggle #15. A low/med/high dial here
was near-inert ($4.3M recurring across all settings; the money is one-time PV) AND it
double-counted the §3 monetization pool (banking EY-granular rows *and* the Interim
`optimize-real-estate-portfolio` representation in the same band). Demoting to a single
one-time "monetize non-core assets?" toggle (`optimize-real-estate-portfolio`, $29.5M
one-time, too_far) keeps ONE representation, removes the double-count, and is a cleaner
decision object that honestly reads as a near-term-only plug feeding "Kicked the Can."

**Double-count check — VERIFY_REPORT §3 overlap_groups, ≤1 representation per band (CONFIRMED):**
| overlap_group (kind) | representation kept | dropped |
|---|---|---|
| Special Events (umbrella_vs_components) | `ey-special-events-cost-recovery-program` | 8 CFFTF component rows + EY sub-rows |
| $11.9M parade (internal_component) | (covered by umbrella) | `reclaim-costs-non-city-parades` |
| Employee Benefits (granular_vs_grouping) | CFFTF Interim 5-grouping layer¹ | all `ey-benefits-*` granular |
| Real Estate (multi_way_same_asset) | `optimize-real-estate-portfolio` (toggle #15) | EY-granular layer + Final qualitative |

¹ The 5 CFFTF groupings are ONE layer that *partitions* the pool (additive within-layer, no
mutual overlap); the dedup is layer-vs-layer (grouping layer chosen, EY granular layer
dropped). No band contains two layers of any group.

**Soft-overlap caveat + sensitivity (not a §3 group):** `ey-fees-top14-high-impact`
($32.55M) / `ey-fees-additional-revenue-raising` ($14.50M) may partly overlap the granular
`adjust-*` fee rows. VERIFY_REPORT §3 does NOT declare this an overlap_group, so they are
kept distinct per the data of record — **(a) is the spec'd value**; the dedup is unchanged.
Because Fees-HIGH is the largest dial in the §7d near-term math, the HIGH band is shown both
ways:
| Fees & Fines HIGH | recurring total |
|---|---|
| **(a) as-is (spec'd)** | **$288.07M** |
| (b) sensitivity floor — two EY aggregate rows removed | $241.02M |
| delta | $47.05M |

(b) is a **sensitivity floor**, not a spec change — carried into the §7d note below.

### 7c. Dissent forks (generated from direction)
Each contested standalone lever (the `*` rows) offers a fork reflecting what the dissenter
actually argued, cited to a page. **Fork dollar conventions** (deterministic, tunable):
- **too_far** → scaled-back variant: banks range LOW for ranged options; for a point-figure
  option, banks 50% of the point. Lower equity/political-capital cost than the base.
- **not_far_enough** → push-harder variant: banks range HIGH (or +25% over a point figure);
  more political heat, but +equity (it answers a "too timid" dissent).
- **alternative_or_caution** → the dissenter's alternative path OR study-and-delay (banks
  $0 now, defers; small long-term-health cost).
- **opposing_both** → no-win showcase fork (§8 has its own meter row). Two branches; both
  cost political_capital; **equity moves in OPPOSITE directions by branch** so the no-win is
  legible — placate one camp, anger the other, either way:
  - `#12 increase-autonomous-drones-cpd`: *scale-down* branch (less surveillance) banks ~$0,
    +equity (placates privacy/community), −PC (angers safety hawks); *scale-up* branch banks
    the figure, −equity (surveillance/tracking harm), −PC (angers privacy advocates).
    Cites dissent A (surveillance) vs B ("can't replace a helicopter"), p.30.
  - `#14 institute-vacancy-freeze`: *soft* branch (no aggressive freeze) banks ~$0, +equity
    (avoids burnout/overtime on remaining staff), −PC; *hard* branch banks $152.7M one-time,
    −equity, −PC. Cites dissent A (goes too far: overtime/burnout) vs B (not far enough:
    eliminate >2yr CPD vacancies, shift parking enforcement, route calls to CARE), p.16.

> **Flag — `not_far_enough` is dead code in v1.** No v1 selected lever (§7a) has direction
> `not_far_enough` (the only such options in the data — `continue-overtime-reduction`,
> `cfftf-re-benchmark-taxes-fees-expenditures`, `cfftf-ed-missing-middle-infill-housing` —
> are either inside a dial or not selected). The convention is defined for completeness/v2;
> the build session should NOT write a test asserting a `not_far_enough` path and should NOT
> treat its absence as a bug.

### 7d. Balance sanity check (aggressive path, basis-normalized midpoint, from data)
Shown under both the spec'd Fees-HIGH value **(a) $288.07M** and the sensitivity floor
**(b) $241.02M** (§7b item 2):
- **Recurring potential:** standalones (recurring) ≈ $783.1M + dials-HIGH recurring
  (personnel $177.80M + ops $175.87M + fees) →
  **(a) ~$1.425B** (fees $288.07M) · **(b) ~$1.378B** (fees $241.02M).
  → Durable $680M and Stretch $780M closeable with recurring levers ONLY under both. ✓
- **One-time potential (near-term only):** `declare-maximum-tif-surplus` $137.0M +
  `institute-vacancy-freeze` $152.7M + real-estate toggle $29.5M + personnel-dial 1× $14.1M
  ≈ **$333.3M**.
- **Near-term total potential:** **(a) ~$1.758B** · **(b) ~$1.711B** vs $1.15B target →
  near-term headroom **(a) $608M** · **(b) $561M**. A meaningful recurring-vs-one-time
  tradeoff (the choice that drives Reformer-vs-Kicked-the-Can).
- **All three targets remain closeable on the aggressive path under both (a) and (b).** ✓
  The soft-overlap sensitivity costs ~$47M of headroom — comfortably within margin.
- **Humane-path ceiling (see §11 test):** the equity-maximizing path does NOT close the
  near-term gap. Provisional data-derived estimate ≈ **35–45% closed → "Crisis Deepens"**,
  to be PINNED as a golden value on the first engine run. The shortfall is intended: a
  humane budget cannot be balanced on this menu without regressive levers or one-time plugs.

## 8. Meters + default weights (TUNABLE)
Four meters in `GameState.meters`:
- **gap_progress** — sum of banked `dollar_impact` under the target's counting rule (§6).
- **political_capital** — start 100. Each lever costs PC; contested / dial-HIGH cost more.
- **equity** — start 0 (−100..+100). Regressive too_far levers lower it; progressive
  revenue / scaled-back forks raise it.
- **long_term_health** — start 0. Structural reforms + pension funding raise it; one-time
  plugs + study-and-delay lower it. Distinct from gap_progress (durability, not dollars).

Default deltas (flagged tunable — expected to be adjusted by playtesting, not finalized here):
| attribute | political_capital | equity | long_term_health |
|---|---|---|---|
| base lever banked | −5 | 0 | 0 |
| contested lever (too_far, regressive) | −10 | −12 | 0 |
| contested lever (too_far, scaled-back fork) | −5 | −5 | 0 |
| contested lever (not_far_enough, harder fork) | −15 | +6 | +4 |
| contested lever (alternative_or_caution, base taken) | −8 | 0 | 0 |
| **opposing_both fork — placate-vulnerable branch** | **−10** | **+8** | 0 |
| **opposing_both fork — other branch** | **−10** | **−8** | 0 |
| dial LOW / MED / HIGH | −3 / −7 / −15 | 0 / −3 / −12 | 0 |
| one_time / ten_year_pv plug banked | −2 | 0 | −10 |
| structural / pension lever | −8 | +4 | +12 |
| study-and-delay fork | −1 | 0 | −5 |

The `opposing_both` row is what makes #12 (drones) and #14 (vacancy-freeze) genuine no-win
choices: **both branches cost −10 political_capital, and equity moves +8 or −8 by branch** —
one camp is always angered. Neither branch is free; the player picks which constituency to
disappoint.

## 9. Endings
Ending branches key off the **near-term** target per design decision. The engine computes
`gap_closed_pct` and `one_time_share` — where `one_time_share = (one_time + ten_year_pv
dollars) / (all banked dollars EXCEPT upfront_cost)` per §6 (upfront_cost is excluded from
both numerator and denominator; it only adjusts gap_progress) — then evaluates:
1. `gap_closed_pct < 50%` → **Crisis Deepens** (hard fail).
2. `50% ≤ closed < 100%` → **Midnight Budget Standoff** (fail, near miss).
3. `closed ≥ 100%`:
   - `one_time_share ≥ 40%` → **Kicked the Can** (reveals the $680M structural gap returns
     FY2027; CFFTF Final p.5). *Unreachable on durable/stretch by construction.*
   - else `equity ≤ −40` → **The Austerity Mayor** (balanced on the backs of the vulnerable).
   - else `political_capital ≤ 20` → **The Lame-Duck Reformer** (structurally sound but the
     governing coalition collapsed).
   - else `one_time_share ≤ 20%` AND `equity ≥ 0` AND `political_capital ≥ 40` AND
     `long_term_health ≥ 30` → **The Structural Reformer** (gold).
   - else → **The Pragmatist** (solid, middling).

## 10. Out of scope (v1)
Chicagoan-mode persona view (v2); save/load; multi-year turns beyond the single-FY balance
+ ending reveal. The engine stays persona-agnostic to keep v2 additive.

## 11. Verification (when the spec graduates to build)
Test-first per `CLAUDE.md`: each decision / dial / fork gets a test asserting its banked
`dollar_impact` + `basis` + meter deltas match `sources.enriched.json` (by option id), plus
a full-playthrough test per target that reaches each ending branch. No number appears in a
test that is not present in the data.

**Aggressive-path test:** plays the gap-maximizing path (all dials HIGH, all forks at the
max-$ branch) on each target and asserts gap_closed_pct ≥ 100% — proves all three targets
are closeable (§7d).

**Humane-path ceiling test (characterization / golden):** plays the equity-maximizing path
on the **near-term** target and REPORTS where it lands. The path is deterministic: at each
decision pick the choice with the highest `equity` delta; break ties by higher
gap_progress, then by lower political_capital cost (dials → LOW; too_far → scaled-back fork;
opposing_both → placate-vulnerable branch; alt/caution → study-and-delay unless the base
choice has ≥0 equity).
- The test **does NOT assert gap_closed_pct ≥ 100%.** It is acceptable and intended that
  the humane path falls short — the design tragedy is deliberate.
- On first green run, **pin** the observed `gap_closed_pct` and `ending` as a golden value;
  subsequent runs assert the ceiling is unchanged. Re-pinning is an explicit, reviewed act
  whenever §8 weights or §7 fork conventions are tuned — so a shift in the humane ceiling is
  always a conscious design decision, never an accident.
- Provisional expectation (data-derived, §7d): ≈ 35–45% closed → **Crisis Deepens**. If the
  team later wants the tragedy to read as a near-miss (**Midnight Budget Standoff**, 50–99%)
  rather than collapse, that is achieved by tuning §8 / yields and re-pinning — characterized
  by this test, not left to chance.

**`upfront_cost` guard test (stub):** construct a `LeverOutcome` with `basis: upfront_cost`
(e.g. `rent-opsa-regional-training-facility`), bank it alongside ordinary outcomes, and
assert `one_time_share` is well-defined (finite, in [0,1]) — i.e. the upfront_cost dollars
appear in neither numerator nor denominator (§6/§9) while still reducing `gap_progress`.
This is a correctness guard; no v1 playthrough hits it (§7a).

## 12. Build handoff
The build session is a separate session and starts in **PLAN MODE**: Claude Code proposes
the file layout, test framework, and engine/view structure for sign-off **before** writing
any code. Only after plan approval does it run under `/goal` in auto mode, **test-first per
`CLAUDE.md`** (red/green, real-playthrough tests, no invented numbers).

**First build-session action:** update `CLAUDE.md`'s schema / extraction-contract block so it
matches `data/sources.enriched.json` (the `verify.*` fields — `domain`, `leverage_tier`,
`figure.basis`, `figure.annual_equivalent`, `figure.dollar_estimate`, `contested`,
`overlap_groups`, `dissent_taxonomy`) and this finalized spec, so the engine contract and the
project rules agree before the first test is written.
