# REVAMP.md: Chicago Budget Game v2

Steffany Bahamon · Oct 29, 2026

## Start here

Put this file in the top folder of the repo. Then open the repo in Claude Code on the web and paste:

> Read CLAUDE.md, SPEC.md, worklog.md and REVAMP.md. Do Phase 0 only. Open a pull request when its checks pass, and list anything you need me to decide.

Do one phase per session, and one pull request per phase. For later phases, change the phase number in the prompt.

**Notes for Claude Code:**

- Section 13 is your to-do list. The rest of this file explains what to build and why.
- If this file and CLAUDE.md disagree, follow this file. Phase 0 updates CLAUDE.md to match.
- Section 14 lists questions only Steffany can answer. Ask her; don't guess.
- Some phases download data from city, county and Census websites. If the web environment blocks those sites, stop and tell Steffany. She can download the files herself and commit them to `data/raw/public/`.

## Words this file uses

Plain-language definitions. The site uses these same words, explained the same way.

| Word | What it means |
| --- | --- |
| **Levy** | The total dollar amount a government decides to collect in property tax for the year. |
| **Tax rate** | Your share of the levy. Each government's levy is divided by the total taxable value of all property in its area. |
| **Taxable value** (official term: EAV) | What the county says a property is worth for tax purposes. More homes and buildings mean more taxable value. |
| **TIF district** | An area where the city freezes the property taxes that go to schools, parks and the rest. For up to 23 years, every dollar of growth above that frozen amount goes into a separate TIF fund instead. |
| **TIF surplus** | Money the city decides to release from TIF funds. By law it's split among all the governments on your bill, not just the city. |
| **Corporate Fund** | The city's main day-to-day budget for police, fire, streets and similar services. Most budget fights are about this fund. |
| **One-time money** | Money that helps this year only. Next year the gap comes back. |
| **Recurring money** | Money that helps every year. |
| **Springfield** | The Illinois state government. Some options need a state law before the city can use them. |

## 1. What we're building

The current game makes you play mayor through a fixed series of choices. Version 2 replaces it with one website in three parts, and all three parts share one scoreboard.

1. **Follow the dollar.** Where the city's money comes from, where it goes, and where your property tax bill goes.
2. **Close the gap.** Try real options to fix the budget and see what they do over 10 years, not just 1.
3. **Grow the base.** See how much tax value each block produces. Then see what changes when the city allows more homes.

**The two goals:**

- **Make budget season easy to understand in under five minutes.**
- **Show that our zoning leaves long-term money on the table.** Growth sits on the same scoreboard as cuts and taxes, so people can see its numbers next to theirs.

## 2. What stays the same

Keep all of these:

- The split between game logic (the "engine") and what's drawn on screen (the "view").
- The test-first rule: write a failing test, make it pass, then clean up.
- The "no made-up numbers" rule. Phase 0 extends it in section 4; it doesn't loosen it.
- `data/sources.enriched.json` as the master list of the 194 options from the reports.
- Partial credit for options that need Springfield.
- The PDFs in `./reports/`. Add new ones there, but never edit the existing ones.
- `uv` for all Python.
- The current GitHub Pages deploy.

## 3. What goes

- **The fixed order of choices and the mayor role.** Players can now pick any options in any order.
- **The four meters and the seven endings.** They felt like the game was telling people what to think. The only scoring now is the scoreboard in section 6.
- **The old SPEC.md.** Move it to `docs/SPEC-v1.md`, then write a new SPEC.md from this file.

Delete old code for meters and endings unless something new uses it. Delete its tests at the same time, and note the deletion in worklog.md.

## 4. Where every number comes from

Every number on the site must trace back to one of three places. Phase 0 extends the existing "no made-up numbers" test so it checks all three.

| Type | Where it lives | What it is | What each number must record |
| --- | --- | --- | --- |
| **From the reports** | `data/sources.enriched.json` (no change) | Options and dollar figures from the EY and Task Force reports | The existing rules |
| **From public data** | `data/public/*.json`, built by scripts in `data/pipeline/` | Budget figures, tax rates, TIF revenue, property values, zoning, neighborhood income | Link, dataset or PDF page, download date, and which script made it. Keep the raw downloads in `data/raw/public/` |
| **Calculated by us** | `data/modeled.json` + `data/assumptions.json` | Numbers we work out, such as the TIF options and growth revenue | The formula, which numbers went in, and which assumptions it uses |

