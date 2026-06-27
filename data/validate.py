#!/usr/bin/env python3
"""Schema/integrity check for data/sources.json. Exit non-zero on any violation."""
import json, os, sys

p = os.path.join(os.path.dirname(__file__), "sources.json")
d = json.load(open(p))

REQUIRED = {
    "id", "name", "source_body", "report", "page", "lever_type", "timing",
    "dollar_estimate", "unit", "who_is_affected", "feasibility_note",
    "has_dissent", "dissent_summary", "verbatim_anchor", "also_reported_in",
}
LEVER = {"revenue", "cut", "structural", "one-time"}
TIMING = {"one-time", "recurring"}
SRC = {"CFFTF", "EY"}

errors = []
opts = d.get("options", [])
ids = set()

def is_dollar(v):
    if v is None or isinstance(v, (int, float)):
        return True
    return isinstance(v, dict) and set(v) == {"low", "high"} and all(isinstance(v[k], (int, float)) for k in v)

for o in opts:
    oid = o.get("id", "<no-id>")
    missing = REQUIRED - set(o)
    extra = set(o) - REQUIRED
    if missing: errors.append(f"{oid}: missing fields {missing}")
    if extra: errors.append(f"{oid}: unexpected fields {extra}")
    if oid in ids: errors.append(f"{oid}: duplicate id")
    ids.add(oid)
    if o.get("source_body") not in SRC: errors.append(f"{oid}: bad source_body {o.get('source_body')!r}")
    if o.get("lever_type") not in LEVER: errors.append(f"{oid}: bad lever_type {o.get('lever_type')!r}")
    if o.get("timing") not in TIMING: errors.append(f"{oid}: bad timing {o.get('timing')!r}")
    if not isinstance(o.get("page"), int): errors.append(f"{oid}: page not int")
    if not is_dollar(o.get("dollar_estimate")): errors.append(f"{oid}: bad dollar_estimate {o.get('dollar_estimate')!r}")
    # dissent flag/text consistency
    if o.get("has_dissent") and not o.get("dissent_summary"):
        errors.append(f"{oid}: has_dissent true but dissent_summary empty")
    if not o.get("has_dissent") and o.get("dissent_summary"):
        errors.append(f"{oid}: has_dissent false but dissent_summary present")
    # also_reported_in well-formed
    ari = o.get("also_reported_in")
    if not isinstance(ari, list):
        errors.append(f"{oid}: also_reported_in not a list")
    else:
        for r in ari:
            if set(r) != {"source_body", "report", "page"} or r["source_body"] not in SRC or not isinstance(r["page"], int):
                errors.append(f"{oid}: malformed also_reported_in entry {r}")
    if len(o.get("verbatim_anchor", "").split()) > 15:
        errors.append(f"{oid}: verbatim_anchor exceeds 15 words")

# structural_gap present and well-formed
sg = d.get("structural_gap")
if not isinstance(sg, list) or not sg:
    errors.append("structural_gap missing or empty")
else:
    for g in sg:
        if not {"amount", "source_body", "report", "page"} <= set(g):
            errors.append(f"structural_gap entry missing keys: {g}")

print(f"options: {len(opts)}  unique ids: {len(ids)}  structural_gap figures: {len(sg) if isinstance(sg, list) else 0}")
print(f"  CFFTF={sum(1 for o in opts if o.get('source_body')=='CFFTF')}  EY={sum(1 for o in opts if o.get('source_body')=='EY')}")
print(f"  with dissent: {sum(1 for o in opts if o.get('has_dissent'))}")
print(f"  with dollar_estimate: {sum(1 for o in opts if o.get('dollar_estimate') is not None)}")
if errors:
    print(f"\nFAILED — {len(errors)} issue(s):")
    for e in errors:
        print("  -", e)
    sys.exit(1)
print("\nPASS — all integrity checks green.")
