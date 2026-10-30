import { $, esc, toast } from './dom.js';
import { on, emit, clamp, f2, reduceMotion, PARAMS, P, EASES, state, quant, frameAt, note } from './engine.js';
import { logo, logoName } from './logo.js';
import { attach } from './material.js';
import { buildExportSVG, buildFrameSVG } from './export.js';
import { animateTo } from './stage.js';
import { model, RINGS_OF, agentById, byRole, initials, fit, energy, energyLabel, seamClean, interpret, feed, say } from './agents.js';

const BRAND = { duration: 3.2, easing: 2, hue: 0 };
const TRAITS = ['keeps a constant speed, so nothing stands out', 'starts and ends gently', 'overshoots once and settles', 'overshoots several times before it settles', 'lands in a series of hops'];
const RECIPES = [
  { role: 'motion', title: () => 'Nervous heartbeat', desc: 'Fast double pulse, then a long settle', v: { duration: 1.1, pulse: 24, glow: 18, easing: 2 } },
  { role: 'motion', title: (n) => `Jitter ${n}`, desc: 'Parts shiver slightly out of sync', v: { wobble: 16, stagger: 60, easing: 3 } },
  { role: 'guide', title: (n) => `Confident ${n}`, desc: 'Slow Back ease, one deliberate gesture', v: { duration: 3.2, easing: 2, pulse: 8 } },
  { role: 'critic', title: () => 'Quiet colour', desc: 'Hue locked, soft glow does the work', v: { hue: 0, glow: 12, blur: 1 } },
  { role: 'tester', title: () => 'Seamless spin', desc: 'One clean turn, no pop at the seam', v: { spin: 1, stagger: 20, easing: 0 } },
  { role: 'guide', title: () => 'Draw-on intro', desc: 'Outlines trace in, then fill', v: { draw: 70, fade: 30, stagger: 55 } },
];
const MODS = [
  { tag: 'softer', k: 0.6 }, { tag: 'lighter', k: 0.8 }, { tag: 'stronger', k: 1.2 }, { tag: 'bolder', k: 1.4 },
  { tag: 'staggered', k: 1, extra: { stagger: 25 } }, { tag: 'slower', k: 1, extra: { duration: 0.8 } },
];

const tree = { nodes: [], runs: [], running: [], selected: null, sort: 'fit', seq: 0 };
const sleep = (ms) => new Promise((r) => setTimeout(r, reduceMotion ? 40 : ms));
const letter = (i) => (i < 26 ? '' : letter(Math.floor(i / 26) - 1)) + String.fromCharCode(65 + (i % 26));
const nodeById = (id) => tree.nodes.find((n) => n.id === id);
const valuesOf = (id) => (id === 'main' || !nodeById(id) ? { ...state.v } : { ...nodeById(id).values });
const changedOf = (values) => PARAMS.filter((p) => values[p.id] !== state.v[p.id]).map((p) => p.id);
const chipText = (d, v) => (d === 'duration' || d === 'easing' ? say(d, v) : `${P[d].label} ${P[d].unit === 'turns' ? +v : say(d, v)}`);
const cap = (s) => s[0].toUpperCase() + s.slice(1);
const ago = (at) => { const s = Math.round((Date.now() - at) / 1000); return s < 10 ? 'now' : s < 60 ? `${s}s` : `${Math.round(s / 60)}m`; };
const avatar = (agent, size = 16) => (agent ? `<span class="avatar s${size}" style="--c:var(--${agent.color})">${esc(initials(agent.name))}</span>` : `<span class="avatar you s${size}">NM</span>`);

function allowed(agent, base, values) {
  const out = { ...base };
  for (const id in values) if (agent.perms[RINGS_OF[id]] !== 'see' && !state.locks[id]) out[id] = quant(P[id], values[id]);
  return out;
}
function add(run, agent, title, desc, values) {
  if (!PARAMS.some((p) => values[p.id] !== valuesOf(run.parent)[p.id])) return null;
  const node = { id: letter(tree.seq++), run: run.id, title, desc, values, author: agent.id, score: fit(values, BRAND), chat: [] };
  tree.nodes.push(node);
  return node;
}

