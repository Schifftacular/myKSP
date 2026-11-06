import { feature } from 'topojson-client';
import land110 from 'world-atlas/land-110m.json';
import { atmosphereTop, type TelemetryFrame } from '@myksp/shared';
import type { Sample } from './store';
import { fDist, fDur, fMet, fSpeed, fUT } from './format';

/**
 * Canvas-drawn displays. The same canvases are used as Three.js textures on the front wall and
 * shown directly in flat mode, so both views always agree. They are redrawn only when data
 * changes (≈4 Hz), never per animation frame.
 */

export const PAL = {
  bg: '#05080c',
  grid: '#14202b',
  gridStrong: '#1e3040',
  land: '#16232c',
  coast: '#3a5566',
  text: '#d8e1e8',
  dim: '#7d8d99',
  track: '#e8eef2',
  predicted: '#5fb3d9',
  caution: '#f2b134',
  warning: '#ff4d4d',
  nominal: '#cfe8d8',
  sim: '#d36bd6',
  accent: '#5fb3d9',
};

const MONO = '"JetBrains Mono", "SF Mono", ui-monospace, Menlo, Consolas, monospace';
const SANS = '"Inter", "SF Pro Text", system-ui, -apple-system, "Segoe UI", sans-serif';

export function makeCanvas(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

// ---------------------------------------------------------------------------------------------
// Ground track (equirectangular world map, Natural Earth 1:110m land via world-atlas, public domain)

type Ring = [number, number][];
let landRings: Ring[] | null = null;
function rings(): Ring[] {
  if (landRings) return landRings;
  const geo = feature(land110 as any, (land110 as any).objects.land) as any;
  const out: Ring[] = [];
  const addPoly = (poly: number[][][]) => { for (const r of poly) out.push(r as Ring); };
  for (const f of geo.features ?? [geo]) {
    const g = f.geometry;
    if (g.type === 'Polygon') addPoly(g.coordinates);
    else if (g.type === 'MultiPolygon') for (const p of g.coordinates) addPoly(p);
  }
  return (landRings = out);
}

/** Static map layer, drawn once and blitted. */
let mapBase: HTMLCanvasElement | null = null;
function baseMap(w: number, h: number): HTMLCanvasElement {
  if (mapBase && mapBase.width === w && mapBase.height === h) return mapBase;
  const c = makeCanvas(w, h);
  const g = c.getContext('2d')!;
  g.fillStyle = PAL.bg;
  g.fillRect(0, 0, w, h);
  const X = (lon: number) => ((lon + 180) / 360) * w;
  const Y = (lat: number) => ((90 - lat) / 180) * h;
  g.fillStyle = PAL.land;
  g.strokeStyle = PAL.coast;
  g.lineWidth = 1;
  for (const r of rings()) {
    g.beginPath();
    let prevLon: number | null = null;
    for (const [lon, lat] of r) {
      if (prevLon === null || Math.abs(lon - prevLon) > 180) g.moveTo(X(lon), Y(lat));
      else g.lineTo(X(lon), Y(lat));
      prevLon = lon;
    }
    g.closePath();
    g.fill();
    g.stroke();
  }
  g.strokeStyle = PAL.grid;
  g.lineWidth = 1;
  for (let lon = -180; lon <= 180; lon += 30) { g.beginPath(); g.moveTo(X(lon), 0); g.lineTo(X(lon), h); g.stroke(); }
  for (let lat = -60; lat <= 60; lat += 30) { g.beginPath(); g.moveTo(0, Y(lat)); g.lineTo(w, Y(lat)); g.stroke(); }
  g.strokeStyle = PAL.gridStrong;
  g.beginPath(); g.moveTo(0, Y(0)); g.lineTo(w, Y(0)); g.stroke();
  // Tracking stations (RealAntennas default DSN-style network). Positions: public DSN complexes.
  const stations: [string, number, number][] = [['GDS', 35.43, -116.89], ['MAD', 40.43, -4.25], ['CAN', -35.4, 148.98], ['KSC', 28.57, -80.65]];
  g.font = `600 ${Math.round(h * 0.022)}px ${SANS}`;
  for (const [n, la, lo] of stations) {
    g.fillStyle = PAL.dim;
    g.fillRect(X(lo) - 3, Y(la) - 3, 6, 6);
    g.fillText(n, X(lo) + 6, Y(la) + 4);
  }
  return (mapBase = c);
}

const SIDEREAL_DAY: Record<string, number> = { Earth: 86164.1, Moon: 2360591.5, Mars: 88642.7 };

/**
 * Predicted ground track from the current orbit, anchored to the current sub-vessel point.
 * Uses only inclination, argument of latitude and mean motion, so it does not need the body's
 * rotation angle (which Telemachus does not expose).
 */
export function predictTrack(f: TelemetryFrame, seconds: number, step = 30): [number, number][] {
  const { inc, argPe, trueAnomaly, ecc, period, sma } = f.orbit;
  const { lat, lon, body } = f.vessel;
  if ([inc, argPe, trueAnomaly, ecc, period, sma, lat, lon].some((v) => v === null)) return [];
  if (ecc! >= 1 || (f.orbit.pe ?? -1) < 0) return [];
  const rot = SIDEREAL_DAY[body ?? ''];
  if (!rot) return [];
  const i = (inc! * Math.PI) / 180, e = ecc!;
  const M0 = meanFromTrue((trueAnomaly! * Math.PI) / 180, e);
  const n = (2 * Math.PI) / period!;
  const lam = (u: number) => Math.atan2(Math.cos(i) * Math.sin(u), Math.cos(u));
  const u0 = ((argPe! + trueAnomaly!) * Math.PI) / 180;
  const lam0 = lam(u0);
  const pts: [number, number][] = [];
  for (let t = 0; t <= seconds; t += step) {
    const nu = trueFromMean(M0 + n * t, e);
    const u = (argPe! * Math.PI) / 180 + nu;
    const la = (Math.asin(Math.sin(i) * Math.sin(u)) * 180) / Math.PI;
    let dl = ((lam(u) - lam0) * 180) / Math.PI;
    let lo = lon! + dl - (360 * t) / rot;
    lo = ((((lo + 180) % 360) + 360) % 360) - 180;
    pts.push([la, lo]);
  }
  return pts;
}

function meanFromTrue(nu: number, e: number) {
  const E = 2 * Math.atan(Math.sqrt((1 - e) / (1 + e)) * Math.tan(nu / 2));
  return E - e * Math.sin(E);
}
function trueFromMean(M: number, e: number) {
  let E = M;
  for (let k = 0; k < 8; k++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
  return 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2));
}

