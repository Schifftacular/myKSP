import { child, get, getNum, parseCfg } from './sfs.js';

/**
 * Celestial bodies as this install defines them (RealSolarSystem Kopernicus configs).
 *
 * RSS puts every body on a fixed Keplerian orbit, so propagating the configured elements gives
 * the same positions the game uses (no ephemeris guesswork). The reference plane is Earth's
 * equator: Earth's own orbit is inclined 23.44° to it. Element epoch: RSSKopernicusSettings
 * `Epoch` is the UT of the element epoch (RP2000: about -50 years, so UT 0 = 2000-01-01).
 */
export interface Body {
  name: string;
  index: number;
  parent: string | null;
  radius: number | null;
  gm: number | null;
  rotationPeriod: number | null;
  initialRotation: number | null;
  tidallyLocked: boolean;
  orbit: { sma: number; ecc: number; inc: number; lan: number; argPe: number; m0: number } | null;
}

export type Vec3 = [number, number, number];

const DEG = Math.PI / 180;

/** Parse one Kopernicus body config. Returns null for configs that are not a Body definition. */
export function parseBodyCfg(text: string): Body | null {
  const root = parseCfg(text);
  const kop = root.nodes.find((n) => n.name.startsWith('@Kopernicus'));
  const body = child(kop, 'Body');
  if (!body) return null;
  const name = get(body, 'cbNameLater') ?? get(body, 'name');
  const index = getNum(body, 'flightGlobalsIndex');
  if (!name || index === null) return null;
  const o = child(body, 'Orbit');
  const p = child(body, 'Properties');
  const n = (k: string) => getNum(o, k);
  const orbit = o && n('semiMajorAxis') !== null
    ? { sma: n('semiMajorAxis')!, ecc: n('eccentricity') ?? 0, inc: n('inclination') ?? 0, lan: n('longitudeOfAscendingNode') ?? 0, argPe: n('argumentOfPeriapsis') ?? 0, m0: n('meanAnomalyAtEpochD') ?? (n('meanAnomalyAtEpoch') ?? 0) / DEG }
    : null;
  return {
    name,
    index,
    parent: get(o, 'referenceBody') ?? null,
    radius: getNum(p, 'radius'),
    gm: getNum(p, 'gravParameter'),
    rotationPeriod: getNum(p, 'rotationPeriod'),
    initialRotation: getNum(p, 'initialRotation'),
    tidallyLocked: get(p, 'tidallyLocked') === 'true' || get(p, 'tidallyLocked') === 'True',
    orbit,
  };
}

/** Stock template names Kopernicus configs still use as `referenceBody`. */
export const STOCK_ALIASES: Record<string, string> = { Kerbin: 'Earth', Mun: 'Moon', Duna: 'Mars', Eve: 'Venus', Moho: 'Mercury', Jool: 'Jupiter' };

export class SolarSystem {
  readonly byName = new Map<string, Body>();
  readonly byIndex = new Map<number, Body>();

  /** `elementEpochUT`: UT at which meanAnomalyAtEpoch applies (RSSKopernicusSettings Epoch). */
  constructor(bodies: Body[], readonly elementEpochUT = 0) {
    for (const b of bodies) {
      const parent = b.parent ? STOCK_ALIASES[b.parent] ?? b.parent : null;
      const fixed = { ...b, parent };
      this.byName.set(b.name, fixed);
      this.byIndex.set(b.index, fixed);
    }
  }

  get(name: string) { return this.byName.get(name); }
  nameOf(index: number | null | undefined) { return index === null || index === undefined ? null : this.byIndex.get(index)?.name ?? null; }

  /** Position relative to the parent body at universal time `ut`, metres, reference frame = Earth equator. */
  relPos(name: string, ut: number): Vec3 | null {
    const b = this.byName.get(name);
    const parent = b?.parent ? this.byName.get(b.parent) : null;
    if (!b?.orbit || !parent?.gm) return null;
    return keplerPos(b.orbit, parent.gm, ut - this.elementEpochUT);
  }

  /** Position relative to the Sun (or the system root) at `ut`. */
  absPos(name: string, ut: number): Vec3 | null {
    let p: Vec3 = [0, 0, 0];
    let cur = this.byName.get(name);
    while (cur?.parent) {
      const r = this.relPos(cur.name, ut);
      if (!r) return null;
      p = add(p, r);
      cur = this.byName.get(cur.parent);
    }
    return p;
  }

