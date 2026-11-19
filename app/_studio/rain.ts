import { media } from "@/lib/media";

const SOURCES = [
  media("/audio/rain-studio.mp3"),
  media("/audio/rain-medium.mp3"),
];
const LEVEL = 0.14;
const TRIM = 0.05;

export class Rain {
  private ctx: AudioContext | null = null;
  private gain: GainNode | null = null;
  private loading: Promise<void> | null = null;
  private wanted = false;

  private load() {
    if (this.loading) return this.loading;
    const Ctx =
      window.AudioContext ??
      (window as Window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return Promise.resolve();
    const ctx = new Ctx();
    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.connect(ctx.destination);
    this.ctx = ctx;
    this.gain = gain;
    const fetchFirst = async () => {
      for (const src of SOURCES) {
        const r = await fetch(src).catch(() => null);
        if (r?.ok) return r;
      }
      throw new Error("no rain");
    };
    this.loading = fetchFirst()
      .then((r) => r.arrayBuffer())
      .then((data) => ctx.decodeAudioData(data))
      .then((buffer) => {
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        source.loopStart = TRIM;
        source.loopEnd = buffer.duration - TRIM;
        source.connect(gain);
        source.start(0, TRIM);
        this.apply();
      })
      .catch(() => undefined);
    return this.loading;
  }

  set(on: boolean) {
    this.wanted = on;
    if (on) {
      void this.load();
      if (this.ctx?.state === "suspended") void this.ctx.resume();
    }
    this.apply();
  }

  private apply() {
    if (!this.ctx || !this.gain) return;
    const now = this.ctx.currentTime;
    this.gain.gain.cancelScheduledValues(now);
    this.gain.gain.setTargetAtTime(
      this.wanted ? LEVEL : 0,
      now,
      this.wanted ? 0.6 : 0.2,
    );
  }

  destroy() {
    void this.ctx?.close();
    this.ctx = null;
    this.gain = null;
    this.loading = null;
  }
}
