import { POSITION_TITLES, type Check, type Level, type Position, type TelemetryFrame } from '@myksp/shared';
import type { Store } from './store';
import { esc, fDist, fDur, fMet, fNum, fPct, fSpeed } from './format';
import { PAL } from './screens';

export const LEVEL_COLOR: Record<Level, string> = { nominal: '#7fd19b', caution: PAL.caution, warning: PAL.warning, nodata: '#4a5864' };
export const LEVEL_WORD: Record<Level, string> = { nominal: 'GO', caution: 'CAUTION', warning: 'WARNING', nodata: 'NO DATA' };

type Row = [label: string, value: string, level?: Level];

const lvlOf = (checks: Check[], id: string): Level | undefined => checks.find((c) => c.id === id)?.level;

/** Data rows for each position. Used by both the 3D console monitors and the HTML panels. */
export function rowsFor(p: Position, f: TelemetryFrame | null, checks: Check[]): Row[] {
  if (!f) return [['Status', 'No telemetry']];
  const v = f.vessel, o = f.orbit;
  switch (p) {
    case 'FLIGHT':
      return [
        ['Vessel', v.name ?? '—'], ['Situation', v.situation ?? '—'], ['Body', v.body ?? '—'], ['MET', fMet(v.met)],
        ['Crew', fNum(v.crew)], ['Stage', fNum(v.stage)],
      ];
    case 'FDO':
      return [
        ['Apoapsis', fDist(o.ap, { escape: true })], ['Periapsis', fDist(o.pe), lvlOf(checks, 'pe')], ['Time to Ap', fDur(o.timeToAp)],
        ['Time to Pe', fDur(o.timeToPe)], ['Inclination', o.inc === null ? '—' : `${o.inc.toFixed(2)}°`], ['Eccentricity', o.ecc === null ? '—' : o.ecc.toFixed(4)],
        ['Period', fDur(o.period)], ['SMA', fDist(o.sma)], ['LAN', o.lan === null ? '—' : `${o.lan.toFixed(2)}°`],
        ['Arg Pe', o.argPe === null ? '—' : `${o.argPe.toFixed(2)}°`], ['Altitude', fDist(v.alt)], ['Radar alt', fDist(v.radarAlt)],
        ['Impact in', fDur(f.landing.timeToImpact), lvlOf(checks, 'impact')], ['Suicide burn', fDur(f.landing.suicideBurn)],
        ['Target', f.target.name ?? '—'], ['Target range', fDist(f.target.distance)], ['Rel. velocity', fSpeed(f.target.relVel)],
      ];
    case 'GNC':
      return [
        ['Heading', f.attitude.heading === null ? '—' : `${f.attitude.heading.toFixed(1)}°`],
        ['Pitch', f.attitude.pitch === null ? '—' : `${f.attitude.pitch.toFixed(1)}°`],
        ['Roll', f.attitude.roll === null ? '—' : `${f.attitude.roll.toFixed(1)}°`],
        ['G-load', fNum(v.g, 2, 'g'), lvlOf(checks, 'g')], ['AoA', f.aero.aoa === null ? '—' : `${f.aero.aoa.toFixed(1)}°`, lvlOf(checks, 'aoa')],
        ['SAS', f.control.sas === null ? '—' : f.control.sas ? `ON ${f.control.sasMode ?? ''}` : 'OFF'], ['RCS', f.control.rcs === null ? '—' : f.control.rcs ? 'ON' : 'OFF'],
        ['Stall', fPct(f.aero.stall)], ['Mach', fNum(v.mach, 2)], ['Vert. speed', fSpeed(v.vVert)], ['Horiz. speed', fSpeed(v.vHorz)],
        ['Orbital vel.', fSpeed(v.vOrb)], ['Surface vel.', fSpeed(v.vSurf)], ['Controllable', v.controllable === null ? '—' : v.controllable ? 'YES' : 'NO', lvlOf(checks, 'control')],
      ];
    case 'PROP': {
      const rows: Row[] = [
        ['Total Δv (vac)', fNum(f.prop.totalDv, 0, 'm/s'), lvlOf(checks, 'dv')], ['Total burn', fDur(f.prop.totalBurn)],
        ['Throttle', fPct(f.control.throttle)], ['Mass', v.mass === null ? '—' : `${fNum(v.mass / 1000, 1, 't')}`], ['Stages', fNum(f.prop.stageCount)],
      ];
      f.prop.stages.forEach((s, i) => rows.push([`S${i} Δv · TWR`, `${fNum(s.dv, 0)} · ${fNum(s.twr, 2)}`]));
      return rows;
    }
    case 'EECOM': {
      const frac = f.power.ec !== null && f.power.ecMax ? f.power.ec / f.power.ecMax : null;
      return [
        ['Elec. charge', fPct(frac), lvlOf(checks, 'ec')], ['EC units', `${fNum(f.power.ec)} / ${fNum(f.power.ecMax)}`],
        ['Hottest part', fPct(f.thermal.hottestRatio), lvlOf(checks, 'heat')], ['Part', f.thermal.hottestName ?? '—'],
        ['Dyn. pressure', fNum(v.q, 1, 'kPa'), lvlOf(checks, 'q')], ['Power state', f.paused === 2 ? 'NO POWER' : f.paused === null ? '—' : 'OK', lvlOf(checks, 'nopower')],
      ];
    }
    case 'INCO':
      return [
        ['Signal', checks.find((c) => c.id === 'signal')?.detail.startsWith('CommNet is off') ? 'CommNet off' : fPct(f.comm.signal), lvlOf(checks, 'signal')], ['Source', f.source.toUpperCase()],
        ['Telemetry', f.paused === null ? '—' : ['OK', 'PAUSED', 'NO POWER', 'OFF', 'NO ANTENNA', 'NOT IN FLIGHT'][f.paused] ?? String(f.paused)],
        ['Time warp', f.control.warp === null ? '—' : `${f.control.warp}×`],
      ];
    case 'CAPCOM':
      return [['Crew aboard', fNum(v.crew)], ['Situation', v.situation ?? '—']];
  }
}

