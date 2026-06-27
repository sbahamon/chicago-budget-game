# Budget Option Verification Report

_Generated 2026-06-26. Verifies `data/sources.json` against `reports/*.pdf`. Compose into the build with `uv run data/merge_verify.py` (LEFT-JOINs `verify.json` → `sources.enriched.json`; originals untouched)._

**Page convention:** for all three reports, printed page = PDF index + 1 (confirmed via printed "P. N" markers / EY page headers).


## 1. Figure reconcile — summary

- Options with a dollar estimate checked: **122 / 122**
- **PASS: 116** · **FLAG: 6**
- Leverage-tier distribution (all 194 options): large=18, medium=34, mega=8, none=72, one_time=10, small=51, zero=1

### Flagged figures (need attention)

| id | source $ | cited p. | found p. | page_match | basis | issue |
|---|---|---|---|---|---|---|
| `continue-overtime-reduction` | $52.1M–$69.5M | 17 | 17 | exact | annual | FLAG CONFIRMED (figure itself is fine; the issue is basis/timing). Re-pulled correct report (record cites cfftf-interim p.17, not cfftf-final). Figure $52.1M-$6 |
| `maximize-cpd-civilianization` | $78.4M | 24 | 24,31,73,86 | mismatch | ten_year_cumulative | CONFIRMED. Independently verified. The cited CFFTF Interim p.24 table lists 'Maximize CPD Civilianization  N/A  N/A' and the p.31 detail states 'Estimated Savin |
| `establish-autonomous-water-taxis-freight-framework` | $900K | 67 | 66,67 | exact | one_time | Figure CONFIRMED: summary table p.66 lists 0.9/0.9 and detail p.67 states '$0.9 million' / '$0.89 million in estimated net revenue in year 1' — consistent with  |
| `ey-fleet-expanded-warranty-recovery` | $1.7M–$3.7M | 16 | 15,19,21 | mismatch | annual | FLAG CONFIRMED. Independently verified: cited p16 contains ONLY the exceptions-management item ($0.2M-$0.4M) plus the Fleet 'Scope & Approach' narrative — neith |
| `ey-fleet-lifecycle-replacement-strategy` | $2.2M–$4.4M | 16 | 15,20 | near | annual | CONFIRMED. Cited page 16 does NOT contain this figure. Page 16 holds only the exceptions-management item ($0.2M-$0.4M / OT6) plus the 'Scope & Approach' bullets |
| `ey-realestate-land-dispositions` | $45.8M | 25 | 25,26,29,32 | exact | ten_year_pv | CONFIRMED. The number $45.8m is exact and genuinely appears on the cited page 25 (and pp.26, 29, 32), so figure_matches_source=true. But the BASIS is mislabeled |

## 2. Basis audit — every dollar figure (id, estimate, basis, source+page)

Basis distribution: **annual**=99, **one_time**=6, **ten_year_cumulative**=8, **ten_year_pv**=5, **upfront_cost**=4

