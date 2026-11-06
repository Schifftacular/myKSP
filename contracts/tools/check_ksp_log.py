#!/usr/bin/env python3
"""After a KSP launch, confirm every myKSP contract loaded.

Usage: check_ksp_log.py <KSP.log> [pack_dir]
Lists each MKSP_ CONTRACT_TYPE as loaded / errored / missing, prints the CC
error lines for any failures, and reports whether the RP2000
spaceStationRotationRepeat fix took effect.
"""
import os, re, sys

log = open(sys.argv[1], encoding="utf-8", errors="replace").read().splitlines()
pack = sys.argv[2] if len(sys.argv) > 2 else os.path.join(os.path.dirname(__file__), "..", "GameData", "myKSP_Artemis")
expected = set()
for dp, _, fs in os.walk(pack):
    for f in fs:
        if f.endswith(".cfg"):
            expected |= set(re.findall(r"^CONTRACT_TYPE\s*\{\s*name = (\S+)", open(os.path.join(dp, f)).read(), re.M))

ok, bad, errs = set(), set(), []
for line in log:
    m = re.search(r"Successfully loaded CONTRACT_TYPE '([^']+)'", line)
    if m:
        ok.add(m.group(1))
    m = re.search(r"Errors encountered while trying to load CONTRACT_TYPE '([^']+)'", line)
    if m:
        bad.add(m.group(1))
    if "ContractConfigurator" in line and ("MKSP_" in line or "MKSP" in line) and ("[ERR" in line or "[WRN" in line or "[EXC" in line):
        errs.append(line)

missing = expected - ok - bad
print(f"myKSP contracts: {len(expected & ok)}/{len(expected)} loaded, {len(expected & bad)} with errors, {len(missing)} not seen")
for n in sorted(expected & bad):
    print("  ERROR  ", n)
for n in sorted(missing):
    print("  MISSING", n)
for e in errs[:80]:
    print("  ", e)
station = "spaceStationRotationRepeat"
print("RP2000 station rotation fix:", "loaded" if station in ok else ("still failing" if station in bad else "not seen"))
sys.exit(0 if expected <= ok and not errs else 1)
