import type {
  Accent,
  CardWidth,
  Density,
  Design,
  Element,
  FooterAlign,
  HeroBackground,
  HeroHeight,
  HeroLayout,
  HeroSettings,
  HeroTheme,
  Kind,
  Mode,
  Section,
} from "./types";

type KindSpec = {
  describe: string;

  noun: string;

  spoken: Partial<Record<Mode, string[]>>;

  home: Partial<Record<Mode, Section>>;
};

export const KINDS: Record<Kind, KindSpec> = {
  heading: {
    describe: "A title or heading: large bold text naming the card",
    noun: "heading",
    spoken: { card: ["heading", "headline", "title", "header text"] },
    home: { card: "header" },
  },
  text: {
    describe:
      "A paragraph, description, subtitle, subheadline or body copy: plain muted text",
    noun: "text",
    spoken: {
      card: [
        "description",
        "subtitle",
        "subheading",
        "paragraph",
        "helper text",
        "body text",
        "copy",
        "caption",
        "text",
      ],
      hero: [
        "subheadline",
        "sub headline",
        "subheading",
        "subtitle",
        "description",
        "paragraph",
        "supporting text",
        "body text",
        "bio",
        "blurb",
        "intro text",
        "copy",
        "text",
      ],
    },
    home: { card: "header", hero: "main" },
  },
  input: {
    describe:
      "A single-line text field with a label, for things like email, name or password",
    noun: "field",
    spoken: {
      card: [
        "text field",
        "input field",
        "text box",
        "textbox",
        "input",
        "field",
      ],
      hero: [
        "email field",
        "email capture",
        "email input",
        "signup field",
        "text field",
        "input field",
        "input",
        "field",
      ],
    },
    home: { card: "body", hero: "actions" },
  },
  textarea: {
    describe: "A multi-line text area for longer messages, notes or comments",
    noun: "text area",
    spoken: {
      card: [
        "text area",
        "textarea",
        "message box",
        "comment box",
        "multi-line field",
        "multiline field",
      ],
    },
    home: { card: "body" },
  },
  select: {
    describe: "A dropdown / select menu to pick one option from a list",
    noun: "dropdown",
    spoken: {
      card: [
        "dropdown",
        "drop down",
        "drop-down",
        "select menu",
        "select",
        "picker",
      ],
    },
    home: { card: "body" },
  },
  checkbox: {
    describe: "A checkbox with a label, e.g. agree to terms, remember me",
    noun: "checkbox",
    spoken: { card: ["checkbox", "check box", "tick box", "tickbox", "box"] },
    home: { card: "body" },
  },
  switch: {
    describe:
      "An on/off toggle switch with a label, e.g. notification settings",
    noun: "switch",
    spoken: { card: ["toggle switch", "toggle", "switch"] },
    home: { card: "body" },
  },
  button: {
    describe:
      "A clickable button or call to action, e.g. Get started, Book a call, Send",
    noun: "button",
    spoken: {
      card: ["call to action", "cta", "button"],
      hero: ["call to action", "cta", "button"],
    },
    home: { card: "footer", hero: "actions" },
  },
  badge: {
    describe: "A small pill-shaped badge or tag, e.g. New, Beta, Now available",
    noun: "badge",
    spoken: {
      card: ["badge", "pill", "tag", "chip", "label pill"],
      hero: ["announcement pill", "badge", "pill", "tag", "chip"],
    },
    home: { card: "header", hero: "main" },
  },
  separator: {
    describe: "A thin horizontal divider line between content",
    noun: "divider",
    spoken: { card: ["divider", "separator", "horizontal rule", "line"] },
    home: { card: "body" },
  },
  logo: {
    describe:
      "The site's own logo or brand wordmark, usually top left in the nav",
    noun: "logo",
    spoken: {
      hero: [
        "wordmark",
        "brand mark",
        "logo mark",
        "site logo",
        "my logo",
        "our logo",
        "logo",
      ],
    },
    home: { hero: "nav-left" },
  },
  link: {
    describe:
      "A navigation link / menu item, e.g. About, Work, Pricing, Contact",
    noun: "link",
    spoken: {
      hero: [
        "navigation links",
        "navigation",
        "nav links",
        "nav link",
        "nav bar",
        "navbar",
        "nav",
        "menu items",
        "menu item",
        "menu",
        "links",
        "link",
      ],
    },
    home: { hero: "nav-right" },
  },
  eyebrow: {
    describe:
      "A small uppercase label above the headline, e.g. 'Trusted by', 'Introducing', 'Designer'",
    noun: "eyebrow",
    spoken: { hero: ["eyebrow", "kicker", "overline", "small label", "label"] },
    home: { hero: "main" },
  },
  headline: {
    describe: "The big main headline or tagline of the hero",
    noun: "headline",
    spoken: {
      hero: [
        "headline",
        "main title",
        "hero title",
        "tagline",
        "heading",
        "title",
        "slogan",
        "name",
      ],
    },
    home: { hero: "main" },
  },
  avatar: {
    describe: "A round profile photo / avatar of a person",
    noun: "avatar",
    spoken: {
      hero: [
        "profile photo",
        "profile picture",
        "profile image",
        "headshot",
        "avatar",
        "portrait",
      ],
    },
    home: { hero: "main" },
  },
  image: {
    describe:
      "A large image, product screenshot, mockup or illustration beside or below the text",
    noun: "image",
    spoken: {
      hero: [
        "product screenshot",
        "screenshot",
        "mockup",
        "illustration",
        "hero image",
        "image",
        "picture",
        "photo",
        "graphic",
      ],
    },
    home: { hero: "media" },
  },
  brand: {
    describe: "A client or partner logo shown in a 'trusted by' row",
    noun: "client logo",
    spoken: {
      hero: [
        "client logos",
        "client logo",
        "partner logos",
        "partner logo",
        "customer logos",
        "customer logo",
        "logo row",
        "logo strip",
        "trusted by",
        "logos",
      ],
    },
    home: { hero: "proof" },
  },
  icon: {
    describe:
      "A small icon button, e.g. social links, contact or a dock of icons",
    noun: "icon",
    spoken: {
      hero: [
        "icon buttons",
        "icon button",
        "social icons",
        "social links",
        "icons",
        "icon",
        "dock",
      ],
    },
    home: { hero: "bottom" },
  },
  scroll: {
    describe: "A scroll-down cue: a small chevron or arrow pointing down",
    noun: "scroll cue",
    spoken: {
      hero: [
        "scroll indicator",
        "scroll cue",
        "scroll arrow",
        "scroll down",
        "chevron pointing down",
        "arrow pointing down",
        "down arrow",
        "chevron",
      ],
    },
    home: { hero: "bottom" },
  },
};

