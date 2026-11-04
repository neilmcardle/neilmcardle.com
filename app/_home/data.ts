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

const LAB: Piece[] = [
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
  {
    id: "doodlewire",
    title: "DoodleWire",
    line: "Wireframe from your phone.",
    kind: "iOS app",
    href: "/work/doodlewire",
    image: "/home/leads/doodlewire.jpg",
    local: true,
  },
];

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
    image: "/work/performance-ui/with.jpg",
    local: true,
  },
];

export const STACK = [
  "doodlewire",
  "coverly",
  "makeebook",
  "avis",
  "performance-ui",
]
  .map((id) => [...WORK, ...LAB].find((piece) => piece.id === id))
  .filter((piece): piece is Piece => Boolean(piece));

export const PLAY: Piece[] = [
  ...LAB,
  {
    id: "chess",
    title: "Chess Path",
    line: "Teach yourself chess.",
    kind: "In progress",
    href: "/chess",
    image: "/home/leads/chess-path.jpg",
  },
  {
    id: "spark",
    title: "Spark",
    line: "A course for designers learning to build.",
    kind: "In progress",
    href: "/spark",
    image: "/home/leads/spark.jpg",
  },
  {
    id: "ui",
    title: "A history of UI",
    kind: "Lab",
    href: "/explorations/history-of-ui",
    image: "/home/peek/history-of-ui.jpg",
  },
  {
    id: "architecture",
    title: "A history of architecture",
    kind: "Lab",
    href: "/explorations/architecture",
    image: "/home/peek/architecture.jpg",
  },
  {
    id: "checkout",
    title: "Self-healing checkout",
    kind: "Lab",
    href: "/explorations/self-healing-checkout",
    image: "/home/peek/self-healing-checkout.jpg",
  },
  {
    id: "logo",
    title: "Logo Animator Studio",
    kind: "Lab",
    href: "/logo-animator-studio",
    image: "/home/peek/logo-animator-studio.jpg",
  },
  {
    id: "ui-taste",
    title: "UI taste",
    line: "Decide your interface taste, one choice at a time.",
    kind: "Tool",
    href: "/ui-taste",
  },
  {
    id: "icons",
    title: "Icon Animator",
    kind: "Tool",
    href: "/icon-animator",
  },
  {
    id: "promptr",
    title: "Promptr",
    kind: "Tool",
    href: "/promptr",
  },
];
