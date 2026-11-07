import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import {
  get, parseBodyCfg, parseCfg, parseCraft, parseTestFlight, parseElementEpoch, parseGroundStations, parseLoadmeta, parseTimeEpoch, summarizeCareer,
  type Body, type CraftMeta, type GroundStation, type EngineReliability, type TfEngine,
} from '@myksp/shared';

/**
 * Read-only facts about the KSP install and the repo's planning data, for the rooms that are not
 * live telemetry: body orbits (RSS Kopernicus configs), the RSSDateTime epoch, RealAntennas ground
 * stations, craft files, save backups for trends, the Artemis manifest and contract metadata.
 * Everything is cached by file mtime. Nothing is ever written to the install.
 */
export interface InstallFacts {
  kspRoot: string;
  timeEpochMs: number | null;
  timeEpochSource: string | null;
  elementEpochUT: number | null;
  bodies: Body[];
  stations: GroundStation[];
  mods: { tacLifeSupport: boolean; realAntennas: boolean; kerbalAlarmClock: boolean; transferWindowPlanner: boolean; testFlight: boolean; kct: boolean };
}

export interface CraftEntry extends CraftMeta { file: string; folder: string; save: string | null; modified: string }

export class InstallService {
  private factsCache: InstallFacts | null = null;
  private factsAt = 0;

  constructor(private kspRoot: string, private repoRoot: string) {}

  private p(...parts: string[]) { return path.join(this.kspRoot, ...parts); }
  private read(file: string) { try { return fs.readFileSync(file, 'utf8'); } catch { return null; } }

  facts(): InstallFacts {
    // Install files change only when mods change; re-scan at most every 10 minutes.
    if (this.factsCache && Date.now() - this.factsAt < 600_000) return this.factsCache;
    const gd = this.p('GameData');
    const epochFile = [this.p('GameData/RP2000/RSSDateTimePatch.cfg'), this.p('GameData/RSSDateTime/RSSDateTime.cfg')].find((f) => fs.existsSync(f));
    const bodies: Body[] = [];
    const kopDir = this.p('GameData/RealSolarSystem/RSSKopernicus');
    for (const f of walk(kopDir, 3)) {
      if (!f.endsWith('.cfg')) continue;
      const b = parseBodyCfg(this.read(f) ?? '');
      if (b) bodies.push(b);
    }
    if (bodies.length && !bodies.some((b) => b.name === 'Sun')) {
      // The Sun is the system root; RSS keeps it at index 0 with real GM.
      bodies.push({ name: 'Sun', index: 0, parent: null, radius: 696342000, gm: 1.32712440018e20, rotationPeriod: null, initialRotation: null, tidallyLocked: false, orbit: null });
    }
    const raCfg = this.read(this.p('GameData/RealAntennas/PlanetPacks/RealSolarSystem.cfg'));
    this.factsCache = {
      kspRoot: this.kspRoot,
      timeEpochMs: epochFile ? parseTimeEpoch(this.read(epochFile) ?? '') : null,
      timeEpochSource: epochFile ? path.relative(this.kspRoot, epochFile) : null,
      elementEpochUT: parseElementEpoch(this.read(this.p('GameData/RealSolarSystem/RSSKopernicusSettings.cfg')) ?? ''),
      bodies,
      stations: raCfg ? parseGroundStations(raCfg) : [],
      mods: {
        tacLifeSupport: fs.existsSync(path.join(gd, 'ThunderAerospace')),
        realAntennas: fs.existsSync(path.join(gd, 'RealAntennas')),
        kerbalAlarmClock: fs.existsSync(path.join(gd, 'TriggerTech')),
        transferWindowPlanner: fs.existsSync(path.join(gd, 'TransferWindowPlanner')),
        testFlight: fs.existsSync(path.join(gd, 'TestFlight')),
        kct: fs.existsSync(path.join(gd, 'KerbalConstructionTime')),
      },
    };
    this.factsAt = Date.now();
    return this.factsCache;
  }

