export type Piece = {
  id: string;
  title: string;
  line?: string;
  kind: string;
  href: string;
  image?: string;
  film?: string;
  local?: boolean;
};

export const WORK: Piece[] = [
  {
    id: "makeebook",
    title: "makeebook",
    line: "A peaceful place for authors to write.",
    kind: "Product",
    href: "/work/makeebook",
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

export const WRITING_PUBLIC = false;

export const WRITING: Piece[] = [
  {
    id: "history-of-design-tools",
    title: "A History of Design Tools",
    line: "Sixty years, from Sketchpad to the prompt.",
    kind: "Essay",
    href: "/writing/history-of-design-tools",
    image: "/writing/history-of-design-tools/sketchpad-1963.png",
    local: true,
  },
  {
    id: "what-designers-are-saying",
    title: "What designers are saying",
    line: "A year of design talk, counted and read.",
    kind: "Research",
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

export const EXPLORATIONS: Piece[] = [
  {
    id: "ui",
    title: "A Brief History of UI",
    line: "Sixty years of interfaces.",
    kind: "Lab",
    href: "/explorations/history-of-ui",
    image: "/home/peek/history-of-ui-rain.jpg",
  },
  {
    id: "architecture-pixel",
    title: "Architecture in Pixels",
    line: "3D dioramas through time.",
    kind: "Lab",
    href: "/explorations/architecture-pixel",
    image: "/home/peek/architecture-pixel.jpg",
  },
];

export const PLAY: Piece[] = [
  ...EXPLORATIONS,
  {
    id: "chess",
    title: "Chess Path",
    line: "Teach yourself chess.",
    kind: "In progress",
    href: "/chess",
    image: "/home/leads/chess-path.jpg",
  },
  {
    id: "ui-taste",
    title: "UI Taste",
    line: "Decide your interface taste.",
    kind: "Tool",
    href: "/ui-taste",
    image: "/home/peek/ui-taste.jpg",
  },
  {
    id: "logo",
    title: "Logo Animator Studio",
    line: "A concept where agents animate logos.",
    kind: "Lab",
    href: "/logo-animator-studio",
    image: "/home/peek/logo-animator-studio.jpg",
  },
  {
    id: "podium",
    title: "Podium",
    line: "Branding for an indie game.",
    kind: "Brand",
    href: "/work/podium",
    image: "/home/leads/podium.jpg",
    film: "/home/podium.mp4",
    local: true,
  },
];
