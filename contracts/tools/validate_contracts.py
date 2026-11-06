#!/usr/bin/env python3
"""Offline linter for the myKSP Contract Configurator pack.

Checks everything that can be checked without launching KSP:
  * ConfigNode syntax (braces, key = value)
  * every PARAMETER / REQUIREMENT / BEHAVIOUR type exists in CC 2.13.4 and
    every attribute is one that type actually parses (schema generated from
    CC source by extract_cc_schema.py)
  * CONTRACT_TYPE / CONTRACT_GROUP attributes and required fields
  * contract-group membership, unique names
  * CompleteContract prerequisites resolve (pack or RP2000), graph is acyclic
  * vessel references resolve to a `define` in the same contract
  * VisitWaypoint indices exist; waypoint coordinates and icons are valid
  * biome, experiment, resource and part-module names exist in Mike's install
  * duration strings parse

Usage: validate_contracts.py [pack_dir] [--tree]
Exit code 0 = clean, 1 = errors.
"""
import json, math, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SCHEMA = json.load(open(os.path.join(HERE, "cc_schema_2.13.4.json")))
INSTALL = json.load(open(os.path.join(HERE, "install_facts.json")))

CONTAINER_PARAMS = {"VesselParameterGroup", "Any", "All", "None", "Not", "Sequence", "AtLeast", "AtMost"}
CONTAINER_REQS = {"Any", "All", "None", "Not", "AtLeast", "AtMost"}
WAYPOINT_NODES = {"WAYPOINT", "RANDOM_WAYPOINT", "RANDOM_WAYPOINT_NEAR", "PQS_CITY", "LAUNCH_SITE"}
WAYPOINT_ATTRS = {"name", "names", "icon", "targetBody", "altitude", "parameter", "hidden", "underwater",
                  "clustered", "latitude", "longitude", "waterAllowed", "forceEquatorial", "count",
                  "nearIndex", "chained", "minDistance", "maxDistance", "pqsCity", "pqsOffset", "launchSite"}
# VesselParameters are state-based in CC (disableOnStateChange defaults to
# false) and revert when their condition stops holding. completeInSequence
# needs every earlier sibling Complete at that moment, so an earlier
# location/orbit/resource check must be latched or the sequence can deadlock.
REVERTING = {"ReachState", "VisitWaypoint", "Orbit", "HasResource", "ReachSpecificOrbit"}
REQUIRED_CT = ["name", "group", "title", "description", "synopsis", "completedMessage"]
DURATION = re.compile(r"^\s*(\d+[ydhms],?\s*)+$")  # CC DurationUtil: integers only


class Node:
    def __init__(self, name, line):
        self.name, self.line, self.values, self.nodes = name, line, [], []

    def get(self, k, default=None):
        for kk, v, _ in self.values:
            if kk == k:
                return v
        return default

    def all(self, k):
        return [v for kk, v, _ in self.values if kk == k]


def parse(path):
    root = Node("root", 0)
    stack, pending = [root], None
    for i, raw in enumerate(open(path, encoding="utf-8"), 1):
        line = raw.split("//", 1)[0].strip()
        if not line:
            continue
        while line:
            if line.startswith("{"):
                if pending is None:
                    raise SyntaxError(f"{path}:{i}: '{{' without a node name")
                stack[-1].nodes.append(pending)
                stack.append(pending)
                pending = None
                line = line[1:].strip()
            elif line.startswith("}"):
                if len(stack) == 1:
                    raise SyntaxError(f"{path}:{i}: unmatched '}}'")
                stack.pop()
                line = line[1:].strip()
            elif "=" in line.split("{")[0].split("}")[0]:
                seg = re.split(r"[{}]", line, maxsplit=1)[0]
                k, v = seg.split("=", 1)
                stack[-1].values.append((k.strip(), v.strip(), i))
                line = line[len(seg):].strip()
            else:
                seg = re.split(r"[{}]", line, maxsplit=1)[0].strip()
                if pending is not None:
                    raise SyntaxError(f"{path}:{i}: node '{pending.name}' has no '{{'")
                pending = Node(seg, i)
                line = line[len(re.split(r"[{}]", line, maxsplit=1)[0]):].strip()
    if len(stack) != 1 or pending is not None:
        raise SyntaxError(f"{path}: unbalanced braces at end of file")
    return root


