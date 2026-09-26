import { PAINTINGS } from "./paintings";

export type GroupKey =
  "products" | "tools" | "kids" | "books" | "paintings" | "explorations";
export type Filter = "all" | GroupKey;

export type Work = {
  title: string;
  group: GroupKey;
  sub: string;
  href: string;
  plain?: boolean;
  pills: string[];
};

export const EMAIL = "neil@neilmcardle.com";

export const GROUP_ORDER: GroupKey[] = [
  "products",
  "tools",
  "kids",
  "books",
  "paintings",
  "explorations",
];

export const GROUP_LABEL: Record<GroupKey, string> = {
  products: "Products",
  tools: "Tools",
  kids: "For my kids",
  books: "Audiobook",
  paintings: "Paintings",
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
    title: "Coverly",
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
    title: "Vector Paint",
    group: "tools",
    sub: "In the browser",
    href: "/vector-paint",
    pills: ["Drawing", "SVG export"],
  },
  {
    title: "Icon Animator",
    group: "tools",
    sub: "In the browser",
    href: "/icon-animator",
    pills: ["Animation", "CSS export"],
  },
  {
    title: "Promptr",
    group: "tools",
    sub: "In the browser",
    href: "/promptr",
    pills: ["Prompt writing"],
  },
  {
    title: "Tessera: The Triangle Game",
    group: "kids",
    sub: "Games",
    href: "https://apps.apple.com/gb/app/tessera-the-triangle-game/id6774786982",
    pills: ["Two players", "iOS"],
  },
  {
    title: "Kids Alphabet",
    group: "kids",
    sub: "Games",
    href: "/kids-alphabet/",
    plain: true,
    pills: ["Toddlers"],
  },
  {
    title: "Time Teacher",
    group: "kids",
    sub: "Learning",
    href: "/time-teacher/ybo",
    pills: ["Telling the time"],
  },
  {
    title: "Touchtype",
    group: "kids",
    sub: "Learning",
    href: "/touchtype",
    pills: ["Typing"],
  },
  {
    title: "Sol0",
    group: "books",
    sub: "Fiction",
    href: "https://elevenreader.io/audiobooks/sol0-audiobook/lDuTf0Co8szKJBdzzAnu",
    pills: ["Sci-fi novel", "Audiobook"],
  },
  ...PAINTINGS.map((painting) => ({
    title: painting.title,
    group: "paintings" as const,
    sub: painting.medium,
    href: "/?filter=paintings",
    pills: [
      String(painting.year),
      painting.status.charAt(0).toUpperCase() + painting.status.slice(1),
    ],
  })),
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
    role: "In-house",
    height: 16,
    ratio: 1149.1 / 154.29,
  },
  {
    name: "Mobbin",
    logo: "/logos/mobbin.svg",
    role: "Contractor",
    height: 16,
    ratio: 475 / 64,
  },
  {
    name: "The Banner of Truth",
    logo: "/logos/banner-of-truth.svg",
    role: "Previously",
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
