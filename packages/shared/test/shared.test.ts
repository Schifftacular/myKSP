import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  AscentSim, EventDetector, emptyFrame, evaluate, fromCompactLog, fromTelemachus, num, parseCfg, rollup,
  stageKeys, summarizeCareer, partName, type TelemetryFrame,
} from '../src/index.js';

const fixture = fs.readFileSync(path.join(__dirname, 'fixture.sfs'), 'utf8');

describe('ConfigNode parser', () => {
  it('parses nested nodes, repeated keys, comments, inline braces and CRLF', () => {
    const root = parseCfg('A\r\n{\r\n k = 1 // c\r\n k = 2\r\n B { x = y }\r\n}\r\n');
    const a = root.nodes[0];
    expect(a.name).toBe('A');
    expect(a.values).toEqual([['k', '1'], ['k', '2']]);
    expect(a.nodes[0]).toMatchObject({ name: 'B', values: [['x', 'y']] });
  });
  it('keeps values containing "=" intact', () => {
    expect(parseCfg('k = a=b').values).toEqual([['k', 'a=b']]);
  });
});

describe('career summary', () => {
  const c = summarizeCareer(fixture);
  it('reads program resources from their scenarios, not nested nodes', () => {
    expect(c.funds).toBeCloseTo(561953.93);
    expect(c.science).toBeCloseTo(13.9);
    expect(c.reputation).toBeCloseTo(42.5);
    expect(c.ut).toBeCloseTo(4861109.17);
    expect(c.mode).toBe('CAREER');
  });
  it('reads facilities', () => {
    expect(c.facilities).toEqual([{ id: 'LaunchPad', level: 0.5 }, { id: 'MissionControl', level: 1 }]);
  });
  it('splits contracts by state and decodes the values field', () => {
    expect(c.contracts.offered.map((x) => x.title)).toEqual(['Moon Orbit (Uncrewed)']);
    expect(c.contracts.active[0]).toMatchObject({ title: 'Artemis I: Uncrewed Lunar Flyby', fundsAdvance: 100000, fundsCompletion: 500000, science: 10, reputation: 50, dueUT: 67072000 });
    expect(c.contracts.offered[0]).toMatchObject({ fundsAdvance: 262500, dueUT: 5014509.13977185, parameters: [{ title: 'Achieve lunar orbit and receive data.', state: 'Incomplete' }] });
    expect(c.contracts.completedCount).toBe(1);
  });
  it('reads crew and vessels', () => {
    expect(c.crew.map((k) => `${k.name}:${k.trait}:${k.state}`)).toEqual(['Jebediah Kerman:Pilot:Available', 'Bill Kerman:Engineer:Assigned']);
    expect(c.vessels[0]).toMatchObject({ name: 'Pathfinder', situation: 'ORBITING', body: 1, met: 1234.5 });
  });

  const real = process.env.MYKSP_REAL_SAVE;
  it.skipIf(!real || !fs.existsSync(real ?? ''))('parses a real career save without throwing', () => {
    const s = summarizeCareer(fs.readFileSync(real!, 'utf8'));
    expect(s.mode).toBe('CAREER');
    expect(s.funds).not.toBeNull();
    expect(s.contracts.offered.length + s.contracts.active.length).toBeGreaterThan(0);
  });
});