| id | dollar_estimate | basis | annual-equiv | source p. | evidence |
|---|---|---|---|---|---|
| `cfftf-re-expand-sales-tax-base-consumer-services` | $78.0M–$305.0M | annual | $305.0M | CFFTF  p.59 | CFFTF Interim p54: 'EXPAND SALES TAX ON SERVICES Estimated Range of Incremental  |
| `increase-garbage-fee-cost-recovery` | $19.6M–$296.9M | annual | $296.9M | CFFTF  p.51 | On p.51 the summary 'Options for Fees and Estimated Financial Impact' table list |
| `cfftf-re-increase-lgdf-share-rate` | $35.0M–$250.0M | annual | $250.0M | CFFTF  p.58 | Interim p56: "The low end of the estimated range ($35 million in annual revenues |
| `ey-fees-vehicle-sticker-tax` | $0–$187.5M | annual | $187.5M | EY Fin p.34 | Table 2 (p39) 'List of fees and fines with potential revenue raising opportuniti |
| `cfftf-ltl-secure-cps-pension-contributions` | $175.0M | annual | $175.0M | CFFTF  p.31 | p.31: 'beginning with paying $175 million per year for the first 10 years' (recu |
| `adjust-liquor-tax` | $60.0M–$120.0M | annual | $120.0M | CFFTF  p.53 | Table 'Total Estimated Incremental Revenues ($ millions)' lists 'Adjust Liquor T |
| `ey-procurement-category-management` | $55.0M–$111.0M | annual | $111.0M | EY Fin p.49 | EY p.52: "With 2024 spend of $1,104 million, this results in potential savings o |
| `expand-congestion-surcharge-rideshare` | $26.0M–$103.0M | annual | $103.0M | CFFTF  p.51 | p69: "the City could expect to collect the low range of $26 million estimated in |
| `maintain-grocery-tax` | $80.0M–$83.0M | annual | $83.0M | CFFTF  p.53 | p54: 'Applying a conservative 2% inflationary estimate for 2025 and 2026, Chicag |
| `ey-org-consolidate-overlapping-divisions` | $30.0M–$70.0M | annual | $70.0M | EY Fin p.57 | EY p57 table column header 'Estimated Annual Financial Impact'; row 2 'Consolida |
| `ey-org-shared-labor-pools` | $30.0M–$70.0M | annual | $70.0M | EY Fin p.57 | EY p57 table column header 'Estimated Annual Financial Impact'; row 3 'Establish |
| `continue-overtime-reduction` | $52.1M–$69.5M | annual | $69.5M | CFFTF  p.17 | p.17 narrative: 'The estimated low-end cost savings of $52.1 million per year as |
| `cfftf-re-fully-staff-tax-auditors` | $56.0M | annual | $56.0M | CFFTF  p.49 | p50: 'a fully staffed Tax Division anticipated to generate up to $56 million in  |
| `adjust-city-property-tax` | $56.0M | annual | $56.0M | CFFTF  p.53 | p.55: 'If the City resumes the CPI increase in 2026, the City's revenues are exp |
| `ey-fees-top14-high-impact` | $9.9M–$55.2M | annual | $55.2M | EY Fin p.38 | p38 Table 1 subtotal row: 'Subtotal $34.1m ... +$9.9m to $55.2m'; columns are 'F |
| `explore-employee-contribution-opportunities` | $41.6M–$52.2M | annual | $52.2M | CFFTF  p.20 | p20 detail block states verbatim 'Timing of Savings: Annual' and 'Estimated Savi |
| `pursue-pilot-program` | $0–$52.0M | annual | $52.0M | CFFTF  p.59 | New Taxes table p59 'Pursue Payments in Lieu of Taxes (PILOT) Program 0.0 52.0'; |
| `ey-svcopt-cfd-minimum-manning` | $517.4M | ten_year_cumulative | $51.7M | EY Fin p.76 | EY p72 Service Optimization summary table column header '10-Year Fiscal Impact ( |
| `update-amusement-tax-resellers` | $35.0M–$38.0M | annual | $38.0M | CFFTF  p.53 | p53 'Options for Existing Taxes and Estimated Financial Impact / Total Estimated |
| `ey-org-optimize-spans-of-control` | $37.0M | annual | $37.0M | EY Fin p.57 | p57 table column header reads 'Estimated Annual Financial Impact'; row 1 'Optimi |
| `establish-autonomous-taxi-framework` | $34.5M–$36.3M | annual | $36.3M | CFFTF  p.66 | CFFTF Interim p.66: 'Estimated Range of Revenues in Year 1: $34.5 - $36.3 millio |
| `revisit-retail-delivery-fees` | $6.1M–$30.4M | annual | $30.4M | CFFTF  p.51 | CFFTF Interim p72 detail: 'it could generate an incremental $6.1 - $30.4 million |
| `adjust-bottled-water-tax` | $8.4M–$27.9M | annual | $27.9M | CFFTF  p.53 | Interim p57: "The low end of the estimated range ($8.4 million in annual revenue |
| `reinstitute-head-tax` | $10.2M–$25.6M | annual | $25.6M | CFFTF  p.59 | p59 New Taxes table header 'Total Estimated Incremental Revenues ($ millions)';  |
| `identify-cost-saving-options-not-covered-by-cbas` | $17.3M–$25.3M | annual | $25.3M | CFFTF  p.21 | p.21 header: 'Timing of Savings: Annual / Estimated Savings Range: $17.3 - $25.3 |
| `streamline-hiring` | $25.0M | annual | $25.0M | CFFTF  p.18 | p18: 'STREAMLINE HIRING / Timing of Savings: Annual / Estimated Savings: $25 mil |
| `ey-benefits-increase-ppo-contributions-peer-median` | $23.0M | annual | $23.0M | EY Fin p.43 | Workstream #5 intro (p42) states the analysis 'identified between $80 million an |
| `ey-special-events-cost-recovery-program` | $6.3M–$21.0M | annual | $21.0M | EY Fin p.7 | p7: 'even without changing current ordinances, the City could have recovered an  |
| `ey-benefits-dependent-contribution-behavior-change` | $10.0M–$21.0M | annual | $21.0M | EY Fin p.43 | EY p.43, Cost Savings Opportunities table, item 2 'Behavioural change in employe |
| `ey-fees-additional-revenue-raising` | $10.2M–$18.8M | annual | $18.8M | EY Fin p.39 | p39 'Table 2: List of fees and fines with potential revenue raising opportunitie |
| `initiate-internet-gaming-tax` | $8.5M–$17.0M | annual | $17.0M | CFFTF  p.59 | p60: 'generate an incremental $17 million in estimated revenue annually'; low en |
| `ey-org-standardize-back-office-support` | $7.0M–$15.7M | annual | $15.7M | EY Fin p.57 | EY p.57 table column header 'Estimated Annual Financial Impact'; row 5 'Standard |
| `explore-pbm-carrier-cost-savings` | $10.1M–$13.5M | annual | $13.5M | CFFTF  p.22 | CFFTF Interim p.22: 'EXPLORE NETWORK/PHARMACY BENEFIT MANAGERS (PBM) AND CARRIER |
| `ey-svcopt-cfd-bls-ambulances` | $131.1M | ten_year_cumulative | $13.1M | EY Fin p.77 | Service Optimization summary table (p72) header 'Year 1 Fiscal Impact ($m)' vs ' |
| `increase-plastic-checkout-bag-tax` | $2.3M–$13.0M | annual | $13.0M | CFFTF  p.53 | CFFTF Interim p53 existing-taxes table 'Increase Plastic Checkout Bag Tax 2.3 13 |
| `apply-911-surcharge-digital-prepaid-wireless` | $12.5M | annual | $12.5M | CFFTF  p.53 | p.53 'Options for Existing Taxes and Estimated Financial Impact' table lists 'Ap |
| `explore-healthcare-plan-design` | $12.0M | annual | $12.0M | CFFTF  p.21 | Interim p21: "EXPLORE HEALTHCARE PLAN DESIGN OPPORTUNITIES / Timing of Savings:  |
| `reclaim-costs-non-city-parades` | $11.9M | annual | $11.9M | CFFTF  p.36 | p37 detail block: 'RECLAIM COSTS FOR NON-CITY-SPONSORED PARADES — Timing of Savi |
| `favor-natural-expiration-of-tifs` | $11.0M | annual | $11.0M | CFFTF  p.61 | p.62 recommendation: '$11 million in additional property tax revenue—$1.5 millio |
| `ey-org-reduce-external-legal-counsel` | $5.0M–$11.0M | annual | $11.0M | EY Fin p.58 | p58 table column header "Estimated Annual Financial Impact"; row "Reduce externa |
| `ey-fleet-repair-maintenance-optimization` | $5.1M–$10.2M | annual | $10.2M | EY Fin p.16 | p15 bullet: 'Re-calibrating mechanic/vehicle staffing... and establishing a more |
| `ey-benefits-workers-comp-return-to-work` | $10.0M | annual | $10.0M | EY Fin p.45 | p42 narrative: Return-to-Work program 'paired with a strategic settlement effort |
| `ey-org-close-vacant-positions` | $2.0M–$10.0M | annual | $10.0M | EY Fin p.58 | p58 option 10 'Close budgeted vacant positions for certain roles... $2-10M Short |
| `adjust-driveway-permit-fee` | $800K–$9.3M | annual | $9.3M | CFFTF  p.51 | CFFTF Interim p.51 Fees summary table: 'Adjust Driveway Permit Fee 0.8 9.3' unde |
| `ey-benefits-increase-oop-maximum` | $9.0M | annual | $9.0M | EY Fin p.44 | p44 Plan Design Opportunities ($12M): "8. Increase employee out-of-pocket maximu |
| `ey-benefits-claims-fee-integrity-study` | $4.0M–$9.0M | annual | $9.0M | EY Fin p.44 | p44 item 13: 'Engage a service provider for a claims and fee integrity study ... |
| `ey-svcopt-oemc-traffic-parking-enforcement` | $84.2M | ten_year_cumulative | $8.4M | EY Fin p.93 | p93 detail: '~$82m in additional revenue over 10 years' + 'may save ~$3m in cost |
| `ey-org-ai-payroll-recruiting` | $6.0M–$8.0M | annual | $8.0M | EY Fin p.57 | p57 table column header 'Estimated Annual Financial Impact'; row 6 'Expand use o |
| `ey-org-optimize-library-staffing` | $3.0M–$8.0M | annual | $8.0M | EY Fin p.58 | EY p.58 table column header 'Estimated Annual Financial Impact'; row 8 'Optimize |
| `maximize-cpd-civilianization` | $78.4M | ten_year_cumulative | $7.8M | CFFTF  p.24 | EY p.73 row 'Civilianization of sworn positions ... 3.7  78.4'; EY p.72 column h |
| `ey-svcopt-cfd-civilianization` | $76.8M | ten_year_cumulative | $7.7M | EY Fin p.78 | EY p.72 Service Optimization summary table column '10-Year Fiscal Impact ($m)':  |
| `cfd-false-fire-alarm-cost-recovery` | $4.7M–$6.6M | annual | $6.6M | CFFTF  p.24 | CFFTF Interim p.24 Public Safety table: 'Implement CFD False Fire Alarm Fee Cost |
| `cfd-cost-recovery-fire-alarm-hazmat-highrise` | $6.2M | annual | $6.2M | CFFTF  p.24 | CFFTF Interim p25 detail: 'Timing of Savings: Annual / Estimated Savings: $6.2 m |
| `ey-benefits-refine-pbm-contracts` | $5.0M–$6.0M | annual | $6.0M | EY Fin p.44 | p.42 workstream intro: 'this analysis identified between $80 million and $103 mi |
| `disband-cpd-mounted-unit` | $5.9M | annual | $5.9M | CFFTF  p.24 | Interim p24 table "Disband CPD Mounted Unit Division 5.9 5.9"; footnote 17: "The |
| `ey-fleet-utilization-metrics` | $2.9M–$5.8M | annual | $5.8M | EY Fin p.16 | p18 table: savings 'represent 2% - 4% of addressable spend' from right-sizing, r |
| `ey-realestate-sell-industrial-buildings` | $57.9M | ten_year_pv | $5.8M~ | EY Fin p.26 | EY p26 Table 2 column header "PV (10 Years @ 5%)"; row "Industrial and Other Bui |
| `ey-realestate-office-consolidation` | $23.5M–$55.5M | ten_year_pv | $5.5M~ | EY Fin p.25 | Table 1 (p25) column header "PV (10 Years @ 5%)" row "Office: Net cost savings f |
| `maximize-cpd-cost-recovery-events` | $5.5M | annual | $5.5M | CFFTF  p.36 | p.37 header: 'MAXIMIZE CPD COST RECOVERY FOR EVENTS / Timing of Savings: Annual  |
| `ey-benefits-refine-carrier-networks` | $2.0M–$5.0M | annual | $5.0M | EY Fin p.44 | Workstream #5 intro p42: "identified between $80 million and $103 million in pot |
| `ey-benefits-adjust-nonunion-contributions` | $2.4M–$4.8M | annual | $4.8M | EY Fin p.43 | p43 row 4: 'Adjust non-union employee contributions... $2.4M - $4.8M' under 'Sum |
| `ey-realestate-land-dispositions` | $45.8M | ten_year_pv | $4.6M~ | EY Fin p.25 | EY p.25 Table 1 (Low Range) and p.26 Table 2 (High Range) both place $45.8m unde |
| `ey-fleet-lifecycle-replacement-strategy` | $2.2M–$4.4M | annual | $4.4M | EY Fin p.16 | Not explicitly labeled annual on this figure. p20 table totals are framed as 'su |
| `ey-benefits-working-spouse-surcharge` | $4.4M | annual | $4.4M | EY Fin p.43 | p43 option 3 'Apply a $50/month working spouse surcharge... $4.4M' within 'Summa |
| `consider-advertising-light-poles` | $4.3M | annual | $4.3M | CFFTF  p.51 | CFFTF Interim p.51 Fees table: 'Consider Advertising on Light Poles 4.3 4.3' und |
| `adjust-zoning-permit-review-renovations` | $500K–$4.2M | annual | $4.2M | CFFTF  p.52 | p52 Fees table: "Adjust Zoning Permit Review Fees for Renovations and Alteration |
| `ey-svcopt-oemc-311-call-center` | $40.1M | ten_year_cumulative | $4.0M | EY Fin p.94 | p94: "Reduction of the hours of operation may produce cost savings for the City  |
| `ey-fleet-expanded-warranty-recovery` | $1.7M–$3.7M | annual | $3.7M | EY Fin p.16 | p19 table: 'Expanded Warranty Recovery ... OS1 $1.7M to $3.7M • Estimated saving |
| `adjust-barricade-permit` | $100K–$3.3M | annual | $3.3M | CFFTF  p.52 | p78 detail: 'increase from the current $550 to $683. This would generate an incr |
| `adjust-sidewalk-cafe-permit-fees` | $3.1M | annual | $3.1M | CFFTF  p.51 | CFFTF Interim p.73 detail: 'these proposals could generate an incremental $3.1 m |
| `adjust-limited-business-license-fees` | $900K–$3.1M | annual | $3.1M | CFFTF  p.51 | CFFTF Interim p.51 Fees table: 'Adjust Limited Business License Fees 0.9 3.1'; d |
| `ey-svcopt-oemc-911-fmla-dispatcher-pool` | $31.0M | ten_year_cumulative | $3.1M | EY Fin p.95 | EY p.74 OEMC summary table '10-Year Fiscal Impact ($m)': FMLA/911 pool row reads |
| `ey-realestate-sell-vacated-office-buildings` | $16.3M–$29.1M | ten_year_pv | $2.9M~ | EY Fin p.25 | p.25 Table 1 (Low Range) row 'Office: Net revenue from selling vacated office bu |
| `cpd-false-burglar-alarm-cost-recovery` | $2.8M | annual | $2.8M | CFFTF  p.24 | CFFTF Interim p27 detail: 'IMPLEMENT CPD FALSE BURGLAR ALARM COST RECOVERY / Tim |
| `adjust-zoning-permit-review-new-construction` | $200K–$2.7M | annual | $2.7M | CFFTF  p.52 | CFFTF Interim p52 fees table 'Adjust Zoning Permit Review Fees (New Construction |
| `adjust-zoning-compliance-certification-fee` | $1.0M–$2.6M | annual | $2.6M | CFFTF  p.51 | p.51 'Options for Fees and Estimated Financial Impact' table lists 'Adjust Certi |
| `ey-benefits-expand-centers-of-excellence` | $2.6M | annual | $2.6M | EY Fin p.44 | EY p44 item 14 "Expand centers of excellence... to include cancer care... $2.6M" |
| `ey-svcopt-opsa-timekeeper-erp` | $25.1M | ten_year_cumulative | $2.5M | EY Fin p.97 | Summary table p74: "Timekeeper roles in OPSA ... - 25.1" with first (Year-1) col |
| `divert-cfd-911-to-telehealth` | $2.5M | annual | $2.5M | CFFTF  p.24 | p27 detail: 'DIVERT CFD 911 CALLS... Timing of Savings: Annual — Estimated Savin |
| `ey-org-contract-management-system` | $2.5M | annual | $2.5M | EY Fin p.58 | p.58 table column header 'Estimated Annual Financial Impact'; row 9 'Implement e |
| `adjust-recycling-fines` | $500K–$2.1M | annual | $2.1M | CFFTF  p.52 | p80 detail: "ADJUST RECYCLING FINES Estimated Range of Incremental Revenues: $0. |
| `ey-benefits-raise-remove-salary-caps` | $2.1M | annual | $2.1M | EY Fin p.43 | p43 row 5: 'Raise or remove the salary caps to employee contributions... $2.1M', |
| `adjust-canopy-permit-fees` | $500K–$1.8M | annual | $1.8M | CFFTF  p.51 | Revenue category framed as recurring incremental revenue; companion fee detail o |
| `adjust-food-violation-citation-fees` | $400K–$1.8M | annual | $1.8M | CFFTF  p.52 | p52 'Options for Fees and Estimated Financial Impact / Total Estimated Increment |
| `adjust-dumpster-permit-fees` | $100K–$1.8M | annual | $1.8M | CFFTF  p.52 | CFFTF Interim p.52 Fees table: 'Adjust Dumpster Permit Fees 0.1 1.8' under 'Tota |
| `cfd-pyrotechnics-sprinkler-cost-recovery` | $1.6M | annual | $1.6M | CFFTF  p.24 | p28 detail: "Timing of Savings: Annual / Estimated Savings: $1.6 million"; p24 P |
| `reclaim-other-personnel-costs-special-events` | $1.5M | annual | $1.5M | CFFTF  p.37 | p37: 'RECLAIM OTHER PERSONNEL COSTS... Timing of Savings: Annual / Estimated Sav |
| `ey-benefits-eliminate-hmo-stop-loss` | $900K–$1.5M | annual | $1.5M | EY Fin p.44 | EY p.43 Workstream #5 intro: 'identified between $80 million and $103 million in |
| `adjust-code-enforcement-fines` | $600K–$1.4M | annual | $1.4M | CFFTF  p.52 | CFFTF Interim p.52 Fines table: 'Adjust Code Enforcement Fines 0.6 1.4'; detail  |
| `ey-benefits-opt-out-credits` | $1.4M | annual | $1.4M | EY Fin p.44 | EY p42 Workstream 5 intro: benefits analysis 'identified between $80 million and |
| `ey-realestate-riverwalk-revenue-share` | $13.3M | ten_year_pv | $1.3M~ | EY Fin p.28 | EY p32: 'The estimated incremental revenue captured through these strategies tot |
| `reclaim-non-personnel-costs-special-events` | $1.3M | annual | $1.3M | CFFTF  p.38 | CFFTF Interim p38: 'RECLAIM NON-PERSONNEL COSTS TO IMPROVE SPECIAL EVENT COST RE |
| `ey-benefits-reduce-hmo-contributions` | $1.3M | annual | $1.3M | EY Fin p.43 | p.42 intro: '$80 million and $103 million in potential annual savings'; p.43 ite |
| `increase-cpd-first-dui-fee` | $1.1M | annual | $1.1M | CFFTF  p.24 | Interim p24 table "Increase CPD First Time Driving Under the Influence (DUI) Fee |
| `cfd-ems-treat-no-transport-tnt` | $900K | annual | $900K | CFFTF  p.24 | p29 detail: 'INSTITUTE CFD EMS COST RECOVERY - TREAT-NO-TRANSPORT (TNT) — Timing |
| `ey-benefits-increase-copays` | $900K | annual | $900K | EY Fin p.44 | Workstream #5 intro p42: "$80 million and $103 million in potential annual savin |
| `adjust-annual-food-inspection-fees` | $300K–$800K | annual | $800K | CFFTF  p.52 | p52 Fees table: 'Adjust Annual Food Inspection Fees 0.3 0.8' under 'Total Estima |
| `adjust-parking-vehicle-fees` | $100K–$800K | annual | $800K | CFFTF  p.52 | Same Fees revenue category as canopy; framed as recurring incremental revenue wi |
| `ey-benefits-tobacco-surcharge` | $700K | annual | $700K | EY Fin p.44 | EY p.44 Cost Savings Opportunities table, item 7: 'Apply a $25/month tobacco sur |
| `capture-non-personnel-costs-athletic-events` | $600K | annual | $600K | CFFTF  p.38 | p38: "CAPTURE NON-PERSONNEL COSTS FOR ATHLETIC EVENTS ... Timing of Savings: Ann |
| `explore-road-usage-charge` | $600K | annual | $600K | CFFTF  p.51 | p51 Fees table 'Total Estimated Incremental Revenues ($ millions)': 'Explore a R |
| `develop-ip-licensing-program` | $600K | annual | $600K | CFFTF  p.51 | p74: 'The estimated net revenue is ~$0.6 million generated during Year 1. Net re |
| `ey-benefits-offer-hdhp` | $500K | annual | $500K | EY Fin p.44 | EY p.44 Plan Design Opportunities: item 11 'Offer a High-Deductible Health Plan  |
| `increase-autonomous-drones-cpd` | $400K | annual | $400K | CFFTF  p.24 | CFFTF Interim p30 detail: 'INCREASE USE OF AUTONOMOUS DRONES AT CPD / Timing of  |
| `ey-fleet-acquisition-standard-specifications` | $200K–$400K | annual | $400K | EY Fin p.16 | EY cited page 16 states the figure with no time basis ('additional potential sav |
| `cfd-non-emergency-lift-assist-cost-recovery` | $300K | annual | $300K | CFFTF  p.24 | p.24 Public Safety Options table: 'Institute CFD Cost Recovery for Non-Emergency |
| `expanding-digital-outdoor-advertising` | $200K–$300K | annual | $300K | CFFTF  p.52 | Interim p77: "the City would receive ~$0.2-$0.3 incremental annual revenue"; "th |
| `adjust-sign-permit-fees` | $100K–$300K | annual | $300K | CFFTF  p.52 | p79 detail: 'This would generate an incremental $0.1 million in estimated revenu |
| `cpd-squad-car-film-production-cost-recovery` | $200K | annual | $200K | CFFTF  p.24 | p.31 header: 'INCREASE CPD COST RECOVERY FOR SQUAD CAR USAGE IN FILM PRODUCTION  |
| `utilize-full-overtime-rate-cost-recovery` | $200K | annual | $200K | CFFTF  p.38 | p38: 'UTILIZE FULL OVERTIME RATE TO IMPROVE COST RECOVERY / Timing of Savings: A |
| `ey-benefits-revise-wellness-program` | $200K | annual | $200K | EY Fin p.44 | Item sits under Workstream #5 whose intro (p42) reports '$80 million and $103 mi |
| `ey-benefits-cobra-communications` | $0 | annual | $0 | EY Fin p.45 | p45 option 20 'Assess enhancing Consolidated Omnibus Budget Reconciliation Act ( |
| `institute-vacancy-freeze` | $143.7M–$161.7M | one_time | (one-time) | CFFTF  p.15 | p16: "the City could realize $143.7-$161.7 million in estimated one-time cost sa |
| `implement-flexible-furlough-days` | $9.4M–$18.8M | one_time | (one-time) | CFFTF  p.18 | p18 heading: "IMPLEMENT FLEXIBLE FURLOUGH DAYS / Timing of Savings: One-Time / E |
| `rent-opsa-regional-training-facility` | -$200K | upfront_cost | (one-time) | CFFTF  p.24 | p24 Public Safety table: "Rent OPSA Regional Training Facility (0.2) (0.2)"; foo |
| `expand-opsa-cameras-cfd-cpd-vehicles` | -$500K | upfront_cost | (one-time) | CFFTF  p.24 | CFFTF Interim p.24 footnote 17: 'For proposals with negative dollar balances, th |
| `introduce-cfd-light-duty-positions` | -$700K | upfront_cost | (one-time) | CFFTF  p.24 | p24 Public Safety table 'Introduce CFD Light-Duty Positions (0.7) (0.7)'; footno |
| `implement-cpd-early-warning-system` | -$1.5M | upfront_cost | (one-time) | CFFTF  p.24 | p24 Public Safety table: 'Implement a CPD Early Warning System (EWS) (1.5) (1.5) |
| `optimize-real-estate-portfolio` | $29.5M | one_time | (one-time) | CFFTF  p.61 | CFFTF Interim p61: 'OPTIMIZE THE CITY'S REAL ESTATE PORTFOLIO Estimated Incremen |
| `declare-maximum-tif-surplus` | $137.0M | one_time | (one-time) | CFFTF  p.61 | p62 Recommendation: 'continuing to declare the maximum TIF surplus as a one-time |
| `establish-autonomous-water-taxis-freight-framework` | $900K | one_time | (one-time) | CFFTF  p.67 | cfftf-interim p.67: 'Estimated Incremental Revenues: $0.9 million' and 'the prop |
| `ey-fleet-accelerate-disposition` | $4.4M–$6.4M | one_time | (one-time) | EY Fin p.16 | EY p15: 'Accelerating the disposition process... helping to unlock a one-time $4 |

## 3. Overlap map — mutually-exclusive groups (cannot all be banked)

### Special Events Cost Recovery — EY umbrella vs CFFTF Interim component rows  _(kind: umbrella_vs_components)_
- Umbrella row: `ey-special-events-cost-recovery-program`
- Members: `ey-special-events-cost-recovery-program`, `maximize-cpd-cost-recovery-events`, `reclaim-other-personnel-costs-special-events`, `reclaim-non-personnel-costs-special-events`, `capture-non-personnel-costs-athletic-events`, `utilize-full-overtime-rate-cost-recovery`, `reclaim-costs-non-city-parades`, `improve-data-tracking-collection-special-events`
- EY's single 'Special Events Cost Recovery' row is a $6.3M (no ordinance change) to $21M (with ordinance expansion) umbrella covering CPD/CFD/DSS/CDOT recovery for parades, festivals, athletic and stadium events (EY p7-8). The CFFTF Interim decomposes the SAME special-events recovery opportunity into granular component rows: maximize CPD non-overtime recovery ($5.5M), reclaim other-personnel costs ($1.5M), reclaim non-personnel costs ($1.3M), capture athletic-event non-personnel costs ($0.6M), utilize full 1.5x overtime rate ($0.2M), reclaim non-city-parade costs ($11.9M), plus a non-priced data-tracking enabler. Banking the EY umbrella AND the Interim component rows double-counts the same recovered dollars — pick one representation. Interim component dollars ($5.5+1.5+1.3+0.6+0.2+11.9 = $21M) reconcile to EY's $21M high end, confirming they are the same pool. Note EY's own qualitative sub-rows (fire-ems-cost-recovery EY p11, tiered-fee-structure EY p12, harmonize-ordinances EY p11) are likewise internal pieces of this umbrella and must not be banked on top of it.
- _Cite: EY p7-8 (umbrella $6.3M-$21M, Table 1 by event type); CFFTF Interim pp36-39 (component rows)_

### $11.9M non-city-sponsored parade — internal component of EY special-events umbrella  _(kind: internal_component)_
- Umbrella row: `ey-special-events-cost-recovery-program`
- Members: `ey-special-events-cost-recovery-program`, `reclaim-costs-non-city-parades`
- The $11.9M non-city-sponsored parade recovery is not an independent lever — it is the single largest line INSIDE the EY $6.3-21M umbrella. EY p8 Table 1 lists parades 'with ordinance change' = $11.9m (parades are 'the single largest unrecovered cost category', EY p11), which is the dominant slice of EY's $14.7m with-ordinance expansion. The same $11.9M figure is extracted from CFFTF Interim p36 (and the option itself flags it is also analyzed in EY p11). Therefore banking the EY umbrella AND the standalone parade option counts the parade dollars twice. The EY umbrella's own note explicitly warns: the $11.9m parade recovery 'is a COMPONENT of this $21m total — avoid double counting.'
- _Cite: EY p8 (Table 1, parade with-ordinance-change $11.9m) and EY p11 ('up to $11.9m'); CFFTF Interim p36 (Reclaim Costs for Non-City-Sponsored Parades, $11.9M)_

### Employee Benefits — EY granular levers vs CFFTF Interim groupings (same $80-103M pool)  _(kind: granular_vs_grouping)_
- Members: `explore-employee-contribution-opportunities`, `identify-cost-saving-options-not-covered-by-cbas`, `explore-healthcare-plan-design`, `explore-pbm-carrier-cost-savings`, `assess-loa-health-coverage-continuation`, `ey-benefits-increase-ppo-contributions-peer-median`, `ey-benefits-dependent-contribution-behavior-change`, `ey-benefits-working-spouse-surcharge`, `ey-benefits-adjust-nonunion-contributions`, `ey-benefits-raise-remove-salary-caps`, `ey-benefits-reduce-hmo-contributions`, `ey-benefits-tobacco-surcharge`, `ey-benefits-increase-oop-maximum`, `ey-benefits-opt-out-credits`, `ey-benefits-increase-copays`, `ey-benefits-offer-hdhp`, `ey-benefits-refine-pbm-contracts`, `ey-benefits-claims-fee-integrity-study`, `ey-benefits-expand-centers-of-excellence`, `ey-benefits-refine-carrier-networks`, `ey-benefits-eliminate-hmo-stop-loss`, `ey-benefits-revise-wellness-program`, `ey-benefits-workers-comp-return-to-work`, `ey-benefits-cobra-communications`
- Two parallel decompositions of one health/OPEB savings pool. EY's Employee Benefits Analysis = $80M-$103M (EY p42), expressed as ~19-20 granular levers (contributions, surcharges, salary caps, opt-out, plan design / OOP / copays / HDHP, PBM/carrier/networks, COEs, stop-loss, wellness, worker's-comp return-to-work, COBRA; pp42-46). The CFFTF Interim 'Employee Benefits Efficiency' workstream = $81M-$103M (Interim p20), expressed as FIVE groupings that roll those same levers up: Employee Contribution Opportunities ($41.6-52.2M), CBA-Unnecessary options ($17.3-25.3M), Healthcare Plan Design ($12.0M), PBM/Carrier ($10.1-13.5M), and LOA health-coverage continuation (N/A). Both totals are the identical ~$80/81-103M pool, so banking the EY granular set AND the Interim groupings double-counts. Choose one decomposition. (The Interim 5th grouping, identify-cost-saving-options-not-covered-by-cbas, was the previously-uncounted member; the task's '~5 groupings' is exactly 5, not 4.)
- _Cite: EY p42 ($80-103M; granular levers pp42-46); CFFTF Interim p20 (5 groupings table, $81-103M; detail pp20-22)_

### Real Estate / Asset Monetization — CFFTF Final qualitative vs Interim grouping vs EY granular rows  _(kind: multi_way_same_asset)_
- Umbrella row: `optimize-real-estate-portfolio`
- Members: `cfftf-ltl-inventory-monetize-noncore-assets`, `optimize-real-estate-portfolio`, `ey-realestate-office-consolidation`, `ey-realestate-sell-vacated-office-buildings`, `ey-realestate-sell-industrial-buildings`, `ey-realestate-riverwalk-revenue-share`, `ey-realestate-land-dispositions`, `ey-realestate-governance-data-leasing-reforms`
- Three representations of monetizing the same City real-estate assets. (1) CFFTF Final 'Inventory and Monetize Non-Core Assets with Oversight' (p36) is the qualitative parent recommendation (no dollar). (2) CFFTF Interim 'Optimize the City's Real Estate Portfolio' (p61) is a single priced grouping = $29.5M Year-1 revenue, and its own text bundles 'strategic consolidation, disposition, and redevelopment... consolidate occupancy, sell properties, exit leases and renegotiate revenue generating leases' plus centralizing governance — i.e., exactly the EY granular rows. (3) EY breaks the same portfolio into granular rows totalling the Real Estate workstream of $157M-$202M (EY p6): office consolidation ($23.5-55.5M), sell vacated office buildings ($16.3-29.1M), sell industrial/non-office buildings ($57.9M), Riverwalk concession revenue-share ($13.3M), accelerated land dispositions ($45.8M), and governance/data/leasing reforms (enabler). These act on the same buildings, land parcels and leases, so banking across the three layers double-counts. (Note timeframes differ — Interim $29.5M is Year-1; EY figures are 10-year present values — but they monetize the same assets, so they remain mutually exclusive.)
- _Cite: CFFTF Final p36 (Inventory/Monetize Non-Core Assets, qualitative); CFFTF Interim p61 (Optimize Real Estate Portfolio, $29.5M Yr-1); EY p6 (Real Estate workstream $157-202M) and granular rows pp25-32_


## 4. Gap reconcile

All 13 figures verified verbatim on their cited printed pages (printed page = pdf_index+1 holds for all three reports). The figures genuinely disagree, but the disagreement is almost entirely about WHAT is being measured, not about errors. Four axes of divergence:

1) FISCAL YEAR. The headline numbers attach to different years. The two CFFTF Interim and EY 'big' numbers are FY2026 near-term gaps (~$1.1-1.2B). The CFFTF Final's headline $680M is a FY2027 figure. They are not the same quantity at all: $1.1-1.2B is the cyclical FY2026 hole (inflated by expiring one-time pandemic/TIF revenues), while $680M is what the Final says persists into FY2027 and beyond once those one-time effects are gone (Final p.5, p.10).

2) POINT-IN-TIME vs DURABLE/RANGE. The Final deliberately reframes the problem from a single-year gap to a durable structural gap, citing $680M as the persistent baseline (p.5) and $680-$780M as the recurring annual range (p.10). The Interim and EY are point-in-time single-year deficit forecasts.

