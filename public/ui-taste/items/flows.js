area(
  "flows",
  "Flows and states",
  "How a site behaves across a task: forms, errors, saving, paying, starting out.",
);
add("flows", [
  {
    id: "form-columns",
    t: "Form layout",
    src: "Baymard",
    repo: "both",
    why: "One column reads top to bottom with no guessing about order. Two columns save space but people miss fields and zig-zag.",
    opts: [
      { l: "One column", v: 1 },
      { l: "Two columns", v: 2 },
    ],
    demo: (s, o) =>
      `<div style="display:grid;grid-template-columns:repeat(${o.v},minmax(0,1fr));gap:12px 16px;max-width:420px">${["First name", "Last name", "Email", "Phone"].map((x) => `<label style="display:grid;gap:5px;font-size:12.5px;font-weight:450">${x}<span style="height:36px;border:1px solid #dcdcdc;border-radius:8px"></span></label>`).join("")}</div>`,
  },
  {
    id: "error-messages",
    t: "Error messages",
    src: "frontend-design, Apple",
    repo: "both",
    why: "An error should sit next to the problem, say what went wrong and say how to fix it. A red outline alone tells nobody anything.",
    opts: [
      { l: "Under the field, with the fix", v: "field" },
      { l: "Summary at the top", v: "top" },
      { l: "Toast", v: "toast" },
      { l: "Red outline only", v: "outline" },
    ],
    demo: (s, o) => {
      const red = o.v !== "top" && o.v !== "toast" ? "#b42318" : "#dcdcdc";
      return `<div style="max-width:320px">${o.v === "top" ? `<div style="padding:10px 12px;border-radius:8px;background:#fdf0ee;color:#b42318;font-size:13px;margin-bottom:12px">There is a problem with the card number.</div>` : ""}<label style="display:grid;gap:5px;font-size:12.5px;font-weight:450">Card number<input value="4242 4242 4242" style="height:38px;padding:0 10px;border:1px solid ${o.v === "outline" || o.v === "field" ? "#b42318" : red};border-radius:8px;font-size:15px"></label>${o.v === "field" ? `<p style="margin:6px 0 0;font-size:12.5px;color:#b42318">This number is 4 digits short. Check the front of your card.</p>` : ""}${o.v === "toast" ? `<div style="margin-top:14px;display:inline-block;padding:8px 12px;border-radius:8px;background:#1d1d1f;color:#fff;font-size:13px">Something went wrong</div>` : ""}</div>`;
    },
  },
  {
    id: "destructive",
    t: "Deleting and undoing",
    src: "Apple",
    repo: "both",
    why: "A confirmation on every delete trains people to click through it. Letting them undo is kinder and faster. Save confirmation for what cannot be undone.",
    opts: [
      { l: "Undo afterwards", v: "undo" },
      { l: "Confirm first", v: "confirm" },
      {
        l: "Type to confirm",
        v: "type",
        n: "Only for irreversible, high-stakes deletes.",
      },
    ],
    demo: (s, o) => {
      if (o.v === "undo")
        return `<div style="display:flex;align-items:center;gap:14px;padding:9px 14px;border-radius:10px;background:#1d1d1f;color:#fff;font-size:13px;width:max-content">Trip removed<button style="border:0;background:none;color:#fff;text-decoration:underline;text-underline-offset:3px;font-size:13px">Undo</button></div>`;
      if (o.v === "confirm")
        return `<div style="max-width:300px;padding:16px;border-radius:12px;border:1px solid #e8e8e8;box-shadow:0 10px 30px rgb(0 0 0/.08)"><div style="font-weight:550">Remove this trip?</div><p style="margin:4px 0 12px;font-size:13px;color:#737373">Heathrow, 24 to 26 October.</p><div style="display:flex;gap:8px;justify-content:flex-end"><button style="height:32px;padding:0 12px;border:1px solid #e0e0e0;border-radius:999px;background:#fff;font-size:13px">Keep</button><button style="height:32px;padding:0 12px;border:0;border-radius:999px;background:#b42318;color:#fff;font-size:13px">Remove trip</button></div></div>`;
      return `<div style="max-width:300px;padding:16px;border-radius:12px;border:1px solid #e8e8e8"><div style="font-weight:550">Delete your account</div><p style="margin:4px 0 8px;font-size:13px;color:#737373">Type DELETE to confirm. This cannot be undone.</p><input style="width:100%;height:36px;padding:0 10px;border:1px solid #dcdcdc;border-radius:8px;font-size:15px"></div>`;
    },
  },
  {
    id: "checkout-steps",
    t: "Checkout structure",
    src: "Baymard",
    repo: "both",
    why: "Fewer steps means fewer places to leave, as long as each step still has one clear job.",
    opts: [
      { l: "One page", v: 1 },
      { l: "Three steps with progress", v: 3 },
      { l: "Five steps", v: 5 },
    ],
    demo: (s, o) => {
      const names = {
        1: ["Checkout"],
        3: ["Your car", "Protection and extras", "Pay"],
        5: ["Car", "Protection", "Extras", "Details", "Pay"],
      }[o.v];
      return `<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">${names.map((n, i) => `<div style="display:flex;align-items:center;gap:6px;font-size:12.5px;color:${i === 0 ? "#1d1d1f" : "#737373"}"><span style="width:20px;height:20px;border-radius:50%;display:grid;place-items:center;font-size:11px;${i === 0 ? "background:#1d1d1f;color:#fff" : "border:1px solid #d4d4d4"}">${i + 1}</span>${n}</div>${i < names.length - 1 ? '<span style="width:18px;height:1px;background:#d4d4d4"></span>' : ""}`).join("")}</div><div style="margin-top:14px">${bars(3)}</div>`;
    },
  },
  {
    id: "optimistic",
    t: "Saving",
    src: "Vercel, Apple",
    repo: "perf",
    kind: "Motion",
    why: "If an action almost always succeeds, show the result at once and quietly roll back on the rare failure. Waiting for the server makes a fast app feel slow.",
    hint: "The server takes 900ms in this demo.",
    opts: [
      { l: "Update now, roll back on failure", v: true },
      { l: "Wait for the server", v: false },
    ],
    demo: () =>
      `<button data-like style="display:inline-flex;align-items:center;gap:8px;height:36px;padding:0 14px;border:1px solid #e0e0e0;border-radius:999px;background:#fff;font-size:13px"><span data-h>${icon("heart", { size: 16 })}</span><span data-l>Save trip</span></button>`,
    mount: (el, s, o) => {
      const b = el.querySelector("[data-like]"),
        h = el.querySelector("[data-h]"),
        l = el.querySelector("[data-l]");
      let on = false,
        t;
      const draw = (v, busy) => {
        h.innerHTML = busy
          ? '<span style="display:inline-block;width:14px;height:14px;border-radius:50%;border:2px solid #e0e0e0;border-top-color:#1d1d1f;animation:d-spin 600ms linear infinite"></span>'
          : icon("heart", {
              size: 16,
              fill: v,
              color: v ? "#b42318" : "currentColor",
            });
        l.textContent = v ? "Saved" : "Save trip";
      };
      b.addEventListener("click", () => {
        on = !on;
        if (o.v) draw(on);
        else {
          draw(!on, true);
          clearTimeout(t);
          t = setTimeout(() => draw(on), 900);
        }
      });
      return () => clearTimeout(t);
    },
  },
  {
    id: "price-clarity",
    t: "Prices that do not change at the end",
    src: "CMA guidance",
    repo: "both",
    why: "Fees that appear at the last step are the most common reason people abandon a booking. Show the total people will pay from the first price they see.",
    opts: [
      { l: "Total from the start", v: true },
      {
        l: "Fees added at payment",
        v: false,
        n: "A dark pattern, and now regulated in the UK.",
      },
    ],
    demo: (s, o) =>
      `<div style="display:flex;gap:10px;flex-wrap:wrap">${[
        ["Search", "£126"],
        ["Extras", "£148"],
        ["Pay", o.v ? "£148" : "£181"],
      ]
        .map(
          ([st, p], i) =>
            `<div style="flex:1;min-width:100px;padding:12px;border-radius:10px;border:1px solid #e8e8e8"><div style="font-size:12px;color:#737373">${st}</div><div style="font-size:20px;font-weight:520;letter-spacing:-.02em;font-variant-numeric:tabular-nums">${i === 0 && !o.v ? "£96" : p}</div><div style="font-size:11.5px;color:#737373">${o.v ? "Total, all fees included" : i === 2 ? "Includes £33 in fees" : "Before fees"}</div></div>`,
        )
        .join("")}</div>`,
  },
  {
    id: "first-run",
    t: "First run",
    src: "Impeccable, Brilliant",
    repo: "both",
    why: "The fastest way to show what a tool does is to let people do the thing. Tours explain a product people have not yet cared about.",
    opts: [
      { l: "Straight into the work", v: "straight" },
      { l: "Start with sample content", v: "sample" },
      { l: "Checklist", v: "check" },
      { l: "Guided tour", v: "tour" },
    ],
    def: 1,
    demo: (s, o) => {
      const m = {
        straight: `<div style="padding:14px">${bars(5)}</div>`,
        sample: `<div style="padding:14px"><div style="font-size:11px;color:#737373;margin-bottom:4px">Sample book: The Rainy City</div>${bars(5)}</div>`,
        check: `<div style="padding:14px;display:grid;gap:6px;font-size:11px">${["Name your book", "Write a chapter", "Preview on Kindle"].map((x, i) => `<span style="display:flex;gap:6px;align-items:center">${icon(i ? "plus" : "check", { size: 12, stroke: 2 })}${x}</span>`).join("")}</div>`,
        tour: `<div style="padding:14px">${bars(5)}</div><div style="position:absolute;inset:0;background:rgb(0 0 0/.35)"></div><div style="position:absolute;left:20%;top:30%;padding:8px 10px;border-radius:8px;background:#fff;font-size:11px">Step 1 of 6: this is the editor</div>`,
      }[o.v];
      return frame(m, 140);
    },
  },
  {
    id: "search",
    t: "Search",
    src: "General practice",
    repo: "both",
    kind: "Motion",
    why: "Results that update as you type turn search into browsing. It needs fast data; otherwise search on submit and say so.",
    hint: "Type in the field.",
    opts: [
      { l: "Results as you type", v: "live" },
      { l: "Search on submit", v: "submit" },
    ],
    demo: () =>
      `<form onsubmit="return false" style="max-width:320px"><input data-q placeholder="Search airports" style="width:100%;height:38px;padding:0 12px;border:1px solid #dcdcdc;border-radius:8px;font-size:16px"><div data-res style="margin-top:8px"></div></form>`,
    mount: (el, s, o) => {
      const A = [
        "Heathrow",
        "Gatwick",
        "Stansted",
        "Luton",
        "Edinburgh",
        "Manchester",
        "Bristol",
        "Belfast",
        "Glasgow",
        "Birmingham",
      ];
      const q = el.querySelector("[data-q]"),
        r = el.querySelector("[data-res]");
      const draw = () => {
        const v = q.value.trim().toLowerCase();
        const m = A.filter((a) => a.toLowerCase().includes(v)).slice(0, 4);
        r.innerHTML = v
          ? m.length
            ? m
                .map(
                  (x) =>
                    `<div style="padding:6px 2px;font-size:14px;border-top:1px solid #f0f0f0">${x}</div>`,
                )
                .join("")
            : `<div style="font-size:13px;color:#737373">No airports match "${v.replace(/</g, "")}".</div>`
          : "";
      };
      q.addEventListener("input", () => {
        if (o.v === "live") draw();
      });
      el.querySelector("form").addEventListener("submit", draw);
    },
  },
]);

