#!/usr/bin/env python3
"""Render docs/research/artemis-manifest.yaml into generated companions:

  docs/research/artemis-manifest.md    readable manifest
  docs/research/artemis-manifest.json  same data as JSON for the TypeScript apps (no YAML dependency)

The YAML is the source of truth; never edit the generated files by hand.
Usage: python3 tools/render_manifest.py [--check]
  --check  exit 1 if the generated files are out of date (for CI) instead of writing them
"""
import json
import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "docs/research/artemis-manifest.yaml"
OUT = ROOT / "docs/research/artemis-manifest.md"
OUT_JSON = ROOT / "docs/research/artemis-manifest.json"

PHASE_TITLES = {
    "precursor": "Precursors (2026–2027)",
    "moon_base_phase_1": "Moon Base Phase 1 — gain access, experiment, learn (now–2029)",
    "moon_base_phase_2": "Moon Base Phase 2 — build and expand (2029–2032)",
    "moon_base_phase_3": "Moon Base Phase 3 — live and work on the Moon (2032+)",
}
BADGE = {"confirmed": "✅ confirmed", "likely": "🟡 likely", "speculative": "🔮 speculative"}


def link(sources, key):
    s = sources.get(key, {})
    return f"[{s.get('publisher', key)}]({s.get('url', '#')})"


def render_md(d):
    src = d["sources"]
    ms = d["missions"]
    L = []
    L.append("# NASA lunar mission manifest, now through 2030\n")
    L.append(f"_Generated from `artemis-manifest.yaml` (v{d['manifest_version']}, as of {d['as_of']}). "
             "Do not edit by hand: run `python3 tools/render_manifest.py`._\n")
    L.append(f"**Career goal:** {d['career_goal'].strip()}\n")
    L.append("**Confidence key:** ✅ confirmed = announced with hardware, contract or crew in work · "
             "🟡 likely = announced but date/details soft · 🔮 speculative = our projection from NASA's stated cadence.\n")

    L.append("## Timeline at a glance\n")
    L.append("| Window | Mission | Type | Status | Confidence |")
    L.append("|---|---|---|---|---|")
    for m in sorted(ms, key=lambda m: (m["window"]["start"], m["window"]["end"], m["id"])):
        w = m["window"]
        span = w["start"] if w["start"] == w["end"] else f"{w['start']} → {w['end']}"
        L.append(f"| {span} | **{m['name']}** (`{m['id']}`) | {m['category']} | {m['status']} | {BADGE[m['confidence']]} |")
    L.append("")

    L.append("## World state (program-level facts)\n")
    for c in d.get("program_context", []):
        refs = ", ".join(link(src, k) for k in c["sources"])
        L.append(f"- **{c['key']}** ({BADGE[c['confidence']]}): {c['fact'].strip()} _Sources: {refs}_")
    L.append("")

    sites = {x["id"]: x for x in d.get("sites", [])}

    def site_str(sid):
        x = sites[sid]
        return f"{x['name']} ({x['lat']}, {x['lon']}; {x['precision']})"

    for phase, title in PHASE_TITLES.items():
        group = [m for m in ms if m["phase"] == phase]
        if not group:
            continue
        L.append(f"## {title}\n")
        for m in sorted(group, key=lambda m: m["window"]["start"]):
            L.append(f"### {m['name']}  \n`{m['id']}` · {m['category']} · {m['status']} · {BADGE[m['confidence']]}\n")
            L.append(f"- **Target:** {m['target']}")
            L.append(f"- **Provider:** {m['provider']}")
            for f, label in (("launch_vehicle", "Launch vehicle"), ("spacecraft", "Spacecraft"),
                             ("destination", "Destination")):
                if m.get(f):
                    L.append(f"- **{label}:** {m[f]}")
            if m.get("site"):
                L.append(f"- **Site:** {site_str(m['site'])}")
            if m.get("candidate_sites"):
                L.append("- **Candidate sites:** " + "; ".join(site_str(x) for x in m["candidate_sites"]))
            if m.get("crew"):
                L.append(f"- **Crew:** {', '.join(m['crew'])}")
            if m.get("payloads"):
                L.append(f"- **Payloads:** {'; '.join(m['payloads'])}")
            if m.get("objectives"):
                L.append("- **Objectives:**")
                L += [f"  - {o}" for o in m["objectives"]]
            if m.get("flight_plan"):
                L.append("- **Flight plan:**")
                L += [f"  - {o}" for o in m["flight_plan"]]
            if m.get("base_contribution"):
                L.append(f"- **Toward the base:** {m['base_contribution']}")
            if m.get("game_hooks"):
                L.append("- **Contract hooks:**")
                L += [f"  - {h}" for h in m["game_hooks"]]
            if m.get("dependencies"):
                L.append(f"- **Depends on:** {', '.join('`'+x+'`' for x in m['dependencies'])}")
            if m.get("notes"):
                L.append(f"- **Notes:** {m['notes']}")
            L.append(f"- **Sources:** {', '.join(link(src, k) for k in m['sources'])}")
            L.append("")

    if sites:
        L.append("## Landing sites\n")
        L.append("Selenographic degrees, longitude east-positive. Precision: high = published aim point or "
                 "feature centre; medium = centre of NASA's LROC region mosaic; low = estimated. "
                 "Use a landing radius of a few km for medium/low points.\n")
        L.append("| Site | Lat | Lon | Precision | Role | Basis |")
        L.append("|---|---|---|---|---|---|")
        for x in sites.values():
            L.append(f"| **{x['name']}** (`{x['id']}`) | {x['lat']} | {x['lon']} | {x['precision']} | {x['role']} | {x['basis']} |")
        L.append("")

    t = d.get("clps_template")
    if t:
        L.append("## Repeatable CLPS-style delivery contract\n")
        L.append(t["description"].strip() + "\n")
        for p in t["parameters"]:
            if isinstance(p, dict):
                p = "; ".join(f"`{k}`: {v}" for k, v in p.items())
            L.append(f"- {p}")
        L.append("")

    L.append("## Sources\n")
    for k, s in src.items():
        L.append(f"- `{k}`: [{s['title']}]({s['url']}) ({s['publisher']}, {s['date']})")
    return "\n".join(L) + "\n"


def render_json(d):
    return json.dumps(d, indent=2, ensure_ascii=False, default=str) + "\n"


def main():
    d = yaml.safe_load(SRC.read_text())
    outputs = {OUT: render_md(d), OUT_JSON: render_json(d)}
    check = "--check" in sys.argv[1:]
    stale = []
    for path, text in outputs.items():
        current = path.read_text() if path.exists() else None
        if current == text:
            continue
        if check:
            stale.append(path.relative_to(ROOT))
        else:
            path.write_text(text)
            print(f"wrote {path.relative_to(ROOT)}")
    if stale:
        print("Out of date (run python3 tools/render_manifest.py):", ", ".join(map(str, stale)))
        return 1
    if check:
        print("Generated manifest files are up to date")
    return 0


if __name__ == "__main__":
    sys.exit(main())
