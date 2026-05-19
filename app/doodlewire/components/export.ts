import type { WfElement } from "./wireframe-canvas";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function htmlChild(el: WfElement): string {
  const label = el.label ? esc(el.label) : "";
  switch (el.type) {
    case "button": {
      const cls = el.variant === "secondary" ? ` class="wf-button--secondary"` : "";
      return `<button${cls}>${label || "Button"}</button>`;
    }
    case "input":
      return `<input type="text" placeholder="${label || "Placeholder"}" />`;
    case "text":
      return `<p>${label || "Text"}</p>`;
    case "toggle":
      return `<label class="wf-toggle"><input type="checkbox" checked /><span></span></label>`;
    case "heading":
      return `<h1>${label || "Heading"}</h1>`;
    case "image":
      return `<div class="wf-image" role="img" aria-label="${label || "Image"}"></div>`;
    case "card":
      return `<div class="wf-card"></div>`;
    case "divider":
      return `<hr />`;
    case "nav":
      return `<nav>${
        (label ? label.split(/\s+/).filter(Boolean) : ["Home", "Work", "About", "Contact"])
          .slice(0, 6)
          .map((i) => `<a href="#">${esc(i)}</a>`)
          .join("")
      }</nav>`;
    case "icon":
      return `<div class="wf-icon" aria-hidden="true"></div>`;
    case "link":
      return `<a href="#">${label || "Link"}</a>`;
    case "badge":
      return `<span class="wf-badge">${label || "Badge"}</span>`;
    case "dropdown":
      return `<select><option>${label || "Select"}</option></select>`;
    default:
      return "";
  }
}

export function exportAsHtml(elements: WfElement[], size: { w: number; h: number }): string {
  const items = elements
    .map((el) => {
      const child = htmlChild(el);
      return `    <div class="wf-cell wf-${el.type}" style="left:${Math.round(el.bbox.x)}px;top:${Math.round(el.bbox.y)}px;width:${Math.round(el.bbox.w)}px;height:${Math.round(el.bbox.h)}px">${child}</div>`;
    })
    .join("\n");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Wireframe</title>
<style>
  :root { --stroke: #0a0a0a; --muted: #a3a3a3; --fill: #ffffff; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; background: #fff; color: var(--stroke); }
  .wf-stage { position: relative; width: ${Math.round(size.w)}px; height: ${Math.round(size.h)}px; max-width: 100%; margin: 0 auto; }
  .wf-cell { position: absolute; }
  .wf-cell > * { width: 100%; height: 100%; }
  .wf-button button { background: var(--stroke); color: var(--fill); border: 0; border-radius: 8px; font-weight: 600; cursor: pointer; }
  .wf-button button.wf-button--secondary { background: transparent; color: var(--stroke); border: 1.5px solid var(--stroke); }
  .wf-input input, .wf-dropdown select { background: var(--fill); border: 1px solid var(--stroke); border-radius: 8px; padding: 0 12px; font: inherit; }
  .wf-text p { margin: 0; color: rgba(0,0,0,0.8); line-height: 1.5; }
  .wf-toggle { display: inline-flex; align-items: center; width: 100%; height: 100%; background: var(--stroke); border-radius: 999px; padding: 3px; }
  .wf-toggle input { display: none; }
  .wf-toggle span { margin-left: auto; height: 100%; aspect-ratio: 1/1; background: var(--fill); border-radius: 999px; }
  .wf-heading h1 { margin: 0; font-weight: 700; letter-spacing: -0.02em; }
  .wf-image { background: rgba(0,0,0,0.04); border: 1px solid var(--stroke); border-radius: 6px; background-image: linear-gradient(to top right, transparent calc(50% - 0.5px), var(--stroke) 50%, transparent calc(50% + 0.5px)), linear-gradient(to top left, transparent calc(50% - 0.5px), var(--stroke) 50%, transparent calc(50% + 0.5px)); }
  .wf-card { background: var(--fill); border: 1px solid rgba(0,0,0,0.1); border-radius: 12px; box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06); }
  .wf-divider hr { margin: 0; border: 0; border-top: 1px solid var(--stroke); }
  .wf-nav nav { display: flex; align-items: center; gap: 18px; padding: 0 14px; height: 100%; }
  .wf-nav a { color: var(--stroke); text-decoration: none; font-weight: 500; opacity: 0.6; }
  .wf-nav a:first-child { opacity: 1; }
  .wf-icon { width: 70%; height: 70%; margin: 15% auto 0; border: 1.5px solid var(--stroke); border-radius: 4px; }
  .wf-link a { color: var(--stroke); text-decoration: underline; text-underline-offset: 3px; }
  .wf-badge span { display: inline-flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.08); border-radius: 999px; font-size: 11px; font-weight: 600; padding: 0 10px; }
