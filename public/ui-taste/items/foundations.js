area(
  "colour",
  "Colour",
  "The quietest decisions on the page, and the ones every other choice sits on.",
);
add("colour", [
  {
    id: "page-bg",
    t: "Page background",
    src: "neilmcardle.com",
    repo: "both",
    flush: true,
    why: "The colour everything sits on sets the temperature of the whole site. White panels and hairlines only read when the page is a step off white.",
    opts: [
      { l: "White", v: "#ffffff" },
      { l: "Off-white", v: "#fafafa", n: "What neilmcardle.com used." },
      { l: "Cool grey", v: "#f4f5f7" },
      {
        l: "Warm paper",
        v: "#f5f2ea",
        n: "Cream is the most common AI-generated background.",
      },
      { l: "Dark", v: "#0f0f10" },
    ],
    def: 1,
    demo: (s, o) => {
      const dk = o.v === "#0f0f10";
      return `<div style="background:${o.v};padding:28px"><div style="max-width:340px;padding:16px;border-radius:10px;background:${dk ? "#19191b" : "#fff"};border:1px solid ${dk ? "#2a2a2d" : "rgb(0 0 0/.08)"}"><div style="font-weight:550;color:${dk ? "#f2f2f2" : "#1d1d1f"}">${SHORT}</div><div style="font-size:13px;color:${dk ? "#a1a1a6" : "#5c5c5c"}">A white panel on the page background.</div></div></div>`;
    },
    css: (s, o) => `--bg: ${o.v};`,
    tw: (s, o) => `bg-[${o.v}]`,
    spec: (s, o) => `Page fill ${o.v}`,
  },
  {
    id: "body-colour",
    t: "Reading text colour",
    src: "General practice",
    repo: "both",
    why: "Near-black reading text at a large size is the main reason a page feels heavy. A grey that still passes contrast keeps it light.",
    opts: [
      { l: "Near-black #111", v: "#111111" },
      {
        l: "Ink grey #5c5c5c",
        v: "#5c5c5c",
        n: "Yours. Headings stay near-black for contrast.",
      },
      { l: "Slate #5a6472", v: "#5a6472" },
      {
        l: "Mid grey #737373",
        v: "#737373",
        n: "The lightest grey that passes for body text on off-white.",
      },
      {
        l: "Too light #999",
        v: "#999999",
        n: "Fails contrast for reading text.",
      },
    ],
    def: 1,
    demo: (s, o) =>
      `<div style="font-weight:550;font-size:17px;color:#1d1d1f;margin-bottom:4px">${SHORT}</div><p style="margin:0;max-width:46ch;color:${o.v}">${SAMPLE}</p><p style="margin:12px 0 0;font-size:12px;color:#737373">${ratio(o.v, "#ffffff")}:1 on white, ${ratio(o.v, "#fafafa")}:1 on #fafafa. Body text needs 4.5:1.</p>`,
    css: (s, o) => `--text: ${o.v};`,
    tw: (s, o) => `text-[${o.v}]`,
    spec: (s, o) => `Body ${o.v}, ${ratio(o.v, "#fafafa")}:1 on #fafafa`,
  },
  {
    id: "heading-colour",
    t: "Heading colour",
    src: "General practice",
    repo: "both",
    why: "Pure black against off-white is harsher than it needs to be. A softened black keeps headings strong without the glare.",
    opts: [
      { l: "Black", v: "#000000" },
      { l: "#1d1d1f", v: "#1d1d1f", n: "Apple's." },
      { l: "#212223", v: "#212223" },
      { l: "#0d1117", v: "#0d1117", n: "A blue-black." },
    ],
    def: 1,
    demo: (s, o) =>
      `<div style="font-size:34px;font-weight:520;letter-spacing:-.045em;line-height:1.05;color:${o.v}">Work</div><p style="margin:8px 0 0;color:#5c5c5c">Selected product design.</p>`,
    css: (s, o) => `--ink: ${o.v};`,
    tw: (s, o) => `text-[${o.v}]`,
  },
  {
    id: "accent",
    t: "Accent colour strategy",
    src: "Impeccable, neilmcardle.com brands",
    repo: "both",
    why: "Rarity gives an accent its force. Spend it on one job and people learn where to look.",
    opts: [
      { l: "None, ink is the accent", v: "none", n: "Your portfolio today." },
      {
        l: "One action per view",
        v: "one",
        n: "The makeEbook, coverly and Spark rule.",
      },
      { l: "Focus and selection only", v: "focus" },
      { l: "Several, by meaning", v: "many" },
    ],
    def: 1,
    dials: [
      ["h", "Hue", 0, 360, 1, 255, "°"],
      ["c", "Chroma", 0, 0.3, 0.01, 0.17, ""],
      ["l", "Lightness", 0.3, 0.8, 0.01, 0.55, ""],
    ],
    demo: (s, o) => {
      const a = `oklch(${s.d.l} ${s.d.c} ${s.d.h})`,
        a2 = `oklch(${s.d.l} ${s.d.c} ${(s.d.h + 140) % 360})`;
      const btn = o.v === "one" || o.v === "many" ? a : "#1d1d1f";
      const link = o.v === "many" ? a2 : "#1d1d1f";
      const ring = o.v === "focus" ? a : "#1d1d1f";
      return `<div style="display:flex;flex-wrap:wrap;gap:16px;align-items:center"><button style="height:36px;padding:0 16px;border:0;border-radius:999px;background:${btn};color:#fff;font-size:13px;font-weight:500">Book a call</button><a style="color:${link};text-decoration:underline;text-underline-offset:3px;font-size:14px">Read the case study</a><span style="display:inline-flex;height:30px;align-items:center;padding:0 10px;border-radius:8px;border:1px solid #e8e8e8;box-shadow:0 0 0 3px color-mix(in oklch, ${ring} 35%, transparent);font-size:13px">Focused field</span><span style="font-size:13px;padding:2px 8px;border-radius:999px;background:${o.v === "many" ? `color-mix(in oklch, ${a2} 15%, white)` : "#f3f3f3"};color:${o.v === "many" ? a2 : "#5c5c5c"}">In progress</span></div>`;
    },
    css: (s) => `--accent: oklch(${s.d.l} ${s.d.c} ${s.d.h});`,
    tw: (s) => `colors: { accent: "oklch(${s.d.l} ${s.d.c} ${s.d.h})" }`,
    rule: (s, o) =>
      ({
        none: "No accent. Ink carries actions; weight and underline carry emphasis.",
        one: "One accent fill per view, on the primary action. Never on decoration.",
        focus: "Accent only on focus rings and selected states.",
        many: "Accent colours map to meanings and never repeat for a different meaning.",
      })[o.v],
  },
  {
    id: "hairline",
    t: "Line colour",
    src: "General practice",
    repo: "both",
    why: "Faint 1px lines define shapes without adding weight. Transparent black adapts to whatever sits underneath; solid grey stays exact.",
    opts: [
      { l: "Transparent black", v: "alpha" },
      { l: "Solid grey", v: "solid" },
    ],
    dials: [["a", "Strength", 0.03, 0.2, 0.01, 0.09, ""]],
    demo: (s, o) => {
      const c =
        o.v === "alpha" ? `rgb(0 0 0 / ${s.d.a})` : greyFromAlpha(s.d.a);
      return ["makeEbook", "coverly", "Spark"]
        .map(
          (x, i) =>
            `<div style="display:flex;justify-content:space-between;padding:10px 0;${i ? `border-top:1px solid ${c}` : ""}"><span style="font-weight:500">${x}</span><span style="color:#737373;font-size:13px">202${6 - i}</span></div>`,
        )
        .join("");
    },
    css: (s, o) =>
      `--line: ${o.v === "alpha" ? `rgb(0 0 0 / ${s.d.a})` : greyFromAlpha(s.d.a)};`,
    tw: (s, o) =>
      `border-[${o.v === "alpha" ? `rgb(0_0_0/${s.d.a})` : greyFromAlpha(s.d.a)}]`,
  },
  {
    id: "selection",
    t: "Text selection",
    src: "Impeccable craft floor",
    repo: "both",
    why: "Selection is a browser surface nobody designs, which makes it one of the cheapest signs that a page was built with care.",
    hint: "Select some of the text to see it.",
    opts: [
      { l: "Browser blue", v: ["", ""] },
      { l: "Ink", v: ["#1d1d1f", "#fff"], n: "What this page uses." },
      { l: "Soft grey", v: ["#e4e4e4", "#1d1d1f"] },
      { l: "Highlighter", v: ["#f4f08a", "#1d1d1f"] },
    ],
    def: 1,
    demo: (s, o) =>
      `<p class="${o.v[0] ? "d-sel" : ""}" style="margin:0;max-width:46ch;color:#5c5c5c;--sb:${o.v[0]};--sc:${o.v[1]}">${SAMPLE}</p>`,
    css: (s, o) =>
      o.v[0]
        ? `::selection { background: ${o.v[0]}; color: ${o.v[1]}; }`
        : "/* browser default */",
    tw: (s, o) =>
      o.v[0] ? `selection:bg-[${o.v[0]}] selection:text-[${o.v[1]}]` : "none",
  },
  {
    id: "dark-mode",
    t: "Dark mode",
    src: "Impeccable, Apple",
    repo: "both",
    why: "Pick light or dark from where and when people use the thing, not from the category. If both exist, compose each one; never invert.",
    opts: [
      {
        l: "Light only",
        v: "light",
        n: "One theme done properly. Your portfolio today.",
      },
      { l: "Follow the system", v: "system" },
      {
        l: "System plus a toggle",
        v: "toggle",
        n: "Needs a no-flash script so the saved theme applies before paint.",
      },
      { l: "Dark first", v: "dark", n: "Spark's terminal world." },
    ],
    demo: (s, o) => {
      const card = (bg, fg, sub, on) =>
        `<div style="flex:1;min-width:140px;padding:16px;border-radius:10px;background:${bg};border:1px solid ${bg === "#fff" ? "#e8e8e8" : "#2a2a2d"};opacity:${on ? 1 : 0.25}"><div style="color:${fg};font-weight:550;font-size:14px">${SHORT}</div><div style="color:${sub};font-size:12px;margin-top:2px">${bg === "#fff" ? "Light" : "Dark"}</div></div>`;
      return `<div style="display:flex;gap:12px;flex-wrap:wrap">${card("#fff", "#1d1d1f", "#737373", o.v !== "dark")}${card("#141415", "#f2f2f2", "#a1a1a6", o.v !== "light")}</div>`;
    },
    css: (s, o) =>
      ({
        light: ":root { color-scheme: light; }",
        system:
          ":root { color-scheme: light dark; }\n@media (prefers-color-scheme: dark) { :root { /* remap tokens */ } }",
        toggle:
          ":root { color-scheme: light dark; }\n:root[data-theme=dark] { /* remap tokens */ }",
        dark: ":root { color-scheme: dark; }",
      })[o.v],
    tw: (s, o) =>
      ({
        light: "darkMode: false",
        system: 'darkMode: "media"',
        toggle: 'darkMode: "class"',
        dark: "Dark tokens as the default theme",
      })[o.v],
  },
  {
    id: "status-colours",
    t: "Status colours",
    src: "Apple, Impeccable",
    repo: "both",
    why: "Success, warning and error need to read at a glance, but they should not shout louder than the content. Colour is never the only signal.",
    opts: [
      { l: "Bright", v: ["#16a34a", "#f59e0b", "#dc2626"] },
      { l: "Muted", v: ["#1f7a4a", "#9a5b00", "#b42318"] },
      { l: "Ink and icon", v: ["#1d1d1f", "#1d1d1f", "#1d1d1f"] },
    ],
    def: 1,
    demo: (s, o) => {
      const tag = (c, ic, t) =>
        `<span style="display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 10px;border-radius:999px;border:1px solid #e8e8e8;color:${c};font-size:13px;font-weight:450">${icon(ic, { size: 14, stroke: 1.8 })}${t}</span>`;
      return `<div style="display:flex;gap:8px;flex-wrap:wrap">${tag(o.v[0], "check", "Saved")}${tag(o.v[1], "alert", "Check the dates")}${tag(o.v[2], "x", "Payment declined")}</div>`;
    },
    css: (s, o) =>
      `--success: ${o.v[0]};\n--warning: ${o.v[1]};\n--error: ${o.v[2]};`,
  },
  {
    id: "grey-temp",
    t: "Grey temperature",
    src: "Impeccable",
    repo: "both",
    why: "Greys lean warm, cool or neither. Tint them only when the brand hue gives a reason; neutral is a real choice too.",
    opts: [
      {
        l: "Neutral",
        v: ["#fafafa", "#e8e8e8", "#a3a3a3", "#737373", "#5c5c5c", "#1d1d1f"],
      },
      {
        l: "Cool",
        v: ["#f8fafc", "#e2e8f0", "#94a3b8", "#64748b", "#475569", "#0f172a"],
      },
      {
        l: "Warm",
        v: ["#fafaf9", "#e7e5e4", "#a8a29e", "#78716c", "#57534e", "#1c1917"],
      },
    ],
    demo: (s, o) =>
      `<div style="display:flex;border-radius:8px;overflow:hidden;border:1px solid #e8e8e8">${o.v.map((c) => `<div style="flex:1;height:56px;background:${c}"></div>`).join("")}</div><div style="margin-top:14px;padding:14px;border-radius:8px;background:${o.v[0]};border:1px solid ${o.v[1]}"><div style="color:${o.v[5]};font-weight:550">${SHORT}</div><div style="color:${o.v[4]};font-size:13px">Reading text</div><div style="color:${o.v[3]};font-size:12px">Metadata</div></div>`,
    css: (s, o) =>
      o.v
        .map((c, i) => `--grey-${[50, 200, 400, 500, 600, 900][i]}: ${c};`)
        .join("\n"),
  },
]);

