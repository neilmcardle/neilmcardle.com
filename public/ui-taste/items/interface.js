area(
  "primitives",
  "Buttons, links and inputs",
  "The pieces people touch most, so the ones where small details add up fastest.",
);
add("primitives", [
  {
    id: "button-shape",
    t: "Button shape and size",
    src: "neilmcardle.com",
    repo: "both",
    why: "Small, exact controls next to big type are what make a page feel precise.",
    opts: [
      { l: "Pill", v: 999 },
      { l: "Rounded", v: 8 },
      { l: "Square", v: 0 },
    ],
    dials: [
      ["h", "Height", 28, 52, 1, 40, "px"],
      ["px", "Side padding", 10, 28, 1, 18, "px"],
      ["fs", "Text", 12, 16, 0.5, 14, "px"],
    ],
    demo: (s, o) =>
      `<div style="display:flex;gap:10px;flex-wrap:wrap"><button style="height:${s.d.h}px;padding:0 ${s.d.px}px;border:0;border-radius:${o.v}px;background:#1d1d1f;color:#fff;font-size:${s.d.fs}px;font-weight:500">Book a call</button><button style="height:${s.d.h}px;padding:0 ${s.d.px}px;border:1px solid #e0e0e0;border-radius:${o.v}px;background:#fff;font-size:${s.d.fs}px;font-weight:500">One-page offer</button></div>`,
    css: (s, o) =>
      `height: ${s.d.h}px;\npadding: 0 ${s.d.px}px;\nborder-radius: ${o.v}px;\nfont-size: ${s.d.fs}px;\nfont-weight: 500;`,
    tw: (s, o) =>
      `h-[${s.d.h}px] px-[${s.d.px}px] text-[${s.d.fs}px] font-medium ${o.v === 999 ? "rounded-full" : `rounded-[${o.v}px]`}`,
    spec: (s, o) =>
      `Button H ${s.d.h}, padding 0 ${s.d.px}, radius ${o.v === 999 ? "full" : o.v}, Inter ${s.d.fs}/500`,
  },
  {
    id: "button-hierarchy",
    t: "Button hierarchy",
    src: "Apple, Impeccable",
    repo: "both",
    why: "The primary action should be findable in a second. Secondary and tertiary actions step down in weight, not just in colour.",
    opts: [
      { l: "Filled, outline, text", v: "outline" },
      { l: "Filled, tint, text", v: "tint" },
      { l: "Filled, then text links", v: "text" },
    ],
    demo: (s, o) => {
      const sec = {
        outline: "background:#fff;border:1px solid #e0e0e0",
        tint: "background:#f0f0f0;border:1px solid transparent",
        text: "background:none;border:0;text-decoration:underline;text-underline-offset:3px;padding:0",
      }[o.v];
      return `<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><button style="height:36px;padding:0 16px;border:0;border-radius:999px;background:#1d1d1f;color:#fff;font-size:13px;font-weight:500">Continue to payment</button><button style="height:36px;padding:0 16px;border-radius:999px;font-size:13px;font-weight:500;${sec}">Change dates</button><button style="height:36px;padding:0 8px;border:0;background:none;color:#737373;font-size:13px">Cancel</button></div>`;
    },
  },
  {
    id: "press",
    t: "Press feedback",
    src: "Emil Kowalski, Apple",
    repo: "both",
    kind: "Motion",
    why: "Feedback the instant a finger lands tells people the interface heard them. It should start on press, not on release.",
    hint: "Press and hold the button.",
    opts: [
      { l: "Shrink", v: "scale" },
      { l: "Darken", v: "darken" },
      { l: "Nudge down", v: "nudge" },
      { l: "Nothing", v: "none" },
    ],
    dials: [
      ["s", "Shrink to", 0.9, 1, 0.005, 0.97, ""],
      ["dur", "Duration", 60, 300, 10, 160, "ms"],
    ],
    demo: (s, o) =>
      `<button class="d-press" data-m="${o.v}" style="--s:${s.d.s};--dur:${s.d.dur}ms;height:44px;padding:0 22px;border:0;border-radius:999px;background:#1d1d1f;color:#fff;font-size:14px;font-weight:500">Book a 30-minute call</button>`,
    css: (s, o) =>
      ({
        scale: `transition: transform ${s.d.dur}ms ease-out;\n&:active { transform: scale(${s.d.s}); }`,
        darken: `transition: filter ${s.d.dur}ms ease-out;\n&:active { filter: brightness(.82); }`,
        nudge: `transition: transform ${s.d.dur}ms ease-out;\n&:active { transform: translateY(1px); }`,
        none: "/* none */",
      })[o.v],
    tw: (s, o) =>
      o.v === "scale"
        ? `transition-transform duration-[${s.d.dur}ms] ease-out active:scale-[${s.d.s}]`
        : o.v === "darken"
          ? "active:brightness-[.82]"
          : o.v === "nudge"
            ? "active:translate-y-px"
            : "none",
  },
  {
    id: "cta-arrows",
    t: "Arrows on buttons and links",
    src: "frontend-design, coverly",
    repo: "both",
    why: "An arrow after every call to action is a template habit. The label should say where it goes.",
    opts: [
      { l: "No arrows", v: "none", n: "The coverly rule." },
      { l: "Arrow after the text", v: "static" },
      { l: "Arrow moves on hover", v: "move" },
    ],
    demo: (s, o) =>
      `<style>.d-arw svg{transition:transform 200ms var(--ease)}@media (hover:hover){.d-arw[data-m=move]:hover svg{transform:translateX(3px)}}</style><div style="display:flex;gap:20px;align-items:center"><button class="d-arw" data-m="${o.v}" style="display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 16px;border:0;border-radius:999px;background:#1d1d1f;color:#fff;font-size:13px;font-weight:500">Read the case study${o.v === "none" ? "" : icon("arrow", { size: 14, stroke: 2 })}</button><a class="d-arw" data-m="${o.v}" style="display:inline-flex;align-items:center;gap:4px;font-size:14px;text-decoration:underline;text-underline-offset:3px">See all work${o.v === "none" ? "" : icon("arrow", { size: 13, stroke: 2 })}</a></div>`,
  },
  {
    id: "hover-gating",
    t: "Hover only where there is a mouse",
    src: "Emil Kowalski, mobile-native",
    repo: "both",
    kind: "Invisible",
    why: "Phones fire hover on tap, so an ungated hover state sticks after you lift your finger. Wrapping hover in a pointer query fixes it everywhere.",
    opts: [
      { l: "Gate every hover", v: true },
      { l: "Plain :hover", v: false },
    ],
    css: (s, o) =>
      o.v
        ? "@media (hover: hover) and (pointer: fine) {\n  .card:hover { ... }\n}"
        : ".card:hover { ... }",
    tw: (s, o) =>
      o.v
        ? "Tailwind v4 gates hover: by default. On v3, set future.hoverOnlyWhenSupported."
        : "hover:",
  },
  {
    id: "links",
    t: "Link underlines",
    src: "neilmcardle.com",
    repo: "both",
    why: "A faint underline that darkens on hover keeps links findable without striping the paragraph. Offset keeps the line clear of descenders.",
    opts: [
      { l: "Faint, darkens on hover", v: "ink", n: "Yours." },
      { l: "Always solid", v: "solid" },
      { l: "Only on hover", v: "only" },
    ],
    dials: [
      ["lo", "Offset", 1, 8, 0.5, 3, "px"],
      ["lt", "Thickness", 1, 3, 0.5, 1, "px"],
      ["la", "Resting strength", 0.1, 1, 0.05, 0.25, ""],
    ],
    demo: (s, o) =>
      `<p style="margin:0;max-width:52ch;color:#5c5c5c">I redesigned a train booking flow, merging seats and extras into one step. <a href="#" onclick="return false" class="d-link" data-h="${o.v}" style="--lo:${s.d.lo}px;--lt:${s.d.lt}px;--lc:${o.v === "solid" ? "currentColor" : `rgb(29 29 31 / ${s.d.la})`}">Read the case study</a> or <a href="#" onclick="return false" class="d-link" data-h="${o.v}" style="--lo:${s.d.lo}px;--lt:${s.d.lt}px;--lc:${o.v === "solid" ? "currentColor" : `rgb(29 29 31 / ${s.d.la})`}">book a call</a>.</p>`,
    css: (s, o) =>
      `text-decoration: underline;\ntext-underline-offset: ${s.d.lo}px;\ntext-decoration-thickness: ${s.d.lt}px;\ntext-decoration-color: ${o.v === "solid" ? "currentColor" : o.v === "only" ? "transparent" : `rgb(29 29 31 / ${s.d.la})`};${o.v !== "solid" ? "\n&:hover { text-decoration-color: currentColor; }" : ""}`,
    tw: (s, o) =>
      `underline underline-offset-[${s.d.lo}px] decoration-[${s.d.lt}px] ${o.v === "solid" ? "" : o.v === "only" ? "decoration-transparent" : `decoration-black/${Math.round(s.d.la * 100)}`} hover:decoration-current`,
  },
  {
    id: "inputs",
    t: "Text fields",
    src: "Impeccable, mobile-native",
    repo: "both",
    why: "A field should look like a place to type. Boxed fields are the clearest; underline-only fields are elegant but easy to miss.",
    opts: [
      { l: "Boxed", v: "box" },
      { l: "Filled", v: "fill" },
      { l: "Underline", v: "line" },
    ],
    dials: [
      ["h", "Height", 32, 52, 1, 40, "px"],
      ["fs", "Text", 14, 18, 0.5, 16, "px"],
    ],
    hint: "Text below 16px makes iPhones zoom the page when the field is tapped.",
    demo: (s, o) => {
      const st = {
        box: "border:1px solid #dcdcdc;border-radius:8px;background:#fff",
        fill: "border:1px solid transparent;border-radius:8px;background:#f1f1f1",
        line: "border:0;border-bottom:1px solid #cfcfcf;border-radius:0;background:transparent;padding-left:0",
      }[o.v];
      return `<label style="display:grid;gap:6px;max-width:320px;font-size:13px;font-weight:450">Email<input placeholder="you@company.com" style="height:${s.d.h}px;padding:0 12px;font-size:${s.d.fs}px;${st}"><span style="color:#737373;font-weight:425;font-size:12px">For the booking confirmation.</span></label>`;
    },
    css: (s, o) =>
      `height: ${s.d.h}px;\nfont-size: ${s.d.fs}px;\n${{ box: "border: 1px solid #dcdcdc;\nborder-radius: 8px;", fill: "background: #f1f1f1;\nborder-radius: 8px;", line: "border-bottom: 1px solid #cfcfcf;" }[o.v]}`,
    tw: (s, o) =>
      `h-[${s.d.h}px] text-[${s.d.fs}px] ${{ box: "border border-neutral-300 rounded-lg", fill: "bg-neutral-100 rounded-lg", line: "border-b border-neutral-300" }[o.v]}`,
  },
  {
    id: "field-labels",
    t: "Where labels go",
    src: "Baymard, Impeccable",
    repo: "both",
    why: "A label above the field is always visible. A placeholder used as the label disappears the moment someone starts typing.",
    opts: [
      { l: "Above", v: "above" },
      { l: "Floating", v: "float" },
      { l: "Placeholder only", v: "ph", n: "The label vanishes as you type." },
    ],
    demo: (s, o) => {
      const f = (label, val) => {
        if (o.v === "above")
          return `<label style="display:grid;gap:6px;font-size:13px;font-weight:450">${label}<input value="${val}" placeholder="" style="height:40px;padding:0 12px;border:1px solid #dcdcdc;border-radius:8px;font-size:15px"></label>`;
        if (o.v === "float")
          return `<div style="position:relative;height:48px;border:1px solid #dcdcdc;border-radius:8px"><span style="position:absolute;left:12px;${val ? "top:6px;font-size:11px;color:#737373" : "top:14px;font-size:15px;color:#a3a3a3"}">${label}</span><input value="${val}" style="position:absolute;inset:auto 12px 6px;width:calc(100% - 24px);border:0;background:none;font-size:15px;height:22px"></div>`;
        return `<input value="${val}" placeholder="${label}" style="height:40px;padding:0 12px;border:1px solid #dcdcdc;border-radius:8px;font-size:15px;width:100%">`;
      };
      return `<div style="display:grid;gap:12px;max-width:320px">${f("Pick-up location", "Heathrow Terminal 5")}${f("Driver's age", "")}</div>`;
    },
  },
  {
    id: "validation",
    t: "When fields are checked",
    src: "Apple, Baymard",
    repo: "both",
    why: "Checking on every keystroke scolds people mid-word. Checking only on submit hides problems until the end. The usual best is to wait for the first blur, then update live.",
    hint: "Type a half-finished email, move out of the field, then fix it.",
    opts: [
      { l: "On submit", v: "submit" },
      { l: "When leaving the field", v: "blur" },
      {
        l: "After first leave, then live",
        v: "late",
        n: "Reward early, punish late.",
      },
      { l: "Every keystroke", v: "eager" },
    ],
    def: 2,
    demo: () =>
      `<form style="display:grid;gap:6px;max-width:320px" onsubmit="return false"><label style="font-size:13px;font-weight:450" for="vEmail">Email</label><input id="vEmail" style="height:40px;padding:0 12px;border:1px solid #dcdcdc;border-radius:8px;font-size:16px" autocomplete="off"><span data-msg style="min-height:18px;font-size:12.5px;color:#b42318"></span><button style="justify-self:start;height:36px;padding:0 16px;border:0;border-radius:999px;background:#1d1d1f;color:#fff;font-size:13px">Continue</button></form>`,
    mount: (el, s, o) => {
      const input = el.querySelector("input"),
        msg = el.querySelector("[data-msg]"),
        btn = el.querySelector("button");
      let touched = false;
      const ok = () => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(input.value);
      const show = (v) => {
        msg.textContent = v ? "" : "Enter an email like name@company.com";
        input.style.borderColor = v ? "#dcdcdc" : "#b42318";
      };
      input.addEventListener("input", () => {
        if (
          o.v === "eager" ||
          (o.v === "late" && touched) ||
          (msg.textContent && ok())
        )
          show(ok());
      });
      input.addEventListener("blur", () => {
        if (o.v === "blur" || o.v === "late") {
          touched = true;
          show(ok());
        }
      });
      btn.addEventListener("click", () => {
        touched = true;
        show(ok());
        if (ok()) {
          msg.style.color = "#1f7a4a";
          msg.textContent = "Looks good";
          setTimeout(() => (msg.style.color = "#b42318"), 1200);
        }
      });
    },
  },
  {
    id: "focus",
    t: "Keyboard focus",
    src: "Impeccable craft floor, WCAG",
    repo: "both",
    why: "Focus is how keyboard users see where they are. It should be as designed as hover, and only appear for keyboard use.",
    hint: "Click inside the box, then press Tab. The last row shows the ring without needing a keyboard.",
    opts: [
      { l: "Browser default", v: "default" },
      { l: "Ink outline", v: "ink", n: "Used on this page." },
      { l: "Soft glow", v: "accent" },
      { l: "Inset", v: "inset" },
    ],
    def: 1,
    demo: (s, o) =>
      `<div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center"><button class="d-ring" data-f="${o.v}" style="height:36px;padding:0 16px;border:0;border-radius:999px;background:#1d1d1f;color:#fff;font-size:13px">Continue</button><a href="#" onclick="return false" class="d-ring" data-f="${o.v}" style="font-size:14px;border-radius:3px">Change dates</a><input class="d-ring" data-f="${o.v}" placeholder="Promo code" style="height:36px;padding:0 10px;border:1px solid #dcdcdc;border-radius:8px;font-size:14px"></div><div style="margin-top:16px"><button class="d-ring is-f" data-f="${o.v}" tabindex="-1" style="height:36px;padding:0 16px;border:1px solid #e0e0e0;border-radius:999px;background:#fff;font-size:13px">Shown focused</button></div>`,
    css: (s, o) =>
      ({
        default: "/* browser default */",
        ink: ":focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }",
        accent:
          ":focus-visible { outline: none; box-shadow: 0 0 0 3px oklch(.62 .17 255 / .45); }",
        inset:
          ":focus-visible { outline: none; box-shadow: inset 0 0 0 2px var(--ink); }",
      })[o.v],
    tw: (s, o) =>
      ({
        default: "none",
        ink: "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900",
        accent: "focus-visible:ring-[3px] focus-visible:ring-blue-500/45",
        inset:
          "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-neutral-900",
      })[o.v],
  },
  {
    id: "toggles",
    t: "On and off controls",
    src: "Apple",
    repo: "both",
    kind: "Motion",
    why: "A switch means the change happens now. A checkbox means it happens when you save. Mixing them up confuses what the control does.",
    hint: "Click to toggle.",
    opts: [
      { l: "Switch", v: "switch" },
      { l: "Checkbox", v: "check" },
      { l: "Segmented", v: "seg" },
    ],
    dials: [["dur", "Movement", 60, 400, 10, 200, "ms"]],
    demo: (s, o) => {
      const ez = "cubic-bezier(.23,1,.32,1)";
      if (o.v === "switch")
        return `<button data-t aria-pressed="false" style="display:flex;align-items:center;gap:10px;border:0;background:none;font-size:14px"><span data-track style="position:relative;width:38px;height:22px;border-radius:999px;background:#d4d4d4;transition:background ${s.d.dur}ms ease"><span data-knob style="position:absolute;top:2px;left:2px;width:18px;height:18px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgb(0 0 0/.2);transition:transform ${s.d.dur}ms ${ez}"></span></span>Email me when prices drop</button>`;
      if (o.v === "check")
        return `<label style="display:flex;gap:8px;align-items:center;font-size:14px"><input type="checkbox" style="width:16px;height:16px;accent-color:#1d1d1f">Email me when prices drop</label>`;
      return `<div data-seg style="position:relative;display:inline-flex;padding:2px;border-radius:999px;background:#efefef;font-size:13px"><span data-pill style="position:absolute;top:2px;left:2px;height:28px;width:60px;border-radius:999px;background:#fff;box-shadow:0 1px 3px rgb(0 0 0/.12);transition:transform ${s.d.dur}ms ${ez}"></span><button data-i="0" style="position:relative;width:60px;height:28px;border:0;background:none">Off</button><button data-i="1" style="position:relative;width:60px;height:28px;border:0;background:none">On</button></div>`;
    },
    mount: (el, s, o) => {
      const b = el.querySelector("[data-t]");
      if (b)
        b.addEventListener("click", () => {
          const on = b.getAttribute("aria-pressed") !== "true";
          b.setAttribute("aria-pressed", on);
          b.querySelector("[data-knob]").style.transform = on
            ? "translateX(16px)"
            : "";
          b.querySelector("[data-track]").style.background = on
            ? "#1d1d1f"
            : "#d4d4d4";
        });
      el.querySelectorAll("[data-seg] button").forEach((x) =>
        x.addEventListener("click", () => {
          el.querySelector("[data-pill]").style.transform =
            `translateX(${x.dataset.i * 60}px)`;
        }),
      );
    },
  },
  {
    id: "tooltips",
    t: "Tooltips",
    src: "Emil Kowalski",
    repo: "both",
    kind: "Motion",
    why: "A short delay stops tooltips firing by accident. Once one is open, the next should appear instantly, so moving along a toolbar feels fast.",
    hint: "Hover one icon, then slide along the row.",
    opts: [
      { l: "Delay, then instant", v: "smart" },
      { l: "Delay every time", v: "always" },
      { l: "No delay", v: "none" },
    ],
    dials: [["delay", "First delay", 0, 1000, 50, 500, "ms"]],
    demo: () =>
      `<div style="display:flex;gap:6px;padding-top:28px">${[
        ["search", "Search"],
        ["bell", "Updates"],
        ["heart", "Saved"],
        ["user", "Account"],
      ]
        .map(
          ([n, t]) =>
            `<span data-tipwrap style="position:relative;display:inline-flex;width:36px;height:36px;align-items:center;justify-content:center;border-radius:8px;border:1px solid #e8e8e8">${icon(n, { size: 16 })}<span class="d-tip">${t}</span></span>`,
        )
        .join("")}</div>`,
    mount: (el, s, o) => {
      let timer,
        last = 0;
      el.querySelectorAll("[data-tipwrap]").forEach((w) => {
        const tip = w.querySelector(".d-tip");
        w.addEventListener("pointerenter", () => {
          const warm = o.v === "smart" && Date.now() - last < 400;
          const wait = o.v === "none" || warm ? 0 : s.d.delay;
          tip.classList.toggle("instant", warm);
          clearTimeout(timer);
          timer = setTimeout(() => tip.classList.add("on"), wait);
        });
        w.addEventListener("pointerleave", () => {
          clearTimeout(timer);
          if (tip.classList.contains("on")) last = Date.now();
          tip.classList.remove("on");
        });
      });
      return () => clearTimeout(timer);
    },
  },
  {
    id: "browser-surfaces",
    t: "Browser surfaces",
    src: "Impeccable craft floor",
    repo: "both",
    why: "The caret, scrollbars and native checkboxes ship in browser defaults unless you theme them. Theming them is cheap and almost nobody does.",
    checks: [
      "Caret in the ink colour",
      "Thin scrollbar in the page greys",
      "Native controls in the ink colour",
      "Text selection themed",
    ],
    demo: (s) =>
      `<div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start"><textarea style="width:220px;height:84px;padding:8px;border:1px solid #dcdcdc;border-radius:8px;font-size:14px;resize:none;${s.c[0] ? "caret-color:#1d1d1f;" : ""}${s.c[1] ? "scrollbar-width:thin;scrollbar-color:#cfcfcf transparent;" : ""}">Click in here to see the caret. ${SAMPLE}</textarea><div style="display:grid;gap:8px;font-size:14px;${s.c[2] ? "accent-color:#1d1d1f" : ""}"><label><input type="checkbox" checked> Free cancellation</label><label><input type="radio" checked> Pay now</label><input type="range"></div></div>`,
    css: (s) =>
      [
        s.c[0] && "caret-color: var(--ink);",
        s.c[1] &&
          "scrollbar-width: thin;\nscrollbar-color: #cfcfcf transparent;",
        s.c[2] && "accent-color: var(--ink);",
        s.c[3] && "::selection { background: var(--ink); color: #fff; }",
      ]
        .filter(Boolean)
        .join("\n") || "/* defaults */",
  },
]);

