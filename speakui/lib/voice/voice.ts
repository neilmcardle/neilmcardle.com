import { looksUnfinished } from "../engine/parse";
import { voiceModel } from "./model";

export type MicStatus = "off" | "starting" | "listening" | "hearing" | "error";

export type MicCallbacks = {
  onStatus: (status: MicStatus) => void;

  onProblem?: (message: string) => void;
  onLevel: (level: number) => void;
  onPartial: (text: string) => void;
  onFinal: (text: string, asrMs: number) => void;
};

const RATE = 16_000;
const FRAME = 1024;
const START_FRAMES = 2;
const PRE_ROLL_FRAMES = 5;
const PARTIAL_EVERY_MS = 450;

const COMPLETE_SILENCE_MS = 420;

const ENDPOINT_CHECK_MS = 180;
const MIN_SPEECH_MS = 300;
const MAX_UTTERANCE_MS = 20_000;

const WORKLET = `
class Capture extends AudioWorkletProcessor {
  constructor(options) { super(); this.buf = new Float32Array(options.processorOptions.size); this.n = 0; }
  process(inputs) {
    const ch = inputs[0] && inputs[0][0];
    if (ch) for (let i = 0; i < ch.length; i++) {
      this.buf[this.n++] = ch[i];
      if (this.n === this.buf.length) { this.port.postMessage(this.buf.slice(0)); this.n = 0; }
    }
    return true;
  }
}
registerProcessor("speakui-capture", Capture);
`;

let preferredDeviceId = "";
export function setPreferredInput(deviceId: string) {
  preferredDeviceId = deviceId;
}

export class Mic {
  endSilenceMs = 1100;

  partials = true;

  private cb: MicCallbacks;
  private ctx: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private node: AudioWorkletNode | null = null;
  private sink: GainNode | null = null;
  private watchdog: ReturnType<typeof setInterval> | null = null;
  private silentSince = 0;
  private input = "";
  private frames = 0;
  private peak = 0;

  private noise = 0.004;
  private loud = 0;
  private silentMs = 0;
  private speaking = false;
  private preRoll: Float32Array[] = [];
  private utterance: Float32Array[] = [];
  private sinceLastPartial = 0;

  private inRate = RATE;
  private rsCarry: Float32Array = new Float32Array(0);
  private rsPos = 0;

  private partialText = "";
  private partialSamples = 0;
  private endpointChecked = false;

  private busy = false;
  private pendingFinal: Float32Array | null = null;
  private partialSeq = 0;
  private stopped = false;

  constructor(cb: MicCallbacks) {
    this.cb = cb;
  }

  async start(): Promise<void> {
    if (!voiceModel.ready) throw new Error("Voice isn't set up yet.");
    this.cb.onStatus("starting");
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        ...(preferredDeviceId
          ? { deviceId: { exact: preferredDeviceId } }
          : {}),
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    const track = this.stream.getAudioTracks()[0];
    this.input = track?.label || "the default microphone";

    track?.addEventListener("mute", () => {
      if (!this.stopped)
        this.cb.onProblem?.(
          `“${this.input}” was muted by the system. Check microphone access for your browser in System Settings → Privacy & Security.`,
        );
    });
    track?.addEventListener("ended", () => {
      if (!this.stopped)
        this.cb.onProblem?.(
          `“${this.input}” stopped. Another app using the microphone (Zoom, a meeting, another browser) can take it.`,
        );
    });
    if (track?.muted) {
      this.cb.onProblem?.(
        `“${this.input}” is muted by the system. Check microphone access for your browser in System Settings → Privacy & Security.`,
      );
    }

    this.ctx = new AudioContext();
    await this.ctx.resume();
    this.inRate = this.ctx.sampleRate;
    const url = URL.createObjectURL(
      new Blob([WORKLET], { type: "application/javascript" }),
    );
    await this.ctx.audioWorklet.addModule(url);
    URL.revokeObjectURL(url);
    const source = this.ctx.createMediaStreamSource(this.stream);
    const size = Math.round((this.inRate * FRAME) / RATE);
    this.node = new AudioWorkletNode(this.ctx, "speakui-capture", {
      processorOptions: { size },
    });
    this.node.port.onmessage = (e) =>
      this.onFrame(this.resample(e.data as Float32Array));
    source.connect(this.node);

    this.sink = this.ctx.createGain();
    this.sink.gain.value = 0;
    this.node.connect(this.sink);
    this.sink.connect(this.ctx.destination);
    this.cb.onStatus("listening");

    this.silentSince = performance.now();
    this.watchdog = setInterval(() => {
      if (this.stopped) return;
      if (this.frames === 0 && performance.now() - this.silentSince > 2500) {
        this.cb.onProblem?.(
          `No audio at all is arriving from “${this.input}”. Pick a different input in the browser's site settings, or check microphone access in System Settings → Privacy & Security.`,
        );
        this.clearWatchdog();
      } else if (
        this.frames > 0 &&
        this.peak < 0.004 &&
        performance.now() - this.silentSince > 6000
      ) {
        this.cb.onProblem?.(
          `“${this.input}” is connected but no sound is coming through. Check System Settings → Sound → Input: if that meter doesn't move when you talk, the fault is in macOS rather than here.`,
        );
        this.clearWatchdog();
      }
    }, 1000);
  }

  private clearWatchdog() {
    if (this.watchdog) clearInterval(this.watchdog);
    this.watchdog = null;
  }