area(
  "type",
  "Type",
  "Size, weight, tracking and leading set as one system, never size alone.",
);
add("type", [
  {
    id: "ui-family",
    t: "Interface typeface",
    src: "Apple, neilmcardle.com",
    repo: "both",
    why: "The system font costs nothing to load and is tuned for screens. A variable web font buys in-between weights like 425 and a consistent look everywhere.",
    opts: [
      {
        l: "System",
        v: "-apple-system, BlinkMacSystemFont, system-ui, sans-serif",
        c: 0,
        n: "Zero requests. Looks native on each platform, so it looks different on each platform.",
      },
      {
        l: "Inter",
        v: "Inter, system-ui, sans-serif",
        c: 1,
        n: "Yours. Variable, so 425 and 450 weights exist.",
      },
      {
        l: "Geist",
        v: "Geist, system-ui, sans-serif",
        c: 1,
        n: "Vercel's face. Slightly more geometric.",
      },
    ],
    def: 1,
    demo: (s, o) =>
      `<div style="font-family:${o.v}"><div style="font-size:28px;font-weight:520;letter-spacing:-.04em;line-height:1.1">${SHORT}</div><p style="margin:8px 0 12px;color:#5c5c5c;max-width:46ch;font-weight:425">${SAMPLE}</p><div style="display:flex;gap:16px;font-size:13px;font-weight:450"><span>Work</span><span>Playground</span><span style="color:#737373">2026</span></div></div>`,
    css: (s, o) => `--font-sans: ${o.v};`,
    tw: (s, o) =>
      `fontFamily: { sans: [${o.v
        .split(", ")
        .map((x) => `"${x}"`)
        .join(", ")}] }`,
  },
  {
    id: "display-family",
    t: "Display typeface",
    src: "frontend-design, neilmcardle.com brands",
    repo: "looks",
    why: "One family can do everything. A second face earns its place only if it does a job the first cannot.",
    opts: [
      {
        l: "Same as interface",
        v: "Inter, sans-serif",
        w: 520,
        ls: "-0.045em",
        c: 0,
      },
      {
        l: "Serif",
        v: "'Instrument Serif', serif",
        w: 400,
        ls: "-0.02em",
        c: 1,
        n: "Editorial. makeEbook uses Cormorant for the same reason.",
      },
      {
        l: "Mono heavy",
        v: "'JetBrains Mono', monospace",
        w: 800,
        ls: "-0.045em",
        c: 1,
        n: "Spark's voice. Monospace as a costume for 'technical' is an AI tell unless the subject is code.",
      },
    ],
    demo: (s, o) =>
      `<div style="font-family:${o.v};font-weight:${o.w};letter-spacing:${o.ls};font-size:44px;line-height:1.02">${SHORT}</div><p style="margin:10px 0 0;color:#5c5c5c;font-family:Inter">Set beside Inter for reading text.</p>`,
    css: (s, o) =>
      `--font-display: ${o.v};\nfont-weight: ${o.w};\nletter-spacing: ${o.ls};`,
  },
  {
    id: "reading-type",
    t: "Reading text",
    src: "neilmcardle.com",
    repo: "both",
    why: "Smaller, slightly heavier and slightly tighter reads as precise. neilmcardle.com moved from 17px at 400 to 15px at 425 for that reason.",
    dials: [
      ["size", "Size", 13, 18, 0.5, 15, "px"],
      ["w", "Weight", 350, 500, 5, 425, ""],
      ["tr", "Tracking", -3, 2, 0.5, -1, "%"],
      ["lh", "Line height", 1.3, 1.8, 0.05, 1.5, ""],
    ],
    demo: (s) =>
      `<p style="margin:0;max-width:62ch;color:#5c5c5c;font-size:${s.d.size}px;font-weight:${s.d.w};letter-spacing:${s.d.tr / 100}em;line-height:${s.d.lh}">${SAMPLE}</p><p style="margin:${s.d.size * 0.8}px 0 0;max-width:62ch;color:#5c5c5c;font-size:${s.d.size}px;font-weight:${s.d.w};letter-spacing:${s.d.tr / 100}em;line-height:${s.d.lh}">Each change is ranked by how much it should move conversion, so the first thing your team builds is the thing most likely to pay for the rest.</p>`,
    css: (s) =>
      `font-size: ${s.d.size}px;\nfont-weight: ${s.d.w};\nletter-spacing: ${s.d.tr / 100}em;\nline-height: ${s.d.lh};`,
    tw: (s) =>
      `text-[${s.d.size}px] font-[${s.d.w}] tracking-[${s.d.tr / 100}em] leading-[${s.d.lh}]`,
    spec: (s) =>
      `Inter ${s.d.size}/${+(s.d.size * s.d.lh).toFixed(1)}, weight ${s.d.w}, tracking ${s.d.tr}%`,
  },
  {
    id: "ui-type",
    t: "Interface text",
    src: "General practice",
    repo: "both",
    why: "Setting nearly every label, link and button at 13px keeps things consistent. Small and consistent is what makes the big moments feel big.",
    dials: [
      ["size", "Size", 11, 15, 0.5, 13, "px"],
      ["w", "Weight", 400, 550, 5, 450, ""],
      ["tr", "Tracking", -2, 2, 0.5, -0.5, "%"],
    ],
    demo: (s) => {
      const t = `font-size:${s.d.size}px;font-weight:${s.d.w};letter-spacing:${s.d.tr / 100}em`;
      return `<div style="display:flex;gap:18px;align-items:center;${t}"><span>Work</span><span>Playground</span><span>About</span><span style="margin-left:auto;display:inline-flex;align-items:center;height:32px;padding:0 14px;border-radius:999px;background:#1d1d1f;color:#fff">Book a call</span></div><div style="margin-top:16px;display:flex;gap:12px;color:#737373;${t}"><span>Product design, checkout</span><span>2026</span><span>Shipped</span></div>`;
    },
    css: (s) =>
      `font-size: ${s.d.size}px;\nfont-weight: ${s.d.w};\nletter-spacing: ${s.d.tr / 100}em;`,
    tw: (s) =>
      `text-[${s.d.size}px] font-[${s.d.w}] tracking-[${s.d.tr / 100}em]`,
  },
  {
    id: "heading-type",
    t: "Big headings",
    src: "General practice",
    repo: "both",
    why: "One big heading next to small, precise details is the contrast that makes a page feel dainty. Crisp weight with tight tracking reads modern; light weight reads fragile.",
    opts: [
      { l: "Light 300", v: 300 },
      { l: "Regular 400", v: 400 },
      { l: "Crisp 520", v: 520, n: "Yours." },
      { l: "Bold 700", v: 700 },
    ],
    def: 2,
    dials: [
      ["size", "Size", 28, 88, 1, 56, "px"],
      ["tr", "Tracking", -6, 0, 0.5, -4.5, "%"],
      ["lh", "Line height", 0.9, 1.3, 0.01, 1.02, ""],
    ],
    demo: (s, o) =>
      `<div style="font-size:${s.d.size}px;font-weight:${o.v};letter-spacing:${s.d.tr / 100}em;line-height:${s.d.lh}">Work</div><p style="margin:10px 0 0;color:#737373;font-size:13px">Product design, checkout</p>`,
    css: (s, o) =>
      `font-size: ${s.d.size}px;\nfont-weight: ${o.v};\nletter-spacing: ${s.d.tr / 100}em;\nline-height: ${s.d.lh};`,
    tw: (s, o) =>
      `text-[${s.d.size}px] font-[${o.v}] tracking-[${s.d.tr / 100}em] leading-[${s.d.lh}]`,
  },
  {
    id: "type-scale",
    t: "Type scale",
    src: "Elements of Typographic Style",
    repo: "both",
    why: "A fixed ratio between sizes gives hierarchy a rhythm. Small ratios suit dense product UI; large ones suit editorial pages.",
    opts: [
      { l: "1.125", v: 1.125 },
      { l: "1.2", v: 1.2 },
      { l: "1.25", v: 1.25 },
      { l: "1.333", v: 1.333 },
      { l: "1.5", v: 1.5 },
    ],
    def: 2,
    dials: [["base", "Base size", 12, 17, 0.5, 13, "px"]],
    demo: (s, o) =>
      Array.from({ length: 6 }, (_, i) => {
        const px = +(s.d.base * o.v ** i).toFixed(1);
        return `<div style="display:flex;align-items:baseline;gap:14px;margin:2px 0"><span style="width:44px;color:#a3a3a3;font-size:11px;font-variant-numeric:tabular-nums">${px}</span><span style="font-size:${px}px;font-weight:${i > 2 ? 520 : 450};letter-spacing:${i > 2 ? -0.03 : -0.01}em;line-height:1.15;white-space:nowrap">Fewer steps</span></div>`;
      }).join(""),
    css: (s, o) =>
      Array.from(
        { length: 6 },
        (_, i) => `--step-${i}: ${+(s.d.base * o.v ** i).toFixed(2)}px;`,
      ).join("\n"),
    tw: (s, o) =>
      `fontSize: { ${Array.from({ length: 6 }, (_, i) => `"${i}": "${+(s.d.base * o.v ** i).toFixed(2)}px"`).join(", ")} }`,
  },
  {
    id: "measure",
    t: "Line length",
    src: "Impeccable, frontend-design",
    repo: "both",
    why: "Long lines make the eye lose its place on the way back. Short lines break up thought. Most reading sits well between 55 and 75 characters.",
    dials: [["ch", "Measure", 35, 95, 1, 66, "ch"]],
    demo: (s) =>
      `<p style="margin:0;max-width:${s.d.ch}ch;color:#5c5c5c">${SAMPLE} Each change is ranked by how much it should move conversion, so the first thing your team builds is the thing most likely to pay for the rest.</p>`,
    css: (s) => `max-width: ${s.d.ch}ch;`,
    tw: (s) => `max-w-[${s.d.ch}ch]`,
  },
  {
    id: "tracking-by-size",
    t: "Tracking that changes with size",
    src: "Apple",
    repo: "both",
    why: "Letters look further apart as they grow, so large text wants negative tracking and small text wants none or a touch more. One value everywhere is wrong somewhere.",
    opts: [
      { l: "Size-specific", v: [-0.045, -0.025, -0.005] },
      { l: "One value everywhere", v: [0, 0, 0] },
    ],
    demo: (s, o) =>
      `<div style="font-size:48px;font-weight:520;line-height:1.05;letter-spacing:${o.v[0]}em">Fewer steps</div><div style="font-size:22px;font-weight:520;letter-spacing:${o.v[1]}em;margin:8px 0 4px">Booking flows that convert</div><div style="font-size:13px;letter-spacing:${o.v[2]}em;color:#737373">Product design, checkout, 2026</div>`,
    rule: (s, o) =>
      o.v[0]
        ? "Display -4.5%, headings -2.5%, small text -0.5% to 0."
        : "Same letter-spacing at every size.",
  },
  {
    id: "numerals",
    t: "Numbers",
    src: "Impeccable, break-ui",
    repo: "both",
    why: "Proportional figures make columns of prices wobble and make counters jitter as they change. Tabular figures line up.",
    opts: [
      { l: "Proportional", v: "normal" },
      { l: "Tabular", v: "tabular-nums" },
    ],
    def: 1,
    demo: (s, o) =>
      `<div style="display:inline-grid;gap:2px;text-align:right;font-variant-numeric:${o.v};font-size:15px">${["£18,000.00", "£1,111.11", "£9,999.99", "£418.70"].map((x) => `<span>${x}</span>`).join("")}</div>`,
    css: (s, o) => `font-variant-numeric: ${o.v};`,
    tw: (s, o) => (o.v === "normal" ? "normal-nums" : "tabular-nums"),
  },
  {
    id: "text-wrap",
    t: "Line breaks",
    src: "Web platform",
    repo: "both",
    why: "Browsers can now balance headings across lines and avoid a lonely last word in paragraphs. It costs one line of CSS.",
    opts: [
      { l: "Browser default", v: ["wrap", "wrap"] },
      { l: "Balance headings, pretty text", v: ["balance", "pretty"] },
    ],
    def: 1,
    demo: (s, o) =>
      `<div style="max-width:300px"><div style="font-size:24px;font-weight:520;letter-spacing:-.03em;line-height:1.1;text-wrap:${o.v[0]}">A four-week sprint for booking flows that leak</div><p style="margin:8px 0 0;color:#5c5c5c;text-wrap:${o.v[1]}">I map where people drop off and redesign the steps that leak them.</p></div>`,
    css: (s, o) =>
      `h1, h2, h3 { text-wrap: ${o.v[0]}; }\np { text-wrap: ${o.v[1]}; }`,
    tw: (s, o) =>
      o.v[0] === "balance" ? "text-balance / text-pretty" : "none",
  },
  {
    id: "labels",
    t: "Small labels",
    src: "frontend-design, no AI tells",
    repo: "both",
    why: "Tracked-out capitals above everything is the most common template tell. Sentence case at the interface size reads as written by a person.",
    opts: [
      { l: "Sentence case", v: "s" },
      { l: "Tracked capitals", v: "c", n: "A tell. You have banned it." },
      {
        l: "Small mono",
        v: "m",
        n: "Only where the content is code or measurement.",
      },
    ],
    demo: (s, o) => {
      const st = {
        s: "font-size:12px;color:#737373",
        c: "font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#737373;font-weight:500",
        m: "font:400 11px var(--mono);color:#737373",
      }[o.v];
      return `<div style="display:grid;grid-template-columns:repeat(3,auto);gap:4px 32px;width:max-content">${["Role", "Year", "Result"].map((x) => `<span style="${st}">${x}</span>`).join("")}<span>Product design</span><span>2026</span><span>Conversion up 5%</span></div>`;
    },
  },
  {
    id: "font-loading",
    t: "How web fonts arrive",
    src: "Vercel, web.dev",
    repo: "perf",
    kind: "Invisible",
    why: "Between request and arrival the browser shows nothing, a fallback, or the real face. The worst outcome is text that jumps when the font swaps in.",
    opts: [
      {
        l: "Block",
        v: "block",
        c: 2,
        n: "Text is invisible until the font arrives.",
      },
      { l: "Swap", v: "swap", c: 1, n: "Fallback first, then a visible jump." },
      {
        l: "Swap, matched fallback",
        v: "match",
        c: 0,
        n: "Fallback is resized to the real font's metrics, so the swap does not move anything.",
      },
      {
        l: "Optional",
        v: "optional",
        c: 0,
        n: "If the font is not there in about 100ms, this visit keeps the fallback.",
      },
    ],
    def: 2,
    demo: (s, o) => {
      const seg = {
        block: [
          [
            "Invisible",
            40,
            "repeating-linear-gradient(45deg,#eee 0 4px,#fafafa 4px 8px)",
          ],
          ["Real font", 60, "#1d1d1f"],
        ],
        swap: [
          ["Fallback", 40, "#c8c8c8"],
          ["Jump", 4, "#b42318"],
          ["Real font", 56, "#1d1d1f"],
        ],
        match: [
          ["Fallback", 40, "#c8c8c8"],
          ["Real font", 60, "#1d1d1f"],
        ],
        optional: [["Fallback for this visit", 100, "#c8c8c8"]],
      }[o.v];
      return `<div style="font-size:12px;color:#737373;display:flex;justify-content:space-between;margin-bottom:6px"><span>0s</span><span>Font arrives at 1.2s</span><span>3s</span></div><div style="display:flex;height:28px;border-radius:6px;overflow:hidden;border:1px solid #e8e8e8">${seg.map((x) => `<div title="${x[0]}" style="width:${x[1]}%;background:${x[2]}"></div>`).join("")}</div><div style="display:flex;gap:14px;margin-top:8px;font-size:12px;color:#5c5c5c">${seg.map((x) => `<span>${x[0]}</span>`).join("")}</div>`;
    },
    css: (s, o) =>
      o.v === "match"
        ? `@font-face {\n  font-family: "Inter Fallback";\n  src: local("Arial");\n  size-adjust: 107%;\n  ascent-override: 90%;\n}\nfont-display: swap;`
        : `font-display: ${o.v};`,
    rule: () =>
      "Self-host one variable woff2, subset to the characters you use, preload it, and give the fallback matched metrics. next/font does this for you.",
  },
  {
    id: "paragraph-rhythm",
    t: "Paragraph breaks",
    src: "Impeccable",
    repo: "both",
    why: "Either a space between paragraphs or an indent on the first line. Both at once marks the same boundary twice.",
    opts: [
      { l: "Space between", v: "space" },
      { l: "Indent", v: "indent" },
      { l: "Both", v: "both", n: "Double-marked." },
    ],
    demo: (s, o) =>
      [
        SAMPLE,
        "Each change is ranked by how much it should move conversion.",
        "Your team keeps the files.",
      ]
        .map(
          (p, i) =>
            `<p style="margin:${o.v !== "indent" && i ? "0.75em" : "0"} 0 0;text-indent:${o.v !== "space" && i ? "1.5em" : "0"};color:#5c5c5c;max-width:58ch">${p}</p>`,
        )
        .join(""),
    css: (s, o) =>
      o.v === "space"
        ? "p + p { margin-top: 0.75em; }"
        : o.v === "indent"
          ? "p + p { text-indent: 1.5em; }"
          : "p + p { margin-top: 0.75em; text-indent: 1.5em; }",
  },
]);