function polyline(g: CanvasRenderingContext2D, pts: [number, number][], w: number, h: number) {
  const X = (lon: number) => ((lon + 180) / 360) * w;
  const Y = (lat: number) => ((90 - lat) / 180) * h;
  g.beginPath();
  let prev: number | null = null;
  for (const [la, lo] of pts) {
    if (prev === null || Math.abs(lo - prev) > 180) g.moveTo(X(lo), Y(la));
    else g.lineTo(X(lo), Y(la));
    prev = lo;
  }
  g.stroke();
}

export function drawGroundTrack(c: HTMLCanvasElement, f: TelemetryFrame | null, hist: Sample[]) {
  const g = c.getContext('2d')!;
  const { width: w, height: h } = c;
  g.drawImage(baseMap(w, h), 0, 0);
  const onEarth = !f || f.vessel.body === null || f.vessel.body === 'Earth';
  if (f && !onEarth) {
    g.fillStyle = 'rgba(5,8,12,0.75)';
    g.fillRect(0, 0, w, h);
    label(g, `Vessel is in the ${f.vessel.body} system. Earth map not applicable.`, w / 2, h / 2, h * 0.04, PAL.dim, 'center');
  }
  if (f && onEarth) {
    const pred = predictTrack(f, Math.min(1.5 * (f.orbit.period ?? 0), 4 * 3600));
    if (pred.length) {
      g.setLineDash([h * 0.012, h * 0.012]);
      g.strokeStyle = PAL.predicted;
      g.lineWidth = Math.max(1.5, h * 0.004);
      polyline(g, pred, w, h);
      g.setLineDash([]);
    }
    const pts = hist.filter((s) => s.lat !== null && s.lon !== null).map((s) => [s.lat!, s.lon!] as [number, number]);
    g.strokeStyle = PAL.track;
    g.lineWidth = Math.max(2, h * 0.006);
    polyline(g, pts, w, h);
    if (f.vessel.lat !== null && f.vessel.lon !== null) {
      const x = ((f.vessel.lon + 180) / 360) * w, y = ((90 - f.vessel.lat) / 180) * h;
      g.fillStyle = PAL.track;
      g.beginPath(); g.arc(x, y, h * 0.014, 0, Math.PI * 2); g.fill();
      g.strokeStyle = PAL.bg; g.lineWidth = 2; g.stroke();
    } else {
      label(g, 'Position not in this telemetry source', w / 2, h * 0.94, h * 0.032, PAL.dim, 'center');
    }
  }
  header(g, w, h, 'GROUND TRACK', f ? `${f.vessel.name ?? ''}${pTag(f)}` : 'NO DATA');
  if (f && onEarth) {
    g.fillStyle = PAL.dim;
    g.font = `500 ${Math.round(h * 0.026)}px ${SANS}`;
    g.textAlign = 'right';
    g.fillText('— flown   - - predicted 1.5 rev', w - h * 0.03, h - h * 0.03);
    g.textAlign = 'left';
  }
}

