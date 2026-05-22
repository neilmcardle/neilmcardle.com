"use client";

import { useLayoutEffect, useRef } from "react";
import type { WfElement } from "./wireframe-canvas";
import { EditableLabel } from "./editable-label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Battery,
  Bell,
  Bookmark,
  Calendar,
  Camera,
  Check,
  CircleDot,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Cloud,
  Copy,
  CreditCard,
  Download,
  Edit,
  ExternalLink,
  Eye,
  File,
  Filter,
  Folder,
  Gift,
  Globe,
  Heart,
  HelpCircle,
  Home,
  Image as ImageIcon,
  Info,
  Key,
  LayoutGrid,
  Link2,
  List,
  Lock,
  LogIn,
  LogOut,
  Mail,
  MapPin,
  Maximize2,
  Menu as MenuIcon,
  MessageCircle,
  Minimize2,
  Moon,
  MoreHorizontal,
  MoreVertical,
  Pause,
  Phone,
  Play,
  Plus,
  Printer,
  RefreshCw,
  Save,
  Search,
  Send,
  Settings,
  Share2,
  Shield,
  ShoppingCart,
  Square as SquareIcon,
  SquareCheck,
  Star,
  Sun,
  Tag,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  Upload,
  User,
  Volume2,
  VolumeX,
  Wifi,
  X as XIcon,
  Zap,
  type LucideIcon,
} from "lucide-react";

// The icons the picker offers. Each `name` is chosen so pickIcon() resolves
// it back to the same Lucide icon — the picker just writes the name into the
// element's label, and rendering stays unchanged.
export const ICON_CHOICES: { name: string; Icon: LucideIcon }[] = [
  { name: "square", Icon: SquareIcon },
  { name: "close", Icon: XIcon },
  { name: "search", Icon: Search },
  { name: "settings", Icon: Settings },
  { name: "add", Icon: Plus },
  { name: "check", Icon: Check },
  { name: "checkbox", Icon: SquareCheck },
  { name: "radio", Icon: CircleDot },
  { name: "bell", Icon: Bell },
  { name: "user", Icon: User },
  { name: "home", Icon: Home },
  { name: "heart", Icon: Heart },
  { name: "star", Icon: Star },
  { name: "mail", Icon: Mail },
  { name: "lock", Icon: Lock },
  { name: "eye", Icon: Eye },
  { name: "calendar", Icon: Calendar },
  { name: "clock", Icon: Clock },
  { name: "arrow-right", Icon: ArrowRight },
  { name: "arrow-left", Icon: ArrowLeft },
  { name: "arrow-up", Icon: ArrowUp },
  { name: "arrow-down", Icon: ArrowDown },
  { name: "download", Icon: Download },
  { name: "upload", Icon: Upload },
  { name: "edit", Icon: Edit },
  { name: "trash", Icon: Trash2 },
  { name: "share", Icon: Share2 },
  { name: "filter", Icon: Filter },
  { name: "menu", Icon: MenuIcon },
  { name: "info", Icon: Info },
  { name: "help", Icon: HelpCircle },
  { name: "phone", Icon: Phone },
  { name: "camera", Icon: Camera },
  { name: "image", Icon: ImageIcon },
  { name: "bookmark", Icon: Bookmark },
  { name: "chevron-right", Icon: ChevronRight },
  { name: "chevron-left", Icon: ChevronLeft },
  { name: "chevron-up", Icon: ChevronUp },
  { name: "chevron-down", Icon: ChevronDown },
  { name: "grid", Icon: LayoutGrid },
  { name: "list", Icon: List },
  { name: "play", Icon: Play },
  { name: "pause", Icon: Pause },
  { name: "volume", Icon: Volume2 },
  { name: "mute", Icon: VolumeX },
  { name: "wifi", Icon: Wifi },
  { name: "battery", Icon: Battery },
  { name: "location", Icon: MapPin },
  { name: "tag", Icon: Tag },
  { name: "link", Icon: Link2 },
  { name: "copy", Icon: Copy },
  { name: "save", Icon: Save },
  { name: "refresh", Icon: RefreshCw },
  { name: "more", Icon: MoreHorizontal },
  { name: "more-vertical", Icon: MoreVertical },
  { name: "send", Icon: Send },
  { name: "print", Icon: Printer },
  { name: "folder", Icon: Folder },
  { name: "file", Icon: File },
  { name: "credit-card", Icon: CreditCard },
  { name: "cart", Icon: ShoppingCart },
  { name: "gift", Icon: Gift },
  { name: "thumbs-up", Icon: ThumbsUp },
  { name: "thumbs-down", Icon: ThumbsDown },
  { name: "message", Icon: MessageCircle },
  { name: "globe", Icon: Globe },
  { name: "sun", Icon: Sun },
  { name: "moon", Icon: Moon },
  { name: "cloud", Icon: Cloud },
  { name: "bolt", Icon: Zap },
  { name: "shield", Icon: Shield },
  { name: "key", Icon: Key },
  { name: "log-out", Icon: LogOut },
  { name: "log-in", Icon: LogIn },
  { name: "expand", Icon: Maximize2 },
  { name: "collapse", Icon: Minimize2 },
  { name: "external", Icon: ExternalLink },
];

