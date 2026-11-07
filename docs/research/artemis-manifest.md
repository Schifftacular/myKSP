# NASA lunar mission manifest, now through 2030

_Generated from `artemis-manifest.yaml` (v3, as of 2026-11-07). Do not edit by hand: run `python3 tools/render_manifest.py`._

**Career goal:** Permanent crewed lunar base at the lunar south pole, mirroring NASA's three-phase Moon Base program (Phase 1 now–2029, Phase 2 2029–2032, Phase 3 2032+).

**Confidence key:** ✅ confirmed = announced with hardware, contract or crew in work · 🟡 likely = announced but date/details soft · 🔮 speculative = our projection from NASA's stated cadence.

## Timeline at a glance

| Window | Mission | Type | Status | Confidence |
|---|---|---|---|---|
| 2026-Q2 | **Artemis II** (`ARTEMIS-II`) | crewed | flown | ✅ confirmed |
| 2026-Q4 → 2027-Q2 | **Moon Base II — Griffin-1** (`MOON-BASE-II`) | robotic | scheduled | 🟡 likely |
| 2027-Q1 → 2027-Q2 | **New Glenn return to flight** (`NEW-GLENN-RTF`) | robotic | delayed | 🟡 likely |
| 2027-Q1 → 2027-Q3 | **Moon Base I — Blue Moon MK1 "Endurance"** (`MOON-BASE-I`) | robotic | delayed | 🟡 likely |
| 2027-Q1 → 2027-Q3 | **Moon Base III — IM-3 "Trinity"** (`MOON-BASE-III`) | robotic | delayed | 🟡 likely |
| 2027-Q1 → 2027-Q3 | **Starship orbital propellant transfer demonstration** (`STARSHIP-PROP-TRANSFER-DEMO`) | robotic | planned | 🟡 likely |
| 2027-Q1 → 2027-Q4 | **CAPSTONE 02** (`CAPSTONE-02`) | robotic | scheduled | 🟡 likely |
| 2027-Q2 → 2027-Q4 | **Artemis III** (`ARTEMIS-III`) | crewed | scheduled | ✅ confirmed |
| 2027-Q3 → 2028-Q2 | **Blue Ghost Mission 2** (`BLUE-GHOST-M2`) | robotic | delayed | 🟡 likely |
| 2027-Q4 → 2028-Q2 | **Starship HLS uncrewed lunar landing demo** (`STARSHIP-HLS-UNCREWED-LANDING`) | robotic | planned | 🟡 likely |
| 2027-Q4 → 2028-Q2 | **VIPER (Volatiles Investigating Polar Exploration Rover)** (`VIPER`) | robotic | planned | 🟡 likely |
| 2027-Q4 → 2028-Q3 | **Blue Moon MK2 uncrewed lunar landing demo** (`BLUE-MOON-MK2-UNCREWED-LANDING`) | robotic | planned | 🟡 likely |
| 2027-Q4 → 2028-Q3 | **Lunar Terrain Vehicle delivery (Astrolab CLV-1 and Lunar Outpost Pegasus)** (`LTV-DELIVERY`) | robotic | scheduled | 🟡 likely |
| 2028-Q1 → 2028-Q4 | **Artemis IV** (`ARTEMIS-IV`) | crewed | scheduled | ✅ confirmed |
| 2028-Q1 → 2028-Q4 | **MoonFall** (`MOONFALL`) | robotic | planned | 🟡 likely |
| 2028-Q1 → 2029-Q2 | **Blue Ghost Mission 3** (`BLUE-GHOST-M3`) | robotic | planned | 🟡 likely |
| 2028-Q1 → 2029-Q4 | **Lunar Infrastructure Demo 1 (HALO-derived)** (`LID-1`) | robotic | planned | 🟡 likely |
| 2028-Q1 → 2030-Q4 | **NASA lunar comms and navigation relay constellation** (`LUNAR-RELAY-CONSTELLATION`) | robotic | proposed | 🔮 speculative |
| 2028-Q2 → 2029-Q1 | **Peregrine Mission Two** (`PEREGRINE-2`) | robotic | planned | 🟡 likely |
| 2028-Q2 → 2029-Q1 | **Peregrine Mission Three** (`PEREGRINE-3`) | robotic | planned | 🟡 likely |
| 2028-Q3 → 2029-Q2 | **Artemis V** (`ARTEMIS-V`) | crewed | scheduled | 🟡 likely |
| 2028-Q3 → 2029-Q2 | **Firefly and Intuitive Machines Moon Base deliveries (late 2028)** (`CLPS-2028-OTHER`) | robotic | planned | 🟡 likely |
| 2028-Q3 → 2029-Q4 | **Lunar Infrastructure Demo 2 (HALO-derived)** (`LID-2`) | robotic | planned | 🟡 likely |
| 2029-Q1 → 2029-Q4 | **Artemis VI (projected)** (`ARTEMIS-VI`) | crewed | proposed | 🔮 speculative |
| 2029-Q1 → 2029-Q4 | **Lunar Infrastructure Demo 3 (HALO-derived)** (`LID-3`) | robotic | planned | 🟡 likely |
| 2029-Q1 → 2032-Q4 | **Canadarm3 repurposed for surface robotics** (`CANADARM3-SURFACE`) | robotic | proposed | 🔮 speculative |
| 2029-Q3 → 2030-Q4 | **Artemis VII (projected)** (`ARTEMIS-VII`) | crewed | proposed | 🔮 speculative |
| 2029-Q3 → 2031-Q4 | **JAXA/Toyota pressurised rover ("Lunar Cruiser")** (`JAXA-PRESSURIZED-ROVER`) | robotic | planned | 🔮 speculative |
| 2029-Q3 → 2032-Q4 | **First surface habitat (Phase 2 "Build and Expand")** (`MOON-BASE-PHASE-2-HABITAT`) | robotic | proposed | 🔮 speculative |
| 2030-Q1 → 2030-Q4 | **Artemis VIII (projected)** (`ARTEMIS-VIII`) | crewed | proposed | 🔮 speculative |
| 2030-Q1 → 2032-Q4 | **Lunar Fission Surface Power reactor** (`FISSION-SURFACE-POWER`) | robotic | planned | 🔮 speculative |

## World state (program-level facts)