function pTag(f: TelemetryFrame) { return f.source === 'sim' ? '  · SIM' : f.source === 'replay' ? '  · REPLAY' : ''; }

function header(g: CanvasRenderingContext2D, w: number, h: number, title: string, right: string) {
  g.fillStyle = 'rgba(5,8,12,0.85)';
  g.fillRect(0, 0, w, h * 0.075);
  label(g, title, h * 0.03, h * 0.052, h * 0.036, PAL.dim, 'left', 700);
  label(g, right, w - h * 0.03, h * 0.052, h * 0.036, right.includes('SIM') || right.includes('REPLAY') ? PAL.sim : PAL.text, 'right', 600);
}

function label(g: CanvasRenderingContext2D, s: string, x: number, y: number, size: number, color: string, align: CanvasTextAlign = 'left', weight = 500, mono = false) {
  g.font = `${weight} ${Math.round(size)}px ${mono ? MONO : SANS}`;
  g.fillStyle = color;
  g.textAlign = align;
  g.fillText(s, x, y);
  g.textAlign = 'left';
}

// ---------------------------------------------------------------------------------------------
// Ascent / trajectory plot: altitude and inertial velocity against MET.

export function drawTrajectory(c: HTMLCanvasElement, f: TelemetryFrame | null, hist: Sample[]) {
  const g = c.getContext('2d')!;
  const { width: w, height: h } = c;
  g.fillStyle = PAL.bg;
  g.fillRect(0, 0, w, h);
  header(g, w, h, 'ALTITUDE · VELOCITY vs MET', f ? `${fMet(f.vessel.met)}${pTag(f)}` : 'NO DATA');
  const L = w * 0.1, R = w * 0.9, T = h * 0.16, B = h * 0.86;
  g.strokeStyle = PAL.grid;
  g.lineWidth = 1;
  for (let k = 0; k <= 4; k++) { const y = T + ((B - T) * k) / 4; g.beginPath(); g.moveTo(L, y); g.lineTo(R, y); g.stroke(); }
  const pts = hist.filter((s) => s.alt !== null);
  if (pts.length < 2) {
    label(g, 'Waiting for flight data', w / 2, (T + B) / 2, h * 0.05, PAL.dim, 'center');
    return;
  }
  const t0 = pts[0].met, t1 = Math.max(pts[pts.length - 1].met, t0 + 60);
  const altMax = niceMax(Math.max(...pts.map((s) => s.alt!), 1000));
  const velMax = niceMax(Math.max(...pts.map((s) => s.vel ?? 0), 100));
  const X = (t: number) => L + ((t - t0) / (t1 - t0)) * (R - L);
  const atmo = atmosphereTop(f?.vessel.body ?? 'Earth');
  if (atmo && atmo < altMax) {
    const y = B - (atmo / altMax) * (B - T);
    g.setLineDash([6, 6]); g.strokeStyle = PAL.gridStrong; g.beginPath(); g.moveTo(L, y); g.lineTo(R, y); g.stroke(); g.setLineDash([]);
    label(g, 'atmosphere top', L + 8, y - 6, h * 0.035, PAL.dim);
  }
  const line = (sel: (s: Sample) => number | null, max: number, color: string) => {
    g.strokeStyle = color; g.lineWidth = Math.max(2, h * 0.008);
    g.beginPath();
    let first = true;
    for (const s of pts) { const v = sel(s); if (v === null) continue; const y = B - (v / max) * (B - T); if (first) { g.moveTo(X(s.met), y); first = false; } else g.lineTo(X(s.met), y); }
    g.stroke();
  };
  line((s) => s.alt, altMax, PAL.track);
  line((s) => s.vel, velMax, PAL.accent);
  label(g, `ALT ${fDist(altMax)}`, L, T - h * 0.02, h * 0.035, PAL.track, 'left', 600);
  label(g, `VEL ${fSpeed(velMax)}`, R, T - h * 0.02, h * 0.035, PAL.accent, 'right', 600);
  label(g, fMet(t0), L, B + h * 0.08, h * 0.035, PAL.dim);
  label(g, fMet(t1), R, B + h * 0.08, h * 0.035, PAL.dim, 'right');
}