async function fork(parent = 'main', prompt = '', who = 'you') {
  if (!model.agents.length) { toast('Add an agent first'); return; }
  const base = valuesOf(parent), from = nodeById(parent), text = prompt.trim();
  const name = logoName().toLowerCase();
  let jobs = [], label = 'Fork 6 variations', source = from ? `${from.id} · ${from.title}` : 'main';
  if (text) {
    const { target, labels } = interpret(text, base);
    if (!labels.length) { toast('No dial matches that. Try calmer, more glow, bounce 30.'); return; }
    label = source = `“${text}”`;
    jobs = [0.4, 0.6, 0.8, 1, 1.15, 1.3].map((k, i) => {
      const agent = model.agents[i % model.agents.length];
      const v = Object.fromEntries(Object.keys(target).map((id) => [id, P[id].options ? (k >= 0.6 ? target[id] : base[id]) : base[id] + (target[id] - base[id]) * k]));
      return { agent, title: `${cap(labels[0])} ${Math.round(k * 100)}%`, values: allowed(agent, base, v) };
    });
  } else if (from) {
    label = `6 more like ${from.id}`;
    const main = state.v;
    jobs = MODS.map((m, i) => {
      const agent = agentById(from.author) || model.agents[i % model.agents.length];
      const v = Object.fromEntries(PARAMS.map((p) => [p.id, p.options ? base[p.id] : main[p.id] + (base[p.id] - main[p.id]) * m.k + (m.extra?.[p.id] || 0)]));
      return { agent, title: `${from.title}, ${m.tag}`, values: allowed(agent, base, v) };
    });
  } else {
    jobs = RECIPES.map((r, i) => {
      const agent = byRole(r.role) || model.agents[i % model.agents.length];
      return { agent, title: r.title(name), desc: r.desc, values: allowed(agent, base, r.v) };
    });
  }
  const run = { id: `run-${Date.now()}`, parent: from ? from.id : 'main', label, source, who, at: Date.now() };
  tree.runs.push(run);
  feed(who, who === 'you' ? `You: ${label}` : label, `forked from ${from ? `${from.id} · ${from.title}` : 'main'}`);
  const authors = [...new Set(jobs.map((j) => j.agent))];
  const meters = authors.map((agent) => ({ agent: agent.id, text: label.replace(/^“|”$/g, ''), done: 0, total: jobs.filter((j) => j.agent === agent).length }));
  tree.running.push(...meters);
  emit('explore');
  for (const job of jobs) {
    await sleep(280);
    const node = add(run, job.agent, job.title, job.desc || PARAMS.filter((p) => job.values[p.id] !== base[p.id]).slice(0, 3).map((p) => chipText(p.id, job.values[p.id])).join(', '), job.values);
    meters.find((m) => m.agent === job.agent.id).done++;
    if (node && !tree.selected) tree.selected = node.id;
    emit('explore');
  }
  await sleep(500);
  tree.running = tree.running.filter((m) => !meters.includes(m));
  if (!tree.nodes.some((n) => n.run === run.id)) { tree.runs = tree.runs.filter((r) => r !== run); toast('No agent may change those rings'); }
  emit('explore');
}

function mix() {
  const a = nodeById(tree.selected), b = sorted().find((n) => n !== a);
  if (!a || !b) return;
  const agent = agentById(a.author) || model.agents[0];
  const values = Object.fromEntries(PARAMS.map((p) => [p.id, p.options ? a.values[p.id] : quant(p, (a.values[p.id] + b.values[p.id]) / 2)]));
  const run = { id: `run-${Date.now()}`, parent: a.id, label: `Mix ${a.id} + ${b.id}`, source: `${a.id} + ${b.id}`, who: 'you', at: Date.now() };
  tree.runs.push(run);
  const node = add(run, agent, `${a.title} × ${b.title}`, `Halfway between ${a.id} and ${b.id}`, values);
  if (node) { tree.selected = node.id; feed('you', `You: mix ${a.id} + ${b.id}`, `made ${node.id}`); } else tree.runs.pop();
  emit('explore');
}

function apply(id) {
  const node = nodeById(id);
  if (!node) return;
  note(`Applied ${node.id} · ${node.title}`);
  animateTo(node.values);
  feed('you', `Applied ${node.id} · ${node.title} to main`, `by ${agentById(node.author)?.name || 'an agent'}`);
  toast(`Applied ${node.id} to main`);
  emit('mode', 'direct');
}

