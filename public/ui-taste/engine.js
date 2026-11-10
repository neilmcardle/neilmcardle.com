const KEY = "ui-taste-v2";
const COST = [
  "No speed cost",
  "Light speed cost",
  "Medium speed cost",
  "Heavy speed cost",
];
const REPOS = { perf: "Performance UI", looks: "Looks UI" };
const other = (r) => (r === "perf" ? "looks" : "perf");
let S = {};
let repo = "perf";
try {
  S =
    JSON.parse(localStorage.getItem(KEY) || "null") ||
    migrate(JSON.parse(localStorage.getItem("ui-taste-v1") || "{}"));
} catch (e) {
  S = {};
}
try {
  repo = localStorage.getItem("ui-taste-repo") === "looks" ? "looks" : "perf";
} catch (e) {}
let patchNote = "";
const view = { show: "all" };
const mounted = new Map();
let observers = [];

function migrate(old) {
  const out = {};
  for (const [id, o] of Object.entries(old || {})) {
    if (!o || typeof o !== "object") continue;
    out[id] = { n: o.n || "" };
    if (o.perf || o.looks) {
      Object.assign(out[id], o);
      continue;
    }
    if (!o.v) continue;
    const base = {
      opt: o.opt || 0,
      d: o.d || {},
      c: o.c || {},
      v: o.v === "keep" ? "use" : "out",
    };
    if (o.r !== "looks") out[id].perf = JSON.parse(JSON.stringify(base));
    if (o.r !== "perf") out[id].looks = JSON.parse(JSON.stringify(base));
  }
  return out;
}
function rec(it) {
  return S[it.id] || (S[it.id] = { n: "" });
}
function st(it, r = repo) {
  const R = rec(it);
  if (!R[r]) R[r] = { opt: it.def ?? 0, d: {}, c: {}, v: null };
  const s = R[r];
  for (const d of it.dials || []) if (!(d[0] in s.d)) s.d[d[0]] = d[5];
  (it.checks || []).forEach((_, i) => {
    if (!(i in s.c)) s.c[i] = true;
  });
  if (it.opts && s.opt >= it.opts.length) s.opt = 0;
  return s;
}
function verdict(it, r = repo) {
  const R = S[it.id];
  return R && R[r] ? R[r].v : null;
}
function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(S));
    localStorage.setItem("ui-taste-repo", repo);
  } catch (e) {}
}
function opt(it, s) {
  return it.opts ? it.opts[s.opt] : null;
}
function costOf(it, s) {
  const o = opt(it, s);
  return o && o.c != null ? o.c : it.cost || 0;
}
function esc(t) {
  return String(t).replace(
    /[&<>"]/g,
    (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[m],
  );
}
function fmt(d, v) {
  const u = d[6] || "";
  const dec = (String(d[4]).split(".")[1] || "").length;
  return Number(v).toFixed(dec) + u;
}

function outputs(it, s) {
  const o = opt(it, s),
    r = [];
  if (it.css) r.push(["CSS", it.css(s, o)]);
  if (it.tw) r.push(["Tailwind", it.tw(s, o)]);
  if (it.spec) r.push(["Spec", it.spec(s, o)]);
  if (it.rule) r.push(["Rule", it.rule(s, o)]);
  return r;
}

function decideHTML(it) {
  const v = verdict(it),
    ov = verdict(it, other(repo));
  const os =
    ov === "use"
      ? "uses it"
      : ov === "out"
        ? "leaves it out"
        : "not decided yet";
  return `<button class="use" data-verdict="use" aria-pressed="${v === "use"}">${v === "use" ? "Using this in " + REPOS[repo] : "Use this"}</button><button class="lo" data-verdict="out" aria-pressed="${v === "out"}">${v === "out" ? "Left out of " + REPOS[repo] : "Leave out"}</button><span class="other">${REPOS[other(repo)]} ${os}.${ov ? ` <button class="copy" data-copy>Copy that choice here</button>` : ""}</span>`;
}

function defaults(it) {
  const s = { opt: it.def ?? 0, d: {}, c: {} };
  for (const d of it.dials || []) s.d[d[0]] = d[5];
  (it.checks || []).forEach((_, i) => (s.c[i] = true));
  return s;
}
function snap(d, v) {
  const x = Math.min(d[3], Math.max(d[2], v));
  return +(Math.round((x - d[2]) / d[4]) * d[4] + d[2]).toFixed(4);
}
function settable(ref) {
  return ref.opt != null || ref.d || ref.c;
}
function matches(it, s, ref) {
  if (!settable(ref)) return false;
  if (ref.opt != null && s.opt !== ref.opt) return false;
  for (const [k, v] of Object.entries(ref.d || {})) {
    const d = it.dials.find((x) => x[0] === k);
    if (Math.abs(s.d[k] - snap(d, v)) > d[4] / 2) return false;
  }
  if (ref.c === "all" && (it.checks || []).some((_, i) => !s.c[i]))
    return false;
  return true;
}
function isDefault(it, s) {
  return matches(it, s, { ...defaults(it), c: "all" });
}
function refsHTML(it, s) {
  const refs = Object.keys(REF_NAMES)
    .filter((k) => REFS[it.id] && REFS[it.id][k])
    .map((k) => [k, REFS[it.id][k]]);
  const rows = refs
    .map(([k, ref]) => {
      const same = matches(it, s, ref);
      const act = settable(ref)
        ? same
          ? `<span class="same">Same as yours</span>`
          : `<button class="try" data-try="${k}">Try theirs</button>`
        : "";
      return `<li><span class="who">${REF_NAMES[k]}</span><span class="say">${esc(ref.say)}${ref.range ? ' <span class="mid">Try uses the middle of the range.</span>' : ""}</span>${act}</li>`;
    })
    .join("");
  const reset = `<button class="reset" data-reset ${isDefault(it, s) ? "disabled" : ""}>Reset to default</button>`;
  return `<div class="refs"><div class="refsHead"><span>${refs.length ? "What they use" : "None of the sources say anything specific here."}</span>${reset}</div>${rows ? `<ul>${rows}</ul>` : ""}</div>`;
}

function itemHTML(it) {
  const s = st(it),
    o = opt(it, s);
  const chips = it.opts
    ? `<div class="chips" role="group" aria-label="Options">${it.opts.map((x, i) => `<button class="chip" data-opt="${i}" aria-pressed="${i === s.opt}">${esc(x.l)}</button>`).join("")}</div><p class="onote">${o && o.n ? esc(o.n) : ""}</p>`
    : "";
  const dials = it.dials
    ? `<div class="dials">${it.dials.map((d) => `<label class="dial"><span>${esc(d[1])}</span><output>${fmt(d, s.d[d[0]])}</output><input type="range" data-dial="${d[0]}" min="${d[2]}" max="${d[3]}" step="${d[4]}" value="${s.d[d[0]]}"></label>`).join("")}</div>`
    : "";
  const checks = it.checks
    ? `<ul class="checks">${it.checks.map((c, i) => `<li><label><input type="checkbox" data-check="${i}" ${s.c[i] ? "checked" : ""}><span>${esc(c)}</span></label></li>`).join("")}</ul>`
    : "";
  const outs = outputs(it, s);
  const out = outs.length
    ? `<details class="out"><summary>Values</summary><div class="outTabs">${outs.map((x, i) => `<button data-tab="${i}" aria-pressed="${i === 0}">${x[0]}</button>`).join("")}</div><pre>${esc(outs[0][1])}</pre></details>`
    : "";
  const c = costOf(it, s);
  return `<article class="item" id="i-${it.id}" data-id="${it.id}" data-v="${s.v || ""}">
    <div class="ih"><h3>${esc(it.t)}</h3><div class="meta"><span>${esc(it.kind || "Static")}</span><span class="cost" data-c="${c}">${COST[c]}</span><span>${esc(it.src || "General practice")}</span></div></div>
    <p class="why">${esc(it.why)}</p>
    ${it.demo ? `<div class="stage${it.flush ? " flush" : ""}">${it.play ? '<button class="replay" data-replay>Replay</button>' : ""}<div class="demo"></div></div>${it.hint ? `<p class="hint">${esc(it.hint)}</p>` : ""}` : ""}
    <div class="ctl">${chips}${dials}${checks}</div>
    ${refsHTML(it, s)}
    ${out}
    <div class="decide"><div class="dv">${decideHTML(it)}</div><label class="noteField">Note<input class="note" data-note placeholder="Shared by both systems" value="${esc(rec(it).n || "")}"></label></div>
  </article>`;
}

function paint(el, fresh) {
  const it = ITEMS.find((x) => x.id === el.dataset.id),
    s = st(it),
    o = opt(it, s);
  const demo = el.querySelector(".demo");
  if (demo && it.demo) {
    unmount(it.id);
    demo.innerHTML = it.demo(s, o);
    if (it.mount && el.dataset.live === "1")
      mounted.set(it.id, it.mount(demo, s, o) || null);
  }
  if (!fresh) {
    const outs = outputs(it, s),
      pre = el.querySelector(".out pre");
    if (pre) {
      const t = [...el.querySelectorAll("[data-tab]")].findIndex(
        (b) => b.getAttribute("aria-pressed") === "true",
      );
      pre.textContent = outs[Math.max(0, t)][1];
    }
    const note = el.querySelector(".onote");
    if (note) note.textContent = o && o.n ? o.n : "";
    const c = costOf(it, s),
      ce = el.querySelector(".cost");
    ce.dataset.c = c;
    ce.textContent = COST[c];
    el.querySelector(".refs").outerHTML = refsHTML(it, s);
  }
}
function unmount(id) {
  const f = mounted.get(id);
  if (typeof f === "function") f();
  mounted.delete(id);
}

function render() {
  for (const id of [...mounted.keys()]) unmount(id);
  observers.forEach((o) => o.disconnect());
  observers = [];
  document
    .querySelectorAll("[data-pick]")
    .forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.pick === repo)),
    );
  document
    .querySelectorAll("[data-about]")
    .forEach((p) => (p.dataset.on = String(p.dataset.about === repo)));
  const list = document.getElementById("list");
  list.innerHTML =
    AREAS.map(
      (a) =>
        `<section class="areaBlock" id="a-${a.id}" data-area="${a.id}"><h2 class="areaHead">${esc(a.name)}</h2>${a.note ? `<p class="areaNote">${esc(a.note)}</p>` : ""}${ITEMS.filter(
          (i) => i.area === a.id,
        )
          .map(itemHTML)
          .join("")}</section>`,
    ).join("") +
    '<p class="empty" id="empty" hidden>Nothing matches this filter.</p>';
  document.querySelectorAll(".item").forEach((el) => paint(el, true));
  observe();
  filter();
  counts();
}

