export const SPEED_LABELS = [
  "Calm",
  "Light air",
  "Light breeze",
  "Gentle breeze",
  "Fresh breeze",
];
export const GUST_LABELS = [
  "No gusts",
  "Light gusts",
  "Rolling gusts",
  "Hard gusts",
  "Wild gusts",
];

const SPEED_SCALE = [0, 0.22, 0.46, 0.74, 1];
const GUST_SCALE = [0, 0.28, 0.54, 0.82, 1.15];

const WEATHER = {
  breezy: { multiplier: 1, period: 5.4, bite: 0.6 },
  storm: { multiplier: 1.85, period: 2.6, bite: 1 },
};

const TRACKS = {
  breezy: [
    [0, 0.08],
    [0.14, 0.3],
    [0.26, 0.78],
    [0.38, 0.5],
    [0.52, 0.95],
    [0.66, 0.42],
    [0.82, 0.18],
    [1, 0.08],
  ],
  storm: [
    [0, 0.32],
    [0.08, 0.92],
    [0.18, 0.58],
    [0.3, 1],
    [0.42, 0.7],
    [0.55, 1],
    [0.7, 0.48],
    [0.86, 0.88],
    [1, 0.32],
  ],
};

const STILL = 0.055;

function ease(t) {
  return t * t * (3 - 2 * t);
}

function sampleTrack(track, phase) {
  for (let i = 0; i < track.length - 1; i += 1) {
    const [t0, v0] = track[i];
    const [t1, v1] = track[i + 1];
    if (phase >= t0 && phase <= t1) {
      const span = t1 - t0 || 1;
      return v0 + (v1 - v0) * ease((phase - t0) / span);
    }
  }
  return track[track.length - 1][1];
}

export function createWindSettings() {
  return { enabled: true, weather: "breezy", direction: 1, speed: 2, gusts: 1 };
}

export function sampleWind(settings, time, damp = 1) {
  if (!settings.enabled) {
    const idle = STILL * damp;
    return {
      strength: idle,
      lean: 0,
      gust: 0,
      direction: settings.direction,
      storm: false,
    };
  }
  const weather = WEATHER[settings.weather] ?? WEATHER.breezy;
  const base = SPEED_SCALE[settings.speed] * weather.multiplier;
  const phase = (time / weather.period) % 1;
  const gust =
    sampleTrack(TRACKS[settings.weather] ?? TRACKS.breezy, phase) *
    GUST_SCALE[settings.gusts];
  const strength = Math.max(STILL, base + gust * weather.bite) * damp;
  return {
    strength,
    lean: strength * 0.62 * settings.direction,
    gust,
    direction: settings.direction,
    storm: settings.weather === "storm",
  };
}
