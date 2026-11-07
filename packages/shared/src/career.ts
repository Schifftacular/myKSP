import { child, children, get, getNum, parseCfg, type CfgNode } from './sfs.js';

export interface ContractSummary {
  id: string | null;
  title: string;
  agent: string | null;
  state: string;
  subtype: string | null;
  fundsAdvance: number | null;
  fundsCompletion: number | null;
  fundsFailure: number | null;
  science: number | null;
  reputation: number | null;
  /** Absolute UT deadline (accepted contracts) or offer expiry (offered contracts), seconds. */
  dueUT: number | null;
  parameters: { title: string; state: string }[];
}

export interface CrewMember {
  name: string;
  trait: string | null;
  type: string | null;
  state: string | null;
  inactive: boolean;
  gender: string | null;
  veteran: boolean;
  /** Completed flights (CAREER_LOG `flight`). */
  flights: number;
  /** Bodies this astronaut has flown to / landed on, from the career log. */
  visited: string[];
  landed: string[];
  /** Vessel the astronaut is aboard, if any. */
  vessel: string | null;
  /** UT until which an inactive (resting) astronaut is unavailable. */
  inactiveUntil: number | null;
}

export interface VesselSummary {
  name: string;
  type: string | null;
  situation: string | null;
  body: number | null;
  /** Stock-template name of the body (`Kerbin`, `Mun`, …) as the save records it. */
  bodyIdent: string | null;
  met: number | null;
  launchUT: number | null;
  crew: number;
  crewNames: string[];
  lat: number | null;
  lon: number | null;
  alt: number | null;
  landedAt: string | null;
  parts: number;
  resources: Record<string, { amount: number; max: number }>;
  orbit: { sma: number | null; ecc: number | null; inc: number | null } | null;
}

export interface CareerSummary {
  title: string | null;
  mode: string | null;
  gameVersion: string | null;
  savedAt: string | null;
  ut: number | null;
  funds: number | null;
  science: number | null;
  reputation: number | null;
  facilities: { id: string; level: number | null }[];
  contracts: { offered: ContractSummary[]; active: ContractSummary[]; completedCount: number; failedCount: number; completedTypes: string[] };
  crew: CrewMember[];
  vessels: VesselSummary[];
  /** Difficulty setting "CommNet": false means signal readings are meaningless. */
  commNet: boolean | null;
  /** TAC Life Support consumption rates per crew member per second, from the save's own settings (null without TAC LS). */
  tacRates: { food: number; water: number; oxygen: number; electricity: number; maxNoFood: number | null; maxNoWater: number | null; maxNoOxygen: number | null } | null;
}

function scenario(game: CfgNode | undefined, name: string): CfgNode | undefined {
  return children(game, 'SCENARIO').find((s) => get(s, 'name') === name);
}

function contract(c: CfgNode): ContractSummary {
  // KSP Contract.Save writes `values` as: timeExpiry, timeDeadline, fundsAdvance, fundsCompletion,
  // fundsFailure, scienceCompletion, reputationCompletion, reputationFailure, dateExpire,
  // dateAccepted, dateDeadline, dateFinished.
  const vals = (get(c, 'values') ?? '').split(',').map((x) => Number(x));
  const v = (i: number) => (Number.isFinite(vals[i]) ? vals[i] : null);
  const state = get(c, 'state') ?? 'Unknown';
  const due = state === 'Active' ? v(10) : v(8);
  return {
    id: get(c, 'guid') ?? null,
    title: get(c, 'title') ?? get(c, 'subtype') ?? get(c, 'type') ?? 'Untitled contract',
    agent: get(c, 'agent') ?? null,
    state,
    subtype: get(c, 'subtype') ?? null,
    fundsAdvance: v(2),
    fundsCompletion: v(3),
    fundsFailure: v(4),
    science: v(5),
    reputation: v(6),
    dueUT: due && due > 0 ? due : null,
    parameters: children(c, 'PARAM')
      .map((p) => ({ title: get(p, 'title') ?? '', state: get(p, 'state') ?? '' }))
      .filter((p) => p.title),
  };
}

export function summarizeCareer(text: string): CareerSummary {
  return summarize(text);
}

