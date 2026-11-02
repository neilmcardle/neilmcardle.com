export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1080;

export type Shot = {
  id: string;
  year: string;
  num: number;
  title: string;
  ink: string;
  bg: string;
  from: number;
  to: number;
  rate?: number;
  sfx: string;
  sfxAt: number;
};

export const SHOTS: Shot[] = [
  {
    id: "sketchpad",
    year: "1963",
    num: 1963,
    title: "Sketchpad",
    ink: "#d8ecf2",
    bg: "#06090c",
    from: 3.7,
    to: 5.3,
    sfx: "zap",
    sfxAt: 0.4,
  },
  {
    id: "nls",
    year: "1968",
    num: 1968,
    title: "NLS and the mouse",
    ink: "#e9eee6",
    bg: "#111311",
    from: 0.95,
    to: 2.05,
    sfx: "keyset",
    sfxAt: 0.33,
  },
  {
    id: "unix",
    year: "1971",
    num: 1971,
    title: "The command line",
    ink: "#26221b",
    bg: "#e6dfcd",
    from: 2.9,
    to: 4.2,
    sfx: "teletype",
    sfxAt: 0.68,
  },
  {
    id: "plato",
    year: "1972",
    num: 1972,
    title: "PLATO",
    ink: "#ffb25a",
    bg: "#120a04",
    from: 3.0,
    to: 4.2,
    sfx: "plasma",
    sfxAt: 0.66,
  },
  {
    id: "desktop",
    year: "1984",
    num: 1984,
    title: "The desktop",
    ink: "#111111",
    bg: "#f4f2ee",
    from: 2.85,
    to: 4.0,
    sfx: "beep",
    sfxAt: 0.3,
  },
  {
    id: "web",
    year: "1993",
    num: 1993,
    title: "The web",
    ink: "#111111",
    bg: "#d9d9d9",
    from: 0.9,
    to: 2.1,
    sfx: "modem",
    sfxAt: 0,
  },
  {
    id: "bevels",
    year: "1995",
    num: 1995,
    title: "Bevels and the taskbar",
    ink: "#f2f7f7",
    bg: "#0c6b6b",
    from: 1.9,
    to: 3.1,
    sfx: "ding",
    sfxAt: 0.85,
  },
  {
    id: "pen",
    year: "1996",
    num: 1996,
    title: "Pen computing",
    ink: "#1f2419",
    bg: "#d7dccd",
    from: 2.75,
    to: 4.05,
    sfx: "scratch",
    sfxAt: 0.1,
  },
  {
    id: "aqua",
    year: "2001",
    num: 2001,
    title: "Aqua",
    ink: "#14223a",
    bg: "#dfe8f3",
    from: 2.6,
    to: 3.95,
    sfx: "pop",
    sfxAt: 0.68,
  },
  {
    id: "ajax",
    year: "2005",
    num: 2005,
    title: "The web becomes software",
    ink: "#16233a",
    bg: "#eef3f8",
    from: 2.65,
    to: 3.85,
    sfx: "whoosh",
    sfxAt: 0.1,
  },
  {
    id: "feed",
    year: "2006",
    num: 2006,
    title: "The feed",
    ink: "#17202e",
    bg: "#e9edf3",
    from: 0.8,
    to: 2.0,
    sfx: "ping",
    sfxAt: 0.25,
  },
  {
    id: "touch",
    year: "2007",
    num: 2007,
    title: "Multi-touch",
    ink: "#eef0f4",
    bg: "#1b1d22",
    from: 0.75,
    to: 2.0,
    sfx: "unlock",
    sfxAt: 0.85,
  },
  {
    id: "flat",
    year: "2013",
    num: 2013,
    title: "The flattening",
    ink: "#14161a",
    bg: "#f3f4f7",
    from: 0.95,
    to: 3.35,
    rate: 1.8,
    sfx: "glass",
    sfxAt: 0.1,
  },
  {
    id: "voice",
    year: "2014",
    num: 2014,
    title: "Voice",
    ink: "#eef0f2",
    bg: "#1c1e22",
    from: 1.0,
    to: 2.4,
    sfx: "chime",
    sfxAt: 0.2,
  },
  {
    id: "prompt",
    year: "2023",
    num: 2023,
    title: "Conversational",
    ink: "#1a1918",
    bg: "#fbfaf8",
    from: 1.2,
    to: 3.3,
    rate: 1.5,
    sfx: "stream",
    sfxAt: 0.05,
  },
  {
    id: "agents",
    year: "2025",
    num: 2025,
    title: "Agents",
    ink: "#1b1a17",
    bg: "#f4f3ef",
    from: 13.6,
    to: 15.5,
    rate: 1.4,
    sfx: "confirm",
    sfxAt: 0.6,
  },
];

export const framesOf = (s: Shot) =>
  Math.round(((s.to - s.from) / (s.rate ?? 1)) * FPS);

export const STARTS = SHOTS.reduce<number[]>((acc, s, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + framesOf(SHOTS[i - 1]));
  return acc;
}, []);

export const LOCKUP_FROM =
  STARTS[SHOTS.length - 1] + framesOf(SHOTS[SHOTS.length - 1]);
export const LOCKUP = 84;
export const DURATION = LOCKUP_FROM + LOCKUP;

export const PAPER = "#ebe8e4";
export const INK = "#1b1a18";
export const MUTED = "#5d5952";
export const EASE = [0.2, 0.8, 0.2, 1] as const;