class Linter:
    def __init__(self):
        self.errors, self.warnings = [], []
        self.contracts, self.groups = {}, set()

    def err(self, where, msg):
        self.errors.append(f"{where}: {msg}")

    def warn(self, where, msg):
        self.warnings.append(f"{where}: {msg}")

    def check_attrs(self, where, node, allowed, kind):
        seen = set()
        for k, v, line in node.values:
            if k not in allowed:
                self.err(f"{where}:{line}", f"{kind} has unknown attribute '{k}' (CC would ignore it)")
            if k in seen and k not in ("disabledContractType", "partModule", "part", "experiment", "vessel"):
                self.err(f"{where}:{line}", f"duplicate attribute '{k}'")
            seen.add(k)

    def lint_group(self, path, node, depth=0):
        self.check_attrs(path, node, set(SCHEMA["CONTRACT_GROUP"]), "CONTRACT_GROUP")
        self.groups.add(node.get("name"))
        for c in node.nodes:
            if c.name == "CONTRACT_GROUP":
                self.lint_group(path, c, depth + 1)

    def lint_contract(self, path, ct):
        name = ct.get("name")
        where = f"{os.path.basename(path)}[{name}]"
        self.check_attrs(where, ct, set(SCHEMA["CONTRACT_TYPE"]), "CONTRACT_TYPE")
        for r in REQUIRED_CT:
            if not ct.get(r):
                self.err(where, f"missing '{r}'")
        if name in self.contracts:
            self.err(where, "duplicate CONTRACT_TYPE name")
        info = {"path": path, "node": ct, "group": ct.get("group"), "prereqs": [], "defines": set(),
                "waypoints": 0, "body": ct.get("targetBody")}
        self.contracts[name] = info
        for n in ct.nodes:
            if n.name == "BEHAVIOUR" and n.get("type") == "WaypointGenerator":
                for w in n.nodes:
                    if w.name in WAYPOINT_NODES:
                        info["waypoints"] += int(w.get("count", 1))
        self.collect_defines(ct, info["defines"])
        for n in ct.nodes:
            if n.name == "PARAMETER":
                self.lint_param(where, n, info, top=True)
            elif n.name == "REQUIREMENT":
                self.lint_req(where, n, info)
            elif n.name == "BEHAVIOUR":
                self.lint_behaviour(where, n, info)
            else:
                self.err(where, f"unexpected child node '{n.name}'")
        self.lint_sequence(where, [n for n in ct.nodes if n.name == "PARAMETER"])
        if not any(n.name == "PARAMETER" for n in ct.nodes):
            self.err(where, "contract has no PARAMETER")

    def collect_defines(self, node, out):
        for n in node.nodes:
            if n.name == "PARAMETER":
                if n.get("define"):
                    out.add(n.get("define"))
                self.collect_defines(n, out)

    def lint_param(self, where, p, info, top=False, body=None):
        t = p.get("type")
        pw = f"{where}/{p.get('name')}"
        if not p.get("name"):
            self.err(where, f"PARAMETER (line {p.line}) has no name")
        if t not in SCHEMA["PARAMETER"]:
            self.err(pw, f"unknown PARAMETER type '{t}'")
            return
        self.check_attrs(pw, p, set(SCHEMA["PARAMETER"][t]), f"PARAMETER {t}")
        body = p.get("targetBody", body or info["body"])
        for n in p.nodes:
            if n.name != "PARAMETER":
                self.err(pw, f"unexpected child node '{n.name}'")
            elif t not in CONTAINER_PARAMS:
                self.err(pw, f"PARAMETER type '{t}' cannot contain child parameters")
            else:
                self.lint_param(where, n, info, body=body)
        self.lint_sequence(pw, p.nodes)
        names = [n.get("name") for n in p.nodes]
        if len(names) != len(set(names)):
            self.err(pw, "child parameters share a name")
        for v in p.all("vessel"):
            if v not in info["defines"]:
                self.err(pw, f"vessel '{v}' is not defined by any VesselParameterGroup in this contract")
        if p.get("duration") and not DURATION.match(p.get("duration")):
            self.err(pw, f"bad duration '{p.get('duration')}'")
        biome = p.get("biome")
        if biome:
            known = INSTALL["biomes"].get(body or "", [])
            if biome not in known:
                self.err(pw, f"biome '{biome}' not found on {body} (known: {', '.join(known)})")
        for e in p.all("experiment"):
            if e not in INSTALL["experiments"]:
                self.err(pw, f"unknown experiment '{e}'")
        if t in ("HasResource",) and p.get("resource") not in INSTALL["resources"]:
            self.err(pw, f"unknown resource '{p.get('resource')}'")
        for m in p.all("partModule"):
            if m not in INSTALL["part_modules"]:
                self.err(pw, f"part module '{m}' not present on any part in the install")
        if t == "VisitWaypoint":
            idx = int(p.get("index", 0))
            if idx >= info["waypoints"]:
                self.err(pw, f"waypoint index {idx} but contract only generates {info['waypoints']}")
        if t == "VesselParameterGroup" and p.get("vessel") and p.get("define"):
            self.err(pw, "VesselParameterGroup has both vessel and define")

    def lint_sequence(self, where, siblings):
        for i, n in enumerate(siblings):
            if n.get("completeInSequence", "false").lower() != "true":
                continue
            for prev in siblings[:i]:
                pn = f"{where}/{n.get('name')}"
                if prev.get("optional", "false").lower() == "true":
                    self.err(pn, f"completeInSequence after optional sibling '{prev.get('name')}' (CC waits for it)")
                if prev.get("type") in REVERTING and prev.get("disableOnStateChange", "false").lower() != "true":
                    self.err(pn, f"completeInSequence after state-based '{prev.get('name')}' ({prev.get('type')}) "
                                 f"that is not latched with disableOnStateChange = true")

    def lint_req(self, where, r, info):
        t = r.get("type")
        rw = f"{where}/REQ {r.get('name')}"
        if t not in SCHEMA["REQUIREMENT"]:
            self.err(rw, f"unknown REQUIREMENT type '{t}'")
            return
        self.check_attrs(rw, r, set(SCHEMA["REQUIREMENT"][t]), f"REQUIREMENT {t}")
        if not r.get("title"):
            self.err(rw, "REQUIREMENT without title (CC needs one for Expression; we require it everywhere)")
        if t == "CompleteContract":
            info["prereqs"].append(r.get("contractType"))
        for n in r.nodes:
            if n.name != "REQUIREMENT" or t not in CONTAINER_REQS:
                self.err(rw, f"unexpected child node '{n.name}'")
            else:
                self.lint_req(where, n, info)

    def lint_behaviour(self, where, b, info):
        t = b.get("type")
        bw = f"{where}/BEHAVIOUR {b.get('name')}"
        if t not in SCHEMA["BEHAVIOUR"]:
            self.err(bw, f"unknown BEHAVIOUR type '{t}'")
            return
        self.check_attrs(bw, b, set(SCHEMA["BEHAVIOUR"][t]), f"BEHAVIOUR {t}")
        if t == "WaypointGenerator":
            for w in b.nodes:
                ww = f"{bw}/{w.name} {w.get('name')}"
                if w.name not in WAYPOINT_NODES:
                    self.err(ww, "unknown waypoint node")
                    continue
                self.check_attrs(ww, w, WAYPOINT_ATTRS, w.name)
                if w.get("hidden", "false").lower() != "true" and not w.get("icon"):
                    self.err(ww, "visible waypoint needs an icon")
                if w.get("icon") and w.get("icon") not in INSTALL["waypoint_icons"]:
                    self.err(ww, f"icon '{w.get('icon')}' not in Squad/Contracts/Icons")
                if w.name == "WAYPOINT":
                    lat, lon = float(w.get("latitude", "nan")), float(w.get("longitude", "nan"))
                    if not (-90 <= lat <= 90 and -180 <= lon <= 180):
                        self.err(ww, f"bad coordinates {lat}, {lon}")

    def lint_graph(self):
        known_external = set(INSTALL["rp2000_contracts"])
        for name, info in self.contracts.items():
            if info["group"] not in self.groups:
                self.err(name, f"group '{info['group']}' is not defined")
            for p in info["prereqs"]:
                if p not in self.contracts and p not in known_external:
                    self.err(name, f"prerequisite '{p}' does not exist")
        # cycle check
        state = {}

        def visit(n, path):
            if state.get(n) == 1:
                self.err(n, "prerequisite cycle: " + " -> ".join(path + [n]))
                return
            if state.get(n) == 2 or n not in self.contracts:
                return
            state[n] = 1
            for p in self.contracts[n]["prereqs"]:
                visit(p, path + [n])
            state[n] = 2
        for n in self.contracts:
            visit(n, [])

    def depth(self, n, memo={}):
        if n not in self.contracts:
            return 0
        if n not in memo:
            memo[n] = 1 + max([self.depth(p) for p in self.contracts[n]["prereqs"]] or [0])
        return memo[n]