export const kindsFor = (mode: Mode): Kind[] =>
  (Object.keys(KINDS) as Kind[]).filter((k) => KINDS[k].home[mode]);

export const ALL_KINDS = Object.keys(KINDS) as Kind[];

export function modeForKind(kind: Kind): Mode | null {
  const h = KINDS[kind].home;
  if (h.hero && !h.card) return "hero";
  if (h.card && !h.hero) return "card";
  return null;
}

export const SECTIONS: Record<Mode, Partial<Record<Section, string>>> = {
  card: {
    header: "The top of the card: title, description, badges",
    body: "The middle of the card: form fields, checkboxes, switches, content",
    footer: "The bottom bar of the card: action buttons",
  },
  hero: {
    "nav-left": "Top-left of the nav bar: the logo",
    "nav-right": "Top-right of the nav bar: menu links, a small button",
    main: "The main text stack: eyebrow, headline, subheadline, avatar",
    actions:
      "The row of buttons (calls to action) or email signup under the headline",
    proof: "The 'trusted by' row of client logos",
    media:
      "A large image or screenshot beside the text (split layout) or below it",
    bottom: "The bottom edge of the hero: a scroll cue or a dock of icons",
  },
};

export const SECTION_ORDER: Record<Mode, Section[]> = {
  card: ["header", "body", "footer"],
  hero: [
    "nav-left",
    "nav-right",
    "main",
    "actions",
    "proof",
    "media",
    "bottom",
  ],
};

export const SECTION_NAMES: Record<Section, string> = {
  header: "header",
  body: "body",
  footer: "footer",
  "nav-left": "nav, left",
  "nav-right": "nav, right",
  main: "main",
  actions: "actions",
  proof: "logo row",
  media: "media",
  bottom: "bottom",
};

export const ACCENTS: Record<
  Accent,
  { label: string; primary: string; foreground: string }