function filter() {
  let shown = 0;
  document.querySelectorAll(".item").forEach((el) => {
    const v = verdict(ITEMS.find((x) => x.id === el.dataset.id));
    el.hidden = !(
      view.show === "all" || (view.show === "open" ? !v : v === view.show)
    );
    if (!el.hidden) shown++;
  });
  document.querySelectorAll(".areaBlock").forEach((b) => {
    b.hidden = !b.querySelector(".item:not([hidden])");
  });
  document.getElementById("empty").hidden = shown > 0;
}

function counts() {
  const tallyOf = (r) => {
    const d = ITEMS.filter((i) => verdict(i, r)).length,
      u = ITEMS.filter((i) => verdict(i, r) === "use").length;
    return [d, u];
  };
  document.getElementById("areas").innerHTML = AREAS.map((a) => {
    const its = ITEMS.filter((i) => i.area === a.id),
      d = its.filter((i) => verdict(i)).length;
    return `<li><a href="#a-${a.id}" data-a="${a.id}" data-done="${d === its.length}"><span>${esc(a.name)}</span><span class="n">${d}/${its.length}</span></a></li>`;
  }).join("");
  const [d, u] = tallyOf(repo),
    [od] = tallyOf(other(repo));
  document.getElementById("tally").textContent =
    `${REPOS[repo]}: ${d} of ${ITEMS.length} decided. ${REPOS[other(repo)]}: ${od}.`;
  document.getElementById("railFoot").textContent =
    `Counts are for ${REPOS[repo]}. Choices save in this browser as you go.`;
  markArea(currentArea);
}