area(
  "layout",
  "Layout and pages",
  "The shape of a page and how it holds up from a phone to a wide screen.",
);
add("layout", [
  {
    id: "page-structure",
    t: "Page structure",
    src: "Impeccable",
    repo: "both",
    why: "A single centred column reads in one line of sight. Grids and bands suit pages with many equal things; most portfolios are not that.",
    opts: [
      { l: "One centred column", v: "col", n: "Yours." },
      { l: "Sidebar and content", v: "side" },
      { l: "Asymmetric grid", v: "asym" },
      { l: "Full-width bands", v: "bands" },
    ],
    demo: (s, o) => {
      const m = {
        col: `<div style="position:absolute;left:32%;right:32%;top:14px">${bars(9)}</div>`,
        side: `<div style="position:absolute;left:12px;top:14px;width:18%">${bars(5, [80])}</div><div style="position:absolute;left:30%;right:12px;top:14px">${bars(9)}</div>`,
        asym: `<div style="position:absolute;left:8%;width:30%;top:14px;height:70px;background:#e3e3e3;border-radius:4px"></div><div style="position:absolute;left:44%;right:8%;top:24px">${bars(4)}</div><div style="position:absolute;left:30%;right:8%;top:96px;height:40px;background:#e3e3e3;border-radius:4px"></div>`,
        bands: `<div style="position:absolute;inset:0 0 auto 0;height:50px;background:#e8e8e8"></div><div style="position:absolute;left:20%;right:20%;top:62px">${bars(2)}</div><div style="position:absolute;inset:auto 0 0 0;height:50px;background:#ececec"></div>`,
      }[o.v];
      return frame(m, 150);
    },
  },
  {
    id: "hero",
    t: "Opening move",
    src: "frontend-design",
    repo: "looks",
    why: "The first screen should show the most characteristic thing in the subject's world. A big number with a small label and an accent is the default, not a choice.",
    opts: [
      { l: "Big type", v: "type" },
      { l: "Product at real size", v: "product" },
      { l: "Live demo", v: "demo" },
      { l: "Full-bleed media", v: "media" },
      { l: "Big number", v: "number", n: "The hero-metric template." },
    ],
    demo: (s, o) => {
      const m = {
        type: `<div style="position:absolute;left:10%;top:30px;font-size:30px;font-weight:520;letter-spacing:-.045em;line-height:1">Booking flows<br>with fewer steps.</div>`,
        product: `<div style="position:absolute;left:10%;top:16px;font-size:13px;font-weight:550">Larkfield</div><div style="position:absolute;left:30%;right:10%;top:36px;bottom:-10px;border-radius:6px;background:#fff;box-shadow:0 0 0 1px rgb(0 0 0/.08),0 10px 30px rgb(0 0 0/.08);padding:10px">${bars(6)}</div>`,
        demo: `<div style="position:absolute;left:10%;right:10%;top:20px;bottom:16px;border-radius:8px;border:1px dashed #bdbdbd;display:grid;place-items:center;font-size:12px;color:#737373">Working editor, typeable</div>`,
        media: `<div style="position:absolute;inset:0;background:linear-gradient(135deg,#2b3240,#8a7f72)"></div><div style="position:absolute;left:10%;bottom:16px;color:#fff;font-size:20px;font-weight:520;letter-spacing:-.03em">Fewer steps</div>`,
        number: `<div style="position:absolute;left:10%;top:22px;font-size:46px;font-weight:700;letter-spacing:-.04em;color:#4f46e5">5%</div><div style="position:absolute;left:10%;top:80px;font-size:11px;color:#737373">conversion uplift</div><div style="position:absolute;right:10%;top:30px;display:grid;gap:8px;font-size:11px"><span>3 steps</span><span>4 weeks</span></div>`,
      }[o.v];
      return frame(m, 150);
    },
  },
  {
    id: "section-breaks",
    t: "Section separation",
    src: "neilmcardle.com, frontend-design",
    repo: "both",
    why: "Hairlines and space say where one part ends. Alternating background bands and numbered sections are template structure unless the order matters.",
    opts: [
      { l: "Hairlines", v: "line" },
      { l: "Space only", v: "space" },
      { l: "Alternating bands", v: "bands", n: "A template tell." },
      {
        l: "Numbered sections",
        v: "num",
        n: "Only when the order carries meaning.",
      },
    ],
    demo: (s, o) =>
      ["Work", "Playground", "About"]
        .map(
          (h, i) =>
            `<div style="padding:${o.v === "space" ? "14px 0 18px" : "12px 14px"};${o.v === "line" && i ? "border-top:1px solid #e8e8e8" : ""};${o.v === "bands" && i % 2 ? "background:#f3f3f3" : ""}"><div style="font-weight:550">${o.v === "num" ? `<span style="font:400 11px var(--mono);color:#737373;margin-right:8px">0${i + 1}</span>` : ""}${h}</div>${bars(1)}</div>`,
        )
        .join(""),
  },
  {
    id: "alignment",
    t: "Alignment",
    src: "General practice",
    repo: "both",
    why: "Left alignment gives one clean edge to read down. Centred text suits a few short lines; mixing the two on one page loses the edge.",
    opts: [
      { l: "Left", v: "left" },
      { l: "Centred", v: "center" },
      { l: "Mixed", v: "mixed" },
    ],
    demo: (s, o) =>
      `<div style="text-align:${o.v === "center" ? "center" : "left"}"><div style="font-size:22px;font-weight:520;letter-spacing:-.03em;${o.v === "mixed" ? "text-align:center" : ""}">${SHORT}</div><p style="margin:6px ${o.v === "center" ? "auto" : "0"} 12px;max-width:44ch;color:#5c5c5c">${SAMPLE}</p><button style="height:34px;padding:0 14px;border:0;border-radius:999px;background:#1d1d1f;color:#fff;font-size:13px">Book a call</button></div>`,
  },
  {
    id: "fluid-type",
    t: "Headings across screen sizes",
    src: "Apple, Impeccable",
    repo: "both",
    why: "Fluid headings grow smoothly between a phone and a wide screen with no breakpoints. Product UI and reading text are better kept fixed and predictable.",
    opts: [
      { l: "Fluid", v: true },
      { l: "Fixed steps", v: false },
    ],
    dials: [
      ["min", "On a phone", 24, 48, 1, 34, "px"],
      ["max", "On a wide screen", 36, 96, 1, 56, "px"],
    ],
    demo: (s, o) => {
      const at = (w) => {
        if (!o.v) return w < 700 ? s.d.min : s.d.max;
        const k = Math.min(1, Math.max(0, (w - 375) / (1440 - 375)));
        return Math.round(s.d.min + (s.d.max - s.d.min) * k);
      };
      return `<div style="display:grid;gap:10px">${[375, 768, 1440].map((w) => `<div style="display:flex;align-items:baseline;gap:14px"><span style="width:48px;font-size:11px;color:#a3a3a3">${w}</span><span style="font-size:${at(w)}px;font-weight:520;letter-spacing:-.045em;line-height:1;white-space:nowrap">Work</span><span style="font-size:11px;color:#a3a3a3">${at(w)}px</span></div>`).join("")}</div>`;
    },
    css: (s, o) => {
      if (!o.v)
        return `font-size: ${s.d.min}px;\n@media (min-width: 700px) { font-size: ${s.d.max}px; }`;
      const slope = (s.d.max - s.d.min) / (1440 - 375),
        b = s.d.min - slope * 375;
      return `font-size: clamp(${s.d.min}px, ${b.toFixed(2)}px + ${(slope * 100).toFixed(3)}vw, ${s.d.max}px);`;
    },
    tw: (s, o) => {
      if (!o.v) return `text-[${s.d.min}px] md:text-[${s.d.max}px]`;
      const slope = (s.d.max - s.d.min) / (1440 - 375),
        b = s.d.min - slope * 375;
      return `text-[clamp(${s.d.min}px,${b.toFixed(2)}px_+_${(slope * 100).toFixed(3)}vw,${s.d.max}px)]`;
    },
  },
  {
    id: "gutters",
    t: "Phone side margins",
    src: "neilmcardle.com",
    repo: "both",
    why: "On a phone, the side margin is the frame. Too narrow and text touches the glass; too wide and lines get short.",
    dials: [["g", "Side margin", 8, 32, 1, 16, "px"]],
    demo: (s) =>
      `<div style="width:200px;margin:0 auto;border:4px solid #1d1d1f;border-radius:26px;overflow:hidden"><div style="zoom:.53;width:375px;padding:28px ${s.d.g}px;background:#fafafa"><div style="font-size:28px;font-weight:520;letter-spacing:-.04em;line-height:1.05">${SHORT}</div><p style="margin:8px 0 0;color:#5c5c5c">${SAMPLE}</p></div></div>`,
    css: (s) => `padding-inline: ${s.d.g}px;`,
    tw: (s) => `px-[${s.d.g}px]`,
  },
  {
    id: "breakpoints",
    t: "Where layouts change",
    src: "Impeccable",
    repo: "both",
    kind: "Invisible",
    why: "Layouts should change where the content starts to fail, not at the width of a particular phone. Components that live in many places should respond to their container.",
    opts: [
      { l: "Where the content breaks", v: "content" },
      { l: "Device widths", v: "device" },
      { l: "Container queries first", v: "container" },
    ],
    css: (s, o) =>
      ({
        content:
          "@media (max-width: 699px) { /* set where the column stops fitting */ }",
        device:
          "@media (min-width: 768px) {}\n@media (min-width: 1024px) {}\n@media (min-width: 1440px) {}",
        container:
          ".card-wrap { container-type: inline-size; }\n@container (min-width: 420px) { .card { grid-template-columns: 1fr 1fr; } }",
      })[o.v],
    tw: (s, o) =>
      o.v === "container"
        ? "@container on the parent, @md: variants on children"
        : o.v === "device"
          ? "sm: md: lg: xl:"
          : "max-[699px]: arbitrary breakpoints",
  },
  {
    id: "footer",
    t: "Footer",
    src: "General practice",
    repo: "both",
    why: "A footer is where people look when they are done. On a small site one line is enough; big column footers suit sites with many destinations.",
    opts: [
      { l: "One line", v: "line" },
      { l: "Columns", v: "cols" },
      { l: "None", v: "none" },
    ],
    demo: (s, o) =>
      o.v === "line"
        ? `<div style="padding-top:12px;border-top:1px solid #eee;font-size:13px;color:#737373">Larkfield Rail is a made-up company for this demo.</div>`
        : o.v === "cols"
          ? `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;padding-top:12px;border-top:1px solid #eee;font-size:12.5px">${[
              ["Work", "makeEbook", "coverly", "Performance UI"],
              ["Play", "Spark", "Chess Path", "Icon Animator"],
              ["Contact", "Email", "X", "LinkedIn"],
            ]
              .map(
                (c) =>
                  `<div style="display:grid;gap:4px"><b style="font-weight:550">${c[0]}</b>${c
                    .slice(1)
                    .map((x) => `<span style="color:#737373">${x}</span>`)
                    .join("")}</div>`,
              )
              .join("")}</div>`
          : `<div style="font-size:13px;color:#a3a3a3">The page simply ends.</div>`,
  },
]);

