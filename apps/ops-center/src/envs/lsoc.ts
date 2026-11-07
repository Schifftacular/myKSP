import { lunarSunElevation, moonGeometry, realBodyName, type VesselSummary } from '@myksp/shared';
import { blank, centerNote, chart, label, legend, PAL, table } from '../canvaskit';
import { esc, fDate, fDur, fNum, fPct } from '../format';
import type { ManifestSite } from '../data';
import { contractPhase, gameUt, wallRoom } from './common';
import type { Ctx, Env } from './types';

/**
 * Lunar Surface Operations (design §4.9): the career's lunar assets. Vessels at the Moon from the
 * save, the manifest's candidate base sites, Sun elevation at each site from this install's Moon
 * orbit, TAC Life Support consumables with days remaining at the save's own consumption rates,
 * and the base contracts. Surface state is as of the last save (Telemachus only reports the active
 * vessel); the live vessel is added when it is at the Moon.
 */
let drawnKey = '';
const BASE_SITE = 'SP-CONNECTING-RIDGE';

const sitesOf = (ctx: Ctx): ManifestSite[] => ctx.data.planning?.manifest?.sites ?? [];
const moonVessels = (ctx: Ctx): VesselSummary[] => (ctx.store.career?.summary.vessels ?? []).filter((v) => realBodyName(v.bodyIdent) === 'Moon' && v.type !== 'Debris' && v.type !== 'SpaceObject');

