# myKSP Artemis Lunar Campaign (career contracts)

A Contract Configurator pack for Mike's RP2000 / RSS career that walks the
player through NASA's real and likely lunar program, from robotic precursors
to a **permanently crewed base on the Shackleton connecting ridge** at the
lunar south pole.

- 30 contracts in 6 sub-groups under one top-level group, `MKSP_Artemis`
- every contract is keyed to a mission id in the research thread's manifest
  (`docs/research/artemis-manifest.yaml`); see [manifest/contract-map.yaml](manifest/contract-map.yaml)
- self-contained in `GameData/myKSP_Artemis/`: delete that folder to remove it

## Install / remove

Copy `GameData/myKSP_Artemis` into `/Applications/KSP-RP2000/GameData/`.
(Installed there on 2026-11-06.) Remove by deleting the same folder. Nothing in
RP2000 is overwritten; one ModuleManager patch adds a missing `title` to
RP2000's broken `spaceStationRotationRepeat` contract (see `Patches/`).

Requires Contract Configurator 2.13.x (KSP-RO) and RSS. Tested only offline
so far; see "Verification" below.

## The campaign

Indentation = prerequisite depth. Prerequisites outside the pack are RP2000's
own milestones (`MoonOrbitUncrewed`, `landingMoon`, `first_OrbitCrewed`,
`first_Docking`).

```
Precursors / commercial                     Crewed line                       Base camp & operations
-----------------------------------------   -------------------------------   -----------------------------
Lunar Polar Mapping Orbiter (LRO heritage)  Artemis I  uncrewed capsule
  CAPSTONE 02 proximity-ops smallsat          Artemis II crewed flyby
  Lunar Relay (x3)                              Artemis III LEO docking test
    Far-Side Landing (Blue Ghost M2)              (needs prop transfer)
  VIPER ice rover                                 Artemis IV first landing    Fission Surface Power
  Moon Base I cargo lander on the ridge             (needs HLS demo)           (needs Artemis IV)
    MoonFall hopper                                 Artemis V base-site + LTV  First Surface Habitat
    LID nodes (x3)  -> Base ISRU                      Artemis VI week at base    Resupply (repeatable)
    LTV delivery (needs Moon Base II)                 Artemis VII habitat 14 d   Crew Rotation (repeatable)
Moon Base II Griffin + rover                          Artemis VIII lunar night   Pressurized Rover
Moon Base III Reiner Gamma + relay                      on fission power, 30 d
Gruithuisen Domes (Peregrine 2/3, x2)                                          PERMANENT LUNAR BASE
CLPS task order (repeatable, random site)                                      4 crew x 180 days
HLS propellant transfer -> HLS uncrewed landing (x2)
```

Run `python3 tools/validate_contracts.py --tree` for the exact graph.

## Design rules

- **Capability-gated, not date-gated.** RP2000 starts on 2000-01-01, so Artemis
  "happens" when the player can do it. Real dates are flavour in the notes.
  (Date gates are easy to add later with an `Expression` requirement on
  `UniversalTime()`; 2026-01-01 is UT 820,540,800.)
- **Modules, not part names.** Checks use part modules (`ModuleRealAntenna`,
  `ModuleGenerator`, `ModuleResourceHarvester`, wheel modules) and crew
  capacity so any craft that does the job qualifies, including procedural or
  unreachable-in-career Orion/Starship parts being swapped out.
- **One base site everywhere:** Shackleton connecting ridge, approx.
  89.45 S 137.5 W (Moon Base I's real target). Reactor site 1.5 km away for
  radiation standoff. Coordinates are approximate; RSS polar terrain is coarser
  than LOLA.
- **Physics stand-ins, labelled.** RSS uses patched conics, so a true NRHO or
  Artemis I's DRO cannot exist. Artemis I is a high retrograde lunar orbit.
  No Gateway contracts: the manifest records Gateway as paused (2026-03-24).
- **Life support numbers** use TAC-LS rates from the mod thread's notes: 30
  days for four crew = 175 Food, 116 Water, 17,770 Oxygen.
- **RealAntennas is the comms constraint.** The far-side landing requires a
  relay contract first, and in practice needs that relay to talk to Earth.
- **No crew losses** on every crewed contract (`KerbalDeaths`).

### Contract Configurator behaviour this pack relies on

Checked against the CC 2.13.4 source, not just the wiki:

- Vessel conditions (`ReachState`, `VisitWaypoint`, `Orbit`, `HasResource`)
  are state-based and revert when the condition stops holding.
  `completeInSequence` waits for *every* earlier sibling to be Complete at the
  same moment, so earlier location/orbit steps in a sequence are latched with
  `disableOnStateChange = true`. The validator enforces this.
- `VesselParameterGroup` latches once complete, and a group using
  `vessel = <define>` waits until that define is associated. Multi-vessel
  missions (Artemis III/IV, CAPSTONE 02, Moon Base II/III, crew rotation) use
  `define` + `IsNotVessel` to keep vehicles apart.
- Optional parameters still block later `completeInSequence` siblings, so
  bonuses are placed after the sequenced steps.

## Verification

| Check | How | Status |
|---|---|---|
| Syntax, types, attributes | `tools/validate_contracts.py` against a schema generated from CC v2.13.4.0 source (`tools/extract_cc_schema.py`) | clean, 0 errors |
| Names exist in Mike's install | biomes, experiments, resources, part modules, icons, RP2000 contract ids snapshotted from `/Applications/KSP-RP2000` (`tools/install_facts.json`) | clean |
| Validator catches faults | seeded typo'd type, bad prerequisite, bad biome, bad attribute, unbalanced brace, undefined vessel | all 6 caught |
| Prerequisite graph | acyclic; every contract reachable from RP2000 milestones | clean |
| Manifest coverage | every research-manifest mission id maps to a contract, every contract maps to an id | clean |
| Loads in KSP | launch KSP, then `tools/check_ksp_log.py /Applications/KSP-RP2000/KSP.log` | **Pass** 2026-11-06 run 2: 87/87 CONTRACT_TYPE, all 30 MKSP loaded, no errors. Run 1 had 11/30 (HasCrew min/max, Orbit with no limits); both now linted. Harmless warnings: IsNotVessel `vessel` (read directly by the factory) and groups without `agent` |
| Offers / completes in play | CC debug window (Alt+F10) on a copy of a career save | **not yet run** |

## Tools

| Script | Purpose |
|---|---|
| `tools/validate_contracts.py [pack] [--tree]` | offline lint, exit 1 on errors |
| `tools/extract_cc_schema.py <cc-src> <out>` | regenerate the CC attribute schema |
| `tools/extract_install_facts.py <ksp> <out>` | re-snapshot install facts after mod changes |
| `tools/check_ksp_log.py <KSP.log>` | confirm every MKSP contract loaded after a launch |

## Backlog

See [BACKLOG.md](BACKLOG.md).
