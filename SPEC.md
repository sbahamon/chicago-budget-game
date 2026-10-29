# Chicago Budget Game — SPEC v2

The design of record for v2. It is written from `REVAMP.md` (the brief, with the
reasons behind each choice); if the two disagree, REVAMP wins and this file gets fixed.
The v1 mayor-mode spec is archived at `docs/SPEC-v1.md`.

Build rules (test-first, engine/view split, no made-up numbers, uv for Python) are in
`CLAUDE.md`. Progress is logged in `worklog.md`.

---

## 1. Product

One website in three parts that share one scoreboard:

| Part | Page | What the player does |
|---|---|---|
| 1. Follow the dollar | `#follow` | See where the city's money comes from and goes, and where a property tax bill goes. |
| 2. Close the gap | `#gap` | Build a plan from real options, in any order, and see it over 10 years. |
| 3. Grow the base | `#grow` | See tax value per acre, then turn on zoning changes and see the money they add over time. |

Plus `#math` (every formula and assumption) and `#sources` (every source).

**Goals.** (1) Make budget season understandable in under five minutes. (2) Show that
zoning leaves long-term money on the table, by putting growth on the same scoreboard
as cuts and taxes.

## 2. Kept from v1 / removed

**Kept:** engine/view split; test-first; the no-made-up-numbers rule (extended, §3);
`data/sources.enriched.json` as the master list of the 194 report options; partial
credit for Springfield-dependent options; the read-only PDFs in `./reports/` (new
PDFs may be added, existing ones never edited); `uv` for Python; the GitHub Pages deploy.

**Removed:** the fixed decision sequence and the mayor role; the four meters and the
seven endings (the only scoring is the scoreboard, §5). Their code and tests are
deleted together, and the deletion is logged in `worklog.md`. While the v1 game still
serves the site root (until `#gap` replaces it in Phase 2), its engine modules stay.

## 3. Where every number comes from

Every number on the site traces to one of three sources. Each is validated by
`test/data/provenance.test.ts`.

| Source | Files | Each number records |
|---|---|---|
| **report** | `data/sources.enriched.json` | The existing data-of-record rules (CLAUDE.md schema). |
| **public** | `data/public/<dataset>.json`, built by `data/pipeline/*.py`; raw downloads in `data/raw/public/` | `url`, `locator` (dataset id or PDF page), `downloaded` (YYYY-MM-DD), `raw_file`; the file names its `script`. |
| **modeled** | `data/modeled.json` + `data/assumptions.json` | A model's `formula`, `inputs` (refs) and `assumptions` (ids). Each assumption is `basis: "sourced"` with a `url`, or `basis: "judgment"` with a `rationale`. |

**Refs.** Inputs and rules point at numbers by ref: `report:<option-id>`,
`report:structural_gap/<i>`, `public:<dataset>#<figure-id>`, `modeled:<model-id>`,
`assumption:<assumption-id>`. Unresolvable refs fail validation.

**Public file shape.**
```
{ dataset, script: "data/pipeline/<name>.py",
  figures: [ { id, label, value, unit, source: { url, locator, downloaded, raw_file } } ] }
```
`unit` ∈ `USD | percent | share | count | any`. Written only through
`data/pipeline/provenance.py` (deterministic output).

**modeled.json shape.**
```
{ models: [ { id, label, formula, inputs: [ref], assumptions: [id], unit, value? } ],
  interaction_rules: [ { id, kind: "exclusive" | "shrinks", members: [option ref], rationale } ] }
```
`value` is optional (a number or ten yearly numbers); most modeled numbers are computed
by the engine at run time from their inputs.

**The registry and the scan.** `src/engine/provenance.ts` builds a registry of every
number the three sources hold (report dollar fields, report figures stated in text,
public figures, stored model values, assumptions). `findUnsourcedNumbers` extracts every
money figure (`$680M`, `$35–250M`), percent (`70%`) and bare `N million/billion`
from text, and flags any that matches no registered number within its displayed rounding
(a share of 0.7 matches "70%"). The test scans every file in `src/` and `index.html`.
A planted fake must fail; the same figure must pass once registered in any source.

**Tuning constants.** Game-design scaling factors (e.g. the Springfield partial-credit
share) are assumptions with `basis: "judgment"` in `data/assumptions.json`, read by the
engine by id. They score or scale a real figure; they assert no budget number.

## 4. Architecture

- **Engine** (`src/engine/`): pure, DOM-free. Reads the three sources, takes a plan,
  emits structured facts. No copy, no formatting.
- **View** (`src/view/`): renders engine output. All on-screen text lives in
  `copy.en.ts` and `copy.es.ts` (same keys, enforced by the `Copy` type and a test);
  `i18n.ts` picks the language. The v1 game's `copy.ts` stays until v1 is removed.
- **Routing** (`src/view/router.ts`): `#<page>?<params>` for the five pages. An empty or
  unknown hash shows the v1 game until Phase 2. `?lang=es` previews Spanish.
