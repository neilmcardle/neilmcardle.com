export interface Phase {
  id: string;
  name: string;
  from: number;
  to: number;
}

export const PHASES: Phase[] = [
  { id: "foundations", name: "Foundations", from: 1, to: 5 },
  { id: "js-react", name: "JavaScript and React", from: 6, to: 10 },
  { id: "de-core", name: "Design engineer core", from: 11, to: 14 },
  { id: "full-stack", name: "Full stack", from: 15, to: 18 },
  { id: "capstone", name: "Capstone", from: 19, to: 19 },
];

export function phaseForModule(moduleNumber: number): Phase {
  return (
    PHASES.find((p) => moduleNumber >= p.from && moduleNumber <= p.to) ??
    PHASES[PHASES.length - 1]
  );
}

export function phaseLabel(phase: Phase): string {
  const index = PHASES.indexOf(phase);
  return `Phase ${index} ${String.fromCharCode(183)} ${phase.name}`;
}

export interface Thread {
  id: string;
  name: string;
  tone: "gold" | "terracotta" | "sage";
  blurb: string;
}

export const THREADS: Thread[] = [
  {
    id: "chosen-vs-fixed",
    name: "Chosen vs fixed",
    tone: "gold",
    blurb:
      "Which parts of this code did you pick, and which parts does the language or framework insist on? Learning to feel the difference is most of the skill.",
  },
  {
    id: "your-code-vs-the-platform",
    name: "Your code vs the platform",
    tone: "terracotta",
    blurb:
      "Two layers of rules sit on the same line. Language features are enforced by one machine, framework conventions by another. They look identical on the page.",
  },
  {
    id: "language-vs-framework",
    name: "Language vs framework",
    tone: "terracotta",
    blurb:
      "The same distinction, named from the other side. JavaScript itself, versus the conventions React or Next layer on top of it.",
  },
  {
    id: "craft-is-the-differentiator",
    name: "Craft is the differentiator",
    tone: "gold",
    blurb:
      "The detail nobody asks for is the one people feel. This thread tracks where care separates working from good.",
  },
  {
    id: "design-in-the-browser",
    name: "Design in the browser",
    tone: "sage",
    blurb:
      "The browser is a design tool. This thread follows the work that moves out of Figma and into the running thing.",
  },
];

const THREAD_ALIASES: Record<string, string> = {
  "design-in-the-browser / figma↔code": "design-in-the-browser",
  "figma↔code": "design-in-the-browser",
  "your-code-vs-platform": "your-code-vs-the-platform",
};

export function resolveThreads(raw: unknown): Thread[] {
  if (!Array.isArray(raw)) return [];

  const resolved: Thread[] = [];

  for (const entry of raw) {
    if (typeof entry !== "string") continue;
    const key = entry.trim().toLowerCase();
    const id = THREAD_ALIASES[key] ?? key;
    const thread = THREADS.find((t) => t.id === id);
    if (thread && !resolved.some((t) => t.id === thread.id)) {
      resolved.push(thread);
    }
  }

  return resolved;
}

const WORDS_PER_MINUTE = 190;

export function readingMinutes(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}
