# mod-inventory

Read-only inventory of a KSP 1.x install. It never writes to the install.

```sh
python3 tools/mod-inventory/inventory.py /Applications/KSP-RP2000 \
  --out docs/mods/data/mod-inventory.json --md docs/mods/inventory.md
```

Standard library only, so the stock macOS `python3` is enough.

It reads `buildID*.txt`, `CKAN/registry.json`, every `GameData/**/*.version` (parsed leniently, since many are not strict JSON), the GameData folder list, and `KSP.log` (the "Mod DLLs found" block KSP writes, the ModuleManager patch count, and a summary of exceptions). It flags folders CKAN does not manage, unparseable version files, and version files whose KSP maximum is below the installed game (a missing component counts as a wildcard, so `1.12` covers `1.12.5`).

Run it after any CKAN change or manual install and commit the diff of `docs/mods/data/mod-inventory.json`. The `KSP.log` parts reflect the most recent game launch, so launch the game once after changing mods.
