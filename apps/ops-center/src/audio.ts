/**
 * Procedural audio, no sample files. Off until the user turns it on (browsers block autoplay,
 * and sound should never surprise someone streaming).
 *  - Quindar tones: 2525 Hz intro / 2475 Hz outro, 250 ms, as on Apollo-era and later air-to-ground loops.
 *  - Master caution: two-tone alarm on a new WARNING.
 *  - Room tone: very low filtered noise for presence.
 */
export class Audio {
  private ctx: AudioContext | null = null;
  private room: AudioBufferSourceNode | null = null;
  private master: GainNode | null = null;
  enabled = false;

  toggle() { this.enabled ? this.disable() : this.enable(); return this.enabled; }

  enable() {
    this.ctx ??= new AudioContext();
    void this.ctx.resume();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.5;
    this.master.connect(this.ctx.destination);
    // Room tone.
    const len = this.ctx.sampleRate * 4;
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3; }
    const src = this.ctx.createBufferSource();
    src.buffer = buf; src.loop = true;
    const lp = this.ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 380;
    const g = this.ctx.createGain(); g.gain.value = 0.05;
    src.connect(lp).connect(g).connect(this.master);
    src.start();
    this.room = src;
    this.enabled = true;
  }

  disable() {
    this.room?.stop();
    this.room = null;
    this.master?.disconnect();
    this.master = null;
    this.enabled = false;
  }

  private tone(freq: number, start: number, dur: number, vol = 0.12, type: OscillatorType = 'sine') {
    if (!this.ctx || !this.master) return;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type; o.frequency.value = freq;
    const t = this.ctx.currentTime + start;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.01);
    g.gain.setValueAtTime(vol, t + dur - 0.01);
    g.gain.linearRampToValueAtTime(0, t + dur);
    o.connect(g).connect(this.master);
    o.start(t); o.stop(t + dur + 0.02);
  }

  /** Intro tone, a gap where the callout "happens", outro tone. */
  quindar() {
    if (!this.enabled) return;
    this.tone(2525, 0, 0.25, 0.06);
    this.tone(2475, 1.4, 0.25, 0.06);
  }

  masterCaution() {
    if (!this.enabled) return;
    for (let i = 0; i < 3; i++) { this.tone(760, i * 0.5, 0.22, 0.09, 'square'); this.tone(1020, i * 0.5 + 0.22, 0.22, 0.09, 'square'); }
  }
}