export function pickIcon(label?: string): LucideIcon {
  const l = (label ?? "").toLowerCase().trim();
  if (!l) return SquareIcon;
  // Exact match against the named set first — this is what the icon picker
  // writes, and it covers icons the keyword heuristics below don't know.
  const exact = ICON_CHOICES.find((c) => c.name === l);
  if (exact) return exact.Icon;
  // Keyword heuristics for free-typed labels ("favourite", "log out", etc).
  if (l === "x" || l === "✕" || l.includes("close") || l.includes("dismiss") || l.includes("cancel")) return XIcon;
  if (l.includes("search") || l.includes("magnif") || l.includes("find")) return Search;
  if (l.includes("setting") || l.includes("gear") || l.includes("cog")) return Settings;
  if (l === "+" || l.includes("plus") || l.includes("add") || l.includes("create")) return Plus;
  if (l.includes("checkbox") || l.includes("tickbox")) return SquareCheck;
  if (l.includes("radio")) return CircleDot;
  if (l === "✓" || l.includes("check") || l.includes("tick") || l.includes("done")) return Check;
  if (l.includes("bell") || l.includes("notif")) return Bell;
  if (l.includes("user") || l.includes("person") || l.includes("profile") || l.includes("account")) return User;
  if (l.includes("home")) return Home;
  if (l.includes("heart") || l.includes("favorite") || l.includes("favourite") || l.includes("like")) return Heart;
  if (l.includes("star") || l.includes("rate") || l.includes("rating")) return Star;
  if (l.includes("mail") || l.includes("email") || l.includes("envelope")) return Mail;
  if (l.includes("lock") || l.includes("secure") || l.includes("password")) return Lock;
  if (l.includes("eye") || l.includes("view") || l.includes("show")) return Eye;
  if (l.includes("calendar") || l.includes("date")) return Calendar;
  if (l.includes("clock") || l.includes("time") || l.includes("recent")) return Clock;
  if (l.includes("arrow-right") || l.includes("arrow right") || l === "→" || l === "next") return ArrowRight;
  if (l.includes("arrow-left") || l.includes("arrow left") || l === "←" || l === "back" || l === "previous") return ArrowLeft;
  if (l.includes("arrow-up") || l.includes("arrow up") || l === "↑") return ArrowUp;
  if (l.includes("arrow-down") || l.includes("arrow down") || l === "↓") return ArrowDown;
  if (l.includes("download")) return Download;
  if (l.includes("upload")) return Upload;
  if (l.includes("edit") || l.includes("pencil") || l.includes("write")) return Edit;
  if (l.includes("trash") || l.includes("delete") || l.includes("bin")) return Trash2;
  if (l.includes("share")) return Share2;
  if (l.includes("filter")) return Filter;
  if (l.includes("menu") || l.includes("hamburger")) return MenuIcon;
  if (l.includes("info")) return Info;
  if (l.includes("help") || l === "?") return HelpCircle;
  if (l.includes("phone") || l.includes("call")) return Phone;
  if (l.includes("camera")) return Camera;
  if (l.includes("image") || l.includes("photo") || l.includes("picture")) return ImageIcon;
  if (l.includes("bookmark") || l.includes("save")) return Bookmark;
  return SquareIcon;
}

// Heading font size per H1-H6 level. H1 largest, H6 smallest.
export const HEADING_FONT_PX: Record<number, number> = {
  1: 34,
  2: 27,
  3: 22,
  4: 19,
  5: 16,
  6: 14,
};

// Clamp an element's level to a valid 1-6 heading level (default 2).
export function headingLevel(level: number | undefined): number {
  if (level == null) return 2;
  return Math.min(6, Math.max(1, Math.round(level)));
}

// Visual variant for type === "button". Absent or unknown values fall back
// to "primary" (filled), matching the default new-button look.
export function buttonVariant(variant: string | undefined): "primary" | "secondary" {
  return variant === "secondary" ? "secondary" : "primary";
}

// Vertical padding inside the text element, in px (top + bottom each).
const TEXT_PAD_Y = 8;
// Minimum text-element height — one comfortable line.
const TEXT_MIN_H = 40;

