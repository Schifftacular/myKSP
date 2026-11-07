import type { TelemetryFrame } from './telemetry.js';

/**
 * Console positions in the Flight Control Room, named after the real JSC disciplines and mapped
 * to what KSP can actually report. See docs/environments/design.md §4.1.
 */
export type Position = 'FLIGHT' | 'FDO' | 'GNC' | 'PROP' | 'EECOM' | 'INCO' | 'CAPCOM';
export const POSITIONS: Position[] = ['FLIGHT', 'FDO', 'GNC', 'PROP', 'EECOM', 'INCO', 'CAPCOM'];

export const POSITION_TITLES: Record<Position, string> = {
  FLIGHT: 'Flight Director',
  FDO: 'Flight Dynamics',
  GNC: 'Guidance, Navigation & Control',
  PROP: 'Propulsion',
  EECOM: 'Electrical & Thermal',
  INCO: 'Instrumentation & Comm',
  CAPCOM: 'Capsule Communicator',
};

export type Level = 'nominal' | 'caution' | 'warning' | 'nodata';
export const LEVEL_RANK: Record<Level, number> = { nodata: 0, nominal: 1, caution: 2, warning: 3 };

export interface Check {
  position: Position;
  id: string;
  label: string;
  level: Level;
  detail: string;
}

/** Atmosphere top in metres for RSS bodies (approximate, RSS configs). Unknown bodies: 0. */
export const ATMOSPHERE_TOP: Record<string, number> = {
  Earth: 140_000, Mars: 125_000, Venus: 145_000, Titan: 600_000, Jupiter: 1_550_000,
};

export function atmosphereTop(body: string | null): number {
  return (body && ATMOSPHERE_TOP[body]) || 0;
}

function lvl(value: number | null, caution: number, warning: number, higherIsWorse = true): Level {
  if (value === null) return 'nodata';
  if (higherIsWorse) return value >= warning ? 'warning' : value >= caution ? 'caution' : 'nominal';
  return value <= warning ? 'warning' : value <= caution ? 'caution' : 'nominal';
}

const fmt = (v: number | null, digits = 1, unit = '') => (v === null ? 'no data' : `${v.toFixed(digits)}${unit}`);

/** Evaluate every limit check for one frame. Pure function: same frame, same result. */
export function evaluate(f: TelemetryFrame, opts: { commNet?: boolean | null } = {}): Check[] {
  const checks: Check[] = [];
  const add = (position: Position, id: string, label: string, level: Level, detail: string) =>
    checks.push({ position, id, label, level, detail });

  const inFlight = f.paused !== 5 && f.vessel.situation !== null;
  const atmo = atmosphereTop(f.vessel.body);
  const inAtmo = f.vessel.alt !== null && f.vessel.alt < atmo;

  // FDO: trajectory safety.
  const pe = f.orbit.pe;
  if (f.vessel.situation && /orbit|sub.?orbital|escap/i.test(f.vessel.situation) && pe !== null && f.vessel.alt !== null && f.vessel.alt > atmo) {
    const powered = (f.control.throttle ?? 0) > 0.05;
    let level: Level = pe < 0 ? 'warning' : pe < atmo ? 'caution' : 'nominal';
    // During a powered ascent or insertion burn a low periapsis is expected, not an alarm.
    if (powered && level !== 'nominal') level = 'nominal';
    const where = pe < 0 ? 'below surface' : pe < atmo ? 'inside atmosphere' : 'clear of atmosphere';
    add('FDO', 'pe', 'Periapsis', level, `Pe ${fmt(pe / 1000, 1, ' km')} ${where}${powered && pe < atmo ? ' (powered flight, expected)' : ''}`);
  } else {
    add('FDO', 'pe', 'Periapsis', pe === null ? 'nodata' : 'nominal', pe === null ? 'no data' : `Pe ${fmt(pe / 1000, 1, ' km')}`);
  }
  const tti = f.landing.timeToImpact;
  if (tti !== null && tti > 0 && f.vessel.vVert !== null && f.vessel.vVert < -5 && !inAtmo) {
    add('FDO', 'impact', 'Impact', lvl(tti, 120, 30, false), `Impact in ${tti.toFixed(0)} s`);
  }

  // GNC: loads and control.
  add('GNC', 'g', 'G-load', lvl(f.vessel.g, 4, 6), `${fmt(f.vessel.g, 2, ' g')}`);
  if (inAtmo && f.vessel.mach !== null && f.vessel.mach > 0.3) {
    add('GNC', 'aoa', 'Angle of attack', lvl(f.aero.aoa === null ? null : Math.abs(f.aero.aoa), 5, 10), `AoA ${fmt(f.aero.aoa, 1, '°')}`);
  }
  if (f.vessel.controllable === false) add('GNC', 'control', 'Control', 'warning', 'Vessel not controllable');

  // PROP: remaining capability.
  const dv = f.prop.totalDv;
  add('PROP', 'dv', 'Total Δv', dv === null ? 'nodata' : dv < 50 ? 'caution' : 'nominal', `${fmt(dv, 0, ' m/s')}`);

  // EECOM: power and heat.
  const ecFrac = f.power.ec !== null && f.power.ecMax ? f.power.ec / f.power.ecMax : null;
  add('EECOM', 'ec', 'Electric charge', lvl(ecFrac, 0.25, 0.1, false), ecFrac === null ? 'no data' : `${(ecFrac * 100).toFixed(0)} % of capacity`);
  if (f.paused === 2) add('EECOM', 'nopower', 'Power', 'warning', 'Telemetry reports NO ELECTRIC POWER');
  add('EECOM', 'heat', 'Hottest part', lvl(f.thermal.hottestRatio, 0.75, 0.9), f.thermal.hottestRatio === null ? 'no data' : `${(f.thermal.hottestRatio * 100).toFixed(0)} % of limit${f.thermal.hottestName ? ` (${f.thermal.hottestName})` : ''}`);
  if (inAtmo) add('EECOM', 'q', 'Dynamic pressure', lvl(f.vessel.q, 35, 50), `${fmt(f.vessel.q, 1, ' kPa')}`);

  // INCO: link.
  if (opts.commNet === false) {
    // With CommNet disabled in the save, Telemachus reports 0 % signal; that is not a fault.
    add('INCO', 'signal', 'Signal', 'nodata', 'CommNet is off in this save: no link model');
  } else {
    add('INCO', 'signal', 'Signal', lvl(f.comm.signal, 0.25, 0.05, false), f.comm.signal === null ? 'no data' : `${(f.comm.signal * 100).toFixed(0)} %`);
  }
  if (f.paused === 4) add('INCO', 'antenna', 'Antenna', 'warning', 'No antenna / no link');

  if (!inFlight) {
    // Out of the flight scene every check is meaningless; keep labels, drop levels.
    return checks.map((c) => ({ ...c, level: 'nodata' as Level, detail: c.detail }));
  }
  return checks;
}

/** Worst level per position, and FLIGHT as the roll-up of all. */
export function rollup(checks: Check[]): Record<Position, Level> {
  const out = Object.fromEntries(POSITIONS.map((p) => [p, 'nodata'])) as Record<Position, Level>;
  for (const c of checks) {
    if (LEVEL_RANK[c.level] > LEVEL_RANK[out[c.position]]) out[c.position] = c.level;
  }
  let worst: Level = 'nodata';
  for (const p of POSITIONS) if (LEVEL_RANK[out[p]] > LEVEL_RANK[worst]) worst = out[p];
  out.FLIGHT = worst;
  if (out.CAPCOM === 'nodata' && worst !== 'nodata') out.CAPCOM = 'nominal';
  return out;
}