3) RESTATEMENT / ROUNDING. The same FY2026 gap is quoted three ways. The Interim states its OWN number as '$1.1 billion' and 'over $1.1 billion' (p.7, p.10); EY independently forecasts 'roughly $1.15 billion' (p.4); and the Final, summarizing the Interim, rounds it UP to '$1.2 billion' (p.6). So the Final's $1.2B is a restatement of the Interim's $1.1B, not a fourth distinct estimate — a key reconciliation point, since a naive reader would treat $1.1B, $1.15B, and $1.2B as three different gaps when they are one gap rounded differently.

4) MEASURE / SCOPE. The FY2025 figures look contradictory but are not: the Interim's '$982.4 million' (p.10) is the PROJECTED Corporate Fund deficit before mitigation, while EY's 'approximately $146 million' (p.4) is the projected YEAR-END outturn after the city's in-year actions. Different points in the budget cycle, same year. Separately, several figures are not gaps at all: $6.5B (Final p.7) is the Corporate Fund's total size (the denominator); $35.9B (Interim p.11) is the unfunded pension LIABILITY (a balance-sheet driver, not an annual operating gap); $175M (EY p.4, CPS reimbursement) and $820M (EY p.4, cumulative supplemental pension payments since 2023) are drivers/context. EY's '$530M-$1.396B' (p.5) is the SOLUTION menu, not the gap — and notably only its high end fully covers the ~$1.15B FY2026 gap.

