import { ACCENTS, DEFAULT_HERO } from "./catalog";
import { ICONS } from "./icons";
import { modeOf, type Design, type Element, type HeroSlot } from "./types";

const esc = (s = "") => s.replace(/[{}<>]/g, (c) => `{"${c}"}`);
const attr = (s = "") => JSON.stringify(s);

export function toJsx(design: Design): string {
  return modeOf(design) === "hero" ? heroJsx(design) : cardJsx(design);
}

function cardJsx(design: Design): string {
  const used = new Set<string>(["Card"]);
  const header = design.elements.filter((e) => e.section === "header");
  const body = design.elements.filter((e) => e.section === "body");
  const footer = design.elements.filter((e) => e.section === "footer");

  const line = (el: Element, pad: string): string => {
    switch (el.kind) {
      case "heading":
        used.add("CardTitle");
        return `${pad}<CardTitle>${esc(el.text)}</CardTitle>`;
      case "text":
        used.add("CardDescription");
        return `${pad}<CardDescription>${esc(el.text)}</CardDescription>`;
      case "badge":
        used.add("Badge");
        return `${pad}<Badge variant="secondary" className="w-fit">${esc(el.text)}</Badge>`;
      case "separator":
        used.add("Separator");
        return `${pad}<Separator />`;
      case "button": {
        used.add("Button");
        const props = [
          el.variant && el.variant !== "default"
            ? `variant=${attr(el.variant)}`
            : "",
          el.size === "sm" ? `size="sm"` : el.size === "lg" ? `size="lg"` : "",
          el.fullWidth ? `className="w-full"` : "",
        ].filter(Boolean);
        return `${pad}<Button${props.length ? " " + props.join(" ") : ""}>${esc(el.text)}</Button>`;
      }
      case "input":
      case "textarea":
      case "select": {
        used.add("Label");
        const id = slug(el.label);
        const control =
          el.kind === "input"
            ? (used.add("Input"),
              `<Input id=${attr(id)} type=${attr(el.inputType ?? "text")} placeholder=${attr(el.placeholder)}${el.required ? " required" : ""} />`)
            : el.kind === "textarea"
              ? (used.add("Textarea"),
                `<Textarea id=${attr(id)} placeholder=${attr(el.placeholder)}${el.required ? " required" : ""} />`)
              : ([
                  "Select",
                  "SelectTrigger",
                  "SelectValue",
                  "SelectContent",
                ].forEach((c) => used.add(c)),
                `<Select>\n${pad}    <SelectTrigger id=${attr(id)} className="w-full">\n${pad}      <SelectValue placeholder=${attr(el.placeholder)} />\n${pad}    </SelectTrigger>\n${pad}    <SelectContent>{/* options */}</SelectContent>\n${pad}  </Select>`);
        return `${pad}<div className="grid gap-2">\n${pad}  <Label htmlFor=${attr(id)}>${esc(el.label)}</Label>\n${pad}  ${control}\n${pad}</div>`;
      }
      case "checkbox": {
        used.add("Checkbox").add("Label");
        const id = slug(el.text);
        return `${pad}<div className="flex items-center gap-2.5">\n${pad}  <Checkbox id=${attr(id)}${el.checked ? " defaultChecked" : ""} />\n${pad}  <Label htmlFor=${attr(id)} className="font-normal">${esc(el.text)}</Label>\n${pad}</div>`;
      }
      case "switch": {
        used.add("Switch").add("Label");
        const id = slug(el.text);
        return `${pad}<div className="flex items-center justify-between gap-4">\n${pad}  <Label htmlFor=${attr(id)} className="font-normal">${esc(el.text)}</Label>\n${pad}  <Switch id=${attr(id)}${el.checked ? " defaultChecked" : ""} />\n${pad}</div>`;
      }
      default:
        return `${pad}{/* ${el.kind}: hero-only component */}`;
    }
  };

  const parts: string[] = [];
  if (header.length) {
    used.add("CardHeader");
    parts.push(
      `      <CardHeader>\n${header.map((e) => line(e, "        ")).join("\n")}\n      </CardHeader>`,
    );
  }
  if (body.length) {
    used.add("CardContent");
    parts.push(
      `      <CardContent className="flex flex-col gap-5">\n${body.map((e) => line(e, "        ")).join("\n")}\n      </CardContent>`,
    );
  }
  if (footer.length) {
    used.add("CardFooter");
    const align = {
      start: "justify-start",
      end: "justify-end",
      between: "justify-between",
      stretch: "*:flex-1",
    }[design.footerAlign];
    parts.push(
      `      <CardFooter className="gap-2 ${align}">\n${footer.map((e) => line(e, "        ")).join("\n")}\n      </CardFooter>`,
    );
  }

  const from: Record<string, string> = {
    Card: "card",
    CardHeader: "card",
    CardTitle: "card",
    CardDescription: "card",
    CardContent: "card",
    CardFooter: "card",
    Badge: "badge",
    Button: "button",
    Checkbox: "checkbox",
    Input: "input",
    Label: "label",
    Select: "select",
    SelectTrigger: "select",
    SelectValue: "select",
    SelectContent: "select",
    Separator: "separator",
    Switch: "switch",
    Textarea: "textarea",
  };
  const byFile = new Map<string, string[]>();
  for (const name of used)
    byFile.set(from[name], [...(byFile.get(from[name]) ?? []), name]);
  const imports = [...byFile]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(
      ([file, names]) =>
        `import { ${names.join(", ")} } from "@/components/ui/${file}"`,
    )
    .join("\n");

  const width = { narrow: "max-w-sm", medium: "max-w-md", wide: "max-w-lg" }[
    design.width
  ];
  const accent =
    design.accent === "neutral"
      ? ""
      : `\n// Accent: ${design.accent}. Set --primary to ${ACCENTS[design.accent].primary} on a wrapper or in your theme.`;
  const name = pascal(design.name) || "SpokenCard";

  return `${imports}
${accent}
export function ${name}() {
  return (
    <Card className="w-full ${width}">
${parts.join("\n")}
    </Card>
  )
}
`;
}