area(
  "shape",
  "Space and shape",
  "Spacing, column width, corners and how one surface separates from the next.",
);
add("shape", [
  {
    id: "spacing-unit",
    t: "Spacing unit",
    src: "Impeccable",
    repo: "both",
    why: "A 4px base gives the useful in-between steps an 8px-only scale misses. Fluid spacing grows with the viewport but is harder to reason about.",
    opts: [
      { l: "4px", v: 4 },
      { l: "8px", v: 8 },
      { l: "Fluid", v: 0 },
    ],
    demo: (s, o) => {
      const steps = o.v
        ? [1, 2, 3, 4, 6, 8, 12, 16].map((n) => n * o.v).filter((v) => v <= 128)
        : [
            "clamp(4px,0.5vw,6px)",
            "clamp(8px,1vw,12px)",
            "clamp(16px,2vw,24px)",
            "clamp(24px,3vw,40px)",
            "clamp(40px,5vw,72px)",
          ];
      return steps
        .map(
          (v) =>
            `<div style="display:flex;align-items:center;gap:12px;margin:3px 0"><span style="width:150px;color:#737373;font-size:12px;font-variant-numeric:tabular-nums">${typeof v === "number" ? v + "px" : v}</span><span style="height:10px;width:${v}${typeof v === "number" ? "px" : ""};background:#1d1d1f;border-radius:2px"></span></div>`,
        )
        .join("");
    },
    css: (s, o) =>
      o.v
        ? [1, 2, 3, 4, 6, 8, 12, 16]
            .map((n) => `--space-${n}: ${n * o.v}px;`)
            .join("\n")
        : "--space-s: clamp(8px, 1vw, 12px);\n--space-m: clamp(16px, 2vw, 24px);\n--space-l: clamp(40px, 5vw, 72px);",
    tw: (s, o) =>
      o.v === 4
        ? "Tailwind's default spacing is already a 4px scale."
        : o.v === 8
          ? "spacing: { 1: '8px', 2: '16px', 3: '24px', ... }"
          : "Use arbitrary clamp() values or a fluid plugin.",
  },
  {
    id: "density",
    t: "Density",
    src: "Impeccable",
    repo: "both",
    why: "How much sits in a region should follow how often it is used. Tools used all day can be dense; a portfolio can breathe.",
    dials: [["d", "Density", 0.5, 1.6, 0.05, 1, "×"]],
    demo: (s) =>
      ["makeEbook", "coverly", "Spark", "DoodleWire"]
        .map(
          (x, i) =>
            `<div style="display:flex;justify-content:space-between;padding:${10 * s.d.d}px 0;${i ? "border-top:1px solid #ececec" : ""}"><span style="font-weight:500">${x}</span><span style="color:#737373;font-size:13px">View</span></div>`,
        )
        .join(""),
    css: (s) => `--row-pad: ${+(10 * s.d.d).toFixed(1)}px;`,
  },
  {
    id: "column",
    t: "Content column",
    src: "neilmcardle.com",
    repo: "both",
    flush: true,
    why: "A narrow column makes everything inside it, video included, feel smaller and more precise.",
    dials: [["w", "Column width", 400, 900, 4, 648, "px"]],
    hint: "Drawn as a 1440px screen, scaled down. 648 is the performance-ui column.",
    demo: (s) =>
      `<div style="padding:18px;background:#f3f3f3"><div style="aspect-ratio:1440/560;background:#fafafa;border:1px solid #e8e8e8;border-radius:6px;display:flex;justify-content:center;padding-top:4%"><div style="width:${(s.d.w / 1440) * 100}%"><div style="height:10px;width:40%;background:#1d1d1f;border-radius:2px;margin-bottom:8px"></div>${bars(2)}<div style="aspect-ratio:16/9;background:#e3e3e3;border-radius:4px;margin-top:10px"></div></div></div></div>`,
    css: (s) => `max-width: ${s.d.w}px;`,
    tw: (s) => `max-w-[${s.d.w}px]`,
  },
  {
    id: "section-gap",
    t: "Space between sections",
    src: "Impeccable craft floor",
    repo: "both",
    why: "Tight inside groups, generous between them, and more space above a heading than below it, so the heading belongs to what follows.",
    dials: [
      ["gap", "Section gap", 24, 160, 4, 72, "px"],
      ["above", "Above heading", 8, 64, 2, 32, "px"],
      ["below", "Below heading", 2, 32, 1, 10, "px"],
    ],
    hint: "Shown at half size.",
    demo: (s) =>
      `<div style="zoom:.5"><div style="font-size:26px;font-weight:520;letter-spacing:-.03em">Work</div>${bars(3)}<div style="height:${s.d.gap}px"></div><div style="border-top:1px solid #e8e8e8;padding-top:${s.d.above}px"><div style="font-size:26px;font-weight:520;letter-spacing:-.03em;margin-bottom:${s.d.below}px">Playground</div>${bars(3)}</div></div>`,
    css: (s) =>
      `section + section { margin-top: ${s.d.gap}px; }\nh2 { margin: ${s.d.above}px 0 ${s.d.below}px; }`,
  },
  {
    id: "radius",
    t: "Corner radius",
    src: "neilmcardle.com, Impeccable",
    repo: "both",
    why: "One radius on everything is a template tell. Radius should follow size: small controls get small corners, big surfaces get bigger ones, and buttons can be pills.",
    opts: [
      { l: "Pill buttons", v: "pill" },
      { l: "Buttons match cards", v: "match" },
      { l: "Square buttons", v: "square" },
    ],
    dials: [
      ["r", "Card radius", 0, 28, 1, 10, "px"],
      ["ri", "Input radius", 0, 16, 1, 8, "px"],
    ],
    demo: (s, o) => {
      const br = o.v === "pill" ? 999 : o.v === "match" ? s.d.r : 0;
      return `<div style="max-width:320px;border:1px solid #e8e8e8;border-radius:${s.d.r}px;padding:14px"><div style="aspect-ratio:16/7;background:#ececec;border-radius:${Math.max(0, s.d.r - 6)}px"></div><input placeholder="Email" style="width:100%;margin:12px 0 8px;height:36px;padding:0 10px;border:1px solid #e0e0e0;border-radius:${s.d.ri}px"><button style="height:36px;padding:0 16px;border:0;border-radius:${br}px;background:#1d1d1f;color:#fff;font-size:13px">Book a call</button></div>`;
    },
    css: (s, o) =>
      `--radius-card: ${s.d.r}px;\n--radius-input: ${s.d.ri}px;\n--radius-button: ${o.v === "pill" ? "999px" : o.v === "match" ? s.d.r + "px" : "0"};`,
    tw: (s, o) =>
      `rounded-[${s.d.r}px] / rounded-[${s.d.ri}px] / ${o.v === "pill" ? "rounded-full" : o.v === "match" ? `rounded-[${s.d.r}px]` : "rounded-none"}`,
  },
  {
    id: "nested-radius",
    t: "Nested corners",
    src: "General practice",
    repo: "both",
    why: "When a rounded thing sits inside another, the outer radius should equal the inner radius plus the gap. Matching radii look pinched at the corners.",
    opts: [
      { l: "Outer = inner + gap", v: true },
      { l: "Same radius", v: false },
    ],
    dials: [
      ["r", "Inner radius", 4, 20, 1, 10, "px"],
      ["p", "Gap", 2, 16, 1, 6, "px"],
    ],
    demo: (s, o) =>
      `<div style="display:inline-block;padding:${s.d.p}px;border-radius:${o.v ? s.d.r + s.d.p : s.d.r}px;background:#ececec"><div style="width:220px;height:90px;border-radius:${s.d.r}px;background:#1d1d1f"></div></div>`,
    css: (s, o) =>
      `.outer { border-radius: ${o.v ? s.d.r + s.d.p : s.d.r}px; padding: ${s.d.p}px; }\n.inner { border-radius: ${s.d.r}px; }`,
  },
  {
    id: "separation",
    t: "How surfaces separate",
    src: "Apple",
    repo: "both",
    flush: true,
    why: "Hairlines, shadows, a change of tint, or nothing but space. Each says something different about how much a thing stands apart.",
    opts: [
      { l: "Hairline", v: "line" },
      { l: "Soft shadow", v: "shadow" },
      { l: "Layered shadow", v: "layered", c: 1 },
      { l: "Tint", v: "tint" },
      { l: "Space only", v: "space" },
    ],
    demo: (s, o) => {
      const st = {
        line: "background:#fff;border:1px solid #e8e8e8",
        shadow: "background:#fff;box-shadow:0 6px 20px rgb(0 0 0/.07)",
        layered:
          "background:#fff;box-shadow:0 0 0 1px rgb(0 0 0/.05),0 1px 2px rgb(0 0 0/.04),0 6px 16px rgb(0 0 0/.06)",
        tint: "background:#efefef",
        space: "background:transparent",
      }[o.v];
      return `<div style="display:flex;gap:16px;padding:24px;background:#fafafa;flex-wrap:wrap">${["makeEbook", "coverly", "Spark"].map((x) => `<div style="flex:1;min-width:120px;padding:14px;border-radius:10px;${st}"><div style="font-weight:550;font-size:14px">${x}</div><div style="font-size:12px;color:#737373">Product</div></div>`).join("")}</div>`;
    },
    css: (s, o) =>
      ({
        line: "border: 1px solid var(--line);",
        shadow: "box-shadow: 0 6px 20px rgb(0 0 0 / .07);",
        layered:
          "box-shadow: 0 0 0 1px rgb(0 0 0 / .05), 0 1px 2px rgb(0 0 0 / .04), 0 6px 16px rgb(0 0 0 / .06);",
        tint: "background: #efefef;",
        space: "/* gap only */",
      })[o.v],
  },
  {
    id: "shadow",
    t: "Shadow recipe",
    src: "Impeccable craft floor",
    repo: "looks",
    flush: true,
    why: "Real shadows have an offset and a soft blur. A zero-offset glow is decoration, and a hard offset block shadow is a costume.",
    opts: [
      { l: "Single", v: "single" },
      { l: "Layered", v: "layered" },
      { l: "Ring and shadow", v: "ring" },
    ],
    dials: [
      ["y", "Offset", 0, 24, 1, 8, "px"],
      ["b", "Blur", 0, 60, 1, 24, "px"],
      ["a", "Strength", 0, 0.3, 0.01, 0.08, ""],
    ],
    demo: (s, o) =>
      `<div style="padding:36px;background:#fafafa"><div style="max-width:300px;padding:18px;border-radius:12px;background:#fff;box-shadow:${shadowOf(s, o)}"><div style="font-weight:550">${SHORT}</div><div style="font-size:13px;color:#737373">A raised card.</div></div></div>`,
    css: (s, o) => `box-shadow: ${shadowOf(s, o)};`,
    tw: (s, o) => `shadow-[${shadowOf(s, o).replace(/ /g, "_")}]`,
  },
  {
    id: "image-ring",
    t: "Image edges",
    src: "neilmcardle.com",
    repo: "both",
    why: "A white screenshot on a white page has no edge. A faint inner ring finds the edge without drawing a border around the work.",
    opts: [
      { l: "Nothing", v: "none" },
      { l: "Inner ring", v: "ring", n: "Yours: 1px at 6% black." },
      { l: "Border", v: "border" },
    ],
    def: 1,
    demo: (s, o) =>
      `<div style="max-width:360px;aspect-ratio:16/9;border-radius:10px;background:#fff;padding:16px;${o.v === "ring" ? "box-shadow:0 0 0 1px rgb(0 0 0/.06)" : o.v === "border" ? "border:1px solid #d4d4d4" : ""}"><div style="height:8px;width:30%;background:#e33;border-radius:2px;opacity:.7"></div>${bars(4)}</div>`,
    css: (s, o) =>
      ({
        none: "/* none */",
        ring: "box-shadow: 0 0 0 1px rgb(0 0 0 / .06);",
        border: "border: 1px solid #d4d4d4;",
      })[o.v],
  },
  {
    id: "dividers",
    t: "Divider style",
    src: "neilmcardle.com",
    repo: "both",
    why: "Solid lines separate. Dashed lines separate more quietly, which suits steps within one group. A fade suggests the list goes on.",
    opts: [
      { l: "Solid", v: "solid" },
      { l: "Dashed", v: "dashed" },
      { l: "Fading", v: "fade" },
    ],
    demo: (s, o) =>
      ["Week 1, audit", "Weeks 2 to 3, redesign", "Week 4, test plan"]
        .map(
          (x, i) =>
            `<div style="padding:10px 0;${i ? (o.v === "fade" ? "border-top:1px solid;border-image:linear-gradient(90deg,#e0e0e0,transparent) 1" : `border-top:1px ${o.v} #e0e0e0`) : ""}">${x}</div>`,
        )
        .join(""),
    css: (s, o) =>
      o.v === "fade"
        ? "border-top: 1px solid;\nborder-image: linear-gradient(90deg, var(--line), transparent) 1;"
        : `border-top: 1px ${o.v} var(--line);`,
  },
]);
function shadowOf(s, o) {
  const a = s.d.a;
  if (o.v === "layered")
    return `0 1px 2px rgb(0 0 0 / ${+(a * 0.6).toFixed(3)}), 0 ${Math.round(s.d.y / 2)}px ${Math.round(s.d.b / 2)}px rgb(0 0 0 / ${+(a * 0.6).toFixed(3)}), 0 ${s.d.y}px ${s.d.b}px rgb(0 0 0 / ${a})`;
  if (o.v === "ring")
    return `0 0 0 1px rgb(0 0 0 / 0.06), 0 ${s.d.y}px ${s.d.b}px rgb(0 0 0 / ${a})`;
  return `0 ${s.d.y}px ${s.d.b}px rgb(0 0 0 / ${a})`;
}