Reconciled picture: there is ONE near-term FY2026 Corporate Fund gap (~$1.1-1.2B, all sources agreeing within rounding) and ONE durable structural gap the Final isolates for FY2027+ ($680M, range $680-$780M). Everything else is either the same number restated, a different fiscal year, or context/liability/solution figures that should not be mistaken for the gap.

### The 13 structural-gap figures
| label | amount | FY | source | p. | verified |
|---|---|---|---|---|---|
| FY2027 Corporate Fund structural shortfall (durable, baseline) | $680 million | FY2027 | CFFTF Final Report — cfftf-final-2026.pdf | 5 | ✓ |
| FY2027 recurring structural gap range (long-term baseline) | $680-$780 million annually | FY2027 | CFFTF Final Report — cfftf-final-2026.pdf | 10 | ✓ |
| FY2026 budget gap as addressed by the Interim Report (restated in Final) | $1.2 billion | FY2026 | CFFTF Final Report — cfftf-final-2026.pdf | 6 | ✓ |
| FY2026 total Corporate Fund size (context/denominator) | $6.5 billion | FY2026 | CFFTF Final Report — cfftf-final-2026.pdf | 7 | ✓ |
| FY2026 Corporate Fund deficit forecast (Interim headline) | $1.1 billion | FY2026 | CFFTF Interim Report — cfftf-interim-2026.pdf | 7 | ✓ |
| FY2026 Corporate Fund projected deficit (Budget Environment restatement) | over $1.1 billion | FY2026 | CFFTF Interim Report — cfftf-interim-2026.pdf | 10 | ✓ |
| FY2025 projected Corporate Fund deficit (Interim) | $982.4 million | FY2025 | CFFTF Interim Report — cfftf-interim-2026.pdf | 10 | ✓ |
| Unfunded pension liabilities, four city systems (long-term liability) | $35.9 billion | as of 2024 | CFFTF Interim Report — cfftf-interim-2026.pdf | 11 | ✓ |
| FY2026 Corporate Fund gap (EY forecast) | roughly $1.15 billion | FY2026 | EY Financial and Strategic Reform Options — ey-reform-options.pdf | 4 | ✓ |
| FY2025 projected year-end deficit (EY) | approximately $146 million | FY2025 | EY Financial and Strategic Reform Options — ey-reform-options.pdf | 4 | ✓ |
| CPS pension cost reimbursement uncertainty (driver) | approximately $175 million annually | recurring | EY Financial and Strategic Reform Options — ey-reform-options.pdf | 4 | ✓ |
| Supplemental pension payments since 2023 (context) | more than $820 million | cumulative since 2023 | EY Financial and Strategic Reform Options — ey-reform-options.pdf | 4 | ✓ |
| Total identified savings/revenue across nine workstreams (solution space) | $530 million - $1.396 billion | mixed (immediate + long-term) | EY Financial and Strategic Reform Options — ey-reform-options.pdf | 5 | ✓ |

