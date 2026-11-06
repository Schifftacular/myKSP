import WebSocket from 'ws';
import { TELEMACHUS_KEYS, fromTelemachus, num, stageKeys, type TelemetryFrame } from '@myksp/shared';

export interface TelemachusStatus {
  url: string;
  connected: boolean;
  lastFrameAt: number | null;
  lastError: string | null;
  reconnectInMs: number | null;
}

/**
 * Client for Telemachus' WebSocket datalink (`ws://host:8085/datalink`).
 * Subscribes with {"+": keys, "rate": ms}. Reconnects forever with capped backoff, because scene
 * changes, quickloads and KSP restarts all drop the socket. Per-stage keys are added only once
 * dv.stageCount reports the stages exist: asking for a missing index makes Telemachus error
 * on every packet.
 */
export class TelemachusClient {
  private ws: WebSocket | null = null;
  private backoff = 1000;
  private timer: NodeJS.Timeout | null = null;
  private subscribedStages = 0;
  private stopped = false;
  private latest: Record<string, unknown> = {};
  status: TelemachusStatus;

  constructor(
    private url: string,
    private rateMs: number,
    private onFrame: (f: TelemetryFrame) => void,
    private onStatus: (s: TelemachusStatus) => void = () => {},
  ) {
    this.status = { url, connected: false, lastFrameAt: null, lastError: null, reconnectInMs: null };
  }

  start() {
    this.stopped = false;
    this.connect();
  }

  stop() {
    this.stopped = true;
    if (this.timer) clearTimeout(this.timer);
    this.ws?.removeAllListeners();
    this.ws?.terminate();
    this.ws = null;
    this.setStatus({ connected: false, reconnectInMs: null });
  }

  private setStatus(p: Partial<TelemachusStatus>) {
    this.status = { ...this.status, ...p };
    this.onStatus(this.status);
  }

  private connect() {
    if (this.stopped) return;
    const ws = new WebSocket(this.url, { handshakeTimeout: 4000 });
    this.ws = ws;
    ws.on('open', () => {
      this.backoff = 1000;
      this.subscribedStages = 0;
      this.latest = {};
      ws.send(JSON.stringify({ '+': TELEMACHUS_KEYS, rate: this.rateMs }));
      this.setStatus({ connected: true, lastError: null, reconnectInMs: null });
    });
    ws.on('message', (data) => {
      let msg: Record<string, unknown>;
      try {
        msg = JSON.parse(String(data));
      } catch {
        return; // Telemachus sends "NaN" as a string, so parse failures mean a truncated frame: skip it.
      }
      // Telemachus may send partial updates; merge so the frame is always complete.
      const { errors, ...values } = msg as Record<string, unknown> & { errors?: unknown };
      void errors;
      Object.assign(this.latest, values);
      const stages = num(this.latest['dv.stageCount']) ?? 0;
      if (stages !== this.subscribedStages && ws.readyState === WebSocket.OPEN) {
        if (stages < this.subscribedStages) {
          ws.send(JSON.stringify({ '-': stageKeys(this.subscribedStages).slice(stages * 4) }));
          for (const k of stageKeys(this.subscribedStages).slice(stages * 4)) delete this.latest[k];
        } else {
          ws.send(JSON.stringify({ '+': stageKeys(stages).slice(this.subscribedStages * 4) }));
        }
        this.subscribedStages = stages;
      }
      const now = Date.now();
      this.status.lastFrameAt = now;
      this.onFrame(fromTelemachus(this.latest, now));
    });
    const retry = (why: string) => {
      if (this.ws !== ws) return;
      this.ws = null;
      ws.removeAllListeners();
      ws.on('error', () => {});
      if (this.stopped) return;
      const wait = this.backoff;
      this.backoff = Math.min(this.backoff * 2, 15_000);
      this.setStatus({ connected: false, lastError: why, reconnectInMs: wait });
      this.timer = setTimeout(() => this.connect(), wait);
    };
    ws.on('error', (e) => retry(e.message || 'socket error'));
    ws.on('close', () => retry('closed'));
  }
}