/** Days of food, water and oxygen left for the crew aboard, from the save's TAC LS rates. */
function supplies(ctx: Ctx, v: VesselSummary) {
  const r = ctx.store.career?.summary.tacRates;
  const res = v.resources;
  const left = (name: string, rate: number | undefined) => {
    const a = res[name]?.amount;
    if (a === undefined) return null;
    if (!rate || !v.crew) return { amount: a, days: null as number | null };
    return { amount: a, days: a / (rate * v.crew) / 86400 };
  };
  return {
    food: left('Food', r?.food), water: left('Water', r?.water), oxygen: left('Oxygen', r?.oxygen),
    ec: res.ElectricCharge ? res.ElectricCharge.amount / Math.max(1, res.ElectricCharge.max) : null,
    rates: !!r,
  };
}
const minDays = (s: ReturnType<typeof supplies>) => {
  const ds = [s.food?.days, s.water?.days, s.oxygen?.days].filter((d): d is number => d !== null && d !== undefined);
  return ds.length ? Math.min(...ds) : null;
};
/** Low-resolution Sun-elevation image: f(u, v) → elevation (°) or NaN (outside). */
function shade(cw: number, ch: number, fn: (u: number, v: number) => number, scale = 30): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = cw; c.height = ch;
  const g = c.getContext('2d')!;
  const img = g.createImageData(cw, ch);
  for (let j = 0; j < ch; j++) for (let i = 0; i < cw; i++) {
    const e = fn((i + 0.5) / cw, (j + 0.5) / ch);
    const k = (j * cw + i) * 4;
    if (Number.isNaN(e)) { img.data[k + 3] = 0; continue; }
    const lit = e <= 0 ? 0 : Math.min(1, 0.25 + e / scale);
    img.data[k] = 12 + 160 * lit; img.data[k + 1] = 15 + 150 * lit; img.data[k + 2] = 20 + 128 * lit; img.data[k + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  return c;
}
const daysColor = (d: number | null) => (d === null ? undefined : d < 3 ? PAL.warning : d < 14 ? PAL.caution : '#7fd19b');

export const lsoc: Env = {
  id: 'lsoc',
  code: 'LSOC',
  name: 'Lunar Surface Operations',
  purpose: 'Lunar assets, base sites and sunlight, TAC LS consumables and base contracts',
  consoles: [
    { id: 'SURFACE', title: 'Surface operations lead' },
    { id: 'CONSUMABLES', title: 'Consumables (TAC LS)' },
    { id: 'SITES', title: 'Sites and sunlight' },
    { id: 'BASE', title: 'Base build and resupply' },
  ],
  screens: [
    { key: 'map', w: 2048, h: 1024, label: 'Moon' },
    { key: 'pole', w: 1024, h: 1024, label: 'South polar region' },
    { key: 'supplies', w: 1024, h: 1024, label: 'Consumables' },
    { key: 'sun', w: 2048, h: 512, label: 'Sun at the base site' },
  ],

  build() {
    drawnKey = '';
    return wallRoom({
      W: 24, D: 14, H: 5.4, wall: '#24282d', floor: '#202327', coffer: '#4c5157', bg: '#05070a',
      screens: [
        { key: 'map', cw: 2048, ch: 1024, w: 7.2, h: 3.6, x: -2.8, y: 3.5 },
        { key: 'sun', cw: 2048, ch: 512, w: 5.6, h: 1.4, x: -2.8, y: 0.85 },
        { key: 'pole', cw: 1024, ch: 1024, w: 3.8, h: 3.8, x: 3.4, y: 3.15 },
        { key: 'supplies', cw: 1024, ch: 1024, w: 3.6, h: 3.6, x: -1.5, y: 2.6, wall: 'right' },
      ],
      tiers: [-1.0, 3.0],
      seats: [{ id: 'SITES', x: -3.6, z: -1.0 }, { id: 'CONSUMABLES', x: 2.2, z: -1.0 }, { id: 'SURFACE', x: -1.2, z: 3.0, row: 1 }, { id: 'BASE', x: 3.6, z: 3.0, row: 1 }],
      overview: { pos: [0, 3.6, 6.4], look: [0, 2.6, -7] },
    });
  },

  enter(ctx) { ctx.data.loadPlanning(); drawnKey = ''; },

  draw(cv, ctx) {
    const sys = ctx.data.system, ut = gameUt(ctx);
    const vs = moonVessels(ctx), sites = sitesOf(ctx);
    const f = ctx.store.frame;
    const key = `${!!sys}|${ut === null ? '' : Math.floor(ut / 1800)}|${vs.length}|${sites.length}|${ctx.store.career?.summary.savedAt}|${f?.vessel.body === 'Moon' ? `${f.vessel.lat?.toFixed(1)},${f.vessel.lon?.toFixed(1)}` : ''}`;
    if (key === drawnKey) return [];
    drawnKey = key;
    const geo = sys && ut !== null ? moonGeometry(sys, ut) : null;
    const sunEl = (lat: number, lon: number) => (geo ? lunarSunElevation(geo.elongation, geo.waxing, lat, lon) : null);
    // Global map with the day/night terminator (shaded per pixel at low resolution, scaled up).
    {
      const { g, w, h } = blank(cv.map, 'MOON · SELENOGRAPHIC', geo ? `${Math.round(geo.illuminated * 100)}% lit from Earth · ${geo.waxing ? 'waxing' : 'waning'}` : 'no Moon geometry');
      const T = h * 0.08, B = h * 0.93;
      const X = (lon: number) => ((lon + 180) / 360) * w, Y = (lat: number) => T + ((90 - lat) / 180) * (B - T);
      if (geo) g.drawImage(shade(256, 128, (u, v) => sunEl(90 - v * 180, u * 360 - 180)!), 0, T, w, B - T);
      g.strokeStyle = PAL.grid; g.lineWidth = 1;
      for (let lon = -180; lon <= 180; lon += 30) { g.beginPath(); g.moveTo(X(lon), T); g.lineTo(X(lon), B); g.stroke(); }
      for (let lat = -60; lat <= 60; lat += 30) { g.beginPath(); g.moveTo(0, Y(lat)); g.lineTo(w, Y(lat)); g.stroke(); label(g, `${lat}°`, 6, Y(lat) - 4, h * 0.02, PAL.dim); }
      g.strokeStyle = PAL.gridStrong; g.strokeRect(X(-90), T, X(90) - X(-90), B - T);
      label(g, 'NEAR SIDE (faces Earth)', X(0), T + h * 0.035, h * 0.024, PAL.dim, 'center', 700);
      label(g, 'FAR SIDE', X(-135), T + h * 0.035, h * 0.024, PAL.dim, 'center', 700);
      label(g, 'FAR SIDE', X(135), T + h * 0.035, h * 0.024, PAL.dim, 'center', 700);
      for (const s of sites) { g.fillStyle = s.id === BASE_SITE ? PAL.caution : PAL.predicted; g.fillRect(X(s.lon) - 5, Y(s.lat) - 5, 10, 10); }
      const pts = vs.filter((v) => v.lat !== null && v.lon !== null).map((v) => ({ name: v.name, lat: v.lat!, lon: v.lon!, landed: /LANDED|SPLASHED/.test(v.situation ?? '') }));
      if (f?.vessel.body === 'Moon' && f.vessel.lat !== null && f.vessel.lon !== null) pts.push({ name: `${f.vessel.name} (live)`, lat: f.vessel.lat, lon: f.vessel.lon, landed: /landed/i.test(f.vessel.situation ?? '') });
      for (const p of pts) {
        g.fillStyle = p.landed ? '#7fd19b' : '#ffffff'; g.beginPath(); g.arc(X(p.lon), Y(p.lat), h * 0.01, 0, Math.PI * 2); g.fill();
        label(g, p.name, X(p.lon) + h * 0.016, Y(p.lat) + h * 0.008, h * 0.022, PAL.text, 'left', 600);
      }
      if (!geo) centerNote(cv.map, sys ? 'No game time yet' : 'Moon orbit not loaded from the install');
      legend(g, w * 0.01, h * 0.975, h * 0.022, [['Landed asset', '#7fd19b'], ['In lunar orbit', '#ffffff'], ['Candidate site', PAL.predicted], ['Base anchor site', PAL.caution], ['Sunlit', '#a89f8c']]);
    }
    // South polar view (azimuthal, poleward of 83° S) with numbered sites.
    {
      const { g, w, h } = blank(cv.pole, 'SOUTH POLE · 83°S TO POLE', geo ? 'Sun elevation now' : '');
      const RANGE = 7;
      const cx = w * 0.36, cy = h * 0.53, rad = w * 0.33;
      const P = (lat: number, lon: number) => { const r = ((90 + lat) / RANGE) * rad; const a = (lon * Math.PI) / 180; return [cx + r * Math.sin(a), cy - r * Math.cos(a)]; };
      if (geo) {
        const img = shade(256, 256, (u, v) => {
          const dx = (u - 0.5) * 2, dy = (v - 0.5) * 2, r = Math.hypot(dx, dy);
          if (r > 1) return NaN;
          return sunEl(-90 + r * RANGE, (Math.atan2(dx, -dy) * 180) / Math.PI)!;
        }, 4);
        g.drawImage(img, cx - rad, cy - rad, rad * 2, rad * 2);
      }
      g.strokeStyle = PAL.gridStrong; g.lineWidth = 1;
      for (const lat of [-83, -85, -87, -89]) { const r = ((90 + lat) / RANGE) * rad; g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.stroke(); label(g, `${-lat}°`, cx + 4, cy - r - 4, h * 0.02, PAL.dim); }
      for (let lon = -180; lon < 180; lon += 45) { const [x, y] = P(-83, lon); g.beginPath(); g.moveTo(cx, cy); g.lineTo(x, y); g.stroke(); const [lx, ly] = P(-82.4, lon); label(g, `${lon}°`, lx, ly + h * 0.008, h * 0.02, PAL.dim, 'center'); }
      const polar = sites.filter((x) => x.lat <= -90 + RANGE).sort((a, b) => a.lat - b.lat);
      polar.forEach((s, i) => {
        const [x, y] = P(s.lat, s.lon);
        g.fillStyle = s.id === BASE_SITE ? PAL.caution : PAL.predicted; g.beginPath(); g.arc(x, y, h * 0.011, 0, Math.PI * 2); g.fill();
        label(g, String(i + 1), x, y + h * 0.007, h * 0.016, '#05080c', 'center', 800);
        const e = sunEl(s.lat, s.lon);
        const ly = h * 0.15 + i * h * 0.055;
        label(g, `${i + 1}`, w * 0.73, ly, h * 0.024, s.id === BASE_SITE ? PAL.caution : PAL.predicted, 'left', 800);
        label(g, s.name.replace(/\s*\(.*\)$/, '').slice(0, 20), w * 0.76, ly, h * 0.022, PAL.text, 'left', 600);
        if (e !== null) label(g, `${e > 0.25 ? 'sunlit' : e > -0.25 ? 'grazing' : 'dark'} ${fNum(e, 1)}°`, w * 0.76, ly + h * 0.024, h * 0.018, e > 0.25 ? '#d8cfb4' : e > -0.25 ? PAL.caution : PAL.dim);
      });
      if (!sites.length) centerNote(cv.pole, 'No sites (needs the research manifest)');
      label(g, 'Sun elevation ignores libration (±1.5°): near 0° is grazing light.', w * 0.04, h * 0.98, h * 0.022, PAL.dim);
    }
    // Consumables.
    {
      const { g, w, h } = blank(cv.supplies, 'CONSUMABLES · TAC LS', ctx.store.career?.summary.savedAt ? `as of last save` : '');
      if (!ctx.store.career) centerNote(cv.supplies, 'Career save not loaded');
      else if (!vs.length) centerNote(cv.supplies, 'No vessels at the Moon', 'Lunar assets appear here from the save');
      else {
        const rows = vs.map((v) => { const s = supplies(ctx, v); const d = minDays(s); return { v, s, d }; });
        table(g, w * 0.04, h * 0.13, w * 0.92, h * 0.055, [{ label: 'Vessel', w: 3 }, { label: 'Crew', w: 0.8, align: 'right' }, { label: 'Food d', w: 1.1, align: 'right' }, { label: 'Water d', w: 1.1, align: 'right' }, { label: 'O₂ d', w: 1, align: 'right' }, { label: 'EC', w: 1, align: 'right' }],
          rows.map(({ v, s }) => [v.name, String(v.crew), s.food?.days != null ? fNum(s.food.days, 1) : s.food ? 'stock' : '—', s.water?.days != null ? fNum(s.water.days, 1) : s.water ? 'stock' : '—', s.oxygen?.days != null ? fNum(s.oxygen.days, 1) : s.oxygen ? 'stock' : '—', fPct(s.ec)]),
          rows.map((r) => daysColor(r.d)), 14);
        label(g, ctx.store.career.summary.tacRates ? 'Days at the save\'s TAC LS rates for the crew aboard. "stock": uncrewed.' : 'TAC LS rates not found in the save: days cannot be computed.', w * 0.04, h * 0.97, h * 0.024, PAL.dim);
      }
    }
    // Sun elevation at the base anchor site over the next 30 days.
    {
      const { g, w, h } = blank(cv.sun, 'SUN AT THE BASE SITE · NEXT 30 DAYS', sites.find((s) => s.id === BASE_SITE)?.name ?? '');
      const base = sites.find((s) => s.id === BASE_SITE) ?? sites[0];
      if (!geo || !base || !sys) centerNote(cv.sun, !base ? 'No base site (needs the research manifest)' : 'No Moon geometry');
      else {
        const pts: [number, number][] = [];
        for (let t = ut!; t <= ut! + 30 * 86400; t += 6 * 3600) { const m = moonGeometry(sys, t)!; pts.push([t, lunarSunElevation(m.elongation, m.waxing, base.lat, base.lon) + 3]); }
        chart(g, w * 0.04, h * 0.2, w * 0.97, h * 0.82, [{ pts, color: PAL.caution, min: 0, max: 6 }], [ut!, ut! + 30 * 86400]);
        const y0 = h * 0.82 - ((3 - 0) / 6) * (h * 0.62);
        g.strokeStyle = PAL.dim; g.setLineDash([6, 6]); g.beginPath(); g.moveTo(w * 0.04, y0); g.lineTo(w * 0.97, y0); g.stroke(); g.setLineDash([]);
        label(g, 'horizon', w * 0.045, y0 - 6, h * 0.05, PAL.dim);
        label(g, '+3°', w * 0.035, h * 0.22, h * 0.05, PAL.dim, 'right');
        label(g, '−3°', w * 0.035, h * 0.82, h * 0.05, PAL.dim, 'right');
        label(g, `${fDate(ut)} → ${fDate(ut! + 30 * 86400)}`, w * 0.97, h * 0.95, h * 0.055, PAL.dim, 'right');
      }
    }
    return ['map', 'pole', 'supplies', 'sun'];
  },

  monitor(id, ctx) {
    const vs = moonVessels(ctx);
    if (!ctx.store.career) return { rows: [['Career', ctx.store.careerError ? 'unavailable' : 'loading']], level: 'nodata' };
    if (id === 'CONSUMABLES') {
      const ds = vs.map((v) => ({ v, d: minDays(supplies(ctx, v)) })).filter((x) => x.d !== null).sort((a, b) => a.d! - b.d!);
      const worst = ds[0]?.d ?? null;
      return { rows: ds.length ? ds.slice(0, 4).map((x) => [x.v.name, `${fNum(x.d, 1)} d`, daysColor(x.d)]) : [['Crewed lunar vessels', 'none']], level: worst === null ? 'nominal' : worst < 3 ? 'warning' : worst < 14 ? 'caution' : 'nominal' };
    }
    if (id === 'SITES') {
      const sys = ctx.data.system, ut = gameUt(ctx), base = sitesOf(ctx).find((s) => s.id === BASE_SITE);
      const m = sys && ut !== null ? moonGeometry(sys, ut) : null;
      return { rows: [['Sites', String(sitesOf(ctx).length)], ['Base site Sun', m && base ? `${fNum(lunarSunElevation(m.elongation, m.waxing, base.lat, base.lon), 1)}°` : '—']], level: m ? 'nominal' : 'nodata' };
    }
    if (id === 'BASE') {
      const p = ctx.data.planning, c = ctx.store.career.summary.contracts;
      const isBase = (s: string | null) => contractPhase(p, s)?.startsWith('moon_base') ?? false;
      return { rows: [['Base contracts active', String(c.active.filter((x) => isBase(x.subtype)).length)], ['Offered', String(c.offered.filter((x) => isBase(x.subtype)).length)]], level: p?.contractMeta ? 'nominal' : 'nodata' };
    }
    return { rows: [['Lunar vessels', String(vs.length)], ['Landed', String(vs.filter((v) => /LANDED/.test(v.situation ?? '')).length)], ['Crew at Moon', String(vs.reduce((s, v) => s + v.crew, 0))]], level: 'nominal' };
  },

  panel(id, ctx) {
    const pos = id ?? 'SURFACE';
    const vs = moonVessels(ctx);
    const head = `<header><div><div class="pos">${pos}</div><div class="ptitle">${esc(lsoc.consoles.find((c) => c.id === pos)?.title)}</div></div><div class="lamp ${ctx.store.career ? 'nominal' : 'nodata'}">${ctx.store.career ? 'OK' : 'NO DATA'}</div></header>`;
    if (!ctx.store.career) return head + '<p class="muted">Career save not loaded yet.</p>';
    const r = ctx.store.career.summary.tacRates;
    if (pos === 'CONSUMABLES') {
      const rates = r ? `<p class="muted small">Per crew member per day (this save's TAC LS settings): food ${fNum(r.food * 86400, 2)}, water ${fNum(r.water * 86400, 2)}, oxygen ${fNum(r.oxygen * 86400, 0)} units. Limits without supply: food ${fDur(r.maxNoFood)}, water ${fDur(r.maxNoWater)}, oxygen ${fDur(r.maxNoOxygen)}.</p>` : '<p class="muted">TAC LS rates not found in the save.</p>';
      const cards = vs.map((v) => { const s = supplies(ctx, v); const row = (n: string, x: { amount: number; days: number | null } | null) => x ? `<div class="row"><span class="k">${n}</span><span class="v small">${fNum(x.amount, 1)}${x.days !== null ? ` · ${fNum(x.days, 1)} days` : ''}</span></div>` : ''; return `<div class="contract"><div class="ct">${esc(v.name)}</div><div class="row"><span class="k">Crew</span><span class="v small">${v.crew}${v.crewNames.length ? ` (${v.crewNames.map(esc).join(', ')})` : ''}</span></div>${row('Food', s.food)}${row('Water', s.water)}${row('Oxygen', s.oxygen)}<div class="row"><span class="k">Electric charge</span><span class="v small">${fPct(s.ec)}</span></div></div>`; }).join('');
      return head + rates + (cards || '<p class="muted">No vessels at the Moon in this save.</p>') + '<p class="muted foot">As of the last save. TAC LS keeps consuming in the background between saves.</p>';
    }
    if (pos === 'SITES') {
      const sys = ctx.data.system, ut = gameUt(ctx);
      const m = sys && ut !== null ? moonGeometry(sys, ut) : null;
      return head + (sitesOf(ctx).map((s) => `<div class="contract"><div class="ct">${esc(s.name)}${s.id === BASE_SITE ? ' · base anchor' : ''}</div><div class="row"><span class="k">Position</span><span class="v small">${fNum(s.lat, 2)}°, ${fNum(s.lon, 2)}° (${esc(s.precision ?? '')})</span></div>${m ? `<div class="row"><span class="k">Sun now</span><span class="v small">${fNum(lunarSunElevation(m.elongation, m.waxing, s.lat, s.lon), 1)}°</span></div>` : ''}${s.role ? `<div class="muted small">${esc(s.role)}</div>` : ''}</div>`).join('') || '<p class="muted">No sites: needs the research manifest.</p>');
    }
    if (pos === 'BASE') {
      const p = ctx.data.planning, c = ctx.store.career.summary.contracts;
      const isBase = (s: string | null) => contractPhase(p, s)?.startsWith('moon_base') ?? false;
      const card = (x: (typeof c.active)[number]) => `<div class="contract"><div class="ct">${esc(x.title)}</div>${x.dueUT ? `<div class="row"><span class="k">Deadline</span><span class="v small">${fDate(x.dueUT)}</span></div>` : ''}${x.parameters.map((q) => `<div class="row"><span class="k">${esc(q.title)}</span><span class="v small">${esc(q.state)}</span></div>`).join('')}</div>`;
      return head + `<h3>Active</h3>${c.active.filter((x) => isBase(x.subtype)).map(card).join('') || '<div class="muted">None</div>'}<h3>Offered</h3>${c.offered.filter((x) => isBase(x.subtype)).map(card).join('') || '<div class="muted">None</div>'}${p?.contractMeta ? '' : '<p class="muted">Contract metadata not found, so base contracts cannot be told apart.</p>'}`;
    }
    return head + (vs.map((v) => `<div class="contract"><div class="ct">${esc(v.name)}</div><div class="row"><span class="k">State</span><span class="v small">${esc(v.situation ?? '')}${v.landedAt ? ` · ${esc(v.landedAt)}` : ''}</span></div>${v.lat !== null ? `<div class="row"><span class="k">Position</span><span class="v small">${fNum(v.lat, 2)}°, ${fNum(v.lon, 2)}°</span></div>` : ''}<div class="row"><span class="k">Crew</span><span class="v small">${v.crew}</span></div></div>`).join('') || '<p class="muted">No vessels at the Moon yet. The permanent base starts with the first lander.</p>');
  },
};
