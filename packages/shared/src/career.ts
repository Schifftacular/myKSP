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
}

export interface VesselSummary {
  name: string;
  type: string | null;
  situation: string | null;
  body: number | null;
  met: number | null;
  crew: number;
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
  contracts: { offered: ContractSummary[]; active: ContractSummary[]; completedCount: number; failedCount: number };
  crew: CrewMember[];
  vessels: VesselSummary[];
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
  const root = parseCfg(text);
  const game = child(root, 'GAME');
  const facilitiesNode = scenario(game, 'ScenarioUpgradeableFacilities');
  const contractSystem = child(scenario(game, 'ContractSystem'), 'CONTRACTS');
  const all = children(contractSystem, 'CONTRACT').map(contract);
  const finished = children(contractSystem, 'CONTRACT_FINISHED');
  const flight = child(game, 'FLIGHTSTATE');
  return {
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
    },
    crew: children(child(game, 'ROSTER'), 'KERBAL').map((k) => ({
      name: get(k, 'name') ?? 'Unknown',
      trait: get(k, 'trait') ?? null,
      type: get(k, 'type') ?? null,
      state: get(k, 'state') ?? null,
      inactive: get(k, 'inactive') === 'True',
    })),
    vessels: children(flight, 'VESSEL').map((v) => ({
      name: get(v, 'name') ?? 'Unnamed',
      type: get(v, 'type') ?? null,
      situation: get(v, 'sit') ?? null,
      body: getNum(child(v, 'ORBIT'), 'REF'),
      met: getNum(v, 'met'),
      crew: children(v, 'PART').reduce((n, p) => n + children(p, 'crew').length + p.values.filter(([k]) => k === 'crew').length, 0),
    })),
  };
}
