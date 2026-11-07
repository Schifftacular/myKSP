#!/usr/bin/env python3
"""Read-only inventory of a KSP 1.x install's mod stack.

Usage:
    python3 inventory.py /Applications/KSP-RP2000 --out inventory.json [--md inventory.md]

Sources (all read-only, nothing in the install is modified):
  * buildID.txt / buildID64.txt      -> KSP build
  * CKAN/registry.json               -> CKAN-managed modules, versions, licenses, deps, owned files
  * GameData/**/*.version            -> KSP-AVC version files (parsed leniently)
  * GameData/ top-level folders      -> what is actually on disk
  * KSP.log "Mod DLLs found" block   -> assemblies that actually loaded last session
  * KSP.log                          -> ModuleManager patch count, exception summary

Standard library only so it runs on a stock macOS python3.
"""
from __future__ import annotations

import argparse
import collections
import datetime as dt
import json
import os
import re
import sys
from pathlib import Path


def lenient_json(text: str):
    """KSP-AVC files are often not strict JSON (comments, trailing commas, unquoted keys)."""
    text = text.lstrip("\ufeff")
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    text = re.sub(r"(?<![:\"])//[^\n]*", "", text)  # line comments, but not URLs
    text = re.sub(r"/\*.*?\*/", "", text, flags=re.S)
    text = re.sub(r",\s*([}\]])", r"\1", text)
    text = re.sub(r'([{,]\s*)([A-Za-z_][A-Za-z0-9_]*)\s*:', r'\1"\2":', text)
    # Some files carry trailing garbage after the object; take the first object.
    obj, _ = json.JSONDecoder().raw_decode(text.strip())
    return obj


def fmt_ver(v):
    if v is None:
        return None
    if isinstance(v, dict):
        parts = [str(v[k]) for k in ("MAJOR", "MINOR", "PATCH", "BUILD") if k in v]
        return ".".join(parts) if parts else None
    return str(v)


def read_build(root: Path):
    for name in ("buildID64.txt", "buildID.txt"):
        p = root / name
        if p.exists():
            m = re.search(r"build id\s*=\s*(\d+)", p.read_text(errors="replace"))
            if m:
                return {"file": name, "build_id": m.group(1)}
    return None


def read_log_header(log: Path):
    out = {}
    if not log.exists():
        return out
    with log.open("r", errors="replace") as f:
        head = [next(f, "") for _ in range(12)]
    m = re.search(r"Kerbal Space Program - ([\d.]+) \((\w+)\)", "".join(head))
    if m:
        out["ksp_version"], out["player"] = m.group(1), m.group(2)
    for line in head:
        for key in ("OS", "CPU", "RAM", "GPU", "SM"):
            if line.startswith(key + ":"):
                out[key.lower()] = line.split(":", 1)[1].strip()
    return out


def read_log_dlls(log: Path):
    """Parse the 'Mod DLLs found:' block KSP writes after assembly loading."""
    dlls, in_block = [], False
    exc = collections.Counter()
    mm = None
    if not log.exists():
        return dlls, exc, mm
    with log.open("r", errors="replace") as f:
        for line in f:
            if line.startswith("Mod DLLs found:"):
                # KSP writes the first block; ModuleManager later writes a tabular one. Keep KSP's.
                in_block = not dlls
                continue
            if in_block:
                s = line.strip()
                if not s or s.startswith("Folders and files"):
                    in_block = False
                    continue
                name, _, ver = s.partition(" v")
                dlls.append({"assembly": name.replace("Stock assembly: ", ""), "versions": ("v" + ver) if ver else ""})
                continue
            if line.startswith("[EXC"):
                exc[line.split("]", 1)[-1].strip()[:140]] += 1
            m = re.search(r"ModuleManager: (\d+) patches applied(?:, found .*?(\d+) (warnings|errors))?", line)
            if m:
                mm = {"patches_applied": int(m.group(1)), "line": re.sub(r"<[^>]+>", "", line.strip())[:200]}
    return dlls, exc, mm


def read_ckan(root: Path):
    reg = root / "CKAN" / "registry.json"
    if not reg.exists():
        return {}, {}
    data = json.loads(reg.read_text(errors="replace"))
    mods, owner = {}, {}
    for ident, inst in data.get("installed_modules", {}).items():
        m = inst.get("source_module", {})
        lic = m.get("license")
        deps = [d.get("name") or "|".join(x.get("name", "") for x in d.get("any_of", [])) for d in m.get("depends", []) or []]
        files = list((inst.get("installed_files") or {}).keys())
        folders = sorted({f.split("/")[1] for f in files if f.startswith("GameData/") and len(f.split("/")) > 2})
        for fo in folders:
            owner.setdefault(fo, []).append(ident)
        mods[ident] = {
            "name": m.get("name"),
            "version": m.get("version"),
            "ksp_version": m.get("ksp_version"),
            "ksp_version_min": m.get("ksp_version_min"),
            "ksp_version_max": m.get("ksp_version_max"),
            "license": lic if isinstance(lic, str) else ", ".join(lic or []),
            "abstract": m.get("abstract"),
            "depends": [d for d in deps if d],
            "resources": {k: v for k, v in (m.get("resources") or {}).items() if k in ("homepage", "repository", "spacedock", "curse", "bugtracker")},
            "auto_installed": inst.get("auto_installed", False),
            "gamedata_folders": folders,
        }
    return mods, owner


