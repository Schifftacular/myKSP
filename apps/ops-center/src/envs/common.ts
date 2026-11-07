import type { ContractSummary } from '@myksp/shared';
import { RoomKit, v3 } from '../kit';
import { dateToUt, utToDate } from '../format';
import type { Planning } from '../data';
import type { Ctx } from './types';

/**
 * Helpers shared by the planning and support rooms: a conference-style room builder, game-date
 * access, manifest window parsing and the contract ↔ manifest join.
 */

export interface WallScreen { key: string; cw: number; ch: number; w: number; h: number; x: number; y: number; wall?: 'front' | 'left' | 'right' }
export interface Seat { id: string; x: number; z: number; row?: number; rotY?: number; width?: number }

/** A room with displays on the front (and optionally side) walls and consoles in tiers or round a table. */
export function wallRoom(o: {
  W: number; D: number; H: number; bg?: string; fog?: [number, number]; wall?: string; floor?: string; ceil?: string;
  screens: WallScreen[]; seats: Seat[]; tiers?: number[]; table?: [number, number, number, number]; coffer?: string;
  overview?: { pos: [number, number, number]; look: [number, number, number] };
}) {
  const F = -o.D / 2;
  const k = new RoomKit(o.bg ?? '#07090c', o.fog ?? [o.D * 1.2, o.D * 2.6]);
  k.shell({ w: o.W, d: o.D, h: o.H, front: F, wall: o.wall, floor: o.floor, ceil: o.ceil });
  k.sidePanels(o.W, F, F + o.D, Math.min(3.2, o.H * 0.5), Math.min(3, o.H * 0.45));
  for (const s of o.screens) {
    const side = s.wall ?? 'front';
    if (side === 'front') k.screen(s.key, s.cw, s.ch, s.w, s.h, s.x, s.y, F + 0.03);
    else k.screen(s.key, s.cw, s.ch, s.w, s.h, side === 'left' ? -o.W / 2 + 0.05 : o.W / 2 - 0.05, s.y, s.x, side === 'left' ? Math.PI / 2 : -Math.PI / 2);
  }
  const rows = o.tiers ?? [];
  if (rows.length) k.tiers(o.W, rows, 0.4, F + o.D);
  if (o.table) k.table(...o.table);
  for (const s of o.seats) {
    const y = 0.4 * (s.row ?? 0);
    k.console(s.id, s.x, y, s.z, { rotY: s.rotY, width: s.width, view: s.rotY ? undefined : { pos: v3(s.x * 0.85, y + 2.4, s.z + 3.4), look: v3(s.x * 0.35, y + 2.6, F) } });
  }
  const zs = rows.length ? rows : [F + o.D * 0.35, F + o.D * 0.7];
  k.coffers([-o.W / 3, 0, o.W / 3], zs, o.H, o.coffer ?? '#5a5144');
  k.lights(zs, o.H, F, { spillI: 30, hemi: 0.62 });
  const ov = o.overview ?? { pos: [0, o.H * 0.62, F + o.D - 1.2], look: [0, o.H * 0.45, F] };
  return k.finish({ pos: v3(...ov.pos), look: v3(...ov.look) });
}

/** Game universal time: live telemetry first, else the save's UT. */
export function gameUt(ctx: Ctx): number | null {
  const f = ctx.store.frame;
  if (f?.source === 'live' && f.ut !== null) return f.ut;
  return ctx.store.career?.summary.ut ?? (f?.ut ?? null);
}
export function gameDate(ctx: Ctx): Date | null { const ut = gameUt(ctx); return ut === null ? null : utToDate(ut); }

/** "2027-Q2", "2027-06", "2027-06-15" or "2027" → start of that period (UTC ms). */
export function windowMs(s: string | undefined | null, end = false): number | null {
  if (!s) return null;
  let m = /^(\d{4})-Q([1-4])$/.exec(s);
  if (m) return Date.UTC(+m[1], (+m[2] - 1) * 3 + (end ? 3 : 0), 1) - (end ? 1 : 0);
  m = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(s);
  if (m) return m[3] ? Date.UTC(+m[1], +m[2] - 1, +m[3]) : Date.UTC(+m[1], +m[2] - 1 + (end ? 1 : 0), 1) - (end ? 1 : 0);
  m = /^(\d{4})$/.exec(s);
  if (m) return Date.UTC(+m[1] + (end ? 1 : 0), 0, 1) - (end ? 1 : 0);
  return null;
}
export const msToUt = (ms: number) => dateToUt(ms);

export type MissionState = 'completed' | 'active' | 'offered' | 'not offered' | 'no contract';

/** Join the manifest to the save's contracts through contract-meta (CONTRACT subtype = MKSP_x). */
export function missionStates(planning: Planning | null, contracts: { active: ContractSummary[]; offered: ContractSummary[]; completedTypes: string[] } | null | undefined) {
  const out = new Map<string, { state: MissionState; contracts: string[] }>();
  const meta = planning?.contractMeta?.contracts ?? {};
  const byMission = new Map<string, string[]>();
  for (const [id, c] of Object.entries(meta)) for (const m of c.missions ?? []) byMission.set(m.id, [...(byMission.get(m.id) ?? []), id]);
  const active = new Set(contracts?.active.map((c) => c.subtype ?? '') ?? []);
  const offered = new Set(contracts?.offered.map((c) => c.subtype ?? '') ?? []);
  const done = new Set(contracts?.completedTypes ?? []);
  for (const m of planning?.manifest?.missions ?? []) {
    const ids = byMission.get(m.id) ?? [];
    let state: MissionState = ids.length ? 'not offered' : 'no contract';
    if (ids.some((i) => offered.has(i))) state = 'offered';
    if (ids.some((i) => active.has(i))) state = 'active';
    if (ids.length && ids.every((i) => done.has(i))) state = 'completed';
    out.set(m.id, { state, contracts: ids });
  }
  return out;
}

export const STATE_COLOR: Record<MissionState, string> = {
  completed: '#7fd19b', active: '#5fb3d9', offered: '#f2b134', 'not offered': '#7d8d99', 'no contract': '#4a5864',
};

/** Contract-meta phase of a save contract (by subtype), if the contracts thread's metadata is present. */
export function contractPhase(planning: Planning | null, subtype: string | null) {
  return subtype ? planning?.contractMeta?.contracts?.[subtype]?.phase ?? null : null;
}