area(
  "words",
  "Words",
  "Copy is part of the interface. These are the habits that make it read as written by a person.",
);
add("words", [
  {
    id: "case",
    t: "Capitalisation",
    src: "neilmcardle.com rules, Apple",
    repo: "both",
    why: "Sentence case reads like speech and stays consistent when labels change. Title Case Turns Every Button Into A Headline.",
    opts: [
      { l: "Sentence case", v: "s" },
      { l: "Title Case", v: "t" },
    ],
    demo: (s, o) => {
      const t = o.v === "t";
      return `<div style="font-size:20px;font-weight:520;letter-spacing:-.025em">${t ? "Protection And Extras" : "Protection and extras"}</div><div style="display:flex;gap:8px;margin-top:10px"><button style="height:32px;padding:0 14px;border:0;border-radius:999px;background:#1d1d1f;color:#fff;font-size:13px">${t ? "Continue To Payment" : "Continue to payment"}</button><button style="height:32px;padding:0 14px;border:1px solid #e0e0e0;border-radius:999px;background:#fff;font-size:13px">${t ? "Change Dates" : "Change dates"}</button></div>`;
    },
  },
  {
    id: "dashes",
    t: "Em dashes",
    src: "neilmcardle.com rules",
    repo: "both",
    why: "Generated copy leans on em dashes. Full stops, commas and colons do the same work and read as your voice.",
    opts: [
      { l: "None", v: false },
      { l: "Allowed", v: true },
    ],
    demo: (s, o) =>
      `<p style="margin:0;max-width:52ch;color:#5c5c5c">${o.v ? "I redesigned the flow — fewer steps, clearer prices — and conversion rose 5% in testing." : "I redesigned the flow with fewer steps and clearer prices. Conversion rose 5% in testing."}</p>`,
  },
  {
    id: "eyebrows",
    t: "Labels above headings",
    src: "neilmcardle.com rules, Impeccable",
    repo: "both",
    why: "A small tracked label over a heading is the single most common generated-page habit. The heading can carry its own weight.",
    opts: [
      { l: "Never", v: false },
      { l: "Allowed", v: true },
    ],
    demo: (s, o) =>
      `${o.v ? '<div style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#737373;font-weight:500;margin-bottom:6px">Case study</div>' : ""}<div style="font-size:24px;font-weight:520;letter-spacing:-.035em">Five steps to three</div><p style="margin:6px 0 0;color:#5c5c5c">Merging protections and add-ons into checkout.</p>`,
  },
  {
    id: "cta-labels",
    t: "Button labels",
    src: "frontend-design",
    repo: "both",
    why: "A button should say what happens when you press it, and the same action keeps the same name through the flow. Publish produces a toast that says Published.",
    opts: [
      { l: "Specific verbs", v: true },
      { l: "Generic", v: false },
    ],
    demo: (s, o) =>
      `<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><button style="height:34px;padding:0 14px;border:0;border-radius:999px;background:#1d1d1f;color:#fff;font-size:13px">${o.v ? "Book this car" : "Submit"}</button><button style="height:34px;padding:0 14px;border:1px solid #e0e0e0;border-radius:999px;background:#fff;font-size:13px">${o.v ? "Save for later" : "OK"}</button><span style="font-size:13px;color:#1f7a4a">${o.v ? "Car booked" : "Success!"}</span></div>`,
  },
  {
    id: "error-voice",
    t: "How errors speak",
    src: "frontend-design",
    repo: "both",
    why: "Errors name the problem and the way out, in the interface's voice. They do not apologise and they are never vague.",
    opts: [
      { l: "Problem and fix", v: 0 },
      { l: "Apologetic", v: 1 },
      { l: "Vague", v: 2 },
    ],
    demo: (s, o) =>
      `<p style="margin:0;font-size:14px;color:#b42318">${["This card has expired. Use another card or update the expiry date.", "Oops! We're so sorry, something went wrong with your payment.", "An error occurred."][o.v]}</p>`,
  },
  {
    id: "summary-closers",
    t: "Closing summary lines",
    src: "neilmcardle.com rules",
    repo: "both",
    why: "A last sentence that restates the paragraph is a generated-copy habit. Stop when the point is made.",
    opts: [
      { l: "Stop when done", v: false },
      { l: "Close with a summary", v: true },
    ],
    demo: (s, o) =>
      `<p style="margin:0;max-width:56ch;color:#5c5c5c">I mapped the flow, found where people left, and merged two steps into one. Conversion rose 5% in testing.${o.v ? " In short, fewer steps meant more bookings." : ""}</p>`,
  },
  {
    id: "meta-separators",
    t: "Joining details on one line",
    src: "frontend-design",
    repo: "both",
    why: "Strings of details joined with middle dots read as template chrome. Commas, or space between items, read as written.",
    opts: [
      { l: "Commas or space", v: false },
      { l: "Middle dots", v: true },
    ],
    demo: (s, o) =>
      `<div style="font-size:13px;color:#737373">${o.v ? "Product design · Checkout · 2026 · Shipped" : `<span style="display:inline-flex;gap:14px"><span>Product design, checkout</span><span>2026</span><span>Shipped</span></span>`}</div>`,
  },
  {
    id: "voice",
    t: "Who is speaking",
    src: "General practice",
    repo: "both",
    why: "A one-person studio that writes 'we' sounds like it is hiding something. 'I' is honest and specific; product copy can make the product the subject.",
    opts: [
      { l: "I", v: 0 },
      { l: "We", v: 1 },
      { l: "The product", v: 2 },
    ],
    demo: (s, o) =>
      `<p style="margin:0;max-width:52ch;color:#5c5c5c">${["I map your flow from search to confirmation and find where people drop off.", "We map your flow from search to confirmation and find where people drop off.", "Larkfield maps your flow from search to confirmation and finds where people drop off."][o.v]}</p>`,
  },
]);