function answer(node, q) {
  const text = q.toLowerCase(), changed = changedOf(node.values);
  const to = node.values.easing, said = (e) => text.includes(e.name.toLowerCase()) || text.includes(e.short);
  const other = EASES.findIndex((e, i) => i !== to && said(e)), named = other >= 0 ? other : EASES.findIndex(said);
  if (named >= 0 && named !== to) return `${EASES[named].name} ${TRAITS[named]}. This one is going for “${node.title.toLowerCase()}”, and ${EASES[to].name} ${TRAITS[to]}.`;
  const dial = changed.find((d) => text.includes(P[d].label.toLowerCase())) || (named >= 0 ? 'easing' : changed[0]);
  if (!dial) return 'It matches main right now, so there is nothing to explain.';
  if (dial === 'easing') return `${EASES[to].name} ${TRAITS[to]}. That is what makes it read as “${node.title.toLowerCase()}”.`;
  const from = state.v[dial], v = node.values[dial];
  return `${P[dial].label} is ${say(dial, v)} here and ${say(dial, from)} on main. ${v > from ? 'More' : 'Less'} ${P[dial].label.toLowerCase()} is what pushes it towards “${node.title.toLowerCase()}”. Brand fit comes out at ${node.score}%.`;
}
function ask(id, q) {
  const node = nodeById(id);
  if (!node || !q.trim()) return;
  node.chat.push({ who: 'you', text: q.trim() }, { who: node.author, text: answer(node, q) });
  emit('explore');
}

const sorted = () => [...tree.nodes].sort((a, b) => (tree.sort === 'energy' ? energy(a.values) - energy(b.values) : b.score - a.score));