function niceMax(v: number) {
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  for (const m of [1, 2, 2.5, 5, 10]) if (m * p >= v) return m * p;
  return 10 * p;
}

// ---------------------------------------------------------------------------------------------
// Orbit diagram: body to scale, orbit ellipse with the body at the focus.

export function drawOrbit(c: HTMLCanvasElement, f: TelemetryFrame | null) {
  const g = c.getContext('2d')!;
  const { width: w, height: h } = c;
  g.fillStyle = PAL.bg;
  g.fillRect(0, 0, w, h);
  header(g, w, h, 'ORBIT', f?.vessel.body ? `${f.vessel.body}${f ? pTag(f) : ''}` : 'NO DATA');
  if (!f || f.orbit.apR === null || f.orbit.ap === null || f.orbit.pe === null || f.orbit.ecc === null) {
    label(g, 'No orbit data', w / 2, h / 2, h * 0.05, PAL.dim, 'center');
    return;
  }
  const bodyR = f.orbit.apR - f.orbit.ap; // Ap radius minus Ap altitude = body radius
  const e = f.orbit.ecc;
  const cx = w * 0.36, cy = h * 0.56, maxPix = Math.min(w * 0.3, h * 0.36);
  if (e >= 1 || f.orbit.ap < 0) {
    const s = maxPix / (bodyR * 3);
    disc(g, cx, cy, bodyR * s);
    label(g, 'ESCAPE TRAJECTORY', cx, cy + bodyR * s + h * 0.1, h * 0.05, PAL.caution, 'center', 700);
  } else {
    const rAp = bodyR + f.orbit.ap, rPe = bodyR + f.orbit.pe;
    const a = (rAp + rPe) / 2, b = a * Math.sqrt(1 - e * e);
    const s = maxPix / Math.max(a, bodyR * 1.05);
    const centre = cx - (a - rPe) * s; // body at the right focus: periapsis to the right
    disc(g, cx, cy, bodyR * s);
    const atmo = atmosphereTop(f.vessel.body);
    if (atmo) { g.strokeStyle = 'rgba(95,179,217,0.35)'; g.lineWidth = 1; g.beginPath(); g.arc(cx, cy, (bodyR + atmo) * s, 0, Math.PI * 2); g.stroke(); }
    g.strokeStyle = f.orbit.pe < atmo ? PAL.caution : PAL.track;
    g.lineWidth = Math.max(2, h * 0.008);
    g.beginPath(); g.ellipse(centre, cy, a * s, b * s, 0, 0, Math.PI * 2); g.stroke();
    // Vessel position from true anomaly.
    if (f.orbit.trueAnomaly !== null) {
      const nu = (f.orbit.trueAnomaly * Math.PI) / 180;
      const r = (a * (1 - e * e)) / (1 + e * Math.cos(nu));
      const x = cx + r * Math.cos(nu) * s, y = cy - r * Math.sin(nu) * s;
      g.fillStyle = PAL.track; g.beginPath(); g.arc(x, y, h * 0.022, 0, Math.PI * 2); g.fill();
    }
    label(g, 'Pe', cx + rPe * s + 8, cy + 6, h * 0.04, PAL.accent, 'left', 700);
    label(g, 'Ap', cx - rAp * s - 8, cy + 6, h * 0.04, PAL.accent, 'right', 700);
  }
  const col = w * 0.8;
  const rows: [string, string][] = [
    ['Ap', fDist(f.orbit.ap, { escape: true })], ['Pe', fDist(f.orbit.pe)], ['T Ap', fDur(f.orbit.timeToAp)], ['T Pe', fDur(f.orbit.timeToPe)],
    ['Inc', f.orbit.inc === null ? '—' : `${f.orbit.inc.toFixed(2)}°`], ['Ecc', e.toFixed(4)], ['Period', fDur(f.orbit.period)],
  ];
  rows.forEach(([k, v], i) => {
    const y = h * 0.22 + i * h * 0.105;
    label(g, k, col - w * 0.06, y, h * 0.04, PAL.dim, 'left', 600);
    label(g, v, w - h * 0.04, y, h * 0.05, PAL.text, 'right', 600, true);
  });
}

