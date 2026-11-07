#!/usr/bin/env python3
"""Build contracts/manifest/contract-meta.json for the Ops Center program board.

Joins every MKSP_ CONTRACT_TYPE (name, title, group, repeat count) with
contract-map.yaml and the research manifest, so a career parser can show
active/offered Artemis contracts grouped by NASA program phase.

Usage: build_contract_meta.py [manifest.yaml] [--check]
  manifest defaults to docs/research/artemis-manifest.yaml.
  --check exits 1 if the committed JSON is stale (no write).
"""
import json, os, sys
import yaml

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, "..", ".."))
sys.path.insert(0, HERE)
from validate_contracts import parse  # noqa: E402

PACK = os.path.join(ROOT, "contracts", "GameData", "myKSP_Artemis")
MAP = os.path.join(ROOT, "contracts", "manifest", "contract-map.yaml")
OUT = os.path.join(ROOT, "contracts", "manifest", "contract-meta.json")
PHASE_ORDER = ["heritage", "precursor", "moon_base_phase_1", "moon_base_phase_2", "moon_base_phase_3"]
PHASE_LABEL = {
    "heritage": "Heritage (pre-2026)",
    "precursor": "Artemis precursors",
    "moon_base_phase_1": "Moon Base Phase 1: access and experiment (now-2029)",
    "moon_base_phase_2": "Moon Base Phase 2: build and expand (2029-2032)",
    "moon_base_phase_3": "Moon Base Phase 3: live and work (2032+)",
}
# program_context keys have no phase in the manifest; place them by intent.
CONTEXT_PHASE = {"moon_base_program": "moon_base_phase_3", "landing_cadence": "moon_base_phase_2",
                 "clps_cadence": "moon_base_phase_1"}


def contracts():
    out = {}
    for dp, _, fs in os.walk(PACK):
        for f in sorted(fs):
            if not f.endswith(".cfg"):
                continue
            for n in parse(os.path.join(dp, f)).nodes:
                if n.name == "CONTRACT_TYPE" and (n.get("name") or "").startswith("MKSP_"):
                    out[n.get("name")] = {
                        "title": n.get("title"),
                        "group": n.get("group"),
                        "maxCompletions": int(n.get("maxCompletions", 0) or 0),
                        "file": os.path.relpath(os.path.join(dp, f), ROOT),
                    }
    return out


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    manifest = yaml.safe_load(open(args[0] if args else os.path.join(ROOT, "docs", "research", "artemis-manifest.yaml")))
    missions = {m["id"]: m for m in manifest["missions"]}
    cmap = yaml.safe_load(open(MAP))
    meta = contracts()
    for c in meta.values():
        c.update(missions=[], phase=None, window=None, confidence=None)

    def attach(cname, mid, phase, window=None, conf=None, name=None, weak=False):
        # weak: program-context links only set a phase when no mission did.
        c = meta[cname]
        c["missions"].append({"id": mid, "name": name or mid})
        if c["phase"] is None or (not weak and PHASE_ORDER.index(phase) < PHASE_ORDER.index(c["phase"])):
            c["phase"] = phase
        if window:
            w = c["window"] or {"start": window["start"], "end": window["end"]}
            w["start"], w["end"] = min(w["start"], window["start"]), max(w["end"], window["end"])
            c["window"] = w
        if conf:
            rank = ["speculative", "likely", "confirmed"]
            c["confidence"] = conf if c["confidence"] is None else rank[min(rank.index(conf), rank.index(c["confidence"]))]

    for mid, names in (cmap.get("missions") or {}).items():
        m = missions[mid]
        for n in names:
            attach(n, mid, m["phase"], m.get("window"), m.get("confidence"), m.get("name"))
    for mid, names in (cmap.get("heritage") or {}).items():
        for n in names:
            attach(n, mid, "heritage")
    for key, names in (cmap.get("program_context") or {}).items():
        for n in names or []:
            attach(n, key, CONTEXT_PHASE[key], weak=True)

    unplaced = [n for n, c in meta.items() if c["phase"] is None]
    if unplaced:
        sys.exit(f"contracts with no manifest entry: {unplaced}")
    doc = {
        "generated_by": "contracts/tools/build_contract_meta.py",
        "manifest_version": manifest["manifest_version"],
        "manifest_as_of": manifest["as_of"],
        "phases": [{"id": p, "label": PHASE_LABEL[p]} for p in PHASE_ORDER],
        "contracts": dict(sorted(meta.items(), key=lambda kv: (PHASE_ORDER.index(kv[1]["phase"]),
                                                             (kv[1]["window"] or {}).get("start", ""), kv[0]))),
    }
    text = json.dumps(doc, indent=2, ensure_ascii=False) + "\n"
    if "--check" in sys.argv:
        cur = open(OUT).read() if os.path.exists(OUT) else ""
        sys.exit(0 if cur == text else "contract-meta.json is stale: rerun build_contract_meta.py")
    open(OUT, "w").write(text)
    print(f"wrote {os.path.relpath(OUT, ROOT)}: {len(meta)} contracts")


if __name__ == "__main__":
    main()
