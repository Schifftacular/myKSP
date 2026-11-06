# Making myKSP feel like running a NASA program

Research notes from the Artemis research thread. Each idea is tied to how NASA actually
runs Artemis today (late 2026), says what it does for gameplay, and flags what still needs
verifying. Ideas are proposals for the environments, contracts and mods threads; nothing
here is built yet.

Legend: **[V]** verified against a 2026 source in `artemis-manifest.yaml` · **[K]** general
NASA practice, well documented but not re-checked this pass · **[?]** needs research.

## 1. The program, not just the rocket

| Idea | Real-world basis | Gameplay value |
|---|---|---|
| **Program board with three phases** (Phase 1 access/experiment → Phase 2 build → Phase 3 live) that unlocks as milestones complete | NASA Moon Base phases: now–2029, 2029–2032, 2032+ **[V]** | Gives the career a visible spine toward the permanent base instead of a flat contract list |
| **Two-provider lander competition**: the player funds two lander lines; whichever passes its uncrewed landing first gets the first crew | Starship and Blue Moon MK2 both in plan, neither assigned; one uncrewed landing each required **[V]** | Meaningful risk/redundancy choices; mirrors real program management |
| **"Delivery as a service" contracts** where the player is the CLPS provider | CLPS model; ~10 deliveries/yr goal from 2027 **[V]** | Steady robotic income and site-survey data between crewed flights |
| **Schedule slip as a mechanic**: real target dates shown as "NET" and allowed to slip, with reputation cost scaled to how public the date was | Every CLPS order has slipped; Artemis III "90 days broken to schedule" **[V]** | Realistic pressure without hard failures |
| **Oversight events**: Aerospace Safety Advisory Panel and Inspector General reports flag risks (e.g. "only one uncrewed landing test") and can force an extra test flight or cost a budget penalty if ignored | ASAP and OIG findings on Artemis in 2026 **[V]** | Safety culture as a gameplay layer, not flavour text |
| **Fiscal year budget cycle** starting 1 October, with appropriations that can arrive late | US federal FY **[K]** | Long-term planning; ties to RP-1's budget model **[?] confirm RP-1 mechanics with the mods thread** |
| **Competitor timeline**: China's south-pole missions (Chang'e-7, crewed landing goal by 2030) as world events that raise political urgency | **[V]** | Narrative pressure that matches the real race framing |
| **Lessons-learned carry-over**: each flight writes findings that unlock reliability or procedure upgrades | NASA lessons-learned practice **[K]** | Rewards flying test missions (Artemis III-style) instead of skipping to landings |

## 2. Mission lifecycle the player actually walks through

1. **Mission definition** — objectives, crew size, lander provider, landing site shortlist. South-pole sites need robotic survey data first **[V]**, so site options unlock from CLPS/VIPER/MoonFall results.
2. **Crew assignment announcement** — four-person crews with international seats (ESA's Parmitano on Artemis III, CSA's Hansen on Artemis II) **[V]**. Partner seats can be earned through partner contracts.
3. **Hardware flow** — booster stacking, core-stage mate in VAB High Bay 3, Orion integration, rollout to LC-39B **[V]** for SLS flights. A build/stack timeline view is a strong candidate for the first immersive environment.
4. **Wet dress rehearsal** — Artemis II's WDR found a helium-flow issue that delayed launch **[V]**. A WDR step with a chance to discover faults is a good "realism with consequences" beat.
5. **Flight Readiness Review → launch countdown with built-in holds → go/no-go poll** **[K]**.
6. **Campaign execution** — multi-launch missions are the norm now: Artemis III needs three launches; a Starship landing needs many tanker flights (estimates 6–8 to 22) **[V]**. The UI must track a *campaign*, not a single vessel.
7. **Surface ops** — first landings: two crew down, two in Orion, two moonwalks of about two hours total **[V]**. EVA timelines with consumables are the core surface loop.
8. **Recovery and post-flight** — ocean splashdown and recovery (Artemis II off San Diego) **[V]**, then a post-flight report that feeds lessons-learned.

## 3. Mission Control and interfaces

- **Mission Elapsed Time and GMT side by side**, flight days ("FD3 docking") as the planning unit **[K]**. Artemis III's plan is expressed in flight days **[V]**.
- **Console positions as UI lenses** (Flight Director, CAPCOM, trajectory/FDO, systems) so the same telemetry is filtered for the job at hand **[K]**; **[?]** confirm current Orion-era position names before using them on screen.
- **Comm coverage as a constraint**: far-side and polar sites need relays (IM-3 deploys the Altus-1 relay, Blue Ghost M2 lands on the far side) **[V]**. Show the comm geometry; ties to RemoteTech/CommNet choices in the mod stack.
- **Lunar day/night and illumination** at the pole as a planning overlay: the reason NASA needs fission power and night-survivable hardware **[V]**.
- **Plain-language NASA vocabulary**: NET, L-minus, T-minus, scrub, recycle, MET, go/no-go, nominal, off-nominal, FRR **[K]**.

## 4. Base-building that follows NASA's logic

- **Survey before build**: VIPER ice maps, MoonFall drone hops and Griffin/FLIP rover drives reveal resources and hazards that decide the base site **[V]**.
- **Utility nodes first**: Northrop's three HALO-derived Lunar Infrastructure Demos (power, thermal, comms, night survival) are the template for the first base modules **[V]**.
- **Mobility before habitation**: LTVs delivered ahead of the Artemis IV crew **[V]**.
- **Power gates permanence**: a ~40 kWe fission reactor by 2030 is the hard prerequisite for permanent occupancy **[V]**. Make "survive a lunar night with crew" the boss fight of Phase 2.
- **Plume hazards**: SCALPSS on Blue Moon MK1 studies landing-plume ejecta **[V]**; base layout should keep landing pads a safe distance from habitats.

## 5. Brand and licensing caution

Using the NASA insignia ("meatball"), logotype ("worm") or mission patches in myKSP UI is
restricted by NASA's media usage guidelines, which forbid implying endorsement **[K]**;
**[?]** confirm current guidance before shipping any NASA mark, even in a private build that
might be shared. Recommended approach: an original agency identity styled after NASA's
design language (typography, colour discipline, flight-day nomenclature), and real mission
*names* only where they appear as historical/world data. Public-domain NASA imagery and
data are generally usable with credit **[K]**.

## 6. Live data candidates for keeping the game in sync

| Source | Use | Status |
|---|---|---|
| NASA Artemis blog and Moon Base pages | Primary schedule changes | Manual watch by research thread |
| Launch Library 2 (The Space Devs) API | Machine-readable launch dates for an in-game "real world" ticker | **[?]** check terms, rate limits and licence |
| NASA Image and Video Library | Reference imagery for environment art | **[?]** check usage terms per asset |
| JPL Horizons | Ephemerides if we ever sync real lunar lighting | **[?]** only if the environments thread needs it |

## Open research questions

- Which three companies / four missions did NASA select on 2026-06-30 beyond Astrobotic's two Peregrine flights?
- What happens to Gateway's PPE and ESA I-Hab? Partner contributions (ESA, JAXA, CSA) to the surface base.
- JAXA's pressurised rover timing and whether it falls before 2030.
- Artemis IV crew and which lander flies first; SLS upper stage choice for Artemis IV.
- Which commercial launcher carries crews after the current SLS flights.
