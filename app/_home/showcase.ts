import type { MarkKey } from "./ProductMark";

export type ShowcaseInfo = {
  mark: MarkKey;
  what: string;
  note: string;
  label: string;
  type: string;
  status?: string;
  x?: string;
};

export const SHOWCASE: Record<string, ShowcaseInfo> = {
  makeebook: {
    mark: "makeebook",
    what: "A peaceful place for authors to write their most thoughtful work.",
    note: "A web-based editor takes a manuscript to a store-ready ebook.",
    label: "makeebook.ink",
    type: "Writing platform",
    x: "makeebook",
  },
  DoodleWire: {
    mark: "doodlewire",
    what: "Wireframe from your phone.",
    note: "Just you, your phone and your imagination.",
    label: "App Store",
    type: "Wireframing tool, iOS",
  },
  Coverly: {
    mark: "coverly",
    what: "Be inspired to design your next book cover.",
    note: "A research tool for book cover designers.",
    label: "Visit",
    type: "Design research tool",
  },
  Spark: {
    mark: "spark",
    what: "A course for designers heading in the direction of design-engineer.",
    note: "Written by a designer, for designers.",
    label: "Visit",
    type: "Learning platform",
    status: "In progress",
  },
};