- **gateway_paused** (✅ confirmed): Lunar Gateway was paused "in its current form" on 2026-03-24 (several outlets call it effectively cancelled). Orion now docks with landers directly; there is no NRHO station in the plan. HALO hardware is being converted by Northrop Grumman into three Lunar Infrastructure Demo (LID) surface missions. PPE is being repurposed as the propulsion element of the SR-1 Freedom nuclear-electric spacecraft (~Dec 2028, not lunar). ESA continues I-Hab through critical design review and decides on repurposing at its Dec 2026 interim ministerial. CSA repurposes Canadarm3 for surface robotics. _Sources: [Spaceflight Now](https://spaceflightnow.com/2026/03/25/nasa-outlines-ambitious-20-billion-plan-for-moon-base/), [Spaceflight Now](https://spaceflightnow.com/2026/08/06/nasa-northrop-grumman-repurpose-gateway-elements-for-moon-base-demo-missions/), [Scientific American](https://www.scientificamerican.com/article/nasa-unveils-new-ambitious-moon-base-plans/), [NASASpaceFlight](https://www.nasaspaceflight.com/2026/03/nasa-moon-base-pivots-gateway/), [European Spaceflight](https://europeanspaceflight.com/esa-details-next-steps-for-agencys-gateway-contributions/), [MDA Space](https://mda.space/article/mda-space-responds-to-canadian-space-agency-announcement-on-canadarm3)_
- **sls_block1_only** (✅ confirmed): SLS Block 1B, Block 2, the Exploration Upper Stage and Mobile Launcher 2 were cancelled (announced 2026-02-26/27). SLS stays near-Block 1. For Artemis IV NASA is weighing the existing ICPS or a stretched Centaur V upper stage. NASA has said it intends to move crews to commercial launchers after the current SLS flights; which vehicle is not decided. _Sources: [NASA](https://www.nasa.gov/directorates/esdmd/nasa-strengthens-artemis-adds-mission-refines-overall-architecture/), [SatNews](https://satnews.com/2026/02/27/nasa-overhauls-artemis-program-scraps-sls-upgrades-adds-2027-leo-test-mission/), [NASA](https://www.nasa.gov/missions/artemis/nasa-shares-plans-to-accelerate-artemis-return-to-moon/)_
- **moon_base_program** (✅ confirmed): NASA "Moon Base" program announced at the Ignition event 2026-03-24: about $20B over seven years (Isaacman; Scientific American reported $30B by 2036), three phases at the south pole. Phase 1 "Now–2029" gain access / experiment / learn; Phase 2 2029–2032 "Build and Expand" (habitats, regular surface ops); Phase 3 2032+ "Live and Work on the Moon" (fission + solar power, crewed and uncrewed rovers, site-prep machines, surface comms network, lunar GPS, relay and observation constellations). _Sources: [Spaceflight Now](https://spaceflightnow.com/2026/03/25/nasa-outlines-ambitious-20-billion-plan-for-moon-base/), [NASA](https://www.nasa.gov/moonbase-phases/), [Scientific American](https://www.scientificamerican.com/article/nasa-unveils-new-ambitious-moon-base-plans/)_
- **landing_cadence** (🟡 likely): Isaacman's stated goal is crewed landings about every six months with at least two lander providers. NASA's March architecture note said "about one lunar mission per year" after Artemis V. Treat two-per-year as the aspiration and one-per-year as the baseline. _Sources: [Spaceflight Now](https://spaceflightnow.com/2026/03/25/nasa-outlines-ambitious-20-billion-plan-for-moon-base/), [NASA](https://www.nasa.gov/directorates/esdmd/nasa-strengthens-artemis-adds-mission-refines-overall-architecture/)_
- **clps_cadence** (🟡 likely): Isaacman wants about 10 CLPS deliveries per year for three years starting 2027. NASA (Aug 2026): Phase I includes "more than twenty robotic landings" through 2029. CLPS 2.0 RFP released 2026-05-15 (responses due 2026-06-30). Every CLPS task order so far has slipped substantially; schedule all robotic missions with slack. _Sources: [SpacePolicyOnline](https://spacepolicyonline.com/news/nasa-awards-initial-moon-base-rover-and-lander-contracts/), [NASA](https://www.nasa.gov/news-release/nasa-provides-update-on-moon-base-rovers-landers-missions/), [NASA](https://www.nasa.gov/missions/moon-base/nasa-provides-updates-on-moon-base-cargo-landers-tech-demonstrations/)_
- **two_lander_strategy** (✅ confirmed): Both SpaceX Starship HLS and Blue Origin Blue Moon MK2 are in the plan; neither is assigned to a specific landing as of 2026-10-23. Starship reaches the Moon by refuelling in LEO (tanker count estimates range 6–8 to 22) and then carries itself to low lunar orbit to meet Orion. Blue Moon MK2 uses three Blue Moon MK1 derived transfer stages to reach an elliptical polar lunar orbit. Each provider must fly one uncrewed landing before a crewed one. _Sources: [NASA](https://www.nasa.gov/missions/artemis/nasa-partners-accelerate-lander-development-for-2028-moon-missions/), [SpacePolicyOnline](https://spacepolicyonline.com/news/nasa-is-full-steam-ahead-on-artemis-iii-iv-and-v/), [SatNews](https://satnews.com/2026/11/03/nasa-graphic-outlines-artemis-iv-starship-refueling-architecture-as-launch-estimates-vary/)_
- **surface_ops_first_landings** (✅ confirmed): Two crew descend, two stay in Orion. First landings target two moonwalks totalling about two hours, in a simplified Axiom "sortie" suit. _Sources: [SpacePolicyOnline](https://spacepolicyonline.com/news/nasa-is-full-steam-ahead-on-artemis-iii-iv-and-v/), [NASA](https://www.nasa.gov/missions/artemis/nasa-shares-plans-to-accelerate-artemis-return-to-moon/)_
- **south_pole_site_open** (🟡 likely): South pole remains the target. NASA says robotic data is still needed before choosing a crew landing site. A NASEM report (Oct 2026) proposed four non-polar sites; Isaacman called an Apollo-site return "very cool at some point." _Sources: [SpacePolicyOnline](https://spacepolicyonline.com/news/nasa-is-full-steam-ahead-on-artemis-iii-iv-and-v/)_
- **fission_power_2030** (🔮 speculative): NASA and DOE goal (MOU, Jan 2026): a lunar surface fission reactor by 2030, about 40 kWe class, 10+ year life. NASA paused the draft solicitation to reassess its approach (2026-03-26); no flight award as of 2026-11-07. Treat 2030 as a stretch. _Sources: [DOE](https://www.energy.gov/articles/us-department-energy-and-nasa-develop-lunar-surface-reactor-2030), [Lockheed Martin](https://www.lockheedmartin.com/en-us/news/features/2026/fission-surface-power-endless-power-in-the-lunar-night.html), [NASA](https://www.nasa.gov/glenn/fsps)_
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
- **Flight plan:**
  - FD1 (Apr 1): launch 6:35 pm EDT from LC-39B; perigee raise; upper-stage apogee raise to ~70,000 km; ~70 min manual proximity ops around the upper stage
  - FD2: translunar injection by Orion's service module (5 min 50 s burn)
  - FD3–5: outbound coast; one 17.5 s correction burn on FD5 (two planned burns cancelled); manual piloting demo on FD4
  - FD6 (Apr 6): far-side flyby at 6,545 km altitude; record 406,771 km from Earth; ~40 min loss of signal
  - FD7–9: return coast with correction burns
  - FD10 (Apr 10): final burn, crew/service module separation, entry, splashdown 8:07 pm EDT off San Diego
- **Toward the base:** Validates the crew transport leg every later base mission depends on.
- **Contract hooks:**
  - {'Historical/tutorial contract': 'crewed lunar free-return flyby with 4 crew and ocean recovery.'}
- **Sources:** [NASA](https://www.nasa.gov/blogs/missions/2026/04/10/artemis-ii-flight-day-10-crew-sets-for-final-burn-splashdown/), [Wikipedia](https://en.wikipedia.org/wiki/Artemis_II), [NASA](https://www.nasa.gov/news-release/nasa-welcomes-record-setting-artemis-ii-moonfarers-back-to-earth/)

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

### New Glenn return to flight  
`NEW-GLENN-RTF` · robotic · delayed · 🟡 likely

- **Target:** Early 2027 (reports cite January 2027)
- **Provider:** Blue Origin
- **Launch vehicle:** New Glenn
- **Destination:** Earth orbit (first payload reported as Blue Ring 1 or an Amazon Leo batch; unclear)
- **Objectives:**
  - Fly again after the 2026-05-28 pad explosion and LC-36 rebuild
- **Toward the base:** Gates every Blue Moon MK1 delivery (Moon Base I, VIPER, LTVs) and Blue Moon MK2.
- **Contract hooks:**
  - World event, not a player contract. Hold Blue-Origin-delivered contracts until it completes.
- **Notes:** Added in v2 because three NASA lunar deliveries depend on it.
- **Sources:** [Spaceflight Now](https://spaceflightnow.com/2026/05/29/blue-origins-new-glenn-rocket-explodes-during-prelaunch-testing-at-cape-canaveral/), [Spaceflight Now](https://spaceflightnow.com/2026/08/06/blue-origin-identifies-engine-issue-behind-new-glenn-explosion/), [New Space Economy (citing Reuters)](https://newspaceeconomy.ca/2026/10/16/why-is-blue-origins-new-glenn-rocket-now-expected-to-return-to-flight-in-2027/), [Wikipedia](https://en.wikipedia.org/wiki/List_of_New_Glenn_launches)

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
- **Flight plan:**
  - Before launch: Blue Moon MK2 test article launches on New Glenn and is checked out in orbit
  - Orion launches on SLS (no upper stage) to LEO; ~14-day mission, extendable to 17
  - ~FD3: Orion docks with Blue Moon; ~2 days of docked tests, crew enters the lander
  - ~FD6: Starship V3 test article launches; Orion undocks from Blue Moon and docks with Starship for ~2 hours, no crew entry
  - Remaining test objectives, deorbit and splashdown
- **Toward the base:** Proves the Orion-to-lander docking every crew rotation to the base will use.
- **Contract hooks:**
  - {'Multi-launch campaign contract': 'two target vehicles + crew vehicle, dock with both inside one mission.'}
  - Bonus for pressurised crew transfer into the first target.
- **Depends on:** `STARSHIP-PROP-TRANSFER-DEMO`
- **Notes:** Crew named 2026-06-09. Isaacman called the mid-2027 date "90 days broken to schedule" in September. Booster stacking finished mid-Oct 2026; core stage mated 2026-10-28.
- **Sources:** [Scientific American](https://www.scientificamerican.com/article/nasa-lays-out-a-packed-14-day-schedule-for-2027s-artemis-iii-moon-mission/), [NASA](https://www.nasa.gov/missions/artemis/nasa-shares-plans-to-accelerate-artemis-return-to-moon/), [SpacePolicyOnline](https://spacepolicyonline.com/news/nasa-is-full-steam-ahead-on-artemis-iii-iv-and-v/), [NASA](https://www.nasa.gov/blogs/missions/2026/10/13/nasa-completes-artemis-iii-booster-stacking-shares-status-update/)

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

### Moon Base II — Griffin-1  
`MOON-BASE-II` · robotic · scheduled · 🟡 likely

- **Target:** NASA (Oct 2026): late 2026; other reports NET January 2027
- **Provider:** Astrobotic (acquired by Voyager Technologies, agreement signed 2026-06-01)
- **Launch vehicle:** Falcon Heavy (LC-39A)
- **Spacecraft:** Griffin lander
- **Destination:** Nobile crater region near Mons Mouton, lunar south pole
- **Site:** Nobile crater region (-85.28, 53.27; low)
- **Payloads:** Astrolab FLIP rover; LDES (JSC); Lunar LiDAR Demonstration (Marshall); two LRAs (Goddard); METAL with Interlune (Ames); CubeRover; ESA LandCam-X
- **Objectives:**
  - Deliver a commercial rover to mature mobility for later LTV operations
- **Toward the base:** Early surface mobility and resource (helium-3/regolith) prospecting.
- **Contract hooks:**
  - Land a lander that deploys a small rover; rover drive-distance objective.
- **Notes:** Environmental testing at JPL finished 2026-10-13. Only CLPS mission still aiming for 2026. Not launched as of 2026-11-07.
- **Sources:** [NASA](https://www.nasa.gov/news-release/nasa-provides-update-on-moon-base-rovers-landers-missions/), [NASA](https://www.nasa.gov/moonbase-phases/), [NASA](https://www.nasa.gov/missions/moon-base/nasa-provides-progress-update-on-moon-base-rovers/), [Wikipedia](https://en.wikipedia.org/wiki/Griffin_Mission_One)

### Moon Base I — Blue Moon MK1 "Endurance"  
`MOON-BASE-I` · robotic · delayed · 🟡 likely

- **Target:** NET Q1 2027 (was NET fall 2026); depends on New Glenn return to flight
- **Provider:** Blue Origin
- **Launch vehicle:** New Glenn (LC-36)
- **Spacecraft:** Blue Moon MK1-101 cargo lander
- **Destination:** Shackleton connecting ridge, lunar south pole
- **Site:** Shackleton connecting ridge (Shackleton–de Gerlache ridge) (-89.5, -135.5; medium)
- **Payloads:** SCALPSS (plume-surface stereo cameras; Langley); Laser Retroreflector Array (Goddard)
- **Objectives:**
  - First Blue Moon landing; first privately funded lander mission (per Isaacman)
  - Image plume-surface interaction for later crew landings
- **Toward the base:** First hardware at the likely base region; characterises landing ejecta hazards.
- **Contract hooks:**
  - Uncrewed cargo landing on the Shackleton ridge; science bonus for plume imaging during descent.
- **Depends on:** `NEW-GLENN-RTF`
- **Notes:** Not launched as of 2026-11-07. New Glenn GS1-3 exploded in a static fire at LC-36 on 2026-05-28 (BE-4 main oxygen valve named 2026-08-06). Return to flight reported as early 2027 (Reuters, Oct 2026; a secondary report cites a January 2027 internal memo). In Sept 2026 NASA said MK1 Pathfinder 1 slipped to 2027.
- **Sources:** [NASA](https://www.nasa.gov/news-release/nasa-provides-update-on-moon-base-rovers-landers-missions/), [NASA](https://www.nasa.gov/moonbase-phases/), [Spaceflight Now](https://spaceflightnow.com/2026/05/29/blue-origins-new-glenn-rocket-explodes-during-prelaunch-testing-at-cape-canaveral/), [Spaceflight Now](https://spaceflightnow.com/2026/08/06/blue-origin-identifies-engine-issue-behind-new-glenn-explosion/), [Wikipedia](https://en.wikipedia.org/wiki/List_of_New_Glenn_launches)

### Moon Base III — IM-3 "Trinity"  
`MOON-BASE-III` · robotic · delayed · 🟡 likely

- **Target:** NET Q1 2027 (NASA, Sept 2026: first part of 2027)
- **Provider:** Intuitive Machines
- **Launch vehicle:** Falcon 9 (LC-39A)
- **Spacecraft:** Nova-C lander (CP-11)
- **Destination:** Reiner Gamma (lunar swirl, near side, non-polar)
- **Site:** Reiner Gamma (Lunar Vertex site) (7.585, -58.725; high)
- **Payloads:** Lunar Vertex (JHU/APL; PRISM) with a Lunar Outpost rover; CADRE rovers; LDES; Altus-1 relay satellite; NavCube3-mini; ESA MoonLIGHT; KASI LUSEM
- **Objectives:**
  - Study lunar swirl magnetism; deploy a relay satellite (12 payloads total per NASA, Aug 2026)
- **Toward the base:** First piece of lunar relay/navigation infrastructure.
- **Contract hooks:**
  - Land at a non-polar science site, deploy small rovers, and put a relay satellite into lunar orbit.
- **Notes:** Not launched as of 2026-11-07.
- **Sources:** [NASA](https://www.nasa.gov/news-release/nasa-provides-update-on-moon-base-rovers-landers-missions/), [NASA](https://www.nasa.gov/moonbase-phases/), [Wikipedia](https://en.wikipedia.org/wiki/IM-3)

### CAPSTONE 02  
`CAPSTONE-02` · robotic · scheduled · 🟡 likely

- **Target:** 2027 (announced 2026-07-24; CDR complete Aug 2026)
- **Provider:** Advanced Space (SBIR Phase III), spacecraft by Terran Orbital
- **Spacecraft:** Two ~400 kg spacecraft that can swap chaser and target roles
- **Destination:** Lunar orbit
- **Payloads:** LLNL optical payload; three NASA navigation software suites; CEPS radiation instrument
- **Objectives:**
  - Autonomous rendezvous and proximity operations in lunar orbit, analogous to Orion approaching a lander
- **Toward the base:** Navigation and rendezvous experience for crew-to-lander dockings in lunar orbit.
- **Contract hooks:**
  - Launch two small spacecraft to lunar orbit; perform rendezvous with each acting as chaser once.
- **Sources:** [NASA](https://www.nasa.gov/directorates/rtmd/nasa-announces-new-spacecraft-technology-demonstration-mission-at-moon/), [Advanced Space](https://advancedspace.com/advanced-space-completes-critical-design-review-milestone-for-capstone-02/)

### Blue Ghost Mission 2  
`BLUE-GHOST-M2` · robotic · delayed · 🟡 likely

- **Target:** NET 2027 (was NET Dec 2026)
- **Provider:** Firefly Aerospace
- **Launch vehicle:** Falcon 9
- **Spacecraft:** Blue Ghost lander + Elytra Dark orbiter (carries ESA Lunar Pathfinder relay)
- **Destination:** Lunar far side
- **Payloads:** LuSEE-Night radio telescope (NASA/DOE); JPL user terminal; SPIDER (Fleet Space); Rashid Rover 2 (UAE); Volta LightPort (Canada); ESA Lunar Pathfinder (on orbiter)
- **Objectives:**
  - First American far-side landing; far-side radio astronomy for up to 2 years
- **Toward the base:** Far-side comms relay experience.
- **Contract hooks:**
  - Far-side landing that only works if the relay orbiter is in place first.
- **Notes:** As of Oct 2026 the lander was still waiting on engines and propulsion parts.
- **Sources:** [NASA](https://www.nasa.gov/moonbase-phases/), [Wikipedia](https://en.wikipedia.org/wiki/Blue_Ghost_Mission_2), [Firefly Aerospace](https://fireflyspace.com/missions/blue-ghost-mission-2/)

### VIPER (Volatiles Investigating Polar Exploration Rover)  
`VIPER` · robotic · planned · 🟡 likely

- **Target:** Late 2027
- **Provider:** Blue Origin (second Blue Moon MK1)
- **Launch vehicle:** New Glenn
- **Spacecraft:** Blue Moon MK1-102 + VIPER rover
- **Destination:** Lunar south pole
- **Site:** Mons Mouton (VIPER mission area) (-85.42088, 31.6218; high)
- **Objectives:**
  - Map subsurface water ice and other volatiles in and near shadowed regions
- **Toward the base:** Ice survey that decides where the base and ISRU plant go.
- **Contract hooks:**
  - Drive a rover into/near a permanently shadowed region; survey N distinct points with a neutron/drill-style instrument.
- **Depends on:** `MOON-BASE-I`, `NEW-GLENN-RTF`
- **Notes:** Delivery is an option NASA exercises after reviewing Blue Moon MK1's first flight. NASA (2026-10-20) says VIPER is built and in final testing at JSC. Depends on New Glenn returning to flight.
- **Sources:** [NASA](https://www.nasa.gov/news-release/nasa-selects-blue-origin-to-deliver-viper-rover-to-moons-south-pole/), [NASA](https://www.nasa.gov/moonbase-phases/), [NASA](https://www.nasa.gov/missions/moon-base/nasa-provides-progress-update-on-moon-base-rovers/)

### Lunar Terrain Vehicle delivery (Astrolab CLV-1 and Lunar Outpost Pegasus)  
`LTV-DELIVERY` · robotic · scheduled · 🟡 likely

- **Target:** 2028, before the Artemis IV crew
- **Provider:** Blue Origin (delivery); Astrolab and Lunar Outpost (rovers)
- **Launch vehicle:** New Glenn
- **Spacecraft:** Blue Moon MK1-103 (cargo)
- **Destination:** Lunar south pole
- **Payloads:** Astrolab CLV-1 (~2,000 lb, >6 mph); Lunar Outpost Pegasus (>9 mph, up to 1 year ops, manual/autonomous/teleoperated)
- **Objectives:**
  - Pre-position unpressurised crew rovers that also run uncrewed between missions
- **Toward the base:** Core surface mobility for every crewed sortie and base logistics.
- **Contract hooks:**
  - Deliver a rover, then drive it teleoperated to a rendezvous point near the planned crew landing site.
- **Depends on:** `NEW-GLENN-RTF`
- **Notes:** Astrolab $219M, Lunar Outpost $220M, Blue Origin delivery $188M (+ $280.4M options). NASA specs (Oct 2026) — up to 3 moonwalks per mission, 80 kg payload, 10 km per charge, 6 km/day uncrewed. PDRs Oct 2026 (Lunar Outpost) and Dec 2026 (Astrolab); flight hardware due end of 2027.
- **Sources:** [NASA](https://www.nasa.gov/news-release/nasa-provides-update-on-moon-base-rovers-landers-missions/), [SpacePolicyOnline](https://spacepolicyonline.com/news/nasa-awards-initial-moon-base-rover-and-lander-contracts/), [NASA](https://www.nasa.gov/missions/moon-base/nasa-provides-progress-update-on-moon-base-rovers/)

### Artemis IV  
`ARTEMIS-IV` · crewed · scheduled · ✅ confirmed

- **Target:** Early 2028 (NASA: 2028)
- **Provider:** NASA (SLS / Orion) + SpaceX or Blue Origin lander (not yet assigned)
- **Launch vehicle:** SLS Block 1 (ICPS or stretched Centaur V upper stage, under study)
- **Spacecraft:** Orion + Starship HLS or Blue Moon MK2
- **Destination:** Lunar south pole region (final site pending robotic data)
- **Candidate sites:** Peak near Cabeus B (-83.6, -68.8; medium); Haworth (-86.7, -23.7; medium); Malapert Massif (-86.0, 0.3; medium); Mons Mouton (VIPER mission area) (-85.42088, 31.6218; high); Mons Mouton Plateau (-84.6, 31.0; low); Nobile Rim 1 (-85.4, 39.0; low); Nobile Rim 2 (-83.9, 58.7; medium); de Gerlache Rim 2 (-88.5, -66.7; low); Slater Plain (-87.9, 115.0; low)
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
- **Notes:** NASA's Artemis IV page (Mar 2026) says two crew stay about a week near the south pole; the Oct 2026 briefing describes two moonwalks of ~2 hours total. Design contracts for a short stay first, longer optional. ULA was contracted in March 2026 for Centaur V upper stages (Artemis IV, V and a spare); the ICPS-vs-Centaur V choice is expected around summer 2027 and Centaur V needs Mobile Launcher changes. Original contracts gave Artemis III/IV to Starship and V to Blue Moon; NASA now says neither lander is tied to a mission. NASA OIG and GAO have warned 2028 is at risk.
- **Sources:** [NASA](https://www.nasa.gov/mission/artemis-iv/), [The Register](https://www.theregister.com/2026/03/09/nasa_centaur_v_sls/), [NASA](https://www.nasa.gov/missions/artemis/nasa-shares-plans-to-accelerate-artemis-return-to-moon/), [NASA](https://www.nasa.gov/missions/artemis/nasa-partners-accelerate-lander-development-for-2028-moon-missions/), [SpacePolicyOnline](https://spacepolicyonline.com/news/nasa-is-full-steam-ahead-on-artemis-iii-iv-and-v/), [SatNews](https://satnews.com/2026/11/03/nasa-graphic-outlines-artemis-iv-starship-refueling-architecture-as-launch-estimates-vary/), [NASA](https://www.nasa.gov/directorates/esdmd/nasa-strengthens-artemis-adds-mission-refines-overall-architecture/)

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
`BLUE-GHOST-M3` · robotic · planned · 🟡 likely

- **Target:** 2028
- **Provider:** Firefly Aerospace
- **Destination:** Gruithuisen Domes (near side)
- **Site:** Gruithuisen Domes (Mons Gruithuisen Gamma) (36.45715, -40.79602; high)
- **Toward the base:** Science on non-mare volcanism; extra CLPS delivery capacity.
- **Contract hooks:**
  - CLPS delivery to the Gruithuisen Domes.
- **Notes:** Awarded Dec 2024 ($179.6M) to the Gruithuisen Domes. Separate from Firefly's June 2026 Moon Base award.
- **Sources:** [SpaceNexus (secondary tracker)](https://spacenexus.us/programs/clps), [NASA](https://www.nasa.gov/news-release/nasa-awards-more-moon-base-science-previews-new-opportunities/)

### NASA lunar comms and navigation relay constellation  
`LUNAR-RELAY-CONSTELLATION` · robotic · proposed · 🔮 speculative

- **Target:** Planned (June 2026 release); no dates
- **Provider:** TBD
- **Destination:** Lunar orbit
- **Objectives:**
  - Relay and navigation coverage for south-pole and far-side operations (Phase 3 adds a lunar GPS)
- **Toward the base:** Continuous comms with the base and rovers; enables teleoperation.
- **Contract hooks:**
  - Place N relay satellites so a south-pole site has continuous coverage.
- **Notes:** Only announced as a plan. ESA is studying its Lunar Link element as part of Moonlight.
- **Sources:** [NASA](https://www.nasa.gov/news-release/nasa-awards-more-moon-base-science-previews-new-opportunities/), [Spaceflight Now](https://spaceflightnow.com/2026/03/25/nasa-outlines-ambitious-20-billion-plan-for-moon-base/)

### Peregrine Mission Two  
`PEREGRINE-2` · robotic · planned · 🟡 likely

- **Target:** By end of 2028
- **Provider:** Astrobotic
- **Spacecraft:** Peregrine lander
- **Destination:** Gruithuisen Domes (near side)
- **Site:** Gruithuisen Domes (Mons Gruithuisen Gamma) (36.45715, -40.79602; high)
- **Payloads:** LETS radiation spectrometer; SCALPSS; LRA
- **Toward the base:** Radiation environment data for crew dose planning.
- **Contract hooks:**
  - Non-polar science landing; radiation-monitoring experiment running for N days.
- **Notes:** Site confirmed in Astrobotic's 2026-06-30 release ("an autonomous landing near the Gruithuisen Domes"). NASA's own pages have not named the site yet. Payloads LETS, SCALPSS, LRA.
- **Sources:** [Astrobotic](https://www.astrobotic.com/astrobotic-awarded-2-nasa-contracts-for-clps-moon-base-missions/), [Wikipedia](https://en.wikipedia.org/wiki/Commercial_Lunar_Payload_Services)

### Peregrine Mission Three  
`PEREGRINE-3` · robotic · planned · 🟡 likely

- **Target:** By end of 2028
- **Provider:** Astrobotic
- **Spacecraft:** Peregrine lander
- **Destination:** Gruithuisen Domes (near side)
- **Site:** Gruithuisen Domes (Mons Gruithuisen Gamma) (36.45715, -40.79602; high)
- **Payloads:** LETS radiation spectrometer; SCALPSS; LRA
- **Toward the base:** Science and environment data.
- **Contract hooks:**
  - Second landing at the same site; precision landing near Peregrine-2.
- **Notes:** Same site and payloads as PEREGRINE-2 per Astrobotic's release.
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

### Firefly and Intuitive Machines Moon Base deliveries (late 2028)  
`CLPS-2028-OTHER` · robotic · planned · 🟡 likely

- **Target:** Late 2028
- **Provider:** Firefly Aerospace (one Blue Ghost, $144.2M) and Intuitive Machines (one Nova-C, $148.3M)
- **Destination:** Not announced
- **Payloads:** SCALPSS; LRA; LETS (same three NASA instruments on each of the four June 2026 awards)
- **Objectives:**
  - Two more deliveries from the 2026-06-30 award (the other two are PEREGRINE-2 and PEREGRINE-3)
- **Toward the base:** Plume, navigation and radiation data at more sites before crews land.
- **Contract hooks:**
  - Generic CLPS delivery contract (see clps_template); two instances, different providers.
- **Notes:** One entry covers two missions until NASA names them or their sites. NASA also mentioned a plan for 17 surface deliveries and a lunar relay constellation in the same release.
- **Sources:** [NASA](https://www.nasa.gov/news-release/nasa-awards-more-moon-base-science-previews-new-opportunities/), [Astrobotic](https://www.astrobotic.com/astrobotic-awarded-2-nasa-contracts-for-clps-moon-base-missions/)

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

### Canadarm3 repurposed for surface robotics  
`CANADARM3-SURFACE` · robotic · proposed · 🔮 speculative

- **Target:** Announced Aug 2026; no dates
- **Provider:** MDA Space
- **Destination:** Lunar south pole base site
- **Objectives:**
  - Surface robotic arm for cargo handling, infrastructure, inspection and crew assistance
- **Toward the base:** Unloading landers and assembling base elements.
- **Contract hooks:**
  - Deliver a robotic arm module; later contracts require unloading cargo landers without EVA.
- **Notes:** Repurposed from the paused Gateway. CSA's separate lunar utility rover is still in concept studies.
- **Sources:** [MDA Space](https://mda.space/article/mda-space-responds-to-canadian-space-agency-announcement-on-canadarm3), [SpaceQ](https://spaceq.ca/canadian-space-agency-confirms-continuation-of-canadarm3-space-robotics-program/)

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

### JAXA/Toyota pressurised rover ("Lunar Cruiser")  
`JAXA-PRESSURIZED-ROVER` · robotic · planned · 🔮 speculative

- **Target:** Toyota: JAXA hopes for 2029 launch; older JAXA material: 2031, for Artemis VII+
- **Provider:** Toyota
- **Destination:** Lunar south pole base site
- **Objectives:**
  - Pressurised crew rover for multi-day traverses without suits
- **Toward the base:** Long-range crewed mobility; a mobile habitat before fixed habitats exist.
- **Contract hooks:**
  - Deliver a pressurised rover; crew lives in it for N days on a traverse between two sites.
- **Notes:** Japan's 2024 agreement with NASA trades this rover for crew seats. No 2026 re-baseline found.
- **Sources:** [Toyota Times](https://toyotatimes.jp/en/toyota_news/1039.html), [JST Science Japan](https://sj.jst.go.jp/stories/2024/s0124-01p.html)

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

### Lunar Fission Surface Power reactor  
`FISSION-SURFACE-POWER` · robotic · planned · 🔮 speculative

- **Target:** By 2030 (NASA/DOE goal); procurement being reassessed
- **Provider:** TBD (prior design studies: Lockheed Martin, Westinghouse, IX (Intuitive Machines/X-energy))
- **Destination:** Lunar south pole base site
- **Objectives:**
  - ~40 kWe reactor operating continuously for 10+ years
- **Toward the base:** The single most important enabler of permanent occupancy (lunar night and shadowed regions).
- **Contract hooks:**
  - Deliver a heavy reactor, place it a safe distance from the habitat site, run cable, activate.
- **Notes:** On 2026-03-26 NASA said it would reassess the development approach and set the draft Space Act Agreement solicitation inactive. A NASA-DOE space nuclear MOU took effect 2026-11-01. FY2026 appropriations include $250M. No flight award, so 2030 is now a stretch; downgraded to speculative in v2.
- **Sources:** [DOE](https://www.energy.gov/articles/us-department-energy-and-nasa-develop-lunar-surface-reactor-2030), [Lockheed Martin](https://www.lockheedmartin.com/en-us/news/features/2026/fission-surface-power-endless-power-in-the-lunar-night.html), [Scientific American](https://www.scientificamerican.com/article/nasa-unveils-new-ambitious-moon-base-plans/), [NASA](https://www.nasa.gov/glenn/fsps), [SpacePolicyOnline](https://spacepolicyonline.com/news/great-news-for-nasa-in-the-house-senate-fy2026-appropriations-report/)

## Landing sites

Selenographic degrees, longitude east-positive. Precision: high = published aim point or feature centre; medium = centre of NASA's LROC region mosaic; low = estimated. Use a landing radius of a few km for medium/low points.

| Site | Lat | Lon | Precision | Role | Basis |
|---|---|---|---|---|---|
| **Shackleton connecting ridge (Shackleton–de Gerlache ridge)** (`SP-CONNECTING-RIDGE`) | -89.5 | -135.5 | medium | Moon Base I target; recommended base anchor point | Centre of LROC NAC_DTM_SHACKRDGE02 (lat -89.63..-89.37, lon 209.8..239.1 E) |
| **Peak near Cabeus B** (`SP-PEAK-NEAR-CABEUS-B`) | -83.6 | -68.8 | medium | Artemis candidate region (2024) | LROC mosaic centre |
| **Haworth** (`SP-HAWORTH`) | -86.7 | -23.7 | medium | Artemis candidate region (2024) | LROC mosaic centre |
| **Malapert Massif** (`SP-MALAPERT-MASSIF`) | -86.0 | 0.3 | medium | Artemis candidate region (2024) | LROC mosaic centre |
| **Mons Mouton (VIPER mission area)** (`SP-MONS-MOUTON`) | -85.42088 | 31.6218 | high | Artemis candidate region (2024); VIPER traverse area; Griffin's original site | VIPER site analysis paper; ~5x4 km area on the south edge of Mons Mouton |
| **Mons Mouton Plateau** (`SP-MONS-MOUTON-PLATEAU`) | -84.6 | 31.0 | low | Artemis candidate region (2024) | Mountain summit position |
| **Nobile Rim 1** (`SP-NOBILE-RIM-1`) | -85.4 | 39.0 | low | Artemis candidate region (2024) | Eastern part of LROC combined Mouton/Nobile mosaic; estimated |
| **Nobile Rim 2** (`SP-NOBILE-RIM-2`) | -83.9 | 58.7 | medium | Artemis candidate region (2024) | LROC mosaic centre; a 2024 study's top site is -84.2016, 60.6999 |
| **de Gerlache Rim 2** (`SP-DE-GERLACHE-RIM-2`) | -88.5 | -66.7 | low | Artemis candidate region (2024) | Centre of LROC de Gerlache Rim mosaic covering Rim 1 and 2 |
| **Slater Plain** (`SP-SLATER-PLAIN`) | -87.9 | 115.0 | low | Artemis candidate region (2024) | ~20 km NE of Slater crater (-88.08, 111.29); estimated |
| **Peak near Shackleton** (`SP-PEAK-NEAR-SHACKLETON`) | -88.8 | 124.7 | medium | 2022 candidate region, dropped from the 2024 list | LROC mosaic centre |
| **Nobile crater region** (`SP-NOBILE-CRATER`) | -85.28 | 53.27 | low | Griffin-1 target region (no aim point published) | Nobile crater centre |
| **Reiner Gamma (Lunar Vertex site)** (`NS-REINER-GAMMA`) | 7.585 | -58.725 | high | Moon Base III (IM-3) target | Lunar Vertex team's chosen site, north edge of the central bright oval |
| **Gruithuisen Domes (Mons Gruithuisen Gamma)** (`NS-GRUITHUISEN-GAMMA`) | 36.45715 | -40.79602 | high | Blue Ghost M3 target; Peregrine 2/3 per Astrobotic | Lunar-VISE 100 m landing ellipse near the summit |

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
- `sfn-2026-05-29`: [Blue Origin's New Glenn rocket explodes during prelaunch testing at Cape Canaveral](https://spaceflightnow.com/2026/05/29/blue-origins-new-glenn-rocket-explodes-during-prelaunch-testing-at-cape-canaveral/) (Spaceflight Now, 2026-05-29)
- `sfn-2026-08-06-ng`: [Blue Origin identifies engine issue behind New Glenn explosion](https://spaceflightnow.com/2026/08/06/blue-origin-identifies-engine-issue-behind-new-glenn-explosion/) (Spaceflight Now, 2026-08-06)
- `newspace-2026-10-16`: [Why is Blue Origin's New Glenn rocket now expected to return to flight in 2027?](https://newspaceeconomy.ca/2026/10/16/why-is-blue-origins-new-glenn-rocket-now-expected-to-return-to-flight-in-2027/) (New Space Economy (citing Reuters), 2026-10-16)
- `wiki-new-glenn-launches`: [List of New Glenn launches](https://en.wikipedia.org/wiki/List_of_New_Glenn_launches) (Wikipedia, 2026-11)
- `wiki-griffin-1`: [Griffin Mission One](https://en.wikipedia.org/wiki/Griffin_Mission_One) (Wikipedia, 2026-11-05)
- `wiki-im-3`: [IM-3](https://en.wikipedia.org/wiki/IM-3) (Wikipedia, 2026-11)
- `wiki-blue-ghost-2`: [Blue Ghost Mission 2](https://en.wikipedia.org/wiki/Blue_Ghost_Mission_2) (Wikipedia, 2026-11)
- `firefly-bgm2`: [Blue Ghost Mission 2](https://fireflyspace.com/missions/blue-ghost-mission-2/) (Firefly Aerospace, 2026)
- `nasa-2026-10-20-rovers`: [NASA Provides Progress Update on Moon Base Rovers](https://www.nasa.gov/missions/moon-base/nasa-provides-progress-update-on-moon-base-rovers/) (NASA, 2026-10-20)
- `nasa-2026-06-30-clps`: [NASA Awards More Moon Base Science, Previews New Opportunities](https://www.nasa.gov/news-release/nasa-awards-more-moon-base-science-previews-new-opportunities/) (NASA, 2026-06-30)
- `nasa-2026-07-24-capstone2`: [NASA Announces New Spacecraft Technology Demonstration Mission at Moon](https://www.nasa.gov/directorates/rtmd/nasa-announces-new-spacecraft-technology-demonstration-mission-at-moon/) (NASA, 2026-07-24)
- `advancedspace-2026-08`: [Advanced Space Completes Critical Design Review Milestone for CAPSTONE 02](https://advancedspace.com/advanced-space-completes-critical-design-review-milestone-for-capstone-02/) (Advanced Space, 2026-08)
- `nasa-glenn-fsp`: [Fission Surface Power](https://www.nasa.gov/glenn/fsps) (NASA, 2026)
- `spo-fy2026-approps`: [Great News for NASA in the House-Senate FY2026 Appropriations Report](https://spacepolicyonline.com/news/great-news-for-nasa-in-the-house-senate-fy2026-appropriations-report/) (SpacePolicyOnline, 2026)
- `register-2026-03-09-centaur`: [NASA picks Centaur V for SLS](https://www.theregister.com/2026/03/09/nasa_centaur_v_sls/) (The Register, 2026-03-09)
- `nsf-2026-03-gateway`: [NASA Moon Base pivots away from Gateway](https://www.nasaspaceflight.com/2026/03/nasa-moon-base-pivots-gateway/) (NASASpaceFlight, 2026-03-24)
- `esf-2026-06-gateway`: [ESA details next steps for agency's Gateway contributions](https://europeanspaceflight.com/esa-details-next-steps-for-agencys-gateway-contributions/) (European Spaceflight, 2026-06)
- `mda-2026-08-06`: [MDA Space responds to Canadian Space Agency announcement on Canadarm3](https://mda.space/article/mda-space-responds-to-canadian-space-agency-announcement-on-canadarm3) (MDA Space, 2026-08-06)
- `spaceq-canadarm3`: [Canadian Space Agency confirms continuation of Canadarm3 space robotics program](https://spaceq.ca/canadian-space-agency-confirms-continuation-of-canadarm3-space-robotics-program/) (SpaceQ, 2026-08)
- `toyota-lunar-cruiser`: [Toyota Times: Lunar Cruiser (target launch 2029)](https://toyotatimes.jp/en/toyota_news/1039.html) (Toyota Times, 2023)
- `jst-2024-lunar-cruiser`: [Toyota pressurized lunar rover feature](https://sj.jst.go.jp/stories/2024/s0124-01p.html) (JST Science Japan, 2024-01)
- `nasa-2024-10-regions`: [NASA Provides Update on Artemis III Moon Landing Regions](https://www.nasa.gov/news-release/nasa-provides-update-on-artemis-iii-moon-landing-regions/) (NASA, 2024-10-28)
- `lroc-rdr`: [LROC NAC reduced data records (regional mosaics and DTMs)](https://data.lroc.im-ldi.com/lroc/view_rdr/) (Arizona State University LROC, 2026)
- `arxiv-2406-19863`: [Landing site analysis, Nobile Rim 2](https://arxiv.org/pdf/2406.19863) (Acta Astronautica (preprint), 2024)
- `jgr-2026-slater`: [Wueller et al., Slater Plain](https://agupubs.onlinelibrary.wiley.com/doi/10.1029/2025JE009434) (JGR Planets, 2026)
- `psj-viper-site`: [VIPER Site Analysis](https://iopscience.iop.org/article/10.3847/PSJ/ae061a) (Planetary Science Journal, 2025)
- `wiki-mons-mouton`: [Mons Mouton](https://en.wikipedia.org/wiki/Mons_Mouton) (Wikipedia, 2026-11)
- `wiki-reiner-gamma`: [Reiner Gamma](https://en.wikipedia.org/wiki/Reiner_Gamma) (Wikipedia, 2026-11)
- `jhuapl-lunar-vertex`: [Lunar Vertex](https://www.jhuapl.edu/news/news-releases/211118b-lunar-vertex) (JHU APL, 2021-11-18)
- `psj-lunar-vise`: [Lunar-VISE landing site paper](https://iopscience.iop.org/article/10.3847/PSJ/ae7d2c) (Planetary Science Journal, 2026)
- `firefly-bgm3`: [Blue Ghost Mission 3](https://fireflyspace.com/missions/blue-ghost-mission-3/) (Firefly Aerospace, 2026)
- `nasa-artemis-iv-page`: [Artemis IV](https://www.nasa.gov/mission/artemis-iv/) (NASA, 2026-03-16)
- `sciam-2026-10-23-a3-schedule`: [NASA lays out a packed 14-day schedule for 2027's Artemis III moon mission](https://www.scientificamerican.com/article/nasa-lays-out-a-packed-14-day-schedule-for-2027s-artemis-iii-moon-mission/) (Scientific American, 2026-10-23)
- `nasa-2026-04-10-fd10`: [Artemis II Flight Day 10: Crew Sets for Final Burn, Splashdown](https://www.nasa.gov/blogs/missions/2026/04/10/artemis-ii-flight-day-10-crew-sets-for-final-burn-splashdown/) (NASA, 2026-04-10)
- `nasa-2026-08-04-landers`: [NASA Provides Updates on Moon Base Cargo Landers, Tech Demonstrations](https://www.nasa.gov/missions/moon-base/nasa-provides-updates-on-moon-base-cargo-landers-tech-demonstrations/) (NASA, 2026-08-04)
