import { COVERS } from "./covers";

export type GroupKey =
  "products" | "covers" | "tools" | "kids" | "explorations";
export type Filter = "all" | GroupKey;

export type Work = {
  title: string;
  group: GroupKey;
  sub: string;
  href: string;
  plain?: boolean;
  icon?: string;
  pills: string[];
  preview?: string;
};

export const EMAIL = "neil@neilmcardle.com";

export const LINKEDIN = "https://www.linkedin.com/in/neilmcardle/";

export type Contact = {
  icon: "email" | "x" | "linkedin";
  label: string;
  text: string;
  href: string;
};

export const CONTACTS: Contact[] = [
  { icon: "email", label: "Email", text: EMAIL, href: `mailto:${EMAIL}` },
  {
    icon: "x",
    label: "X",
    text: "@BetterNeil",
    href: "https://x.com/BetterNeil",
  },
  { icon: "linkedin", label: "LinkedIn", text: "neilmcardle", href: LINKEDIN },
];

export const GROUP_ORDER: GroupKey[] = [
  "products",
  "explorations",
  "tools",
  "kids",
  "covers",
];

export const GROUP_LABEL: Record<GroupKey, string> = {
  products: "Products",
  covers: "Book covers",
  tools: "Tools",
  kids: "For my kids",
  explorations: "Explorations",
};

export const FILTERS: Filter[] = ["all", ...GROUP_ORDER];

export const FILTER_LABEL: Record<Filter, string> = {
  all: "All work",
  ...GROUP_LABEL,
};

export const WORKS: Work[] = [
  {
    title: "makeebook",
    group: "products",
    sub: "Shipped",
    href: "https://makeebook.ink",
    pills: ["Writing platform", "Web"],
  },
  {
    title: "coverly",
    group: "products",
    sub: "Shipped",
    href: "/coverly",
    pills: ["Design research", "Web"],
  },
  {
    title: "DoodleWire",
    group: "products",
    sub: "Shipped",
    href: "https://apps.apple.com/us/app/doodlewire/id6771274835",
    pills: ["Wireframing", "iOS"],
  },
  {
    title: "Spark",
    group: "products",
    sub: "In progress",
    href: "/spark",
    pills: ["Learning platform", "Web"],
  },
  {
    title: "Podium",
    group: "products",
    sub: "In progress",
    href: "",
    pills: ["Indie game", "Godot"],
  },
  {
    title: "Chess Path",
    group: "products",
    sub: "In progress",
    href: "/chess",
    pills: ["Chess course", "Web"],
  },
  ...COVERS.map((cover) => ({
    title: cover.title,
    group: "covers" as const,
    sub: "The Banner of Truth",
    href: "",
    pills: [
      String(cover.year),
      cover.author,
      cover.illustrated ? "Cover and illustration" : "Cover design",
    ],
  })),
  {
    title: "Vector Paint",
    group: "tools",
    sub: "In the browser",
    href: "/vector-paint",
    icon: "vectorPaint",
    pills: ["Drawing", "SVG export"],
  },
  {
    title: "Tessera: The Triangle Game",
    group: "kids",
    sub: "Games",
    href: "https://apps.apple.com/gb/app/tessera-the-triangle-game/id6774786982",
    icon: "tessera",
    pills: ["Two players", "iOS"],
  },
  {
    title: "A Brief History of UI",
    group: "explorations",
    sub: "Lab",
    href: "/explorations/history-of-ui",
    preview: "/home/peek/history-of-ui-rain.jpg",
    pills: ["Interactive", "16 eras", "1963 to 2025"],
  },
  {
    title: "A History of Architecture",
    group: "explorations",
    sub: "Lab",
    href: "/explorations/architecture",
    preview: "/home/peek/architecture.jpg",
    pills: ["Line drawings", "30 buildings", "9500 BCE to 1997"],
  },
  {
    title: "A History of the World",
    group: "explorations",
    sub: "Lab",
    href: "/explorations/history-of-the-world",
    preview: "/home/peek/history-of-the-world.jpg",
    pills: ["Interactive globe", "65 moments", "300,000 BCE to today"],
  },
  {
    title: "Self-healing checkout",
    group: "explorations",
    sub: "Lab",
    href: "/explorations/self-healing-checkout",
    preview: "/home/peek/self-healing-checkout.jpg",
    pills: ["Interactive concept", "Sample data"],
  },
  {
    title: "Logo Animator Studio",
    group: "explorations",
    sub: "Lab",
    href: "/logo-animator-studio",
    plain: true,
    preview: "/home/peek/logo-animator-studio.jpg",
    pills: ["Interactive concept", "Agentic logo studio", "Simulated agents"],
  },
];

export const MULTI_SUB = new Set(
  GROUP_ORDER.filter(
    (key) =>
      new Set(
        WORKS.filter((work) => work.group === key).map((work) => work.sub),
      ).size > 1,
  ),
);

export const CLIENTS = [
  {
    name: "Avis Budget Group",
    logo: "/logos/avis-budget-group.svg",
    height: 16,
    ratio: 1149.1 / 154.29,
  },
  {
    name: "Mobbin",
    logo: "/logos/mobbin.svg",
    height: 16,
    ratio: 475 / 64,
  },
  {
    name: "The Banner of Truth",
    logo: "/logos/banner-of-truth.svg",
    height: 28,
    ratio: 1033.2 / 353.7,
  },
];

export const pad = (value: number) => String(value).padStart(2, "0");

export function matches(work: Work, needle: string) {
  if (!needle) return true;
  return `${work.title} ${work.sub} ${work.pills.join(" ")} ${GROUP_LABEL[work.group]}`
    .toLowerCase()
    .includes(needle);
}

export function slug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function subKey(work: Pick<Work, "group" | "sub">) {
  return `${work.group}-${slug(work.sub)}`;
}