- **Sharing:** a plan is encoded in the link (`#gap?plan=...`); opening the link restores
  the same plan. No server, no accounts.

## 5. Engine contract (built in Phase 2)

**Plan.** An unordered set of choices: `{ option_ref, setting, switches? }`. Order never
matters. `setting` picks how far the option is turned up. For a ranged report figure
the settings are the report's own `low`, midpoint and `high` (no invented intermediate
values); a point figure is on/off unless the source states a scaled version. Options
with switches (e.g. the TIF options in §8) carry them in `switches`.

**Horizon.** Ten fiscal years starting with FY2027. The "nothing changes" line is the
city's 2027 budget forecast (public data, Phase 1/2).

**Yearly amounts.** Each chosen option yields ten yearly amounts:
- one-time money counts in year 1 only;
- recurring money counts every year;
- growth options ramp up per the growth settings in `assumptions.json` (§9);
- Springfield partial credit applies every year: only `state_confirmed_share` of a
  Springfield-dependent option's yearly amount counts; the rest is reported as pending.

**What each option reports** (facts only; the view decides how to show them):
`yearly[10]` for the city; `yearly_cps[10]` where an option moves CPS money;
`timing` (one-time | recurring | growth); `who_pays`; `springfield` (state | mixed |
city) and `pending_springfield[10]`; `confidence` (report | public | modeled); `refs`
(provenance); `dissent` (direction + summary) when the reports record one.

**No double counting.** `modeled.json` `interaction_rules` list options that exclude
each other (`exclusive`) or reduce each other (`shrinks`). The engine enforces them;
tests assert that every rule changes the combined total.

**Scoreboard.** For a plan: `baseline_gap[10]`, `plan_gap[10]`, closed in year 1,
closed in year 10, and the one-time share of the fix. Two views:
- `city` (default): the city's gap only;
- `whole_bill`: city plus CPS. Whole-bill totals equal city plus CPS amounts (tested).

**Ready-made plans.** One-click plans, each matching its sourced total (tested): the
mayor's 2027 budget; the City Council's 2026 counter-budget; EY's cost savings only;
the Task Force's agreed-on items.

## 6. Plain-language rules (all on-screen text)

- Write for someone who has never read a budget; aim for sentences under 20 words.
  **Tested:** no on-screen sentence over 30 words (`src/view/plainLanguage.ts`).
- Turn big numbers into personal ones (per household, per dollar).
- Use the glossary words (levy, tax rate, taxable value, TIF district, TIF surplus,
  Corporate Fund, one-time money, recurring money, Springfield), defined as in the copy
  files, with a tap-to-define popup on first use.
- Never show "EAV" on screen; say "taxable value". **Tested.**
- Name what an option does, with the report's title in smaller text underneath.
- Stay neutral in Parts 1 and 2: present every side the same way, credit each option to
  its source, never say which plan "wins".
- No dollar or percent figure in copy: numbers come from the data at render time.

## 7. Part 1 — Follow the dollar (Phase 1)

1. A flow chart from revenue sources to spending, with a switch between the whole budget
   and the Corporate Fund, then a "for each $1" bar showing cents to pensions and old
   debt before any service is paid for.
2. A property tax bill split by government (CPS, city, county, parks, water district,
   City Colleges, others), then the city's slice by purpose.
3. (Phase 4) Your own bill by address.

Two small animations: more taxable value lowers everyone's rate (same levy, bigger
base); TIF holds back growth (new value inside a TIF feeds the TIF fund).

**Tests:** flow totals match the source documents; every number has a working source
button; works on a phone; sentence-length test passes.

## 8. Part 2 — Close the gap (Phase 2)

Options are grouped by topic. Each card shows: year 1 and year 5 amounts and a tiny
10-year chart; **one-time or every year** as the biggest label; who pays or loses a
service; whether it needs Springfield; sources and confidence; any recorded dissent in
one sentence. Options come from the 194 report options, the 2027 proposals (once their
numbers are in `data/public/`), and the new options below.

**TIF options.** Existing report options: `declare-maximum-tif-surplus` (one-time),
`favor-natural-expiration-of-tifs` (yearly), and the report's "end TIFs early" option
(no figure; legally and financially complicated). New, modeled options:

- **`end-tifs-higher-income-areas` (Option A).** District definition switch: default =
  median household income above the citywide median (ACS 5-year); downtown only; or an
  income cutoff slider. The default district list is a saved test fixture. Effects: debts
  and promised projects paid first (one-time cost shown); freed growth returns to every
  government's taxable value; money starts with the next tax bill (Cook County bills a
  year late: a sourced assumption). Money switch: **"lower everyone's tax rate"** (levies
  unchanged, rates fall, $0 toward the city gap, typical-bill change shown) or **"city
  keeps its share"** (city levy rises by its share of freed value so its rate is flat;
  the only version that helps the city budget). The card says plainly that most freed
  money goes to schools. Transit switch: the two CTA Red Line TIFs are excluded by
  default; including them shows a warning about federally co-funded projects.