> = {
  neutral: {
    label: "Neutral / black / white / monochrome",
    primary: "oklch(0.205 0 0)",
    foreground: "oklch(0.985 0 0)",
  },
  blue: {
    label: "Blue",
    primary: "oklch(0.546 0.245 262.881)",
    foreground: "oklch(0.985 0 0)",
  },
  green: {
    label: "Green",
    primary: "oklch(0.596 0.145 163.225)",
    foreground: "oklch(0.985 0 0)",
  },
  violet: {
    label: "Violet / purple",
    primary: "oklch(0.541 0.281 293.009)",
    foreground: "oklch(0.985 0 0)",
  },
  rose: {
    label: "Rose / red / pink",
    primary: "oklch(0.586 0.253 17.585)",
    foreground: "oklch(0.985 0 0)",
  },
  orange: {
    label: "Orange",
    primary: "oklch(0.646 0.222 41.116)",
    foreground: "oklch(0.985 0 0)",
  },
  amber: {
    label: "Amber / yellow / gold",
    primary: "oklch(0.769 0.188 70.08)",
    foreground: "oklch(0.21 0.034 45)",
  },
  teal: {
    label: "Teal / cyan / turquoise",
    primary: "oklch(0.6 0.118 184.704)",
    foreground: "oklch(0.985 0 0)",
  },
};

const COLOUR_WORDS: [RegExp, Accent][] = [
  [/\b(?:violet|purple|indigo|lilac|lavender)\b/i, "violet"],
  [/\b(?:amber|yellow|gold|golden|mustard)\b/i, "amber"],
  [/\b(?:rose|red|pink|crimson|magenta)\b/i, "rose"],
  [/\b(?:teal|cyan|turquoise|aqua)\b/i, "teal"],
  [/\b(?:orange|tangerine|coral)\b/i, "orange"],
  [/\b(?:green|emerald|mint|lime)\b/i, "green"],
  [/\bblue\b/i, "blue"],
  [/\b(?:neutral|black|white|grey|gray|monochrome|mono)\b/i, "neutral"],
];

export function colourNamedIn(text: string): Accent | null {
  const target = text.match(/\b(?:to|into)\b\s+(.+)$/i)?.[1];
  return lastColourIn(target ?? "") ?? lastColourIn(text);
}

function lastColourIn(text: string): Accent | null {
  let best: { at: number; accent: Accent } | null = null;
  for (const [re, accent] of COLOUR_WORDS) {
    const at = text.search(re);
    if (at >= 0 && (!best || at > best.at)) best = { at, accent };
  }
  return best?.accent ?? null;
}

export const DENSITIES: Record<Density, string> = {
  compact: "Tighter, less padding and spacing, denser",
  comfortable: "Default, balanced spacing",
  spacious: "Roomier, more padding and breathing room, less cramped",
};

export const WIDTHS: Record<CardWidth, string> = {
  narrow: "Narrow / smaller card",
  medium: "Medium, default card width",
  wide: "Wide / wider / bigger card",
};

export const FOOTER_ALIGNS: Record<FooterAlign, string> = {
  start: "Footer buttons aligned to the left",
  end: "Footer buttons aligned to the right (default)",
  between: "Footer buttons spread apart to both edges",
  stretch: "Footer buttons stretched to fill the full width equally",
};

export const HERO_LAYOUTS: Record<HeroLayout, string> = {
  centered: "Everything centred",
  left: "Text aligned to the left",
  split: "Text on the left, a big image or screenshot on the right",
};

export const HERO_BACKGROUNDS: Record<HeroBackground, string> = {
  solid: "Plain solid colour, no effect",
  aurora: "Aurora: soft flowing northern-lights colour, animated",
  mesh: "Mesh gradient: blended blobs of colour",
  glow: "A single soft glow or spotlight behind the text",
  shader:
    "Shader: a live animated glow field, drawn on the GPU and always moving",
  dots: "A fine dot-matrix pattern",
  grid: "A thin line grid pattern",
};

const BACKGROUND_WORDS: [RegExp, HeroBackground][] = [
  [/\b(?:shader|animated|animate it|glow field)\b/i, "shader"],
  [/\banimate\b(?!\s+(?:the\s+)?(?:text|headline|button|logo))/i, "shader"],
  [
    /\b(?:plain|flat|no background|nothing behind|no effect|solid colou?r)\b/i,
    "solid",
  ],
  [/\bremove the background(?:\s+effect|\s+pattern)?\b/i, "solid"],
  [/\baurora\b/i, "aurora"],
  [/\bmesh\b/i, "mesh"],
  [/\bdot ?(?:matrix|pattern|s)\b/i, "dots"],
  [/\bgrid\b/i, "grid"],
];