  /** Craft in the stock Ships folder and in each save's Ships folder. */
  craft(): CraftEntry[] {
    const out: CraftEntry[] = [];
    const scan = (dir: string, save: string | null) => {
      for (const folder of ['VAB', 'SPH']) {
        const d = path.join(dir, folder);
        if (!fs.existsSync(d)) continue;
        for (const name of fs.readdirSync(d)) {
          if (!name.endsWith('.craft') || name.startsWith('Auto-Saved Ship')) continue;
          const file = path.join(d, name);
          const metaFile = file.replace(/\.craft$/, '.loadmeta');
          const st = fs.statSync(file);
          const meta = fs.existsSync(metaFile) ? parseLoadmeta(this.read(metaFile) ?? '') : null;
          out.push({
            ...(meta && !meta.name.startsWith('#autoLOC') ? meta : meta ? { ...meta, name: name.replace(/\.craft$/, '') } : { name: name.replace(/\.craft$/, ''), description: null, facility: folder as 'VAB' | 'SPH', partCount: null, stageCount: null, totalMass: null, totalCost: null, size: null, version: null, partNames: [] }),
            partNames: [],
            file: path.relative(this.kspRoot, file),
            folder,
            save,
            modified: st.mtime.toISOString(),
          });
        }
      }
    };
    scan(this.p('Ships'), null);
    const saves = this.p('saves');
    if (fs.existsSync(saves)) for (const s of fs.readdirSync(saves)) {
      if (fs.existsSync(path.join(saves, s, 'Ships'))) scan(path.join(saves, s, 'Ships'), s);
    }
    return out.sort((a, b) => b.modified.localeCompare(a.modified));
  }

  /** Part positions and resources of one craft. `rel` must be a path returned by craft(). */
  craftDetail(rel: string) {
    const file = path.resolve(this.kspRoot, rel);
    if (!file.startsWith(path.resolve(this.kspRoot) + path.sep) || !file.endsWith('.craft')) throw new Error('invalid craft path');
    const tf = this.testFlight();
    const craft = parseCraft(fs.readFileSync(file, 'utf8'), this.engineParts ?? undefined);
    const reliability: EngineReliability[] = craft.engines.map((e) => ({ ...e, tf: e.config ? tf.get(e.config) ?? null : null }));
    return { ...craft, reliability, testFlightConfigs: tf.size };
  }

  /**
   * TestFlight engine data by engine config name, from the RealismOverhaul engine configs and every
   * *TestFlight*.cfg in GameData. Scanned once (about 800 entries), then every 10 minutes at most.
   */
  private tfCache: Map<string, TfEngine> | null = null;
  /** Part names (`_` written as `.`, as in craft files) whose part config has a ModuleEngines* module. */
  private engineParts: Set<string> | null = null;
  private tfAt = 0;
  testFlight(): Map<string, TfEngine> {
    if (this.tfCache && Date.now() - this.tfAt < 600_000) return this.tfCache;
    const out = new Map<string, TfEngine>();
    const gd = this.p('GameData');
    const files = [...walk(path.join(gd, 'RealismOverhaul', 'Engine_Configs'), 2)].filter((f) => f.endsWith('.cfg'));
    const engineParts = new Set<string>();
    for (const f of walk(gd, 6)) {
      if (!f.endsWith('.cfg')) continue;
      if (/testflight/i.test(path.basename(f))) files.push(f);
      const text = this.read(f);
      if (!text || !text.includes('ModuleEngines')) continue;
      // Only plain part definitions ("PART" with a name), not @PART patches.
      for (const node of parseCfg(text).nodes) {
        if (node.name !== 'PART') continue;
        const name = get(node, 'name');
        if (name && node.nodes.some((m) => m.name === 'MODULE' && /^ModuleEngines/.test(get(m, 'name') ?? ''))) engineParts.add(name.replace(/_/g, '.'));
      }
    }
    this.engineParts = engineParts;
    for (const dir of ['ROEngines', 'ROCapsules', path.join('RealismOverhaul', 'RO_SuggestedMods')]) {
      for (const f of walk(path.join(gd, dir), 4)) if (f.endsWith('.cfg')) files.push(f);
    }
    for (const f of new Set(files)) {
      const text = this.read(f);
      if (!text || !text.includes('TESTFLIGHT')) continue;
      // RP2000's own files are patched after RO's, so a later file overrides an earlier one.
      for (const e of parseTestFlight(text, path.relative(gd, f))) out.set(e.config, e);
    }
    this.tfCache = out;
    this.tfAt = Date.now();
    return out;
  }

