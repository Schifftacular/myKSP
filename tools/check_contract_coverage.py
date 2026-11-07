#!/usr/bin/env python3
"""Cross-check the research manifest against the contracts thread's contract map.

Reports:
  * manifest missions with no contract mapped (gaps the contracts thread should fill),
    except ids listed under `no_contract_by_design` (a list, or a map of id -> reason)
  * contract-map ids that are not in the manifest (typos or removed ids)
  * contract-map reviewed an older manifest version (contracts need re-tuning)

Usage: python3 tools/check_contract_coverage.py [manifest.yaml] [contract-map.yaml]
Exit code 1 only for unknown ids (a hard error). Gaps and staleness are warnings.
If the contract map does not exist yet, prints a note and exits 0.
"""
import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
MANIFEST = ROOT / "docs/research/artemis-manifest.yaml"
CONTRACT_MAP = ROOT / "contracts/manifest/contract-map.yaml"


def check(manifest_path, map_path):
    manifest = yaml.safe_load(Path(manifest_path).read_text())
    cmap = yaml.safe_load(Path(map_path).read_text()) or {}
    mission_ids = {m["id"] for m in manifest["missions"]}
    context_keys = {c["key"] for c in manifest.get("program_context", [])}
    mapped = cmap.get("missions") or {}
    by_design = cmap.get("no_contract_by_design") or {}
    by_design = set(by_design if isinstance(by_design, (list, dict)) else [])

    errors, warnings = [], []
    for mid in sorted(set(mapped) - mission_ids):
        errors.append(f"contract map lists unknown mission id '{mid}'")
    for mid in sorted(by_design - mission_ids):
        errors.append(f"no_contract_by_design lists unknown mission id '{mid}'")
    for mid in sorted(by_design & {k for k, v in mapped.items() if v}):
        warnings.append(f"{mid} is both mapped and listed as no_contract_by_design")
    for key in sorted(set(cmap.get("program_context") or {}) - context_keys):
        errors.append(f"contract map lists unknown program_context key '{key}'")
    for m in manifest["missions"]:
        if m["status"] == "cancelled":
            continue
        if not mapped.get(m["id"]) and m["id"] not in by_design:
            warnings.append(f"no contract mapped for {m['id']} ({m['confidence']})")
    reviewed = cmap.get("manifest_version_reviewed")
    if reviewed is not None and reviewed < manifest["manifest_version"]:
        warnings.append(f"contract map reviewed manifest v{reviewed}; current is v{manifest['manifest_version']}")
    return errors, warnings, len(mission_ids)


def main():
    manifest_path = Path(sys.argv[1]) if len(sys.argv) > 1 else MANIFEST
    map_path = Path(sys.argv[2]) if len(sys.argv) > 2 else CONTRACT_MAP
    if not map_path.exists():
        print(f"No contract map at {map_path}; skipping coverage check.")
        return 0
    errors, warnings, n = check(manifest_path, map_path)
    for w in warnings:
        print("warning:", w)
    for e in errors:
        print("error:", e)
    if errors:
        return 1
    print(f"Coverage OK: {n} manifest missions checked, {len(warnings)} warning(s)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