Label every assumption either as sourced (with a link) or as our judgment. The site's "Math" page lists all of them, so nothing is hidden.

## 5. How the site is organized

- **Pages:** `#follow`, `#gap`, `#grow`, `#math`, `#sources`.
- **Sharing:** a player's choices are saved in the link (`#gap?plan=...`). Anyone who opens the link sees the same plan. No server or accounts needed.
- **Scoreboard:** shown on the `#gap` and `#grow` pages. It's a 10-year chart with two lines: the budget gap if nothing changes, and the gap with your plan. Under the chart, three quick numbers:
  - How much of the gap you closed in year 1.
  - How much you closed in year 10.
  - How much of your fix is one-time money.
- **Whole-bill toggle on the scoreboard:**
  - **"City budget"** is the default and shows only the city's gap.
  - **"Your whole tax bill"** adds the Chicago Public Schools (CPS) gap.

  Most of your property tax goes to CPS, so some options (like ending TIFs) look very different in each view. People should see both. See section 10.
- **Sources:** every number has a small button that shows where it came from.
- **Last screen:** a share link, your ward and alderperson, and a short note you can copy and send them.
- **Languages:** write all on-screen text in `copy.en.ts` and `copy.es.ts` from the start. The Spanish version ships in Phase 4.

## 6. How the game logic changes

- **A plan, not a path.** A plan is a list of the options you picked and how far you turned each one up. Order doesn't matter.
- **10 years, not 1.**
  - The "nothing changes" line comes from the city's 2027 budget forecast.
  - Each option adds one number per year for 10 years:
    - One-time options count in year 1 only.
    - Yearly options count every year.
    - Growth options start slow (section 11).
  - Partial credit for Springfield options applies every year.
- **No double counting.** Some options can't be picked together; others shrink each other. For example, ending TIFs leaves less TIF surplus to release. List these rules in `data/modeled.json` and enforce them in the logic.
- **Ready-made plans.** One click loads a whole plan:
  - The mayor's 2027 budget.
  - The City Council's 2026 counter-budget.
  - EY's cost savings only.
  - The Task Force's agreed-on items.

  Seeing whole plans side by side teaches more than any single option.
- **What each option reports:**
  - Its 10 yearly amounts.
  - One-time or yearly.
  - Who pays or loses a service.
  - Whether it needs Springfield.
  - How confident we are.
  - Where its numbers come from.
  - Any disagreement noted in the reports.

  The logic only produces these facts. The view decides how to show them.

## 7. Plain-language rules for everything on screen

- **Write for someone who has never read a budget.** Aim for sentences under 20 words.
- **Turn big numbers into personal ones.** Next to "$882 million", also show what it means per household or per dollar.
- **Use the words from the table at the top,** defined the same way, with a tap-to-define popup the first time each appears.
- **Never show the term "EAV" on screen.** Say "taxable value".
- **Name what an option does, not its report title.** For example, "Charge big companies $25 a month per worker", with the report's title in smaller text underneath.
- **Stay neutral in parts 1 and 2.** Present options from all sides the same way, credit each one to its source, and never say which plan "wins".
- **Add a test that fails if any on-screen sentence runs over 30 words.** Long sentences are where jargon hides.

## 8. Part 1: Follow the dollar

1. **Where the city's money comes from and goes.** A flow chart from sources (property tax, sales tax, fees, state money and others) to spending (police, fire, streets, pensions, debt). A switch flips between the whole budget and the day-to-day Corporate Fund. Then a "for each $1" bar shows how many cents go to pensions and old debt before any service is paid for.
2. **Where your property tax goes.** One bill splits into CPS, the city, Cook County, the Park District, the water district, City Colleges and others. Then the city's slice splits again by what it pays for.
3. **Your own bill** (Phase 4). Type in your address and see your bill split up in dollars.

Teach two ideas here, each with a small animation:

- **More taxable value lowers everyone's rate.** The levy stays the same and gets split across more property.
- **TIF holds back growth.** Inside a TIF, new taxable value feeds the TIF fund, not schools or the city.

