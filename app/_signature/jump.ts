import {
  APPS,
  COLLECTION,
  PLAY,
  STORIES,
  WORK,
  WRITING,
  type Piece,
} from "../_home/data";

export type JumpEntry = {
  id: string;
  title: string;
  line?: string;
  kind: string;
  section: Section;
  href: string;
  image?: string;
};

export const SECTIONS = ["Work", "Writing", "Playground"] as const;
export type Section = (typeof SECTIONS)[number];

export type JumpState = { open: boolean; query: string; index: number };

export type JumpEvent =
  | { type: "open" }
  | { type: "close" }
  | { type: "query"; value: string }
  | { type: "move"; delta: number };

const asEntry =
  (section: Section) =>
  ({ id, title, line, kind, href, image }: Piece): JumpEntry => ({
    id,
    title,
    line,
    kind,
    section,
    href,
    image,
  });

export const ENTRIES: JumpEntry[] = [
  ...[...WORK, ...APPS].map(asEntry("Work")),
  ...[...WRITING, ...STORIES].map(asEntry("Writing")),
  ...[...PLAY, ...COLLECTION].map(asEntry("Playground")),
];

export function countSections(entries: JumpEntry[]) {
  return SECTIONS.map((section) => ({
    section,
    count: entries.filter((entry) => entry.section === section).length,
  })).filter(({ count }) => count > 0);
}

export const initialJump: JumpState = { open: false, query: "", index: 0 };

export function matchEntries(entries: JumpEntry[], query: string): JumpEntry[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return entries;
  return entries.filter(
    (entry) =>
      entry.title.toLowerCase().includes(needle) ||
      entry.kind.toLowerCase().includes(needle) ||
      entry.section.toLowerCase().includes(needle) ||
      entry.line?.toLowerCase().includes(needle) === true,
  );
}

export function jump(state: JumpState, event: JumpEvent): JumpState {
  switch (event.type) {
    case "open":
      return state.open ? state : { ...initialJump, open: true };
    case "close":
      return initialJump;
    case "query":
      return { open: state.open, query: event.value, index: 0 };
    case "move": {
      const count = matchEntries(ENTRIES, state.query).length;
      if (count === 0)
        return state.index === 0 ? state : { ...state, index: 0 };
      const next = (((state.index + event.delta) % count) + count) % count;
      return next === state.index ? state : { ...state, index: next };
    }
  }
}

export function selected(state: JumpState): JumpEntry | null {
  if (!state.open) return null;
  return matchEntries(ENTRIES, state.query)[state.index] ?? null;
}