</style>
</head>
<body>
  <div class="wf-stage">
${items}
  </div>
</body>
</html>
`;
}

// Map element type to a shadcn child + required imports. Returned JSX is
// pre-indented to sit inside the absolute-positioned cell wrapper.
interface ReactPart {
  jsx: string;
  // Module path → set of named exports to import.
  imports: Record<string, Set<string>>;
}

function addImport(imports: Record<string, Set<string>>, path: string, name: string) {
  if (!imports[path]) imports[path] = new Set();
  imports[path].add(name);
}

// Map an icon label to a Lucide component name. Kept in sync with pickIcon()
// in wireframe-element.tsx so the live preview and exported code stay
// visually identical.
function pickIconName(label: string): string {
  const l = label.toLowerCase().trim();
  if (!l) return "Square";
  if (l === "x" || l === "✕" || l.includes("close") || l.includes("dismiss") || l.includes("cancel")) return "X";
  if (l.includes("search") || l.includes("magnif") || l.includes("find")) return "Search";
  if (l.includes("setting") || l.includes("gear") || l.includes("cog")) return "Settings";
  if (l === "+" || l.includes("plus") || l.includes("add") || l.includes("create")) return "Plus";
  if (l.includes("checkbox") || l.includes("tickbox")) return "SquareCheck";
  if (l.includes("radio")) return "CircleDot";
  if (l === "✓" || l.includes("check") || l.includes("tick") || l.includes("done")) return "Check";
  if (l.includes("bell") || l.includes("notif")) return "Bell";
  if (l.includes("user") || l.includes("person") || l.includes("profile") || l.includes("account")) return "User";
  if (l.includes("home")) return "Home";
  if (l.includes("heart") || l.includes("favorite") || l.includes("favourite") || l.includes("like")) return "Heart";
  if (l.includes("star") || l.includes("rate") || l.includes("rating")) return "Star";
  if (l.includes("mail") || l.includes("email") || l.includes("envelope")) return "Mail";
  if (l.includes("lock") || l.includes("secure") || l.includes("password")) return "Lock";
  if (l.includes("eye") || l.includes("view") || l.includes("show")) return "Eye";
  if (l.includes("calendar") || l.includes("date")) return "Calendar";
  if (l.includes("clock") || l.includes("time") || l.includes("recent")) return "Clock";
  if (l.includes("arrow-right") || l.includes("arrow right") || l === "→" || l === "next") return "ArrowRight";
  if (l.includes("arrow-left") || l.includes("arrow left") || l === "←" || l === "back" || l === "previous") return "ArrowLeft";
  if (l.includes("arrow-up") || l.includes("arrow up") || l === "↑") return "ArrowUp";
  if (l.includes("arrow-down") || l.includes("arrow down") || l === "↓") return "ArrowDown";
  if (l.includes("download")) return "Download";
  if (l.includes("upload")) return "Upload";
  if (l.includes("edit") || l.includes("pencil") || l.includes("write")) return "Edit";
  if (l.includes("trash") || l.includes("delete") || l.includes("bin")) return "Trash2";
  if (l.includes("share")) return "Share2";
  if (l.includes("filter")) return "Filter";
  if (l.includes("menu") || l.includes("hamburger")) return "Menu";
  if (l.includes("info")) return "Info";
  if (l.includes("help") || l === "?") return "HelpCircle";
  if (l.includes("phone") || l.includes("call")) return "Phone";
  if (l.includes("camera")) return "Camera";
  if (l.includes("image") || l.includes("photo") || l.includes("picture")) return "ImageIcon";
  if (l.includes("bookmark") || l.includes("save")) return "Bookmark";
  return "Square";
}

function reactChild(el: WfElement, indent: string, imports: Record<string, Set<string>>): string {
  const label = el.label ?? "";
  switch (el.type) {
    case "button": {
      addImport(imports, "@/components/ui/button", "Button");
      const variantAttr = el.variant === "secondary" ? ` variant="outline"` : "";
      return `${indent}<Button${variantAttr} className="w-full h-full">${label || "Button"}</Button>`;
    }
    case "input":
      addImport(imports, "@/components/ui/input", "Input");
      return `${indent}<Input className="w-full h-full" placeholder="${label || "Placeholder"}" />`;
    case "text":
      return `${indent}<p className="w-full h-full text-sm leading-relaxed text-foreground/80">${label || "Text"}</p>`;
    case "toggle":
      addImport(imports, "@/components/ui/switch", "Switch");
      return `${indent}<div className="w-full h-full flex items-center justify-center">\n${indent}  <Switch defaultChecked />\n${indent}</div>`;
    case "heading":
      return `${indent}<h2 className="w-full h-full flex items-center font-semibold tracking-tight text-2xl">${label || "Heading"}</h2>`;
    case "image":
      return `${indent}<div role="img" aria-label="${label || "Image"}" className="w-full h-full rounded-md border bg-muted" />`;
    case "card":
      addImport(imports, "@/components/ui/card", "Card");
      addImport(imports, "@/components/ui/card", "CardContent");
      addImport(imports, "@/components/ui/card", "CardHeader");
      addImport(imports, "@/components/ui/card", "CardTitle");
      return `${indent}<Card className="w-full h-full">\n${indent}  <CardHeader>\n${indent}    <CardTitle>${label || "Card title"}</CardTitle>\n${indent}  </CardHeader>\n${indent}  <CardContent className="text-sm text-muted-foreground">Card body content.</CardContent>\n${indent}</Card>`;
    case "divider":
      addImport(imports, "@/components/ui/separator", "Separator");
      return `${indent}<div className="w-full h-full flex items-center"><Separator className="w-full" /></div>`;
    case "nav": {
      addImport(imports, "@/components/ui/button", "Button");
      const items = label ? label.split(/\s+/).filter(Boolean).slice(0, 6) : ["Home", "Work", "About", "Contact"];
      const links = items
        .map((i, idx) => `<Button key="${idx}" variant="${idx === 0 ? "secondary" : "ghost"}" size="sm">${i}</Button>`)
        .join(`\n${indent}  `);
      return `${indent}<nav className="w-full h-full flex items-center gap-2 px-2">\n${indent}  ${links}\n${indent}</nav>`;
    }
    case "icon": {
      const iconName = pickIconName(label);
      // ImageIcon is the local alias for Lucide's `Image` to avoid a clash
      // with HTML/img or Next.js Image in the consuming code.
      const importSpec = iconName === "ImageIcon" ? "Image as ImageIcon" : iconName;
      addImport(imports, "lucide-react", importSpec);
      return `${indent}<div className="w-full h-full flex items-center justify-center text-foreground">\n${indent}  <${iconName} strokeWidth={1.8} className="w-[70%] h-[70%]" />\n${indent}</div>`;
    }
    case "link":
      return `${indent}<a href="#" className="w-full h-full flex items-center text-sm font-medium text-primary underline underline-offset-4">${label || "Link"}</a>`;
    case "badge":
      addImport(imports, "@/components/ui/badge", "Badge");
      return `${indent}<div className="w-full h-full flex items-center justify-center"><Badge>${label || "Badge"}</Badge></div>`;
    case "dropdown":
      addImport(imports, "@/components/ui/select", "Select");
      addImport(imports, "@/components/ui/select", "SelectContent");
      addImport(imports, "@/components/ui/select", "SelectItem");
      addImport(imports, "@/components/ui/select", "SelectTrigger");
      addImport(imports, "@/components/ui/select", "SelectValue");
      return `${indent}<Select>\n${indent}  <SelectTrigger className="w-full h-full">\n${indent}    <SelectValue placeholder="${label || "Select"}" />\n${indent}  </SelectTrigger>\n${indent}  <SelectContent>\n${indent}    <SelectItem value="a">Option 1</SelectItem>\n${indent}    <SelectItem value="b">Option 2</SelectItem>\n${indent}  </SelectContent>\n${indent}</Select>`;
    default:
      return "";
  }
}

export function exportAsReact(elements: WfElement[], size: { w: number; h: number }): string {
  const imports: Record<string, Set<string>> = {};
  const items = elements
    .map((el) => {
      const child = reactChild(el, "        ", imports);
      return `      <div\n        className="absolute"\n        style={{ left: ${Math.round(el.bbox.x)}, top: ${Math.round(el.bbox.y)}, width: ${Math.round(el.bbox.w)}, height: ${Math.round(el.bbox.h)} }}\n      >\n${child}\n      </div>`;
    })
    .join("\n");

  const importLines = Object.entries(imports)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([path, names]) => `import { ${Array.from(names).sort().join(", ")} } from "${path}";`)
    .join("\n");

  const header = importLines ? `${importLines}\n\n` : "";

  return `${header}export default function Wireframe() {
  return (
    <div
      className="relative mx-auto bg-background text-foreground"
      style={{ width: ${Math.round(size.w)}, height: ${Math.round(size.h)} }}
    >
${items}
    </div>
  );
}
`;
}
