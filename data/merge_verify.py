# /// script
# dependencies = []
# ///
"""
merge_verify.py — idempotent LEFT-JOIN of the verification sidecar onto sources.

Composes ./data/verify.json (enrichment, keyed by option id) onto ./data/sources.json
into ./data/sources.enriched.json. NEVER mutates the originals — sources.json and
data/raw/ are read-only here. Re-running with the same inputs yields byte-identical
output (idempotent).

Usage:  uv run data/merge_verify.py
        uv run data/merge_verify.py --check   # verify originals are unchanged & join is clean; non-zero exit on problem

Join semantics (LEFT join, sources is the left/driving table):
  - Every option in sources.json is preserved exactly as-is under its original keys.
  - Its verify.json entry (verify["options"][id]) is attached as option["verify"].
    Options with no verify entry get "verify": null. Originals are never overwritten.
  - Top-level verify sections (overlap_groups, gap_reconcile, dissent_taxonomy,
    figure_summary, meta) are attached to the enriched doc under "verify".
  - structural_gap and any other top-level sources keys pass through untouched.
"""
import json, sys, hashlib, os

ROOT = os.path.dirname(os.path.abspath(__file__))
SOURCES = os.path.join(ROOT, "sources.json")
VERIFY = os.path.join(ROOT, "verify.json")
OUT = os.path.join(ROOT, "sources.enriched.json")


def load(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def sha(path):
    with open(path, "rb") as f:
        return hashlib.sha256(f.read()).hexdigest()


def build(sources, verify):
    vopts = (verify or {}).get("options", {}) or {}
    out = dict(sources)  # shallow copy of top-level
    enriched_options = []
    seen = set()
    for o in sources["options"]:
        oid = o["id"]
        seen.add(oid)
        merged = dict(o)              # preserve every original field verbatim
        merged["verify"] = vopts.get(oid)  # None if no enrichment for this id
        enriched_options.append(merged)
    out["options"] = enriched_options

    # Top-level verify sections (everything in verify.json except the per-option map)
    verify_top = {k: v for k, v in (verify or {}).items() if k != "options"}
    # Report verify ids that do not correspond to any source option (right-only rows dropped by LEFT join)
    orphans = sorted(set(vopts) - seen)
    if orphans:
        verify_top.setdefault("_orphan_ids", orphans)
    out["verify"] = verify_top
    return out, orphans


def main():
    check = "--check" in sys.argv[1:]

    if not os.path.exists(SOURCES):
        print(f"FATAL: missing {SOURCES}", file=sys.stderr)
        return 2
    sources = load(SOURCES)
    src_hash_before = sha(SOURCES)

    if os.path.exists(VERIFY):
        verify = load(VERIFY)
    else:
        verify = {"options": {}}
        print(f"note: {VERIFY} not present yet — emitting passthrough enriched file.", file=sys.stderr)

    out, orphans = build(sources, verify)

    # Serialize deterministically (sorted keys, stable spacing) for idempotency.
    text = json.dumps(out, ensure_ascii=False, indent=2, sort_keys=True) + "\n"

    if check:
        problems = []
        if sha(SOURCES) != src_hash_before:
            problems.append("sources.json changed during run (must be read-only)")
        if orphans:
            problems.append(f"verify.json has {len(orphans)} id(s) with no matching source option: {orphans[:5]}{'...' if len(orphans) > 5 else ''}")
        if os.path.exists(OUT):
            with open(OUT, encoding="utf-8") as f:
                if f.read() != text:
                    problems.append("sources.enriched.json is stale — re-run without --check")
        else:
            problems.append("sources.enriched.json not yet generated")
        if problems:
            for p in problems:
                print("CHECK FAIL:", p, file=sys.stderr)
            return 1
        print("CHECK OK: originals untouched, join clean, enriched file current.")
        return 0

    with open(OUT, "w", encoding="utf-8") as f:
        f.write(text)

    # Safety: confirm we did not mutate the source on disk.
    assert sha(SOURCES) == src_hash_before, "sources.json was modified — aborting"

    n_enriched = sum(1 for o in out["options"] if o.get("verify") is not None)
    print(f"wrote {OUT}")
    print(f"  options: {len(out['options'])}  enriched: {n_enriched}  un-enriched: {len(out['options']) - n_enriched}")
    if orphans:
        print(f"  WARNING: {len(orphans)} verify id(s) had no matching source option (dropped by LEFT join): {orphans}")
    top = [k for k in out['verify'] if not k.startswith('_')]
    print(f"  verify top-level sections: {top}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
