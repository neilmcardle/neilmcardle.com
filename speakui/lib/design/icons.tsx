import { createElement } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  AtSign,
  Bell,
  BookOpen,
  Calendar,
  Camera,
  Check,
  ChevronDown,
  Code,
  Download,
  FileText,
  Globe,
  Heart,
  House,
  Image,
  Layers,
  Link,
  Lock,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Mic,
  Moon,
  Music,
  PenTool,
  Phone,
  Play,
  Pause,
  Rocket,
  Search,
  Send,
  Settings,
  ShoppingBag,
  Sparkles,
  Star,
  Sun,
  User,
  Users,
  Video,
  Zap,
} from "lucide-react";

type IconSpec = { label: string; words: string[]; Icon: LucideIcon };

export const ICONS: Record<string, IconSpec> = {
  mail: {
    label: "Mail / email / envelope / contact",
    words: ["mail", "email", "e-mail", "envelope", "contact"],
    Icon: Mail,
  },
  zap: {
    label: "Lightning bolt / zap / fast",
    words: ["lightning", "bolt", "zap", "flash"],
    Icon: Zap,
  },
  sparkles: {
    label: "Sparkles / AI / magic",
    words: ["sparkles", "sparkle", "magic", "ai"],
    Icon: Sparkles,
  },
  star: {
    label: "Star / favourite",
    words: ["star", "favourite", "favorite"],
    Icon: Star,
  },
  heart: {
    label: "Heart / like / love",
    words: ["heart", "love"],
    Icon: Heart,
  },
  arrow: {
    label: "Arrow pointing right",
    words: ["arrow", "arrow right", "right arrow"],
    Icon: ArrowRight,
  },
  chevron: {
    label: "Chevron / arrow pointing down",
    words: ["chevron", "down arrow", "arrow down", "caret"],
    Icon: ChevronDown,
  },
  play: { label: "Play / video", words: ["play", "play button"], Icon: Play },
  pause: { label: "Pause", words: ["pause", "pause button"], Icon: Pause },
  rocket: {
    label: "Rocket / launch",
    words: ["rocket", "launch"],
    Icon: Rocket,
  },
  code: {
    label: "Code / GitHub / developer",
    words: ["code", "github", "developer", "brackets"],
    Icon: Code,
  },
  pen: {
    label: "Pen / design / Figma",
    words: ["pen", "design", "figma", "pen tool", "draw"],
    Icon: PenTool,
  },
  layers: {
    label: "Layers / stack / portfolio",
    words: ["layers", "stack", "portfolio"],
    Icon: Layers,
  },
  book: {
    label: "Book / blog / reading / writing",
    words: ["book", "blog", "reading", "writing", "medium", "articles"],
    Icon: BookOpen,
  },
  file: {
    label: "Document / CV / resume",
    words: ["document", "cv", "resume", "file", "pdf"],
    Icon: FileText,
  },
  user: {
    label: "Person / profile / about",
    words: ["person", "profile", "user"],
    Icon: User,
  },
  users: {
    label: "People / team / community",
    words: ["people", "team", "community", "users"],
    Icon: Users,
  },
  chat: {
    label: "Chat / message / comment",
    words: ["chat", "message", "comment", "speech bubble"],
    Icon: MessageCircle,
  },
  send: {
    label: "Send / paper plane",
    words: ["send", "paper plane", "plane"],
    Icon: Send,
  },
  at: {
    label: "At sign / handle / social",
    words: ["at sign", "handle", "social", "twitter", "threads"],
    Icon: AtSign,
  },
  link: {
    label: "Link / URL / LinkedIn",
    words: ["link", "url", "linkedin", "chain"],
    Icon: Link,
  },
  globe: {
    label: "Globe / website / world",
    words: ["globe", "website", "world", "language"],
    Icon: Globe,
  },
  camera: {
    label: "Camera / photos / Instagram",
    words: ["camera", "photos", "instagram", "photography"],
    Icon: Camera,
  },
  video: {
    label: "Video / YouTube",
    words: ["video", "youtube", "film"],
    Icon: Video,
  },
  image: {
    label: "Image / picture / gallery",
    words: ["image", "picture", "gallery"],
    Icon: Image,
  },
  music: {
    label: "Music / sound / audio",
    words: ["music", "sound", "audio", "song"],
    Icon: Music,
  },
  mic: {
    label: "Microphone / voice / podcast",
    words: ["microphone", "mic", "voice", "podcast"],
    Icon: Mic,
  },
  calendar: {
    label: "Calendar / book a call / schedule",
    words: ["calendar", "schedule", "book a call", "meeting"],
    Icon: Calendar,
  },
  phone: { label: "Phone / call", words: ["phone", "telephone"], Icon: Phone },
  pin: {
    label: "Location pin / map / address",
    words: ["location", "pin", "map", "address"],
    Icon: MapPin,
  },
  search: {
    label: "Search / magnifying glass",
    words: ["search", "magnifying glass"],
    Icon: Search,
  },
  bell: {
    label: "Bell / notifications",
    words: ["bell", "notification", "notifications", "alert"],
    Icon: Bell,
  },
  settings: {
    label: "Settings / gear / cog",
    words: ["settings", "gear", "cog", "preferences"],
    Icon: Settings,
  },
  lock: {
    label: "Lock / secure / private",
    words: ["lock", "secure", "security", "private", "padlock"],
    Icon: Lock,
  },
  check: {
    label: "Check / tick / done",
    words: ["check", "tick", "checkmark"],
    Icon: Check,
  },
  download: { label: "Download", words: ["download"], Icon: Download },
  home: { label: "Home / house", words: ["home", "house"], Icon: House },
  bag: {
    label: "Shopping bag / shop / store",
    words: ["shopping", "shop", "store", "bag", "cart"],
    Icon: ShoppingBag,
  },
  menu: {
    label: "Menu / hamburger",
    words: ["hamburger", "menu icon", "three lines"],
    Icon: Menu,
  },
  sun: {
    label: "Sun / light mode",
    words: ["sun", "light mode", "daylight"],
    Icon: Sun,
  },
  moon: {
    label: "Moon / dark mode / night",
    words: ["moon", "dark mode", "night"],
    Icon: Moon,
  },
};

export const ICON_NAMES = Object.keys(ICONS);

const WORDS = ICON_NAMES.flatMap((name) =>
  ICONS[name].words.map((w) => ({ w, name })),
).sort((a, b) => b.w.length - a.w.length);

export function iconsIn(text: string): string[] {
  const lower = ` ${text.toLowerCase()} `;
  const hits: { at: number; name: string }[] = [];
  const taken: [number, number][] = [];
  for (const { w, name } of WORDS) {
    const re = new RegExp(
      `[^a-z]${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}s?[^a-z]`,
      "g",
    );
    for (const m of lower.matchAll(re)) {
      const start = m.index!;
      const end = start + m[0].length;
      if (taken.some(([s, e]) => start < e && end > s)) continue;
      taken.push([start, end]);
      hits.push({ at: start, name });
    }
  }
  return hits
    .sort((a, b) => a.at - b.at)
    .map((h) => h.name)
    .filter((n, i, all) => all.indexOf(n) === i);
}

export function iconFor(name?: string): LucideIcon | null {
  return name && ICONS[name] ? ICONS[name].Icon : null;
}

export function IconGlyph({
  name,
  className,
}: {
  name?: string;
  className?: string;
}) {
  const spec = name ? ICONS[name] : undefined;
  return spec
    ? createElement(spec.Icon, { className, "aria-hidden": true })
    : null;
}
