# NASA lunar mission manifest, now through 2030

_Generated from `artemis-manifest.yaml` (v1, as of 2026-11-06). Do not edit by hand: run `python3 tools/render_manifest.py`._

**Career goal:** Permanent crewed lunar base at the lunar south pole, mirroring NASA's three-phase Moon Base program (Phase 1 now–2029, Phase 2 2029–2032, Phase 3 2032+).

**Confidence key:** ✅ confirmed = announced with hardware, contract or crew in work · 🟡 likely = announced but date/details soft · 🔮 speculative = our projection from NASA's stated cadence.

## Timeline at a glance

| Window | Mission | Type | Status | Confidence |
|---|---|---|---|---|
| 2026-Q2 | **Artemis II** (`ARTEMIS-II`) | crewed | flown | ✅ confirmed |
| 2026-Q4 → 2027-Q2 | **Moon Base I — Blue Moon MK1 "Endurance"** (`MOON-BASE-I`) | robotic | scheduled | 🟡 likely |
| 2026-Q4 → 2027-Q2 | **Moon Base II — Griffin-1** (`MOON-BASE-II`) | robotic | scheduled | 🟡 likely |
| 2026-Q4 → 2027-Q2 | **Moon Base III — IM-3 "Trinity"** (`MOON-BASE-III`) | robotic | scheduled | 🟡 likely |
| 2027-Q1 → 2027-Q3 | **Starship orbital propellant transfer demonstration** (`STARSHIP-PROP-TRANSFER-DEMO`) | robotic | planned | 🟡 likely |
| 2027-Q1 → 2027-Q4 | **CAPSTONE 02** (`CAPSTONE-02`) | robotic | planned | 🟡 likely |
| 2027-Q2 → 2027-Q4 | **Artemis III** (`ARTEMIS-III`) | crewed | scheduled | ✅ confirmed |
| 2027-Q2 → 2028-Q1 | **Blue Ghost Mission 2** (`BLUE-GHOST-M2`) | robotic | scheduled | 🟡 likely |
| 2027-Q4 → 2028-Q2 | **Starship HLS uncrewed lunar landing demo** (`STARSHIP-HLS-UNCREWED-LANDING`) | robotic | planned | 🟡 likely |
| 2027-Q4 → 2028-Q2 | **VIPER (Volatiles Investigating Polar Exploration Rover)** (`VIPER`) | robotic | planned | 🟡 likely |
| 2027-Q4 → 2028-Q3 | **Blue Moon MK2 uncrewed lunar landing demo** (`BLUE-MOON-MK2-UNCREWED-LANDING`) | robotic | planned | 🟡 likely |
| 2027-Q4 → 2028-Q3 | **Lunar Terrain Vehicle delivery (Astrolab CLV-1 and Lunar Outpost Pegasus)** (`LTV-DELIVERY`) | robotic | scheduled | 🟡 likely |
| 2028-Q1 → 2028-Q4 | **Artemis IV** (`ARTEMIS-IV`) | crewed | scheduled | ✅ confirmed |
| 2028-Q1 → 2028-Q4 | **MoonFall** (`MOONFALL`) | robotic | planned | 🟡 likely |
| 2028-Q1 → 2029-Q2 | **Blue Ghost Mission 3** (`BLUE-GHOST-M3`) | robotic | planned | 🔮 speculative |
| 2028-Q1 → 2029-Q4 | **Lunar Infrastructure Demo 1 (HALO-derived)** (`LID-1`) | robotic | planned | 🟡 likely |
| 2028-Q2 → 2029-Q1 | **Peregrine Mission Two** (`PEREGRINE-2`) | robotic | planned | 🟡 likely |
| 2028-Q2 → 2029-Q1 | **Peregrine Mission Three** (`PEREGRINE-3`) | robotic | planned | 🟡 likely |
| 2028-Q3 → 2029-Q2 | **Artemis V** (`ARTEMIS-V`) | crewed | scheduled | 🟡 likely |
| 2028-Q3 → 2029-Q2 | **Other June 2026 Moon Base CLPS awards (unnamed)** (`CLPS-2028-OTHER`) | robotic | planned | 🟡 likely |
| 2028-Q3 → 2029-Q4 | **Lunar Infrastructure Demo 2 (HALO-derived)** (`LID-2`) | robotic | planned | 🟡 likely |
| 2029-Q1 → 2029-Q4 | **Artemis VI (projected)** (`ARTEMIS-VI`) | crewed | proposed | 🔮 speculative |
| 2029-Q1 → 2029-Q4 | **Lunar Infrastructure Demo 3 (HALO-derived)** (`LID-3`) | robotic | planned | 🟡 likely |
| 2029-Q3 → 2030-Q4 | **Artemis VII (projected)** (`ARTEMIS-VII`) | crewed | proposed | 🔮 speculative |
| 2029-Q3 → 2031-Q4 | **Lunar Fission Surface Power reactor** (`FISSION-SURFACE-POWER`) | robotic | planned | 🟡 likely |
| 2029-Q3 → 2032-Q4 | **First surface habitat (Phase 2 "Build and Expand")** (`MOON-BASE-PHASE-2-HABITAT`) | robotic | proposed | 🔮 speculative |
| 2030-Q1 → 2030-Q4 | **Artemis VIII (projected)** (`ARTEMIS-VIII`) | crewed | proposed | 🔮 speculative |

## World state (program-level facts)