area(
  "icons",
  "Icons and imagery",
  "Drawn marks, product shots and what shows while images load.",
);
add("icons", [
  {
    id: "icon-style",
    t: "Icon style",
    src: "Impeccable craft floor",
    repo: "both",
    why: "One stroke weight and one style across every icon. Mixed sets look assembled rather than drawn.",
    opts: [
      { l: "Outline 1.5", v: [1.5, false] },
      { l: "Outline 2", v: [2, false] },
      { l: "Filled", v: [1.8, true] },
    ],
    demo: (s, o) =>
      `<div style="display:flex;gap:22px;color:#1d1d1f">${["search", "bell", "heart", "user", "plus"].map((n) => icon(n, { size: 24, stroke: o.v[0], fill: o.v[1] })).join("")}</div>`,
    css: (s, o) =>
      `stroke-width: ${o.v[0]};${o.v[1] ? "\nfill: currentColor;" : ""}`,
  },
  {
    id: "icon-size",
    t: "Icon size",
    src: "General practice",
    repo: "both",
    why: "Icons that match the cap height read as part of the line, not stickers on it.",
    dials: [["sz", "Icon size", 12, 28, 1, 16, "px"]],
    demo: (s) =>
      `<div style="display:flex;gap:18px;align-items:center;font-size:13px;font-weight:450">${[
        ["search", "Search"],
        ["bell", "Updates"],
        ["user", "Account"],
      ]
        .map(
          ([n, t]) =>
            `<span style="display:inline-flex;align-items:center;gap:6px">${icon(n, { size: s.d.sz })}${t}</span>`,
        )
        .join(
          "",
        )}<span style="display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 12px;border-radius:999px;background:#1d1d1f;color:#fff">${icon("plus", { size: s.d.sz, stroke: 2 })}New</span></div>`,
    css: (s) => `width: ${s.d.sz}px;\nheight: ${s.d.sz}px;`,
    tw: (s) => `size-[${s.d.sz}px]`,
  },
  {
    id: "product-shots",
    t: "How product shots are shown",
    src: "General practice",
    repo: "looks",
    why: "A product drawn at real size reads as a working tool. Device frames say mobile. Full-bleed says mood.",
    opts: [
      { l: "Real size, flat", v: "flat" },
      { l: "Framed with radius", v: "framed" },
      { l: "Device frame", v: "device" },
      { l: "Full-bleed", v: "bleed" },
    ],
    demo: (s, o) => {
      const ui = `<div style="padding:12px;background:#fff;height:100%">${bars(5)}</div>`;
      const m = {
        flat: `<div style="width:62%;margin:20px auto 0;height:130px;box-shadow:0 0 0 1px rgb(0 0 0/.08),0 12px 30px rgb(0 0 0/.08);border-radius:6px;overflow:hidden">${ui}</div>`,
        framed: `<div style="margin:16px;height:130px;border-radius:14px;background:#ececec;padding:14px"><div style="height:100%;border-radius:6px;overflow:hidden">${ui}</div></div>`,
        device: `<div style="width:96px;height:150px;margin:6px auto;border-radius:20px;background:#1d1d1f;padding:6px"><div style="height:100%;border-radius:15px;overflow:hidden">${ui}</div></div>`,
        bleed: `<div style="height:164px;background:linear-gradient(135deg,#3b4252,#8a7f72)"></div>`,
      }[o.v];
      return frame(m, 164);
    },
  },
  {
    id: "image-placeholder",
    t: "While images load",
    src: "Vercel, web.dev",
    repo: "both",
    play: true,
    why: "Something should hold the space so nothing jumps. A flat colour is free; a blurred preview is nicer but costs a few bytes per image.",
    opts: [
      { l: "Nothing", v: "none", n: "The box collapses or pops in." },
      { l: "Flat colour", v: "flat", c: 0 },
      { l: "Blurred preview", v: "blur", c: 1 },
      { l: "Shimmer", v: "shimmer", c: 1 },
    ],
    def: 1,
    demo: (s, o) => {
      const ph = {
        none: "background:transparent",
        flat: "background:#d9d6d0",
        blur: "background:linear-gradient(135deg,#9aa4b2,#c9b8a6);filter:blur(12px);transform:scale(1.1)",
        shimmer: "",
      }[o.v];
      return `<div style="position:relative;width:min(100%,360px);aspect-ratio:16/9;border-radius:10px;overflow:hidden"><div class="${o.v === "shimmer" ? "d-shimmer" : ""}" style="position:absolute;inset:0;${ph}"></div><div style="position:absolute;inset:0;background:linear-gradient(135deg,#5b6b82,#b9967a);animation:d-fade 400ms ease-out 1.2s both"></div></div>`;
    },
    css: (s, o) =>
      ({
        none: "/* none */",
        flat: "background: var(--dominant-colour);\naspect-ratio: 16 / 9;",
        blur: 'next/image placeholder="blur" with blurDataURL',
        shimmer:
          "background: linear-gradient(90deg, #eee 25%, #f6f6f6 50%, #eee 75%);\nbackground-size: 200% 100%;\nanimation: shimmer 1.2s linear infinite;",
      })[o.v],
  },
  {
    id: "emoji-icons",
    t: "Emoji standing in for icons",
    src: "Impeccable craft floor",
    repo: "both",
    why: "Emoji and unicode glyphs render differently on every platform and never match the type. Icons should be drawn, in one weight.",
    opts: [
      { l: "Drawn icons only", v: "draw" },
      { l: "Emoji are fine", v: "emoji" },
    ],
    demo: (s, o) =>
      `<div style="display:grid;gap:8px;font-size:14px">${[
        ["check", "✅", "Saved to your library"],
        ["bell", "🔔", "Two new comments"],
        ["heart", "❤️", "Liked by 12 readers"],
      ]
        .map(
          ([n, e, t]) =>
            `<div style="display:flex;align-items:center;gap:8px">${o.v === "draw" ? icon(n, { size: 16 }) : `<span>${e}</span>`}${t}</div>`,
        )
        .join("")}</div>`,
  },
]);