### Defensible targets a game could ask the player to close
- **The Durable Structural Gap (recurring-only) — $680 million (FY2027)**: This is the honest long-term target: the gap that survives after one-time resources unwind. Choosing it forces the player to close the gap with RECURRING levers only (structural revenue, permanent cost reductions, pension/State action) and to disallow one-time plugs like TIF surplus or asset sales from counting toward victory. Hardest framing, but the one the Final Report treats as the real problem.  _basis: CFFTF Final Report p.5 ('$680 million shortfall that persists even under baseline assumptions'), reinforced by the $680-$780M annual range on p.10._
- **The Near-Term Crisis Gap (FY2026 budget hole) — roughly $1.15 billion (FY2026)**: This is the immediate budget the mayor must actually balance for the year. Choosing it lets both one-time AND recurring levers count, mirroring how Chicago has historically closed gaps. The player feels the full crisis scale, but can 'win' the year with temporary fixes, setting up the structural-gap problem for later turns.  _basis: EY p.4 ('Corporate Fund gap of roughly $1.15 billion'), corroborated by CFFTF Interim p.7/p.10 ('$1.1 billion' / 'over $1.1 billion') and the Final's restatement on p.6 ('$1.2 billion FY2026 budget gap'). A defensible point figure of ~$1.15B sits squarely inside that $1.1-1.2B band._
- **The Upper Structural Stretch (pessimistic baseline) — $780 million (FY2027)**: A harder recurring target for players who want the worst-case economic assumptions. It implies weaker revenue growth and tests whether the player's recurring solutions hold up under stress. Bounded by EY's identified solution space (p.5, $530M-$1.396B), it remains closeable only if the player reaches well into the upper half of the available reform menu.  _basis: High end of CFFTF Final p.10's recurring structural gap range ($680-$780 million annually beginning in FY27)._