area(
  "motion",
  "Motion",
  "How things move, how fast, and when they should not move at all.",
);
const EASES = [
  { l: "ease", v: [0.25, 0.1, 0.25, 1] },
  { l: "ease-out", v: [0, 0, 0.58, 1] },
  {
    l: "Strong ease-out",
    v: [0.23, 1, 0.32, 1],
    n: "Emil's default for interface motion.",
  },
  {
    l: "Expo out",
    v: [0.16, 1, 0.3, 1],
    n: "Impeccable's natural deceleration.",
  },
  {
    l: "Strong ease-in-out",
    v: [0.77, 0, 0.175, 1],
    n: "For things that move across the screen.",
  },
  {
    l: "ease-in",
    v: [0.42, 0, 1, 1],
    n: "Starts slow, so it feels sluggish. Only for something heading into a hard stop.",
  },
  {
    l: "Ease out",
    v: [0.2, 0.8, 0, 1],
    n: "Derek Briggs's curve. Covers the distance early, then settles. Used on neilmcardle.com.",
  },
];
add("motion", [
  {
    id: "easing",
    t: "Default easing curve",
    src: "Emil Kowalski",
    repo: "both",
    kind: "Motion",
    play: true,
    why: "Easing is most of what makes motion feel right. A curve that starts fast responds at the moment people are watching most closely.",
    opts: EASES,
    def: 6,
    dials: [["dur", "Duration", 150, 1200, 10, 500, "ms"]],
    demo: (s, o) =>
      `<div style="display:flex;gap:24px;align-items:center;flex-wrap:wrap">${bezSvg(o.v)}<div style="flex:1;min-width:200px;container-type:inline-size"><div style="height:24px;border-radius:999px;background:#f3f3f3;position:relative"><span style="position:absolute;left:2px;top:2px;width:20px;height:20px;border-radius:50%;background:#1d1d1f;--dx:calc(100cqw - 24px);animation:d-move ${s.d.dur}ms cubic-bezier(${o.v.join(",")}) 200ms both"></span></div></div></div>`,
    css: (s, o) =>
      `--ease: cubic-bezier(${o.v.join(", ")});\ntransition: transform ${s.d.dur}ms var(--ease);`,
    tw: (s, o) =>
      `ease-[cubic-bezier(${o.v.join(",")})] duration-[${s.d.dur}ms]`,
    spec: (s, o) => `Figma: custom bezier ${o.v.join(", ")}, ${s.d.dur}ms`,
  },
  {
    id: "durations",
    t: "Duration by element",
    src: "Emil Kowalski",
    repo: "both",
    kind: "Motion",
    play: true,
    why: "Small things move fast and large things take a little longer. Interface motion should almost always finish under 300ms.",
    dials: [
      ["press", "Press", 60, 300, 10, 140, "ms"],
      ["tip", "Tooltip", 80, 300, 10, 150, "ms"],
      ["drop", "Dropdown", 100, 400, 10, 200, "ms"],
      ["modal", "Modal", 150, 600, 10, 300, "ms"],
    ],
    demo: (s) =>
      `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:16px;align-items:end">${[
        ["press", "Press", 40, 40],
        ["tip", "Tooltip", 70, 26],
        ["drop", "Dropdown", 120, 70],
        ["modal", "Modal", 150, 96],
      ]
        .map(
          ([k, l, w, h]) =>
            `<div><div style="width:${w}px;height:${h}px;border-radius:8px;background:#1d1d1f;animation:d-scale ${s.d[k]}ms cubic-bezier(.23,1,.32,1) 250ms both"></div><div style="margin-top:6px;font-size:12px;color:#737373">${l}, ${s.d[k]}ms</div></div>`,
        )
        .join("")}</div>`,
    css: (s) =>
      `--dur-press: ${s.d.press}ms;\n--dur-tooltip: ${s.d.tip}ms;\n--dur-dropdown: ${s.d.drop}ms;\n--dur-modal: ${s.d.modal}ms;`,
    tw: (s) =>
      `transitionDuration: { press: "${s.d.press}ms", tooltip: "${s.d.tip}ms", dropdown: "${s.d.drop}ms", modal: "${s.d.modal}ms" }`,
  },
  {
    id: "enter",
    t: "How things appear",
    src: "Emil Kowalski, Apple",
    repo: "both",
    kind: "Motion",
    play: true,
    why: "Nothing in the real world appears from nothing. A slight scale or rise with a fade reads as arriving; growing from zero reads as popping out of a hole.",
    opts: [
      { l: "Fade", v: "d-fade" },
      { l: "Fade and scale", v: "d-scale" },
      { l: "Fade and rise", v: "d-rise" },
      { l: "Blur in", v: "d-blur", c: 1 },
      { l: "Wipe", v: "d-clip" },
      {
        l: "Grow from zero",
        v: "zero",
        n: "Looks like it comes out of nowhere.",
      },
    ],
    def: 1,
    dials: [["dur", "Duration", 120, 800, 10, 260, "ms"]],
    demo: (s, o) =>
      `<style>@keyframes d-zero{from{transform:scale(0)}}</style><div style="max-width:300px;padding:16px;border-radius:12px;border:1px solid #e8e8e8;box-shadow:0 8px 24px rgb(0 0 0/.06);animation:${o.v === "zero" ? "d-zero" : o.v} ${s.d.dur}ms cubic-bezier(.23,1,.32,1) 250ms both"><div style="font-weight:550">Saved to your trip</div><div style="font-size:13px;color:#737373">Heathrow, 24 to 26 Oct</div></div>`,
    css: (s, o) =>
      ({
        "d-fade": "from { opacity: 0; }",
        "d-scale": "from { opacity: 0; transform: scale(.95); }",
        "d-rise": "from { opacity: 0; transform: translateY(8px); }",
        "d-blur":
          "from { opacity: 0; filter: blur(8px); transform: scale(.98); }",
        "d-clip": "from { clip-path: inset(0 0 100% 0); }",
        zero: "from { transform: scale(0); }",
      })[o.v] + `\nanimation: enter ${s.d.dur}ms cubic-bezier(.23, 1, .32, 1);`,
  },
  {
    id: "exit",
    t: "Leaving faster than arriving",
    src: "Emil Kowalski",
    repo: "both",
    kind: "Motion",
    why: "People wait for things to arrive but have already moved on when they leave. Exits should be quicker, and leave the way they came.",
    hint: "Toggle it a few times.",
    opts: [
      { l: "Exit faster", v: true },
      { l: "Same both ways", v: false },
    ],
    dials: [
      ["enter", "Enter", 150, 600, 10, 300, "ms"],
      ["ratio", "Exit as share of enter", 0.3, 1, 0.05, 0.6, "×"],
    ],
    demo: () =>
      `<button data-go style="height:32px;padding:0 14px;border:1px solid #e0e0e0;border-radius:999px;background:#fff;font-size:13px">Show</button><div data-panel style="margin-top:14px;max-width:300px;padding:14px;border-radius:12px;background:#1d1d1f;color:#fff;opacity:0;transform:translateY(8px)"><div style="font-weight:550">Two rooms left at this price</div><div style="font-size:13px;opacity:.7">Thursday 24 October</div></div>`,
    mount: (el, s, o) => {
      const p = el.querySelector("[data-panel]"),
        b = el.querySelector("[data-go]");
      let on = false;
      b.addEventListener("click", () => {
        on = !on;
        const d = on
          ? s.d.enter
          : Math.round(s.d.enter * (o.v ? s.d.ratio : 1));
        p.style.transition = `opacity ${d}ms ease-out, transform ${d}ms cubic-bezier(.23,1,.32,1)`;
        p.style.opacity = on ? 1 : 0;
        p.style.transform = on ? "none" : "translateY(8px)";
        b.textContent = on ? "Hide" : "Show";
      });
    },
    css: (s, o) =>
      `enter: ${s.d.enter}ms\nexit: ${Math.round(s.d.enter * (o.v ? s.d.ratio : 1))}ms`,
  },
  {
    id: "origin",
    t: "Menus grow from their button",
    src: "Emil Kowalski, Apple",
    repo: "both",
    kind: "Motion",
    why: "A menu that scales from the button that opened it shows where it came from. Modals are the exception; they belong to the whole screen, so they grow from the centre.",
    hint: "Open and close the menu.",
    opts: [
      { l: "From the trigger", v: "top left" },
      { l: "From the centre", v: "center" },
    ],
    demo: (s, o) =>
      `<div style="position:relative;height:170px"><button data-m style="height:32px;padding:0 14px;border:1px solid #e0e0e0;border-radius:999px;background:#fff;font-size:13px">Sort by</button><div data-menu style="position:absolute;top:40px;left:0;width:190px;padding:4px;border-radius:10px;border:1px solid #e8e8e8;background:#fff;box-shadow:0 10px 30px rgb(0 0 0/.1);transform-origin:${o.v};opacity:0;transform:scale(.92);transition:opacity 180ms ease-out,transform 180ms cubic-bezier(.23,1,.32,1);pointer-events:none">${["Lowest price", "Shortest trip", "Best rated"].map((x) => `<div style="padding:7px 10px;font-size:13px;border-radius:6px">${x}</div>`).join("")}</div></div>`,
    mount: (el) => {
      const m = el.querySelector("[data-menu]");
      let on = false;
      el.querySelector("[data-m]").addEventListener("click", () => {
        on = !on;
        m.style.opacity = on ? 1 : 0;
        m.style.transform = on ? "none" : "scale(.92)";
        m.style.pointerEvents = on ? "auto" : "none";
      });
    },
    css: (s, o) =>
      `transform-origin: ${o.v === "center" ? "center" : "var(--transform-origin) /* the trigger's side */"};`,
  },
  {
    id: "springs",
    t: "Springs",
    src: "Apple",
    repo: "both",
    kind: "Motion",
    play: true,
    why: "A spring has no fixed duration; it settles. Damping sets the overshoot and response sets the speed. Apple starts everything critically damped and adds bounce only after a flick.",
    dials: [
      ["z", "Damping", 0.4, 1.2, 0.05, 1, ""],
      ["r", "Response", 0.15, 0.8, 0.01, 0.35, "s"],
    ],
    demo: (s) => {
      const sp = spring(s.d.z, s.d.r);
      return `<div style="container-type:inline-size"><div style="height:24px;border-radius:999px;background:#f3f3f3;position:relative"><span style="position:absolute;left:2px;top:2px;width:20px;height:20px;border-radius:50%;background:#1d1d1f;--dx:calc(80cqw);animation:d-move ${sp.ms}ms ${sp.linear} 200ms both"></span></div><p style="margin:10px 0 0;font-size:12px;color:#737373">Settles in ${sp.ms}ms. ${s.d.z < 1 ? "Overshoots, then settles." : "No overshoot."}</p></div>`;
    },
    css: (s) => {
      const sp = spring(s.d.z, s.d.r);
      return `transition: transform ${sp.ms}ms ${sp.linear};`;
    },
    spec: (s) =>
      `Motion: { type: "spring", visualDuration: ${s.d.r}, bounce: ${Math.max(0, +(1 - s.d.z).toFixed(2))} }\nSwiftUI: .spring(response: ${s.d.r}, dampingFraction: ${s.d.z})`,
  },
  {
    id: "stagger",
    t: "Stagger",
    src: "Emil Kowalski",
    repo: "looks",
    kind: "Motion",
    play: true,
    why: "Items that arrive one after another feel more natural than a block appearing at once. Long gaps make the page feel slow, and nothing should wait for the stagger to finish.",
    dials: [
      ["gap", "Gap between items", 0, 150, 5, 40, "ms"],
      ["dur", "Each item", 150, 600, 10, 300, "ms"],
    ],
    demo: (s) =>
      ["makeEbook", "coverly", "Spark", "DoodleWire"]
        .map(
          (x, i) =>
            `<div style="padding:8px 0;border-top:${i ? "1px solid #eee" : "0"};animation:d-rise ${s.d.dur}ms cubic-bezier(.23,1,.32,1) ${200 + i * s.d.gap}ms both">${x}</div>`,
        )
        .join(""),
    css: (s) =>
      `animation: rise ${s.d.dur}ms cubic-bezier(.23, 1, .32, 1) both;\nanimation-delay: calc(var(--i) * ${s.d.gap}ms);`,
  },
  {
    id: "frequency",
    t: "Motion by how often it is seen",
    src: "Emil Kowalski",
    repo: "both",
    kind: "Motion",
    why: "Something used a hundred times a day should not animate at all. Raycast's menu has no open animation for that reason. Save delight for rare moments.",
    hint: "Open it repeatedly and notice how fast the animated one starts to feel slow.",
    opts: [
      { l: "By frequency", v: true },
      { l: "Same animation everywhere", v: false },
    ],
    demo: () =>
      `<button data-k style="height:32px;padding:0 14px;border:1px solid #e0e0e0;border-radius:999px;background:#fff;font-size:13px">Command menu</button><div data-pal style="margin-top:12px;max-width:320px;border-radius:12px;border:1px solid #e8e8e8;box-shadow:0 10px 30px rgb(0 0 0/.08);padding:8px;visibility:hidden"><div style="padding:8px;border-bottom:1px solid #eee;color:#a3a3a3;font-size:14px">Search bookings</div>${["Open Heathrow trip", "Change dates", "Add a driver"].map((x) => `<div style="padding:7px 8px;font-size:13px">${x}</div>`).join("")}</div>`,
    mount: (el, s, o) => {
      const p = el.querySelector("[data-pal]");
      let on = false;
      el.querySelector("[data-k]").addEventListener("click", () => {
        on = !on;
        p.style.visibility = on ? "visible" : "hidden";
        p.style.animation = on && !o.v ? "d-scale 400ms ease both" : "none";
      });
    },
    rule: (s, o) =>
      o.v
        ? "100+ times a day: no animation. Tens of times: barely any. Occasional: standard. Rare: room for delight. Never animate keyboard-triggered actions."
        : "Same animation regardless of frequency.",
  },
  {
    id: "interruptible",
    t: "Motion that can change its mind",
    src: "Emil Kowalski, Apple",
    repo: "both",
    kind: "Motion",
    why: "Transitions pick up from wherever an element is when you change direction. Keyframe animations restart from the beginning, so a quick double tap makes things jump.",
    hint: "Click twice quickly.",
    opts: [
      { l: "Transitions", v: "t" },
      { l: "Keyframes", v: "k" },
    ],
    demo: () =>
      `<style>@keyframes d-go{from{transform:translateX(0)}to{transform:translateX(var(--dx))}}@keyframes d-back{from{transform:translateX(var(--dx))}to{transform:translateX(0)}}</style><button data-tg style="height:32px;padding:0 14px;border:1px solid #e0e0e0;border-radius:999px;background:#fff;font-size:13px">Toggle</button><div style="margin-top:14px;container-type:inline-size;height:24px;border-radius:999px;background:#f3f3f3;position:relative"><span data-dot style="position:absolute;left:2px;top:2px;width:20px;height:20px;border-radius:50%;background:#1d1d1f;--dx:calc(100cqw - 24px)"></span></div>`,
    mount: (el, s, o) => {
      const d = el.querySelector("[data-dot]");
      let on = false;
      el.querySelector("[data-tg]").addEventListener("click", () => {
        on = !on;
        if (o.v === "t") {
          d.style.transition = "transform 800ms cubic-bezier(.23,1,.32,1)";
          d.style.transform = on ? "translateX(var(--dx))" : "none";
        } else {
          d.style.animation = "none";
          void d.offsetWidth;
          d.style.animation = `${on ? "d-go" : "d-back"} 800ms cubic-bezier(.23,1,.32,1) both`;
        }
      });
    },
    rule: (s, o) =>
      o.v === "t"
        ? "Use transitions for anything people can trigger twice in a second. Keyframes only for set pieces."
        : "Keyframes for everything.",
  },
  {
    id: "reduced-motion",
    t: "Reduced motion",
    src: "Apple, Emil Kowalski",
    repo: "both",
    kind: "Motion",
    play: true,
    why: "People who ask for reduced motion still need to see that something changed. Swap movement for a short fade rather than removing feedback entirely.",
    opts: [
      { l: "Swap movement for fades", v: "fade" },
      { l: "Remove all motion", v: "none" },
      { l: "Ignore the setting", v: "ignore" },
    ],
    demo: (s, o) => {
      const card = (anim, label) =>
        `<div style="flex:1;min-width:140px"><div style="font-size:12px;color:#737373;margin-bottom:6px">${label}</div><div style="padding:14px;border-radius:10px;border:1px solid #e8e8e8;${anim}"><div style="font-weight:550;font-size:14px">Booking confirmed</div></div></div>`;
      const red = {
        fade: "animation:d-fade 200ms ease 250ms both",
        none: "",
        ignore: "animation:d-rise 500ms cubic-bezier(.23,1,.32,1) 250ms both",
      }[o.v];
      return `<div style="display:flex;gap:16px;flex-wrap:wrap">${card("animation:d-rise 500ms cubic-bezier(.23,1,.32,1) 250ms both", "Normal")}${card(red, "Reduced motion on")}</div>`;
    },
    css: (s, o) =>
      ({
        fade: "@media (prefers-reduced-motion: reduce) {\n  .enter { animation: fade 200ms ease; transform: none; }\n}",
        none: "@media (prefers-reduced-motion: reduce) {\n  * { animation: none !important; transition: none !important; }\n}",
        ignore: "/* nothing */",
      })[o.v],
  },
  {
    id: "scroll-reveal",
    t: "Content appearing on scroll",
    src: "frontend-design, Impeccable",
    repo: "looks",
    kind: "Motion",
    why: "Every section fading up as it scrolls in is the most common generated-site move. One authored moment lands harder than the same effect everywhere.",
    hint: "Scroll inside the box.",
    opts: [
      { l: "Nothing moves", v: "none" },
      { l: "Every section fades up", v: "all", n: "A tell." },
      { l: "One authored moment", v: "one" },
    ],
    def: 2,
    demo: (s, o) =>
      `<div style="height:200px;overflow:auto;border-radius:8px;border:1px solid #eee;padding:0 16px">${Array.from({ length: 9 }, (_, i) => `<div class="${o.v === "all" ? "d-reveal" : ""}" style="padding:18px 0;border-top:${i ? "1px solid #f0f0f0" : "0"};${o.v === "one" && i === 0 ? "animation:d-rise 700ms cubic-bezier(.2,.8,0,1) 200ms both;font-size:22px;font-weight:520;letter-spacing:-.03em" : ""}">${i === 0 ? "Work" : `Project ${i}`}</div>`).join("")}</div>`,
    css: (s, o) =>
      o.v === "all"
        ? "animation: rise linear both;\nanimation-timeline: view();\nanimation-range: entry 0% entry 60%;"
        : o.v === "one"
          ? "One entrance on the page's lead element only."
          : "/* none */",
  },
  {
    id: "page-transitions",
    t: "Moving between pages",
    src: "Web platform",
    repo: "looks",
    kind: "Motion",
    cost: 1,
    why: "View transitions let the browser animate between two states, including two pages. A shared element that morphs keeps people oriented.",
    hint: "Click a row, then go back.",
    opts: [
      { l: "Instant", v: "none", c: 0 },
      { l: "Cross-fade", v: "fade" },
      { l: "Shared element", v: "shared" },
    ],
    def: 2,
    demo: () => `<div data-vt style="min-height:170px"></div>`,
    mount: (el, s, o) => {
      const box = el.querySelector("[data-vt]"),
        uid = "vt" + Math.random().toString(36).slice(2, 7);
      const rows = [
        ["makeEbook", "#2b2b2e"],
        ["coverly", "#be2d18"],
        ["Spark", "#0b3416"],
      ];
      const list = () => {
        box.innerHTML = rows
          .map(
            ([n, c], i) =>
              `<button data-row="${i}" style="display:flex;align-items:center;gap:12px;width:100%;padding:8px 0;border:0;border-top:${i ? "1px solid #f0f0f0" : "0"};background:none;text-align:left;font-size:14px"><span style="width:44px;height:30px;border-radius:6px;background:${c};${o.v === "shared" ? `view-transition-name:${uid}-${i}` : ""}"></span>${n}</button>`,
          )
          .join("");
      };
      const detail = (i) => {
        const [n, c] = rows[i];
        box.innerHTML = `<button data-back style="border:0;background:none;color:#737373;font-size:13px;padding:0">Back</button><div style="margin-top:8px;height:96px;border-radius:10px;background:${c};${o.v === "shared" ? `view-transition-name:${uid}-${i}` : ""}"></div><div style="margin-top:8px;font-weight:550">${n}</div>`;
      };
      const go = (f) => {
        if (o.v !== "none" && document.startViewTransition)
          document.startViewTransition(f);
        else f();
      };
      box.addEventListener("click", (e) => {
        const r = e.target.closest("[data-row]"),
          b = e.target.closest("[data-back]");
        if (r) go(() => detail(+r.dataset.row));
        if (b) go(list);
      });
      list();
    },
    css: (s, o) =>
      o.v === "none"
        ? "/* none */"
        : o.v === "fade"
          ? "@view-transition { navigation: auto; }"
          : "@view-transition { navigation: auto; }\n.thumb { view-transition-name: project-hero; }",
  },
  {
    id: "card-hover",
    t: "Card hover",
    src: "Emil Kowalski, frontend-design",
    repo: "looks",
    kind: "Motion",
    why: "Hover tells people a thing is clickable. A lift on every card is a template default; a quiet border change or an image zoom says the same with less noise.",
    hint: "Hover a card.",
    opts: [
      { l: "Nothing", v: "none" },
      { l: "Lift and shadow", v: "lift" },
      { l: "Border darkens", v: "border" },
      { l: "Image zooms", v: "zoom" },
    ],
    def: 2,
    demo: (s, o) =>
      `<div style="display:flex;gap:14px;flex-wrap:wrap">${["#2b2b2e", "#be2d18"].map((c, i) => `<div class="d-hover" data-m="${o.v}" style="flex:1;min-width:150px;border:1px solid #e8e8e8;border-radius:12px;overflow:hidden;cursor:pointer"><div style="aspect-ratio:16/9;overflow:hidden"><div class="d-img" style="height:100%;background:${c}"></div></div><div style="padding:10px 12px;font-size:14px;font-weight:500">${["makeEbook", "coverly"][i]}</div></div>`).join("")}</div>`,
  },
  {
    id: "numbers-change",
    t: "Changing numbers",
    src: "pick-ui-library",
    repo: "looks",
    kind: "Motion",
    why: "When a price or count updates, motion shows that it changed and by how much. Snapping is honest; rolling digits feel alive.",
    hint: "Add nights.",
    opts: [
      { l: "Snap", v: "snap" },
      { l: "Slide in", v: "slide" },
      { l: "Count up", v: "count" },
    ],
    def: 1,
    demo: () =>
      `<div style="display:flex;align-items:center;gap:16px"><div style="font-size:32px;font-weight:520;letter-spacing:-.03em;font-variant-numeric:tabular-nums;overflow:hidden;height:40px">£<span data-n style="display:inline-block">180</span></div><button data-add style="height:32px;padding:0 14px;border:1px solid #e0e0e0;border-radius:999px;background:#fff;font-size:13px">Add a night</button></div>`,
    mount: (el, s, o) => {
      const n = el.querySelector("[data-n]");
      let v = 180,
        raf;
      el.querySelector("[data-add]").addEventListener("click", () => {
        const from = v;
        v += 90;
        if (o.v === "snap") n.textContent = v;
        if (o.v === "slide") {
          n.textContent = v;
          n.style.animation = "none";
          void n.offsetWidth;
          n.style.animation = "d-rise 260ms cubic-bezier(.23,1,.32,1)";
        }
        if (o.v === "count") {
          cancelAnimationFrame(raf);
          const t0 = performance.now();
          const step = (t) => {
            const k = Math.min(1, (t - t0) / 500),
              e = 1 - (1 - k) ** 3;
            n.textContent = Math.round(from + (v - from) * e);
            if (k < 1) raf = requestAnimationFrame(step);
          };
          raf = requestAnimationFrame(step);
        }
      });
      return () => cancelAnimationFrame(raf);
    },
    css: (s, o) =>
      o.v === "count"
        ? "Use NumberFlow, or a requestAnimationFrame tween writing textContent."
        : o.v === "slide"
          ? "Re-key the number so it re-enters with a short rise."
          : "/* none */",
  },
]);

