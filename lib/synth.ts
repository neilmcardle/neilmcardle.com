function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function bandpass(sampleRate: number) {
  let low = 0;
  let band = 0;
  return (input: number, cutoff: number, q: number) => {
    const f =
      2 * Math.sin((Math.PI * Math.min(cutoff, sampleRate / 6)) / sampleRate);
    low += f * band;
    const high = input - low - band / q;
    band += f * high;
    return band;
  };
}

function normalise(channels: Float32Array[], peak: number) {
  let max = 0;
  for (const data of channels)
    for (let i = 0; i < data.length; i++)
      max = Math.max(max, Math.abs(data[i]));
  if (!max) return;
  const scale = peak / max;
  for (const data of channels)
    for (let i = 0; i < data.length; i++) data[i] *= scale;
}

export function particleFall(ctx: BaseAudioContext) {
  const rate = ctx.sampleRate;
  const seconds = 1.8;
  const length = Math.floor(rate * seconds);
  const buffer = ctx.createBuffer(2, length, rate);
  const channels = [buffer.getChannelData(0), buffer.getChannelData(1)];
  channels.forEach((data, c) => {
    const random = seeded(17 + c * 101);
    const air = bandpass(rate);
    const grit = bandpass(rate);
    let ping = 0;
    for (let i = 0; i < length; i++) {
      const t = i / rate;
      const p = t / seconds;
      const cutoff = 9000 * Math.pow(2600 / 9000, Math.pow(p, 0.8));
      const density = 90 * (1 - p) + 6;
      if (random() < density / rate) ping = (random() * 2 - 1) * 6;
      const noise = random() * 2 - 1;
      const attack = Math.min(1, t / 0.14);
      const envelope =
        Math.sin((attack * Math.PI) / 2) *
        Math.exp(-2.4 * p) *
        (1 - Math.pow(p, 6));
      data[i] =
        (air(noise, cutoff, 1.6) + grit(ping, cutoff * 1.4, 9) * 0.5) *
        envelope;
      ping *= 0.94;
    }
  });
  normalise(channels, 0.07);
  return buffer;
}
