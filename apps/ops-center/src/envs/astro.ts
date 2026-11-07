import { realBodyName, type CrewMember } from '@myksp/shared';
import { blank, centerNote, kpi, label, PAL, table } from '../canvaskit';
import { esc, fDate, fNum } from '../format';
import { gameUt, wallRoom } from './common';
import type { Ctx, Env } from './types';

/**
 * Astronaut Office (design §4.7): the corps as the save records it. Status, trait, flights and the
 * bodies each astronaut has flown to or landed on (CAREER_LOG), current assignment (crew aboard a
 * vessel) and availability (KSP's inactive-until time). No invented training or medical data.
 */
let drawnKey = '';
const crewOf = (ctx: Ctx) => (ctx.store.career?.summary.crew ?? []).filter((k) => k.type === 'Crew' || k.type === null);

function status(k: CrewMember, ut: number | null): { text: string; color: string } {
  if (k.state === 'Dead') return { text: 'Deceased', color: PAL.warning };
  if (k.state === 'Missing') return { text: 'Missing', color: PAL.caution };
  if (k.vessel || k.state === 'Assigned') return { text: k.vessel ? `Flying: ${k.vessel}` : 'Assigned', color: PAL.predicted };
  if (k.inactive && k.inactiveUntil !== null && (ut === null || k.inactiveUntil > ut)) return { text: `Unavailable to ${fDate(k.inactiveUntil)}`, color: PAL.caution };
  return { text: 'Available', color: '#7fd19b' };
}
const places = (xs: string[]) => xs.map((b) => realBodyName(b) ?? b).filter((b, i, a) => a.indexOf(b) === i);

