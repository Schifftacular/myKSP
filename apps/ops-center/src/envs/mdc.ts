import { hohmann, moonGeometry, phaseAngle, transferWindows, type SolarSystem } from '@myksp/shared';
import { bar, blank, centerNote, chart, kpi, label, legend, PAL, table } from '../canvaskit';
import { esc, fDate, fNum, fUT } from '../format';
import { gameUt, wallRoom } from './common';
import type { Ctx, Env } from './types';

/**
 * Mission Design Center (design §4.5): trajectory planning from this install's own body orbits
 * (RSS Kopernicus elements propagated from the RP2000 epoch): Moon geometry for the next 30 days,
 * Hohmann departure windows to Mars and Venus, and a Δv budget against the live vehicle.
 * Hohmann figures assume circular coplanar orbits; real windows shift by days to weeks.
 */
let drawnKey = '';
const LEO_ALT = 200e3;
const LLO_ALT = 100e3;

/** Injection Δv from a circular parking orbit for a hyperbolic excess speed v∞. */
const inject = (gm: number, r: number, vinf: number) => Math.sqrt(vinf * vinf + (2 * gm) / r) - Math.sqrt(gm / r);

function budget(sys: SolarSystem, ut: number) {
  const E = sys.get('Earth'), M = sys.get('Moon');
  if (!E?.gm || !E.radius || !M?.gm || !M.radius || !M.orbit) return null;
  const rLeo = E.radius + LEO_ALT;
  const moonDist = sys.relPos('Moon', ut);
  const rMoon = moonDist ? Math.hypot(...moonDist) : M.orbit.sma;
  const tli = hohmann(E.gm, rLeo, rMoon);
  // Arrival: apogee speed of the transfer ellipse vs the Moon's orbital speed.
  const vApo = Math.sqrt(E.gm * (2 / rMoon - 2 / (rLeo + rMoon)));
  const vMoon = Math.sqrt(E.gm / rMoon);
  const loi = inject(M.gm, M.radius + LLO_ALT, Math.abs(vMoon - vApo));
  const descent = Math.sqrt(M.gm / (M.radius + LLO_ALT)) * 1.08; // orbital speed plus ~8% gravity/steering losses
  const out: { label: string; dv: number; note: string }[] = [
    { label: 'Launch to LEO (200 km)', dv: 9300, note: 'typical RSS ascent incl. losses (LCC profile)' },
    { label: 'Trans-lunar injection', dv: tli.dv1, note: `from ${LEO_ALT / 1000} km LEO, ${fNum(tli.tof / 86400, 1)} d coast` },
    { label: 'Lunar orbit insertion', dv: loi, note: `${LLO_ALT / 1000} km circular` },
    { label: 'Lunar descent', dv: descent, note: 'from 100 km LLO, ~8% losses' },
  ];
  const S = sys.get('Sun');
  for (const p of ['Mars', 'Venus']) {
    const P = sys.get(p);
    if (!S?.gm || !E.orbit || !P?.orbit) continue;
    const h = hohmann(S.gm, E.orbit.sma, P.orbit.sma);
    out.push({ label: `Trans-${p === 'Mars' ? 'Mars' : 'Venus'} injection`, dv: inject(E.gm, rLeo, h.dv1), note: `from LEO, Hohmann, ${fNum(h.tof / 86400, 0)} d` });
  }
  return out;
}

