import type { FlightAnalysis } from '@myksp/shared';
import { RoomKit, v3 } from '../kit';
import { blank, centerNote, chart, kpi, label, legend, PAL, table } from '../canvaskit';
import { esc, fDist, fDur, fMet, fNum, fSpeed } from '../format';
import { setSource } from '../store';
import type { Ctx, Env } from './types';

/**
 * Mission Evaluation Room (design §4.4): every recorded flight can be scrubbed here, with the
 * CAPCOM events and the limit violations the live room would have raised, replayed through the
 * same detector and checks. Data: the bridge's JSONL recordings (and the 2026-08 flight log).
 */
const KEY = 'myksp.mer';
let sel: string | null = null;
let cursor: number | null = null;
try { sel = localStorage.getItem(KEY); } catch { /* private mode */ }

function current(ctx: Ctx): FlightAnalysis | null {
  const recs = ctx.store.recordings;
  if (!sel || !recs.some((r) => r.file === sel)) sel = recs[0]?.file ?? null;
  if (!sel) return null;
  const a = ctx.data.analyses.get(sel);
  if (!a) ctx.data.loadAnalysis(sel);
  return a ?? null;
}

const LVL_COLOR = { caution: PAL.caution, warning: PAL.warning } as Record<string, string>;
let drawnKey = '';