describe('telemetry normalization', () => {
  it('treats Telemachus "NaN" strings and missing keys as null, never zero', () => {
    expect(num('NaN')).toBeNull();
    expect(num(undefined)).toBeNull();
    expect(num('12.5')).toBe(12.5);
    const f = fromTelemachus({ 'v.altitude': 'NaN', 'o.ApA': 1000 });
    expect(f.vessel.alt).toBeNull();
    expect(f.orbit.ap).toBe(1000);
    expect(f.vessel.lat).toBeNull();
  });
  it('falls back to the stage sum when dv.totalDVVac reports 0 during a burn', () => {
    const f = fromTelemachus({ 'dv.totalDVVac': 0, 'dv.stageCount': 2, 'dv.stageDVVac[0]': 1200, 'dv.stageDVVac[1]': 3400 });
    expect(f.prop.totalDv).toBe(4600);
    expect(f.prop.stages).toHaveLength(2);
  });
  it('treats "No Target Selected." as no target (seen live on Telemachus 1.7.0)', () => {
    const none = fromTelemachus({ 'tar.name': 'No Target Selected.', 'tar.distance': 0, 'tar.o.relativeVelocity': 0 });
    expect(none.target).toEqual({ name: null, distance: null, relVel: null });
    const some = fromTelemachus({ 'tar.name': 'Station', 'tar.distance': 1200 });
    expect(some.target.name).toBe('Station');
    expect(some.target.distance).toBe(1200);
  });
  it('rejects numeric hottest-part names', () => {
    expect(partName('1')).toBeNull();
    expect(partName('Upper Fuel Tank')).toBe('Upper Fuel Tank');
  });
  it('builds per-stage key lists', () => {
    expect(stageKeys(1)).toEqual(['dv.stageDVVac[0]', 'dv.stageTWRActual[0]', 'dv.stageBurnTime[0]', 'dv.stageFuelMass[0]']);
  });
  it('maps the compact Falcon 9 flight-log format', () => {
    const f = fromCompactLog({ ts: 1787379494.8, name: 'Falcon 9 REAL', sit: 'In flight', met: 88.96, alt: 12743, hot: '1', ap: 18616 });
    expect(f.source).toBe('replay');
    expect(f.vessel.alt).toBe(12743);
    expect(f.thermal.hottestName).toBeNull();
    expect(f.vessel.lat).toBeNull();
  });
});

function flying(p: Partial<TelemetryFrame['vessel']> = {}): TelemetryFrame {
  const f = emptyFrame('live');
  f.paused = 0;
  Object.assign(f.vessel, { name: 'T', body: 'Earth', situation: 'Flying', alt: 30000, mach: 2, g: 1.5, ...p });
  return f;
}

describe('limit checks', () => {
  it('flags low periapsis in orbit as caution and below-surface as warning', () => {
    const f = flying({ situation: 'Sub-Orbital', alt: 200000 });
    f.orbit.pe = 100000;
    expect(evaluate(f).find((c) => c.id === 'pe')!.level).toBe('caution');
    f.orbit.pe = -5000;
    expect(evaluate(f).find((c) => c.id === 'pe')!.level).toBe('warning');
  });
  it('does not alarm on a low periapsis while the engines are burning', () => {
    const f = flying({ situation: 'Sub-Orbital', alt: 200000 });
    f.orbit.pe = -5000000;
    f.control.throttle = 1;
    expect(evaluate(f).find((c) => c.id === 'pe')!.level).toBe('nominal');
  });
  it('rolls the worst position up to FLIGHT', () => {
    const f = flying({ g: 7 });
    const r = rollup(evaluate(f));
    expect(r.GNC).toBe('warning');
    expect(r.FLIGHT).toBe('warning');
  });
  it('reports no data, not nominal, outside the flight scene', () => {
    const f = flying({ g: 7 });
    f.paused = 5;
    expect(rollup(evaluate(f)).FLIGHT).toBe('nodata');
  });
});

describe('ascent simulator + event detector', () => {
  it('reaches a stable orbit and produces the expected callouts in order', () => {
    const sim = new AscentSim();
    const det = new EventDetector();
    const kinds: string[] = [];
    for (let i = 0; i < 900 * 4; i++) {
      sim.step(0.25);
      for (const e of det.push(sim.frame())) kinds.push(e.kind);
    }
    const f = sim.frame();
    expect(f.source).toBe('sim');
    expect(f.vessel.situation).toBe('Orbiting');
    expect(f.orbit.pe!).toBeGreaterThan(140_000);
    expect(f.orbit.inc!).toBeGreaterThan(27);
    expect(f.orbit.inc!).toBeLessThan(30);
    for (const k of ['liftoff', 'maxq', 'staging', 'atmo-exit', 'meco', 'orbit']) expect(kinds).toContain(k);
    expect(kinds.indexOf('liftoff')).toBeLessThan(kinds.indexOf('maxq'));
    expect(kinds.indexOf('maxq')).toBeLessThan(kinds.indexOf('orbit'));
  });
});