export function backgroundNamedIn(text: string): HeroBackground | null {
  for (const [re, key] of BACKGROUND_WORDS) if (re.test(text)) return key;
  return null;
}

export const HERO_THEMES: Record<HeroTheme, string> = {
  light: "Light: pale background, dark text",
  dark: "Dark: near-black background, light text",
};

export const HERO_HEIGHTS: Record<HeroHeight, string> = {
  compact: "Short / compact hero",
  tall: "Tall hero (default)",
  full: "Full screen / full height of the window",
};

let counter = 0;
export function newId(kind: Kind): string {
  counter += 1;
  return `${kind}_${Date.now().toString(36)}${counter}`;
}

export function capitalise(s: string): string {
  const t = s.trim();
  return t ? t[0].toUpperCase() + t.slice(1) : t;
}

export function createElement(
  kind: Kind,
  section: Section,
  opts: {
    value?: string | null;
    modifier?: string | null;
    icon?: string | null;
  } = {},
): Element {
  const value = opts.value ? capitalise(opts.value) : null;
  const mod = opts.modifier ? capitalise(opts.modifier) : null;
  const base = { id: newId(kind), kind, section };

  switch (kind) {
    case "heading":
      return { ...base, text: value ?? mod ?? "Untitled", size: "md" };
    case "text":
      return { ...base, text: value ?? mod ?? "Add a short description here." };
    case "badge":
      return { ...base, text: value ?? mod ?? "New" };
    case "button":
      return {
        ...base,
        text: value ?? mod ?? "Get started",
        variant: "default",
        fullWidth: false,
        size: "md",
        ...(opts.icon && { icon: opts.icon }),
      };
    case "checkbox":
      return {
        ...base,
        text: value ?? mod ?? "Checkbox label",
        checked: false,
      };
    case "switch":
      return {
        ...base,
        text: value ?? mod ?? "Toggle setting",
        checked: false,
      };
    case "separator":
      return base;
    case "input": {
      const label = value ?? mod ?? "Label";
      const lower = label.toLowerCase();
      const inputType = lower.includes("email")
        ? "email"
        : lower.includes("password")
          ? "password"
          : lower.match(/\b(number|amount|quantity|age)\b/)
            ? "number"
            : "text";
      const placeholder =
        inputType === "email"
          ? "name@example.com"
          : inputType === "password"
            ? "••••••••"
            : `Enter ${lower}`;
      return { ...base, label, placeholder, inputType };
    }
    case "textarea": {
      const label = value ?? mod ?? "Message";
      return {
        ...base,
        label,
        placeholder: `Write your ${label.toLowerCase()}…`,
      };
    }
    case "select": {
      const label = value ?? mod ?? "Select";
      return { ...base, label, placeholder: `Choose ${label.toLowerCase()}` };
    }
    case "logo":
      return { ...base, text: value ?? mod ?? "Studio" };
    case "link":
      return { ...base, text: value ?? mod ?? "Link" };
    case "eyebrow":
      return { ...base, text: value ?? mod ?? "Introducing" };
    case "headline":
      return { ...base, text: value ?? mod ?? "Say it, see it.", size: "lg" };
    case "avatar":
      return { ...base, text: value ?? mod ?? "You" };
    case "image":
      return { ...base, text: value ?? mod ?? "Product screenshot" };
    case "brand":
      return { ...base, text: value ?? mod ?? "Acme" };
    case "icon":
      return {
        ...base,
        icon: opts.icon ?? "sparkles",
        text: value ?? mod ?? undefined,
      };
    case "scroll":
      return { ...base, text: value ?? undefined };
  }
}

export function describeElement(el: Element): string {
  const noun = KINDS[el.kind].noun;
  if (el.kind === "icon") return `${el.icon ?? "icon"} icon`;
  const words = el.text ?? el.label;
  return words ? `“${words}” ${noun}` : noun;
}

export const DEFAULT_HERO: HeroSettings = {
  layout: "centered",
  background: "aurora",
  theme: "dark",
  height: "tall",
  intensity: 3,
};

export function emptyDesign(mode: Mode = "card"): Design {
  return {
    mode,
    name: mode === "hero" ? "Untitled hero" : "Untitled card",
    accent: mode === "hero" ? "violet" : "neutral",
    density: "comfortable",
    width: "medium",
    footerAlign: "end",
    ...(mode === "hero" && { hero: { ...DEFAULT_HERO } }),
    elements: [],
  };
}
