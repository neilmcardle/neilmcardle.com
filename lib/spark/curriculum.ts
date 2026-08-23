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
  question: string;
  tone: "gold" | "terracotta" | "sage";
  blurb: string;
  example: string;
}

export const THREADS: Thread[] = [
  {
    id: "chosen-vs-fixed",
    name: "Your call, or the rule",
    question: "Did I choose this, or does the code require it?",
    tone: "gold",
    blurb:
      "Some of what you write is your decision, the way a layer name is. Some of it the tool insists on, the way Auto Layout insists on a direction. Telling the two apart is most of learning to code.",
    example:
      "You picked the name count. You did not pick that useState hands back exactly two things, in that order.",
  },
  {
    id: "which-machine",
    name: "Who is enforcing this?",
    question: "If this breaks, which thing complains?",
    tone: "terracotta",
    blurb:
      "Two sets of rules sit on the same line. JavaScript itself is one. React or Next is the other. They look identical on the page and they fail in completely different ways, so knowing which you are up against tells you where to look.",
    example:
      "onClick looks like the browser\u2019s onclick. It is not. React invented that one, so React is the thing that will complain.",
  },
  {
    id: "where-craft-shows",
    name: "Where craft shows",
    question: "Would anyone notice if I skipped this?",
    tone: "gold",
    blurb:
      "A few details nobody asks for are the ones people feel. This thread marks the places where care is the whole difference between working and good.",
    example:
      "Nobody files a bug about a missing transition. They just say the app feels cheap.",
  },
  {
    id: "design-in-the-browser",
    name: "Designing in the browser",
    question: "Should this decision leave Figma?",
    tone: "sage",
    blurb:
      "Some things can only be judged running: hover, focus, real text lengths, what a layout does at 320 pixels wide. This thread follows the work that belongs in code rather than on a canvas.",
    example:
      "A hover state is one frame in Figma. In the browser it has a duration, a curve, and a state it returns to.",
  },
];

const THREAD_ALIASES: Record<string, string> = {
  "your-code-vs-the-platform": "which-machine",
  "your-code-vs-platform": "which-machine",
  "language-vs-framework": "which-machine",
  "craft-is-the-differentiator": "where-craft-shows",
  "design-in-the-browser / figma\u2194code": "design-in-the-browser",
  "figma\u2194code": "design-in-the-browser",
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
