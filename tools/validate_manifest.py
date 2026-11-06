#!/usr/bin/env python3
"""Validate docs/research/artemis-manifest.yaml.

Checks that every mission has the required fields, uses allowed enum values,
has a sane window, references only known sources and mission ids, and that
ids are unique. Exit code 0 = valid, 1 = problems found.

Usage: python3 tools/validate_manifest.py [path]
"""
import re
import sys
from pathlib import Path

import yaml

DEFAULT = Path(__file__).resolve().parent.parent / "docs/research/artemis-manifest.yaml"

REQUIRED = ["id", "name", "category", "phase", "agency", "provider", "status",
            "confidence", "target", "window", "sources"]
CATEGORY = {"crewed", "robotic"}
PHASE = {"precursor", "moon_base_phase_1", "moon_base_phase_2", "moon_base_phase_3"}
STATUS = {"flown", "scheduled", "planned", "proposed", "delayed", "cancelled", "failed"}
CONFIDENCE = {"confirmed", "likely", "speculative"}
QUARTER = re.compile(r"^(20\d\d)-Q([1-4])$")


def quarter_key(value):
    m = QUARTER.match(str(value))
    return (int(m.group(1)), int(m.group(2))) if m else None


def validate(path):
    data = yaml.safe_load(Path(path).read_text())
    errors = []
    sources = data.get("sources") or {}
    missions = data.get("missions") or []
    ids = [m.get("id") for m in missions]

    for key in ("manifest_version", "as_of", "missions", "sources"):
        if key not in data:
            errors.append(f"top level: missing '{key}'")

    seen = set()
    for m in missions:
        mid = m.get("id", "<no id>")
        if mid in seen:
            errors.append(f"{mid}: duplicate id")
        seen.add(mid)
        for f in REQUIRED:
            if f not in m or m[f] in (None, "", []):
                errors.append(f"{mid}: missing '{f}'")
        for field, allowed in (("category", CATEGORY), ("phase", PHASE),
                               ("status", STATUS), ("confidence", CONFIDENCE)):
            if field in m and m[field] not in allowed:
                errors.append(f"{mid}: {field}='{m[field]}' not in {sorted(allowed)}")
        w = m.get("window") or {}
        s, e = quarter_key(w.get("start")), quarter_key(w.get("end"))
        if not s or not e:
            errors.append(f"{mid}: window start/end must look like 2027-Q3")
        elif s > e:
            errors.append(f"{mid}: window start after end")
        for src in m.get("sources") or []:
            if src not in sources:
                errors.append(f"{mid}: unknown source '{src}'")
        for dep in m.get("dependencies") or []:
            if dep not in ids:
                errors.append(f"{mid}: unknown dependency '{dep}'")
        if m.get("confidence") == "speculative" and not m.get("notes"):
            errors.append(f"{mid}: speculative entries must explain themselves in 'notes'")

    for c in data.get("program_context") or []:
        for src in c.get("sources") or []:
            if src not in sources:
                errors.append(f"context {c.get('key')}: unknown source '{src}'")

    for key, s in sources.items():
        if not str(s.get("url", "")).startswith("https://"):
            errors.append(f"source {key}: url must be https")

    return data, errors


def main():
    path = sys.argv[1] if len(sys.argv) > 1 else DEFAULT
    data, errors = validate(path)
    if errors:
        print(f"{len(errors)} problem(s) in {path}:")
        for e in errors:
            print("  -", e)
        return 1
    ms = data["missions"]
    print(f"OK: manifest v{data['manifest_version']} as of {data['as_of']}: "
          f"{len(ms)} missions, {len(data['sources'])} sources")
    return 0


if __name__ == "__main__":
    sys.exit(main())
