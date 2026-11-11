export type Piece = {
  id: string;
  title: string;
  line?: string;
  kind: string;
  href: string;
  image?: string;
  film?: string;
  local?: boolean;
  live?: { label: string; href: string };
};

export const WORK: Piece[] = [
  {
    id: "makeebook",
    title: "makeebook",
    line: "A peaceful place for authors to write.",
    kind: "Product",
    href: "/work/makeebook",
    live: { label: "makeebook.ink", href: "https://makeebook.ink" },
    image: "/home/leads/makeebook.jpg",
    film: "/home/makeebook.mp4",
    local: true,
  },
  {
    id: "coverly",
    title: "coverly",
    line: "Inspiration for your next book cover.",
    kind: "Product",
    href: "/work/coverly",
    live: { label: "Open coverly", href: "/coverly" },
    image: "/home/leads/coverly-books.jpg",
    film: "/home/coverly.mp4",
    local: true,
  },
  {
    id: "doodlewire",
    title: "DoodleWire",
    line: "Wireframe from your phone.",
    kind: "iOS app",
    href: "/work/doodlewire",
    live: {
      label: "App Store",
      href: "https://apps.apple.com/us/app/doodlewire/id6771274835",
    },
    image: "/home/leads/doodlewire.jpg",
    local: true,
  },
  {
    id: "avis",
    title: "Avis checkout",
    line: "Five steps to three, live on avis.com.",
    kind: "Case study",
    href: "/work/avis",
    image: "/home/leads/avis-card.jpg",
    film: "/home/avis.mp4",
    local: true,
  },
  {
    id: "performance-ui",
    title: "Performance UI",
    line: "A design system written for agents.",
    kind: "Design system",
    href: "/work/performance-ui",
    image: "/home/peek/performance-ui.jpg",
    local: true,
  },
];

export const WRITING_PUBLIC = true;

export const WRITING: Piece[] = [
  {
    id: "history-of-design-tools",
    title: "A History of Design Tools",
    line: "Sixty years, from Sketchpad to the prompt.",
    kind: "In progress",
    href: "/writing/history-of-design-tools",
    image: "/writing/history-of-design-tools/sketchpad-1963.png",
    local: true,
  },
  {
    id: "what-designers-are-saying",
    title: "What designers are saying",
    line: "A year of design talk, counted and read.",
    kind: "In progress",
    href: "/writing/what-designers-are-saying",
    image: "/writing/what-designers-are-saying/chart-term-shifts.svg",
    local: true,
  },
];

export const STACK = [
  "coverly",
  "doodlewire",
  "makeebook",
  "avis",
  "performance-ui",
]
  .map((id) => WORK.find((piece) => piece.id === id))
  .filter((piece): piece is Piece => Boolean(piece));

export const PLAY: Piece[] = [
  {
    id: "tessera",
    title: "Tessera",
    line: "A triangle game for two.",
    kind: "Game",
    href: "/tessera",
    live: {
      label: "App Store",
      href: "https://apps.apple.com/us/app/tessera-the-triangle-game/id6774786982",
    },
    image: "/home/peek/tessera.jpg",
  },
  {
    id: "ui",
    title: "A Brief History of UI",
    line: "Sixty years of interfaces.",
    kind: "Lab",
    href: "/explorations/history-of-ui",
    image: "/home/peek/history-of-ui-rain.jpg",
  },
  {
    id: "world",
    title: "A History of the World",
    line: "300,000 years on a globe.",
    kind: "Lab",
    href: "/explorations/history-of-the-world",
    image: "/home/peek/history-of-the-world.jpg",
  },
  {
    id: "n-particles",
    title: "N Particles",
    line: "My N, drawn in particles.",
    kind: "Lab",
    href: "/explorations/n-particles",
    image: "/home/peek/n-particles.jpg",
  },
];

export const TOYS = [
  {
    title: "Bonsai",
    verb: "Shake it",
    embed: "/pixel-bonsai?card=1",
    image: "/home/play/pixel-bonsai.jpg",
  },
];

export const COLLECTION: Piece[] = [
  {
    id: "plink-pond",
    title: "Plink Pond",
    line: "Skim stones across a pixel pond.",
    kind: "Game",
    href: "/explorations/plink-pond",
    image: "/home/peek/plink-pond.jpg",
  },
  {
    id: "record-player",
    title: "Record player",
    line: "A suitcase record player you can open and play.",
    kind: "Toy",
    href: "/explorations/record-player",
    image: "/home/peek/record-player.jpg",
  },
  {
    id: "cs6-book",
    title: "Illustrator CS6 book",
    line: "The book I taught myself Illustrator with.",
    kind: "Keepsake",
    href: "/explorations/cs6-book",
    image: "/home/peek/cs6-book.jpg",
  },
];