function disc(g: CanvasRenderingContext2D, x: number, y: number, r: number) {
  const grad = g.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
  grad.addColorStop(0, '#2b5f7f'); grad.addColorStop(1, '#0d2533');
  g.fillStyle = grad; g.beginPath(); g.arc(x, y, Math.max(2, r), 0, Math.PI * 2); g.fill();
}

// ---------------------------------------------------------------------------------------------
// Clock strip: MET, flight day, UT, next event.

export function drawClocks(c: HTMLCanvasElement, f: TelemetryFrame | null, linkLabel: string, linkColor: string) {
  const g = c.getContext('2d')!;
  const { width: w, height: h } = c;
  g.fillStyle = '#020406';
  g.fillRect(0, 0, w, h);
  const cell = (x: number, cap: string, val: string, color = PAL.text) => {
    label(g, cap, x, h * 0.3, h * 0.19, PAL.dim, 'left', 700);
    label(g, val, x, h * 0.8, h * 0.4, color, 'left', 600, true);
  };
  const met = f?.vessel.met ?? null;
  const prelaunch = f?.vessel.situation ? /pre.?launch/i.test(f.vessel.situation) : false;
  cell(w * 0.01, 'MISSION ELAPSED', prelaunch ? 'T\u2212 HOLD' : fMet(met));
  cell(w * 0.215, 'FLIGHT DAY', met === null ? '\u2014' : `FD ${Math.floor(met / 86400) + 1}`);
  cell(w * 0.31, 'GAME DATE (RSS UT)', fUT(f?.ut ?? null).slice(0, 16));
  let next = '\u2014';
  if (f && f.orbit.timeToAp !== null && f.orbit.timeToPe !== null && (f.orbit.ecc ?? 1) < 1) {
    next = f.orbit.timeToAp < f.orbit.timeToPe ? `Ap ${fDur(f.orbit.timeToAp)}` : `Pe ${fDur(f.orbit.timeToPe)}`;
  }
  cell(w * 0.59, 'NEXT APSIS', next);
  label(g, linkLabel, w - h * 0.15, h * 0.68, h * 0.34, linkColor, 'right', 800);
}

// ---------------------------------------------------------------------------------------------
// Console monitor: compact per-position summary drawn onto each desk's screens.

export function drawConsole(c: HTMLCanvasElement, title: string, rows: [string, string, string?][], levelColor: string) {
  const g = c.getContext('2d')!;
  const { width: w, height: h } = c;
  g.fillStyle = '#071018';
  g.fillRect(0, 0, w, h);
  g.fillStyle = levelColor;
  g.fillRect(0, 0, w, h * 0.012 + 4);
  label(g, title, w * 0.04, h * 0.14, h * 0.09, PAL.text, 'left', 800);
  rows.slice(0, 6).forEach(([k, v, col], i) => {
    const y = h * 0.29 + i * h * 0.12;
    label(g, k, w * 0.04, y, h * 0.065, PAL.dim, 'left', 600);
    label(g, v, w * 0.96, y, h * 0.075, col ?? PAL.text, 'right', 600, true);
  });
}
