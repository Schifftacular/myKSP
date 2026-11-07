import { get, parseCfg, type CfgNode } from './sfs.js';

/**
 * TestFlight engine reliability from the install's configs (read-only).
 *
 * RealismOverhaul keeps most engine data as `TESTFLIGHT` nodes inside
 * `MODULE[ModuleEngineConfigs] > CONFIG { name = X }` (the TESTFLIGHT node has no name of its own and
 * inherits the CONFIG's). RP2000's own files put a top-level `TESTFLIGHT { name = X }` inside a
 * `@PART[*]:HAS[...]` patch. Either way the join key is the engine config name, which is what a
 * craft's `ModuleEngineConfigs.configuration` holds.
 *
 * TestFlight's model: an engine starts at the `*Start` reliability with no flight data and climbs to
 * `*End` as data accumulates. Ignition reliability is per ignition; cycle reliability is the chance
 * of running for `ratedBurnTime` seconds without a failure.
 */
export interface TfEngine {
  config: string;
  ratedBurnTime: number;
  testedBurnTime: number | null;
  ignitionStart: number;
  ignitionEnd: number;
  cycleStart: number;
  cycleEnd: number;
  techTransfer: string | null;
  source?: string;
}

const base = (n: string) => n.replace(/:.*$/, '');
const num = (n: CfgNode, k: string) => {
  const v = get(n, k);
  if (v === undefined || v === '') return null;
  const x = Number(v);
  return Number.isFinite(x) ? x : null;
};
/** `@CONFIG[Name]` / `CONFIG` with `name = Name` → Name. */
function configName(n: CfgNode): string | null {
  const m = /^[@%]?CONFIG\[([^\]]+)\]/.exec(n.name);
  if (m) return m[1];
  return base(n.name) === 'CONFIG' ? get(n, 'name') ?? null : null;
}

export function parseTestFlight(text: string, source?: string): TfEngine[] {
  const out: TfEngine[] = [];
  const visit = (n: CfgNode, parentConfig: string | null) => {
    const here = configName(n) ?? parentConfig;
    for (const c of n.nodes) {
      if (base(c.name) === 'TESTFLIGHT') {
        const name = get(c, 'name') || here;
        const ignitionStart = num(c, 'ignitionReliabilityStart'), ignitionEnd = num(c, 'ignitionReliabilityEnd');
        const cycleStart = num(c, 'cycleReliabilityStart'), cycleEnd = num(c, 'cycleReliabilityEnd');
        const rated = num(c, 'ratedBurnTime');
        // Patch blocks (ModuleManager operators, no plain numbers) carry no engine data.
        if (!name || ignitionStart === null || ignitionEnd === null || cycleStart === null || cycleEnd === null || rated === null) continue;
        out.push({ config: name, ratedBurnTime: rated, testedBurnTime: num(c, 'testedBurnTime'), ignitionStart, ignitionEnd, cycleStart, cycleEnd, techTransfer: get(c, 'techTransfer') || null, source });
      } else visit(c, here);
    }
  };
  visit(parseCfg(text), null);
  return out;
}

export interface EngineGroup { part: string; config: string | null; count: number; stage: number }
export interface EngineReliability extends EngineGroup { tf: TfEngine | null }

/** Chance a group of `count` identical engines all ignite once and all run their rated burn time. */
export function groupSuccess(e: EngineReliability, mature: boolean): number | null {
  if (!e.tf) return null;
  const p = mature ? e.tf.ignitionEnd * e.tf.cycleEnd : e.tf.ignitionStart * e.tf.cycleStart;
  return p ** e.count;
}

/** Whole-vehicle figure over the engines that have TestFlight data (one ignition each). */
export function vehicleSuccess(engines: EngineReliability[], mature: boolean): { p: number | null; covered: number; total: number } {
  let p = 1, covered = 0, total = 0;
  for (const e of engines) {
    total += e.count;
    const g = groupSuccess(e, mature);
    if (g === null) continue;
    p *= g;
    covered += e.count;
  }
  return { p: covered ? p : null, covered, total };
}