export const astro: Env = {
  id: 'astro',
  code: 'CB',
  name: 'Astronaut Office',
  purpose: 'Crew roster, flight records, assignments and availability from the save',
  consoles: [
    { id: 'CHIEF', title: 'Chief of the Astronaut Office' },
    { id: 'ROSTER', title: 'Roster' },
    { id: 'ASSIGN', title: 'Crew assignments' },
    { id: 'RECORDS', title: 'Flight records' },
  ],
  screens: [
    { key: 'roster', w: 2048, h: 1024, label: 'Roster' },
    { key: 'stats', w: 1024, h: 1024, label: 'Corps statistics' },
  ],

  build() {
    drawnKey = '';
    return wallRoom({
      W: 16, D: 12, H: 4.2, wall: '#2c2d30', floor: '#25262a', coffer: '#5d574d',
      screens: [
        { key: 'roster', cw: 2048, ch: 1024, w: 6.8, h: 3.4, x: -1.6, y: 2.25 },
        { key: 'stats', cw: 1024, ch: 1024, w: 3.0, h: 3.0, x: 4.6, y: 2.25 },
      ],
      table: [0, 0.6, 6, 2],
      seats: [
        { id: 'CHIEF', x: 0, z: 3.2, rotY: Math.PI, width: 2.4 },
        { id: 'ROSTER', x: -2.2, z: -1.4, width: 2.4 }, { id: 'ASSIGN', x: 0.6, z: -1.4, width: 2.4 }, { id: 'RECORDS', x: 3.4, z: -1.4, width: 2.4 },
      ],
      overview: { pos: [0, 2.9, 5.6], look: [0, 2.1, -6] },
    });
  },

  draw(cv, ctx) {
    const crew = crewOf(ctx);
    const ut = gameUt(ctx);
    const key = `${ctx.store.career?.summary.savedAt}|${crew.length}|${ut === null ? '' : Math.floor(ut / 3600)}`;
    if (key === drawnKey) return [];
    drawnKey = key;
    {
      const { g, w, h } = blank(cv.roster, 'ASTRONAUT ROSTER', ctx.store.career ? `${crew.length} astronauts · ${ctx.store.career.save}` : '');
      if (!ctx.store.career) centerNote(cv.roster, ctx.store.careerError ? 'Career save unavailable' : 'Loading career…');
      else if (!crew.length) centerNote(cv.roster, 'No astronauts in this save');
      else {
        const sorted = [...crew].sort((a, b) => Number(!!b.vessel) - Number(!!a.vessel) || b.flights - a.flights || a.name.localeCompare(b.name));
        const st = sorted.map((k) => status(k, ut));
        table(g, w * 0.03, h * 0.13, w * 0.94, h * 0.05, [
          { label: 'Name', w: 3 }, { label: 'Role', w: 1.6 }, { label: 'Status', w: 3.2 }, { label: 'Flights', w: 0.9, align: 'right' }, { label: 'Flown to', w: 2.4 }, { label: 'Landed on', w: 2 },
        ], sorted.map((k, i) => [k.name + (k.veteran ? ' ★' : ''), k.trait ?? '—', st[i].text, String(k.flights), places(k.visited).join(', ') || '—', places(k.landed).join(', ') || '—']), st.map((s) => s.color), 16);
        if (sorted.length > 16) label(g, `+ ${sorted.length - 16} more in the ROSTER console`, w * 0.03, h * 0.97, h * 0.026, PAL.dim);
      }
    }
    {
      const { g, w, h } = blank(cv.stats, 'CORPS', '');
      if (crew.length) {
        const by = (t: string) => crew.filter((k) => k.trait === t).length;
        const avail = crew.filter((k) => status(k, ut).text === 'Available').length;
        const flying = crew.filter((k) => k.vessel).length;
        const lost = crew.filter((k) => k.state === 'Dead' || k.state === 'Missing').length;
        const items: [string, string, string?][] = [
          ['Active corps', String(crew.length - lost)], ['Available now', String(avail), '#7fd19b'], ['In flight', String(flying), PAL.predicted],
          ['Pilots · Engineers · Scientists', `${by('Pilot')} · ${by('Engineer')} · ${by('Scientist')}`],
          ['Flown in space', String(crew.filter((k) => k.flights > 0).length)],
          ['Walked on the Moon', String(crew.filter((k) => places(k.landed).includes('Moon')).length)],
          ['Lost', String(lost), lost ? PAL.warning : undefined],
        ];
        items.forEach(([k, v, c], i) => kpi(g, w * 0.07, h * 0.15 + i * h * 0.115, h * 0.055, k, v, c));
      } else centerNote(cv.stats, 'No crew data');
    }
    return ['roster', 'stats'];
  },

  monitor(id, ctx) {
    const crew = crewOf(ctx);
    if (!ctx.store.career) return { rows: [['Career', ctx.store.careerError ? 'unavailable' : 'loading']], level: 'nodata' };
    const ut = gameUt(ctx);
    if (id === 'ASSIGN') {
      const fl = crew.filter((k) => k.vessel);
      return { rows: fl.length ? fl.slice(0, 5).map((k) => [k.name.split(' ')[0], k.vessel!.slice(0, 22)]) : [['In flight', 'none']], level: 'nominal' };
    }
    if (id === 'RECORDS') {
      const top = [...crew].sort((a, b) => b.flights - a.flights).slice(0, 5);
      return { rows: top.map((k) => [k.name, `${k.flights} flights`]), level: 'nominal' };
    }
    const avail = crew.filter((k) => status(k, ut).text === 'Available').length;
    return { rows: [['Astronauts', String(crew.length)], ['Available', String(avail)], ['In flight', String(crew.filter((k) => k.vessel).length)], ['Veterans', String(crew.filter((k) => k.veteran).length)]], level: 'nominal' };
  },

  panel(id, ctx) {
    const crew = crewOf(ctx), ut = gameUt(ctx);
    const title = astro.consoles.find((c) => c.id === (id ?? 'CHIEF'))?.title ?? '';
    const head = `<header><div><div class="pos">${id ?? 'CHIEF'}</div><div class="ptitle">${esc(title)}</div></div><div class="lamp ${ctx.store.career ? 'nominal' : 'nodata'}">${ctx.store.career ? 'OK' : 'NO DATA'}</div></header>`;
    if (!ctx.store.career) return head + '<p class="muted">Career save not loaded yet.</p>';
    const card = (k: CrewMember) => {
      const s = status(k, ut);
      return `<div class="contract"><div class="ct">${esc(k.name)}${k.veteran ? ' ★' : ''} <span class="pill" style="border-color:${s.color};color:${s.color}">${esc(s.text)}</span></div>
        <div class="row"><span class="k">Role</span><span class="v small">${esc(k.trait ?? '—')}${k.gender ? ` · ${esc(k.gender)}` : ''}</span></div>
        <div class="row"><span class="k">Flights</span><span class="v small">${k.flights}</span></div>
        <div class="row"><span class="k">Flown to</span><span class="v small">${esc(places(k.visited).join(', ') || '—')}</span></div>
        <div class="row"><span class="k">Landed on</span><span class="v small">${esc(places(k.landed).join(', ') || '—')}</span></div></div>`;
    };
    if (id === 'ASSIGN') {
      const vs = (ctx.store.career.summary.vessels ?? []).filter((v) => v.crewNames.length);
      return head + (vs.map((v) => `<div class="contract"><div class="ct">${esc(v.name)}</div><div class="row"><span class="k">Where</span><span class="v small">${esc(v.situation ?? '')} · ${esc(realBodyName(v.bodyIdent) ?? '—')}</span></div>${v.crewNames.map((n) => `<div class="row"><span class="k">Crew</span><span class="v small">${esc(n)}</span></div>`).join('')}</div>`).join('') || '<p class="muted">No crew are aboard any vessel in this save.</p>')
        + '<p class="muted foot">Assignments are the crew KSP has aboard each vessel. Crew for a vessel still in the editor are not in the save.</p>';
    }
    if (id === 'RECORDS') return head + ([...crew].sort((a, b) => b.flights - a.flights).filter((k) => k.flights > 0).map(card).join('') || '<p class="muted">Nobody has flown yet.</p>');
    if (id === 'ROSTER') return head + [...crew].sort((a, b) => a.name.localeCompare(b.name)).map(card).join('');
    const avail = crew.filter((k) => status(k, ut).text === 'Available');
    return head + `<div class="kpis"><div><span>Astronauts</span><b>${crew.length}</b></div><div><span>Available</span><b>${avail.length}</b></div><div><span>In flight</span><b>${crew.filter((k) => k.vessel).length}</b></div><div><span>Veterans</span><b>${crew.filter((k) => k.veteran).length}</b></div></div>
      <h3>Available for assignment</h3>${avail.map((k) => `<div class="row"><span class="k">${esc(k.name)}</span><span class="v small">${esc(k.trait ?? '')} · ${k.flights} flights</span></div>`).join('') || '<div class="muted">Nobody</div>'}
      <p class="muted foot">From the save's roster and CAREER_LOG. ${fNum(crew.reduce((s, k) => s + k.flights, 0))} flights logged in total.</p>`;
  },
};
