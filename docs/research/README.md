# Research: NASA lunar program tracking

This folder is maintained by the **Artemis research thread**. It keeps myKSP's view of the
real NASA lunar program current so the contracts thread can build contracts from it and the
environments thread can ground its spaces in real practice.

| File | What it is |
|---|---|
| [`artemis-manifest.yaml`](artemis-manifest.yaml) | **Source of truth.** Every crewed and robotic NASA lunar mission from now to 2030, with status, confidence, game window, contract hooks and sources. |
| [`artemis-manifest.md`](artemis-manifest.md) | Readable version, generated from the YAML. Do not hand-edit. |
| [`nasa-native-experience.md`](nasa-native-experience.md) | Ideas for making myKSP feel like running NASA's program, each tied to real practice. |
| [`changelog.md`](changelog.md) | What changed in the manifest and why. |

## For the contracts thread

- Key contracts on mission `id`. IDs never change or disappear; cancelled missions keep their
  entry with `status: cancelled`.
- Use `window` (year-quarter range) for in-game scheduling; `target` is the real-world wording.
- `confidence` tells you how hard to commit: build full contracts for `confirmed`, flexible
  ones for `likely`, and optional/branching ones for `speculative`.
- `game_hooks` are suggestions, not specs. `program_context` is world state (no Gateway,
  SLS Block 1 only, two lander providers, south pole target).

## Upkeep process

1. Check, in this order: NASA Artemis blog and news, NASA Moon Base pages, NASA OIG/GAO
   reports, SpacePolicyOnline, Spaceflight Now, then company releases (SpaceX, Blue Origin,
   Astrobotic, Intuitive Machines, Firefly, Northrop Grumman).
2. Update the YAML: change fields, add sources, never delete IDs.
3. `python3 tools/validate_manifest.py` must print `OK`.
4. `python3 tools/render_manifest.py` to regenerate the Markdown.
5. Bump `manifest_version`, set `as_of`, add a `changelog.md` entry.
6. Tell the contracts thread which IDs changed.

Confidence rules: NASA primary sources outrank trade press; trade press outranks trackers and
Wikipedia. When sources disagree, record both in `notes` and pick the more conservative date
for `window`.
