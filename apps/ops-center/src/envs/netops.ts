import { elevationFrom, type GroundStation, type TelemetryFrame } from '@myksp/shared';
import { blank, centerNote, label, legend, PAL, table } from '../canvaskit';
import { baseMap, polyline, predictTrack } from '../screens';
import { esc, fDur, fNum, fPct } from '../format';
import { wallRoom } from './common';
import type { Ctx, Env } from './types';

/**
 * Network Operations (design §4.8): the ground stations this install's RealAntennas planet pack
 * defines, the active vessel's elevation from each one now, and predicted AOS/LOS from the
 * predicted ground track. Geometry only (0° mask, spherical Earth, current altitude held): the
 * game's link budget also needs antenna gain and power, which Telemachus does not expose.
 */
let drawnAt = 0;
let drawnKey = '';
const R_EARTH = 6_371_000;

interface Pass { station: GroundStation; el: number | null; aos: number | null; los: number | null; visible: boolean }

function passes(ctx: Ctx, f: TelemetryFrame | null): Pass[] | null {
  const st = ctx.data.install?.stations ?? [];
  const R = ctx.data.system?.get('Earth')?.radius ?? R_EARTH;
  if (!f || f.vessel.body !== 'Earth' || f.vessel.lat === null || f.vessel.lon === null || f.vessel.alt === null) return null;
  const horizon = Math.min(Math.max((f.orbit.period ?? 5400) * 2, 3 * 3600), 12 * 3600);
  const track = predictTrack(f, horizon, 30);
  return st.map((s) => {
    const el = elevationFrom(s, f.vessel.lat!, f.vessel.lon!, f.vessel.alt!, R);
    const visible = el > 0;
    let aos: number | null = null, los: number | null = null;
    for (let i = 1; i < track.length; i++) {
      const e = elevationFrom(s, track[i][0], track[i][1], f.vessel.alt!, R);
      if (visible && los === null && e <= 0) { los = i * 30; break; }
      if (!visible && aos === null && e > 0) aos = i * 30;
      if (!visible && aos !== null && e <= 0) { los = i * 30; break; }
    }
    return { station: s, el, aos, los, visible };
  });
}

/** Ground footprint (lat/lon ring) where a vessel at `alt` is above the station's horizon. */
function footprint(s: GroundStation, alt: number, R: number): [number, number][] {
  const lam = Math.acos(R / (R + alt));
  const la1 = (s.lat * Math.PI) / 180, lo1 = (s.lon * Math.PI) / 180;
  const pts: [number, number][] = [];
  for (let b = 0; b <= 360; b += 6) {
    const br = (b * Math.PI) / 180;
    const la2 = Math.asin(Math.sin(la1) * Math.cos(lam) + Math.cos(la1) * Math.sin(lam) * Math.cos(br));
    const lo2 = lo1 + Math.atan2(Math.sin(br) * Math.sin(lam) * Math.cos(la1), Math.cos(lam) - Math.sin(la1) * Math.sin(la2));
    pts.push([(la2 * 180) / Math.PI, ((((lo2 * 180) / Math.PI + 540) % 360) - 180)]);
  }
  return pts;
}