/** Short summary for the 3D console monitor. */
export function monitorRows(p: Position, store: Store): [string, string, string?][] {
  const rows = rowsFor(p, store.frame, store.checks);
  if (p === 'CAPCOM') {
    const ev = store.events.slice(-5).reverse();
    return ev.length ? ev.map((e) => [fMet(e.met).replace('T+ ', ''), e.text.slice(0, 26)]) : [['', 'No callouts yet']];
  }
  return rows.slice(0, 6).map(([k, val, l]) => [k, val, l && l !== 'nominal' ? LEVEL_COLOR[l] : undefined]);
}

/** Full HTML panel for the focused console (or flat mode). */
export function panelHtml(p: Position, store: Store): string {
  const level = store.levels?.[p] ?? 'nodata';
  const checks = store.checks.filter((c) => c.position === p || p === 'FLIGHT');
  const rows = rowsFor(p, store.frame, store.checks);
  const valueRows = rows
    .map(([k, val, l]) => `<div class="row ${l ?? ''}"><span class="k">${esc(k)}</span><span class="v">${esc(val)}${l && l !== 'nominal' && l !== 'nodata' ? ` <b class="tag ${l}">${LEVEL_WORD[l]}</b>` : ''}</span></div>`)
    .join('');
  let extra = '';
  if (p === 'FLIGHT') {
    const positions = (['FDO', 'GNC', 'PROP', 'EECOM', 'INCO'] as Position[])
      .map((q) => { const l = store.levels?.[q] ?? 'nodata'; return `<div class="poll ${l}"><span>${q}</span><b>${LEVEL_WORD[l]}</b></div>`; })
      .join('');
    const alerts = checks.filter((c) => c.level === 'caution' || c.level === 'warning');
    extra = `<h3>Position status</h3><div class="pollgrid">${positions}</div>
      <h3>Active alerts</h3>${alerts.length ? alerts.map((c) => `<div class="alert ${c.level}"><b>${c.position}</b> ${esc(c.label)}: ${esc(c.detail)}</div>`).join('') : '<div class="muted">None</div>'}`;
  } else if (p === 'CAPCOM') {
    const ev = store.events.slice().reverse();
    extra = `<h3>Flight loop</h3><div class="log">${ev.length ? ev.map((e) => `<div><span class="met">${esc(fMet(e.met))}</span> ${esc(e.text)}</div>`).join('') : '<div class="muted">No callouts yet. Liftoff, staging, Max-Q, MECO, orbit insertion, SOI changes and LOS/AOS are called automatically.</div>'}</div>`;
  } else {
    const own = store.checks.filter((c) => c.position === p);
    extra = own.length ? `<h3>Limit checks</h3>${own.map((c) => `<div class="alert ${c.level}"><b>${LEVEL_WORD[c.level]}</b> ${esc(c.label)}: ${esc(c.detail)}</div>`).join('')}` : '';
  }
  return `<header><div><div class="pos">${p}</div><div class="ptitle">${POSITION_TITLES[p]}</div></div><div class="lamp ${level}">${LEVEL_WORD[level]}</div></header>
    <div class="rows">${valueRows}</div>${extra}`;
}