export const mdc: Env = {
  id: 'mdc',
  code: 'MDC',
  name: 'Mission Design Center',
  purpose: 'Moon geometry, interplanetary windows and a Δv budget from this install\'s body orbits',
  consoles: [
    { id: 'TRAJ', title: 'Lunar trajectory' },
    { id: 'WINDOWS', title: 'Departure windows' },
    { id: 'BUDGET', title: 'Δv budget' },
    { id: 'CONTRACTS', title: 'Mission requirements' },
  ],
  screens: [
    { key: 'moon', w: 2048, h: 768, label: 'Moon, next 30 days' },
    { key: 'windows', w: 1024, h: 768, label: 'Departure windows' },
    { key: 'budget', w: 1024, h: 768, label: 'Δv budget' },
  ],

  build() {
    drawnKey = '';
    return wallRoom({
      W: 20, D: 14, H: 4.6, wall: '#262b31', floor: '#22262b', coffer: '#4f5a63',
      screens: [
        { key: 'moon', cw: 2048, ch: 768, w: 8.4, h: 3.15, x: 0, y: 2.5 },
        { key: 'windows', cw: 1024, ch: 768, w: 4, h: 3, x: -2, y: 2.4, wall: 'left' },
        { key: 'budget', cw: 1024, ch: 768, w: 4, h: 3, x: -2, y: 2.4, wall: 'right' },
      ],
      tiers: [-1.8, 2.2],
      seats: [
        { id: 'TRAJ', x: -3, z: -1.8 }, { id: 'WINDOWS', x: 3, z: -1.8 },
        { id: 'BUDGET', x: -3, z: 2.2, row: 1 }, { id: 'CONTRACTS', x: 3, z: 2.2, row: 1 },
      ],
      overview: { pos: [0, 3.4, 6.2], look: [0, 2.4, -7] },
    });
  },

  draw(cv, ctx) {
    const sys = ctx.data.system, ut = gameUt(ctx);
    const f = ctx.store.frame;
    const key = `${!!sys}|${ut === null ? '' : Math.floor(ut / 3600)}|${f?.prop.totalDv === null || f?.prop.totalDv === undefined ? '' : Math.round(f.prop.totalDv / 10)}`;
    if (key === drawnKey) return [];
    drawnKey = key;
    const why = !sys ? (ctx.data.errors.install ? `Install facts unavailable: ${ctx.data.errors.install}` : ctx.data.install ? 'No RSS body configs found in this install' : 'Loading body orbits…') : ut === null ? 'No game time yet (no live data or save)' : null;
    if (why) {
      for (const k of ['moon', 'windows', 'budget']) { blank(cv[k], k.toUpperCase(), ''); centerNote(cv[k], why); }
      return ['moon', 'windows', 'budget'];
    }
    // Moon over the next 30 days.
    {
      const { g, w, h } = blank(cv.moon, 'MOON · NEXT 30 DAYS', `from ${fUT(ut).slice(0, 10)} · this install's orbit elements`);
      const pts: { t: number; dec: number; dist: number; ill: number; el: number; wax: boolean }[] = [];
      for (let t = ut!; t <= ut! + 30 * 86400; t += 3 * 3600) {
        const m = moonGeometry(sys!, t);
        if (m) pts.push({ t, dec: m.dec, dist: m.dist / 1000, ill: m.illuminated, el: m.elongation, wax: m.waxing });
      }
      const L = w * 0.04, R = w * 0.97, T = h * 0.14, B = h * 0.84;
      // Phase as a background band.
      for (let i = 0; i < pts.length - 1; i++) {
        const x0 = L + ((pts[i].t - ut!) / (30 * 86400)) * (R - L), x1 = L + ((pts[i + 1].t - ut!) / (30 * 86400)) * (R - L);
        g.fillStyle = `rgba(220,230,240,${0.03 + pts[i].ill * 0.1})`;
        g.fillRect(x0, T, x1 - x0 + 1, B - T);
      }
      const decs = pts.map((p) => [p.t, p.dec + 30] as [number, number]);
      chart(g, L, T, R, B, [
        { pts: decs, color: PAL.predicted, max: 60 },
        { pts: pts.map((p) => [p.t, p.dist]), color: PAL.caution, dash: true, min: 350000, max: 410000 },
      ], [ut!, ut! + 30 * 86400]);
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], b = pts[i];
        const x = L + ((b.t - ut!) / (30 * 86400)) * (R - L);
        if (a.el > 170 !== b.el > 170 && b.el > 170) label(g, '○ FULL', x, T + h * 0.05, h * 0.03, PAL.text, 'center', 700);
        if (a.el < 10 !== b.el < 10 && b.el < 10) label(g, '● NEW', x, T + h * 0.05, h * 0.03, PAL.dim, 'center', 700);
      }
      for (let d = 0; d <= 30; d += 5) label(g, `+${d} d`, L + (d / 30) * (R - L), B + h * 0.05, h * 0.026, PAL.dim, 'center');
      legend(g, L, h * 0.96, h * 0.03, [['Declination (−30° to +30°)', PAL.predicted], ['Distance (350,000 to 410,000 km)', PAL.caution], ['Brightness = illuminated fraction', '#8090a0']]);
    }
    // Departure windows.
    {
      const { g, w, h } = blank(cv.windows, 'DEPARTURE WINDOWS FROM EARTH', 'Hohmann, circular coplanar');
      const E = sys!.get('Earth');
      const rows: string[][] = [];
      for (const p of ['Mars', 'Venus']) {
        const ws = transferWindows(sys!, 'Earth', p, ut!, 3 * 365 * 86400, 2);
        const phase = phaseAngle(sys!, 'Earth', p, ut!);
        for (const x of ws) rows.push([p, fDate(x.ut), fNum(inject(E!.gm!, E!.radius! + LEO_ALT, x.dv1), 0), fNum(x.tof / 86400, 0), `${fNum(phase, 1)}° → ${fNum(x.phase, 1)}°`]);
        if (!ws.length) rows.push([p, 'none in 3 years', '—', '—', '—']);
      }
      table(g, w * 0.04, h * 0.16, w * 0.92, h * 0.08, [{ label: 'Target', w: 1.2 }, { label: 'Depart', w: 2.2, mono: true }, { label: 'Δv from LEO', w: 1.6, align: 'right' }, { label: 'Days', w: 0.9, align: 'right' }, { label: 'Phase now → needed', w: 2.6, align: 'right' }], rows);
      label(g, 'Real porkchop minima differ by days to weeks (eccentric, inclined orbits).', w * 0.04, h * 0.94, h * 0.028, PAL.dim);
    }
    // Δv budget against the live vehicle.
    {
      const { g, w, h } = blank(cv.budget, 'Δv BUDGET', f?.vessel.name ? `vs ${f.vessel.name}` : 'no live vehicle');
      const b = budget(sys!, ut!) ?? [];
      const avail = f?.prop.totalDv ?? null;
      b.forEach((x, i) => {
        const y = h * 0.15 + i * h * 0.12;
        label(g, x.label, w * 0.05, y, h * 0.032, PAL.text, 'left', 600);
        label(g, `${fNum(x.dv, 0)} m/s`, w * 0.95, y, h * 0.032, PAL.text, 'right', 600, true);
        label(g, x.note, w * 0.05, y + h * 0.038, h * 0.022, PAL.dim);
        bar(g, w * 0.05, y + h * 0.05, w * 0.9, h * 0.015, avail === null ? null : Math.min(1, avail / x.dv), avail !== null && avail >= x.dv ? '#7fd19b' : PAL.caution);
      });
      label(g, avail === null ? 'Bars fill with the live vehicle\'s Δv when KSP is in a flight scene' : `Live vehicle: ${fNum(avail, 0)} m/s total (vacuum)`, w * 0.05, h * 0.95, h * 0.028, PAL.dim);
    }
    return ['moon', 'windows', 'budget'];
  },

  monitor(id, ctx) {
    const sys = ctx.data.system, ut = gameUt(ctx);
    if (!sys || ut === null) return { rows: [['Body orbits', sys ? 'no game time' : 'loading']], level: 'nodata' };
    if (id === 'TRAJ') {
      const m = moonGeometry(sys, ut);
      return { rows: m ? [['Phase', `${Math.round(m.illuminated * 100)}% ${m.waxing ? 'waxing' : 'waning'}`], ['Declination', `${fNum(m.dec, 2)}°`], ['Distance', `${fNum(m.dist / 1000, 0)} km`]] : [['Moon', 'no data']], level: m ? 'nominal' : 'nodata' };
    }
    if (id === 'WINDOWS') {
      const rows: [string, string][] = [];
      for (const p of ['Mars', 'Venus']) { const w = transferWindows(sys, 'Earth', p, ut, 3 * 365 * 86400, 1)[0]; rows.push([p, w ? fDate(w.ut) : 'none']); }
      return { rows, level: 'nominal' };
    }
    if (id === 'BUDGET') {
      const b = budget(sys, ut) ?? [];
      return { rows: b.slice(0, 4).map((x) => [x.label.replace('Trans-lunar injection', 'TLI').replace('Lunar orbit insertion', 'LOI'), `${fNum(x.dv, 0)} m/s`]), level: 'nominal' };
    }
    const cs = ctx.store.career?.summary.contracts.active ?? [];
    return { rows: [['Active contracts', String(cs.length)], ['Next deadline', cs.filter((c) => c.dueUT).sort((a, b) => a.dueUT! - b.dueUT!)[0]?.dueUT ? fDate(cs.filter((c) => c.dueUT).sort((a, b) => a.dueUT! - b.dueUT!)[0].dueUT) : '—']], level: ctx.store.career ? 'nominal' : 'nodata' };
  },

  panel(id, ctx) {
    const sys = ctx.data.system, ut = gameUt(ctx);
    const pos = id ?? 'TRAJ';
    const title = mdc.consoles.find((c) => c.id === pos)?.title ?? '';
    const ok = !!sys && ut !== null;
    const head = `<header><div><div class="pos">${pos}</div><div class="ptitle">${esc(title)}</div></div><div class="lamp ${ok ? 'nominal' : 'nodata'}">${ok ? 'OK' : 'NO DATA'}</div></header>`;
    if (!ok && pos !== 'CONTRACTS') return head + `<p class="muted">${sys ? 'No game time yet.' : 'Body orbits not loaded (needs the RSS Kopernicus configs from the install).'}</p>`;
    if (pos === 'WINDOWS') {
      const rows = ['Mars', 'Venus'].flatMap((p) => transferWindows(sys!, 'Earth', p, ut!, 4 * 365 * 86400, 3).map((w) => `<div class="row"><span class="k">${p}</span><span class="v small">${fDate(w.ut)} · ${fNum(w.tof / 86400, 0)} d</span></div>`)).join('');
      return head + rows + '<p class="muted foot">Times when Earth–target phase matches the Hohmann phase, from this install\'s orbit elements. Use Transfer Window Planner in KSP for exact porkchop plots.</p>';
    }
    if (pos === 'BUDGET') {
      const b = budget(sys!, ut!) ?? [];
      const avail = ctx.store.frame?.prop.totalDv ?? null;
      return head + b.map((x) => `<div class="row"><span class="k">${esc(x.label)}</span><span class="v small">${fNum(x.dv, 0)} m/s ${avail === null ? '' : avail >= x.dv ? '✓' : '✗'}</span></div><div class="muted small">${esc(x.note)}</div>`).join('') +
        `<p class="muted foot">${avail === null ? 'No live vehicle.' : `Live vehicle ${esc(ctx.store.frame?.vessel.name)}: ${fNum(avail, 0)} m/s.`} Ideal (impulsive) values from the body orbits; add margins for steering and boil-off.</p>`;
    }
    if (pos === 'CONTRACTS') {
      const cs = ctx.store.career?.summary.contracts.active ?? [];
      return head + (cs.map((c) => `<div class="contract"><div class="ct">${esc(c.title)}</div>${c.dueUT ? `<div class="row"><span class="k">Deadline</span><span class="v small">${fDate(c.dueUT)}</span></div>` : ''}${c.parameters.map((p) => `<div class="row"><span class="k">${esc(p.title)}</span><span class="v small">${esc(p.state)}</span></div>`).join('')}</div>`).join('') || '<p class="muted">No active contracts.</p>');
    }
    const days = Array.from({ length: 15 }, (_, i) => ut! + i * 2 * 86400).map((t) => { const m = moonGeometry(sys!, t)!; return `<div class="row"><span class="k mono">${fDate(t)}</span><span class="v small">${Math.round(m.illuminated * 100)}% · dec ${fNum(m.dec, 1)}° · ${fNum(m.dist / 1000, 0)} km</span></div>`; }).join('');
    return head + days + '<p class="muted foot">Launch-to-TLI timing depends on the Moon\'s declination against the launch site latitude: low-declination days allow lower-inclination parking orbits.</p>';
  },
};
