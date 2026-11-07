import type { Level } from '@myksp/shared';
import type { BuiltRoom } from '../engine';
import type { Store } from '../store';
import type { data as Data } from '../data';
import type { Audio } from '../audio';

/**
 * An environment is one room of the ops center: a 3D build, the wall displays it draws, its
 * consoles (each with a monitor summary, a status level and a detailed HTML panel) and any
 * controls in that panel. Every environment draws only real data or says plainly that it has none.
 */
export interface Ctx {
  store: Store;
  data: typeof Data;
  audio: Audio;
  toast: (text: string) => void;
  /** Ask for a redraw (e.g. after a panel control changed local state). */
  refresh: () => void;
  /** Switch to another environment. */
  go: (env: string, console?: string | null) => void;
  focus: string | null;
}

export interface ScreenSpec { key: string; w: number; h: number; label: string }

export interface Env {
  id: string;
  /** Short room code shown in the ops bar, e.g. FCR-1. */
  code: string;
  name: string;
  /** One-line purpose, shown in the help and room picker. */
  purpose: string;
  consoles: { id: string; title: string }[];
  screens: ScreenSpec[];
  build(): BuiltRoom;
  /** Called on entering the room: trigger data loads. */
  enter?(ctx: Ctx): void;
  /** Redraw wall displays into `canvases`; return keys that changed. */
  draw(canvases: Record<string, HTMLCanvasElement>, ctx: Ctx, now: number): string[];
  monitor(id: string, ctx: Ctx): { rows: [string, string, string?][]; level: Level };
  panel(id: string | null, ctx: Ctx): string;
  /** Handle a click/change on an element inside this room's panel. Return true if handled. */
  action?(el: HTMLElement, ctx: Ctx, ev: Event): boolean;
  /** Update 3D objects (not just textures) from data; return true if the scene changed. */
  sceneUpdate?(room: BuiltRoom, ctx: Ctx): boolean;
  /** Called every second even without new data (clocks, countdowns). */
  tick?(ctx: Ctx): boolean;
}