  /**
   * Funds/science/reputation history for a save: KSP's own Backup/ snapshots plus the current
   * save, plus every state the bridge has seen (kept in data/career-history.jsonl).
   */
  private histCache = new Map<string, { key: string; points: HistoryPoint[] }>();
  history(save: string, current: { ut: number | null; funds: number | null; science: number | null; reputation: number | null }, historyFile: string): HistoryPoint[] {
    if (save.includes('/') || save.startsWith('.')) throw new Error('invalid save name');
    const dir = this.p('saves', save, 'Backup');
    const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.sfs')) : [];
    const key = files.map((f) => `${f}:${fs.statSync(path.join(dir, f)).mtimeMs}`).join('|');
    let backups = this.histCache.get(save);
    if (!backups || backups.key !== key) {
      const points: HistoryPoint[] = [];
      for (const f of files) {
        try {
          const s = summarizeCareer(fs.readFileSync(path.join(dir, f), 'utf8'));
          if (s.ut !== null) points.push({ ut: s.ut, funds: s.funds, science: s.science, reputation: s.reputation, source: 'backup' });
        } catch { /* unreadable backup: skip */ }
      }
      backups = { key, points };
      this.histCache.set(save, backups);
    }
    const seen: HistoryPoint[] = [];
    try {
      for (const line of fs.readFileSync(historyFile, 'utf8').split('\n')) {
        if (!line.trim()) continue;
        const r = JSON.parse(line);
        if (r.save === save) seen.push({ ut: r.ut, funds: r.funds, science: r.science, reputation: r.reputation, source: 'bridge' });
      }
    } catch { /* no history yet */ }
    const all = [...backups.points, ...seen];
    if (current.ut !== null) all.push({ ...current, ut: current.ut, source: 'current' });
    const byUt = new Map<number, HistoryPoint>();
    for (const p of all) byUt.set(Math.round(p.ut), p);
    return [...byUt.values()].sort((a, b) => a.ut - b.ut);
  }

  /** Research thread's manifest and contracts thread's metadata, if present in this checkout. */
  planning() {
    const find = (rels: string[]) => rels.map((r) => path.join(this.repoRoot, r)).find((f) => fs.existsSync(f)) ?? null;
    const manifestFile = find(['docs/research/artemis-manifest.json', 'docs/research/artemis-manifest.yaml', 'data/vendor/artemis-manifest.json', 'data/vendor/artemis-manifest.yaml']);
    const metaFile = find(['contracts/manifest/contract-meta.json', 'data/vendor/contract-meta.json']);
    let manifest: unknown = null, meta: unknown = null;
    const errors: string[] = [];
    try { if (manifestFile) { const t = fs.readFileSync(manifestFile, 'utf8'); manifest = manifestFile.endsWith('.json') ? JSON.parse(t) : YAML.parse(t); } } catch (e) { errors.push(`manifest: ${(e as Error).message}`); }
    try { if (metaFile) meta = JSON.parse(fs.readFileSync(metaFile, 'utf8')); } catch (e) { errors.push(`contract-meta: ${(e as Error).message}`); }
    return {
      manifest, contractMeta: meta, errors,
      manifestFile: manifestFile && path.relative(this.repoRoot, manifestFile),
      contractMetaFile: metaFile && path.relative(this.repoRoot, metaFile),
    };
  }
}

export interface HistoryPoint { ut: number; funds: number | null; science: number | null; reputation: number | null; source: 'backup' | 'bridge' | 'current' }

function* walk(dir: string, depth: number): Generator<string> {
  if (depth < 0 || !fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== 'Cache') yield* walk(f, depth - 1); }
    else yield f;
  }
}