let currentArea = null;
function markArea(id) {
  currentArea = id;
  document
    .querySelectorAll(".areas a")
    .forEach((a) => a.setAttribute("aria-current", String(a.dataset.a === id)));
}

function observe() {
  const live = new IntersectionObserver(
    (es) => {
      for (const e of es) {
        const el = e.target,
          it = ITEMS.find((x) => x.id === el.dataset.id);
        if (!it.mount) continue;
        if (e.isIntersecting && el.dataset.live !== "1") {
          el.dataset.live = "1";
          paint(el);
        } else if (!e.isIntersecting && el.dataset.live === "1") {
          el.dataset.live = "0";
          unmount(it.id);
        }
      }
    },
    { rootMargin: "200px 0px" },
  );
  document.querySelectorAll(".item").forEach((el) => live.observe(el));
  const sec = new IntersectionObserver(
    (es) => {
      for (const e of es) if (e.isIntersecting) markArea(e.target.dataset.area);
    },
    { rootMargin: "-30% 0px -60% 0px" },
  );
  document.querySelectorAll(".areaBlock").forEach((el) => sec.observe(el));
  observers = [live, sec];
}

function itemOf(t) {
  const el = t.closest(".item");
  return el ? [el, ITEMS.find((x) => x.id === el.dataset.id)] : [null, null];
}
function replaceItem(el, it) {
  const fresh = document.createElement("div");
  fresh.innerHTML = itemHTML(it);
  const nel = fresh.firstElementChild;
  nel.dataset.live = el.dataset.live || "";
  unmount(it.id);
  el.replaceWith(nel);
  paint(nel, true);
  save();
  counts();
  observers[0] && observers[0].observe(nel);
}
function refreshDecide(el, it) {
  el.querySelector(".dv").innerHTML = decideHTML(it);
  el.dataset.v = verdict(it) || "";
}

