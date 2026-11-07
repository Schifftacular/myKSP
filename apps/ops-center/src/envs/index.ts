import type { Env } from './types';
import { program } from './program';
import { mdc } from './mdc';
import { vih } from './vih';
import { astro } from './astro';
import { lcc } from './lcc';
import { fcr } from './fcr';
import { netops } from './netops';
import { mer } from './mer';
import { lsoc } from './lsoc';

/** Rooms in lifecycle order (design §3): program → design → integration → crew → launch → flight → network → post-flight → surface. */
export const ENVS: Record<string, Env> = { program, mdc, vih, astro, lcc, fcr, netops, mer, lsoc };
export const ENV_ORDER = Object.keys(ENVS);
