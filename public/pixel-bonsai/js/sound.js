const BLOB = "https://ir0qcjbilbtejz9a.public.blob.vercel-storage.com/audio/";
const FILES = ["bonsai-1.mp3", "bonsai-2.mp3", "bonsai-3.mp3"];
const SKIP = [0.18, 0.22, 0.42];

let context = null;
let buffers = null;
let next = 0;
let last = null;
let lastAt = 0;

function audio() {
  const Ctor = window.AudioContext || window.webkitAudioContext;
  if (!Ctor) return null;
  context = context || new Ctor();
  return context;
}

function load() {
  const ctx = audio();
  if (!ctx || buffers) return;
  buffers = FILES.map(() => null);
  FILES.forEach((file, i) => {
    fetch(BLOB + file)
      .then((r) => r.arrayBuffer())
      .then((raw) => ctx.decodeAudioData(raw))
      .then((decoded) => {
        buffers[i] = decoded;
      })
      .catch(() => {});
  });
}

export function wake() {
  load();
  if (context && context.state === "suspended")
    context.resume().catch(() => {});
}

export function shakeSound(force) {
  const ctx = audio();
  if (!ctx || !buffers || ctx.state !== "running") return;
  const now = performance.now();
  if (now - lastAt < 120) return;
  const index = next;
  const buffer = buffers[index];
  next = (next + 1) % FILES.length;
  if (!buffer) return;
  lastAt = now;
  if (last) last.stop();
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(
    Math.min(0.2, 0.1 + force * 0.08),
    ctx.currentTime + 0.02,
  );
  source.connect(gain).connect(ctx.destination);
  source.start(0, SKIP[index]);
  last = source;
}

load();