export const mer: Env = {
  id: 'mer',
  code: 'MER',
  name: 'Mission Evaluation Room',
  purpose: 'Post-flight: scrub any recorded flight, with its events and limit violations',
  consoles: [
    { id: 'SUMMARY', title: 'Flight summary' },
    { id: 'EVENTS', title: 'Events (flight loop)' },
    { id: 'LIMITS', title: 'Limit violations' },
    { id: 'TRAJ', title: 'Trajectory engineer' },
    { id: 'OBJ', title: 'Contract objectives' },
  ],
  screens: [
    { key: 'plot', w: 2048, h: 1024, label: 'Flight plot' },
    { key: 'events', w: 1024, h: 1024, label: 'Events and violations' },
    { key: 'summary', w: 1024, h: 1024, label: 'Summary' },
  ],

  build() {
    const W = 20, D = 16, H = 5.5, F = -8;
    const k = new RoomKit('#07090c', [20, 40]);
    k.shell({ w: W, d: D, h: H, front: F, wall: '#2a2e33', floor: '#24272b', ceil: '#15171a' });
    k.sidePanels(W, F, F + D, 2.6, 2.4);
    k.screen('plot', 2048, 1024, 8, 4, 0, 3.0, F + 0.02);
    k.screen('events', 1024, 1024, 3.6, 3.6, -6.6, 2.9, F + 0.02);
    k.screen('summary', 1024, 1024, 3.6, 3.6, 6.6, 2.9, F + 0.02);
    k.table(0, -0.5, 9, 2.6);
    const spots: [string, number, number, number][] = [
      ['SUMMARY', -3.2, -2.6, 0], ['TRAJ', 0, -2.6, 0], ['EVENTS', 3.2, -2.6, 0],
      ['LIMITS', -2.4, 2.6, 0], ['OBJ', 2.4, 2.6, 0],
    ];
    for (const [id, x, z, r] of spots) k.console(id, x, 0, z + 1.2, { rotY: r, width: 2.6, view: { pos: v3(x * 0.8, 2.6, z + 4.6), look: v3(x * 0.3, 2.6, F) } });
    k.coffers([-5, 0, 5], [-4, 0, 4], H, '#6a6152', [3, 1]);
    k.lights([-4, 1], H, F, { spillI: 18 });
    drawnKey = '';
    return k.finish({ pos: v3(0, 3.4, 9.5), look: v3(0, 2.6, F) });
  },

  enter(ctx) { if (sel) ctx.data.loadAnalysis(sel); },

  draw(cv, ctx) {
    const a = current(ctx);
    const key = `${sel}|${!!a}|${cursor}|${ctx.store.recordings.length}`;
    if (key === drawnKey) return [];
    drawnKey = key;
    if (!a) {
      for (const k of ['plot', 'events', 'summary']) {
        blank(cv[k], k.toUpperCase(), '');
        centerNote(cv[k], ctx.store.recordings.length ? 'Loading recording…' : 'No recorded flights yet', ctx.store.recordings.length ? undefined : 'The bridge records every live flight to data/recordings/');
      }
      return ['plot', 'events', 'summary'];
    }
    // Plot: altitude, velocity, dynamic pressure, g; events as ticks, violations as bands.
    {
      const { g, w, h } = blank(cv.plot, `FLIGHT PLOT · ${a.vessel ?? ''}`, sel ?? '');
      const L = w * 0.05, R = w * 0.97, T = h * 0.14, B = h * 0.86;
      const s = a.series;
      const xr: [number, number] = [a.startMet ?? 0, Math.max(a.endMet ?? 1, (a.startMet ?? 0) + 1)];
      for (const v of a.violations) {
        if (v.startMet === null) continue;
        const x0 = L + ((v.startMet - xr[0]) / (xr[1] - xr[0])) * (R - L), x1 = L + (((v.endMet ?? v.startMet) - xr[0]) / (xr[1] - xr[0])) * (R - L);
        g.fillStyle = v.level === 'warning' ? 'rgba(255,77,77,0.14)' : 'rgba(242,177,52,0.12)';
        g.fillRect(x0, T, Math.max(2, x1 - x0), B - T);
      }
      const m = chart(g, L, T, R, B, [
        { pts: s.filter((p) => p.alt !== null).map((p) => [p.met, p.alt!]), color: PAL.track },
        { pts: s.filter((p) => p.vel !== null).map((p) => [p.met, p.vel!]), color: PAL.accent },
        { pts: s.filter((p) => p.q !== null).map((p) => [p.met, p.q!]), color: PAL.caution, dash: true },
        { pts: s.filter((p) => p.g !== null).map((p) => [p.met, p.g!]), color: '#b58cff', dash: true },
      ], xr);
      if (m) {
        for (const e of a.events) {
          if (e.met === null) continue;
          const x = m.X(e.met);
          g.strokeStyle = 'rgba(216,225,232,0.35)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, T); g.lineTo(x, B); g.stroke();
          g.save(); g.translate(x + 4, T + 8); g.rotate(Math.PI / 2); label(g, e.kind.toUpperCase(), 0, 0, h * 0.022, PAL.dim, 'left', 700); g.restore();
        }
        if (cursor !== null) {
          const x = m.X(cursor);
          g.strokeStyle = PAL.text; g.lineWidth = 2; g.beginPath(); g.moveTo(x, T); g.lineTo(x, B); g.stroke();
        }
      }
      legend(g, L, h * 0.95, h * 0.03, [['Altitude', PAL.track], ['Orbital velocity', PAL.accent], ['Dynamic pressure', PAL.caution], ['G-load', '#b58cff']]);
      label(g, `${fMet(xr[0])} → ${fMet(xr[1])}`, R, h * 0.95, h * 0.03, PAL.dim, 'right');
    }
    // Events and violations.
    {
      const { g, w, h } = blank(cv.events, 'EVENTS · VIOLATIONS', `${a.events.length} · ${a.violations.length}`);
      const ev = a.events.slice(0, 14).map((e) => [fMet(e.met).replace('T+ ', ''), e.text]);
      const n = table(g, w * 0.04, h * 0.13, w * 0.92, h * 0.045, [{ label: 'MET', w: 1.3, mono: true }, { label: 'Event', w: 4 }], ev);
      const y = h * 0.13 + h * 0.045 * (n + 2);
      const vi = a.violations.slice(0, 12).map((v) => [`${v.position} ${v.label}`, `${fMet(v.startMet).replace('T+ ', '')}–${fMet(v.endMet).replace('T+ ', '')}`, v.worst]);
      if (vi.length) table(g, w * 0.04, y, w * 0.92, h * 0.045, [{ label: 'Violation', w: 2 }, { label: 'Interval', w: 2.2, mono: true }, { label: 'Worst', w: 2.6 }], vi, a.violations.map((v) => LVL_COLOR[v.level]));
      else label(g, 'No limit violations in this flight', w * 0.04, y, h * 0.035, '#7fd19b', 'left', 600);
    }
    // Summary, plus the state at the cursor.
    {
      const { g, w, h } = blank(cv.summary, 'FLIGHT SUMMARY', a.reachedOrbit ? 'REACHED ORBIT' : 'SUBORBITAL / INCOMPLETE');
      const rows: [string, string][] = [
        ['Duration', fDur(a.duration)], ['Max altitude', fDist(a.maxAlt)], ['Max orbital speed', fSpeed(a.maxSpeed)],
        ['Max Q', a.maxQ ? `${fNum(a.maxQ.value, 1)} kPa at ${fMet(a.maxQ.met)}` : '—'], ['Max G', a.maxG ? `${fNum(a.maxG.value, 2)} g at ${fMet(a.maxG.met)}` : '—'],
        ['Bodies', a.bodies.join(', ') || '—'], ['Frames', fNum(a.frames)],
      ];
      rows.forEach(([k, v], i) => kpi(g, w * 0.05, h * 0.15 + i * h * 0.105, h * 0.05, k, v));
      if (cursor !== null) {
        const p = a.series.reduce((b, s) => (Math.abs(s.met - cursor!) < Math.abs(b.met - cursor!) ? s : b), a.series[0]);
        if (p) label(g, `At ${fMet(p.met)}: alt ${fDist(p.alt)}, v ${fSpeed(p.vel)}, q ${fNum(p.q, 1)} kPa`, w * 0.05, h * 0.95, h * 0.03, PAL.text, 'left', 600);
      }
    }
    return ['plot', 'events', 'summary'];
  },

  monitor(id, ctx) {
    const a = current(ctx);
    if (!a) return { rows: [['Recording', ctx.store.recordings.length ? 'loading' : 'none yet']], level: 'nodata' };
    switch (id) {
      case 'SUMMARY': return { rows: [['Vessel', a.vessel ?? '—'], ['Duration', fDur(a.duration)], ['Orbit', a.reachedOrbit ? 'YES' : 'NO'], ['Max alt', fDist(a.maxAlt)]], level: 'nominal' };
      case 'EVENTS': return { rows: a.events.slice(-5).map((e) => [fMet(e.met).replace('T+ ', ''), e.text.slice(0, 26)]), level: 'nominal' };
      case 'LIMITS': return { rows: a.violations.length ? a.violations.slice(0, 5).map((v) => [`${v.position} ${v.label}`, v.level.toUpperCase(), LVL_COLOR[v.level]]) : [['Violations', 'none']], level: a.violations.some((v) => v.level === 'warning') ? 'warning' : a.violations.length ? 'caution' : 'nominal' };
      case 'TRAJ': return { rows: [['Max Q', a.maxQ ? `${fNum(a.maxQ.value, 1)} kPa` : '—'], ['Max G', a.maxG ? `${fNum(a.maxG.value, 2)} g` : '—'], ['Max v', fSpeed(a.maxSpeed)]], level: 'nominal' };
      default: return { rows: [['Active contracts', String(ctx.store.career?.summary.contracts.active.length ?? '—')]], level: ctx.store.career ? 'nominal' : 'nodata' };
    }
  },

  panel(id, ctx) {
    const a = current(ctx);
    const recs = ctx.store.recordings;
    const list = recs.map((r) => `<button class="item ${r.file === sel ? 'sel' : ''}" data-act="pick" data-file="${esc(r.file)}"><div class="t">${esc(r.file.replace(/\.jsonl$/, ''))}</div><div class="m"><span>${(r.bytes / 1024).toFixed(0)} KB</span><span>${esc(r.modified.slice(0, 16).replace('T', ' '))}</span></div></button>`).join('');
    const scrub = a && a.startMet !== null && a.endMet !== null
      ? `<h3>Scrub</h3><input class="wide" type="range" data-act="scrub" min="${a.startMet}" max="${a.endMet}" step="${Math.max(0.25, (a.endMet - a.startMet) / 1000)}" value="${cursor ?? a.startMet}"><div class="muted small">${cursor === null ? 'Drag to place a cursor on the wall plot' : fMet(cursor)}</div>
         <div class="btns"><button data-act="replay">Replay in the Flight Control Room</button><button data-act="clear">Clear cursor</button></div>` : '';
    let body = '';
    if (!a) body = `<p class="muted">${recs.length ? 'Loading the selected recording…' : 'No recordings yet. Every live flight is recorded automatically.'}</p>`;
    else if (id === 'EVENTS') body = `<div class="log">${a.events.map((e) => `<div><span class="met">${esc(fMet(e.met))}</span> ${esc(e.text)}</div>`).join('') || '<div class="muted">No events</div>'}</div>`;
    else if (id === 'LIMITS') body = a.violations.length ? a.violations.map((v) => `<div class="alert ${v.level}"><b>${v.position}</b> ${esc(v.label)} ${esc(fMet(v.startMet))} to ${esc(fMet(v.endMet))}: ${esc(v.worst)}</div>`).join('') : '<p>No limit violations: every check stayed within caution limits.</p>';
    else if (id === 'OBJ') {
      const cs = ctx.store.career?.summary.contracts.active ?? [];
      body = `<p class="muted small">Active contracts and the state KSP has recorded for each objective, next to this flight's facts. KSP decides completion; this room only shows it.</p>` +
        (cs.map((c) => `<div class="contract"><div class="ct">${esc(c.title)}</div>${c.parameters.map((p) => `<div class="row"><span class="k">${esc(p.title)}</span><span class="v small">${esc(p.state)}</span></div>`).join('')}</div>`).join('') || '<div class="muted">No active contracts</div>');
    } else body = `<div class="kpis"><div><span>Duration</span><b class="small">${fDur(a.duration)}</b></div><div><span>Max altitude</span><b class="small">${fDist(a.maxAlt)}</b></div><div><span>Max Q</span><b class="small">${a.maxQ ? fNum(a.maxQ.value, 1) + ' kPa' : '—'}</b></div><div><span>Orbit</span><b class="small">${a.reachedOrbit ? 'Reached' : 'No'}</b></div></div>`;
    const title = mer.consoles.find((c) => c.id === (id ?? 'SUMMARY'))?.title ?? '';
    return `<header><div><div class="pos">${id ?? 'MER'}</div><div class="ptitle">${esc(title)}</div></div><div class="lamp ${a ? 'nominal' : 'nodata'}">${a ? 'LOADED' : 'NO DATA'}</div></header>
      ${body}${scrub}<h3>Recorded flights (${recs.length})</h3><div class="list">${list || '<div class="muted">None</div>'}</div>`;
  },

  action(el, ctx, ev) {
    const act = el.dataset.act;
    if (act === 'pick' && ev.type === 'click') { sel = el.dataset.file ?? null; cursor = null; try { localStorage.setItem(KEY, sel ?? ''); } catch { /* */ } if (sel) ctx.data.loadAnalysis(sel); ctx.refresh(); return true; }
    if (act === 'scrub' && (ev.type === 'input' || ev.type === 'change')) { cursor = Number((el as HTMLInputElement).value); drawnKey = ''; return true; }
    if (act === 'clear' && ev.type === 'click') { cursor = null; drawnKey = ''; ctx.refresh(); return true; }
    if (act === 'replay' && ev.type === 'click' && sel) { void setSource('replay', sel, 1).then(() => ctx.go('fcr')); return true; }
    return false;
  },
};