export const netops: Env = {
  id: 'netops',
  code: 'NET',
  name: 'Network Operations',
  purpose: 'Ground stations from RealAntennas, coverage and predicted AOS/LOS for the active vessel',
  consoles: [
    { id: 'NETWORK', title: 'Network controller' },
    { id: 'PASSES', title: 'Station passes' },
    { id: 'LINK', title: 'Link status' },
  ],
  screens: [
    { key: 'map', w: 2048, h: 1024, label: 'Network map' },
    { key: 'passes', w: 1024, h: 1024, label: 'Station passes' },
  ],

  build() {
    drawnKey = '';
    return wallRoom({
      W: 18, D: 12, H: 4.4, wall: '#22272c', floor: '#1e2226', coffer: '#3e4952', bg: '#05070a',
      screens: [
        { key: 'map', cw: 2048, ch: 1024, w: 8, h: 4, x: -2, y: 2.4 },
        { key: 'passes', cw: 1024, ch: 1024, w: 3.6, h: 3.6, x: 5.6, y: 2.4 },
      ],
      tiers: [-1.2, 2.4],
      seats: [{ id: 'PASSES', x: -3.2, z: -1.2 }, { id: 'LINK', x: 3.2, z: -1.2 }, { id: 'NETWORK', x: 0, z: 2.4, row: 1 }],
      overview: { pos: [0, 3.2, 5.4], look: [0, 2.3, -6] },
    });
  },

  draw(cv, ctx, now) {
    const f = ctx.store.frame;
    const st = ctx.data.install?.stations ?? [];
    const key = `${st.length}|${f?.vessel.name}|${f?.vessel.body}|${f?.source}`;
    if (key === drawnKey && now - drawnAt < 2000) return [];
    drawnKey = key; drawnAt = now;
    const R = ctx.data.system?.get('Earth')?.radius ?? R_EARTH;
    const ps = passes(ctx, f);
    {
      const g = cv.map.getContext('2d')!;
      const { width: w, height: h } = cv.map;
      g.drawImage(baseMap(w, h, false), 0, 0);
      const X = (lon: number) => ((lon + 180) / 360) * w, Y = (lat: number) => ((90 - lat) / 180) * h;
      const alt = f?.vessel.body === 'Earth' && f.vessel.alt !== null && f.vessel.alt > 50_000 ? f.vessel.alt : 400_000;
      for (const s of st) {
        const vis = ps?.find((p) => p.station === s)?.visible;
        g.strokeStyle = vis ? 'rgba(127,209,155,0.8)' : 'rgba(95,179,217,0.35)'; g.lineWidth = vis ? 3 : 1.5;
        polyline(g, footprint(s, alt, R), w, h);
      }
      g.font = `600 ${Math.round(h * 0.02)}px sans-serif`;
      for (const s of st) {
        g.fillStyle = ps?.find((p) => p.station === s)?.visible ? '#7fd19b' : PAL.text;
        g.fillRect(X(s.lon) - 4, Y(s.lat) - 4, 8, 8);
        g.fillText(s.name.replace(/\s*-\s*.*$/, ''), X(s.lon) + 7, Y(s.lat) + 5);
      }
      if (f && f.vessel.body === 'Earth' && f.vessel.lat !== null && f.vessel.lon !== null) {
        g.strokeStyle = PAL.predicted; g.lineWidth = 2; g.setLineDash([10, 8]);
        polyline(g, predictTrack(f, Math.min((f.orbit.period ?? 5400) * 1.5, 6 * 3600), 30), w, h);
        g.setLineDash([]);
        g.fillStyle = '#fff'; g.beginPath(); g.arc(X(f.vessel.lon), Y(f.vessel.lat), h * 0.012, 0, Math.PI * 2); g.fill();
        label(g, f.vessel.name ?? '', X(f.vessel.lon) + h * 0.02, Y(f.vessel.lat) - h * 0.015, h * 0.024, PAL.text, 'left', 700);
      }
      g.fillStyle = 'rgba(5,8,12,0.75)'; g.fillRect(0, 0, w, h * 0.07);
      label(g, 'GROUND NETWORK', w * 0.015, h * 0.048, h * 0.03, PAL.text, 'left', 700);
      label(g, st.length ? `${st.length} stations · RealAntennas RSS planet pack` : 'No ground stations found in this install', w * 0.985, h * 0.048, h * 0.024, PAL.dim, 'right');
      legend(g, w * 0.015, h * 0.975, h * 0.022, [['In view now', '#7fd19b'], [`Coverage at ${fNum(alt / 1000, 0)} km (0° mask)`, PAL.predicted], ['Predicted track', PAL.predicted]]);
    }
    {
      const { g, w, h } = blank(cv.passes, 'STATION PASSES', f?.vessel.name ?? 'no vessel');
      if (!st.length) centerNote(cv.passes, 'No ground stations', 'Needs GameData/RealAntennas/PlanetPacks/RealSolarSystem.cfg');
      else if (!ps) centerNote(cv.passes, f?.vessel.body && f.vessel.body !== 'Earth' ? `Vessel is at ${f.vessel.body}` : 'No vessel in Earth flight', f?.vessel.body && f.vessel.body !== 'Earth' ? 'Pass prediction covers Earth orbit only' : 'Passes appear when KSP is in a flight scene');
      else {
        const sorted = [...ps].sort((a, b) => Number(b.visible) - Number(a.visible) || (a.aos ?? 1e12) - (b.aos ?? 1e12));
        table(g, w * 0.04, h * 0.13, w * 0.92, h * 0.05, [{ label: 'Station', w: 3.4 }, { label: 'Elev', w: 1, align: 'right' }, { label: 'AOS in', w: 1.4, align: 'right' }, { label: 'LOS in', w: 1.4, align: 'right' }],
          sorted.map((p) => [p.station.name, `${fNum(p.el, 1)}°`, p.visible ? 'in view' : p.aos === null ? '—' : fDur(p.aos), p.los === null ? '—' : fDur(p.los)]),
          sorted.map((p) => (p.visible ? '#7fd19b' : undefined)), 16);
        label(g, 'Geometry only: spherical Earth, 0° mask, altitude held at current value.', w * 0.04, h * 0.97, h * 0.024, PAL.dim);
      }
    }
    return ['map', 'passes'];
  },

  monitor(id, ctx) {
    const f = ctx.store.frame, ps = passes(ctx, f);
    const st = ctx.data.install?.stations ?? [];
    if (id === 'LINK') {
      const commNet = ctx.store.status?.commNet;
      return { rows: [['CommNet', commNet === false ? 'off in this save' : commNet ? 'on' : '—'], ['Signal', commNet === false ? 'n/a' : fPct(f?.comm.signal ?? null)], ['Source', f?.source.toUpperCase() ?? '—']], level: f ? 'nominal' : 'nodata' };
    }
    if (!st.length) return { rows: [['Stations', ctx.data.install ? 'none found' : 'loading']], level: 'nodata' };
    if (id === 'PASSES') {
      const next = ps?.filter((p) => !p.visible && p.aos !== null).sort((a, b) => a.aos! - b.aos!)[0];
      return { rows: [['In view', String(ps?.filter((p) => p.visible).length ?? '—')], ['Next AOS', next ? `${next.station.name.slice(0, 14)} ${fDur(next.aos)}` : '—']], level: ps ? 'nominal' : 'nodata' };
    }
    return { rows: [['Stations', String(st.length)], ['In view', String(ps?.filter((p) => p.visible).length ?? '—')], ['Vessel', f?.vessel.name ?? '—']], level: 'nominal' };
  },

  panel(id, ctx) {
    const f = ctx.store.frame, ps = passes(ctx, f);
    const st = ctx.data.install?.stations ?? [];
    const pos = id ?? 'NETWORK';
    const head = `<header><div><div class="pos">${pos}</div><div class="ptitle">${esc(netops.consoles.find((c) => c.id === pos)?.title)}</div></div><div class="lamp ${st.length ? 'nominal' : 'nodata'}">${st.length ? 'OK' : 'NO DATA'}</div></header>`;
    if (pos === 'LINK') {
      const commNet = ctx.store.status?.commNet;
      return head + `<div class="row"><span class="k">CommNet</span><span class="v">${commNet === false ? 'Off in this save' : commNet ? 'On' : 'Unknown'}</span></div><div class="row"><span class="k">Signal (Telemachus)</span><span class="v">${commNet === false ? 'n/a' : fPct(f?.comm.signal ?? null)}</span></div>
        <p class="muted foot">${commNet === false ? 'With CommNet off, KSP models no link: every vessel has control and telemetry. Turn it on in the save\'s difficulty settings to fly with RealAntennas link budgets.' : 'Signal strength is KSP\'s own link value; station geometry here does not include antenna gain or power.'}</p>`;
    }
    const rows = st.map((s) => { const p = ps?.find((x) => x.station === s); return `<div class="row"><span class="k">${esc(s.name)}</span><span class="v small">${fNum(s.lat, 2)}°, ${fNum(s.lon, 2)}°${p ? ` · el ${fNum(p.el, 1)}°${p.visible ? ' · IN VIEW' : p.aos !== null ? ` · AOS ${fDur(p.aos)}` : ''}` : ''}</span></div>`; }).join('');
    return head + (rows || '<p class="muted">No ground stations found in this install.</p>') + '<p class="muted foot">Stations and positions are read from the RealAntennas RSS planet pack in the install.</p>';
  },
};
