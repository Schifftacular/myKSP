import { POSITION_TITLES, type Level, type Position } from '@myksp/shared';
import { RoomKit, v3 } from '../kit';
import { drawClocks, drawGroundTrack, drawOrbit, drawTrajectory, PAL } from '../screens';
import { LEVEL_COLOR, monitorRows, panelHtml } from '../positions';
import { programHtml } from '../program';
import { fMoney, fNum } from '../format';
import type { Ctx, Env } from './types';

/**
 * Flight Control Room (design §4.1): three tiers of consoles facing a front wall with ground
 * track, trajectory, orbit and clocks. Live Telemachus data, or SIM/REPLAY clearly badged.
 */
const ROOM = { w: 30, d: 22, h: 10, front: -10 };
const TIER_H = 0.42;
const ROW_Z = [-3.2, 0.6, 4.4];
const LAYOUT: { id: string; x: number; row: number }[] = [
  { id: 'FDO', x: -4.4, row: 0 }, { id: 'GNC', x: 0, row: 0 }, { id: 'PROP', x: 4.4, row: 0 },
  { id: 'EECOM', x: -4.4, row: 1 }, { id: 'INCO', x: 0, row: 1 }, { id: 'CAPCOM', x: 4.4, row: 1 },
  { id: 'PROGRAM', x: -4.4, row: 2 }, { id: 'FLIGHT', x: 0, row: 2 },
];

let lastWallDraw = 0;
let lastWallKey = '';

export const fcr: Env = {
  id: 'fcr',
  code: 'FCR-1',
  name: 'Flight Control Room',
  purpose: 'Live flight: trajectory, systems and limit checks for the active vessel',
  consoles: ['FLIGHT', 'FDO', 'GNC', 'PROP', 'EECOM', 'INCO', 'CAPCOM', 'PROGRAM'].map((id) => ({ id, title: id === 'PROGRAM' ? 'Program summary' : POSITION_TITLES[id as Position] })),
  screens: [
    { key: 'ground', w: 2048, h: 1152, label: 'Ground track' },
    { key: 'traj', w: 1024, h: 576, label: 'Trajectory' },
    { key: 'orbit', w: 1024, h: 576, label: 'Orbit' },
    { key: 'clocks', w: 2560, h: 176, label: 'Clocks' },
  ],

  build() {
    const { w, d, h, front } = ROOM;
    const k = new RoomKit();
    k.shell(ROOM);
    k.sidePanels(w, front, front + d);
    k.tiers(w, ROW_Z, TIER_H, front + d);
    k.coffers([-6.6, -2.2, 2.2, 6.6], ROW_Z, h);
    const f = front + 0.02;
    k.screen('ground', 2048, 1152, 13.6, 7.65, 0, 4.9, f);
    k.screen('traj', 1024, 576, 6.6, 3.71, -10.6, 5.2, f);
    k.screen('orbit', 1024, 576, 6.6, 3.71, 10.6, 5.2, f);
    k.screen('clocks', 2560, 176, 13.6, 0.935, 0, 9.3, f);
    for (const c of LAYOUT) {
      const y = TIER_H * c.row, z = ROW_Z[c.row];
      k.console(c.id, c.x, y, z, { view: { pos: v3(c.x * 0.9, y + 2.45, z + 3.3), look: v3(c.x * 0.45, y + 2.9, front) } });
    }
    k.lights(ROW_Z, h, front);
    return k.finish({ pos: v3(0, 5.2, 11.2), look: v3(0, 3.7, front) });
  },

  draw(cv, ctx, now) {
    const { store } = ctx;
    const f = store.frame;
    const link = store.linkState();
    const linkColor = link.cls === 'nominal' ? '#7fd19b' : link.cls === 'sim' ? PAL.sim : link.cls === 'caution' ? PAL.caution : link.cls === 'warning' ? PAL.warning : PAL.dim;
    const changed = ['clocks'];
    // Big wall displays change slowly: redraw them at most once a second, but at once when what
    // they show changes state (source, vessel, flight scene, first plottable samples).
    const key = `${f?.source}|${f?.vessel.name}|${f?.paused === 5}|${f?.vessel.situation === null}|${Math.min(store.history.length, 2)}`;
    if (now - lastWallDraw > 1000 || key !== lastWallKey) {
      lastWallDraw = now;
      lastWallKey = key;
      drawGroundTrack(cv.ground, f, store.history);
      drawTrajectory(cv.traj, f, store.history);
      drawOrbit(cv.orbit, f);
      changed.push('ground', 'traj', 'orbit');
    }
    drawClocks(cv.clocks, f, link.label, linkColor);
    return changed;
  },

  monitor(id, ctx) {
    const { store } = ctx;
    if (id === 'PROGRAM') {
      const c = store.career?.summary;
      const rows: [string, string][] = !c ? [['Career', store.careerError ? 'unavailable' : 'loading']]
        : [['Funds', fMoney(c.funds)], ['Science', fNum(c.science, 1)], ['Reputation', fNum(c.reputation)], ['Active contracts', String(c.contracts.active.length)], ['Offered', String(c.contracts.offered.length)], ['Crew', String(c.crew.filter((k) => k.type === 'Crew').length)]];
      return { rows, level: c ? 'nominal' : 'nodata' };
    }
    return { rows: monitorRows(id as Position, store), level: (store.levels?.[id as Position] ?? 'nodata') as Level };
  },

  panel(id, ctx) {
    const p = id ?? 'FLIGHT';
    return p === 'PROGRAM' ? programHtml(ctx.store) : panelHtml(p as Position, ctx.store);
  },
};

export { LEVEL_COLOR };