const uri = (svg) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
const shotCanvas = document.createElement('canvas');
shotCanvas.width = shotCanvas.height = 320;
const shots = attach(shotCanvas);
function shoot(values, t) {
  shots.render(frameAt(t, logo.parts.length, values), values);
  return shotCanvas;
}
function frames(node) {
  if (shots && shots.ready) {
    if (!node.shot) node.shot = shoot(node.values, node.values.duration * 0.5).toDataURL();
    return `<img class="shot" alt="" src="${node.shot}">`;
  }
  if (!node.frames) node.frames = [0.3, 0.4, 0.5].map((k) => uri(buildFrameSVG(node.values.duration * k, node.values)));
  return node.frames.map((src, i) => `<img alt="" src="${src}" style="opacity:${[0.25, 0.5, 1][i]}">`).join('');
}
function curve(values) {
  const f = EASES[values.easing].f;
  return `<svg class="curve" width="56" height="28" viewBox="0 0 56 28" fill="none" aria-hidden="true"><path d="${Array.from({ length: 41 }, (_, i) => `${i ? 'L' : 'M'}${f2(2 + i * 1.3)} ${f2(22 - clamp(f(i / 40), -0.35, 1.35) * 16)}`).join('')}" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}
function rings(values) {
  const a = rad2((values.duration / 8) * 270), r = 38.5;
  return `<svg class="rings" viewBox="0 0 172 172" fill="none" aria-hidden="true"><circle cx="86" cy="86" r="85.5" stroke="var(--line)"/><circle cx="86" cy="86" r="69.5" stroke="var(--line)"/><circle cx="86" cy="86" r="53.5" stroke="var(--line)"/><circle cx="86" cy="86" r="37.5" stroke="var(--line)" stroke-dasharray="2 4"/><path d="M86 ${86 - r}A${r} ${r} 0 ${a > Math.PI ? 1 : 0} 1 ${f2(86 + r * Math.sin(a))} ${f2(86 - r * Math.cos(a))}" stroke="currentColor" opacity=".7"/></svg>`;
}
const rad2 = (deg) => (deg * Math.PI) / 180;

const grid = $('#explore'), branches = $('#branchesPane'), compare = $('#comparePane');
const paint = (el, html) => { if (el._html !== html) { el._html = html; el.innerHTML = html; } };

function renderGrid() {
  if (grid.hidden) return;
  const n = tree.nodes.length, last = tree.runs[tree.runs.length - 1];
  if (!n) {
    paint(grid, `<div class="ex-label"><b>Variations</b></div><div class="ex-empty"><b>Fork the loop</b><span>${tree.running.length ? 'Agents are forking the loop…' : 'Each agent takes the current loop in a different direction. Compare them side by side, then apply one to main or fork again.'}</span>${tree.running.length ? '' : '<button class="btn blue" data-act="fork">Fork 6 variations</button>'}</div>`);
    return;
  }
  paint(grid, `<div class="ex-label"><b>Variations</b><span>${n} loop${n === 1 ? '' : 's'}${last ? ` forked from ${esc(last.source)}` : ''} · sorted by ${tree.sort === 'energy' ? 'energy' : 'brand fit'}</span></div>
  <div class="ex-grid">${sorted().map((node) => {
    const agent = agentById(node.author), chips = changedOf(node.values);
    return `<button class="var" data-node="${node.id}" aria-pressed="${node.id === tree.selected}" style="--c:var(--${agent?.color || 'violet'})">
      <span class="var-prev">${rings(node.values)}<span class="onion">${frames(node)}</span>${curve(node.values)}<span class="idc">${node.id}</span><span class="fitc">Brand fit <b class="${node.score >= 85 ? 'good' : ''}">${node.score}%</b></span></span>
      <span class="var-body"><b>${esc(node.title)}</b><span class="muted">${esc(node.desc)}</span>
      <span class="vchips">${chips.slice(0, 3).map((d) => `<span class="vchip">${esc(chipText(d, node.values[d]))}</span>`).join('')}${chips.length > 3 ? `<span class="vchip">+${chips.length - 3}</span>` : ''}</span>
      <span class="author">${avatar(agent)}${esc(agent?.name || 'Removed agent')}</span></span></button>`;
  }).join('')}</div>`);
}

function renderTree() {
  const row = (node) => `<button class="tnode" data-node="${node.id}" aria-selected="${node.id === tree.selected}">${avatar(agentById(node.author))}<span class="nm">${node.id} · ${esc(node.title)}</span><span class="vl">${node.score}%</span></button>${kids(node.id)}`;
  const kids = (parent) => {
    const runs = tree.runs.filter((r) => r.parent === parent);
    if (!runs.length) return '';
    return `<div class="tkids">${runs.map((r) => `<div class="tnode">${avatar(r.who === 'you' ? null : agentById(r.who))}<span class="nm">${esc(r.label)}</span><span class="vl">${ago(r.at)}</span></div><div class="tkids">${tree.nodes.filter((n) => n.run === r.id).map(row).join('')}</div>`).join('')}</div>`;
  };
  const n = tree.nodes.length;
  paint(branches, `<div class="eyebrow"><b>Branches of ${esc(logoName())}</b><span>${n} variation${n === 1 ? '' : 's'}</span></div>
  <div class="tree"><div class="tnode"><span class="avatar s16 badge-m">M</span><span class="nm">main · ${esc(logoName())}</span><span class="vl">${say('duration', state.v.duration)}</span></div>${kids('main')}</div>
  ${tree.running.length ? `<div class="divider gap"></div><div class="eyebrow"><b>Running</b></div><div class="running">${tree.running.map((m) => { const a = agentById(m.agent); return `<div style="--c:var(--${a?.color || 'violet'})"><div class="run-row">${avatar(a)}<span>${esc(a?.name || 'Agent')} · ${esc(m.text)}</span></div><div class="meter thin"><i style="width:${(m.done / m.total) * 100}%;background:var(--c)"></i></div></div>`; }).join('')}</div>` : ''}`);
}

function renderCompare() {
  const node = nodeById(tree.selected);
  if (!node) { paint(compare, '<section class="card"><div class="hint">Pick a variation to compare it with main.</div></section>'); return; }
  const agent = agentById(node.author), c = `--c:var(--${agent?.color || 'violet'})`;
  const run = tree.runs.find((r) => r.id === node.run), diff = changedOf(node.values), e = energy(node.values), clean = seamClean(node.values);
  const score = (label, value, pct, color, by) => `<div class="score"><div class="score-row"><span>${label}</span><b>${value}</b></div><div class="meter"><i style="width:${pct}%;background:var(--${color})"></i></div><span class="by">Scored by ${esc(by)}</span></div>`;
  paint(compare, `<section class="card" style="${c}"><div class="card-head">${avatar(agent, 20)}<b class="title">${node.id} · ${esc(node.title)}</b></div>
    <div class="muted">By ${esc(agent?.name || 'a removed agent')}${run ? `, forked from ${esc(run.source)}` : ''}. Compared with main:</div>
    ${diff.length ? diff.map((d) => `<div class="diff"><b>${P[d].label}</b><span class="from">${esc(say(d, state.v[d]))}</span><span class="arr">→</span><span class="to">${esc(say(d, node.values[d]))}</span></div>`).join('') : '<div class="hint">Identical to main.</div>'}</section>
  <section class="card"><div class="sec-title">Scores</div>
    ${score('Brand fit', `${node.score}%`, node.score, 'green', byRole('critic')?.name || 'the brand rules')}
    ${score('Energy', energyLabel(e), clamp(e * 200, 4, 100), 'violet', byRole('motion')?.name || 'the motion model')}
    ${score('Loop seam', clean ? 'Clean' : 'Pops', clean ? 100 : 35, 'pink', byRole('tester')?.name || 'the seam check')}
    <div class="actions"><button class="btn blue grow" data-act="apply">Apply to main</button><button class="btn grow" data-act="fork">Fork from ${node.id}</button></div></section>
  <section class="card"><div class="sec-title">Ask about ${node.id}</div>
    ${node.chat.map((m) => `<div class="msg">${avatar(m.who === 'you' ? null : agentById(m.who), 20)}<div class="bubble${m.who === 'you' ? '' : ' agent'}">${esc(m.text)}</div></div>`).join('')}
    <form class="field ask" data-ask><input aria-label="Ask about ${node.id}" placeholder="Why ${esc(say('easing', node.values.easing))} and not Elastic?" autocomplete="off"></form></section>`);
}

function renderExplore() { renderGrid(); renderTree(); renderCompare(); }
const pick = (id) => { tree.selected = id; emit('explore'); };

grid.addEventListener('click', (e) => {
  const card = e.target.closest('[data-node]');
  if (card) pick(card.dataset.node);
  else if (e.target.closest('[data-act="fork"]')) fork();
});
grid.addEventListener('dblclick', (e) => { const card = e.target.closest('[data-node]'); if (card) apply(card.dataset.node); });
grid.addEventListener('mouseover', (e) => {
  const card = e.target.closest('[data-node]');
  if (!card || card.contains(e.relatedTarget) || reduceMotion) return;
  const node = nodeById(card.dataset.node), box = card.querySelector('.onion');
  if (shots && shots.ready) {
    const live = document.createElement('canvas');
    live.className = 'shot'; live.width = live.height = shotCanvas.width;
    box.replaceChildren(live);
    const ctx = live.getContext('2d'), t0 = performance.now();
    const tick = (now) => {
      if (!live.isConnected) return;
      ctx.clearRect(0, 0, live.width, live.height);
      ctx.drawImage(shoot(node.values, (now - t0) / 1000), 0, 0);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    return;
  }
  if (!node.anim) node.anim = uri(buildExportSVG(node.values));
  box.innerHTML = `<img alt="" src="${node.anim}">`;
});
grid.addEventListener('mouseout', (e) => {
  const card = e.target.closest('[data-node]');
  if (!card || card.contains(e.relatedTarget)) return;
  const node = nodeById(card.dataset.node);
  if (node) card.querySelector('.onion').innerHTML = frames(node);
});
branches.addEventListener('click', (e) => { const row = e.target.closest('[data-node]'); if (row) { pick(row.dataset.node); grid.querySelector(`[data-node="${row.dataset.node}"]`)?.scrollIntoView({ block: 'nearest' }); } });
compare.addEventListener('click', (e) => {
  const act = e.target.closest('[data-act]')?.dataset.act;
  if (act === 'apply') apply(tree.selected);
  if (act === 'fork') fork(tree.selected);
});
compare.addEventListener('submit', (e) => {
  e.preventDefault();
  ask(tree.selected, e.target.querySelector('input').value);
  compare.querySelector('[data-ask] input')?.focus();
});

const refresh = () => { tree.nodes.forEach((n) => { n.frames = null; n.anim = null; n.shot = null; n.score = fit(n.values, BRAND); }); grid._html = ''; renderExplore(); };
let shotTimer = 0;
const reloadShots = () => { clearTimeout(shotTimer); shotTimer = setTimeout(() => { if (shots) shots.load(512).then((ok) => { if (ok) refresh(); }).catch(() => {}); }, 200); };
on('logo', reloadShots);
on('color', reloadShots);
on('explore', renderExplore);
on('logo', refresh);
on('color', refresh);
on('value', () => { renderTree(); renderCompare(); });
on('agents', () => { renderTree(); });
renderExplore();

export { tree, fork, mix, apply, nodeById, sorted, renderExplore };
