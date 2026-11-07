import { describe, expect, it } from 'vitest';
import {
  AscentSim, SolarSystem, analyzeFlight, elevationFrom, hohmann, keplerPos, lunarSunElevation, moonGeometry, newCountdown,
  parseBodyCfg, parseCraft, parseTestFlight, vehicleSuccess, parseElementEpoch, parseGroundStations, parseLoadmeta, parseTimeEpoch, realBodyName,
  startCount, summarizeCareer, tickCount, transferWindows, type Body, type TelemetryFrame,
} from '../src/index.js';

const SUN_GM = 1.32712440018e20;
const AU = 149_597_870_700;
const body = (name: string, index: number, parent: string | null, sma: number | null, gm: number, radius: number, m0 = 0, inc = 0): Body => ({
  name, index, parent, radius, gm, rotationPeriod: null, initialRotation: null, tidallyLocked: false,
  orbit: sma === null ? null : { sma, ecc: 0, inc, lan: 0, argPe: 0, m0 },
});

describe('body configs', () => {
  it('parses a Kopernicus body with its orbit and properties', () => {
    const cfg = `@Kopernicus:FOR[RealSolarSystem]
{
  Body
  {
    name = Moon
    flightGlobalsIndex = 10
    Orbit
    {
      referenceBody = Kerbin
      semiMajorAxis = 384308437
      eccentricity = 0.0554
      inclination = 28.36
      meanAnomalyAtEpochD = 169.7
    }
    Properties
    {
      radius = 1737100
      gravParameter = 4.9048695E12
      tidallyLocked = true
    }
  }
}`;
    const b = parseBodyCfg(cfg)!;
    expect(b.name).toBe('Moon');
    expect(b.index).toBe(10);
    expect(b.parent).toBe('Kerbin');
    expect(b.orbit!.sma).toBe(384308437);
    expect(b.tidallyLocked).toBe(true);
    // The solar system resolves stock parent names to RSS names.
    const sys = new SolarSystem([b, body('Earth', 1, 'Sun', AU, 3.986004418e14, 6371000)], 0);
    expect(sys.get('Moon')!.parent).toBe('Earth');
    expect(realBodyName('Kerbin')).toBe('Earth');
    expect(realBodyName('Mun')).toBe('Moon');
  });

  it('reads the RSSDateTime epoch and the element epoch', () => {
    expect(new Date(parseTimeEpoch('RSSTimeFormatter { epoch = 2000-01-01T00:00:00 }')!).toISOString()).toBe('2000-01-01T00:00:00.000Z');
    expect(parseElementEpoch('RSSKopernicusSettings\n{\n  Epoch = -1577843441.784\n}')).toBeCloseTo(-1577843441.784, 3);
  });

  it('propagates a circular orbit to the right place after a quarter period', () => {
    const o = { sma: AU, ecc: 0, inc: 0, lan: 0, argPe: 0, m0: 0 };
    const T = 2 * Math.PI * Math.sqrt(AU ** 3 / SUN_GM);
    const p = keplerPos(o, SUN_GM, T / 4);
    expect(p[0] / AU).toBeCloseTo(0, 6);
    expect(p[1] / AU).toBeCloseTo(1, 6);
  });
});

describe('trajectory design', () => {
  const sys = new SolarSystem([
    body('Sun', 0, null, null, SUN_GM, 696342000),
    body('Earth', 1, 'Sun', AU, 3.986004418e14, 6371000, 0),
    body('Mars', 11, 'Sun', 1.523679 * AU, 4.282837e13, 3389500, 90),
  ], 0);

  it('gives the textbook Earth→Mars Hohmann figures', () => {
    const h = hohmann(SUN_GM, AU, 1.523679 * AU);
    expect(h.dv1).toBeGreaterThan(2900);
    expect(h.dv1).toBeLessThan(3000);
    expect(h.tof / 86400).toBeGreaterThan(255);
    expect(h.tof / 86400).toBeLessThan(262);
    expect(h.phase).toBeCloseTo(44.3, 0);
  });

  it('finds departure windows about one synodic period (780 d) apart', () => {
    const ws = transferWindows(sys, 'Earth', 'Mars', 0, 6 * 365 * 86400, 3);
    expect(ws.length).toBeGreaterThanOrEqual(2);
    const gap = (ws[1].ut - ws[0].ut) / 86400;
    expect(gap).toBeGreaterThan(760);
    expect(gap).toBeLessThan(800);
  });

  it('puts the Sun overhead at the sub-solar point and on the horizon 90° away', () => {
    // Full moon (elongation 180): the near-side centre faces the Sun.
    expect(lunarSunElevation(180, true, 0, 0)).toBeCloseTo(90, 5);
    expect(lunarSunElevation(180, true, 0, 90)).toBeCloseTo(0, 5);
    // The poles always see the Sun near the horizon.
    expect(Math.abs(lunarSunElevation(90, true, -89.5, -135.5))).toBeLessThan(0.6);
  });

  it('computes Moon geometry when Earth and Moon orbits are present', () => {
    const s2 = new SolarSystem([
      body('Sun', 0, null, null, SUN_GM, 696342000),
      body('Earth', 1, 'Sun', AU, 3.986004418e14, 6371000),
      body('Moon', 10, 'Kerbin', 384_400_000, 4.9048695e12, 1737100, 0, 23),
    ], 0);
    const m = moonGeometry(s2, 86400 * 3)!;
    expect(m.dist).toBeCloseTo(384_400_000, -3);
    expect(m.illuminated).toBeGreaterThanOrEqual(0);
    expect(m.illuminated).toBeLessThanOrEqual(1);
    expect(Math.abs(m.dec)).toBeLessThan(23.5);
  });
});