- **`end-all-tifs` (Option B).** As A, for every district, plus a timing switch: **right
  away** (pay off all TIF debts now; large year-1 cost) or **as they're paid off** (each
  district closes when its debts are paid; no payoff cost; money phases in). States what
  is lost: future surplus releases and promised projects.
- A and B both shrink the surplus option: one `interaction_rules` group covers all three.

**CPS connection.** CPS's share of freed TIF money never counts toward the city's gap
automatically. A separate option, **"CPS pays the city back for school-staff pensions"**,
labeled "depends on a deal with the school board, not guaranteed", takes its amount from
public data and counts toward the city's gap only in years when CPS has extra money
(more TIF surplus or an ended TIF), never above the deal amount. The whole-bill view shows
CPS's full share either way.

**Tests to write first** (REVAMP §10): default district list matches the fixture and
changes with the definition; B frees at least as much value and money as A; the city
never gets more than its tax rate × freed value; "lower everyone's tax rate" adds $0 to
the city gap and lowers the typical bill; with "end all TIFs, right away" the surplus
option yields about $0 from year 2; transit switch off by default, on adds the two Red
Line TIFs and the warning; CPS money counts only with the pension deal on and never above
the deal amount; whole-bill = city + CPS; every number on these cards traces to public
or modeled data.

**Done when:** every test above passes; ready-made plans match their sourced totals; a
shared link reopens the exact same plan.

## 9. Part 3 — Grow the base (Phase 3)

A 3D map: property height = tax value per acre; highlight single-family-only land within
a half mile of the L. Switches, each with a slider: coach houses everywhere; 8 stories
near transit; four-flats everywhere; taller buildings on main streets; no minimum lot
size. Homes added per switch come from Fix Chicago Housing's model if shared, otherwise a
simple model with labeled assumptions.

```
new taxable value each year = new homes × taxable value of a typical new home
city money = new taxable value × city tax rate
           + sales and transfer taxes from new residents
           − cost of city services for new residents
```

Growth ramps slowly (about nothing in years 1–2, most in years 3–10); the ramp lives in
`assumptions.json`. New value inside a TIF goes to the TIF unless Option A or B ends that
district. On screen: growth won't fix the 2027 gap; it's the only fix that keeps growing.

**Done when:** the Math page lists every assumption; growth is about $0 in year 1 and
only rises after (tested).

## 10. Data pipeline

`data/pipeline/` is a uv project (`uv run pytest`). Scripts write through
`provenance.write_public`, keep raw downloads in `data/raw/public/`, are deterministic,
and each has a test checking a total against the source document.

| Output | Source | Phase |
|---|---|---|
| `budget_2027.json` | City 2027 budget forecast + proposal (PDFs added to `./reports/`) | 1 |
| `tax_rates.json` | Cook County Clerk tax rate report | 1 |
| `proposals_2027.json` | 2027 budget proposal, BGA, council documents | 2 |
| `tif_districts.json` | Cook County Clerk TIF report; city TIF annual reports | 2 |
| `cps_city_transfers.json` | CPS budget documents; city budget | 2 |
| `tif_boundaries.geojson` | City of Chicago data portal | 2 |
| `neighborhood_income.json` | Census ACS 5-year | 2 |
| map tiles (values, lot sizes) | Cook County Assessor parcel universe | 3 |
| zoning, L stations, wards | City data portal, CTA | 3 |
| bill lookup | Cook County Treasurer + Assessor | 4 |

## 11. Phases

One pull request per phase (REVAMP §13).

- **Phase 0 — set up (no visible change at the site root).** This spec; CLAUDE.md
  updated; `assumptions.json`, `modeled.json`, `data/pipeline/` uv project; the
  three-source number test; routing and the en/es copy files. **Done.**
- **Phase 1 — Part 1.** Budget and tax-rate data; flow charts, "for each $1" bar, two
  animations.
- **Phase 2 — Part 2.** Plans, 10-year math, interaction rules, ready-made plans,
  shareable links; proposals, TIF, CPS and income data; Options A/B, the pension-deal
  option and the whole-bill view. `#gap` replaces the v1 game; v1 meters, endings and
  the fixed decision sequence are deleted with their tests.
- **Phase 3 — Part 3.** Property, zoning and station data; the map; switches, money math,
  slow start, TIF link.
- **Phase 4 — finishing.** Bill lookup; Spanish; ward lookup and the note to your
  alderperson; data refresh after the final budget vote.

## 12. Open questions

REVAMP §14 lists the questions only Steffany can answer. Engine questions to settle
test-first in Phase 2: how a `ten_year_pv` (asset sale) figure lands on the 10-year
scoreboard (v1 spread it as figure ÷ 10 inside a one-year view).