// Auto-growing text element. The contentEditable wraps naturally at the
// element width and on Enter; a layout-effect measures the rendered height
// and reports it via onAutoHeight so the element's bbox grows and shrinks
// to fit. No fixed multi-line box — it starts one line and follows content.
function TextElement({
  el,
  onChange,
  onAutoHeight,
}: {
  el: WfElement;
  onChange: (next: string) => void;
  onAutoHeight?: (h: number) => void;
}) {
  const measureRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const node = measureRef.current;
    if (!node || !onAutoHeight) return;
    const measured = Math.max(TEXT_MIN_H, node.scrollHeight + TEXT_PAD_Y * 2);
    // Only report when it actually changed, otherwise the bbox update would
    // re-render and re-measure in a loop.
    if (Math.abs(measured - el.bbox.h) > 0.5) onAutoHeight(measured);
  });

  return (
    <div
      ref={measureRef}
      className="w-full text-sm leading-relaxed text-foreground"
      style={{ paddingTop: TEXT_PAD_Y, paddingBottom: TEXT_PAD_Y }}
    >
      <EditableLabel
        value={el.label ?? ""}
        onChange={onChange}
        placeholder="Text"
        multiline
        as="div"
        className="block w-full"
      />
    </div>
  );
}

export function renderElement(
  el: WfElement,
  onLabelChange: (next: string) => void,
  onAutoHeight?: (h: number) => void,
  onBodyChange?: (next: string) => void,
) {
  const set = onLabelChange;
  const setBody = onBodyChange ?? (() => {});
  switch (el.type) {
    case "button": {
      const variant = buttonVariant(el.variant);
      return (
        <Button
          variant={variant === "secondary" ? "outline" : "default"}
          className="w-full h-full"
          asChild
        >
          <div>
            <EditableLabel value={el.label ?? "Button"} onChange={set} placeholder="Button" />
          </div>
        </Button>
      );
    }
    case "input":
      // Input placeholder is shown inside the field. We swap to a styled wrapper
      // around an EditableLabel so the placeholder can be double-click edited.
      return (
        <div className="w-full h-full flex items-center rounded-md border border-input bg-background px-3 text-sm text-muted-foreground">
          <EditableLabel
            value={el.label ?? "Placeholder"}
            onChange={set}
            placeholder="Placeholder"
            className="block w-full"
          />
        </div>
      );
    case "text":
      return <TextElement el={el} onChange={set} onAutoHeight={onAutoHeight} />;
    case "toggle":
      return (
        <div
          className="w-full h-full rounded-full bg-foreground flex items-center justify-end"
          style={{ padding: "8%" }}
        >
          <span
            className="rounded-full bg-background"
            style={{ aspectRatio: "1 / 1", height: "100%" }}
          />
        </div>
      );
    case "heading": {
      const level = headingLevel(el.level);
      return (
        <div
          role="heading"
          aria-level={level}
          className="w-full h-full flex items-center font-semibold tracking-tight text-foreground overflow-hidden"
          style={{ fontSize: HEADING_FONT_PX[level] }}
        >
          <EditableLabel value={el.label ?? "Heading"} onChange={set} placeholder="Heading" />
        </div>
      );
    }
    case "image":
      return (
        <div
          role="img"
          aria-label={el.label ?? "Image"}
          className="w-full h-full rounded-md border bg-muted relative overflow-hidden"
        >
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 text-border">
            <line x1="0" y1="0" x2="100" y2="100" stroke="currentColor" strokeWidth="0.4" vectorEffect="non-scaling-stroke" />
            <line x1="100" y1="0" x2="0" y2="100" stroke="currentColor" strokeWidth="0.4" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>
      );
    case "card":
      return (
        <Card className="w-full h-full">
          <CardHeader>
            <CardTitle>
              <EditableLabel value={el.label ?? "Card title"} onChange={set} placeholder="Card title" />
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <EditableLabel
              value={el.body ?? "Card body content."}
              onChange={setBody}
              placeholder="Card body content."
              multiline
            />
          </CardContent>
        </Card>
      );
    case "divider":
      return (
        <div className="w-full h-full flex items-center">
          <Separator className="w-full" />
        </div>
      );
    case "nav": {
      const items = el.label
        ? el.label.split(/\s+/).filter(Boolean).slice(0, 6)
        : ["Home", "Work", "About", "Contact"];
      return (
        <nav className="w-full h-full flex items-center gap-2 px-2">
          {items.map((item, i) => (
            <Button key={i} variant={i === 0 ? "secondary" : "ghost"} size="sm">
              {item}
            </Button>
          ))}
        </nav>
      );
    }
    case "icon": {
      const Icon = pickIcon(el.label);
      return <Icon strokeWidth={1.8} className="w-full h-full text-foreground" />;
    }
    case "link":
      return (
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className="w-full h-full flex items-center text-sm font-medium text-primary underline underline-offset-4"
        >
          <EditableLabel value={el.label ?? "Link"} onChange={set} placeholder="Link" />
        </a>
      );
    case "badge":
      return (
        <div className="w-full h-full flex items-center justify-center">
          <Badge>
            <EditableLabel value={el.label ?? "Badge"} onChange={set} placeholder="Badge" />
          </Badge>
        </div>
      );
    case "dropdown":
      return (
        <Select>
          <SelectTrigger className="w-full h-full">
            <SelectValue placeholder={el.label ?? "Select"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">Option 1</SelectItem>
            <SelectItem value="b">Option 2</SelectItem>
          </SelectContent>
        </Select>
      );
    default:
      return null;
  }
}
