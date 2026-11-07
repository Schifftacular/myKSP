import { children, get, getAll, getNum, parseCfg } from './sfs.js';

/**
 * Vehicle designs from `Ships/VAB|SPH/*.craft` and the `.loadmeta` summaries KSP 1.12 writes next
 * to them. Read-only. Mass and cost come from KSP's own loadmeta (the editor's numbers, with
 * RealFuels tank configs applied), so no part database is needed here.
 */
export interface CraftMeta {
  name: string;
  description: string | null;
  facility: 'VAB' | 'SPH' | null;
  partCount: number | null;
  stageCount: number | null;
  totalMass: number | null; // t
  totalCost: number | null;
  size: [number, number, number] | null; // m (x, height, z)
  version: string | null;
  partNames: string[];
}

export function parseLoadmeta(text: string): CraftMeta {
  const root = parseCfg(text);
  const size = (get(root, 'shipSize') ?? '').split(',').map(Number);
  const fac = get(root, 'type');
  return {
    name: get(root, 'shipName') ?? 'Untitled',
    description: get(root, 'description') || null,
    facility: fac === 'VAB' || fac === 'SPH' ? fac : null,
    partCount: getNum(root, 'partCount'),
    stageCount: getNum(root, 'stageCount'),
    totalMass: getNum(root, 'totalMass'),
    totalCost: getNum(root, 'totalCost'),
    size: size.length === 3 && size.every(Number.isFinite) ? (size as [number, number, number]) : null,
    version: get(root, 'version') ?? null,
    partNames: getAll(root, 'partNames'),
  };
}

export interface CraftDetail {
  name: string;
  /** Part centres, metres, x/y/z in editor space (y up). */
  parts: { name: string; pos: [number, number, number]; stage: number }[];
  resources: Record<string, { amount: number; max: number }>;
  crewSeats: number | null;
  stages: number;
}

/** Full craft parse: part positions for a silhouette, stage of each part, resource totals. */
export function parseCraft(text: string): CraftDetail {
  const root = parseCfg(text);
  const parts = children(root, 'PART').map((p) => {
    const pos = (get(p, 'pos') ?? '0,0,0').split(',').map(Number);
    return {
      name: (get(p, 'part') ?? '').replace(/_\d+$/, ''),
      pos: [pos[0] || 0, pos[1] || 0, pos[2] || 0] as [number, number, number],
      stage: getNum(p, 'dstg') ?? 0,
    };
  });
  const resources: CraftDetail['resources'] = {};
  for (const p of children(root, 'PART')) {
    for (const r of children(p, 'RESOURCE')) {
      const n = get(r, 'name');
      if (!n) continue;
      const e = (resources[n] ??= { amount: 0, max: 0 });
      e.amount += getNum(r, 'amount') ?? 0;
      e.max += getNum(r, 'maxAmount') ?? 0;
    }
  }
  return {
    name: get(root, 'ship') ?? 'Untitled',
    parts,
    resources,
    crewSeats: null, // needs the part database (CrewCapacity); not in the craft file
    stages: parts.reduce((m, p) => Math.max(m, p.stage + 1), 0),
  };
}

/** Human labels for the resource names that matter to mission planning (TAC LS included). */
export const RESOURCE_LABELS: Record<string, string> = {
  ElectricCharge: 'Electric charge', Food: 'Food', Water: 'Water', Oxygen: 'Oxygen', CarbonDioxide: 'CO₂',
  Waste: 'Waste', WasteWater: 'Waste water', LqdOxygen: 'LOX', LqdHydrogen: 'LH₂', Kerosene: 'RP-1',
  RP1: 'RP-1', LqdMethane: 'Methane', MMH: 'MMH', NTO: 'NTO', Hydrazine: 'Hydrazine', HTP: 'HTP',
  Aerozine50: 'Aerozine-50', PSPC: 'Solid (PSPC)', HTPB: 'Solid (HTPB)', Nitrogen: 'Nitrogen', Helium: 'Helium',
};