document.addEventListener("click", (e) => {
  const t = e.target.closest("button");
  if (!t) return;
  const [el, it] = itemOf(t);
  if (el && it) {
    const s = st(it);
    if (t.dataset.opt != null) {
      s.opt = +t.dataset.opt;
      t.parentElement
        .querySelectorAll(".chip")
        .forEach((b) => b.setAttribute("aria-pressed", String(b === t)));
      paint(el);
      save();
    } else if (t.dataset.verdict) {
      s.v = s.v === t.dataset.verdict ? null : t.dataset.verdict;
      refreshDecide(el, it);
      save();
      counts();
    } else if (t.dataset.copy != null) {
      rec(it)[repo] = JSON.parse(JSON.stringify(st(it, other(repo))));
      replaceItem(el, it);
    } else if (t.dataset.try) {
      const ref = REFS[it.id][t.dataset.try];
      if (ref.opt != null) s.opt = ref.opt;
      for (const [k, v] of Object.entries(ref.d || {}))
        s.d[k] = snap(
          it.dials.find((x) => x[0] === k),
          v,
        );
      if (ref.c === "all") (it.checks || []).forEach((_, i) => (s.c[i] = true));
      replaceItem(el, it);
      say(`Set to ${REF_NAMES[t.dataset.try]}'s values`);
    } else if (t.dataset.reset != null) {
      Object.assign(s, defaults(it));
      replaceItem(el, it);
      say("Back to the default");
    } else if (t.dataset.replay != null) {
      paint(el);
    } else if (t.dataset.tab != null) {
      const outs = outputs(it, s);
      t.parentElement
        .querySelectorAll("button")
        .forEach((b) => b.setAttribute("aria-pressed", String(b === t)));
      el.querySelector(".out pre").textContent = outs[+t.dataset.tab][1];
    }
    return;
  }
  if (t.dataset.pick && t.dataset.pick !== repo) {
    const y = scrollY;
    repo = t.dataset.pick;
    save();
    render();
    scrollTo(0, y);
    say(`Now choosing for ${REPOS[repo]}`);
  }
  if (t.dataset.f) {
    view.show = t.dataset.f;
    t.parentElement
      .querySelectorAll("button")
      .forEach((b) => b.setAttribute("aria-pressed", String(b === t)));
    filter();
  }
});
document.addEventListener("input", (e) => {
  const t = e.target,
    [el, it] = itemOf(t);
  if (!el || !it) return;
  if (t.dataset.dial) {
    const s = st(it);
    s.d[t.dataset.dial] = +t.value;
    const d = it.dials.find((x) => x[0] === t.dataset.dial);
    t.previousElementSibling.textContent = fmt(d, t.value);
    paint(el);
    save();
  } else if (t.dataset.note != null) {
    rec(it).n = t.value;
    save();
  }
});
document.addEventListener("change", (e) => {
  const t = e.target,
    [el, it] = itemOf(t);
  if (el && it && t.dataset.check != null) {
    st(it).c[t.dataset.check] = t.checked;
    paint(el);
    save();
  }
});

const menu = document.getElementById("menu"),
  exportBtn = document.getElementById("exportBtn");
exportBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  menu.hidden = !menu.hidden;
  exportBtn.setAttribute("aria-expanded", String(!menu.hidden));
});
document.addEventListener("click", (e) => {
  if (!menu.hidden && !e.target.closest(".menuWrap")) {
    menu.hidden = true;
    exportBtn.setAttribute("aria-expanded", "false");
  }
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !menu.hidden) {
    menu.hidden = true;
    exportBtn.focus();
  }
});
document.getElementById("sendBtn").addEventListener("click", () => {
  download(
    "ui-taste.json",
    JSON.stringify(toJSON(), null, 2),
    "application/json",
  );
  say(
    "Saved to Downloads as ui-taste.json. Give the file to your agent.",
    5000,
  );
});
menu.addEventListener("click", async (e) => {
  const x = e.target.dataset.x;
  if (!x) return;
  menu.hidden = true;
  if (x === "md") download("ui-taste.md", toMarkdown(), "text/markdown");
  if (x === "copy") {
    try {
      await navigator.clipboard.writeText(toMarkdown());
      say("Copied as markdown");
    } catch (err) {
      say("Copy did not work. Use Download as markdown instead.");
    }
  }
  if (
    x === "reset" &&
    confirm(
      "Clear every choice and note, for both systems? This cannot be undone.",
    )
  ) {
    S = {};
    save();
    render();
    say("Every choice cleared");
  }
});
document.getElementById("importFile").addEventListener("change", async (e) => {
  const f = e.target.files[0];
  if (!f) return;
  try {
    const j = JSON.parse(await f.text());
    S = migrate(j.state || j);
    save();
    render();
    say("Choices imported");
  } catch (err) {
    say(
      "That file is not a UI Taste download. Choose the ui-taste.json file you saved.",
    );
  }
  e.target.value = "";
  menu.hidden = true;
});

function summary(it, s) {
  const o = opt(it, s),
    parts = [];
  if (o) parts.push(o.l);
  for (const d of it.dials || [])
    parts.push(`${d[1].toLowerCase()} ${fmt(d, s.d[d[0]])}`);
  if (it.checks) {
    const on = it.checks.filter((_, i) => s.c[i]);
    if (on.length) parts.push(on.join("; "));
  }
  return parts.join(", ");
}
function entry(it, r) {
  const s = st(it, r);
  return {
    id: it.id,
    area: AREAS.find((a) => a.id === it.area).name,
    title: it.t,
    choice: summary(it, s),
    speedCost: COST[costOf(it, s)],
    note: rec(it).n || undefined,
    why: it.why,
    source: it.src,
    values: Object.fromEntries(outputs(it, s)),
  };
}
function toJSON() {
  const repos = {};
  for (const r of ["perf", "looks"]) {
    repos[REPOS[r]] = {
      used: ITEMS.filter((it) => verdict(it, r) === "use").map((it) =>
        entry(it, r),
      ),
      leftOut: ITEMS.filter((it) => verdict(it, r) === "out").map((it) => ({
        id: it.id,
        title: it.t,
        note: rec(it).n || undefined,
      })),
      undecided: ITEMS.filter((it) => !verdict(it, r)).length,
    };
  }
  return { exported: new Date().toISOString(), repos, state: S };
}
function toMarkdown() {
  const date = new Date().toISOString().slice(0, 10);
  let md = `# UI taste\n\nExported ${date}.\n`;
  for (const r of ["perf", "looks"]) {
    const used = ITEMS.filter((it) => verdict(it, r) === "use"),
      out = ITEMS.filter((it) => verdict(it, r) === "out");
    md += `\n## ${REPOS[r]}\n\n${used.length} used, ${out.length} left out, ${ITEMS.length - used.length - out.length} undecided.\n`;
    for (const a of AREAS) {
      const ai = used.filter((it) => it.area === a.id);
      if (!ai.length) continue;
      md += `\n### ${a.name}\n`;
      for (const it of ai) {
        const s = st(it, r);
        md += `\n**${it.t}**: ${summary(it, s)}\n\n${it.why}${rec(it).n ? `\n\nNote: ${rec(it).n}` : ""}\n`;
        for (const [k, v] of outputs(it, s))
          md += `\n${k}:\n\n\`\`\`${k === "CSS" ? "css" : ""}\n${v}\n\`\`\`\n`;
      }
    }
    if (out.length) {
      md += `\n### Left out of ${REPOS[r]}\n\n`;
      for (const it of out)
        md += `- ${it.t}${rec(it).n ? `: ${rec(it).n}` : ""}\n`;
    }
  }
  return md;
}
function download(name, text, type) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
let toastT;
function say(t, ms = 2200) {
  const el = document.getElementById("toast");
  el.textContent = t;
  el.hidden = false;
  clearTimeout(toastT);
  toastT = setTimeout(() => (el.hidden = true), ms);
}

render();
if (patchNote) say(patchNote, 5000);