describe('ground stations', () => {
  it('parses RealAntennas City2 nodes and computes elevation', () => {
    const st = parseGroundStations(`@Kopernicus:AFTER[RealSolarSystem]
{
  @Body[Earth]
  {
    @PQS
    {
      @Mods
      {
        City2
        {
          name = DSNTrackingStation
          objectName = DSS 14 - Goldstone
          lat = 35.43
          lon = -116.89
          alt = 1000
        }
      }
    }
  }
}`);
    expect(st).toEqual([{ name: 'DSS 14 - Goldstone', lat: 35.43, lon: -116.89, alt: 1000 }]);
    expect(elevationFrom(st[0], 35.43, -116.89, 400_000, 6_371_000)).toBeCloseTo(90, 0);
    expect(elevationFrom(st[0], -35.43, 63.11, 400_000, 6_371_000)).toBeLessThan(0);
  });
});

describe('craft files', () => {
  it('reads loadmeta and part positions with resource totals', () => {
    const meta = parseLoadmeta('shipName = Test Rocket\ntype = VAB\npartCount = 3\nstageCount = 2\ntotalMass = 12.5\ntotalCost = 4000\nshipSize = 3,20,3\n');
    expect(meta).toMatchObject({ name: 'Test Rocket', facility: 'VAB', partCount: 3, totalMass: 12.5, size: [3, 20, 3] });
    const craft = parseCraft(`ship = Test Rocket
PART
{
  part = tank_123
  pos = 0,10,0
  dstg = 1
  RESOURCE
  {
    name = LqdOxygen
    amount = 100
    maxAmount = 200
  }
}
PART
{
  part = engine_456
  pos = 0,2,0
  dstg = 1
  RESOURCE
  {
    name = LqdOxygen
    amount = 50
    maxAmount = 50
  }
}
PART
{
  part = capsule_789
  pos = 0,18,0
  dstg = 0
}`);
    expect(craft.parts.map((p) => p.name)).toEqual(['tank', 'engine', 'capsule']);
    expect(craft.resources.LqdOxygen).toEqual({ amount: 150, max: 250 });
    expect(craft.stages).toBe(2);
  });
});

describe('launch countdown', () => {
  it('stops at built-in holds and at the auto-sequence when the poll is not GO', () => {
    let c = startCount(newCountdown(-700, [-600], -33), 0);
    c = tickCount(c, 50, true, false);
    expect(c.state).toBe('counting');
    c = tickCount(c, 101, true, false);
    expect(c.state).toBe('hold');
    expect(c.tAtRef).toBe(-600);
    c = startCount(c, 200);
    c = tickCount(c, 200 + 570, false, false);
    expect(c.state).toBe('hold');
    expect(c.holdReason).toMatch(/poll/i);
  });

  it('counts a liftoff only during an active count', () => {
    const idle = newCountdown(-1200, [-600], -33);
    expect(tickCount(idle, 10, true, true).state).toBe('idle');
    const running = startCount(idle, 0);
    expect(tickCount(running, 5, true, true).state).toBe('launched');
  });
});

describe('flight analysis', () => {
  it('finds events, maxima and orbit in a simulated ascent', () => {
    const sim = new AscentSim();
    const frames: TelemetryFrame[] = [];
    for (let i = 0; i < 900 * 2; i++) { sim.step(0.5); frames.push(structuredClone(sim.frame())); }
    const a = analyzeFlight(frames, 300);
    expect(a.reachedOrbit).toBe(true);
    expect(a.events.map((e) => e.kind)).toContain('liftoff');
    expect(a.maxQ!.value).toBeGreaterThan(5);
    expect(a.series.length).toBeLessThanOrEqual(301);
  });
});