## 5. Dissent taxonomy

Total dissents: **45**. Opposing A/B splits: `institute-vacancy-freeze`, `increase-autonomous-drones-cpd`, `cfftf-ltl-external-funding-adc`

| category | count | definition |
|---|---|---|
| Goes too far / overreaches | 22 | Dissent argues the option reaches too far or harms a group/the City — it should be scaled back, rejected, or carved out (e.g., regressive on low-income households, anti-growth, damages morale/recruitment, undermines long-term TIF/asset value, or overshoots a funding target). Includes cautionary 'merits-further-analysis' dissents whose substantive thrust is that the specific measure overreaches. Members: cfftf-ltl-external-funding-adc, cfftf-re-resume-cpi-property-tax-increases, cfftf-re-expand-sales-tax-base-consumer-services, implement-flexible-furlough-days, explore-employee-contribution-opportunities, explore-healthcare-plan-design, assess-loa-health-coverage-continuation, disband-cpd-mounted-unit, cfd-ems-treat-no-transport-tnt, rent-opsa-regional-training-facility, expand-opsa-cameras-cfd-cpd-vehicles, expand-congestion-surcharge-rideshare, increase-garbage-fee-cost-recovery, index-fees-fines-inflation-annually, adjust-city-property-tax, reinstitute-head-tax, pursue-pilot-program, optimize-real-estate-portfolio, declare-maximum-tif-surplus, favor-natural-expiration-of-tifs, explore-early-termination-of-tifs, shift-to-outcome-based-budgeting |
| Alternative / caution / incomplete | 18 | Dissent neither simply endorses nor rejects: it redirects to a different/better approach, urges more analysis or cost-benefit study first, flags the option as ineffective/unnecessary/duplicative, or says the recommendation is one-sided/incomplete in scope. Members: cfftf-ltl-advanced-supplemental-payment, cfftf-ltl-secure-cps-pension-contributions, cfftf-ltl-voluntary-buyouts, cfftf-ltl-state-fiscal-note-pension, cfftf-ltl-state-dedicated-funding-pension, cfftf-re-graduated-income-tax, cfftf-re-restructure-electricity-tax, cfftf-re-consolidate-cpl-management-reporting, cfftf-re-cpl-systemwide-strategic-plan, cfftf-re-define-cpl-branch-service-priorities, cfftf-re-tailor-cpl-services-by-neighborhood, cfftf-re-analyze-scale-cpl-best-practices, cfftf-re-limit-pprt-diversions, cfftf-re-increase-lgdf-share-rate, cfftf-re-cordon-congestion-pricing, utilize-full-overtime-rate-cost-recovery, establish-autonomous-taxi-framework, establish-autonomous-freight-drone-framework |
| Does not go far enough | 3 | Dissent argues the option is too timid and should go further — deeper cuts, more aggressive enforcement, more progressive revenue, or stronger affordability conditions. Members: cfftf-re-benchmark-taxes-fees-expenditures (push progressive options for high earners/large businesses), continue-overtime-reduction (eliminate/cap CPD overtime), cfftf-ed-missing-middle-infill-housing (require affordability as condition of subsidy). |
| Opposing dual dissents (too far + not far enough) | 2 | Option carries two dissents that genuinely point in OPPOSITE directions — one says it goes too far, the other says it does not go far enough/is inadequate. Members: institute-vacancy-freeze (A: freeze overlooks overtime/burnout/contractor costs; B: should eliminate 2yr-old CPD vacancies, move parking enforcement, route calls to CARE), increase-autonomous-drones-cpd (A: surveillance/tracking concerns; B: drones insufficient to replace a helicopter). |