  period(name: string): number | null {
    const b = this.byName.get(name);
    const parent = b?.parent ? this.byName.get(b.parent) : null;
    if (!b?.orbit || !parent?.gm) return null;
    return 2 * Math.PI * Math.sqrt(b.orbit.sma ** 3 / parent.gm);
  }
}

export function keplerPos(o: NonNullable<Body['orbit']>, gm: number, dt: number): Vec3 {
  const n = Math.sqrt(gm / o.sma ** 3);
  const M = ((o.m0 * DEG + n * dt) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
  let E = o.ecc < 0.8 ? M : Math.PI;
  for (let i = 0; i < 30; i++) {
    const d = (E - o.ecc * Math.sin(E) - M) / (1 - o.ecc * Math.cos(E));
    E -= d;
    if (Math.abs(d) < 1e-12) break;
  }
  const nu = 2 * Math.atan2(Math.sqrt(1 + o.ecc) * Math.sin(E / 2), Math.sqrt(1 - o.ecc) * Math.cos(E / 2));
  const r = o.sma * (1 - o.ecc * Math.cos(E));
  const u = o.argPe * DEG + nu;
  const W = o.lan * DEG, i = o.inc * DEG;
  return [
    r * (Math.cos(W) * Math.cos(u) - Math.sin(W) * Math.sin(u) * Math.cos(i)),
    r * (Math.sin(W) * Math.cos(u) + Math.cos(W) * Math.sin(u) * Math.cos(i)),
    r * Math.sin(u) * Math.sin(i),
  ];
}

export const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const norm = (a: Vec3) => Math.hypot(a[0], a[1], a[2]);
export const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const angleBetween = (a: Vec3, b: Vec3) => Math.acos(Math.max(-1, Math.min(1, dot(a, b) / (norm(a) * norm(b))))) / DEG;

/** Moon geometry seen from Earth: declination (°), distance (m), Sun–Earth–Moon elongation (°, 0 new, 180 full), waxing flag. */
export function moonGeometry(sys: SolarSystem, ut: number) {
  const m = sys.relPos('Moon', ut);
  const e = sys.relPos('Earth', ut);
  if (!m || !e) return null;
  const dist = norm(m);
  const dec = Math.asin(m[2] / dist) / DEG;
  const sunDir: Vec3 = [-e[0], -e[1], -e[2]];
  const elong = angleBetween(m, sunDir);
  const later = sys.relPos('Moon', ut + 3600)!;
  const elongLater = angleBetween(later, [-e[0], -e[1], -e[2]]);
  return { dec, dist, elongation: elong, waxing: elongLater > elong, illuminated: (1 - Math.cos(elong * DEG)) / 2 };
}

/**
 * Approximate Sun elevation at a lunar surface site. The Moon is tidally locked, so the
 * sub-solar selenographic longitude follows the phase (far-side centre at new moon, near-side
 * centre at full moon). Ignores libration and the ±1.5° sub-solar latitude, so treat values
 * within a few degrees of the horizon (the poles) as "grazing".
 */
export function lunarSunElevation(elongation: number, waxing: boolean, lat: number, lon: number): number {
  const subSolarLon = (waxing ? 1 : -1) * (180 - elongation);
  const c = Math.cos(lat * DEG) * Math.cos((lon - subSolarLon) * DEG);
  return Math.asin(Math.max(-1, Math.min(1, c))) / DEG;
}

/** Hohmann transfer between two circular coplanar orbits around a body with parameter gm. */
export function hohmann(gm: number, r1: number, r2: number) {
  const a = (r1 + r2) / 2;
  const dv1 = Math.abs(Math.sqrt(gm / r1) * (Math.sqrt((2 * r2) / (r1 + r2)) - 1));
  const dv2 = Math.abs(Math.sqrt(gm / r2) * (1 - Math.sqrt((2 * r1) / (r1 + r2))));
  const tof = Math.PI * Math.sqrt(a ** 3 / gm);
  // Phase angle the target must lead the origin by at departure.
  const phase = 180 - (tof / (2 * Math.PI * Math.sqrt(r2 ** 3 / gm))) * 360;
  return { dv1, dv2, tof, phase };
}

/** Heliocentric phase angle of `to` ahead of `from`, in the plane of motion, degrees in [-180, 180). */
export function phaseAngle(sys: SolarSystem, from: string, to: string, ut: number): number | null {
  const a = sys.relPos(from, ut), b = sys.relPos(to, ut);
  if (!a || !b) return null;
  const h = cross(a, sys.relPos(from, ut + 86400)!);
  const ang = angleBetween(a, b);
  const sign = dot(h, cross(a, b)) >= 0 ? 1 : -1;
  return sign * ang;
}

const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

/**
 * Next departure windows from `from` to `to` (both orbiting the same parent): times when the
 * actual phase angle matches the Hohmann phase. Searches `horizon` seconds ahead.
 */
export function transferWindows(sys: SolarSystem, from: string, to: string, ut: number, horizon: number, max = 3) {
  const A = sys.get(from), B = sys.get(to);
  const parent = A?.parent ? sys.get(A.parent) : null;
  if (!A?.orbit || !B?.orbit || !parent?.gm || A.parent !== B.parent) return [];
  const h = hohmann(parent.gm, A.orbit.sma, B.orbit.sma);
  const target = h.phase;
  const out: { ut: number; dv1: number; tof: number; phase: number }[] = [];
  const step = Math.max(3600, Math.min(sys.period(from)!, sys.period(to)!) / 720);
  let prev = wrap((phaseAngle(sys, from, to, ut) ?? 0) - target);
  for (let t = ut + step; t < ut + horizon && out.length < max; t += step) {
    const cur = wrap((phaseAngle(sys, from, to, t) ?? 0) - target);
    if (Math.sign(cur) !== Math.sign(prev) && Math.abs(cur - prev) < 90) {
      // Bisect to the crossing.
      let lo = t - step, hi = t;
      for (let k = 0; k < 40; k++) {
        const mid = (lo + hi) / 2;
        const v = wrap((phaseAngle(sys, from, to, mid) ?? 0) - target);
        if (Math.sign(v) === Math.sign(prev)) lo = mid; else hi = mid;
      }
      out.push({ ut: (lo + hi) / 2, dv1: h.dv1, tof: h.tof, phase: target });
    }
    prev = cur;
  }
  return out;
}

const wrap = (d: number) => ((((d + 180) % 360) + 360) % 360) - 180;

/** RSSDateTime epoch from `RSSTimeFormatter { epoch = 2000-01-01T00:00:00 }`. */
export function parseTimeEpoch(text: string): number | null {
  const m = /epoch\s*=\s*(\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2})?)/.exec(text);
  if (!m) return null;
  const ms = Date.parse(m[1].length === 10 ? `${m[1]}T00:00:00Z` : `${m[1]}Z`);
  return Number.isFinite(ms) ? ms : null;
}