function slug(s = "") {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "field"
  );
}

function pascal(s: string) {
  return s
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join("");
}

function heroJsx(design: Design): string {
  const hero = design.hero ?? DEFAULT_HERO;
  const dark = hero.theme === "dark";
  const centered = hero.layout === "centered";
  const icons = new Set<string>();
  let usesButton = false;
  let usesInput = false;
  const ink = dark ? "text-white" : "text-neutral-950";
  const slot = (s: HeroSlot) => design.elements.filter((e) => e.section === s);

  const part = (el: Element, pad: string): string => {
    switch (el.kind) {
      case "logo":
        return `${pad}<a href="/" className="text-[15px] font-semibold tracking-tight">${esc(el.text)}</a>`;
      case "link":
        return `${pad}<a href="#" className="text-sm font-medium opacity-70 hover:opacity-100">${esc(el.text)}</a>`;
      case "eyebrow":
        return `${pad}<p className="text-[11px] font-medium uppercase tracking-[0.14em] opacity-55">${esc(el.text)}</p>`;
      case "badge":
        return `${pad}<span className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium">${esc(el.text)}</span>`;
      case "headline": {
        const t = el.text ?? "";
        const i = el.emphasis
          ? t.toLowerCase().indexOf(el.emphasis.toLowerCase())
          : -1;
        const inner =
          i < 0
            ? esc(t)
            : `${esc(t.slice(0, i))}<a href="#" className="border-b-2 border-dotted">${esc(t.slice(i, i + el.emphasis!.length))}</a>${esc(t.slice(i + el.emphasis!.length))}`;
        return `${pad}<h1 className="text-6xl font-medium tracking-tight text-balance">${inner}</h1>`;
      }
      case "text":
        return `${pad}<p className="max-w-xl text-lg leading-relaxed opacity-70">${esc(el.text)}</p>`;
      case "avatar":
        return `${pad}<img src="/avatar.png" alt=${attr(el.text)} className="size-[76px] rounded-[20px] object-cover" />`;
      case "image":
        return `${pad}<img src="/hero.png" alt=${attr(el.text)} className="aspect-[16/10] w-full rounded-2xl border object-cover" />`;
      case "brand":
        return `${pad}<span className="text-[17px] font-semibold tracking-tight opacity-50">${esc(el.text)}</span>{/* swap for a logo image */}`;
      case "icon": {
        const name =
          el.icon && ICONS[el.icon]
            ? (ICONS[el.icon].Icon.displayName ?? "Sparkles")
            : "Sparkles";
        icons.add(name);
        return `${pad}<a href="#" aria-label=${attr(el.icon ?? "link")} className="grid size-10 place-items-center rounded-xl"><${name} className="size-[18px]" /></a>`;
      }
      case "scroll":
        icons.add("ChevronDown");
        return `${pad}<ChevronDown className="size-6 animate-bounce opacity-50" aria-label="Scroll down" />`;
      case "button": {
        usesButton = true;
        const variant =
          el.variant && el.variant !== "default"
            ? ` variant=${attr(el.variant)}`
            : "";
        return `${pad}<Button size="lg"${variant} className="rounded-full px-5">${esc(el.text)}</Button>`;
      }
      case "input":
        usesInput = true;
        return `${pad}<Input type="email" placeholder=${attr(el.placeholder)} className="h-10 max-w-72 rounded-full px-4" />`;
      default:
        return `${pad}{/* ${el.kind} */}`;
    }
  };

  const row = (items: Element[], cls: string, pad: string) =>
    items.length
      ? `${pad}<div className="${cls}">\n${items.map((e) => part(e, pad + "  ")).join("\n")}\n${pad}</div>`
      : "";

  const align = centered ? "items-center text-center" : "items-start text-left";
  const body = [
    row(slot("main"), `flex flex-col gap-4 ${align}`, "          "),
    row(
      slot("actions"),
      `flex flex-wrap gap-3${centered ? " justify-center" : ""}`,
      "          ",
    ),
    row(
      slot("proof"),
      `mt-4 flex flex-wrap items-center gap-x-8 gap-y-3${centered ? " justify-center" : ""}`,
      "          ",
    ),
  ]
    .filter(Boolean)
    .join("\n");
  const media = slot("media");
  const bottom = slot("bottom");

  const navLeft = row(slot("nav-left"), "flex items-center gap-6", "        ");
  const navRight = row(
    slot("nav-right"),
    "flex items-center gap-6",
    "        ",
  );
  const mediaJsx = media.map((e) => part(e, "        ")).join("\n");
  const bottomJsx = bottom.length
    ? row(bottom, "flex items-center justify-center gap-1 pb-7", "      ")
    : "";

  const imports = [
    usesButton && `import { Button } from "@/components/ui/button"`,
    usesInput && `import { Input } from "@/components/ui/input"`,
    icons.size &&
      `import { ${[...icons].sort().join(", ")} } from "lucide-react"`,
  ]
    .filter(Boolean)
    .join("\n");
  const name = pascal(design.name) || "SpokenHero";

  return `${imports}

// Background: "${hero.background}" at strength ${hero.intensity}/5, accent ${design.accent} (${ACCENTS[design.accent].primary}).
// The effect is CSS in speakui's globals.css (.hero-bg-${hero.background}); copy it or swap in your own.
export function ${name}() {
  return (
    <section className="relative isolate flex min-h-[600px] flex-col overflow-hidden ${dark ? "bg-neutral-950" : "bg-stone-50"} ${ink}">
      <nav className="flex items-center justify-between gap-6 px-8 pt-7">
${navLeft}
${navRight}
      </nav>
      <div className="flex flex-1 items-center px-12 py-14${hero.layout === "split" ? " grid grid-cols-2 gap-12" : ""}">
        <div className="flex w-full flex-col gap-7 ${align}${centered ? " mx-auto" : " max-w-3xl"}">
${body}
        </div>
${mediaJsx}
      </div>
${bottomJsx}
    </section>
  )
}
`.replace(/\n\s*\n(\s*<\/)/g, "\n$1");
}