### Direction-faithfulness spot checks
| id | p. | direction | faithful? | category |
|---|---|---|---|---|
| `institute-vacancy-freeze` | 16 | opposing_both | ✓ | Opposing dual dissents (too far + not far enough) |
| `increase-autonomous-drones-cpd` | 30 | opposing_both | ✓ | Opposing dual dissents (too far + not far enough) |
| `cfftf-ltl-external-funding-adc` | 32 | too_far | ✓ | Goes too far / overreaches |
| `continue-overtime-reduction` | 18 | not_far_enough | ✓ | Does not go far enough |
| `implement-flexible-furlough-days` | 19 | too_far | ✓ | Goes too far / overreaches |
| `disband-cpd-mounted-unit` | 26 | too_far | ✓ | Goes too far / overreaches |
| `cfd-ems-treat-no-transport-tnt` | 29 | too_far | ✓ | Goes too far / overreaches |
| `cfftf-ltl-advanced-supplemental-payment` | 30 | alternative_or_caution | ✓ | Alternative / caution / incomplete |
| `cfftf-re-consolidate-cpl-management-reporting` | 57 | alternative_or_caution | ✓ | Alternative / caution / incomplete |
| `cfftf-re-resume-cpi-property-tax-increases` | 60 | too_far | ✓ | Goes too far / overreaches |
| `cfftf-re-expand-sales-tax-base-consumer-services` | 60 | too_far | ✓ | Goes too far / overreaches |
| `cfftf-re-cordon-congestion-pricing` | 60 | alternative_or_caution | ✓ | Alternative / caution / incomplete |
| `cfftf-ed-missing-middle-infill-housing` | 77 | not_far_enough | ✓ | Does not go far enough |
| `reinstitute-head-tax` | 59 | too_far | ✓ | Goes too far / overreaches |
| `establish-autonomous-taxi-framework` | 66 | alternative_or_caution | ✓ | Alternative / caution / incomplete |