  stop(): void {
    this.stopped = true;
    this.clearWatchdog();
    this.node?.port.close();
    this.node?.disconnect();
    this.sink?.disconnect();
    void this.ctx?.close().catch(() => {});
    this.stream?.getTracks().forEach((t) => t.stop());
    this.node = null;
    this.sink = null;
    this.ctx = null;
    this.stream = null;
    this.frames = 0;
    this.peak = 0;
    this.speaking = false;
    this.utterance = [];
    this.preRoll = [];
    this.pendingFinal = null;
    this.cb.onLevel(0);
    this.cb.onStatus("off");
  }

  private resample(input: Float32Array): Float32Array {
    const ratio = this.inRate / RATE;
    if (ratio === 1) return input;
    const buf = new Float32Array(this.rsCarry.length + input.length);
    buf.set(this.rsCarry);
    buf.set(input, this.rsCarry.length);

    const count = Math.max(0, Math.floor((buf.length - this.rsPos) / ratio));
    const out = new Float32Array(count);
    let p = this.rsPos;
    for (let i = 0; i < count; i++) {
      const start = Math.floor(p);
      const end = Math.max(
        start + 1,
        Math.min(buf.length, Math.floor(p + ratio)),
      );
      let sum = 0;
      for (let j = start; j < end; j++) sum += buf[j];
      out[i] = sum / (end - start);
      p += ratio;
    }
    const used = Math.floor(p);
    this.rsCarry = buf.slice(used);
    this.rsPos = p - used;
    return out;
  }

  private onFrame(frame: Float32Array) {
    if (!frame.length || this.stopped) return;
    const frameMs = (frame.length / RATE) * 1000;
    let sum = 0;
    for (let i = 0; i < frame.length; i++) sum += frame[i] * frame[i];
    const rms = Math.sqrt(sum / frame.length);
    this.frames++;
    if (rms > this.peak) this.peak = rms;
    this.cb.onLevel(Math.min(1, Math.sqrt(rms / 0.15)));

    const threshold = Math.max(0.006, this.noise * 2.5);

    if (!this.speaking) {
      this.noise = Math.max(0.002, this.noise * 0.96 + rms * 0.04);
      this.preRoll.push(frame);
      if (this.preRoll.length > PRE_ROLL_FRAMES) this.preRoll.shift();
      this.loud = rms > threshold ? this.loud + 1 : 0;
      if (this.loud >= START_FRAMES) {
        this.speaking = true;
        this.utterance = [...this.preRoll];
        this.preRoll = [];
        this.silentMs = 0;
        this.sinceLastPartial = 0;
        this.partialText = "";
        this.partialSamples = 0;
        this.endpointChecked = false;
        this.cb.onStatus("hearing");
      }
      return;
    }

    this.utterance.push(frame);
    this.silentMs = rms < threshold * 0.6 ? this.silentMs + frameMs : 0;
    this.sinceLastPartial += frameMs;
    const lengthMs =
      this.utterance.reduce((n, f) => n + f.length, 0) / (RATE / 1000);

    const samples = this.utterance.reduce((n, f) => n + f.length, 0);

    if (
      this.silentMs >= ENDPOINT_CHECK_MS &&
      !this.endpointChecked &&
      !this.busy
    ) {
      this.endpointChecked = true;
      void this.runPartial(this.merged(), samples);
    }

    const heardItAll =
      this.partialSamples >=
      samples - Math.round((this.silentMs / 1000) * RATE) - RATE / 4;
    const complete =
      !!this.partialText && heardItAll && !looksUnfinished(this.partialText);
    const endAfter = complete ? COMPLETE_SILENCE_MS : this.endSilenceMs;

    if (this.silentMs >= endAfter || lengthMs >= MAX_UTTERANCE_MS) {
      this.endUtterance(lengthMs - this.silentMs);
      return;
    }
    if (
      this.partials &&
      this.sinceLastPartial >= PARTIAL_EVERY_MS &&
      !this.busy
    ) {
      this.sinceLastPartial = 0;
      void this.runPartial(this.merged(), samples);
    }
  }

  private endUtterance(speechMs: number) {
    const audio = this.merged();
    const samples = audio.length;
    const spoken = samples - Math.round((this.silentMs / 1000) * RATE);
    this.speaking = false;
    this.utterance = [];
    this.loud = 0;
    this.cb.onStatus("listening");
    if (speechMs < MIN_SPEECH_MS) return;

    if (this.partialText && this.partialSamples >= spoken - RATE / 4) {
      this.cb.onFinal(this.partialText, 0);
      this.partialText = "";
      return;
    }
    if (this.busy) this.pendingFinal = audio;
    else void this.runFinal(audio);
  }

  private async runPartial(audio: Float32Array, covers: number) {
    const id = ++this.partialSeq;
    this.busy = true;
    const { text } = await voiceModel.transcribe(audio);
    this.busy = false;
    if (this.stopped || id !== this.partialSeq) return this.drainFinal();
    if (text) {
      this.partialText = text;
      this.partialSamples = covers;

      if (this.speaking) this.cb.onPartial(text);
    }
    this.drainFinal();
  }

  private async runFinal(audio: Float32Array) {
    this.busy = true;
    this.partialSeq++;
    const { text, ms } = await voiceModel.transcribe(audio);
    this.busy = false;
    if (!this.stopped && text) this.cb.onFinal(text, ms);
    this.drainFinal();
  }

  private drainFinal() {
    const next = this.pendingFinal;
    if (!next) return;
    this.pendingFinal = null;
    void this.runFinal(next);
  }

  private merged(): Float32Array {
    const out = new Float32Array(
      this.utterance.reduce((n, f) => n + f.length, 0),
    );
    let o = 0;
    for (const f of this.utterance) {
      out.set(f, o);
      o += f.length;
    }
    return out;
  }
}
