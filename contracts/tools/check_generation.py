#!/usr/bin/env python3
"""Read a test run made with contracts/Testing/MKSP_TestHarness.

Usage: check_generation.py <quicksave.sfs or persistent.sfs> [KSP.log] [--json out.json]

Save: for every MKSP_ contract type, was its unrestricted test copy (MKSPT_*)
generated (in CC's pre-loader pool or offered), and what did it generate
(parameter tree, waypoints, behaviours, rewards)? Also lists any real MKSP_
contract that was offered under its real requirements.

Log: CC trace lines for the real MKSP_ types (why each was or was not
generated) and any exception or error that mentions MKSP.
"""
import json, os, re, sys
from collections import Counter, defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from validate_contracts import parse  # noqa: E402

PACK = os.path.join(HERE, "..", "GameData", "myKSP_Artemis")


def expected_types():
    out = set()
    for dp, _, fs in os.walk(PACK):
        for f in fs:
            if f.endswith(".cfg"):
                for n in parse(os.path.join(dp, f)).nodes:
                    if n.name == "CONTRACT_TYPE":
                        out.add(n.get("name"))
    return out


def walk(node):
    yield node
    for c in node.nodes:
        yield from walk(c)


def param_tree(node, depth=0):
    lines = []
    for p in node.nodes:
        if p.name == "PARAM":
            lines.append("  " * depth + f"{p.get('name') or p.get('ID') or '?'} [{p.get('state', '?')}]"
                         + (f" '{p.get('title')}'" if p.get("title") else ""))
            lines += param_tree(p, depth + 1)
    return lines


VALUE_KEYS = ("expiry", "deadline", "advance", "completion", "failure",
              "science", "rep_completion", "rep_failure")


def rewards(c):
    # Stock Contract.OnSave writes rewards as one "values =" line, in this order
    # (after difficulty and prestige multipliers), not as separate keys.
    vals = [v.strip() for v in (c.get("values") or "").split(",")]
    out = {}
    for k, v in zip(VALUE_KEYS, vals):
        try:
            out[k] = float(v)
        except ValueError:
            out[k] = v
    return {k: out.get(k) for k in ("advance", "completion", "failure", "rep_completion", "rep_failure")}


def contracts_in(root):
    found = []
    for scen in root.nodes:
        if scen.name != "GAME":
            continue
        for s in scen.nodes:
            if s.name != "SCENARIO":
                continue
            where = s.get("name")
            for n in walk(s):
                if n.name == "CONTRACT" and (n.get("subtype") or "").startswith(("MKSP_", "MKSPT_")):
                    found.append((where, n))
    return found


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    save = parse(args[0])
    log = open(args[1], encoding="utf-8", errors="replace").read().splitlines() if len(args) > 1 else []
    exp = expected_types()
    report = {"types": {}, "real_offered": [], "log": {}}

    gen = defaultdict(list)
    for where, c in contracts_in(save):
        st = c.get("subtype")
        if st.startswith("MKSPT_"):
            gen["MKSP_" + st[len("MKSPT_"):]].append((where, c))
        else:
            report["real_offered"].append({"type": st, "state": c.get("state"), "where": where})

    ok = 0
    for t in sorted(exp):
        items = gen.get(t, [])
        entry = {"generated": bool(items)}
        if items:
            ok += 1
            where, c = items[0]
            wps = [n for n in walk(c) if n.name == "WAYPOINT"]
            entry.update(
                where=where, state=c.get("state"), title=c.get("title"),
                funds=rewards(c),
                params=param_tree(c),
                behaviours=[b.get("name") or b.get("type") for b in c.nodes if b.name == "BEHAVIOUR"],
                waypoints=[{"name": w.get("name"), "lat": w.get("latitude"), "lon": w.get("longitude"),
                            "body": w.get("celestialName")} for w in wps],
            )
        report["types"][t] = entry

    trace = defaultdict(Counter)
    problems = []
    for line in log:
        m = re.search(r"(MKSPT?_\w+) was not generated: ([^.]+)", line)
        if m:
            trace[m.group(1)][m.group(2)] += 1
        if "MKSP" in line and re.search(r"\[(ERR|EXC)\]|Exception", line):
            problems.append(line.strip())
    report["log"] = {"not_generated": {k: dict(v) for k, v in trace.items()}, "problems": problems[:200]}

    print(f"Generated test copies: {ok}/{len(exp)}")
    for t, e in report["types"].items():
        if not e["generated"]:
            why = trace.get("MKSPT_" + t[len("MKSP_"):])
            print(f"  NOT GENERATED {t}" + (f"  (log: {dict(why)})" if why else ""))
    for t, e in report["types"].items():
        if e["generated"]:
            print(f"\n{t}: {e['title']}  [{e['where']}]")
            print(f"  funds {e['funds']}; behaviours {e['behaviours']}")
            for w in e["waypoints"]:
                print(f"  waypoint {w['name']} @ {w['lat']}, {w['lon']} on {w['body']}")
            for p in e["params"]:
                print("   ", p)
    print("\nReal contracts offered under real requirements:", report["real_offered"] or "none")
    real = {k: v for k, v in report["log"]["not_generated"].items() if k.startswith("MKSP_")}
    print("Real contracts not generated (reason: count):")
    for k in sorted(real):
        print(f"  {k}: {real[k]}")
    print(f"\nMKSP errors/exceptions in log: {len(problems)}")
    for p in problems[:40]:
        print("  ", p)
    if "--json" in sys.argv:
        json.dump(report, open(sys.argv[sys.argv.index("--json") + 1], "w"), indent=2)
    sys.exit(0 if ok == len(exp) and not problems else 1)


if __name__ == "__main__":
    main()