def read_versions(gd: Path):
    out = []
    for p in sorted(gd.rglob("*.version")):
        rel = p.relative_to(gd).as_posix()
        try:
            j = lenient_json(p.read_text(errors="replace"))
            out.append({
                "file": rel,
                "folder": rel.split("/")[0],
                "name": re.sub(r"<[^>]+>", "", str(j.get("NAME", ""))),
                "version": fmt_ver(j.get("VERSION")),
                "ksp_version": fmt_ver(j.get("KSP_VERSION")),
                "ksp_min": fmt_ver(j.get("KSP_VERSION_MIN")),
                "ksp_max": fmt_ver(j.get("KSP_VERSION_MAX")),
                "url": j.get("URL"),
            })
        except Exception as e:  # noqa: BLE001
            out.append({"file": rel, "folder": rel.split("/")[0], "error": str(e)[:120]})
    return out


def vtuple(s):
    return tuple(int(x) for x in re.findall(r"\d+", s or "")[:3]) or None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("root", type=Path)
    ap.add_argument("--out", type=Path, required=True)
    ap.add_argument("--md", type=Path)
    a = ap.parse_args()
    root, gd = a.root, a.root / "GameData"
    if not gd.is_dir():
        sys.exit(f"no GameData under {root}")

    log = root / "KSP.log"
    folders = sorted(p.name for p in gd.iterdir() if not p.name.startswith("."))
    ckan, owner = read_ckan(root)
    versions = read_versions(gd)
    dlls, exc, mm = read_log_dlls(log)
    header = read_log_header(log)
    ksp = vtuple(header.get("ksp_version")) or (1, 12, 5)

    flags = []
    for f in folders:
        if (gd / f).is_dir() and f not in owner and f != "Squad":
            flags.append({"kind": "not-ckan-managed", "folder": f})
    for v in versions:
        mx = vtuple(v.get("ksp_max"))
        # AVC treats a missing component as a wildcard: max "1.12" covers 1.12.5.
        if mx and mx < ksp[: len(mx)]:
            flags.append({"kind": "avc-max-below-installed-ksp", "folder": v["folder"], "file": v["file"], "ksp_max": v["ksp_max"]})
        if "error" in v:
            flags.append({"kind": "unparseable-version-file", "file": v["file"]})

    disabled = root / "_disabled-mods"
    result = {
        "generated_at": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"),
        "install_root": str(root),
        "build": read_build(root),
        "log_header": header,
        "gamedata_folders": folders,
        "disabled_mods": sorted(os.listdir(disabled)) if disabled.is_dir() else [],
        "ckan_modules": ckan,
        "ckan_folder_owners": owner,
        "version_files": versions,
        "loaded_assemblies": dlls,
        "modulemanager": mm,
        "exceptions": [{"count": c, "message": m} for m, c in exc.most_common(30)],
        "flags": flags,
    }
    a.out.write_text(json.dumps(result, indent=2, sort_keys=False))

    if a.md:
        L = [f"# Mod inventory — {root}", "", f"Generated {result['generated_at']} by `tools/mod-inventory/inventory.py` (read-only).", ""]
        h = header
        L += [f"- KSP **{h.get('ksp_version', '?')}** ({h.get('player', '?')}), build {result['build'] and result['build']['build_id']}",
              f"- {h.get('os', '?')} · {h.get('cpu', '?')} · RAM {h.get('ram', '?')} MB · GPU {h.get('gpu', '?')}",
              f"- {len(folders)} GameData entries · {len(ckan)} CKAN modules · {len(dlls)} assemblies loaded last session",
              f"- ModuleManager: {mm['line'] if mm else 'n/a'}", ""]
        L += ["## CKAN-managed modules", "", "| Identifier | Version | KSP range | License | Folders |", "|---|---|---|---|---|"]
        for k in sorted(ckan, key=str.lower):
            m = ckan[k]
            rng = m["ksp_version"] or f"{m['ksp_version_min'] or '…'} – {m['ksp_version_max'] or '…'}"
            L.append(f"| {k} | {m['version']} | {rng} | {m['license']} | {', '.join(m['gamedata_folders'])} |")
        L += ["", "## Folders not managed by CKAN", ""]
        L += [f"- {x['folder']}" for x in flags if x["kind"] == "not-ckan-managed"]
        L += ["", "## Loaded assemblies (last KSP.log)", "", "| Assembly | Version(s) |", "|---|---|"]
        L += [f"| {d['assembly']} | {d['versions']} |" for d in dlls]
        L += ["", "## Flags", ""]
        L += [f"- `{x['kind']}` {x.get('folder') or ''} {x.get('file') or ''} {('max ' + x['ksp_max']) if x.get('ksp_max') else ''}".rstrip() for x in flags if x["kind"] != "not-ckan-managed"]
        L += ["", "## Exceptions in last KSP.log", ""]
        L += [f"- {e['count']}× {e['message']}" for e in result["exceptions"]] or ["- none"]
        a.md.write_text("\n".join(L) + "\n")
    print(f"ok: {len(folders)} folders, {len(ckan)} ckan, {len(versions)} version files, {len(dlls)} dlls, {len(flags)} flags")


if __name__ == "__main__":
    main()