area(
  "components",
  "Components",
  "The recurring pieces of a site, chosen for what they say as much as how they look.",
);
add("components", [
  {
    id: "nav",
    t: "Site navigation",
    src: "neilmcardle.com",
    repo: "both",
    why: "Navigation should answer where am I and where can I go. A side rail suits a long single page; a top bar suits many pages.",
    opts: [
      { l: "Top bar", v: "top" },
      { l: "Floating pill", v: "pill" },
      { l: "Side rail", v: "rail", n: "Your homepage." },
      { l: "Menu button", v: "menu" },
    ],
    def: 2,
    demo: (s, o) => {
      const c = `<div style="position:absolute;left:30%;right:22%;top:${o.v === "top" ? 40 : 26}px">${bars(6)}</div>`;
      const n = {
        top: `<div style="height:28px;border-bottom:1px solid #e8e8e8;display:flex;align-items:center;gap:12px;padding:0 12px;font-size:10px;background:#fff"><b>N</b><span>Work</span><span>Play</span><span>About</span></div>`,
        pill: `<div style="position:absolute;top:10px;left:50%;translate:-50% 0;display:flex;gap:10px;padding:5px 12px;border-radius:999px;background:#fff;box-shadow:0 2px 10px rgb(0 0 0/.08);font-size:10px"><span>Work</span><span>Play</span><span>About</span></div>`,
        rail: `<div style="position:absolute;left:12px;top:24px;display:grid;gap:6px;font-size:10px;color:#737373"><span style="color:#1d1d1f">Work</span><span>Play</span><span>About</span></div>`,
        menu: `<div style="position:absolute;top:10px;right:12px;width:26px;height:26px;border-radius:50%;border:1px solid #e0e0e0;background:#fff;display:grid;place-items:center;font-size:10px">≡</div>`,
      }[o.v];
      return frame(n + c, 150);
    },
  },
  {
    id: "header-surface",
    t: "Sticky header surface",
    src: "Apple",
    repo: "both",
    cost: 0,
    why: "A header that stays on screen needs to separate from content scrolling under it. Translucent blur looks rich but costs paint on every scroll frame.",
    hint: "Scroll inside the box.",
    opts: [
      { l: "Solid with hairline", v: "solid", c: 0 },
      { l: "Translucent blur", v: "blur", c: 2 },
      { l: "Edge fade", v: "fade", c: 0 },
    ],
    demo: (s, o) => {
      const hd = {
        solid: "background:#fff;border-bottom:1px solid #e8e8e8",
        blur: "background:rgb(255 255 255/.6);backdrop-filter:blur(16px) saturate(180%);-webkit-backdrop-filter:blur(16px) saturate(180%);border-bottom:1px solid rgb(0 0 0/.06)",
        fade: "background:linear-gradient(#fff 60%,rgb(255 255 255/0))",
      }[o.v];
      return `<div style="height:200px;overflow:auto;border-radius:8px;border:1px solid #eee"><div style="position:sticky;top:0;z-index:1;height:44px;display:flex;align-items:center;padding:0 14px;font-size:13px;font-weight:550;${hd}">Larkfield</div>${Array.from({ length: 10 }, (_, i) => `<div style="margin:10px 14px;height:44px;border-radius:8px;background:${["#be2d18", "#2b2b2e", "#3be86b", "#deea53"][i % 4]}"></div>`).join("")}</div>`;
    },
    css: (s, o) =>
      ({
        solid: "background: #fff;\nborder-bottom: 1px solid var(--line);",
        blur: "background: rgb(255 255 255 / .6);\nbackdrop-filter: blur(16px) saturate(180%);",
        fade: "background: linear-gradient(#fff 60%, transparent);",
      })[o.v],
  },
  {
    id: "collections",
    t: "How a set of things is shown",
    src: "Impeccable craft floor, neilmcardle.com",
    repo: "both",
    why: "Identical cards in a grid are the default container for everything. A hairline list is quieter and reads in order; a table is for comparing.",
    opts: [
      { l: "Hairline list", v: "list", n: "Your homepage." },
      { l: "Card grid", v: "cards" },
      { l: "Table", v: "table" },
    ],
    demo: (s, o) => {
      const d = [
        ["makeEbook", "Writing tool", "2026"],
        ["coverly", "Cover research", "2025"],
        ["Spark", "Course", "2026"],
      ];
      if (o.v === "list")
        return d
          .map(
            (r, i) =>
              `<div style="display:flex;gap:12px;padding:10px 0;border-top:${i ? "1px solid #eee" : "0"}"><span style="font-weight:500;flex:1">${r[0]}</span><span style="color:#737373;font-size:13px">${r[1]}</span></div>`,
          )
          .join("");
      if (o.v === "cards")
        return `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px">${d.map((r) => `<div style="padding:12px;border-radius:10px;border:1px solid #e8e8e8"><div style="font-weight:500">${r[0]}</div><div style="font-size:12px;color:#737373">${r[1]}</div></div>`).join("")}</div>`;
      return `<table style="width:100%;border-collapse:collapse;font-size:13px"><tr style="color:#737373;text-align:left"><th style="font-weight:450;padding:6px 0">Name</th><th style="font-weight:450">Type</th><th style="font-weight:450;text-align:right">Year</th></tr>${d.map((r) => `<tr style="border-top:1px solid #eee"><td style="padding:8px 0">${r[0]}</td><td>${r[1]}</td><td style="text-align:right;font-variant-numeric:tabular-nums">${r[2]}</td></tr>`).join("")}</table>`;
    },
  },
  {
    id: "toasts",
    t: "Notifications",
    src: "Emil Kowalski (Sonner)",
    repo: "both",
    kind: "Motion",
    why: "A toast should leave the way it came, so swiping it away feels obvious. Confirmation next to the action is often better than a toast at all.",
    hint: "Press Save a few times.",
    opts: [
      { l: "Bottom centre", v: "bc" },
      { l: "Bottom right", v: "br" },
      { l: "Top centre", v: "tc" },
      { l: "Next to the action", v: "inline" },
    ],
    demo: () =>
      `<div data-tz style="position:relative;height:150px;border-radius:8px;background:#fafafa;border:1px solid #eee;overflow:hidden"><div style="padding:14px;display:flex;align-items:center;gap:10px"><button data-save style="height:32px;padding:0 14px;border:0;border-radius:999px;background:#1d1d1f;color:#fff;font-size:13px">Save</button><span data-inl style="font-size:13px;color:#1f7a4a;opacity:0;transition:opacity 200ms"></span></div></div>`,
    mount: (el, s, o) => {
      const z = el.querySelector("[data-tz]"),
        inl = el.querySelector("[data-inl]");
      let t;
      el.querySelector("[data-save]").addEventListener("click", () => {
        if (o.v === "inline") {
          inl.textContent = "Saved";
          inl.style.opacity = 1;
          clearTimeout(t);
          t = setTimeout(() => (inl.style.opacity = 0), 1400);
          return;
        }
        const top = o.v === "tc",
          pos = {
            bc: "left:50%;bottom:12px;translate:-50% 0",
            br: "right:12px;bottom:12px",
            tc: "left:50%;top:12px;translate:-50% 0",
          }[o.v];
        const n = document.createElement("div");
        n.style.cssText = `position:absolute;${pos};padding:9px 14px;border-radius:10px;background:#1d1d1f;color:#fff;font-size:13px;box-shadow:0 8px 20px rgb(0 0 0/.15);transition:transform 400ms cubic-bezier(.23,1,.32,1),opacity 300ms;transform:translateY(${top ? -120 : 120}%);opacity:0`;
        n.textContent = "Trip saved";
        z.querySelectorAll("[data-toast]").forEach((x) => {
          x.style.transform = `translateY(${top ? 112 : -112}%) scale(.94)`;
          x.style.opacity = 0.5;
        });
        n.dataset.toast = 1;
        z.appendChild(n);
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            n.style.transform = "none";
            n.style.opacity = 1;
          }),
        );
        setTimeout(() => {
          n.style.transform = `translateY(${top ? -120 : 120}%)`;
          n.style.opacity = 0;
          setTimeout(() => n.remove(), 400);
        }, 1800);
      });
      return () => clearTimeout(t);
    },
  },
  {
    id: "overlays",
    t: "Overlays",
    src: "Apple, Impeccable",
    repo: "both",
    why: "A modal interrupts and protects focus, so it is for tasks that need both. On phones a bottom sheet sits where thumbs are. Expanding in place keeps people in their flow.",
    opts: [
      { l: "Centred modal", v: "modal" },
      { l: "Sheet on phones, modal on desktop", v: "sheet" },
      { l: "Side drawer", v: "drawer" },
      { l: "Expand in place", v: "inline" },
    ],
    def: 1,
    demo: (s, o) => {
      const scrim = `<div style="position:absolute;inset:0;background:rgb(0 0 0/.25)"></div>`;
      const desk = {
        modal: `${scrim}<div style="position:absolute;left:25%;right:25%;top:22%;bottom:22%;background:#fff;border-radius:8px"></div>`,
        sheet: `${scrim}<div style="position:absolute;left:25%;right:25%;top:22%;bottom:22%;background:#fff;border-radius:8px"></div>`,
        drawer: `${scrim}<div style="position:absolute;right:0;top:0;bottom:0;width:38%;background:#fff"></div>`,
        inline: `<div style="position:absolute;left:12%;right:12%;top:20%;height:46%;background:#fff;border:1px solid #e0e0e0;border-radius:8px"></div>`,
      }[o.v];
      const phone = {
        modal: `${scrim}<div style="position:absolute;left:8%;right:8%;top:30%;bottom:30%;background:#fff;border-radius:8px"></div>`,
        sheet: `${scrim}<div style="position:absolute;left:0;right:0;bottom:0;height:55%;background:#fff;border-radius:12px 12px 0 0"></div>`,
        drawer: `${scrim}<div style="position:absolute;right:0;top:0;bottom:0;width:80%;background:#fff"></div>`,
        inline: `<div style="position:absolute;left:8%;right:8%;top:20%;height:46%;background:#fff;border:1px solid #e0e0e0;border-radius:8px"></div>`,
      }[o.v];
      return `<div style="display:flex;gap:16px;align-items:flex-end"><div style="flex:1;position:relative;aspect-ratio:16/10;border-radius:8px;background:#f1f1f1;overflow:hidden">${desk}</div><div style="width:76px;position:relative;aspect-ratio:9/19;border-radius:12px;background:#f1f1f1;overflow:hidden;border:3px solid #1d1d1f">${phone}</div></div>`;
    },
  },
  {
    id: "folds",
    t: "Folds and accordions",
    src: "neilmcardle.com",
    repo: "both",
    kind: "Motion",
    why: "Animating the height shows where the content came from. Native details elements can now animate to auto height in Chromium with no JavaScript.",
    hint: "Open and close them.",
    opts: [
      { l: "Animated height", v: true },
      { l: "Instant", v: false },
    ],
    dials: [["dur", "Duration", 100, 600, 10, 300, "ms"]],
    demo: (s, o) =>
      `<div class="d-folds">${["Tools", "For my kids", "Explorations"].map((x, i) => `<details class="d-fold" style="--fd:${o.v ? s.d.dur : 0}ms;border-top:${i ? "1px solid #eee" : "0"}"><summary style="display:flex;gap:8px;align-items:center;padding:10px 0;font-weight:500"><span class="chev">${icon("chevron", { size: 14, stroke: 2 })}</span>${x}</summary><div style="padding:0 0 12px 22px;color:#5c5c5c;font-size:14px">${bars(3)}</div></details>`).join("")}</div>`,
    css: (s, o) =>
      o.v
        ? `:root { interpolate-size: allow-keywords; }\ndetails::details-content {\n  block-size: 0;\n  overflow: hidden;\n  transition: block-size ${s.d.dur}ms var(--ease), content-visibility ${s.d.dur}ms allow-discrete;\n}\ndetails[open]::details-content { block-size: auto; }`
        : "/* native details, no animation */",
  },
  {
    id: "tabs",
    t: "Tabs",
    src: "Emil Kowalski",
    repo: "both",
    kind: "Motion",
    why: "An indicator that slides between tabs shows the relationship between them. A colour change alone is fine where tabs are used many times a minute.",
    hint: "Click the tabs.",
    opts: [
      { l: "Sliding underline", v: "line" },
      { l: "Sliding pill", v: "pill" },
      { l: "Colour only", v: "color" },
    ],
    demo: (s, o) =>
      `<div data-tabs style="position:relative;display:inline-flex;gap:4px;${o.v === "line" ? "border-bottom:1px solid #e8e8e8" : o.v === "pill" ? "padding:3px;border-radius:999px;background:#f1f1f1" : ""}"><span data-ind style="position:absolute;${o.v === "line" ? "bottom:-1px;height:2px;background:#1d1d1f" : o.v === "pill" ? "top:3px;bottom:3px;border-radius:999px;background:#fff;box-shadow:0 1px 3px rgb(0 0 0/.12)" : "display:none"};left:0;transition:transform 260ms cubic-bezier(.23,1,.32,1),width 260ms cubic-bezier(.23,1,.32,1)"></span>${["Kindle", "iPad", "Phone"].map((x, i) => `<button data-tab-i="${i}" style="position:relative;height:32px;padding:0 14px;border:0;background:none;font-size:13px;color:${i ? "#737373" : "#1d1d1f"};transition:color 160ms">${x}</button>`).join("")}</div>`,
    mount: (el) => {
      const ind = el.querySelector("[data-ind]"),
        bs = [...el.querySelectorAll("[data-tab-i]")];
      const set = (b) => {
        ind.style.width = b.offsetWidth + "px";
        ind.style.transform = `translateX(${b.offsetLeft}px)`;
        bs.forEach((x) => (x.style.color = x === b ? "#1d1d1f" : "#737373"));
      };
      bs.forEach((b) => b.addEventListener("click", () => set(b)));
      requestAnimationFrame(() => set(bs[0]));
    },
  },
  {
    id: "loading",
    t: "Loading states",
    src: "Emil Kowalski, Vercel",
    repo: "both",
    kind: "Motion",
    play: true,
    why: "Under about 300ms, show nothing. Longer, show the shape of what is coming. If the outcome is near certain, show it immediately and fix it if the server disagrees.",
    opts: [
      { l: "Spinner", v: "spin" },
      { l: "Skeleton", v: "skel" },
      { l: "Progress bar", v: "bar" },
      { l: "Optimistic", v: "opt" },
    ],
    def: 1,
    demo: (s, o) => {
      const real = `<div style="animation:d-fade 250ms ease ${o.v === "opt" ? 0 : 1.6}s both"><div style="font-weight:550">Heathrow Terminal 5</div><div style="font-size:13px;color:#737373">3 cars available, from £42 a day</div></div>`;
      const wait = {
        spin: `<div style="width:18px;height:18px;border-radius:50%;border:2px solid #e0e0e0;border-top-color:#1d1d1f;animation:d-spin 600ms linear infinite"></div>`,
        skel: `<div class="d-shimmer" style="height:14px;width:60%;border-radius:4px"></div><div class="d-shimmer" style="height:12px;width:80%;border-radius:4px;margin-top:8px"></div>`,
        bar: `<div style="height:2px;background:#eee;border-radius:2px;overflow:hidden"><div style="height:100%;background:#1d1d1f;transform-origin:left;animation:d-bar 1.6s cubic-bezier(.4,0,.2,1) both"></div></div>`,
        opt: "",
      }[o.v];
      return `<div style="position:relative;max-width:320px;min-height:48px"><div style="position:absolute;inset:0;animation:d-fade 1ms linear 1.6s reverse both">${wait}</div>${real}</div>`;
    },
  },
  {
    id: "empty-states",
    t: "Empty states",
    src: "frontend-design, Impeccable",
    repo: "both",
    why: "An empty screen is an invitation to act, not a mood. One line saying what goes here and one way to start is usually enough.",
    opts: [
      { l: "One line and an action", v: "line" },
      { l: "Illustration and copy", v: "art" },
      { l: "Sample content", v: "sample" },
    ],
    demo: (s, o) => {
      if (o.v === "line")
        return `<div style="padding:12px 0"><p style="margin:0 0 10px;color:#5c5c5c">No trips yet. Search for a car to start one.</p><button style="height:32px;padding:0 14px;border:0;border-radius:999px;background:#1d1d1f;color:#fff;font-size:13px">Search cars</button></div>`;
      if (o.v === "art")
        return `<div style="text-align:center;padding:8px"><div style="width:72px;height:56px;margin:0 auto 10px;border-radius:10px;background:#efefef"></div><div style="font-weight:550">Nothing here yet</div><p style="margin:4px 0 10px;color:#737373;font-size:13px">Your trips will appear here once you book.</p><button style="height:32px;padding:0 14px;border:0;border-radius:999px;background:#1d1d1f;color:#fff;font-size:13px">Search cars</button></div>`;
      return `<div style="opacity:.55">${["Sample trip: Heathrow, 3 nights", "Sample trip: Edinburgh, 1 night"].map((x, i) => `<div style="padding:9px 0;border-top:${i ? "1px solid #eee" : "0"}">${x}</div>`).join("")}</div><p style="margin:8px 0 0;font-size:13px">These are examples. <a style="text-decoration:underline;text-underline-offset:3px">Start your own</a></p>`;
    },
  },
  {
    id: "tables",
    t: "Data tables",
    src: "Impeccable, break-ui",
    repo: "both",
    why: "Tables are for comparing, so numbers line up right, figures are tabular and lines stay out of the way of the data.",
    opts: [
      { l: "Hairline rows", v: "line" },
      { l: "Zebra stripes", v: "zebra" },
      { l: "No lines", v: "none" },
    ],
    demo: (s, o) => {
      const rows = [
        ["Economy", "Fiat 500", "£42"],
        ["Compact", "VW Golf", "£58"],
        ["SUV", "Kia Sportage", "£84"],
        ["Premium", "BMW 3 Series", "£112"],
      ];
      return `<table style="width:100%;max-width:420px;border-collapse:collapse;font-size:13px"><tr style="color:#737373;text-align:left"><th style="font-weight:450;padding:6px 8px">Class</th><th style="font-weight:450;padding:6px 8px">Example</th><th style="font-weight:450;padding:6px 8px;text-align:right">Per day</th></tr>${rows.map((r, i) => `<tr style="${o.v === "line" ? "border-top:1px solid #eee" : ""};${o.v === "zebra" && i % 2 === 0 ? "background:#f6f6f6" : ""}"><td style="padding:8px">${r[0]}</td><td style="padding:8px;color:#5c5c5c">${r[1]}</td><td style="padding:8px;text-align:right;font-variant-numeric:tabular-nums">${r[2]}</td></tr>`).join("")}</table>`;
    },
  },
]);
