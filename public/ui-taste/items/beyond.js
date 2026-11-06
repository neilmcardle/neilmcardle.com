area(
  "showpiece",
  "Showpiece effects",
  "Things that exist to be looked at. Each one is worth it somewhere and costs something everywhere.",
);
add("showpiece", [
  {
    id: "particles",
    t: "Particle forms",
    src: "neilmcardle.com",
    repo: "looks",
    kind: "Motion",
    cost: 3,
    flush: true,
    why: "Thousands of points that form a shape and scatter under the cursor. Memorable once, expensive always, and it only runs while it is on screen.",
    hint: "Move the pointer across it.",
    dials: [
      ["n", "Particles", 200, 2400, 100, 900, ""],
      ["size", "Dot size", 0.6, 3, 0.1, 1.4, "px"],
      ["push", "Pointer push", 0, 120, 5, 60, "px"],
    ],
    demo: () =>
      `<canvas style="display:block;width:100%;height:220px;background:#111;touch-action:pan-y"></canvas>`,
    mount: (el, s) => {
      const cv = el.querySelector("canvas"),
        dpr = Math.min(2, devicePixelRatio || 1),
        W = cv.clientWidth,
        H = cv.clientHeight;
      cv.width = W * dpr;
      cv.height = H * dpr;
      const g = cv.getContext("2d");
      g.scale(dpr, dpr);
      const off = document.createElement("canvas");
      off.width = W;
      off.height = H;
      const og = off.getContext("2d");
      og.fillStyle = "#fff";
      og.font = `600 ${H * 0.95}px Inter, sans-serif`;
      og.textAlign = "center";
      og.textBaseline = "middle";
      og.fillText("N", W / 2, H / 2 + H * 0.04);
      const data = og.getImageData(0, 0, W, H).data,
        spots = [];
      for (let y = 0; y < H; y += 2)
        for (let x = 0; x < W; x += 2)
          if (data[(y * W + x) * 4 + 3] > 128) spots.push([x, y]);
      const P = Array.from({ length: s.d.n }, () => {
        const t = spots[(Math.random() * spots.length) | 0] || [W / 2, H / 2];
        return {
          x: Math.random() * W,
          y: Math.random() * H,
          tx: t[0],
          ty: t[1],
          vx: 0,
          vy: 0,
        };
      });
      let mx = -999,
        my = -999,
        raf;
      const mv = (e) => {
        const r = cv.getBoundingClientRect();
        mx = e.clientX - r.left;
        my = e.clientY - r.top;
      };
      const lv = () => {
        mx = my = -999;
      };
      cv.addEventListener("pointermove", mv);
      cv.addEventListener("pointerleave", lv);
      const tick = () => {
        g.clearRect(0, 0, W, H);
        g.fillStyle = "#f2f2f2";
        for (const p of P) {
          const dx = p.x - mx,
            dy = p.y - my,
            d2 = dx * dx + dy * dy,
            r = s.d.push;
          if (r && d2 < r * r) {
            const d = Math.sqrt(d2) || 1,
              f = (r - d) / r;
            p.vx += (dx / d) * f * 3;
            p.vy += (dy / d) * f * 3;
          }
          p.vx += (p.tx - p.x) * 0.04;
          p.vy += (p.ty - p.y) * 0.04;
          p.vx *= 0.82;
          p.vy *= 0.82;
          p.x += p.vx;
          p.y += p.vy;
          g.fillRect(p.x, p.y, s.d.size, s.d.size);
        }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return () => {
        cancelAnimationFrame(raf);
        cv.removeEventListener("pointermove", mv);
        cv.removeEventListener("pointerleave", lv);
      };
    },
    css: (s) =>
      `${s.d.n} particles, ${s.d.size}px, push radius ${s.d.push}px.\nCanvas 2D or WebGL. Pause when off screen; static image for reduced motion.`,
  },
  {
    id: "living-gradient",
    t: "Living background",
    src: "makeEbook intro",
    repo: "looks",
    kind: "Motion",
    flush: true,
    why: "Slow-moving colour behind a hero gives a page atmosphere. Large blurred layers repaint constantly, so they cost more than they look.",
    opts: [
      { l: "Static gradient", v: "static", c: 0 },
      { l: "Drifting blobs", v: "blobs", c: 2 },
    ],
    dials: [
      ["sp", "Cycle", 4, 30, 1, 14, "s"],
      ["blur", "Softness", 20, 120, 5, 60, "px"],
    ],
    demo: (s, o) => {
      const blob = (c, x, y, gx, gy, d) =>
        `<div style="position:absolute;left:${x}%;top:${y}%;width:55%;aspect-ratio:1;border-radius:50%;background:${c};filter:blur(${s.d.blur}px);--gx:${gx}px;--gy:${gy}px;${o.v === "blobs" ? `animation:d-glow ${s.d.sp}s ease-in-out ${d}s infinite` : ""}"></div>`;
      return `<div style="position:relative;height:200px;overflow:hidden;background:#0f1115">${blob("#3d2bd8", -10, -30, 80, 40, 0)}${blob("#be2d18", 50, 10, -60, -30, -3)}${blob("#deea53", 20, 50, 40, -50, -6)}<div style="position:absolute;left:24px;bottom:20px;color:#fff;font-size:24px;font-weight:520;letter-spacing:-.04em">Fewer steps</div></div>`;
    },
  },
  {
    id: "glass",
    t: "Glass panels",
    src: "Apple",
    repo: "looks",
    cost: 2,
    flush: true,
    why: "Translucent surfaces keep content visible underneath and show hierarchy. As decoration they are a tell, and every blur is paid for on scroll.",
    dials: [
      ["blur", "Blur", 0, 40, 1, 18, "px"],
      ["tint", "White tint", 0.1, 0.9, 0.05, 0.45, ""],
      ["sat", "Saturation", 100, 220, 10, 170, "%"],
    ],
    demo: (s) =>
      `<div style="position:relative;height:200px;background:linear-gradient(135deg,#be2d18,#deea53 45%,#3d2bd8);overflow:hidden"><div style="position:absolute;inset:0;display:grid;grid-template-columns:repeat(6,1fr);gap:10px;padding:10px;opacity:.6">${Array.from({ length: 18 }, (_, i) => `<div style="border-radius:6px;background:${i % 3 ? "#fff" : "#1d1d1f"};height:50px"></div>`).join("")}</div><div style="position:absolute;left:24px;right:24px;bottom:20px;padding:14px 16px;border-radius:16px;background:rgb(255 255 255/${s.d.tint});backdrop-filter:blur(${s.d.blur}px) saturate(${s.d.sat}%);-webkit-backdrop-filter:blur(${s.d.blur}px) saturate(${s.d.sat}%);border:1px solid rgb(255 255 255/.5);font-weight:550">Two rooms left at this price</div></div>`,
    css: (s) =>
      `background: rgb(255 255 255 / ${s.d.tint});\nbackdrop-filter: blur(${s.d.blur}px) saturate(${s.d.sat}%);\nborder: 1px solid rgb(255 255 255 / .5);\n@media (prefers-reduced-transparency: reduce) { background: #fff; backdrop-filter: none; }`,
    tw: (s) =>
      `bg-white/${Math.round(s.d.tint * 100)} backdrop-blur-[${s.d.blur}px] backdrop-saturate-[${s.d.sat / 100}]`,
  },
  {
    id: "tilt",
    t: "Tilt toward the pointer",
    src: "Emil Kowalski",
    repo: "looks",
    kind: "Motion",
    cost: 1,
    why: "A card that leans toward the cursor feels physical. Tying it straight to the mouse feels mechanical; easing toward the target feels alive.",
    hint: "Move over the card.",
    dials: [
      ["max", "Max tilt", 2, 20, 1, 8, "°"],
      ["ease", "Smoothing", 0.04, 0.4, 0.01, 0.12, ""],
    ],
    demo: () =>
      `<div style="perspective:800px;display:grid;place-items:center;padding:12px"><div data-card style="width:240px;aspect-ratio:3/4;border-radius:14px;background:linear-gradient(160deg,#2b2b2e,#5a5a60);box-shadow:0 20px 40px rgb(0 0 0/.2);transform-style:preserve-3d;display:flex;align-items:flex-end;padding:16px;color:#fff;font-weight:550">The Rainy City</div></div>`,
    mount: (el, s) => {
      const c = el.querySelector("[data-card]");
      let tx = 0,
        ty = 0,
        x = 0,
        y = 0,
        raf;
      const mv = (e) => {
        const r = c.getBoundingClientRect();
        tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
      };
      const lv = () => {
        tx = ty = 0;
      };
      el.addEventListener("pointermove", mv);
      el.addEventListener("pointerleave", lv);
      const tick = () => {
        x += (tx - x) * s.d.ease;
        y += (ty - y) * s.d.ease;
        c.style.transform = `rotateY(${x * s.d.max}deg) rotateX(${-y * s.d.max}deg)`;
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return () => {
        cancelAnimationFrame(raf);
        el.removeEventListener("pointermove", mv);
        el.removeEventListener("pointerleave", lv);
      };
    },
    css: (s) =>
      `max tilt ${s.d.max}°, lerp ${s.d.ease} per frame, perspective 800px.\nGate behind (hover: hover) and prefers-reduced-motion: no-preference.`,
  },
  {
    id: "magnetic",
    t: "Magnetic buttons",
    src: "Studio sites",
    repo: "looks",
    kind: "Motion",
    cost: 1,
    why: "A button that drifts toward the cursor invites a click. Strong pull feels gimmicky; a little feels responsive.",
    hint: "Move near the button.",
    dials: [["k", "Pull", 0.05, 0.6, 0.01, 0.25, ""]],
    demo: () =>
      `<div data-zone style="display:grid;place-items:center;height:150px"><button data-mag style="height:44px;padding:0 22px;border:0;border-radius:999px;background:#1d1d1f;color:#fff;font-size:14px;transition:transform 300ms cubic-bezier(.23,1,.32,1)">Book a call</button></div>`,
    mount: (el, s) => {
      const z = el.querySelector("[data-zone]"),
        b = el.querySelector("[data-mag]");
      const mv = (e) => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * s.d.k}px, ${(e.clientY - r.top - r.height / 2) * s.d.k}px)`;
      };
      const lv = () => {
        b.style.transform = "";
      };
      z.addEventListener("pointermove", mv);
      z.addEventListener("pointerleave", lv);
      return () => {
        z.removeEventListener("pointermove", mv);
        z.removeEventListener("pointerleave", lv);
      };
    },
  },
  {
    id: "text-effects",
    t: "Headline entrances",
    src: "torph, studio sites",
    repo: "looks",
    kind: "Motion",
    cost: 1,
    play: true,
    why: "A headline that writes itself on is a strong first moment. Used on every heading it becomes noise, and it must never delay reading.",
    opts: [
      { l: "Letters rise", v: "letters" },
      { l: "Mask wipe", v: "wipe" },
      { l: "Scramble", v: "scramble" },
    ],
    demo: (s, o) => {
      const t = "Booking flows with fewer steps.";
      const base =
        "font-size:32px;font-weight:520;letter-spacing:-.045em;line-height:1.1";
      if (o.v === "letters")
        return `<div style="${base}" aria-label="${t}">${[...t].map((ch, i) => `<span aria-hidden="true" style="display:inline-block;white-space:pre;animation:d-letter 500ms cubic-bezier(.2,.8,0,1) ${200 + i * 22}ms both">${ch}</span>`).join("")}</div>`;
      if (o.v === "wipe")
        return `<div style="${base};animation:d-wipe 900ms cubic-bezier(.77,0,.175,1) 200ms both">${t}</div>`;
      return `<div data-scr style="${base};font-variant-numeric:tabular-nums">${t}</div>`;
    },
    mount: (el, s, o) => {
      if (o.v !== "scramble") return;
      const n = el.querySelector("[data-scr]"),
        t = n.textContent,
        chars = "abcdefghijklmnopqrstuvwxyz";
      let f = 0,
        raf;
      const tick = () => {
        f++;
        n.textContent = [...t]
          .map((ch, i) =>
            ch === " " || i < f / 2 ? ch : chars[(Math.random() * 26) | 0],
          )
          .join("");
        if (f / 2 < t.length) raf = requestAnimationFrame(tick);
        else n.textContent = t;
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    },
  },
  {
    id: "cursor",
    t: "Custom cursor",
    src: "Studio sites",
    repo: "looks",
    kind: "Motion",
    cost: 1,
    why: "A follower or spotlight cursor makes a page feel like a place. It also hides the one thing people rely on to know where they are pointing.",
    hint: "Move inside the box.",
    opts: [
      { l: "System cursor", v: "none", c: 0 },
      { l: "Trailing dot", v: "dot" },
      { l: "Spotlight", v: "spot" },
    ],
    demo: (s, o) =>
      `<div data-cz style="position:relative;height:160px;border-radius:8px;overflow:hidden;background:${o.v === "spot" ? "#111" : "#fafafa"};${o.v === "dot" ? "cursor:none" : ""}"><div style="position:absolute;inset:0;display:grid;place-items:center;font-size:24px;font-weight:520;letter-spacing:-.04em;color:${o.v === "spot" ? "#333" : "#1d1d1f"}">Playground</div>${o.v === "dot" ? '<div data-dot style="position:absolute;left:0;top:0;width:14px;height:14px;margin:-7px;border-radius:50%;background:#1d1d1f;pointer-events:none;opacity:0"></div>' : ""}${o.v === "spot" ? '<div data-spot style="position:absolute;inset:0;pointer-events:none;background:radial-gradient(160px at var(--x,50%) var(--y,50%),rgb(255 255 255/.9),transparent 70%);mix-blend-mode:overlay"></div>' : ""}</div>`,
    mount: (el, s, o) => {
      const z = el.querySelector("[data-cz]"),
        d = el.querySelector("[data-dot]"),
        sp = el.querySelector("[data-spot]");
      let x = 0,
        y = 0,
        tx = 0,
        ty = 0,
        raf;
      const mv = (e) => {
        const r = z.getBoundingClientRect();
        tx = e.clientX - r.left;
        ty = e.clientY - r.top;
        if (d) d.style.opacity = 1;
        if (sp) {
          sp.style.setProperty("--x", tx + "px");
          sp.style.setProperty("--y", ty + "px");
        }
      };
      z.addEventListener("pointermove", mv);
      const tick = () => {
        x += (tx - x) * 0.2;
        y += (ty - y) * 0.2;
        if (d) d.style.transform = `translate(${x}px,${y}px)`;
        raf = requestAnimationFrame(tick);
      };
      if (d) raf = requestAnimationFrame(tick);
      return () => {
        cancelAnimationFrame(raf);
        z.removeEventListener("pointermove", mv);
      };
    },
  },
  {
    id: "marquee",
    t: "Scrolling strips",
    src: "Studio sites",
    repo: "looks",
    kind: "Motion",
    cost: 1,
    why: "An endless strip of logos or words adds movement without interaction. It should pause on hover and stop for reduced motion.",
    dials: [["dur", "One loop", 8, 60, 1, 28, "s"]],
    demo: (s) => {
      const items = [
        "makeEbook",
        "coverly",
        "Spark",
        "DoodleWire",
        "Performance UI",
        "Podium",
      ];
      const row = items
        .map(
          (x) =>
            `<span style="padding:0 28px;font-size:22px;font-weight:520;letter-spacing:-.03em;white-space:nowrap">${x}</span>`,
        )
        .join("");
      return `<style>.d-mq:hover>div{animation-play-state:paused}</style><div class="d-mq" style="overflow:hidden;mask-image:linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent)"><div style="display:flex;width:max-content;animation:d-marquee ${s.d.dur}s linear infinite">${row}${row}</div></div>`;
    },
    css: (s) =>
      `animation: marquee ${s.d.dur}s linear infinite;\n&:hover { animation-play-state: paused; }\n@media (prefers-reduced-motion: reduce) { animation: none; }`,
  },
  {
    id: "scroll-driven",
    t: "Scroll-linked motion",
    src: "Web platform",
    repo: "looks",
    kind: "Motion",
    cost: 1,
    why: "CSS can now tie an animation to scroll position with no JavaScript, and it runs off the main thread. Good for progress and gentle parallax; bad when it hijacks scrolling.",
    hint: "Scroll inside the box.",
    opts: [
      { l: "Progress bar", v: "bar" },
      { l: "Image grows in", v: "grow" },
    ],
    demo: (s, o) =>
      `<style>@keyframes d-prog{from{transform:scaleX(0)}to{transform:scaleX(1)}}@keyframes d-grow{from{transform:scale(.8);border-radius:40px}to{transform:scale(1);border-radius:10px}}</style><div style="height:200px;overflow:auto;border-radius:8px;border:1px solid #eee;position:relative;scroll-timeline:--box">${o.v === "bar" ? '<div style="position:sticky;top:0;height:3px;background:#1d1d1f;transform-origin:left;animation:d-prog linear both;animation-timeline:scroll(nearest)"></div>' : ""}<div style="padding:16px">${bars(6)}${o.v === "grow" ? '<div style="height:140px;margin:14px 0;background:linear-gradient(135deg,#2b3240,#8a7f72);animation:d-grow linear both;animation-timeline:view();animation-range:entry 0% cover 50%"></div>' : ""}${bars(14)}</div></div>`,
    css: (s, o) =>
      o.v === "bar"
        ? "animation: progress linear both;\nanimation-timeline: scroll();"
        : "animation: grow linear both;\nanimation-timeline: view();\nanimation-range: entry 0% cover 50%;",
  },
  {
    id: "grain",
    t: "Grain and texture",
    src: "makeEbook brand",
    repo: "looks",
    cost: 1,
    flush: true,
    why: "A whisper of noise makes flat colour feel printed rather than rendered. A tiny SVG filter does it with no image download.",
    dials: [
      ["a", "Strength", 0, 0.4, 0.01, 0.12, ""],
      ["f", "Fineness", 0.4, 1.4, 0.05, 0.85, ""],
    ],
    demo: (s) =>
      `<div style="position:relative;height:180px;background:#141413;color:#f3efe5;display:grid;place-items:center;font-size:28px;font-weight:520;letter-spacing:-.04em;overflow:hidden">The Rainy City<svg style="position:absolute;inset:0;width:100%;height:100%;opacity:${s.d.a};mix-blend-mode:soft-light;pointer-events:none"><filter id="gr${Math.round(s.d.f * 100)}"><feTurbulence type="fractalNoise" baseFrequency="${s.d.f}" numOctaves="3" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(#gr${Math.round(s.d.f * 100)})"/></svg></div>`,
    css: (s) =>
      `SVG feTurbulence baseFrequency ${s.d.f}, opacity ${s.d.a}, mix-blend-mode: soft-light.`,
  },
  {
    id: "sound",
    t: "Interface sound",
    src: "Apple",
    repo: "looks",
    cost: 0,
    why: "Sound on a meaningful moment, like a booking confirmed, can make it land. It has to fire on the same frame as the visual, and almost everything else stays silent.",
    hint: "Press Confirm with your sound on.",
    opts: [
      { l: "Silent", v: false },
      { l: "Soft tick on key moments", v: true },
    ],
    demo: () =>
      `<button data-snd style="height:40px;padding:0 18px;border:0;border-radius:999px;background:#1d1d1f;color:#fff;font-size:14px" class="d-press" data-m="scale">Confirm booking</button>`,
    mount: (el, s, o) => {
      let ctx;
      el.querySelector("[data-snd]").addEventListener("pointerdown", () => {
        if (!o.v) return;
        ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
        const t = ctx.currentTime,
          os = ctx.createOscillator(),
          g = ctx.createGain();
        os.type = "sine";
        os.frequency.setValueAtTime(880, t);
        os.frequency.exponentialRampToValueAtTime(1320, t + 0.06);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.12, t + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
        os.connect(g).connect(ctx.destination);
        os.start(t);
        os.stop(t + 0.2);
      });
      return () => ctx && ctx.close();
    },
  },
  {
    id: "intro",
    t: "Intro sequence",
    src: "neilmcardle.com",
    repo: "looks",
    cost: 1,
    why: "An intro sets the tone once. Shown on every visit it becomes a wall between people and the work.",
    opts: [
      { l: "None", v: "none", c: 0 },
      { l: "First visit only", v: "first" },
      { l: "Every visit", v: "every", c: 2 },
    ],
    def: 1,
    rule: (s, o) =>
      ({
        none: "No intro.",
        first:
          "Play once, remember it, and let any key or click finish it immediately.",
        every: "Play on every load.",
      })[o.v],
  },
]);

area(
  "performance",
  "Performance",
  "What visitors never see but always feel. Most of this is decided before any pixel is drawn.",
);
add("performance", [
  {
    id: "budgets",
    t: "Page weight budget",
    src: "Vercel, web.dev",
    repo: "perf",
    kind: "Invisible",
    why: "A budget turns speed from a hope into a rule. Set it before building, and treat going over it as a bug.",
    dials: [
      ["js", "JavaScript", 0, 400, 10, 80, " KB"],
      ["total", "Whole page", 200, 3000, 50, 800, " KB"],
      ["fonts", "Font files", 0, 6, 1, 1, ""],
      ["req", "Requests", 5, 80, 1, 25, ""],
    ],
    demo: (s) => {
      const row = (l, v, typ, max) =>
        `<div style="margin:8px 0"><div style="display:flex;justify-content:space-between;font-size:12.5px"><span>${l}</span><span style="color:#737373;font-variant-numeric:tabular-nums">Budget ${v}, typical ${typ}${String(v).includes("KB") ? " KB" : ""}</span></div><div style="position:relative;height:8px;border-radius:4px;background:#f1f1f1;margin-top:4px"><div style="position:absolute;inset:0 auto 0 0;width:${Math.min(100, (typ / max) * 100)}%;background:#e2e2e2;border-radius:4px"></div><div style="position:absolute;inset:0 auto 0 0;width:${Math.min(100, (parseFloat(v) / max) * 100)}%;background:#1d1d1f;border-radius:4px"></div></div></div>`;
      return (
        row("JavaScript", s.d.js + " KB", 550, 800) +
        row("Whole page", s.d.total + " KB", 2200, 3000) +
        row("Font files", s.d.fonts, 4, 8) +
        row("Requests", s.d.req, 70, 100) +
        '<p style="margin:8px 0 0;font-size:12px;color:#737373">Typical figures are rough medians for a mobile page, for scale only.</p>'
      );
    },
    css: (s) =>
      JSON.stringify(
        {
          javascriptKB: s.d.js,
          totalKB: s.d.total,
          fontFiles: s.d.fonts,
          requests: s.d.req,
        },
        null,
        2,
      ),
  },
  {
    id: "vitals",
    t: "Speed targets",
    src: "Google Core Web Vitals",
    repo: "perf",
    kind: "Invisible",
    why: "Largest paint is how fast it looks loaded, interaction delay is how fast it responds, and layout shift is how much it jumps. Pick targets stricter than the pass mark.",
    dials: [
      ["lcp", "Largest paint", 0.8, 4, 0.1, 1.8, "s"],
      ["inp", "Interaction delay", 50, 500, 10, 120, "ms"],
      ["cls", "Layout shift", 0, 0.25, 0.01, 0.02, ""],
    ],
    demo: (s) => {
      const g = (v, good, poor) =>
        v <= good
          ? ["Good", "#1f7a4a"]
          : v <= poor
            ? ["Needs work", "#9a5b00"]
            : ["Poor", "#b42318"];
      return [
        ["Largest paint", s.d.lcp + "s", g(s.d.lcp, 2.5, 4)],
        ["Interaction delay", s.d.inp + "ms", g(s.d.inp, 200, 500)],
        ["Layout shift", s.d.cls, g(s.d.cls, 0.1, 0.25)],
      ]
        .map(
          ([l, v, [t, c]], i) =>
            `<div style="display:flex;justify-content:space-between;padding:9px 0;border-top:${i ? "1px solid #eee" : "0"}"><span>${l}</span><span style="font-variant-numeric:tabular-nums">${v} <span style="color:${c};font-size:12.5px;margin-left:8px">${t}</span></span></div>`,
        )
        .join("");
    },
    css: (s) =>
      `LCP <= ${s.d.lcp}s\nINP <= ${s.d.inp}ms\nCLS <= ${s.d.cls}\nMeasured at the 75th percentile on mobile.`,
  },
  {
    id: "rendering",
    t: "How pages are built",
    src: "Vercel",
    repo: "perf",
    kind: "Invisible",
    why: "Static HTML arrives ready to read. Server rendering with small interactive islands is close behind. A client-side app shows nothing until its JavaScript runs.",
    opts: [
      { l: "Static HTML", v: "static", c: 0 },
      { l: "Server-rendered, small islands", v: "islands", c: 0 },
      { l: "Client-side app", v: "spa", c: 2 },
    ],
    def: 1,
    demo: (s, o) => {
      const seg = {
        static: [
          ["HTML ready", 85, "#1d1d1f"],
          ["Islands wake", 15, "#8a8a8a"],
        ],
        islands: [
          ["Server render", 15, "#cfcfcf"],
          ["HTML ready", 70, "#1d1d1f"],
          ["Islands wake", 15, "#8a8a8a"],
        ],
        spa: [
          [
            "Blank",
            45,
            "repeating-linear-gradient(45deg,#eee 0 4px,#fafafa 4px 8px)",
          ],
          ["JS runs", 25, "#cfcfcf"],
          ["Readable", 30, "#1d1d1f"],
        ],
      }[o.v];
      return `<div style="display:flex;height:26px;border-radius:6px;overflow:hidden;border:1px solid #e8e8e8">${seg.map((x) => `<div style="width:${x[1]}%;background:${x[2]}"></div>`).join("")}</div><div style="display:flex;gap:14px;margin-top:8px;font-size:12px;color:#5c5c5c">${seg.map((x) => `<span>${x[0]}</span>`).join("")}</div>`;
    },
  },
  {
    id: "javascript",
    t: "JavaScript habits",
    src: "Vercel React rules",
    repo: "perf",
    kind: "Invisible",
    why: "Every kilobyte of script is parsed and run on the visitor's phone. The cheapest script is the one never sent.",
    checks: [
      "Server components by default, client only where there is interaction",
      "Load heavy components only when they are needed",
      "Import from the exact file, not barrel index files",
      "Defer analytics and third parties until after load",
      "No inline component definitions that remount on every render",
      "Animate through refs, never through state",
    ],
    rule: (s) =>
      s.c
        ? Object.keys(s.c)
            .filter((k) => s.c[k])
            .map(
              (k) => "- " + ITEMS.find((i) => i.id === "javascript").checks[k],
            )
            .join("\n")
        : "",
  },
  {
    id: "font-budget",
    t: "How many fonts",
    src: "Vercel, Impeccable",
    repo: "perf",
    kind: "Invisible",
    why: "Each family and weight is another download in the way of the text. One variable family covers every weight in one file.",
    opts: [
      { l: "System only", v: 0, c: 0 },
      {
        l: "One variable family",
        v: 45,
        c: 1,
        n: "Yours: Inter variable, self-hosted by next/font.",
      },
      { l: "Two families", v: 90, c: 1 },
      { l: "Three or more", v: 160, c: 2 },
    ],
    def: 1,
    demo: (s, o) =>
      `<div style="font-size:28px;font-weight:520;letter-spacing:-.03em;font-variant-numeric:tabular-nums">${o.v ? `about ${o.v} KB` : "0 KB"}</div><p style="margin:4px 0 0;font-size:13px;color:#737373">Rough size of compressed, subset woff2 files before any text can render in the real face.</p>`,
  },
  {
    id: "images",
    t: "Image habits",
    src: "web.dev, Next.js",
    repo: "perf",
    kind: "Invisible",
    why: "Images are usually most of a page's weight. Modern formats, the right size for the screen and lazy loading below the fold do most of the work.",
    checks: [
      "AVIF or WebP, with a fallback",
      "Sized for the screen with srcset and sizes",
      "Lazy-load everything below the fold",
      "High fetch priority on the main hero image",
      "Width and height or aspect-ratio always set",
      "No image over about 200 KB without a reason",
    ],
    css: () =>
      '<img src="hero.avif" width="1200" height="675"\n  sizes="(max-width: 699px) 100vw, 600px"\n  fetchpriority="high" alt="...">\n<img loading="lazy" decoding="async" ...>',
  },
  {
    id: "layout-shift",
    t: "Holding space for what loads",
    src: "web.dev",
    repo: "perf",
    kind: "Motion",
    play: true,
    why: "When an image or ad arrives late and pushes text down, people lose their place or tap the wrong thing. Reserve the space before it loads.",
    opts: [
      { l: "Reserve the space", v: true },
      { l: "Let it push in", v: false },
    ],
    demo: (s, o) =>
      `<div style="position:relative;height:150px;overflow:hidden;max-width:360px"><div style="${o.v ? "aspect-ratio:16/5" : "height:0;animation:d-grow-h 0s 1s forwards"};border-radius:8px;background:${o.v ? "#ececec" : "linear-gradient(135deg,#5b6b82,#b9967a)"};position:relative"><div style="position:absolute;inset:0;border-radius:8px;background:linear-gradient(135deg,#5b6b82,#b9967a);animation:d-fade 300ms ease 1s both"></div></div><style>@keyframes d-grow-h{to{height:72px}}</style><p style="margin:10px 0 0;color:#5c5c5c;font-size:14px">I redesigned a train booking flow, merging seats and extras into one step.</p><button style="margin-top:8px;height:32px;padding:0 14px;border:0;border-radius:999px;background:#1d1d1f;color:#fff;font-size:13px">Read the case study</button></div>`,
    css: (s, o) =>
      o.v
        ? "aspect-ratio: 16 / 5;\n/* or width and height attributes on the img */"
        : "/* nothing reserved */",
  },
  {
    id: "third-party",
    t: "Third-party code",
    src: "Vercel",
    repo: "perf",
    kind: "Invisible",
    why: "Every outside script can slow the page, break it, or read what is on it.",
    checks: [
      "No third-party scripts unless they earn it",
      "Analytics loads after the page is idle",
      "Video and map embeds load on click behind a still image",
      "Fonts are self-hosted, not fetched from another domain",
      "A content security policy lists every allowed source",
    ],
  },
  {
    id: "video",
    t: "Video habits",
    src: "neilmcardle.com",
    repo: "perf",
    kind: "Invisible",
    why: "Autoplaying video is the heaviest thing most portfolios ship. A poster and loading only when visible keep it from blocking everything else.",
    checks: [
      'preload="none" with a poster image',
      "Muted autoplay only while in view",
      "Paused when scrolled off screen",
      "A modern codec with an H.264 fallback",
      "Loops kept short, ideally under 2 MB",
    ],
    css: () =>
      '<video muted playsinline loop preload="none"\n  poster="first-frame.jpg">\n  <source src="clip.webm" type="video/webm">\n  <source src="clip.mp4" type="video/mp4">\n</video>',
  },
  {
    id: "animation-cost",
    t: "Animation that stays smooth",
    src: "animation-performance",
    repo: "perf",
    kind: "Invisible",
    why: "Transform and opacity skip layout and paint. Width, height, margin and top redo the whole page every frame.",
    checks: [
      "Animate transform and opacity, not size or position",
      "CSS or the Web Animations API for set pieces",
      "Never transition: all",
      "will-change only after seeing a problem",
      "Blur under 20px and never on large animated areas",
      "Never animate a CSS variable on a parent",
    ],
    css: () =>
      "/* instead of */ width, height, top, left, margin\n/* animate */ transform: scale() translate(); opacity",
  },
  {
    id: "perceived",
    t: "Feeling fast",
    src: "Emil Kowalski, Vercel",
    repo: "perf",
    kind: "Invisible",
    why: "Perceived speed is what people judge. Starting work before the click and showing results before the server answers both feel like a faster site.",
    checks: [
      "Prefetch links when they come into view or on hover",
      "Optimistic updates for likely outcomes",
      "Show loading states only after about 300ms",
      "Fast-spinning spinners",
      "Tooltips instant after the first",
      "No-flash theme script before paint",
    ],
  },
  {
    id: "long-pages",
    t: "Long pages",
    src: "Vercel, break-ui",
    repo: "perf",
    kind: "Invisible",
    why: "Browsers lay out and paint everything on a page, even what is far off screen, unless told otherwise.",
    checks: [
      "content-visibility: auto on off-screen sections",
      "Virtualise any list over a few hundred rows",
      "Start heavy demos only when they scroll into view",
      "Pause canvas and video loops off screen",
    ],
    css: () =>
      "section { content-visibility: auto; contain-intrinsic-size: auto 800px; }",
  },
]);

area(
  "access",
  "Access and resilience",
  "Works for everyone, on every device, with whatever data turns up.",
);
add("access", [
  {
    id: "contrast",
    t: "Contrast target",
    src: "WCAG, Impeccable",
    repo: "both",
    why: "AA is the legal floor for most sites. AAA is stricter and rules out most light greys. Either way, check computed colours, not your eyes.",
    opts: [
      { l: "AA, 4.5:1", v: 4.5 },
      { l: "AAA, 7:1", v: 7 },
    ],
    demo: (s, o) =>
      ["#1d1d1f", "#5c5c5c", "#737373", "#8a8a8a", "#a3a3a3"]
        .map((c) => {
          const r = +ratio(c, "#fafafa");
          return `<div style="display:flex;align-items:center;gap:12px;padding:6px 0"><span style="width:18px;height:18px;border-radius:4px;background:${c}"></span><span style="color:${c};flex:1">Reading text in ${c}</span><span style="font-size:12.5px;font-variant-numeric:tabular-nums;color:${r >= o.v ? "#1f7a4a" : "#b42318"}">${r}:1 ${r >= o.v ? "passes" : "fails"}</span></div>`;
        })
        .join(""),
    rule: (s, o) =>
      `Body text ${o.v}:1 or more. Large text and icons ${o.v === 7 ? "4.5" : "3"}:1 or more.`,
  },
  {
    id: "targets",
    t: "Touch target size",
    src: "WCAG, Apple",
    repo: "both",
    why: "The visible mark can be small; the area that takes the tap should not be. Apple asks for 44pt, WCAG for at least 24px.",
    hint: "Dashed outlines show the tappable area.",
    dials: [["t", "Tap area", 24, 48, 1, 44, "px"]],
    demo: (s) =>
      `<div style="display:flex;gap:4px">${["search", "bell", "heart", "user"].map((n) => `<span style="display:grid;place-items:center;width:${s.d.t}px;height:${s.d.t}px;outline:1px dashed #bdbdbd;outline-offset:-1px;border-radius:6px">${icon(n, { size: 16 })}</span>`).join("")}</div>`,
    css: (s) => `min-width: ${s.d.t}px;\nmin-height: ${s.d.t}px;`,
    tw: (s) => `min-w-[${s.d.t}px] min-h-[${s.d.t}px]`,
  },
  {
    id: "keyboard",
    t: "Keyboard",
    src: "WCAG",
    repo: "both",
    why: "Plenty of people never touch a mouse. Everything that can be clicked must be reachable, visible and escapable from the keyboard.",
    checks: [
      "Every control reachable with Tab in a sensible order",
      "Focus always visible",
      "Escape closes menus and dialogs and returns focus",
      "A skip link to the main content",
      "Real buttons and links, never clickable divs",
    ],
  },
  {
    id: "preferences",
    t: "Respecting system settings",
    src: "Apple, web platform",
    repo: "both",
    why: "People tell their devices what they need. Pages should listen to reduced motion, reduced transparency, higher contrast and their chosen text size.",
    checks: [
      "prefers-reduced-motion",
      "prefers-reduced-transparency",
      "prefers-contrast: more",
      "forced-colors (Windows high contrast)",
      "Sizes in rem so text settings scale the layout",
    ],
    css: (s) =>
      [
        "@media (prefers-reduced-motion: reduce) {}",
        "@media (prefers-reduced-transparency: reduce) {}",
        "@media (prefers-contrast: more) {}",
        "@media (forced-colors: active) {}",
        "font-size: 1rem;",
      ]
        .filter((_, i) => s.c[i])
        .join("\n"),
  },
  {
    id: "worst-case",
    t: "Worst-case content",
    src: "break-ui",
    repo: "both",
    why: "Designs are drawn with tidy names. Real data has a 40-character surname, no photo and an email with no spaces. Lay out for that.",
    opts: [
      { l: "Demo data", v: "demo" },
      { l: "Worst case, unfixed", v: "bad" },
      { l: "Worst case, fixed", v: "good" },
    ],
    demo: (s, o) => {
      const worst = o.v !== "demo",
        fixed = o.v === "good";
      const name = worst ? "Bartholomew Fitzgerald-Montgomery III" : "Sam Lee",
        mail = worst
          ? "bartholomew.fitzgerald@northwind-industries-holdings.example.com"
          : "sam@acme.com";
      return `<div style="width:300px;display:flex;align-items:center;gap:10px;padding:10px;border:1px solid #e8e8e8;border-radius:10px"><span style="width:32px;height:32px;border-radius:50%;background:#e3e3e3;display:grid;place-items:center;font-size:12px;${fixed ? "flex-shrink:0" : ""}">${worst ? "BF" : "SL"}</span><span style="display:grid;${fixed ? "min-width:0;flex:1" : ""}"><span style="font-weight:550;font-size:14px">${name}</span><span style="font-size:12.5px;color:#737373;${fixed ? "overflow-wrap:anywhere" : "white-space:nowrap"}">${mail}</span></span><span style="width:28px;height:28px;border-radius:6px;border:1px solid #e8e8e8;display:grid;place-items:center;${fixed ? "flex-shrink:0" : ""}">⋯</span></div>`;
    },
    css: () =>
      ".avatar, .menu { flex-shrink: 0; }\n.text { min-width: 0; }\n.email { overflow-wrap: anywhere; }",
  },
  {
    id: "mobile-native",
    t: "Feeling native on a phone",
    src: "mobile-native",
    repo: "both",
    why: "A handful of small fixes separate a website in a browser from something that feels installed.",
    checks: [
      "No grey tap flash",
      "Hover gated to real pointers",
      "100dvh for app shells, 100svh for heroes",
      "Inputs at 16px so iOS does not zoom",
      "Feedback on press, not on release",
      "overscroll-behavior where pull-to-refresh would hijack",
      "Safe-area insets with viewport-fit=cover",
      "theme-color for light and dark",
      "Tested on a real phone",
    ],
    css: () =>
      "-webkit-tap-highlight-color: transparent;\nmin-height: 100svh;\ninput { font-size: 16px; }\ntouch-action: manipulation;\npadding-bottom: env(safe-area-inset-bottom);",
  },
  {
    id: "language",
    t: "Other languages and formats",
    src: "break-ui, Impeccable",
    repo: "both",
    why: "German labels run about a third longer than English. Numbers, dates, currencies and plurals all change by locale.",
    checks: [
      "Room for labels 40% longer",
      "Intl.NumberFormat and DateTimeFormat for every figure",
      "Intl.PluralRules, never a hardcoded 's'",
      "No words baked into images",
      "Logical properties (margin-inline) so right-to-left works",
    ],
  },
  {
    id: "semantics",
    t: "Structure underneath",
    src: "WCAG",
    repo: "both",
    kind: "Invisible",
    why: "Screen readers, search engines and agents read the structure, not the look. Correct HTML is free accessibility.",
    checks: [
      "One h1, headings in order",
      "Landmarks: header, nav, main, footer",
      "Alt text that says what the image shows, or empty for decoration",
      "Every input has a label tied to it",
      "Buttons for actions, links for places",
    ],
  },
]);

area(
  "system",
  "System and identity",
  "The overarching calls that every smaller decision should agree with.",
);
add("system", [
  {
    id: "mode",
    t: "What the page is for",
    src: "Impeccable",
    repo: "both",
    why: "A landing page persuades, a tool helps people work, docs help people understand, a portfolio lets the work lead. The same detail is right in one and wrong in another.",
    opts: [
      {
        l: "Persuade",
        v: "p",
        n: "Landing pages, pricing. Design is the product; earn attention and action.",
      },
      {
        l: "Operate",
        v: "o",
        n: "Apps and tools. Scanability and consistency beat expression.",
      },
      {
        l: "Read",
        v: "r",
        n: "Docs and articles. Structure for understanding first.",
      },
      {
        l: "Experience",
        v: "e",
        n: "Portfolios and galleries. The work leads and the interface recedes.",
      },
    ],
    def: 3,
    rule: (s, o) =>
      ({
        p: "Persuade: bold display type allowed, one strong call to action, real imagery.",
        o: "Operate: fixed type scale, stable density, motion only as feedback.",
        r: "Read: 45 to 75 character measure, quiet chrome, clear headings.",
        e: "Experience: the work fills the first view; chrome is minimal and small.",
      })[o.v],
  },
  {
    id: "boldness",
    t: "Where the boldness goes",
    src: "frontend-design",
    repo: "looks",
    why: "Let one thing be memorable and keep everything around it quiet. Bold everywhere is loud; bold nowhere is forgettable.",
    opts: [
      { l: "One memorable thing", v: "one" },
      { l: "Bold everywhere", v: "all" },
      { l: "Nothing bold", v: "none" },
    ],
    demo: (s, o) => {
      const blk = (bold) =>
        `<div style="height:${bold ? 46 : 22}px;border-radius:4px;background:${bold ? "#1d1d1f" : "#e6e6e6"};margin:6px 0"></div>`;
      return frame(
        `<div style="padding:12px 24%">${o.v === "one" ? blk(true) + bars(5) : o.v === "all" ? blk(true) + blk(true) + blk(true) : bars(8)}</div>`,
        150,
      );
    },
  },
  {
    id: "motion-personality",
    t: "Motion personality",
    src: "Emil Kowalski",
    repo: "looks",
    kind: "Motion",
    play: true,
    why: "Motion should match the mood of the product. A dashboard should be crisp and fast; something playful can bounce.",
    opts: [
      { l: "Crisp", v: ["d-scale", "180ms", "cubic-bezier(.23,1,.32,1)"] },
      { l: "Elegant", v: ["d-rise", "450ms", "ease"] },
      { l: "Playful", v: ["d-scale", "", ""] },
    ],
    demo: (s, o) => {
      const sp = spring(0.55, 0.45);
      const a =
        o.l === "Playful"
          ? `d-scale ${sp.ms}ms ${sp.linear}`
          : `${o.v[0]} ${o.v[1]} ${o.v[2]}`;
      return `<div style="display:flex;gap:10px">${[0, 1, 2].map((i) => `<div style="width:80px;height:80px;border-radius:14px;background:#1d1d1f;animation:${a} ${200 + i * 60}ms both"></div>`).join("")}</div>`;
    },
    rule: (s, o) =>
      o.l === "Playful"
        ? "Springs with visible bounce (damping about 0.55), for things people touch."
        : o.l === "Crisp"
          ? "Short and decisive: 150 to 200ms, strong ease-out, no bounce."
          : "Slower and softer: 300 to 450ms, plain ease, no bounce.",
  },
  {
    id: "anti-defaults",
    t: "Banned defaults",
    src: "neilmcardle.com rules, frontend-design, Impeccable",
    repo: "both",
    why: "These appear whatever the subject, which is what makes a page read as generated. Ticked items are banned unless a brief asks for them by name.",
    checks: [
      "Cream background with a terracotta accent",
      "Near-black page with one acid-green or vermilion accent",
      "Broadsheet hairlines with zero radius everywhere",
      "Identical rounded cards with the same soft shadow",
      "Tracked capital labels above headings",
      "Details joined with middle dots",
      "Arrows on every link and button",
      "Gradient text",
      "Glass and blur as decoration",
      "Thick coloured left borders on cards and alerts",
      "Hard offset block shadows",
      "Monospace as a costume",
      "Emoji standing in for icons",
      "Fade-up on every section",
      "Big-number hero with small label",
      "Em dashes in copy",
    ],
    rule: (s) =>
      "Banned:\n" +
      ITEMS.find((i) => i.id === "anti-defaults")
        .checks.filter((_, i) => s.c[i])
        .map((x) => "- " + x)
        .join("\n"),
  },
  {
    id: "consistency",
    t: "Same look, same behaviour",
    src: "Apple",
    repo: "both",
    why: "If two things look alike, people expect them to act alike and live in the same place. Break a familiar pattern only when you can show it is better.",
    opts: [
      { l: "Strict", v: true },
      { l: "Case by case", v: false },
    ],
    rule: (s, o) =>
      o.v
        ? "Anything that looks like a button behaves like one everywhere. One component per job; no near-duplicates."
        : "Components may vary by context.",
  },
  {
    id: "off-scale",
    t: "Values that are not on the scale",
    src: "landing-page-design skill",
    repo: "both",
    kind: "Invisible",
    why: "Sooner or later an agent meets a 19px heading or a 22px gap. Without a rule it keeps the stray value, and the system quietly drifts.",
    opts: [
      { l: "Snap to the nearest step", v: "nearest" },
      {
        l: "Snap to the step below",
        v: "below",
        n: "The landing-page-design skill's rule. Errs smaller and tighter.",
      },
      {
        l: "Stop and ask",
        v: "ask",
        n: "Safest, slowest. Good while the system is young.",
      },
    ],
    def: 0,
    rule: (s, o) =>
      ({
        nearest:
          "Any size, space or radius not on its scale snaps to the nearest step. Never keep an arbitrary value.",
        below:
          "Any size, space or radius not on its scale snaps to the step below it, taking that step's line height too.",
        ask: "Any size, space or radius not on its scale is flagged for a person to decide before it ships.",
      })[o.v],
  },
  {
    id: "token-names",
    t: "Token names",
    src: "Impeccable",
    repo: "both",
    kind: "Invisible",
    why: "Names that describe the job survive a rebrand; names that describe the value lie the moment the value changes.",
    opts: [
      { l: "By role", v: true },
      { l: "By value", v: false },
    ],
    css: (s, o) =>
      o.v
        ? "--text: #5c5c5c;\n--text-muted: #737373;\n--surface: #ffffff;\n--line: rgb(0 0 0 / .09);\n--action: #1d1d1f;"
        : "--grey-600: #5c5c5c;\n--grey-500: #737373;\n--white: #ffffff;\n--black-9: rgb(0 0 0 / .09);\n--black: #1d1d1f;",
  },
  {
    id: "token-format",
    t: "How tokens ship",
    src: "General practice",
    repo: "both",
    kind: "Invisible",
    why: "Agents and people both need the same values in the format they work in. One source exported to every format keeps them from drifting.",
    opts: [
      { l: "CSS variables", v: "css" },
      { l: "Tailwind theme", v: "tw" },
      {
        l: "Design token JSON",
        v: "dtcg",
        n: "The W3C format that Figma variables and Tokens Studio read.",
      },
      { l: "All three from one source", v: "all" },
    ],
    def: 3,
    css: (s, o) =>
      ({
        css: ":root {\n  --text: #5c5c5c;\n  --radius-card: 10px;\n}",
        tw: "@theme {\n  --color-text: #5c5c5c;\n  --radius-card: 10px;\n}",
        dtcg: '{\n  "color": { "text": { "$type": "color", "$value": "#5c5c5c" } },\n  "radius": { "card": { "$type": "dimension", "$value": "10px" } }\n}',
        all: "tokens.json  (source, W3C format)\n  -> tokens.css   (CSS variables)\n  -> theme.css    (Tailwind @theme)\n  -> figma        (variables import)",
      })[o.v],
  },
  {
    id: "agent-format",
    t: "How the repos are fed to agents",
    src: "neilmcardle.com",
    repo: "both",
    kind: "Invisible",
    why: "The repos only help if an agent loads the right part at the right time. Short rules up front, detail behind references, tokens as data.",
    opts: [
      { l: "Skill with references", v: "skill" },
      { l: "AGENTS.md rules", v: "agents" },
      { l: "DESIGN.md plus tokens", v: "design" },
    ],
    def: 0,
    css: (s, o) =>
      ({
        skill:
          "performance-ui/\n  SKILL.md          when to load, the hard rules\n  references/\n    motion.md\n    type.md\n    performance.md\n  tokens/\n    tokens.json\n    tokens.css\n    theme.css",
        agents: "AGENTS.md          every rule in one file\ntokens.css",
        design:
          "DESIGN.md          the visual system in prose\ntokens.json\ncomponents/        reference implementations",
      })[o.v],
  },
  {
    id: "finished-site",
    t: "The finishing list",
    src: "landing-page-design skill",
    repo: "both",
    why: "A site can look done and still feel unfinished. These are the small pieces people only notice when they are missing. Skip links and alt text live in Access and resilience.",
    checks: [
      "A custom 404 with a way back",
      "Privacy and terms links in the footer",
      "A favicon in the brand",
      "Title, description and a share image on every page",
      "Forms check required fields and email format before sending",
      "Cookie consent only where the law asks for it",
      "No link that goes nowhere",
      "The current page marked in the navigation",
    ],
  },
  {
    id: "review-habits",
    t: "How work gets checked",
    src: "Emil Kowalski, Apple, Impeccable",
    repo: "both",
    why: "Taste shows up in the checking as much as the making. These are the passes that catch what the first look misses.",
    checks: [
      "Screenshot desktop and phone together",
      "Play motion in slow motion and frame by frame",
      "Look again the next day",
      "Run worst-case data through every list",
      "Try it on a real phone",
      "Tab through every page",
      "Measure, do not eyeball, contrast and spacing",
    ],
  },
]);
