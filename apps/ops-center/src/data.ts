import { SolarSystem, type Body, type CraftDetail, type CraftMeta, type FlightAnalysis, type GroundStation } from '@myksp/shared';
import { setEpoch } from './format';

/**
 * Slow-changing data the non-flight rooms use: install facts, craft, planning files, career
 * history and analysed recordings. Fetched lazily from the bridge and cached; each loader
 * notifies listeners when it lands so rooms redraw.
 */
export interface InstallFacts {
  timeEpochMs: number | null;
  timeEpochSource: string | null;
  elementEpochUT: number | null;
  bodies: Body[];
  stations: GroundStation[];
  mods: { tacLifeSupport: boolean; realAntennas: boolean; kerbalAlarmClock: boolean; transferWindowPlanner: boolean };
}
export interface CraftEntry extends CraftMeta { file: string; folder: string; save: string | null; modified: string }
export interface HistoryPoint { ut: number; funds: number | null; science: number | null; reputation: number | null; source: string }
export interface ManifestMission {
  id: string; name: string; category?: string; phase?: string; agency?: string; provider?: string; status?: string; confidence?: string;
  target?: string; window?: { start?: string; end?: string }; launch_vehicle?: string; spacecraft?: string; destination?: string;
  crew?: string[]; objectives?: string[]; base_contribution?: string; flight_plan?: string[]; dependencies?: string[]; site?: string | null;
}
export interface ManifestSite { id: string; name: string; lat: number; lon: number; precision?: string; role?: string }
export interface Planning {
  manifest: { manifest_version?: number; as_of?: string; career_goal?: string; missions?: ManifestMission[]; sites?: ManifestSite[] } | null;
  contractMeta: { phases?: { id: string; label: string }[]; contracts?: Record<string, { title: string; group?: string; phase?: string; missions?: { id: string }[]; window?: { start?: string; end?: string } | null; maxCompletions?: number }> } | null;
  errors: string[];
  manifestFile: string | null;
  contractMetaFile: string | null;
}

type Listener = () => void;

class DataCache {
  install: InstallFacts | null = null;
  system: SolarSystem | null = null;
  craft: CraftEntry[] | null = null;
  craftDetail = new Map<string, CraftDetail>();
  planning: Planning | null = null;
  history: HistoryPoint[] | null = null;
  analyses = new Map<string, FlightAnalysis>();
  errors: Record<string, string> = {};
  private listeners = new Set<Listener>();
  private inflight = new Set<string>();

  on(fn: Listener) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
  private emit() { for (const l of this.listeners) l(); }

  private async get<T>(key: string, url: string, set: (v: T) => void) {
    if (this.inflight.has(key)) return;
    this.inflight.add(key);
    try {
      const r = await fetch(url);
      const body = await r.json();
      if (!r.ok) throw new Error(body.error ?? `HTTP ${r.status}`);
      set(body);
      delete this.errors[key];
    } catch (e) {
      this.errors[key] = (e as Error).message;
    } finally {
      this.inflight.delete(key);
      this.emit();
    }
  }

  loadInstall(force = false) {
    if (this.install && !force) return;
    void this.get<InstallFacts>('install', '/api/install', (v) => {
      this.install = v;
      setEpoch(v.timeEpochMs);
      this.system = v.bodies.length ? new SolarSystem(v.bodies, v.elementEpochUT ?? 0) : null;
    });
  }
  loadCraft(force = false) { if (!this.craft || force) void this.get<{ craft: CraftEntry[] }>('craft', '/api/craft', (v) => { this.craft = v.craft; }); }
  loadCraftDetail(file: string) {
    if (this.craftDetail.has(file)) return;
    void this.get<CraftDetail>(`craft:${file}`, `/api/craft/detail?file=${encodeURIComponent(file)}`, (v) => { this.craftDetail.set(file, v); });
  }
  loadPlanning(force = false) { if (!this.planning || force) void this.get<Planning>('planning', '/api/planning', (v) => { this.planning = v; }); }
  loadHistory() { void this.get<{ points: HistoryPoint[] }>('history', '/api/career/history', (v) => { this.history = v.points; }); }
  loadAnalysis(file: string) {
    if (this.analyses.has(file)) return;
    void this.get<{ analysis: FlightAnalysis }>(`rec:${file}`, `/api/recording?file=${encodeURIComponent(file)}`, (v) => { this.analyses.set(file, v.analysis); });
  }
}

export const data = new DataCache();
