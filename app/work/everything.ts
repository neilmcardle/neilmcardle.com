import { COVERS } from "../_signature/data/covers";

export type Entry = { name: string; line: string; href?: string };
export type Section = { title: string; entries: Entry[] };

export const SECTIONS: Section[] = [
  {
    title: "Products",
    entries: [
      {
        name: "Spark",
        line: "A course taking designers to design engineer.",
        href: "/spark",
      },
      {
        name: "Podium",
        line: "A platformer set on Middlesex Street Estate, made in Godot.",
        href: "/work/podium",
      },
      {
        name: "Vector Paint",
        line: "Draw in the browser and order it as a canvas print.",
        href: "/vector-paint",
      },
    ],
  },
  {
    title: "Systems and tools",
    entries: [
      {
        name: "Looks UI",
        line: "The dark layer on top of Performance UI that this site uses.",
        href: "/work/performance-ui",
      },
      {
        name: "UI Taste",
        line: "Decide your interface taste, one choice at a time.",
        href: "/ui-taste",
      },
      {
        name: "a11y-kit",
        line: "The components coding agents get wrong, specified and proved.",
      },
      {
        name: "Chess Path",
        line: "Teach yourself chess, from your first move.",
        href: "/chess",
      },
      {
        name: "Promptr",
        line: "Score a prompt against a rubric, then refine it.",
        href: "/promptr",
      },
      {
        name: "Suggest a change",
        line: "Suggest a change to this site and an agent builds it for my review.",
        href: "/suggest",
      },
      {
        name: "tandem-clip",
        line: "Records product films straight from the browser.",
      },
    ],
  },
  {
    title: "Explorations",
    entries: [
      {
        name: "Self-healing checkout",
        line: "A checkout that fixes its own errors.",
        href: "/explorations/self-healing-checkout",
      },
      {
        name: "Architecture in Pixels",
        line: "3D dioramas through time.",
        href: "/explorations/architecture-pixel",
      },
      {
        name: "A History of Architecture",
        line: "Thirty buildings, drawn.",
        href: "/explorations/architecture",
      },
      {
        name: "How Big Companies Started",
        line: "What the 100 biggest cost to start.",
        href: "/explorations/how-companies-started",
      },
      {
        name: "Logo Animator Studio",
        line: "A concept where agents animate logos.",
        href: "/logo-animator-studio",
      },
    ],
  },
  {
    title: "For my kids",
    entries: [
      {
        name: "Touchtype",
        line: "Learn to type, with a track for children.",
        href: "/touchtype",
      },
      {
        name: "Time Teacher",
        line: "Learn to tell the time on a clock face.",
        href: "/time-teacher",
      },
      {
        name: "Kids Alphabet",
        line: "An alphabet game.",
        href: "/kids-alphabet",
      },
      { name: "Math Academy", line: "Maths lessons, still early." },
    ],
  },
  {
    title: "Writing",
    entries: [
      {
        name: "A History of Design Tools",
        line: "From Sketchpad to the prompt box.",
        href: "/writing/history-of-design-tools",
      },
      {
        name: "What designers are saying",
        line: "A year of design podcasts, counted.",
        href: "/writing/what-designers-are-saying",
      },
    ],
  },
  {
    title: "Painting",
    entries: [
      {
        name: "Paintings",
        line: "Where I started, before screens.",
        href: "/paintings",
      },
    ],
  },
  {
    title: "Book covers for The Banner of Truth",
    entries: COVERS.map((cover) => ({
      name: cover.title,
      line: `${cover.author}, ${cover.illustrated ? "cover and illustration" : "cover design"}`,
    })),
  },
];