def haversine_km(a, b, r=1737.4):
    la1, lo1, la2, lo2 = map(math.radians, (a[0], a[1], b[0], b[1]))
    h = math.sin((la2 - la1) / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin((lo2 - lo1) / 2) ** 2
    return 2 * r * math.asin(math.sqrt(h))


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    pack = args[0] if args else os.path.join(HERE, "..", "GameData", "myKSP_Artemis")
    lint = Linter()
    files = sorted(os.path.join(dp, f) for dp, _, fs in os.walk(pack) for f in fs if f.endswith(".cfg"))
    roots = []
    for f in files:
        try:
            root = parse(f)
        except SyntaxError as e:
            lint.errors.append(str(e))
            continue
        roots.append((f, root))
        for n in root.nodes:
            if n.name == "CONTRACT_GROUP":
                lint.lint_group(f, n)
    for f, root in roots:
        for n in root.nodes:
            if n.name == "CONTRACT_TYPE":
                lint.lint_contract(f, n)
            elif n.name.startswith("@") or n.name == "CONTRACT_GROUP":
                pass
            else:
                lint.err(f, f"unexpected top-level node '{n.name}'")
    lint.lint_graph()

    if "--tree" in sys.argv:
        for name in sorted(lint.contracts, key=lambda n: (lint.depth(n), n)):
            i = lint.contracts[name]
            print(f"{'  ' * (lint.depth(name) - 1)}{name}  <- {', '.join(i['prereqs'])}")
        print()
    for w in lint.warnings:
        print("WARN ", w)
    for e in lint.errors:
        print("ERROR", e)
    print(f"{len(files)} files, {len(lint.contracts)} contracts, {len(lint.groups)} groups, "
          f"{len(lint.errors)} errors, {len(lint.warnings)} warnings")
    return 1 if lint.errors else 0


if __name__ == "__main__":
    sys.exit(main())