describe('TAC Life Support', () => {
  it('reads consumption rates from the save settings', () => {
    const c = summarizeCareer(`GAME
{
  PARAMETERS
  {
    TAC_SettingsParms_Sec2
    {
      FoodConsumptionRate = 6.7699998617172234E-05
      WaterConsumptionRate = 4.4799998954490379E-05
      OxygenConsumptionRate = 0.0068500003108271845
      ElectricityConsumptionRate = 0
    }
  }
}`);
    expect(c.tacRates!.food * 86400).toBeCloseTo(5.849, 2);
    expect(c.tacRates!.oxygen * 86400).toBeCloseTo(591.84, 1);
    expect(summarizeCareer('GAME\n{\n}').tacRates).toBeNull();
  });
});

describe('TestFlight reliability', () => {
  it('reads RO engine configs (name from the parent CONFIG) and RP2000 top-level blocks', () => {
    const ro = parseTestFlight(`@PART[ROE-Merlin1D]:FOR[RealismOverhaulEngines]
{
	MODULE
	{
		name = ModuleEngineConfigs
		CONFIG
		{
			name = Merlin1D
			TESTFLIGHT:NEEDS[TestLite|TestFlight]
			{
				testedBurnTime = 1620		//rated for 10 flights
				ratedBurnTime = 180
				thrustModifier
				{
					key = 0.00 0.05 0 0
				}
				ignitionReliabilityStart = 0.986146
				ignitionReliabilityEnd = 0.997813
				cycleReliabilityStart = 0.983701
				cycleReliabilityEnd = 0.997426
				techTransfer = Merlin1CVac,Merlin1C:50&Merlin1DVac:100
			}
		}
	}
}`);
    expect(ro).toHaveLength(1);
    expect(ro[0]).toMatchObject({ config: 'Merlin1D', ratedBurnTime: 180, testedBurnTime: 1620, ignitionStart: 0.986146, cycleEnd: 0.997426 });
    const rp = parseTestFlight(`@PART[*]:HAS[@MODULE[ModuleEngineConfigs]:HAS[@CONFIG[SE-1004]],!MODULE[TestFlightInterop]]:BEFORE[zTestFlight]
{
	TESTFLIGHT
	{
		name = SE-1004
		ratedBurnTime = 720
		ignitionReliabilityStart = 0.97
		ignitionReliabilityEnd = 0.99
		cycleReliabilityStart = 0.97
		cycleReliabilityEnd = 0.99
	}
}
@PART:HAS[@TESTFLIGHT]:FOR[zTestFlight]
{
	@TESTFLIGHT,*
	{
		@ignitionReliabilityStart *= -1
	}
}`);
    expect(rp.map((e) => e.config)).toEqual(['SE-1004']);
  });

  it('groups craft engines by config and stage and combines their odds', () => {
    const craft = parseCraft(`ship = Two Stage
PART
{
  part = ROE-Merlin1D_1
  istg = 1
  MODULE
  {
    name = ModuleEngineConfigs
    configuration = Merlin1D
  }
}
PART
{
  part = ROE-Merlin1D_2
  istg = 1
  MODULE
  {
    name = ModuleEngineConfigs
    configuration = Merlin1D
  }
}
PART
{
  part = sepMotor_3
  istg = 0
  MODULE
  {
    name = ModuleEnginesRF
  }
}`);
    expect(craft.engines).toEqual([{ part: 'ROE-Merlin1D', config: 'Merlin1D', count: 2, stage: 1 }, { part: 'sepMotor', config: null, count: 1, stage: 0 }]);
    const tf = { config: 'Merlin1D', ratedBurnTime: 180, testedBurnTime: null, ignitionStart: 0.9, ignitionEnd: 1, cycleStart: 0.9, cycleEnd: 1, techTransfer: null };
    const v = vehicleSuccess(craft.engines.map((e) => ({ ...e, tf: e.config ? tf : null })), false);
    expect(v.covered).toBe(2);
    expect(v.total).toBe(3);
    expect(v.p!).toBeCloseTo(0.81 ** 2, 10);
    // An escape tower saved with no engine module is still an engine if the install says so.
    const les = parseCraft('ship = X\nPART\n{\n  part = FASAApollo.LES_9\n  istg = 5\n}', new Set(['FASAApollo.LES']));
    expect(les.engines).toEqual([{ part: 'FASAApollo.LES', config: null, count: 1, stage: 5 }]);
  });
});