Parts 2 and 3 depend on these two ideas landing.

## 9. Part 2: Close the gap

Group the options by topic. Each option card shows:

- What it saves or raises in year 1 and year 5, plus a tiny 10-year chart.
- **One-time or every year.** Make this the biggest label on the card.
- Who pays or who loses a service.
- Whether it needs Springfield.
- Where the numbers come from, and how sure we are.
- Any disagreement recorded in the reports, in one plain sentence.

Options come from:

- The 194 options in the reports.
- The 2027 proposals, once their numbers are in the public data. For example, the mayor's per-worker tax on big companies, budgeted at $113.8M ([BGA](https://chicagobudget.bettergov.org/2027/budget-overview/)).
- The new options below.

## 10. New: TIF options and the CPS connection

### What's already there

The reports already have three TIF options:

| Option | What it is | Money |
| --- | --- | --- |
| Release the maximum TIF surplus | Release as much surplus as possible | $137M, one time |
| Let TIFs end on schedule | Don't extend districts when they expire | $11M a year |
| Look into ending TIFs early | Close districts before their end date | No figure. The report says it's legally and financially complicated |

### Two new options

Both are "calculated by us" options that build on the third report option, so show the report's warnings and our numbers side by side.

#### Option A: End TIFs in wealthier areas (`end-tifs-higher-income-areas`)

**Which districts count as wealthier.** Players choose a definition, and the site lists and maps the districts it picks. Save the default list as a test fixture.

| Choice | Districts it picks |
| --- | --- |
| **Default** | Districts where the typical household earns more than the citywide typical household (Census income data) |
| **Downtown only** | Downtown districts |
| **Pick a cutoff** | A slider sets the income level |

**What happens:**

1. The district's existing debts and promised projects are paid off first. Show this one-time cost.
2. The district's growth stops being held back. It goes back to everyone's taxable value: CPS, the city, the county and the rest.
3. Money starts with the next tax bill. Cook County bills a year late; record that as a sourced assumption.

**A switch between two honest ways to use the freed-up money:**

- **"Lower everyone's tax rate."** Every government keeps the same levy, so rates drop. Taxpayers save money, but this closes **$0** of the city's gap. Show what it does to a typical bill.
- **"City keeps its share."** The city raises its levy by exactly its share of the freed-up value, so its tax rate doesn't go up. Only this version helps the city budget.

