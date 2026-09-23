(() => {
  const W = 600,
    H = 750,
    TAU = Math.PI * 2;
  const cv = document.getElementById("cv"),
    ctx = cv.getContext("2d");
  const off = document.createElement("canvas"),
    octx = off.getContext("2d");

  function rng(a) {
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function hex(h) {
    h = h.replace("#", "");
    return [
      parseInt(h.slice(0, 2), 16),
      parseInt(h.slice(2, 4), 16),
      parseInt(h.slice(4, 6), 16),
    ];
  }
  function bayer(n) {
    if (n === 1) return [[0]];
    const b = bayer(n / 2),
      m = [];
    for (let y = 0; y < n; y++) {
      m.push([]);
      for (let x = 0; x < n; x++) {
        const v = b[y % (n / 2)][x % (n / 2)] * 4,
          q = (y < n / 2 ? 0 : 2) + (x < n / 2 ? 0 : 1);
        m[y].push(v + [0, 2, 3, 1][q]);
      }
    }
    return m;
  }
  const B8 = bayer(8).map((r) => r.map((v) => (v + 0.5) / 64));
  function field(r, w, h, base, oct) {
    // fractal value noise sampled onto w*h grid, normalised 0..1
    const out = new Float32Array(w * h);
    let amp = 1,
      tot = 0;
    for (let o = 0; o < oct; o++) {
      const gx = Math.max(2, Math.round(base * 2 ** o)),
        gy = Math.max(2, Math.round((base * 2 ** o * h) / w));
      const g = new Float32Array((gx + 1) * (gy + 1));
      for (let i = 0; i < g.length; i++) g[i] = r();
      for (let y = 0; y < h; y++) {
        const fy = (y / (h - 1)) * gy,
          yi = Math.min(gy - 1, fy | 0),
          ty = fy - yi,
          sy = ty * ty * (3 - 2 * ty);
        for (let x = 0; x < w; x++) {
          const fx = (x / (w - 1)) * gx,
            xi = Math.min(gx - 1, fx | 0),
            tx = fx - xi,
            sx = tx * tx * (3 - 2 * tx);
          const a = g[yi * (gx + 1) + xi],
            b = g[yi * (gx + 1) + xi + 1],
            c = g[(yi + 1) * (gx + 1) + xi],
            d = g[(yi + 1) * (gx + 1) + xi + 1];
          out[y * w + x] +=
            (a + (b - a) * sx + (c + (d - c) * sx - (a + (b - a) * sx)) * sy) *
            amp;
        }
      }
      tot += amp;
      amp *= 0.5;
    }
    let mn = 1e9,
      mx = -1e9;
    for (const v of out) {
      if (v < mn) mn = v;
      if (v > mx) mx = v;
    }
    for (let i = 0; i < out.length; i++)
      out[i] = (out[i] - mn) / (mx - mn || 1);
    return out;
  }
  function line(r, n, oct, base) {
    const out = new Float32Array(n);
    let amp = 1,
      tot = 0;
    for (let o = 0; o < oct; o++) {
      const k = base * 2 ** o,
        p = Array.from({ length: k + 1 }, r);
      for (let i = 0; i < n; i++) {
        const f = (i / (n - 1)) * k,
          j = Math.min(k - 1, f | 0),
          t = f - j;
        out[i] += (p[j] + (p[j + 1] - p[j]) * t) * amp;
      }
      tot += amp;
      amp *= 0.5;
    }
    for (let i = 0; i < n; i++) out[i] /= tot;
    return out;
  }
  function blit(img, w, h) {
    off.width = w;
    off.height = h;
    octx.putImageData(img, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(off, 0, 0, W, H);
  }
  const pick = (r, a) => a[Math.floor(r() * a.length)];

  const PALS = {
    acid: ["#0d0c0a", "#6e0ded", "#0762ff", "#a4ff04", "#f4f2ea"],
    hot: ["#141210", "#ff3b1f", "#2b50ff", "#fff4e0", "#ffd400"],
    toxic: ["#0b0b0b", "#3a2cff", "#ff00a8", "#00ff85", "#e8e8e0"],
    heat: ["#000000", "#4a0e8f", "#e0197a", "#ff9a1a", "#fff3b0"],
  };

  const RULES = [
    {
      id: "derez",
      name: "Derez",
      anim: true,
      setup(s) {
        const r = rng(s),
          w = 150,
          h = 188,
          pal = pick(r, Object.keys(PALS));
        return {
          r,
          w,
          h,
          pal,
          n: field(r, w, h, 2 + r() * 3, 5),
          mix: 0.25 + r() * 0.25,
          cell: [4][0],
        };
      },
      draw(st, ph) {
        const { w, h, n } = st,
          img = octx.createImageData(w, h),
          c = PALS[st.pal].map(hex);
        for (let y = 0; y < h; y++)
          for (let x = 0; x < w; x++) {
            let v =
              (1 - st.mix) * n[y * w + x] +
              st.mix * (y / h) +
              0.08 * Math.sin(TAU * ((y / h) * 2 - ph) + n[y * w + x] * 6);
            let q = Math.floor(v * 4 + B8[y & 7][x & 7]);
            q = q < 0 ? 0 : q > 4 ? 4 : q;
            const k = (y * w + x) * 4;
            img.data.set([...c[q], 255], k);
          }
        blit(img, w, h);
      },
      recipe: (st) =>
        `ordered dither · bayer 8×8 · 5 inks (${st.pal}) · gradient ${st.mix.toFixed(2)}`,
    },
    {
      id: "slipstream",
      name: "Slipstream",
      anim: true,
      setup(s) {
        const r = rng(s),
          w = 300,
          h = 375;
        return {
          w,
          h,
          n: field(r, w, h, 2, 3),
          k: 24 + Math.floor(r() * 28),
          cx: 0.3 + r() * 0.4,
          cy: 0.25 + r() * 0.4,
          amp: 8 + r() * 12,
          pal: pick(r, ["hot", "acid", "toxic"]),
        };
      },
      draw(st, ph) {
        const { w, h, n } = st,
          img = octx.createImageData(w, h),
          p = PALS[st.pal].map(hex);
        const pairs = [
          [p[0], p[3]],
          [p[1], p[2]],
          [p[2], p[4]],
        ];
        for (let y = 0; y < h; y++)
          for (let x = 0; x < w; x++) {
            const dx = x / w - st.cx,
              dy = (y - st.cy * h) / w,
              b = Math.exp(-(dx * dx + dy * dy) / 0.09);
            const u =
                (x / w) * st.k +
                b * st.amp * Math.sin((y / h) * 6 + ph * TAU) +
                n[y * w + x] * 6 +
                ph * 2,
              s = ((Math.floor(u) % 2) + 2) % 2,
              band = ((Math.floor((y / h) * 3 + b * 1.6 + ph * 3) % 3) + 3) % 3;
            img.data.set([...pairs[band][s], 255], (y * w + x) * 4);
          }
        blit(img, w, h);
      },
      recipe: (st) =>
        `${st.k} stripes · bulge at ${st.cx.toFixed(2)}, ${st.cy.toFixed(2)} · amplitude ${st.amp.toFixed(1)}`,
    },
    {
      id: "pulsar",
      name: "Pulsar",
      anim: false,
      setup(s) {
        const r = rng(s);
        return {
          w: 300,
          h: 375,
          pet: 10 + Math.floor(r() * 30),
          rings: 5 + Math.floor(r() * 9),
          lob: 3 + Math.floor(r() * 8),
          cy: 0.4 + r() * 0.2,
          pal: pick(r, ["toxic", "acid", "hot", "heat"]),
        };
      },
      draw(st, ph) {
        const { w, h } = st,
          img = octx.createImageData(w, h),
          p = PALS[st.pal].map(hex),
          lut = [
            [p[3], p[0]],
            [p[2], p[4]],
          ];
        for (let y = 0; y < h; y++)
          for (let x = 0; x < w; x++) {
            const dx = x - w / 2,
              dy = y - h * st.cy,
              a = Math.atan2(dy, dx),
              rr = Math.hypot(dx, dy) / w;
            const ray =
                ((Math.floor((a / TAU + 0.5) * st.pet + rr * 3 + ph * 2) % 2) +
                  2) %
                2,
              ring =
                ((Math.floor(
                  (rr + 0.06 * Math.sin(a * st.lob + ph * TAU)) * st.rings -
                    ph * 2,
                ) %
                  2) +
                  2) %
                2;
            img.data.set(
              [...lut[rr > 0.62 ? 1 : 0][ray ^ ring], 255],
              (y * w + x) * 4,
            );
          }
        blit(img, w, h);
      },
      recipe: (st) =>
        `${st.pet} rays XOR ${st.rings} rings · ${st.lob}-lobe wobble · ${st.pal}`,
    },
    {
      id: "quadrant",
      name: "Quadrant",
      anim: false,
      setup(s) {
        const r = rng(s),
          g = 6 + Math.floor(r() * 12),
          rows = Math.round(g * 1.25),
          pal = pick(r, ["acid", "toxic", "hot"]),
          v = 0.3 + r() * 0.35,
          inks = 3 + Math.floor(r() * 2);
        const q = [];
        for (let j = 0; j < rows; j++) {
          q.push([]);
          for (let i = 0; i < g; i++)
            q[j].push(r() < v ? 0 : 1 + Math.floor(r() * inks));
        }
        return { g, rows, q, pal, v, inks };
      },
      draw(st) {
        const { g, rows, q } = st,
          w = g * 2,
          h = rows * 2,
          img = octx.createImageData(w, h),
          p = PALS[st.pal].map(hex);
        for (let y = 0; y < h; y++)
          for (let x = 0; x < w; x++) {
            const j = y < rows ? y : h - 1 - y,
              i = x < g ? x : w - 1 - x;
            img.data.set([...p[q[j][i] % 5], 255], (y * w + x) * 4);
          }
        blit(img, w, h);
      },
      recipe: (st) =>
        `${st.g * 2}×${st.rows * 2} grid · 4-way mirror · ${st.inks} inks · ${Math.round(st.v * 100)}% void`,
    },
    {
      id: "circuit",
      name: "Circuit",
      anim: false,
      setup(s) {
        const r = rng(s),
          n = 8 + Math.floor(r() * 16),
          pal = pick(r, ["acid", "toxic", "hot", "heat"]);
        const cells = [];
        for (let i = 0; i < n * Math.ceil(n * 1.25); i++)
          cells.push([r() < 0.5, r()]);
        return { n, pal, cells, wt: 0.12 + r() * 0.18 };
      },
      draw(st) {
        const p = PALS[st.pal],
          c = W / st.n,
          rows = Math.ceil(H / c);
        ctx.fillStyle = p[2];
        ctx.fillRect(0, 0, W, H);
        ctx.lineCap = "square";
        ctx.lineWidth = c * st.wt;
        for (let j = 0; j < rows; j++)
          for (let i = 0; i < st.n; i++) {
            const [d, k] = st.cells[(j * st.n + i) % st.cells.length];
            ctx.strokeStyle = k < 0.8 ? p[3] : p[4];
            ctx.beginPath();
            if (d) {
              ctx.moveTo(i * c, j * c);
              ctx.lineTo(i * c + c, j * c + c);
            } else {
              ctx.moveTo(i * c + c, j * c);
              ctx.lineTo(i * c, j * c + c);
            }
            ctx.stroke();
          }
      },
      recipe: (st) =>
        `${st.n} cells across · stroke ${Math.round(st.wt * 100)}% · ${st.pal}`,
    },
    {
      id: "bitstream",
      name: "Bitstream",
      anim: false,
      setup(s) {
        const r = rng(s),
          n = 16 + Math.floor(r() * 16),
          rows = Math.ceil(n * 1.25);
        return {
          n,
          rows,
          f: field(r, n, rows, 1.5 + r() * 2, 3),
          cx: r(),
          cy: r(),
          ring: 3 + r() * 5,
          pal: pick(r, ["acid", "toxic", "hot"]),
          g: pick(r, [".:-=+*#%@", "/\\|—+×", "░▒▓█", "01", "◐◑◒◓●○"]),
        };
      },
      draw(st) {
        const p = PALS[st.pal],
          c = W / st.n,
          cols = [p[1], p[2], p[3], p[4]];
        ctx.fillStyle = p[0];
        ctx.fillRect(0, 0, W, H);
        ctx.font = `600 ${c * 0.9}px "IBM Plex Mono",monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        for (let j = 0; j < st.rows; j++)
          for (let i = 0; i < st.n; i++) {
            const v = st.f[j * st.n + i],
              ring =
                Math.floor(
                  Math.hypot(i / st.n - st.cx, j / st.rows - st.cy) *
                    st.ring *
                    2,
                ) % 4,
              col = cols[(Math.floor(v * 4) + ring) % 4];
            ctx.fillStyle = col;
            ctx.fillRect(i * c, j * c, c + 0.5, c + 0.5);
            ctx.fillStyle = col === p[1] ? p[4] : p[0];
            ctx.fillText(
              st.g[Math.min(st.g.length - 1, Math.floor(v * st.g.length))],
              i * c + c / 2,
              j * c + c / 2 + 1,
            );
          }
      },
      recipe: (st) =>
        `glyph field ${st.n}×${st.rows} · set “${st.g}” · ${st.ring.toFixed(1)} rings`,
    },
    {
      id: "horizon",
      name: "Horizon",
      anim: false,
      setup(s) {
        const r = rng(s),
          w = 200,
          h = 250,
          inv = r() < 0.4;
        const hz = 0.55 + r() * 0.15,
          px = 0.25 + r() * 0.5,
          ph = 0.15 + r() * 0.2,
          pw = 0.16 + r() * 0.16;
        const jag = line(r, w, 8, 5),
          n = field(r, w, h, 6, 4),
          gl = field(r, Math.max(8, (w / 10) | 0), h, 30, 2);
        const top = new Float32Array(w);
        const sx = px + (r() < 0.5 ? -1 : 1) * pw * (0.5 + r() * 0.4),
          sh = 0.45 + r() * 0.25;
        for (let x = 0; x < w; x++) {
          const u = x / (w - 1),
            t1 = Math.max(0, 1 - Math.abs(u - px) / (pw * 1.6)),
            t2 = Math.max(0, 1 - Math.abs(u - sx) / (pw * 0.9));
          top[x] =
            hz -
            Math.max(
              0,
              Math.max(ph * t1 ** 1.1, ph * sh * t2 ** 1.1) +
                (0.08 + r() * 0) * (jag[x] - 0.5) * (0.3 + Math.max(t1, t2)),
            );
        }
        const sm = new Float32Array(w);
        for (let x = 0; x < w; x++) {
          let a = 0,
            k = 0;
          for (let d = -8; d <= 8; d++) {
            const i = x + d;
            if (i >= 0 && i < w) {
              a += top[i];
              k++;
            }
          }
          sm[x] = a / k;
        }
        const shore = new Float32Array(w),
          sj = line(r, w, 6, 4),
          sx2 = r();
        for (let x = 0; x < w; x++) {
          const u = x / (w - 1);
          shore[x] =
            0.86 +
            r() * 0 -
            0.07 * Math.max(0, 1 - Math.abs(u - sx2) / 0.5) -
            0.04 * (sj[x] - 0.5);
        }
        return {
          w,
          h,
          hz,
          top,
          sm,
          shore,
          n,
          gl,
          inv,
          gx: 0.3 + r() * 0.4,
          fall: 0.1 + r() * 0.3,
          gw: Math.max(8, (w / 10) | 0),
        };
      },
      draw(st, ph) {
        const { w, h, hz, top, sm, n, gl } = st,
          img = octx.createImageData(w, h),
          cols = (
            st.inv
              ? ["#121110", "#d2ea1c", "#6b3fe0"]
              : ["#121110", "#6b3fe0", "#d2ea1c"]
          ).map(hex);
        const v = new Float32Array(w * h),
          hzp = Math.floor(hz * h);
        for (let y = 0; y < hzp; y++)
          for (let x = 0; x < w; x++) {
            const yy = y / h;
            let t = 1 - st.fall * Math.min(1, yy / hz) ** 2;
            if (yy >= top[x]) {
              const sl =
                  (sm[Math.min(w - 1, x + 1)] - sm[Math.max(0, x - 1)]) *
                  w *
                  0.5,
                light = 0.5 - 0.5 * Math.tanh(sl * 1.6),
                gu =
                  1 -
                  Math.abs(gl[y * st.gw + Math.floor((x / w) * st.gw)] - 0.5) *
                    2;
              t =
                0.5 +
                0.4 * (light - 0.5) +
                0.22 * (gu - 0.5) +
                0.12 * (n[y * w + x] - 0.5) -
                0.2 * Math.min(1, (yy - top[x]) / 0.3);
            }
            v[y * w + x] = t;
          }
        for (let y = hzp; y < h; y++) {
          const src = Math.max(0, 2 * hzp - y - 1),
            rip = Math.round(
              Math.sin(y * 0.36 + ph * TAU) * 3 +
                Math.sin(y * 0.09 - ph * TAU) * 2,
            );
          for (let x = 0; x < w; x++) {
            const xs = (((x + rip) % w) + w) % w;
            let t = v[src * w + xs] * 0.8;
            const lines =
              Math.sin(y * 2 + 3 * Math.sin(x * 0.016) + ph * TAU) > 0.6;
            t +=
              0.35 *
              Math.exp(-(((x / w - st.gx) / 0.14) ** 2)) *
              (lines ? 1 : 0) *
              Math.exp(-(y - hzp) / (0.2 * h));
            v[y * w + x] = t;
          }
        }
        for (let y = 0; y < h; y++)
          for (let x = 0; x < w; x++) {
            if (y / h >= st.shore[x])
              v[y * w + x] = 0.08 + 0.3 * Math.max(0, n[y * w + x] - 0.5);
            let t = Math.min(1, Math.max(0, v[y * w + x])) * 2,
              i = Math.min(1, Math.floor(t)),
              f = Math.min(1, Math.max(0, (t - i - 0.5) * 3.2 + 0.5));
            t = i + f;
            let q = Math.floor(t + B8[y & 7][x & 7] * 0.999);
            q = q < 0 ? 0 : q > 2 ? 2 : q;
            img.data.set([...cols[q], 255], (y * w + x) * 4);
          }
        blit(img, w, h);
      },
      recipe: (st) =>
        `vol 02 · ridge + mirror · horizon ${st.hz.toFixed(2)} · 3 inks${st.inv ? " (inverted)" : ""} · 8×8 bayer`,
    },
  ];

  const rulesEl = document.getElementById("rules");
  RULES.forEach((R, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.dataset.i = i;
    b.innerHTML = `<span class="k">${String(i + 1).padStart(2, "0")}</span><span>${R.name}</span><span class="v">${R.anim ? "moves" : ""}</span>`;
    b.onclick = () => {
      set(i, newSeed());
    };
    rulesEl.appendChild(b);
  });

  let cur = 0,
    seed = 1,
    state = null,
    phase = 0,
    animOn = false,
    raf = 0;
  const $ = (id) => document.getElementById(id);
  function newSeed() {
    return 1 + Math.floor(Math.random() * 99998);
  }
  function set(i, s) {
    cur = (i + RULES.length) % RULES.length;
    seed = s;
    state = RULES[cur].setup(seed);
    phase = 0;
    render();
    [...rulesEl.children].forEach((b, k) =>
      b.setAttribute("aria-pressed", k === cur),
    );
    $("name").textContent =
      `${RULES[cur].name} · seed ${String(seed).padStart(5, "0")}`;
    $("recipe").textContent = RULES[cur].recipe(state);
    $("anim").disabled = !RULES[cur].anim;
    $("anim").style.opacity = RULES[cur].anim ? 1 : 0.35;
    try {
      history.replaceState(null, "", "#" + RULES[cur].id + "-" + seed);
    } catch (e) {}
  }
  function render() {
    RULES[cur].draw(state, phase);
  }
  function loop() {
    phase = (phase + 1 / 150) % 1;
    render();
    raf = requestAnimationFrame(loop);
  }
  function toggleAnim(force) {
    animOn = force !== undefined ? force : !animOn;
    if (!RULES[cur].anim) animOn = false;
    $("anim").setAttribute("aria-pressed", animOn);
    cancelAnimationFrame(raf);
    if (animOn && !matchMedia("(prefers-reduced-motion: reduce)").matches)
      raf = requestAnimationFrame(loop);
  }
  function toast(t) {
    const e = $("toast");
    e.textContent = t;
    e.hidden = false;
    clearTimeout(toast.t);
    toast.t = setTimeout(() => (e.hidden = true), 1600);
  }
  $("reroll").onclick = () => set(cur, newSeed());
  $("anim").onclick = () => toggleAnim();
  $("copy").onclick = () => {
    const u = location.href.split("#")[0] + "#" + RULES[cur].id + "-" + seed;
    const fb = () => {
      toast("Seed " + seed + " — " + RULES[cur].id);
    };
    try {
      navigator.clipboard.writeText(u).then(() => toast("Link copied"), fb);
    } catch (e) {
      fb();
    }
  };
  addEventListener("keydown", (e) => {
    if (e.target.closest && e.target.closest("input,textarea")) return;
    if (e.code === "Space" || e.key === "r") {
      e.preventDefault();
      set(cur, newSeed());
    } else if (e.key === "ArrowRight") {
      set(cur + 1, newSeed());
    } else if (e.key === "ArrowLeft") {
      set(cur - 1, newSeed());
    } else if (e.key === "a") {
      toggleAnim();
    }
  });
  const m = (location.hash || "").match(/^#([a-z]+)-(\d+)$/);
  const start = m
    ? Math.max(
        0,
        RULES.findIndex((R) => R.id === m[1]),
      )
    : 1;
  set(start, m ? +m[2] : 1311);
})();
