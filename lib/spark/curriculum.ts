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

const WORDS_PER_MINUTE = 190;

export function readingMinutes(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}