**Show who else gains.** CPS is about half of a typical bill ([WBEZ](https://www.wbez.org/wbez-newsletter/2026/10/13/the-rundown-cps-related-property-tax-hikes-could-end)), so most of the freed-up money goes to schools, not the city. Say so plainly on the card.

**Transit TIFs.** Leave out the two CTA Red Line TIFs by default. A switch can include them, with a warning that they help pay for federally co-funded train projects.

#### Option B: End all TIFs (`end-all-tifs`)

This works the same as Option A, applied to every district. It adds one choice:

| Choice | What happens |
| --- | --- |
| **"Right away"** | Pay off all TIF debts now. Big one-time cost in year 1 |
| **"As they're paid off"** | Each district closes once its debts are paid. No payoff cost, and money grows in over time |

Also say what's lost: future TIF surplus releases, and projects the TIF money was promised to.

#### How these connect to the existing surplus option

Both new options shrink the "release the maximum TIF surplus" option. Ending a district means there's no surplus left in it to release later. Put all three in one group so they never count the same money twice.

### The CPS connection: money moves between schools and the city

**By law,** TIF surplus is split among every government on your bill. The city decides how much to release, not who gets it. In 2026 the city released over $1 billion, and about $552M of it went to CPS ([Chicago Tribune via AOL](https://www.aol.com/articles/cps-board-agrees-pay-175-001100495.html)).

**In practice,** schools and the city trade money through deals. The main one is a $175M yearly payment into the pension fund for non-teaching school staff. CPS said it would pay the city back only if it got extra state money or TIF surplus ([Bond Buyer](https://www.bondbuyer.com/news/chicago-public-schools-2026-budget-unveiled)). Its large surplus share was expected to cover part of that payment. So some money "sent to schools" came back to the city.

**But it's a deal, not a rule.** The elected school board has to agree every year, and CPS argues the pension payment is the city's job ([Bond Buyer](https://www.bondbuyer.com/news/chicago-public-schools-2026-budget-unveiled)). CPS also says it would get more than $735M a year if all TIF money were shared ([CPS](https://www.cps.edu/about/finance/budget/budget-2027/budget-overview-2027/)).

**How to build it:**

- **Add a separate option: "CPS pays the city back for school-staff pensions".**
  - Label it "Depends on a deal with the school board, not guaranteed."
  - Its dollar amount comes from public data.
  - It counts toward the city's gap only when CPS has extra money that year (from more TIF surplus or an ended TIF) to cover it.
- **CPS's share of freed-up TIF money never counts toward the city's gap automatically.** It reaches the city only through that pension deal option.
- **The whole-bill view (section 5) shows CPS's full share either way.** For a household it's all one bill: money that keeps CPS from raising its taxes helps them just as much as money that helps the city.

### Tests to write first

- **Default district list:** the default "wealthier areas" definition returns the saved list, and changing the definition changes the list.
- **All vs. some:** Option B frees at least as much taxable value and money as Option A, under the same settings.
- **Ceiling:** the city never gets more than its own tax rate × the freed-up value.
- **"Lower everyone's tax rate":** adds $0 to the city's gap and lowers the typical bill.
- **Surplus interaction:** with "End all TIFs, right away", the surplus option gives about $0 from year 2 on.
- **Transit switch:** off by default; turning it on adds the two Red Line TIFs and shows the warning.
- **CPS money:** CPS's share counts toward the city's gap only when the pension deal option is on, and never for more than the deal amount.
- **Whole-bill view:** whole-bill totals equal the city amount plus the CPS amount.
- **Sources:** every number on these cards traces back to public data or our own calculations.

## 11. Part 3: Grow the base

**The map.** A 3D map where each property's height shows its tax value per acre. Highlight land within a half mile of the L where only single-family homes are allowed. The point to make: the blocks that pay the most per acre are often the kind current zoning bans.

**Switches, each with a slider:**

- Backyard homes (coach houses) allowed everywhere, not just in wards that opt in.
- 8 stories allowed near transit.
- Four-flats allowed everywhere.
- Taller buildings on main streets.
- No minimum lot size.

**How many homes each switch adds.** Use Fix Chicago Housing's model if they'll share it (question 4). If not, use a simple model with labeled assumptions.

**The money math** (shown on the Math page):

```
new taxable value each year = new homes × taxable value of a typical new home
city money = new taxable value × city tax rate
           + sales and transfer taxes from new residents
           − cost of city services for new residents
```

**Growth starts slow.** Almost nothing comes in during years 1–2; most arrives in years 3–10. Keep these settings in `assumptions.json`.

**TIF link.** New value inside a TIF goes to the TIF, unless Option A or B ends that district. This is where parts 2 and 3 click together.

**Be honest on screen:** growth won't fix the 2027 gap. It's the only fix that keeps growing every year.

## 12. Data to collect (Python scripts run with uv)

| File | Source | Phase |
| --- | --- | --- |
| `budget_2027.json`: money in and out, gap by year | City's 2027 budget forecast and 2027 budget proposal (add the PDFs to `./reports/`) | 1 |
| `tax_rates.json`: each government's rate | Cook County Clerk tax rate report | 1 |
| `proposals_2027.json`: mayor's and council's items | 2027 budget proposal, BGA, council documents | 2 |
| `tif_districts.json`: money, frozen value, debts, balance per district | Cook County Clerk TIF report and the city's TIF annual reports | 2 |
| `cps_city_transfers.json`: pension deal amounts and terms | CPS budget documents and city budget | 2 |
| `tif_boundaries.geojson` | City of Chicago data portal | 2 |
| `neighborhood_income.json` | Census (ACS 5-year) | 2 |
| Property values and lot sizes → map tiles | [Cook County Assessor](https://datacatalog.cookcountyil.gov/Property-Taxation/Assessor-Parcel-Universe/nj4t-kc8j) | 3 |
| Zoning, L stations, ward maps | City of Chicago data portal, CTA | 3 |
| Bill lookup by address | Cook County Treasurer and Assessor | 4 |

Each script must:

- Record where its data came from.
- Give the same result every time it runs.
- Have a test that checks a total against the source document. For example, the per-district TIF amounts must add up to the city total the Clerk reports.

## 13. To-do list, by phase (one pull request each)

### Phase 0: Set up. No visible changes yet.

- Move the old SPEC to `docs/SPEC-v1.md` and write the new SPEC.md from this file.
- Update CLAUDE.md:
  - The three number sources (section 4).
  - The plan-based game logic (section 6).
  - The plain-language rules (section 7).
- Add `data/assumptions.json`, `data/modeled.json`, a `data/pipeline/` folder and a uv project for it.
- Extend the "no made-up numbers" test to all three sources.
- Add page routing and the English and Spanish text files.

**Done when:**

- The build passes.
- Old tests pass, or were deleted along with the meter code (noted in worklog.md).
- The number test catches a fake number planted on purpose.

### Phase 1: Part 1. Aim for mid-November, while the council is still debating.

- Collect the budget and tax-rate data.
- Build the two flow charts, the "for each $1" bar and the two small animations.

**Done when:**

- The flow chart totals match the source documents (tested).
- Every number has a working source button.
- It works on a phone.
- The sentence-length test passes.

### Phase 2: Part 2, the TIF options and CPS. Aim for before the budget vote.

- Build plans, the 10-year math, the double-counting rules, ready-made plans and shareable links.
- Collect the proposals, TIF, CPS transfer and income data.
- Build Options A and B, the CPS pension deal option and the whole-bill view, all test-first (section 10).

**Done when:**

- Every section 10 test passes.
- Ready-made plans match their sourced totals.
- A shared link reopens the exact same plan.

### Phase 3: Part 3. Aim for before the 2027 city election.

- Collect the property, zoning and station data, and build the map.
- Build the switches, the money math, the slow start and the TIF link.

**Done when:**

- The Math page lists every assumption.
- Growth is about $0 in year 1 and only goes up after that (tested).

### Phase 4: Finishing touches

- Your-bill lookup.
- The Spanish version.
- Ward lookup and the note to your alderperson.
- A data refresh after the final budget vote.

## 14. Questions for Steffany (ask; don't guess)

1. Can the city end a TIF early on its own once the debts are paid, or does it need Springfield?
2. Does the city's own cap on raising its levy let it keep its share of freed-up TIF value without a special vote?
3. For "wealthier areas", should the default be the income test or downtown only?
4. Will Fix Chicago Housing share its model?
5. Does Strong Towns Chicago's City Finance Decoder already cover Part 1? If so, link to it or team up instead of rebuilding it.
6. Whose name goes on the site: AHIL, Strong Towns, both, or Steffany's own?
7. What should the pension deal option assume this year, given the school board's latest budget?

## Sources

- [WTTW: $882M gap for 2027; TIF surplus in 2026 and 2027](https://news.wttw.com/2026/09/03/chicago-faces-882m-budget-gap-2027-johnson-touts-smaller-expected-election-year)
- [WTTW: the mayor's $17.6B 2027 budget](https://news.wttw.com/2026/10/21/johnson-touts-176b-proposed-budget-2027-let-us-plant-seeds-fair-chicago)
- [BGA: 2027 budget overview](https://chicagobudget.bettergov.org/2027/budget-overview/)
- [WBEZ: CPS's share of property tax bills](https://www.wbez.org/wbez-newsletter/2026/10/13/the-rundown-cps-related-property-tax-hikes-could-end)
- [Chicago Tribune via AOL: CPS agrees to the $175M pension payment](https://www.aol.com/articles/cps-board-agrees-pay-175-001100495.html)
- [Bond Buyer: CPS 2026 budget and the pension payment](https://www.bondbuyer.com/news/chicago-public-schools-2026-budget-unveiled)
- [CPS: 2027 budget overview](https://www.cps.edu/about/finance/budget/budget-2027/budget-overview-2027/)
- [Civic Federation: 2023 TIF revenue](https://civicfed.org/node/4584)
- [Cook County Clerk: 2024 TIF report](https://news.wttw.com/sites/default/files/article/file-attachments/2024-tif-report.pdf)
- [Fix Chicago Housing](https://fixchicagohousing.com/)
- [Strong Towns Chicago: value-per-acre map](https://www.strongtownschicago.org/value-per-acre-map)
