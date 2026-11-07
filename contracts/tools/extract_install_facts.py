#!/usr/bin/env python3
"""Snapshot the facts validate_contracts.py needs from a KSP install.

Usage: extract_install_facts.py <KSP root> <out.json>

Reads GameData/ModuleManager.ConfigCache (so ModuleManager patches are already
applied), the RSS Kopernicus body configs for biome names, the stock waypoint
icons, and every CONTRACT_TYPE name outside myKSP's own pack.
"""
import json, os, re, sys

ksp, out = sys.argv[1], sys.argv[2]
gd = os.path.join(ksp, "GameData")
cache = open(os.path.join(gd, "ModuleManager.ConfigCache"), encoding="latin-1").read()

facts = {"source": os.path.abspath(ksp)}
facts["experiments"] = sorted(set(re.findall(r"EXPERIMENT_DEFINITION\s*\{\s*id = (\S+)", cache)))
facts["resources"] = sorted(set(re.findall(r"RESOURCE_DEFINITION\s*\{\s*name = (\S+)", cache)))
facts["part_modules"] = sorted(set(re.findall(r"\n\s*MODULE\s*\{\s*name = (\S+)", cache)))
facts["waypoint_icons"] = sorted(os.path.splitext(f)[0] for f in os.listdir(os.path.join(gd, "Squad", "Contracts", "Icons")))

biomes = {}
kop = os.path.join(gd, "RealSolarSystem", "RSSKopernicus")
for dp, _, fs in os.walk(kop):
    for f in fs:
        if not f.endswith(".cfg"):
            continue
        t = open(os.path.join(dp, f), encoding="utf-8", errors="replace").read()
        body = re.search(r"\n\s*name = (\w+)", t)
        names = re.findall(r"Biome\s*\{\s*name = ([^\n]+)", t, re.I)
        if body and names:
            biomes.setdefault(body.group(1).strip(), [])
            biomes[body.group(1).strip()] += [n.strip() for n in names]
facts["biomes"] = biomes

ct = set()
for dp, _, fs in os.walk(gd):
    if "myKSP" in dp:
        continue
    for f in fs:
        if f.endswith(".cfg"):
            t = open(os.path.join(dp, f), encoding="utf-8", errors="replace").read()
            for m in re.finditer(r"^\s*CONTRACT_TYPE\s*\{\s*name = (\S+)", t, re.M):
                ct.add(m.group(1))
facts["rp2000_contracts"] = sorted(ct)
json.dump(facts, open(out, "w"), indent=1)
print({k: len(v) for k, v in facts.items() if isinstance(v, (list, dict))})
