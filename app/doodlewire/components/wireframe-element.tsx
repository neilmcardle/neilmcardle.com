"use client";

import type { WfElement } from "./wireframe-canvas";
import { EditableLabel } from "./editable-label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Bell,
  Bookmark,
  Calendar,
  Camera,
  Check,
  Clock,
  Download,
  Edit,
  Eye,
  Filter,
  Heart,
  HelpCircle,
  Home,
  Image as ImageIcon,
  Info,
  Lock,
  Mail,
  Menu as MenuIcon,
  Phone,
  Plus,
  Search,
  Settings,
  Share2,
  Square as SquareIcon,
  Star,
  Trash2,
  Upload,
  User,
  X as XIcon,
  type LucideIcon,
} from "lucide-react";

function pickIcon(label?: string): LucideIcon {
  const l = (label ?? "").toLowerCase().trim();
  if (!l) return SquareIcon;
  if (l === "x" || l === "✕" || l.includes("close") || l.includes("dismiss") || l.includes("cancel")) return XIcon;
  if (l.includes("search") || l.includes("magnif") || l.includes("find")) return Search;
  if (l.includes("setting") || l.includes("gear") || l.includes("cog")) return Settings;
  if (l === "+" || l.includes("plus") || l.includes("add") || l.includes("create")) return Plus;
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

export function renderElement(el: WfElement, onLabelChange: (next: string) => void) {
  const set = onLabelChange;
  switch (el.type) {
    case "button":
      return (
        <Button className="w-full h-full" asChild>
          <div>
            <EditableLabel value={el.label ?? "Button"} onChange={set} placeholder="Button" />
          </div>
        </Button>
      );
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
    case "textarea":
      return (
        <div className="w-full h-full rounded-md border border-input bg-background p-3 text-sm text-muted-foreground overflow-hidden">
          <EditableLabel
            value={el.label ?? "Type here"}
            onChange={set}
            placeholder="Type here"
            multiline
            as="div"
            className="block w-full h-full"
          />
        </div>
      );
    case "checkbox":
      return (
        <div className="w-full h-full flex items-center justify-center">
          <Checkbox defaultChecked />
        </div>
      );
    case "radio":
      return (
        <div className="w-full h-full flex items-center justify-center">
          <RadioGroup defaultValue="a">
            <RadioGroupItem value="a" id={`radio-${el.id}`} />
          </RadioGroup>
        </div>
      );
    case "toggle":
      return (
        <div className="w-full h-full flex items-center justify-center">
          <Switch defaultChecked />
        </div>
      );
    case "heading":
      return (
        <h2
          className="w-full h-full flex items-center font-semibold tracking-tight text-foreground overflow-hidden"
          style={{ fontSize: "clamp(18px, 2.2vw, 28px)" }}
        >
          <EditableLabel value={el.label ?? "Heading"} onChange={set} placeholder="Heading" />
        </h2>
      );
    case "paragraph":
      return (
        <div className="w-full h-full text-sm leading-relaxed text-muted-foreground overflow-hidden">
          <EditableLabel
            value={el.label ?? ""}
            onChange={set}
            placeholder={"Your paragraph here.\nDouble-click to edit."}
            multiline
            as="div"
            className="block w-full"
          />
        </div>
      );
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
    case "container":
      return <div className="w-full h-full rounded-xl border-2 border-dashed border-border" />;
    case "card":
      return (
        <Card className="w-full h-full">
          <CardHeader>
            <CardTitle>
              <EditableLabel value={el.label ?? "Card title"} onChange={set} placeholder="Card title" />
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">Card body content.</CardContent>
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
    case "avatar":
      return (
        <Avatar className="w-full h-full">
          <AvatarFallback>
            {el.label ? el.label.slice(0, 2).toUpperCase() : "U"}
          </AvatarFallback>
        </Avatar>
      );
    case "icon": {
      const Icon = pickIcon(el.label);
      return (
        <div className="w-full h-full flex items-center justify-center text-foreground">
          <Icon strokeWidth={1.8} className="w-[70%] h-[70%]" />
        </div>
      );
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
    case "menu":
      return (
        <Button variant="ghost" size="icon" className="w-full h-full" aria-label="Menu">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-1/2 h-1/2">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>
        </Button>
      );
    default:
      return null;
  }
}
