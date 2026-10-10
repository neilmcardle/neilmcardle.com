import type { MarkKey } from "./ProductMark";

export type ShowcaseInfo = {
  mark?: MarkKey;
  markImage?: string;
  what: string;
  label?: string;
  type: string;
  role: string;
  status?: string;
  x?: string;
};

export const SHOWCASE: Record<string, ShowcaseInfo> = {
  makeebook: {
    mark: "makeebook",
    what: "A peaceful place for authors to write their most thoughtful work.",
    label: "makeebook.ink",
    type: "Writing platform",
    role: "Solo, design and build",
    status: "Live",
  },
  DoodleWire: {
    mark: "doodlewire",
    what: "Wireframe from your phone.",
    label: "App Store",
    type: "Wireframing tool, iOS",
    role: "Solo, design and build",
    status: "Live",
  },
  Coverly: {
    mark: "coverly",
    what: "Be inspired to design your next book cover.",
    label: "Visit",
    type: "Design research tool",
    role: "Solo, design and build",
    status: "Live",
  },
  Spark: {
    mark: "spark",
    what: "A course for designers heading in the direction of design-engineer.",
    label: "Visit",
    type: "Learning platform",
    role: "Solo, design and build",
    status: "In progress",
  },
  Podium: {
    markImage: "/home/podium/mark.png",
    what: "You’re a boy in a blue hoodie, alone on a London housing estate.",
    type: "Indie game",
    role: "Branding and visual design",
    status: "In development",
  },
};
