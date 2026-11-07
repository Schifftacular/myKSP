#!/usr/bin/env python3
"""Build an attribute schema for Contract Configurator from its C# source.

Usage: extract_cc_schema.py <ContractConfigurator source checkout> <out.json>

The schema lists every PARAMETER / REQUIREMENT / BEHAVIOUR type the plugin
registers (class name minus Factory/Requirement suffix, as CC itself does)
and the attribute names each one parses, including inherited ones. It is
used by validate_contracts.py so contract packs can be linted without
launching KSP. Generated from KSP-RO/ContractConfigurator tag v2.13.4.0,
the version installed in Mike's KSP-RP2000.
"""
import json, os, re, sys

src, out = sys.argv[1], sys.argv[2]
root = os.path.join(src, "source", "ContractConfigurator")
CLASS = re.compile(r"class\s+(\w+)\s*(?:<[^>]*>)?\s*:\s*([\w.]+)")
ATTR = re.compile(r'ParseValue<[^(]*?>\(\s*(?:configNode|node|dataNode|childNode|child)\s*,\s*"(\w+)"'
                  r'|v\.name\s*[!=]=\s*"(\w+)"'
                  r'|configNode\.(?:HasValue|GetValue|GetValues)\(\s*"(\w+)"')

classes = {}
for dp, _, fs in os.walk(root):
    for f in fs:
        if not f.endswith(".cs"):
            continue
        text = open(os.path.join(dp, f), encoding="utf-8-sig", errors="replace").read()
        for m in CLASS.finditer(text):
            name, base = m.group(1), m.group(2).split(".")[-1]
            # attributes belong to the class body that follows; approximate by
            # taking text up to the next class declaration
            nxt = CLASS.search(text, m.end())
            body = text[m.end(): nxt.start() if nxt else len(text)]
            classes.setdefault(name, {"base": base, "attrs": set()})
            classes[name]["attrs"].update(a for t in ATTR.findall(body) for a in t if a)

def all_attrs(n, seen=()):
    c = classes.get(n)
    if not c or n in seen:
        return set()
    return c["attrs"] | all_attrs(c["base"], seen + (n,))

def descends(n, root_cls):
    while n in classes:
        if classes[n]["base"] == root_cls:
            return True
        n = classes[n]["base"]
    return False

schema = {"source": "KSP-RO/ContractConfigurator v2.13.4.0", "PARAMETER": {}, "REQUIREMENT": {}, "BEHAVIOUR": {}}
for n in classes:
    if n.endswith("Factory") and descends(n, "ParameterFactory") and not n.startswith("Invalid"):
        schema["PARAMETER"][n[:-7]] = sorted(all_attrs(n))
    elif n.endswith("Factory") and descends(n, "BehaviourFactory") and not n.startswith("Invalid"):
        schema["BEHAVIOUR"][n[:-7]] = sorted(all_attrs(n))
    elif n.endswith("Requirement") and descends(n, "ContractRequirement") and not n.startswith("Invalid"):
        schema["REQUIREMENT"][n[:-11]] = sorted(all_attrs(n))

ct = open(os.path.join(root, "ContractType.cs"), encoding="utf-8-sig").read()
cg = open(os.path.join(root, "ContractGroup.cs"), encoding="utf-8-sig").read()
schema["CONTRACT_TYPE"] = sorted(set(re.findall(r'ParseValue<[^(]*?>\(\s*configNode\s*,\s*"(\w+)"', ct)))
schema["CONTRACT_GROUP"] = sorted(set(re.findall(r'ParseValue<[^(]*?>\(\s*configNode\s*,\s*"(\w+)"', cg)))
json.dump(schema, open(out, "w"), indent=1, sort_keys=True)
print({k: len(v) for k, v in schema.items() if isinstance(v, (dict, list))})