function summarize(text: string): CareerSummary {
  const root = parseCfg(text);
  const game = child(root, 'GAME');
  const facilitiesNode = scenario(game, 'ScenarioUpgradeableFacilities');
  const contractSystem = child(scenario(game, 'ContractSystem'), 'CONTRACTS');
  const all = children(contractSystem, 'CONTRACT').map(contract);
  const finished = children(contractSystem, 'CONTRACT_FINISHED');
  const flight = child(game, 'FLIGHTSTATE');
  const vessels = children(flight, 'VESSEL').map(vessel);
  const aboard = new Map<string, string>();
  for (const v of vessels) for (const n of v.crewNames) aboard.set(n, v.name);
  const summary = {
    title: get(game, 'Title') ?? null,
    mode: get(game, 'Mode') ?? null,
    gameVersion: get(game, 'versionFull') ?? get(game, 'version') ?? null,
    savedAt: get(game, 'persistentTimestamp') ?? null,
    ut: getNum(flight, 'UT'),
    funds: getNum(scenario(game, 'Funding'), 'funds'),
    science: getNum(scenario(game, 'ResearchAndDevelopment'), 'sci'),
    reputation: getNum(scenario(game, 'Reputation'), 'rep'),
    facilities: (facilitiesNode?.nodes ?? []).map((n) => ({ id: n.name.replace(/^SpaceCenter\//, ''), level: getNum(n, 'lvl') })),
    contracts: {
      offered: all.filter((c) => c.state === 'Offered'),
      active: all.filter((c) => c.state === 'Active'),
      completedCount: all.filter((c) => c.state === 'Completed').length + finished.filter((c) => get(c, 'state') === 'Completed').length,
      failedCount: all.filter((c) => /Failed|DeadlineExpired|Cancelled/.test(c.state)).length + finished.filter((c) => /Failed|DeadlineExpired|Cancelled/.test(get(c, 'state') ?? '')).length,
      completedTypes: [...all.filter((c) => c.state === 'Completed'), ...finished.filter((c) => get(c, 'state') === 'Completed').map(contract)]
        .map((c) => c.subtype ?? c.title),
    },
    crew: children(child(game, 'ROSTER'), 'KERBAL').map((k) => kerbal(k, aboard)),
    vessels,
    tacRates: tacRates(text),
    commNet: /^\s*enableCommNet = (True|False)/m.exec(text)?.[1] === undefined ? null : /^\s*enableCommNet = True/m.test(text),
  };
  return summary;
}

function kerbal(k: CfgNode, aboard: Map<string, string>): CrewMember {
  const log = child(k, 'CAREER_LOG');
  const visited = new Set<string>(), landed = new Set<string>();
  for (const [key, val] of log?.values ?? []) {
    if (!/^\d+$/.test(key)) continue;
    const [what, where] = val.split(',');
    if (!where) continue;
    const body = BODY_NAMES[where] ?? where;
    if (/Flight|Orbit|Suborbit|Escape|Flyby/.test(what)) visited.add(body);
    if (what === 'Land') landed.add(body);
  }
  const name = get(k, 'name') ?? 'Unknown';
  const until = getNum(k, 'inactiveTimeEnd');
  return {
    name,
    trait: get(k, 'trait') ?? null,
    type: get(k, 'type') ?? null,
    state: get(k, 'state') ?? null,
    inactive: get(k, 'inactive') === 'True',
    gender: get(k, 'gender') ?? null,
    veteran: get(k, 'veteran') === 'True',
    flights: getNum(log, 'flight') ?? 0,
    visited: [...visited],
    landed: [...landed],
    vessel: aboard.get(name) ?? null,
    inactiveUntil: until && until > 0 ? until : null,
  };
}

/** Saves record bodies by their stock template names; RSS renames them. */
export const BODY_NAMES: Record<string, string> = { Kerbin: 'Earth', Mun: 'Moon', Minmus: 'Minmus', Duna: 'Mars', Eve: 'Venus', Moho: 'Mercury', Jool: 'Jupiter', Sun: 'Sun' };

function vessel(v: CfgNode): VesselSummary {
  const parts = children(v, 'PART');
  const crewNames = parts.flatMap((p) => p.values.filter(([key]) => key === 'crew').map(([, n]) => n));
  const resources: VesselSummary['resources'] = {};
  for (const p of parts) {
    for (const r of children(p, 'RESOURCE')) {
      const n = get(r, 'name');
      if (!n) continue;
      const e = (resources[n] ??= { amount: 0, max: 0 });
      e.amount += getNum(r, 'amount') ?? 0;
      e.max += getNum(r, 'maxAmount') ?? 0;
    }
  }
  const o = child(v, 'ORBIT');
  const ident = get(o, 'IDENT') ?? null;
  return {
    name: get(v, 'name') ?? 'Unnamed',
    type: get(v, 'type') ?? null,
    situation: get(v, 'sit') ?? null,
    body: getNum(o, 'REF'),
    bodyIdent: ident,
    met: getNum(v, 'met'),
    launchUT: getNum(v, 'lct'),
    crew: crewNames.length,
    crewNames,
    lat: getNum(v, 'lat'),
    lon: getNum(v, 'lon'),
    alt: getNum(v, 'alt'),
    landedAt: get(v, 'landedAt') || null,
    parts: parts.length,
    resources,
    orbit: o ? { sma: getNum(o, 'SMA'), ecc: getNum(o, 'ECC'), inc: getNum(o, 'INC') } : null,
  };
}

function tacRates(text: string): CareerSummary['tacRates'] {
  const n = (k: string) => { const m = new RegExp(`^\\s*${k} = ([-\\d.Ee+]+)`, 'm').exec(text); return m ? Number(m[1]) : null; };
  const food = n('FoodConsumptionRate'), water = n('WaterConsumptionRate'), oxygen = n('OxygenConsumptionRate');
  if (food === null || water === null || oxygen === null) return null;
  return { food, water, oxygen, electricity: n('ElectricityConsumptionRate') ?? 0, maxNoFood: n('MaxTimeWithoutFood'), maxNoWater: n('MaxTimeWithoutWater'), maxNoOxygen: n('MaxTimeWithoutOxygen') };
}