/** RSSKopernicusSettings `Epoch = -1577843441.784`. */
export function parseElementEpoch(text: string): number | null {
  const m = /^\s*Epoch\s*=\s*(-?[\d.]+)/m.exec(text);
  return m ? Number(m[1]) : null;
}

export interface GroundStation { name: string; lat: number; lon: number; alt: number }

/** RealAntennas planet pack: `City2 { objectName = DSS 14 - Goldstone  lat = … lon = … alt = … }`. */
export function parseGroundStations(text: string): GroundStation[] {
  const out: GroundStation[] = [];
  const walk = (n: ReturnType<typeof parseCfg>) => {
    for (const c of n.nodes) {
      if (/^City2\b/.test(c.name) && get(c, 'objectName') && getNum(c, 'lat') !== null) {
        out.push({ name: get(c, 'objectName')!, lat: getNum(c, 'lat')!, lon: getNum(c, 'lon')!, alt: getNum(c, 'alt') ?? 0 });
      }
      walk(c);
    }
  };
  walk(parseCfg(text));
  return out;
}

/** Elevation (°) of a point at altitude `alt` above (lat, lon) as seen from a ground station, spherical body. */
export function elevationFrom(st: GroundStation, lat: number, lon: number, alt: number, radius: number): number {
  const toVec = (la: number, lo: number, r: number): Vec3 => [r * Math.cos(la * DEG) * Math.cos(lo * DEG), r * Math.cos(la * DEG) * Math.sin(lo * DEG), r * Math.sin(la * DEG)];
  const s = toVec(st.lat, st.lon, radius + st.alt);
  const v = toVec(lat, lon, radius + alt);
  const d = sub(v, s);
  return 90 - angleBetween(s, d);
}


/** Real body name for a save's IDENT ("Kerbin" in an RSS save is Earth). */
export function realBodyName(ident: string | null | undefined): string | null {
  return ident ? STOCK_ALIASES[ident] ?? ident : null;
}
