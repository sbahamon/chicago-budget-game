#!/usr/bin/env python3
"""Merge the three raw report extractions into data/sources.json.

Strategy (locked with the user):
- One row per named recommendation.
- Collapse ONLY clean 1:1 duplicates (the same discrete lever named in >1 report)
  into a single entry; record the other source(s) in `also_reported_in`.
- Bundle-vs-split topical overlaps (Special Events components, Employee Benefits
  granular levers, Real Estate) are kept as distinct rows and flagged in
  EXTRACTION_NOTES so figures are never double-summed.
- structural_gap captures ALL gap figures cited by all three reports (they disagree).
"""
import json, os

RAW = os.path.join(os.path.dirname(__file__), "raw")

def load(fn):
    return json.load(open(os.path.join(RAW, fn)))

final = load("cfftf-final.json")
interim = load("cfftf-interim.json")
ey = load("ey-reform-options.json")

by_id = {}
order = []  # preserve a stable order: final, interim, ey
for src in (final, interim, ey):
    for o in src["options"]:
        by_id[o["id"]] = o
        order.append(o["id"])

def src_ref(o):
    return {"source_body": o["source_body"], "report": o["report"], "page": o["page"]}

def fig_str(de):
    if de is None:
        return None
    if isinstance(de, dict):
        return f"${de['low']:,.0f}-${de['high']:,.0f}"
    return f"${de:,.0f}"

# Each cluster: primary id + list of secondary ids (same lever, other report(s)).
# dollar_from: adopt this id's dollar_estimate/unit when the primary is qualitative (null).
CLUSTERS = [
    # --- Fleet: Interim <-> EY, identical annual figures (EY primary: richer naming) ---
    {"p": "ey-fleet-repair-maintenance-optimization", "s": ["optimize-mru"]},
    {"p": "ey-fleet-accelerate-disposition", "s": ["accelerate-disposition-process"]},
    {"p": "ey-fleet-utilization-metrics", "s": ["establish-fleet-utilization-metrics"]},
    {"p": "ey-fleet-lifecycle-replacement-strategy", "s": ["improve-lifecycle-modelling-replacement"]},
    {"p": "ey-fleet-expanded-warranty-recovery", "s": ["expand-warranty-recovery"]},
    {"p": "ey-fleet-acquisition-standard-specifications", "s": ["improve-fleet-procurement-process"]},
    # --- Procurement category management: identical $55-111M ---
    {"p": "ey-procurement-category-management", "s": ["implement-category-management-system"]},
    # --- Public safety: Interim (annual $, several dissents) primary; EY svcopt = same
    #     levers sized on a 10-YEAR CUMULATIVE basis -> kept on the entry as a note ---
    {"p": "disband-cpd-mounted-unit", "s": ["ey-svcopt-cpd-disband-mounted-unit"]},
    {"p": "maximize-cpd-civilianization", "s": ["ey-svcopt-cpd-civilianization"], "dollar_from": "ey-svcopt-cpd-civilianization"},
    {"p": "implement-cpd-early-warning-system", "s": ["ey-svcopt-cpd-early-warning-system"]},
    {"p": "cfd-false-fire-alarm-cost-recovery", "s": ["ey-svcopt-cfd-false-fire-alarm-fee"]},
    {"p": "cpd-false-burglar-alarm-cost-recovery", "s": ["ey-svcopt-cpd-false-burglar-alarm-fee"]},
    {"p": "divert-cfd-911-to-telehealth", "s": ["ey-svcopt-cfd-911-telehealth-diversion"]},
    {"p": "cfd-pyrotechnics-sprinkler-cost-recovery", "s": ["ey-svcopt-cfd-pyrotechnics-sprinkler-fees"]},
    {"p": "increase-cpd-first-dui-fee", "s": ["ey-svcopt-cpd-first-dui-fee"]},
    {"p": "cfd-ems-treat-no-transport-tnt", "s": ["ey-svcopt-cfd-tnt-ems-cost-recovery"]},
    {"p": "increase-autonomous-drones-cpd", "s": ["ey-svcopt-cpd-autonomous-drones"]},
    {"p": "cfd-non-emergency-lift-assist-cost-recovery", "s": ["ey-svcopt-cfd-lift-assist-fee"]},
    {"p": "cpd-squad-car-film-production-cost-recovery", "s": ["ey-svcopt-cpd-film-squad-car-fee"]},
    {"p": "introduce-cfd-light-duty-positions", "s": ["ey-svcopt-cfd-light-duty-positions"]},
    {"p": "expand-opsa-cameras-cfd-cpd-vehicles", "s": ["ey-svcopt-opsa-fleet-cameras"]},
    {"p": "rent-opsa-regional-training-facility", "s": ["ey-svcopt-opsa-training-facility-rental"]},
    {"p": "cfd-cost-recovery-fire-alarm-hazmat-highrise", "s": ["ey-svcopt-cfd-inspection-hazmat-highrise-fees"]},
    # --- Special events: discrete non-city parade cost recovery, $11.9M in both ---
    {"p": "reclaim-costs-non-city-parades", "s": ["ey-special-events-parade-cost-recovery"]},
    # --- Employee benefits: only the LOA continuation is a clean 1:1 ---
    {"p": "assess-loa-health-coverage-continuation", "s": ["ey-benefits-loa-coverage-continuation"]},
    # --- Org: streamline hiring / position management, $25M in both ---
    {"p": "streamline-hiring", "s": ["ey-org-streamline-position-management"]},
    # --- Outcome/performance-based budgeting: Interim (has dissent) primary ---
    {"p": "shift-to-outcome-based-budgeting", "s": ["ey-performance-based-budgeting"]},
    # --- Final <-> Interim revenue overlaps: Final policy framing + dissent primary,
    #     adopt the Interim's stated dollar range ---
    {"p": "cfftf-re-expand-sales-tax-base-consumer-services", "s": ["expand-sales-tax-on-services"], "dollar_from": "expand-sales-tax-on-services"},
    {"p": "cfftf-re-increase-lgdf-share-rate", "s": ["increase-share-lgdf"], "dollar_from": "increase-share-lgdf"},
    # --- CPS pension contributions: Final ($175M + dissent) primary; Interim
    #     clarify/document MEABF payments is the related counterpart ---
    {"p": "cfftf-ltl-secure-cps-pension-contributions", "s": ["clarify-document-cps-meabf-pension-payments"]},
]