- **gateway_paused** (✅ confirmed): Lunar Gateway was paused "in its current form" on 2026-03-24 (several outlets call it effectively cancelled). Orion now docks with landers directly; there is no NRHO station in the plan. HALO hardware is being converted by Northrop Grumman into three Lunar Infrastructure Demo (LID) surface missions. Fate of PPE and I-Hab not published as of 2026-11-06. _Sources: [Spaceflight Now](https://spaceflightnow.com/2026/03/25/nasa-outlines-ambitious-20-billion-plan-for-moon-base/), [Spaceflight Now](https://spaceflightnow.com/2026/08/06/nasa-northrop-grumman-repurpose-gateway-elements-for-moon-base-demo-missions/), [Scientific American](https://www.scientificamerican.com/article/nasa-unveils-new-ambitious-moon-base-plans/)_
- **sls_block1_only** (✅ confirmed): SLS Block 1B, Block 2, the Exploration Upper Stage and Mobile Launcher 2 were cancelled (announced 2026-02-26/27). SLS stays near-Block 1. For Artemis IV NASA is weighing the existing ICPS or a stretched Centaur V upper stage. NASA has said it intends to move crews to commercial launchers after the current SLS flights; which vehicle is not decided. _Sources: [NASA](https://www.nasa.gov/directorates/esdmd/nasa-strengthens-artemis-adds-mission-refines-overall-architecture/), [SatNews](https://satnews.com/2026/02/27/nasa-overhauls-artemis-program-scraps-sls-upgrades-adds-2027-leo-test-mission/), [NASA](https://www.nasa.gov/missions/artemis/nasa-shares-plans-to-accelerate-artemis-return-to-moon/)_
- **moon_base_program** (✅ confirmed): NASA "Moon Base" program announced at the Ignition event 2026-03-24: about $20B over seven years (Isaacman; Scientific American reported $30B by 2036), three phases at the south pole. Phase 1 "Now–2029" gain access / experiment / learn; Phase 2 2029–2032 "Build and Expand" (habitats, regular surface ops); Phase 3 2032+ "Live and Work on the Moon" (fission + solar power, crewed and uncrewed rovers, site-prep machines, surface comms network, lunar GPS, relay and observation constellations). _Sources: [Spaceflight Now](https://spaceflightnow.com/2026/03/25/nasa-outlines-ambitious-20-billion-plan-for-moon-base/), [NASA](https://www.nasa.gov/moonbase-phases/), [Scientific American](https://www.scientificamerican.com/article/nasa-unveils-new-ambitious-moon-base-plans/)_
- **landing_cadence** (🟡 likely): Isaacman's stated goal is crewed landings about every six months with at least two lander providers. NASA's March architecture note said "about one lunar mission per year" after Artemis V. Treat two-per-year as the aspiration and one-per-year as the baseline. _Sources: [Spaceflight Now](https://spaceflightnow.com/2026/03/25/nasa-outlines-ambitious-20-billion-plan-for-moon-base/), [NASA](https://www.nasa.gov/directorates/esdmd/nasa-strengthens-artemis-adds-mission-refines-overall-architecture/)_
- **clps_cadence** (🟡 likely): Isaacman wants about 10 CLPS deliveries per year for three years starting 2027. CLPS 2.0 RFP released 2026-05-15 (responses due 2026-06-30). Every CLPS task order so far has slipped substantially; schedule all robotic missions with slack. _Sources: [SpacePolicyOnline](https://spacepolicyonline.com/news/nasa-awards-initial-moon-base-rover-and-lander-contracts/), [NASA](https://www.nasa.gov/news-release/nasa-provides-update-on-moon-base-rovers-landers-missions/)_
- **two_lander_strategy** (✅ confirmed): Both SpaceX Starship HLS and Blue Origin Blue Moon MK2 are in the plan; neither is assigned to a specific landing as of 2026-10-23. Starship reaches the Moon by refuelling in LEO (tanker count estimates range 6–8 to 22) and then carries itself to low lunar orbit to meet Orion. Blue Moon MK2 uses three Blue Moon MK1 derived transfer stages to reach an elliptical polar lunar orbit. Each provider must fly one uncrewed landing before a crewed one. _Sources: [NASA](https://www.nasa.gov/missions/artemis/nasa-partners-accelerate-lander-development-for-2028-moon-missions/), [SpacePolicyOnline](https://spacepolicyonline.com/news/nasa-is-full-steam-ahead-on-artemis-iii-iv-and-v/), [SatNews](https://satnews.com/2026/11/03/nasa-graphic-outlines-artemis-iv-starship-refueling-architecture-as-launch-estimates-vary/)_
- **surface_ops_first_landings** (✅ confirmed): Two crew descend, two stay in Orion. First landings target two moonwalks totalling about two hours, in a simplified Axiom "sortie" suit. _Sources: [SpacePolicyOnline](https://spacepolicyonline.com/news/nasa-is-full-steam-ahead-on-artemis-iii-iv-and-v/), [NASA](https://www.nasa.gov/missions/artemis/nasa-shares-plans-to-accelerate-artemis-return-to-moon/)_
- **south_pole_site_open** (🟡 likely): South pole remains the target. NASA says robotic data is still needed before choosing a crew landing site. A NASEM report (Oct 2026) proposed four non-polar sites; Isaacman called an Apollo-site return "very cool at some point." _Sources: [SpacePolicyOnline](https://spacepolicyonline.com/news/nasa-is-full-steam-ahead-on-artemis-iii-iv-and-v/)_
- **fission_power_2030** (🟡 likely): NASA and DOE goal (MOU, Jan 2026): a lunar surface fission reactor by 2030, about 40 kWe class, 10+ year life, via funded Space Act Agreements. No flight award found as of 2026-11-06. _Sources: [DOE](https://www.energy.gov/articles/us-department-energy-and-nasa-develop-lunar-surface-reactor-2030), [Lockheed Martin](https://www.lockheedmartin.com/en-us/news/features/2026/fission-surface-power-endless-power-in-the-lunar-night.html)_
- **china_competition** (🟡 likely): China targets a crewed landing by 2030. Chang'e-7 (south pole orbiter, lander, rover, hopper) was stood down a day before launch in Aug 2026; next window possibly early 2027. Useful as world "pressure" events, not NASA contracts. _Sources: [Associated Press](https://www.local10.com/tech/2026/08/23/china-abruptly-postpones-ambitious-change-7-lunar-mission-launch/), [Scientific American](https://www.scientificamerican.com/article/nasa-unveils-new-ambitious-moon-base-plans/)_

## Precursors (2026–2027)

### Artemis II  
`ARTEMIS-II` · crewed · flown · ✅ confirmed

- **Target:** Launched 2026-04-01, splashdown 2026-04-10
- **Provider:** NASA (SLS / Orion)
- **Launch vehicle:** SLS Block 1 (with ICPS)
- **Spacecraft:** Orion
- **Destination:** Lunar free-return flyby
- **Crew:** Reid Wiseman (CDR), Victor Glover (PLT), Christina Koch (MS), Jeremy Hansen (MS, CSA)
- **Objectives:**
  - First crewed flight of SLS/Orion; crewed lunar flyby
  - Set the record for farthest human distance from Earth (passed Apollo 13 on 2026-04-06)
  - Pacific splashdown off San Diego
- **Toward the base:** Validates the crew transport leg every later base mission depends on.
- **Contract hooks:**
  - {'Historical/tutorial contract': 'crewed lunar free-return flyby with 4 crew and ocean recovery.'}
- **Sources:** [Wikipedia](https://en.wikipedia.org/wiki/Artemis_II), [NASA](https://www.nasa.gov/news-release/nasa-welcomes-record-setting-artemis-ii-moonfarers-back-to-earth/)

### Starship orbital propellant transfer demonstration  
`STARSHIP-PROP-TRANSFER-DEMO` · robotic · planned · 🟡 likely

- **Target:** Early 2027
- **Provider:** SpaceX
- **Launch vehicle:** Starship / Super Heavy
- **Spacecraft:** Starship (tanker + receiver or depot)
- **Destination:** LEO
- **Objectives:**
  - Ship-to-ship cryogenic propellant transfer at scale
- **Toward the base:** Prerequisite for every Starship lunar landing; same skill a base needs for surface/orbital refuelling.
- **Contract hooks:**
  - Rendezvous + transfer N tonnes of LOX/methane between two vessels in LEO; boil-off matters in RP-1.
- **Notes:** NASA's Oct 2026 lander page instead says propellant aggregation is shown during the uncrewed demo; sources differ on whether this is a separate flight.
- **Sources:** [SpacePolicyOnline](https://spacepolicyonline.com/news/nasa-is-full-steam-ahead-on-artemis-iii-iv-and-v/), [SatNews](https://satnews.com/2026/11/03/nasa-graphic-outlines-artemis-iv-starship-refueling-architecture-as-launch-estimates-vary/)

### Artemis III  
`ARTEMIS-III` · crewed · scheduled · ✅ confirmed

- **Target:** Mid-2027 (NASA reaffirmed 2026-10-23)
- **Provider:** NASA (SLS / Orion) with SpaceX and Blue Origin test landers
- **Launch vehicle:** SLS Block 1 with a spacer in place of the ICPS
- **Spacecraft:** Orion; Blue Moon MK2 test article; Starship V3 HLS test article
- **Destination:** Low Earth orbit, ~14 days
- **Crew:** Randy Bresnik, Frank Rubio, Andre Douglas, Luca Parmitano (ESA)
- **Objectives:**
  - Blue Origin launches the Blue Moon MK2 test article first (can loiter ~30 days)
  - Orion docks with Blue Moon around flight day 3; crew enters and tests for ~2 days
  - Starship test article (passive docking system on its nose) launches ~day 6; Orion docks ~2 hours, no crew entry
  - Test Axiom AxEMU suit, life support crossover, docking and proximity ops
- **Toward the base:** Proves the Orion-to-lander docking every crew rotation to the base will use.
- **Contract hooks:**
  - {'Multi-launch campaign contract': 'two target vehicles + crew vehicle, dock with both inside one mission.'}
  - Bonus for pressurised crew transfer into the first target.
- **Depends on:** `STARSHIP-PROP-TRANSFER-DEMO`
- **Notes:** Isaacman called the mid-2027 date "90 days broken to schedule" in September. Booster stacking finished mid-Oct 2026; core stage mated 2026-10-28.
- **Sources:** [NASA](https://www.nasa.gov/missions/artemis/nasa-shares-plans-to-accelerate-artemis-return-to-moon/), [SpacePolicyOnline](https://spacepolicyonline.com/news/nasa-is-full-steam-ahead-on-artemis-iii-iv-and-v/), [NASA](https://www.nasa.gov/blogs/missions/2026/10/13/nasa-completes-artemis-iii-booster-stacking-shares-status-update/)

### Starship HLS uncrewed lunar landing demo  
`STARSHIP-HLS-UNCREWED-LANDING` · robotic · planned · 🟡 likely

- **Target:** Late 2027
- **Provider:** SpaceX
- **Launch vehicle:** Starship / Super Heavy + tankers
- **Spacecraft:** Starship HLS
- **Destination:** Lunar south pole
- **Objectives:**
  - Required uncrewed landing before any crewed Starship landing
- **Toward the base:** Qualifies the high-mass lander that can later deliver large base hardware.
- **Contract hooks:**
  - Uncrewed precision landing at a pole site after LEO refuelling; reward scales with landing accuracy.
- **Depends on:** `STARSHIP-PROP-TRANSFER-DEMO`
- **Sources:** [SpacePolicyOnline](https://spacepolicyonline.com/news/nasa-is-full-steam-ahead-on-artemis-iii-iv-and-v/), [NASA](https://www.nasa.gov/missions/artemis/nasa-partners-accelerate-lander-development-for-2028-moon-missions/)

### Blue Moon MK2 uncrewed lunar landing demo  
`BLUE-MOON-MK2-UNCREWED-LANDING` · robotic · planned · 🟡 likely

- **Target:** Before its first crewed landing; date not published
- **Provider:** Blue Origin
- **Launch vehicle:** New Glenn
- **Spacecraft:** Blue Moon MK2 + three MK1-derived transfer stages
- **Destination:** Lunar south pole
- **Objectives:**
  - Required uncrewed landing before a crewed Blue Moon landing
- **Toward the base:** Qualifies the second, independent crew lander.
- **Contract hooks:**
  - Stack three transfer stages to push a lander into elliptical polar lunar orbit, then land uncrewed.
- **Notes:** Date is our inference from the 2028 crewed target; NASA has not published it.
- **Sources:** [SpacePolicyOnline](https://spacepolicyonline.com/news/nasa-is-full-steam-ahead-on-artemis-iii-iv-and-v/), [NASA](https://www.nasa.gov/missions/artemis/nasa-partners-accelerate-lander-development-for-2028-moon-missions/)

## Moon Base Phase 1 — gain access, experiment, learn (now–2029)

### Moon Base I — Blue Moon MK1 "Endurance"  
`MOON-BASE-I` · robotic · scheduled · 🟡 likely

- **Target:** NASA: no earlier than fall 2026; later trackers: first part of 2027
- **Provider:** Blue Origin
- **Launch vehicle:** New Glenn
- **Spacecraft:** Blue Moon MK1 cargo lander
- **Destination:** Shackleton connecting ridge, lunar south pole
- **Payloads:** SCALPSS (plume-surface stereo cameras; Langley); Laser Retroreflector Array (Goddard)
- **Objectives:**
  - First Blue Moon landing; first privately funded lander mission (per Isaacman)
  - Image plume-surface interaction for later crew landings
- **Toward the base:** First hardware at the likely base region; characterises landing ejecta hazards.
- **Contract hooks:**
  - Uncrewed cargo landing on the Shackleton ridge; science bonus for plume imaging during descent.
- **Notes:** A New Glenn test explosion (reported June 2026) damaged LC-36; Blue Origin targeted New Glenn return to flight in Nov 2026. Not confirmed launched as of 2026-11-06.
- **Sources:** [NASA](https://www.nasa.gov/news-release/nasa-provides-update-on-moon-base-rovers-landers-missions/), [NASA](https://www.nasa.gov/moonbase-phases/), [SpaceNexus (secondary tracker)](https://spacenexus.us/programs/clps)

### Moon Base II — Griffin-1  
`MOON-BASE-II` · robotic · scheduled · 🟡 likely

- **Target:** Late 2026 (NASA, June 2026 caption)
- **Provider:** Astrobotic (NASA page title credits Voyager Technologies)
- **Spacecraft:** Griffin lander
- **Destination:** Lunar south pole region
- **Payloads:** Astrolab FLIP rover; LDES (JSC); Lunar LiDAR Demonstration (Marshall); two LRAs (Goddard); METAL with Interlune (Ames)
- **Objectives:**
  - Deliver a commercial rover to mature mobility for later LTV operations
- **Toward the base:** Early surface mobility and resource (helium-3/regolith) prospecting.
- **Contract hooks:**
  - Land a lander that deploys a small rover; rover drive-distance objective.
- **Notes:** Not confirmed launched as of 2026-11-06.
- **Sources:** [NASA](https://www.nasa.gov/news-release/nasa-provides-update-on-moon-base-rovers-landers-missions/), [NASA](https://www.nasa.gov/moonbase-phases/)

### Moon Base III — IM-3 "Trinity"  
`MOON-BASE-III` · robotic · scheduled · 🟡 likely

- **Target:** NASA (May 2026): this year; trackers: first part of 2027
- **Provider:** Intuitive Machines
- **Spacecraft:** Nova-C lander
- **Destination:** Reiner Gamma (lunar swirl, near side, non-polar)
- **Payloads:** Lunar Vertex (JHU/APL; PRISM); LDES; Altus-1 relay satellite; NavCube3-mini; ESA and KASI payloads
- **Objectives:**
  - Study lunar swirl magnetism; deploy a relay satellite
- **Toward the base:** First piece of lunar relay/navigation infrastructure.
- **Contract hooks:**
  - Land at a non-polar science site and deploy a relay satellite into lunar orbit.
- **Notes:** Not confirmed launched as of 2026-11-06.
- **Sources:** [NASA](https://www.nasa.gov/news-release/nasa-provides-update-on-moon-base-rovers-landers-missions/), [NASA](https://www.nasa.gov/moonbase-phases/)

### CAPSTONE 02  
`CAPSTONE-02` · robotic · planned · 🟡 likely

- **Target:** 2027
- **Provider:** TBD (Advanced Space flew CAPSTONE 1)
- **Spacecraft:** Small lunar orbiter
- **Destination:** Lunar orbit
- **Objectives:**
  - Lunar-orbit proximity operations demonstration
- **Toward the base:** Navigation and rendezvous experience for orbital logistics.
- **Contract hooks:**
  - Small-sat to lunar orbit; perform a rendezvous/proximity manoeuvre.
- **Notes:** From a model-summarised read of NASA's Moon Base phases page; verify on next pass.
- **Sources:** [NASA](https://www.nasa.gov/moonbase-phases/)

### Blue Ghost Mission 2  
`BLUE-GHOST-M2` · robotic · scheduled · 🟡 likely

- **Target:** 2027 (NASA Sept 2026: later in 2027)
- **Provider:** Firefly Aerospace
- **Spacecraft:** Blue Ghost lander + Elytra Dark orbiter
- **Destination:** Lunar far side
- **Payloads:** LuSEE-Night radio telescope; user terminal
- **Objectives:**
  - First American far-side landing; far-side radio astronomy
- **Toward the base:** Far-side comms relay experience.
- **Contract hooks:**
  - Far-side landing requiring a relay satellite for comms (great fit for RemoteTech/CommNet-style constraints).
- **Sources:** [NASA](https://www.nasa.gov/moonbase-phases/), [SpaceNexus (secondary tracker)](https://spacenexus.us/programs/clps)

### VIPER (Volatiles Investigating Polar Exploration Rover)  
`VIPER` · robotic · planned · 🟡 likely

- **Target:** Late 2027
- **Provider:** Blue Origin (second Blue Moon MK1)
- **Launch vehicle:** New Glenn
- **Spacecraft:** Blue Moon MK1 #2 + VIPER rover
- **Destination:** Lunar south pole
- **Objectives:**
  - Map subsurface water ice and other volatiles in and near shadowed regions
- **Toward the base:** Ice survey that decides where the base and ISRU plant go.
- **Contract hooks:**
  - Drive a rover into/near a permanently shadowed region; survey N distinct points with a neutron/drill-style instrument.
- **Depends on:** `MOON-BASE-I`
- **Notes:** Delivery is an option NASA exercises after reviewing Blue Moon MK1's first flight.
- **Sources:** [NASA](https://www.nasa.gov/news-release/nasa-selects-blue-origin-to-deliver-viper-rover-to-moons-south-pole/), [NASA](https://www.nasa.gov/moonbase-phases/)

### Lunar Terrain Vehicle delivery (Astrolab CLV-1 and Lunar Outpost Pegasus)  
`LTV-DELIVERY` · robotic · scheduled · 🟡 likely

- **Target:** 2028, before the Artemis IV crew
- **Provider:** Blue Origin (delivery); Astrolab and Lunar Outpost (rovers)
- **Launch vehicle:** New Glenn
- **Spacecraft:** Blue Moon MK1 (cargo)
- **Destination:** Lunar south pole
- **Payloads:** Astrolab CLV-1 (~2,000 lb, >6 mph); Lunar Outpost Pegasus (>9 mph, up to 1 year ops, manual/autonomous/teleoperated)
- **Objectives:**
  - Pre-position unpressurised crew rovers that also run uncrewed between missions
- **Toward the base:** Core surface mobility for every crewed sortie and base logistics.
- **Contract hooks:**
  - Deliver a rover, then drive it teleoperated to a rendezvous point near the planned crew landing site.
- **Notes:** Astrolab $219M, Lunar Outpost $220M, Blue Origin delivery $188M (+ $280.4M options).
- **Sources:** [NASA](https://www.nasa.gov/news-release/nasa-provides-update-on-moon-base-rovers-landers-missions/), [SpacePolicyOnline](https://spacepolicyonline.com/news/nasa-awards-initial-moon-base-rover-and-lander-contracts/)

### Artemis IV  
`ARTEMIS-IV` · crewed · scheduled · ✅ confirmed

- **Target:** Early 2028 (NASA: 2028)
- **Provider:** NASA (SLS / Orion) + SpaceX or Blue Origin lander (not yet assigned)
- **Launch vehicle:** SLS Block 1 (ICPS or stretched Centaur V upper stage, under study)
- **Spacecraft:** Orion + Starship HLS or Blue Moon MK2
- **Destination:** Lunar south pole region (final site pending robotic data)
- **Crew:** TBD — 4 crew, 2 to the surface
- **Objectives:**
  - First Artemis crewed landing; first humans on the Moon since 1972
  - Two moonwalks, ~2 hours total, Axiom sortie suit
  - Use the LTVs delivered in advance (if on the surface)
- **Toward the base:** First crewed footprint at the base site; drives LTV and site survey.
- **Contract hooks:**
  - Crewed landing contract with two EVA objectives and a minimum surface stay.
  - {'Starship path': 'Orion meets a refuelled lander in Earth orbit, lander performs TLI.'}
  - {'Blue Moon path': 'rendezvous in elliptical polar lunar orbit.'}
- **Depends on:** `ARTEMIS-III`, `STARSHIP-HLS-UNCREWED-LANDING`, `BLUE-MOON-MK2-UNCREWED-LANDING`, `LTV-DELIVERY`
- **Notes:** Original contracts gave Artemis III/IV to Starship and V to Blue Moon; NASA now says neither lander is tied to a mission. NASA OIG and GAO have warned 2028 is at risk.
- **Sources:** [NASA](https://www.nasa.gov/missions/artemis/nasa-shares-plans-to-accelerate-artemis-return-to-moon/), [NASA](https://www.nasa.gov/missions/artemis/nasa-partners-accelerate-lander-development-for-2028-moon-missions/), [SpacePolicyOnline](https://spacepolicyonline.com/news/nasa-is-full-steam-ahead-on-artemis-iii-iv-and-v/), [SatNews](https://satnews.com/2026/11/03/nasa-graphic-outlines-artemis-iv-starship-refueling-architecture-as-launch-estimates-vary/), [NASA](https://www.nasa.gov/directorates/esdmd/nasa-strengthens-artemis-adds-mission-refines-overall-architecture/)

### MoonFall  
`MOONFALL` · robotic · planned · 🟡 likely

- **Target:** 2028
- **Provider:** JPL drones; Firefly Elytra Dark carrier
- **Spacecraft:** Firefly Elytra Dark + 4 propulsive hopping drones
- **Destination:** Lunar south pole
- **Objectives:**
  - Drones separate ~50 km up and land ~1.6 km apart, then hop to scout terrain and landing sites
  - Aim for each drone to cover ~30 miles by end of 2028
- **Toward the base:** High-resolution site survey and base perimeter mapping.
- **Contract hooks:**
  - Release multiple small landers from one carrier; each must visit waypoints by hopping.
- **Notes:** NASA says four drones; one briefing said three or four. Firefly subcontract $75M excluding launch.
- **Sources:** [NASA](https://www.nasa.gov/news-release/nasa-provides-update-on-moon-base-rovers-landers-missions/), [SpacePolicyOnline](https://spacepolicyonline.com/news/nasa-awards-initial-moon-base-rover-and-lander-contracts/)

### Lunar Infrastructure Demo 1 (HALO-derived)  
`LID-1` · robotic · planned · 🟡 likely

- **Target:** Phase 1 (now–2029); dates not stated
- **Provider:** Northrop Grumman
- **Destination:** Lunar south pole surface
- **Objectives:**
  - Reuse Gateway HALO technology for surface power, thermal control, autonomy, comms and hosted payloads
  - Survive the lunar night
- **Toward the base:** First base "utility" node: power, thermal, comms.
- **Contract hooks:**
  - Land a utility module that must stay powered and above minimum temperature through a lunar night.
- **Sources:** [Spaceflight Now](https://spaceflightnow.com/2026/08/06/nasa-northrop-grumman-repurpose-gateway-elements-for-moon-base-demo-missions/)

### Blue Ghost Mission 3  
`BLUE-GHOST-M3` · robotic · planned · 🔮 speculative

- **Target:** 2028 (single tracker)
- **Provider:** Firefly Aerospace
- **Destination:** TBD
- **Toward the base:** Additional CLPS delivery capacity.
- **Contract hooks:**
  - Generic CLPS delivery.
- **Notes:** Only one secondary source; verify.
- **Sources:** [SpaceNexus (secondary tracker)](https://spacenexus.us/programs/clps)

### Peregrine Mission Two  
`PEREGRINE-2` · robotic · planned · 🟡 likely

- **Target:** By end of 2028
- **Provider:** Astrobotic
- **Spacecraft:** Peregrine lander
- **Destination:** Gruithuisen Domes (near side)
- **Payloads:** LETS radiation spectrometer; plus two other NASA payloads
- **Toward the base:** Radiation environment data for crew dose planning.
- **Contract hooks:**
  - Non-polar science landing; radiation-monitoring experiment running for N days.
- **Sources:** [Astrobotic](https://www.astrobotic.com/astrobotic-awarded-2-nasa-contracts-for-clps-moon-base-missions/), [Wikipedia](https://en.wikipedia.org/wiki/Commercial_Lunar_Payload_Services)

### Peregrine Mission Three  
`PEREGRINE-3` · robotic · planned · 🟡 likely

- **Target:** By end of 2028
- **Provider:** Astrobotic
- **Spacecraft:** Peregrine lander
- **Destination:** Gruithuisen Domes (near side)
- **Payloads:** three NASA-sponsored payloads
- **Toward the base:** Science and environment data.
- **Contract hooks:**
  - Second landing at the same site; precision landing near Peregrine-2.
- **Sources:** [Astrobotic](https://www.astrobotic.com/astrobotic-awarded-2-nasa-contracts-for-clps-moon-base-missions/), [Wikipedia](https://en.wikipedia.org/wiki/Commercial_Lunar_Payload_Services)

### Artemis V  
`ARTEMIS-V` · crewed · scheduled · 🟡 likely

- **Target:** Late 2028 (NASA March plan); Oct 2026 briefing said 2028 for IV and V
- **Provider:** NASA + whichever lander did not fly Artemis IV (likely)
- **Launch vehicle:** SLS Block 1 (upper stage TBD)
- **Spacecraft:** Orion + Starship HLS or Blue Moon MK2
- **Destination:** Lunar south pole
- **Crew:** TBD
- **Objectives:**
  - Second crewed landing
  - {'NASA (Mar 2026)': 'when NASA is expected to begin building its Moon base'}
- **Toward the base:** Start of base construction on the crewed side.
- **Contract hooks:**
  - Crewed landing near the previous site; deploy or activate a base element delivered by cargo lander.
- **Depends on:** `ARTEMIS-IV`
- **Notes:** Spaceflight Now (Mar) called a second 2028 landing "possibly"; treat date as soft.
- **Sources:** [NASA](https://www.nasa.gov/directorates/esdmd/nasa-strengthens-artemis-adds-mission-refines-overall-architecture/), [SpacePolicyOnline](https://spacepolicyonline.com/news/nasa-is-full-steam-ahead-on-artemis-iii-iv-and-v/), [Spaceflight Now](https://spaceflightnow.com/2026/03/25/nasa-outlines-ambitious-20-billion-plan-for-moon-base/)

### Other June 2026 Moon Base CLPS awards (unnamed)  
`CLPS-2028-OTHER` · robotic · planned · 🟡 likely

- **Target:** Late 2028
- **Provider:** TBD (NASA: three companies, four missions in late 2028)
- **Destination:** TBD
- **Objectives:**
  - Two further deliveries beyond the Astrobotic pair (inferred from NASA's count)
- **Toward the base:** Payload and technology demonstrations for Phase 1.
- **Contract hooks:**
  - Generic "CLPS delivery" contract template (see clps_template below).
- **Notes:** Research gap — identify providers and payloads on next pass.
- **Sources:** [NASA](https://www.nasa.gov/reference/moonbase-about/), [Astrobotic](https://www.astrobotic.com/astrobotic-awarded-2-nasa-contracts-for-clps-moon-base-missions/)

### Lunar Infrastructure Demo 2 (HALO-derived)  
`LID-2` · robotic · planned · 🟡 likely

- **Target:** Phase 1 (now–2029); dates not stated
- **Provider:** Northrop Grumman
- **Destination:** Lunar south pole surface
- **Objectives:**
  - Second HALO-derived infrastructure demo
- **Toward the base:** Expands the utility node network.
- **Contract hooks:**
  - Land within N km of LID-1 and link power/comms.
- **Depends on:** `LID-1`
- **Sources:** [Spaceflight Now](https://spaceflightnow.com/2026/08/06/nasa-northrop-grumman-repurpose-gateway-elements-for-moon-base-demo-missions/)

### Lunar Infrastructure Demo 3 (HALO-derived)  
`LID-3` · robotic · planned · 🟡 likely

- **Target:** Phase 1 (now–2029); dates not stated
- **Provider:** Northrop Grumman
- **Destination:** Lunar south pole surface
- **Objectives:**
  - Third HALO-derived infrastructure demo
- **Toward the base:** Completes the Phase 1 utility demo set.
- **Contract hooks:**
  - Land a third node; network of three must be simultaneously powered.
- **Depends on:** `LID-2`
- **Sources:** [Spaceflight Now](https://spaceflightnow.com/2026/08/06/nasa-northrop-grumman-repurpose-gateway-elements-for-moon-base-demo-missions/)

## Moon Base Phase 2 — build and expand (2029–2032)

### Artemis VI (projected)  
`ARTEMIS-VI` · crewed · proposed · 🔮 speculative

- **Target:** Not announced. Projection: 2029
- **Provider:** TBD (NASA intends commercial crew launch after current SLS flights)
- **Destination:** Lunar south pole base site
- **Objectives:**
  - Longer surface stay, first use of base infrastructure (power, comms)
- **Toward the base:** Bridges Phase 1 experiments and Phase 2 build-out.
- **Contract hooks:**
  - Crewed landing at the base site with a multi-day stay; requires an active surface power source.
- **Depends on:** `ARTEMIS-V`
- **Notes:** Projection only, based on NASA's stated cadence (one to two crewed landings per year).
- **Sources:** [NASA](https://www.nasa.gov/directorates/esdmd/nasa-strengthens-artemis-adds-mission-refines-overall-architecture/), [Spaceflight Now](https://spaceflightnow.com/2026/03/25/nasa-outlines-ambitious-20-billion-plan-for-moon-base/), [NASA](https://www.nasa.gov/moonbase-phases/)

### Artemis VII (projected)  
`ARTEMIS-VII` · crewed · proposed · 🔮 speculative

- **Target:** Not announced. Projection: 2029–2030
- **Provider:** TBD
- **Destination:** Lunar south pole base site
- **Objectives:**
  - Crew rotation using early habitat / pressurised mobility
- **Toward the base:** First crew to live in base habitat hardware (Phase 2).
- **Contract hooks:**
  - Crew arrives, transfers into a pre-landed habitat, conducts extended EVA with LTV.
- **Depends on:** `ARTEMIS-VI`
- **Notes:** Projection only.
- **Sources:** [Spaceflight Now](https://spaceflightnow.com/2026/03/25/nasa-outlines-ambitious-20-billion-plan-for-moon-base/), [NASA](https://www.nasa.gov/moonbase-phases/)

### Lunar Fission Surface Power reactor  
`FISSION-SURFACE-POWER` · robotic · planned · 🟡 likely

- **Target:** By 2030 (NASA/DOE goal)
- **Provider:** TBD (prior design studies: Lockheed Martin, Westinghouse, IX (Intuitive Machines/X-energy))
- **Destination:** Lunar south pole base site
- **Objectives:**
  - ~40 kWe reactor operating continuously for 10+ years
- **Toward the base:** The single most important enabler of permanent occupancy (lunar night and shadowed regions).
- **Contract hooks:**
  - Deliver a heavy reactor, place it a safe distance from the habitat site, run cable, activate.
- **Notes:** No flight award found as of 2026-11-06. Dates past 2030 are plausible.
- **Sources:** [DOE](https://www.energy.gov/articles/us-department-energy-and-nasa-develop-lunar-surface-reactor-2030), [Lockheed Martin](https://www.lockheedmartin.com/en-us/news/features/2026/fission-surface-power-endless-power-in-the-lunar-night.html), [Scientific American](https://www.scientificamerican.com/article/nasa-unveils-new-ambitious-moon-base-plans/)

### First surface habitat (Phase 2 "Build and Expand")  
`MOON-BASE-PHASE-2-HABITAT` · robotic · proposed · 🔮 speculative

- **Target:** Phase 2 (2029–2032)
- **Provider:** TBD
- **Destination:** Lunar south pole base site
- **Objectives:**
  - Habitat and infrastructure supporting regular astronaut operations
- **Toward the base:** The base itself.
- **Contract hooks:**
  - Cargo landing of a habitat module; later crewed contract to occupy it for N days.
- **Notes:** NASA has published phase goals, not hardware. Re-check for I-Hab repurposing and partner (ESA/JAXA/CSA) contributions.
- **Sources:** [NASA](https://www.nasa.gov/moonbase-phases/), [Spaceflight Now](https://spaceflightnow.com/2026/03/25/nasa-outlines-ambitious-20-billion-plan-for-moon-base/)

### Artemis VIII (projected)  
`ARTEMIS-VIII` · crewed · proposed · 🔮 speculative

- **Target:** Not announced. Projection: 2030
- **Provider:** TBD
- **Destination:** Lunar south pole base site
- **Objectives:**
  - Crewed ops with the first lunar fission reactor (NASA/DOE 2030 goal)
- **Toward the base:** Night-survivable power; precondition for permanent occupancy.
- **Contract hooks:**
  - Crewed mission timed after reactor activation; contract requires surviving a lunar night on site.
- **Depends on:** `ARTEMIS-VII`, `FISSION-SURFACE-POWER`
- **Notes:** Projection only.
- **Sources:** [DOE](https://www.energy.gov/articles/us-department-energy-and-nasa-develop-lunar-surface-reactor-2030), [NASA](https://www.nasa.gov/moonbase-phases/)

## Repeatable CLPS-style delivery contract

NASA buys delivery as a service: a commercial provider carries NASA payloads to a named site for a fixed price. Most CLPS missions slip. Good fit for a recurring, procedurally generated contract the player can fulfil as "the provider".

- `payload_mass_kg`: 20–500 (Phase 1), larger later
- `site`: from destinations above, weighted toward south pole
- `deadline`: generous; late delivery reduces reward rather than failing
- `bonus`: precision landing radius, surviving the lunar night, deploying a rover

## Sources

- `nasa-2026-11-04`: [NASA Shares Plans to Accelerate Artemis, Return to Moon](https://www.nasa.gov/missions/artemis/nasa-shares-plans-to-accelerate-artemis-return-to-moon/) (NASA, 2026-11-04)
- `nasa-2026-10-23-landers`: [NASA, Partners Accelerate Lander Development for 2028 Moon Missions](https://www.nasa.gov/missions/artemis/nasa-partners-accelerate-lander-development-for-2028-moon-missions/) (NASA, 2026-10-23)
- `nasa-2026-10-23-blog`: [NASA Shares Artemis Acceleration Plans for Moon Missions](https://www.nasa.gov/blogs/missions/2026/10/23/nasa-shares-artemis-acceleration-plans-for-moon-missions/) (NASA, 2026-10-23)
- `nasa-2026-10-13-stacking`: [NASA Completes Artemis III Booster Stacking, Shares Status Update](https://www.nasa.gov/blogs/missions/2026/10/13/nasa-completes-artemis-iii-booster-stacking-shares-status-update/) (NASA, 2026-10-13)
- `nasa-2026-05-26`: [NASA Provides Update on Moon Base Rovers, Landers, Missions](https://www.nasa.gov/news-release/nasa-provides-update-on-moon-base-rovers-landers-missions/) (NASA, 2026-05-26)
- `nasa-2026-03-03`: [NASA Strengthens Artemis: Adds Mission, Refines Overall Architecture](https://www.nasa.gov/directorates/esdmd/nasa-strengthens-artemis-adds-mission-refines-overall-architecture/) (NASA, 2026-03-03)
- `nasa-moonbase-phases`: [Moon Base Phases](https://www.nasa.gov/moonbase-phases/) (NASA, 2026-10)
- `nasa-moonbase-about`: [Moon Base](https://www.nasa.gov/reference/moonbase-about/) (NASA, 2026)
- `nasa-artemis-ii-return`: [NASA Welcomes Record-Setting Artemis II Moonfarers Back to Earth](https://www.nasa.gov/news-release/nasa-welcomes-record-setting-artemis-ii-moonfarers-back-to-earth/) (NASA, 2026-04)
- `nasa-2025-09-viper`: [NASA Selects Blue Origin to Deliver VIPER Rover to Moon's South Pole](https://www.nasa.gov/news-release/nasa-selects-blue-origin-to-deliver-viper-rover-to-moons-south-pole/) (NASA, 2025-09)
- `doe-2026-01`: [U.S. Department of Energy and NASA to Develop Lunar Surface Reactor by 2030](https://www.energy.gov/articles/us-department-energy-and-nasa-develop-lunar-surface-reactor-2030) (DOE, 2026-01)
- `lockheed-fsp-2026`: [Fission Surface Power - Endless Power in the Lunar Night](https://www.lockheedmartin.com/en-us/news/features/2026/fission-surface-power-endless-power-in-the-lunar-night.html) (Lockheed Martin, 2026)
- `spo-2026-10-23`: [NASA is Full Steam Ahead on Artemis III, IV and V](https://spacepolicyonline.com/news/nasa-is-full-steam-ahead-on-artemis-iii-iv-and-v/) (SpacePolicyOnline, 2026-10-23)
- `spo-2026-05-26`: [NASA Awards Initial Moon Base Rover and Lander Contracts](https://spacepolicyonline.com/news/nasa-awards-initial-moon-base-rover-and-lander-contracts/) (SpacePolicyOnline, 2026-05-26)
- `sfn-2026-03-25`: [NASA outlines ambitious $20 billion plan for moon base](https://spaceflightnow.com/2026/03/25/nasa-outlines-ambitious-20-billion-plan-for-moon-base/) (Spaceflight Now, 2026-03-25)
- `sfn-2026-08-06`: [NASA, Northrop Grumman repurpose Gateway elements for Moon Base demo missions](https://spaceflightnow.com/2026/08/06/nasa-northrop-grumman-repurpose-gateway-elements-for-moon-base-demo-missions/) (Spaceflight Now, 2026-08-06)
- `sciam-2026-03-24`: [NASA unveils ambitious new moon base plans](https://www.scientificamerican.com/article/nasa-unveils-new-ambitious-moon-base-plans/) (Scientific American, 2026-03-24)
- `satnews-2026-02-27`: [NASA Overhauls Artemis Program: Scraps SLS Upgrades, Adds 2027 LEO Test Mission](https://satnews.com/2026/02/27/nasa-overhauls-artemis-program-scraps-sls-upgrades-adds-2027-leo-test-mission/) (SatNews, 2026-02-27)
- `satnews-2026-11-03`: [NASA Outlines Artemis IV Starship Refueling Architecture as Launch Estimates Vary](https://satnews.com/2026/11/03/nasa-graphic-outlines-artemis-iv-starship-refueling-architecture-as-launch-estimates-vary/) (SatNews, 2026-11-03)
- `astrobotic-2026-06-30`: [Astrobotic Awarded 2 NASA Contracts for CLPS Moon Base Missions](https://www.astrobotic.com/astrobotic-awarded-2-nasa-contracts-for-clps-moon-base-missions/) (Astrobotic, 2026-06-30)
- `spacenexus-clps`: [NASA CLPS tracker](https://spacenexus.us/programs/clps) (SpaceNexus (secondary tracker), 2026-09)
- `wiki-clps`: [Commercial Lunar Payload Services](https://en.wikipedia.org/wiki/Commercial_Lunar_Payload_Services) (Wikipedia, 2026-11)
- `wiki-artemis-ii`: [Artemis II](https://en.wikipedia.org/wiki/Artemis_II) (Wikipedia, 2026-11)
- `ap-2026-08-23`: [China abruptly postpones ambitious Chang'e-7 lunar mission launch](https://www.local10.com/tech/2026/08/23/china-abruptly-postpones-ambitious-change-7-lunar-mission-launch/) (Associated Press, 2026-08-23)
