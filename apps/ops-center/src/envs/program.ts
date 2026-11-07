import { blank, centerNote, chart, kpi, label, legend, PAL, table } from '../canvaskit';
import { esc, fMoney, fNum, utToDate } from '../format';
import { programHtml } from '../program';
import { contractPhase, gameDate, missionStates, STATE_COLOR, wallRoom, windowMs, type MissionState } from './common';
import type { Ctx, Env } from './types';

/**
 * Program Office (design §4.2): the program manifest from the research thread on a 2026-2032
 * timeline against the game date, contracts by program phase (contracts thread metadata joined on
 * the CONTRACT subtype), funds/science/reputation trends from KSP's own backups and the bridge's
 * history log, facility levels, and progress toward the permanent lunar base.
 */
let drawnKey = '';

function planningNote(ctx: Ctx) {
  const p = ctx.data.planning;
  if (!p) return ctx.data.errors.planning ? `Planning data unavailable: ${ctx.data.errors.planning}` : 'Loading planning data…';
  if (!p.manifest) return 'No program manifest in this checkout (docs/research/artemis-manifest.json)';
  return null;
}

export const program: Env = {
  id: 'program',
  code: 'PO',
  name: 'Program Office',
  purpose: 'Program manifest, contracts by phase, budget trends and the lunar base goal',
  consoles: [
    { id: 'PM', title: 'Program manager' },
    { id: 'MANIFEST', title: 'Manifest' },
    { id: 'CONTRACTS', title: 'Contracts by phase' },
    { id: 'BUDGET', title: 'Budget and trends' },
    { id: 'BASE', title: 'Lunar base goal' },
    { id: 'FACILITIES', title: 'Facilities' },
  ],
  screens: [
    { key: 'timeline', w: 2048, h: 900, label: 'Program manifest' },
    { key: 'trend', w: 1024, h: 768, label: 'Funds, science, reputation' },
    { key: 'phases', w: 1024, h: 768, label: 'Contracts by phase' },
  ],

  build() {
    drawnKey = '';
    return wallRoom({
      W: 22, D: 16, H: 5.2, wall: '#2b2a28', floor: '#2a2622', coffer: '#6a5c48',
      screens: [
        { key: 'timeline', cw: 2048, ch: 900, w: 9.4, h: 4.13, x: 0, y: 2.75 },
        { key: 'trend', cw: 1024, ch: 768, w: 4.4, h: 3.3, x: -2.2, y: 2.6, wall: 'left' },
        { key: 'phases', cw: 1024, ch: 768, w: 4.4, h: 3.3, x: -2.2, y: 2.6, wall: 'right' },
      ],
      table: [0, 1.2, 8, 2.4],
      seats: [
        { id: 'PM', x: 0, z: 4.6, rotY: Math.PI, width: 2.6 },
        { id: 'MANIFEST', x: -2.8, z: -1.6, width: 2.6 }, { id: 'CONTRACTS', x: 0, z: -1.6, width: 2.6 }, { id: 'BUDGET', x: 2.8, z: -1.6, width: 2.6 },
        { id: 'BASE', x: -3.2, z: 4.0, rotY: Math.PI, width: 2.4 }, { id: 'FACILITIES', x: 3.2, z: 4.0, rotY: Math.PI, width: 2.4 },
      ],
      overview: { pos: [0, 3.6, 7.4], look: [0, 2.6, -8] },
    });
  },

  enter(ctx) { ctx.data.loadPlanning(); ctx.data.loadHistory(); drawnKey = ''; },

  draw(cv, ctx) {
    const p = ctx.data.planning, c = ctx.store.career?.summary, hist = ctx.data.history;
    const today = gameDate(ctx);
    const key = `${!!p}|${c?.ut}|${c?.contracts.active.length}|${c?.contracts.completedCount}|${hist?.length}|${today?.toISOString().slice(0, 10)}`;
    if (key === drawnKey) return [];
    drawnKey = key;
    const states = missionStates(p, c?.contracts);
    // Manifest timeline: one bar per mission across its window, coloured by its contract state.
    {
      const { g, w, h } = blank(cv.timeline, 'PROGRAM MANIFEST · 2026–2032', p?.manifest?.as_of ? `research as of ${p.manifest.as_of}` : '');
      const note = planningNote(ctx);
      if (note) centerNote(cv.timeline, note);
      else {
        const ms = (p!.manifest!.missions ?? []).filter((m) => windowMs(m.window?.start) !== null);
        const t0 = Date.UTC(2026, 0, 1), t1 = Date.UTC(2032, 0, 1);
        const L = w * 0.2, R = w * 0.98, T = h * 0.12, B = h * 0.9;
        const X = (t: number) => L + ((Math.min(t1, Math.max(t0, t)) - t0) / (t1 - t0)) * (R - L);
        for (let y = 2026; y <= 2032; y++) {
          const x = X(Date.UTC(y, 0, 1));
          g.strokeStyle = PAL.grid; g.lineWidth = 1; g.beginPath(); g.moveTo(x, T); g.lineTo(x, B); g.stroke();
          label(g, String(y), x + 4, B + h * 0.04, h * 0.026, PAL.dim, 'left', 600);
        }
        const rowH = (B - T) / Math.max(ms.length, 1);
        ms.sort((a, b) => windowMs(a.window?.start)! - windowMs(b.window?.start)!);
        ms.forEach((m, i) => {
          const y = T + i * rowH;
          const st = states.get(m.id)?.state ?? 'no contract';
          const x0 = X(windowMs(m.window?.start)!), x1 = Math.max(x0 + 6, X(windowMs(m.window?.end ?? m.window?.start, true) ?? windowMs(m.window?.start)!));
          g.fillStyle = STATE_COLOR[st];
          g.globalAlpha = m.status === 'proposed' ? 0.45 : 0.85;
          g.fillRect(x0, y + rowH * 0.18, x1 - x0, rowH * 0.64);
          g.globalAlpha = 1;
          label(g, m.name, L - 10, y + rowH * 0.72, Math.min(rowH * 0.62, h * 0.024), m.category === 'crewed' ? PAL.text : PAL.dim, 'right', m.category === 'crewed' ? 700 : 500);
        });
        if (today) {
          const x = X(today.getTime());
          g.strokeStyle = PAL.warning; g.lineWidth = 2; g.beginPath(); g.moveTo(x, T - 6); g.lineTo(x, B); g.stroke();
          label(g, `GAME DATE ${today.toISOString().slice(0, 10)}`, x + 6, T - 2, h * 0.024, PAL.warning, 'left', 700);
        }
        legend(g, L, h * 0.985, h * 0.024, (Object.keys(STATE_COLOR) as MissionState[]).map((s) => [s, STATE_COLOR[s]]));
      }
    }
    // Trends.
    {
      const { g, w, h } = blank(cv.trend, 'FUNDS · SCIENCE · REPUTATION', hist ? `${hist.length} points` : '');
      const pts = hist ?? [];
      if (pts.length < 2) centerNote(cv.trend, pts.length ? 'One data point so far' : ctx.data.errors.history ? 'History unavailable' : 'Loading history…', 'Trends come from the save\'s Backup/ snapshots and every state the bridge has seen');
      else {
        const xr: [number, number] = [pts[0].ut, pts[pts.length - 1].ut];
        chart(g, w * 0.06, h * 0.14, w * 0.96, h * 0.84, [
          { pts: pts.filter((x) => x.funds !== null).map((x) => [x.ut, x.funds!]), color: '#7fd19b' },
          { pts: pts.filter((x) => x.science !== null).map((x) => [x.ut, x.science!]), color: PAL.predicted },
          { pts: pts.filter((x) => x.reputation !== null).map((x) => [x.ut, x.reputation!]), color: PAL.caution },
        ], xr);
        legend(g, w * 0.06, h * 0.94, h * 0.032, [['Funds', '#7fd19b'], ['Science', PAL.predicted], ['Reputation', PAL.caution]]);
        label(g, `${utToDate(xr[0]).toISOString().slice(0, 10)} → ${utToDate(xr[1]).toISOString().slice(0, 10)}`, w * 0.96, h * 0.94, h * 0.028, PAL.dim, 'right');
        label(g, 'Each series scaled to its own maximum', w * 0.96, h * 0.12, h * 0.024, PAL.dim, 'right');
      }
    }
    // Contracts by phase.
    {
      const { g, w, h } = blank(cv.phases, 'CONTRACTS BY PROGRAM PHASE', c ? `${c.contracts.completedCount} completed` : '');
      if (!c) centerNote(cv.phases, ctx.store.careerError ? 'Career save unavailable' : 'Loading career…');
      else {
        const phases = p?.contractMeta?.phases ?? [];
        const meta = p?.contractMeta?.contracts ?? {};
        const done = new Set(c.contracts.completedTypes);
        const rows = phases.map((ph) => {
          const ids = Object.entries(meta).filter(([, m]) => m.phase === ph.id).map(([id]) => id);
          const act = c.contracts.active.filter((x) => contractPhase(p, x.subtype) === ph.id).length;
          const off = c.contracts.offered.filter((x) => contractPhase(p, x.subtype) === ph.id).length;
          return [ph.label, String(ids.length), String(ids.filter((i) => done.has(i)).length), String(act), String(off)];
        });
        const other = c.contracts.active.filter((x) => !contractPhase(p, x.subtype)).length;
        rows.push(['Other (stock / RP-1 contracts)', '—', '—', String(other), String(c.contracts.offered.filter((x) => !contractPhase(p, x.subtype)).length)]);
        table(g, w * 0.04, h * 0.16, w * 0.92, h * 0.075, [{ label: 'Phase', w: 5 }, { label: 'Defined', w: 1.2, align: 'right' }, { label: 'Done', w: 1, align: 'right' }, { label: 'Active', w: 1.1, align: 'right' }, { label: 'Offered', w: 1.2, align: 'right' }], rows);
        if (!phases.length) label(g, 'Contract metadata not found in this checkout (contracts/manifest/contract-meta.json)', w * 0.04, h * 0.9, h * 0.026, PAL.dim);
      }
    }
    return ['timeline', 'trend', 'phases'];
  },

  monitor(id, ctx) {
    const c = ctx.store.career?.summary, p = ctx.data.planning;
    if (!c) return { rows: [['Career', ctx.store.careerError ? 'unavailable' : 'loading']], level: 'nodata' };
    const states = missionStates(p, c.contracts);
    const count = (s: MissionState) => [...states.values()].filter((x) => x.state === s).length;
    switch (id) {
      case 'MANIFEST': return { rows: [['Missions', String(p?.manifest?.missions?.length ?? '—')], ['Completed', String(count('completed'))], ['Active', String(count('active'))], ['Offered', String(count('offered'))]], level: p?.manifest ? 'nominal' : 'nodata' };
      case 'CONTRACTS': return { rows: [['Active', String(c.contracts.active.length)], ['Offered', String(c.contracts.offered.length)], ['Completed', String(c.contracts.completedCount)], ['Failed', String(c.contracts.failedCount)]], level: 'nominal' };
      case 'BUDGET': return { rows: [['Funds', fMoney(c.funds)], ['Science', fNum(c.science, 1)], ['Reputation', fNum(c.reputation)], ['Trend points', String(ctx.data.history?.length ?? '—')]], level: 'nominal' };
      case 'BASE': {
        const base = (p?.manifest?.missions ?? []).filter((m) => m.phase?.startsWith('moon_base'));
        const doneN = base.filter((m) => states.get(m.id)?.state === 'completed').length;
        return { rows: [['Base missions', String(base.length)], ['Completed', String(doneN)], ['Goal', 'Permanent lunar base']], level: p?.manifest ? 'nominal' : 'nodata' };
      }
      case 'FACILITIES': return { rows: c.facilities.slice(0, 6).map((f) => [f.id.replace(/^SpaceCenter\//, ''), f.level === null ? '—' : `${Math.round(f.level * 100)}%`]), level: 'nominal' };
      default: return { rows: [['Save', ctx.store.career?.save ?? '—'], ['Mode', c.mode ?? '—'], ['Game date', gameDate(ctx)?.toISOString().slice(0, 10) ?? '—'], ['Funds', fMoney(c.funds)]], level: 'nominal' };
    }
  },

  panel(id, ctx) {
    const c = ctx.store.career?.summary, p = ctx.data.planning;
    const head = (pos: string, title: string, lamp = 'nominal', txt = 'OK') => `<header><div><div class="pos">${pos}</div><div class="ptitle">${esc(title)}</div></div><div class="lamp ${lamp}">${txt}</div></header>`;
    if (!id || id === 'PM') return programHtml(ctx.store);
    const states = missionStates(p, c?.contracts);
    if (id === 'MANIFEST' || id === 'BASE') {
      const note = planningNote(ctx);
      if (note) return head(id, id === 'BASE' ? 'Lunar base goal' : 'Manifest', 'nodata', 'NO DATA') + `<p class="muted">${esc(note)}</p>`;
      let ms = p!.manifest!.missions ?? [];
      if (id === 'BASE') ms = ms.filter((m) => m.phase?.startsWith('moon_base'));
      const items = ms.map((m) => {
        const s = states.get(m.id);
        return `<div class="contract"><div class="ct">${esc(m.name)} <span class="pill" style="border-color:${STATE_COLOR[s?.state ?? 'no contract']};color:${STATE_COLOR[s?.state ?? 'no contract']}">${s?.state ?? '—'}</span></div>
          <div class="row"><span class="k">Window</span><span class="v small">${esc(m.window?.start ?? '?')}${m.window?.end && m.window.end !== m.window.start ? ` to ${esc(m.window.end)}` : ''} · ${esc(m.status ?? '')} · ${esc(m.confidence ?? '')}</span></div>
          ${m.launch_vehicle ? `<div class="row"><span class="k">Vehicle</span><span class="v small">${esc(m.launch_vehicle)}</span></div>` : ''}
          ${m.destination ? `<div class="row"><span class="k">Destination</span><span class="v small">${esc(m.destination)}</span></div>` : ''}
          ${id === 'BASE' && m.base_contribution ? `<div class="muted small">${esc(m.base_contribution)}</div>` : ''}
          ${m.dependencies?.length ? `<div class="muted small">Needs: ${m.dependencies.map(esc).join(', ')}</div>` : ''}
          ${s?.contracts.length ? `<div class="muted small">Contracts: ${s.contracts.map(esc).join(', ')}</div>` : ''}</div>`;
      }).join('');
      const goal = id === 'BASE' ? `<p>${esc(p!.manifest!.career_goal ?? 'Permanent lunar base')}</p>` : '';
      return head(id, id === 'BASE' ? 'Lunar base goal' : `Manifest (${ms.length} missions)`) + goal + items;
    }
    if (!c) return head(id, program.consoles.find((x) => x.id === id)?.title ?? '', 'nodata', 'NO DATA') + '<p class="muted">Career save not loaded yet.</p>';
    if (id === 'CONTRACTS') {
      const row = (x: (typeof c.contracts.active)[number]) => `<div class="contract"><div class="ct">${esc(x.title)}</div><div class="row"><span class="k">Phase</span><span class="v small">${esc(p?.contractMeta?.phases?.find((ph) => ph.id === contractPhase(p, x.subtype))?.label ?? 'not a myKSP contract')}</span></div><div class="row"><span class="k">Reward</span><span class="v small">${fMoney(x.fundsCompletion)}</span></div></div>`;
      return head(id, 'Contracts by phase') + `<h3>Active (${c.contracts.active.length})</h3>${c.contracts.active.map(row).join('') || '<div class="muted">None</div>'}<h3>Offered (${c.contracts.offered.length})</h3>${c.contracts.offered.slice(0, 30).map(row).join('') || '<div class="muted">None</div>'}`;
    }
    if (id === 'BUDGET') {
      const h = ctx.data.history ?? [];
      const rows = h.slice(-20).reverse().map((x) => `<div class="row"><span class="k mono">${utToDate(x.ut).toISOString().slice(0, 10)}</span><span class="v small">${fMoney(x.funds)} · ${fNum(x.science, 1)} sci · ${fNum(x.reputation)} rep · ${x.source}</span></div>`).join('');
      return head(id, 'Budget and trends') + `<div class="kpis"><div><span>Funds</span><b>${fMoney(c.funds)}</b></div><div><span>Science</span><b>${fNum(c.science, 1)}</b></div><div><span>Reputation</span><b>${fNum(c.reputation)}</b></div></div><h3>History (${h.length} points)</h3>${rows || '<div class="muted">No history yet</div>'}<p class="muted foot">Points come from KSP's own Backup/ saves and every state the bridge has seen since it started logging.</p>`;
    }
    return head(id, 'Facilities') + '<p class="muted small">Upgrade level as KSP stores it (0 = first level, 100% = fully upgraded). CustomBarnKit sets how many levels each building has.</p>' + c.facilities.map((f) => `<div class="row"><span class="k">${esc(f.id.replace(/^SpaceCenter\//, ''))}</span><span class="v">${f.level === null ? '—' : `${Math.round(f.level * 100)}% of top level`}</span></div>`).join('');
  },
};