merged_away = set()
for c in CLUSTERS:
    p = by_id[c["p"]]
    p.setdefault("also_reported_in", [])
    notes = []
    for sid in c["s"]:
        sec = by_id[sid]
        p["also_reported_in"].append(src_ref(sec))
        merged_away.add(sid)
        # adopt dollar figure if requested
        if c.get("dollar_from") == sid:
            p["dollar_estimate"] = sec["dollar_estimate"]
            p["unit"] = sec["unit"]
        # OR-combine dissent: if primary has none but secondary does, carry it over
        if not p["has_dissent"] and sec["has_dissent"]:
            p["has_dissent"] = True
            p["dissent_summary"] = f"[from {sec['source_body']} {sec['report'].split('—')[0].strip()}] {sec['dissent_summary']}"
        # cross-reference note, preserving the secondary's own stated figure/basis
        sfig = fig_str(sec["dollar_estimate"])
        ref = sec["report"].split("—")[0].strip()
        if sfig and sfig != fig_str(p["dollar_estimate"]):
            notes.append(f"Also analyzed in {ref} (p.{sec['page']}), sized there at {sfig} [{sec['name']}].")
        else:
            notes.append(f"Also analyzed in {ref} (p.{sec['page']}).")
    if notes:
        p["feasibility_note"] = (p["feasibility_note"].rstrip(". ") + ". " + " ".join(notes)).strip()

# Assemble final option list in stable order, skipping merged-away secondaries
options = []
seen = set()
for oid in order:
    if oid in merged_away or oid in seen:
        continue
    seen.add(oid)
    o = by_id[oid]
    o.setdefault("also_reported_in", [])
    options.append(o)

# structural_gap = every gap figure cited by any report (they disagree on purpose)
structural_gap = []
for src in (final, interim, ey):
    for g in src.get("gap_figures", []):
        structural_gap.append(g)

out = {
    "structural_gap": structural_gap,
    "options": options,
}
dest = os.path.join(os.path.dirname(__file__), "sources.json")
json.dump(out, open(dest, "w"), indent=2, ensure_ascii=False)

# --- report ---
print(f"raw total: {len(order)}  merged-away: {len(merged_away)}  final options: {len(options)}")
print(f"  source split: CFFTF={sum(1 for o in options if o['source_body']=='CFFTF')}  EY={sum(1 for o in options if o['source_body']=='EY')}")
print(f"  with dissent: {sum(1 for o in options if o['has_dissent'])}")
print(f"  with also_reported_in: {sum(1 for o in options if o['also_reported_in'])}")
print(f"  gap figures: {len(structural_gap)}")
print(f"wrote {dest}")
