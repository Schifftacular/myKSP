#!/usr/bin/env python3
"""Tests for the research manifest tools. Run: python3 -m unittest tools/test_manifest_tools.py"""
import copy
import importlib.util
import sys
import tempfile
import unittest
from pathlib import Path

import yaml

TOOLS = Path(__file__).resolve().parent
ROOT = TOOLS.parent
MANIFEST = ROOT / "docs/research/artemis-manifest.yaml"


def load(name):
    spec = importlib.util.spec_from_file_location(name, TOOLS / f"{name}.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


validate_manifest = load("validate_manifest")
render_manifest = load("render_manifest")
check_contract_coverage = load("check_contract_coverage")


def write_yaml(tmp, name, data):
    p = Path(tmp) / name
    p.write_text(yaml.safe_dump(data, sort_keys=False, allow_unicode=True))
    return p


class ManifestTests(unittest.TestCase):
    def setUp(self):
        self.data = yaml.safe_load(MANIFEST.read_text())
        self.tmp = tempfile.TemporaryDirectory()

    def tearDown(self):
        self.tmp.cleanup()

    def errors_for(self, data):
        return validate_manifest.validate(write_yaml(self.tmp.name, "m.yaml", data))[1]

    def test_real_manifest_is_valid(self):
        _, errors = validate_manifest.validate(MANIFEST)
        self.assertEqual(errors, [])

    def test_generated_files_are_current(self):
        d = self.data
        self.assertEqual(render_manifest.OUT.read_text(), render_manifest.render_md(d))
        self.assertEqual(render_manifest.OUT_JSON.read_text(), render_manifest.render_json(d))

    def test_ids_unique_and_permanent_style(self):
        ids = [m["id"] for m in self.data["missions"]]
        self.assertEqual(len(ids), len(set(ids)))
        for i in ids:
            self.assertRegex(i, r"^[A-Z0-9-]+$")

    def test_rejects_unknown_source(self):
        d = copy.deepcopy(self.data)
        d["missions"][0]["sources"] = ["nope"]
        self.assertTrue(any("unknown source" in e for e in self.errors_for(d)))

    def test_rejects_bad_enum_and_window(self):
        d = copy.deepcopy(self.data)
        d["missions"][0]["confidence"] = "certain"
        d["missions"][1]["window"] = {"start": "2029-Q1", "end": "2027-Q1"}
        errs = self.errors_for(d)
        self.assertTrue(any("confidence" in e for e in errs))
        self.assertTrue(any("start after end" in e for e in errs))

    def test_rejects_duplicate_id_and_unknown_dependency(self):
        d = copy.deepcopy(self.data)
        d["missions"].append(copy.deepcopy(d["missions"][0]))
        d["missions"][2]["dependencies"] = ["NOT-A-MISSION"]
        errs = self.errors_for(d)
        self.assertTrue(any("duplicate id" in e for e in errs))
        self.assertTrue(any("unknown dependency" in e for e in errs))

    def test_speculative_needs_notes(self):
        d = copy.deepcopy(self.data)
        spec = next(m for m in d["missions"] if m["confidence"] == "speculative")
        spec.pop("notes", None)
        self.assertTrue(any("speculative" in e for e in self.errors_for(d)))

    def test_sites_checked(self):
        d = copy.deepcopy(self.data)
        d["sites"][0]["lat"] = -95
        d["missions"][0]["site"] = "NOWHERE"
        errs = self.errors_for(d)
        self.assertTrue(any("lat must be" in e for e in errs))
        self.assertTrue(any("unknown site 'NOWHERE'" in e for e in errs))

    def test_coverage_flags_unknown_ids_and_gaps(self):
        cmap = {"manifest_version_reviewed": 0,
                "missions": {"ARTEMIS-II": ["X"], "NOT-REAL": ["Y"]},
                "program_context": {"bogus": []}}
        mp = write_yaml(self.tmp.name, "cmap.yaml", cmap)
        errors, warnings, _ = check_contract_coverage.check(MANIFEST, mp)
        self.assertTrue(any("NOT-REAL" in e for e in errors))
        self.assertTrue(any("bogus" in e for e in errors))
        self.assertTrue(any("ARTEMIS-III" in w for w in warnings))
        self.assertTrue(any("reviewed manifest v0" in w for w in warnings))


if __name__ == "__main__":
    sys.exit(unittest.main())