_All 45 has_dissent options are CFFTF (20 cfftf-final 'reform/revenue/expenditure' recs, 25 cfftf-interim). Validated 15 against the PDFs (>=10 required), including all three named A/B-split options; in every case sources.json dissent_summary preserves the true direction (direction_faithful=true for all 15).

IMPORTANT nuance on opposing_split_ids: Of the three A/B-split options the task names as 'opposing,' only TWO are genuinely opposing (too_far vs not_far_enough): institute-vacancy-freeze (p16) and increase-autonomous-drones-cpd (p30). The third, cfftf-ltl-external-funding-adc (p32-33), has two dissents but they do NOT oppose: Dissent A says targeting 100% funding (vs the 90% required by law) goes too far, and Dissent B suggests the funding-percentage target could be LOWERED — both lean toward LESS funding. sources.json correctly captures this (A=too_far, B=alternative-lower) and never claims a not_far_enough split. I list all three in opposing_split_ids because the task explicitly names them as the A/B-split set to surface, but flag here that ADC is not a genuine too_far/not_far_enough opposition. In the taxonomy I therefore classified ADC under 'Goes too far' (its dominant thrust), not under the 2-count 'Opposing dual dissents' category.

Taxonomy is direction-based (4 categories), aligning with the task's emphasis and the validated[] direction enum; counts sum to 45 (22+18+3+2).

Boundary judgments documented for transparency: (1) The cfftf-final shared 'Additional Fees, Fines & Taxes' dissent (recs 21-25, text on p60) splits into Dissent A (Springfield could enable progressive options — a not-far-enough/redirect lean), B (do cost-benefit analyses — process/caution), and C (specific to CPI property tax + sales-tax expansion — cautionary that those two overreach). I placed PPRT, LGDF, and cordon congestion pricing under 'Alternative/caution' (only A+B apply), and resume-cpi-property-tax + expand-sales-tax under 'Goes too far' (Dissent C is a substantive overreach concern). (2) graduated-income-tax and restructure-electricity-tax read as cautionary 'study business-climate impact first' so I placed them in Alternative/caution rather than too_far. (3) increase-garbage-fee and adjust-city-property-tax carry a progressive 'tax the wealthy instead' flavor but their dominant thrust is that the regressive measure overreaches/harms, so they sit in 'Goes too far.' (4) favor-natural-expiration-of-tifs: the dissent opposes prioritizing expiration and urges collaboration to fast-track infrastructure — I read this as opposing the recommendation's push (too far) rather than a pure alternative. These ~4-5 caution-vs-too-far boundary calls are inherently judgment calls; the underlying dissent_summaries are all faithful regardless of bucket.

The five CPL recs (16-20) share ONE dissent printed on p57 after rec 20; sources.json correctly attaches it to all five. The fees/taxes shared dissent on p60 is correctly distributed across recs 21-25 with the rec-specific Dissent C only on CPI and sales-tax. Page citations in the option records point to each option's recommendation page; the dissent text frequently sits on the following page (e.g., interim dissents on p16/p19/p26/p29/p30; ADC Dissent B on p33) — this is expected and consistent with the PDFs._

## 6. Curation signal — domain × lever-type coverage

Counts are options; **(c)** = how many in that domain are contested (carry a dissent).

| domain | revenue | cut | structural | one-time | total | contested |
|---|---|---|---|---|---|---|
| fees_fines | 40 | 0 | 1 | 0 | 41 | 4 |
| fleet | 0 | 6 | 0 | 1 | 7 | 1 |
| governance_process | 0 | 0 | 7 | 0 | 7 | 1 |
| library_culture | 0 | 1 | 5 | 0 | 6 | 5 |
| operations_efficiency | 0 | 13 | 8 | 0 | 21 | 0 |
| other | 0 | 0 | 9 | 0 | 9 | 0 |
| pensions | 0 | 0 | 11 | 0 | 11 | 6 |
| personnel_benefits | 0 | 28 | 2 | 0 | 30 | 6 |
| procurement | 0 | 2 | 4 | 0 | 6 | 0 |
| public_safety | 0 | 8 | 1 | 0 | 9 | 2 |
| real_estate_assets | 4 | 1 | 6 | 4 | 15 | 3 |
| revenue_tax | 20 | 0 | 1 | 0 | 21 | 10 |
| tif | 1 | 0 | 1 | 1 | 3 | 3 |
| transportation_mobility | 7 | 0 | 1 | 0 | 8 | 4 |
| **TOTAL** | 72 | 59 | 57 | 6 | 194 | 45 |

### Suggested selection pool (material + mostly-contested, spread across domains)

| domain | candidate id | tier | lever | contested |
|---|---|---|---|---|
| fees_fines | `increase-garbage-fee-cost-recovery` | mega | revenue | yes |
| fees_fines | `cfd-ems-treat-no-transport-tnt` | small | revenue | yes |
| fleet | `expand-opsa-cameras-cfd-cpd-vehicles` | one_time | cut | yes |
| governance_process | `shift-to-outcome-based-budgeting` | none | structural | yes |
| library_culture | `cfftf-re-consolidate-cpl-management-reporting` | none | structural | yes |
| library_culture | `cfftf-re-cpl-systemwide-strategic-plan` | none | structural | yes |
| operations_efficiency | `ey-org-optimize-spans-of-control` | large | cut | no |
| operations_efficiency | `ey-org-consolidate-overlapping-divisions` | large | cut | no |
| pensions | `cfftf-ltl-secure-cps-pension-contributions` | mega | structural | yes |
| pensions | `cfftf-ltl-advanced-supplemental-payment` | none | structural | yes |
| personnel_benefits | `continue-overtime-reduction` | large | cut | yes |
| personnel_benefits | `explore-employee-contribution-opportunities` | large | cut | yes |
| procurement | `ey-procurement-category-management` | mega | cut | no |
| public_safety | `disband-cpd-mounted-unit` | medium | cut | yes |
| public_safety | `increase-autonomous-drones-cpd` | small | cut | yes |
| real_estate_assets | `rent-opsa-regional-training-facility` | one_time | revenue | yes |
| real_estate_assets | `optimize-real-estate-portfolio` | one_time | one-time | yes |
| revenue_tax | `cfftf-re-increase-lgdf-share-rate` | mega | revenue | yes |
| revenue_tax | `cfftf-re-expand-sales-tax-base-consumer-services` | mega | revenue | yes |
| tif | `favor-natural-expiration-of-tifs` | medium | revenue | yes |
| tif | `declare-maximum-tif-surplus` | one_time | one-time | yes |
| transportation_mobility | `expand-congestion-surcharge-rideshare` | mega | revenue | yes |
| transportation_mobility | `establish-autonomous-taxi-framework` | large | revenue | yes |
