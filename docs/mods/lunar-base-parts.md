# Stand-in parts for lunar-base missions

Answer to the research handoff (M2), checked 2026-11-07 against the post-patch part database (`ModuleManager.ConfigCache`, 2,737 RO-supported parts). Read-only check.

**Summary:** the install has no pressurised crewed rover, no working robotic arm, and no reactor anywhere near 40 kWe. Contracts should accept the stand-ins below, or the mod stack needs new parts (see the end).

## Pressurised rover (JAXA / Toyota Lunar Cruiser)

No part combines wheels with internal crew capacity.

| Part (`name`) | Title | Notes | Tech node |
|---|---|---|---|
| `MADVcockpit` / `MADVhab` | MADV Cockpit / Hab (LonesomeRobots, WIP RO) | 4 crew, 2.1 / 2.4 t; pressurised cabin to mount on a wheeled chassis | `lockheedFuture` |
| `roverWheel3` | RoveMax Model XL3 | Heaviest wheel; chassis for a Cruiser-class build | `advancedMotors` |
| `ROC-LEMRover` | Apollo Lunar Roving Vehicle | Open, 2 external seats, 0.168 t | `boeingLegacy` (was unreachable; fixed by `OrphanTechNodes2.cfg`, live after next launch) |
| `seatExternalCmd` | EAS-1 External Command Seat | Open rover build | `fieldScience` |
| `roverBody_v2` | Probodobodyne RoveMate | Uncrewed rover core | `fieldScience` |

Contract check suggestion: `VesselParameterGroup` with `HasCrew minCrew = 2`, a `PartValidation` on a wheel module (`partModule = ModuleWheelBase`), `ReachState situation = LANDED` and a `Duration`, rather than naming a part.

## Robotic surface arm (Canadarm3)

- **Breaking Ground DLC is not installed** (no `GameData/SquadExpansion`), and Infernal Robotics is not installed, so there are no robotic joint modules at all.
- Only arm-like part: `ISS CanadArm2` (ISS_Comunity, WIP RO, 1.8 t), a static model with **no `TechRequired`**, so it is never researchable.
- Contract check suggestion: require the part by name as a decorative stand-in once it has a tech node, or treat "arm delivered" as a mass/cargo delivery.

## ~40 kWe fission surface power

In RO, 1 EC/s = 1 kW.

| Part | Title | Output | Mass | Tech node |
|---|---|---|---|---|
| `EDB-TOPAZ` | TOPAZ II Reactor | 5 kW | 1.06 t | `largeElectrics` |
| `EDB-MiniTOPAZ` | Mini TOPAZ Reactor | 1.25 kW (Kilopower-class) | 0.25 t | `advElectrics` |
| `ROE-BNTR` | Bimodal NTR (generator mode) | 25 kW | engine | `start` |
| `ROC-LEMFoldingSNAP27BDB` | SNAP-27 RTG | 0.075 kW | 0.016 t | `nuclearPower` (fixed, live after next launch) |
| `RO-MMRTG` | Multi-Mission RTG | 0.11 kW | 0.09 t | `experimentalElectrics` |

A 40 kWe FSP stand-in is eight TOPAZ II units (8.5 t). Contract check suggestion: require a total generation capability rather than a part (for example `PartValidation partModule = ModuleGenerator minCount = 8`), or scale the mission to "1/8 FSP pathfinder".

## What would close the gaps

- A rover with a pressurised cabin and a fission reactor class (~10–40 kWe): candidates are mod packs that are not installed (for example Near Future Electrical / SystemHeat for reactors). Adding any of them needs an RO config check first and costs RAM and load time on an already memory-tight Mac.
- Robotic arms need Breaking Ground (paid DLC) or Infernal Robotics Next.
