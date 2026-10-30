import { $, mk, esc } from './dom.js';
import { on, emit, RINGS, P, state, polar, arcPath, f2 } from './engine.js';
import { stage, dialEls, dialPoint, ringPoint, center } from './stage.js';
import { toolSchemas } from './tools.js';
import {
  model, COLORS, PERMS, SCOPES, AUTONOMY, MODELS, LIMITS, RUNS, agentById, say, initials, sourceLine, sourceShort,
  run, accept, reject, togglePreview, applyNote, dropNote, select, setEnabled, setAutonomy, saveAgent, removeAgent,
} from './agents.js';
import { tree, fork, mix, nodeById, sorted } from './explore.js';

const POINTER = '<svg width="16" height="18" viewBox="0 0 16 18" fill="none"><path d="M1.5 1.2L14 8.3L8.4 9.6L5.4 15.2L1.5 1.2Z" fill="currentColor" stroke="white" stroke-width="1.2" stroke-linejoin="round"/></svg>';
const DONE = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 13.5C10.5899 13.5 13.5 10.5899 13.5 7C13.5 3.41015 10.5899 0.5 7 0.5C3.41015 0.5 0.5 3.41015 0.5 7C0.5 10.5899 3.41015 13.5 7 13.5Z" fill="currentColor"/><path d="M4.2 7.2L6.1 9L9.8 5" stroke="white" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const paint = (el, html) => { if (el._html !== html) { el._html = html; el.innerHTML = html; } };
const tint = (agent) => `--c:var(--${agent?.color || 'violet'})`;
const avatar = (agent, size = 24) => (agent ? `<span class="avatar s${size}" style="${tint(agent)}">${esc(initials(agent.name))}</span>` : `<span class="avatar you s${size}">NM</span>`);
const ago = (at) => { const s = Math.round((Date.now() - at) / 1000); return s < 10 ? 'now' : s < 60 ? `${s}s ago` : `${Math.round(s / 60)}m ago`; };
const join = (names) => (names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}` : names[0] || '');
const waiting = () => model.proposals.reduce((n, x) => n + x.changes.length, 0) + Object.values(model.live).reduce((n, l) => n + l.rows.length, 0);

const roster = $('#rosterPane');
function renderRoster() {
  paint(roster, `<div class="eyebrow"><b>Live in this file</b><span>${model.agents.length}</span></div>
  <div role="listbox" aria-label="Agents">${model.agents.map((a) => {
    const st = model.status[a.id];
    return `<div class="roster-row" role="option" tabindex="0" data-agent="${esc(a.id)}" aria-selected="${a.id === model.selected}" style="${tint(a)}">${avatar(a)}
      <span class="tx"><b>${esc(a.name)}</b><span class="muted">${esc(sourceLine(a))}</span><span class="st${st?.active ? ' on' : ''}"><i></i>${esc(st?.text || a.idle)}</span></span>
      <button class="more" data-edit="${esc(a.id)}" aria-label="Edit ${esc(a.name)}" title="Edit">⋯</button></div>`;
  }).join('')}</div>
  <button class="add-agent" data-act="add"><b>+</b> Bring your own agent</button>
  <div class="divider"></div>
  <div class="eyebrow"><b>Activity</b></div>
  <div class="feed">${model.feed.length ? model.feed.map((f) => `<div class="feed-item">${avatar(f.who === 'you' ? null : agentById(f.who), 20)}<span class="tx"><b>${esc(f.title)}</b><span class="muted">${ago(f.at)} · ${esc(f.sub)}</span></span></div>`).join('') : '<div class="hint">Nothing yet. Ask an agent below, or turn a dial yourself.</div>'}</div>`);
}
roster.addEventListener('click', (e) => {
  const edit = e.target.closest('[data-edit]');
  if (edit) { openSheet(agentById(edit.dataset.edit)); return; }
  if (e.target.closest('[data-act="add"]')) { openSheet(); return; }
  const row = e.target.closest('[data-agent]');
  if (row) select(row.dataset.agent);
});
roster.addEventListener('keydown', (e) => { const row = e.target.closest('[data-agent]'); if (row && e.target === row && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); select(row.dataset.agent); } });

const direct = $('#directPane');
const diffRow = (c) => `<div class="diff"><b>${P[c.dial].label}</b><span class="from">${esc(say(c.dial, state.v[c.dial]))}</span><span class="arr">→</span><span class="to">${esc(say(c.dial, c.to))}</span></div>`;
function autonomyText() {
  const level = (ring) => (model.agents.some((a) => a.perms[ring.id] === 'turn') ? 'turn' : model.agents.some((a) => a.perms[ring.id] === 'propose') ? 'propose' : 'see');
  const turns = join(RINGS.filter((r) => level(r) === 'turn').map((r) => r.name)), waits = join(RINGS.filter((r) => level(r) === 'propose').map((r) => r.name));
  if (!model.agents.length) return 'There are no agents in this file yet.';
  if (model.autonomy === 'suggest') return 'Agents only propose. Every change waits for you as a ghost arc on the rings.';
  const a = turns ? `Agents can turn ${turns} dials directly.` : 'No agent may turn a dial directly.';
  const b = waits ? ` ${waits} changes wait for you as ghost arcs on the rings.` : '';
  return model.autonomy === 'copilot' ? a + b : `Agents keep refining on their own. ${a}${b}`;
}
function renderDirect() {
  const cards = model.proposals.map((x) => {
    const a = agentById(x.agent), gain = Math.max(0, x.after - x.before);
    return `<section class="card" style="${tint(a)}"><div class="card-head">${avatar(a, 20)}<b>${esc(a?.name || 'Agent')}</b><span class="tagchip">${a && a.source.type !== 'claude' ? 'Your agent' : 'Proposal'}</span></div>
      <div class="muted">${esc(x.text)}</div>${x.changes.map(diffRow).join('')}
      <div class="fitrow"><span class="muted">Brand fit</span><div class="meter"><i class="was" style="width:${Math.min(x.before, x.after)}%"></i><i class="gain" style="width:${gain}%"></i></div><b>${x.before} → ${x.after}%</b></div>
      <div class="actions"><button class="btn blue grow" data-act="accept" data-agent="${esc(x.agent)}">Accept</button><button class="btn" data-act="preview" data-agent="${esc(x.agent)}" aria-pressed="${model.previewing === x.agent}">${model.previewing === x.agent ? 'Stop preview' : 'Preview'}</button><button class="btn ghost" data-act="reject" data-agent="${esc(x.agent)}">Reject</button></div></section>`;
  });
  const lives = Object.entries(model.live).map(([id, l]) => {
    const a = agentById(id);
    return `<section class="card" style="${tint(a)}"><div class="card-head">${avatar(a, 20)}<b>${esc(a?.name || 'Agent')}</b><span class="tagchip">Live</span></div>
      <div class="muted">${esc(l.text)}</div>${l.rows.map(diffRow).join('')}
      <div class="fitrow"><div class="meter"><i class="gain" style="width:${(l.k / l.n) * 100}%"></i></div><span class="muted">Candidate ${l.k} of ${l.n}</span></div></section>`;
  });
  const who = model.steps[model.selected] ? agentById(model.selected) : model.agents.find((a) => model.steps[a.id]);
  const steps = who ? `<section class="card" style="${tint(who)}"><div class="sec-title">How ${esc(who.name)} got there</div>${model.steps[who.id].map((s) => `<div class="step">${DONE}<span class="tx"><b>${esc(s.title)}</b><span class="muted">${esc(s.sub)}</span></span></div>`).join('')}</section>` : '';
  paint(direct, `${cards.join('')}${lives.join('')}${cards.length || lives.length ? '' : '<section class="card"><div class="sec-title">No changes waiting</div><div class="hint">Ask an agent in the prompt bar. Changes they are not allowed to make themselves show up here, and as ghost arcs on the rings.</div></section>'}${steps}
  <section class="card last"><div class="sec-title">Autonomy</div>
    <div class="segmented" role="radiogroup" aria-label="Autonomy">${AUTONOMY.map((a) => `<button role="radio" aria-checked="${a.id === model.autonomy}" data-autonomy="${a.id}">${a.name}</button>`).join('')}</div>
    <div class="muted">${esc(autonomyText())}</div>
    <div class="hint">Agents in this build are simulated. They read and turn dials through the same tool API live agents will use.</div></section>`);
}
direct.addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  if (b.dataset.autonomy) setAutonomy(b.dataset.autonomy);
  if (b.dataset.act === 'accept') accept(b.dataset.agent);
  if (b.dataset.act === 'reject') reject(b.dataset.agent);
  if (b.dataset.act === 'preview') togglePreview(b.dataset.agent);
});

const presence = $('#presence'), cursors = $('#cursors'), notes = $('#notes');
function renderPresence() {
  const n = model.agents.length, w = waiting();
  paint(presence, `<span class="stack">${model.agents.slice(0, 5).map((a) => avatar(a, 20)).join('')}</span><span>${n} agent${n === 1 ? '' : 's'} live${w ? ` · ${w} change${w === 1 ? '' : 's'} waiting` : ''}</span>`);
  $('#frameAgents').textContent = n && model.enabled ? ` · ${n} agent${n === 1 ? '' : 's'}` : '';
}
presence.addEventListener('click', () => { $('#tabRoster').click(); $('#tabAgent').click(); });

const angleOf = (p, v) => { const f = (v - p.min) / (p.max - p.min); return p.bipolar ? (f - 0.5) * 270 : -135 + 270 * f; };
function renderGhosts() {
  stage.querySelectorAll('.ghost-arc').forEach((g) => g.remove());
  const draw = (agent, c) => {
    const de = dialEls[c.dial], p = P[c.dial];
    if (!de || !agent) return;
    const r = de.ar + 9, a0 = angleOf(p, state.v[c.dial]), a1 = angleOf(p, c.to), text = p.fmt(c.to);
    const g = mk('g', { class: 'ghost-arc', style: tint(agent) }, de.g);
    if (Math.abs(a1 - a0) > 0.5) mk('path', { d: arcPath(0, 0, r, a0, a1) }, g);
    const [tx, ty] = polar(0, 0, r, a1), [lx, ly] = polar(0, 0, r + 15, a1), w = text.length * 6.6 + 10;
    mk('circle', { cx: f2(tx), cy: f2(ty), r: 3 }, g);
    mk('rect', { x: f2(lx - w / 2), y: f2(ly - 9), width: f2(w), height: 18, rx: 4 }, g);
    mk('text', { x: f2(lx), y: f2(ly + 0.5), 'text-anchor': 'middle', 'dominant-baseline': 'central' }, g).textContent = text;
  };
  model.proposals.forEach((x) => x.changes.forEach((c) => draw(agentById(x.agent), c)));
  Object.entries(model.live).forEach(([id, l]) => l.rows.forEach((c) => { if (!model.proposals.some((x) => x.changes.some((y) => y.dial === c.dial))) draw(agentById(id), c); }));
}

const cursorEls = {};
let cursorsIdle = false;
function placeCursors() {
  if (!model.enabled) { cursorsIdle = true; return; }
  const c = center();
  stage.querySelectorAll('.ring.agent-on').forEach((g) => g.classList.remove('agent-on'));
  for (const id in cursorEls) if (!model.cursor[id] || !agentById(id)) { cursorEls[id].remove(); delete cursorEls[id]; }
  model.agents.forEach((a, i) => {
    const spot = model.cursor[a.id];
    if (!spot) return;
    let el = cursorEls[a.id];
    if (!el) {
      el = cursorEls[a.id] = document.createElement('div');
      el.className = 'cursor';
      el.innerHTML = `${POINTER}<div class="tag"><b></b><span></span></div>`;
      el.style.transform = `translate(${f2(c.x)}px, ${f2(c.y)}px)`;
      cursors.appendChild(el);
      el.getBoundingClientRect();
    }
    el.style.setProperty('--c', `var(--${a.color})`);
    el.querySelector('b').textContent = a.name;
    el.querySelector('span').textContent = spot.verb || '';
    let pt = { x: c.x - 70 + i * 46, y: c.y + 46 };
    if (spot.dial && dialEls[spot.dial]) { pt = dialPoint(spot.dial); pt.x += 12; pt.y += 14; }
    else if (spot.ring) {
      const ri = RINGS.findIndex((r) => r.id === spot.ring);
      pt = ringPoint(ri, 232 + i * 9);
      const g = stage.querySelector(`.ring[data-ring="${ri}"]`);
      if (g) { g.classList.add('agent-on'); g.style.setProperty('--c', `var(--${a.color})`); }
    }
    el.style.transform = `translate(${f2(pt.x)}px, ${f2(pt.y)}px)`;
    el.classList.toggle('flip', pt.x > stage.clientWidth - 200);
  });
  notes.querySelectorAll('.note').forEach((el) => {
    const pt = dialEls[el.dataset.dial] ? dialPoint(el.dataset.dial) : c, W = stage.clientWidth;
    const x = pt.x - 216 - 34 > 8 ? pt.x - 216 - 34 : Math.min(pt.x + 40, W - 224);
    el.style.transform = `translate(${f2(Math.max(8, x))}px, ${f2(Math.max(8, pt.y - 46))}px)`;
  });
  requestAnimationFrame(placeCursors);
}
function renderNotes() {
  paint(notes, model.notes.map((n) => {
    const a = agentById(n.agent);
    return `<div class="note" data-dial="${n.dial}" style="${tint(a)}"><div class="note-head">${avatar(a, 18)}<b>${esc(a?.name || 'Agent')}</b><span class="muted">on ${P[n.dial].label}</span><button class="x" data-dismiss="${n.id}" aria-label="Dismiss note">✕</button></div>
      <div>${esc(n.text)}</div><div class="note-actions"><button class="primary" data-apply="${n.id}">${esc(n.action)}</button><button data-reply="${n.id}">Reply</button></div></div>`;
  }).join(''));
}
notes.addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  if (b.dataset.apply) applyNote(b.dataset.apply);
  if (b.dataset.dismiss) dropNote(b.dataset.dismiss);
  if (b.dataset.reply) {
    const n = model.notes.find((x) => x.id === b.dataset.reply);
    if (n) { select(n.agent); input.value = `${P[n.dial].label} `; input.focus(); }
  }
});

const form = $('#promptForm'), input = $('#promptInput'), pick = $('#agentPick'), chips = $('#chips');
let mode = 'direct';
function renderComposer() {
  const options = model.agents.map((a) => `<option value="${esc(a.id)}">${esc(a.name)}</option>`).join('') + '<option value="all">Everyone</option>';
  if (pick._html !== options) { pick._html = options; pick.innerHTML = options; }
  if (pick.value !== 'all' || !pick.dataset.all) pick.value = model.selected || 'all';
  const a = agentById(pick.value);
  paint($('#pickAvatar'), a ? avatar(a, 20) : '');
  $('#pickName').textContent = a ? a.name : 'Everyone';
  $('#pickModel').textContent = `${a ? sourceShort(a) : `${model.agents.length} agents`} ▾`;
  input.placeholder = mode === 'explore' ? 'Describe the variations you want, or pick a chip' : 'Direct the agents: calmer, more glow, bounce 30';
  const sel = nodeById(tree.selected), other = sorted().find((n) => n !== sel), dark = document.documentElement.dataset.theme === 'dark' || (!document.documentElement.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);
  const list = mode === 'explore'
    ? [[sel ? `6 more like ${sel.id}` : 'Fork 6 variations', 'more'], ...(sel && other ? [[`Mix ${sel.id} + ${other.id}`, 'mix']] : []), [tree.sort === 'energy' ? 'Rank by brand fit' : 'Rank by energy', 'rank'], [dark ? 'Test on light' : 'Test on dark', 'theme']]
    : [['Calmer', 'say'], ['More bounce', 'say'], ['Match brand guide', 'say'], ['Fork 6 variations', 'fork']];
  paint(chips, list.map(([label, act]) => `<button type="button" class="qchip" data-chip="${act}">${esc(label)}</button>`).join(''));
}
pick.addEventListener('change', () => { if (pick.value === 'all') { pick.dataset.all = '1'; renderComposer(); } else { delete pick.dataset.all; select(pick.value); } });
function send(text) {
  if (mode === 'explore') { fork(tree.selected || 'main', text); return; }
  $('#tabAgent').click();
  run(text, pick.value);
}
form.addEventListener('submit', (e) => { e.preventDefault(); send(input.value); input.value = ''; });
chips.addEventListener('click', (e) => {
  const b = e.target.closest('[data-chip]');
  if (!b) return;
  const act = b.dataset.chip;
  if (act === 'say') send(b.textContent);
  if (act === 'fork') { $('#tabBranches').click(); fork(); }
  if (act === 'more') fork(tree.selected || 'main');
  if (act === 'mix') mix();
  if (act === 'rank') { tree.sort = tree.sort === 'energy' ? 'fit' : 'energy'; emit('explore'); }
  if (act === 'theme') {
    const root = document.documentElement, dark = root.dataset.theme === 'dark' || (!root.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);
    root.dataset.theme = dark ? 'light' : 'dark';
    renderComposer();
  }
});

function setMode(next) {
  mode = next;
  stage.classList.toggle('exploring', mode === 'explore');
  $('#explore').hidden = mode !== 'explore';
  $('#directPane').hidden = mode === 'explore';
  $('#comparePane').hidden = mode !== 'explore';
  if (mode === 'explore') { $('#tabAgent').click(); emit('explore'); }
  renderComposer();
}
$('#tabBranches').addEventListener('click', () => setMode('explore'));
$('#tabRoster').addEventListener('click', () => setMode('direct'));
const modeSwitch = $('#modeSwitch');
function applyEnabled() {
  const on = model.enabled;
  if (on && cursorsIdle) { cursorsIdle = false; requestAnimationFrame(placeCursors); }
  $('#app').classList.toggle('manual', !on);
  modeSwitch.querySelectorAll('button').forEach((b) => b.setAttribute('aria-checked', (b.dataset.mode === 'agents') === on));
  if (!on) {
    if (mode === 'explore') setMode('direct');
    if ($('#tabRoster').getAttribute('aria-selected') === 'true' || $('#tabBranches').getAttribute('aria-selected') === 'true') $('#tabLayers').click();
    if ($('#tabAgent').getAttribute('aria-selected') === 'true') $('#tabDesign').click();
  }
}
modeSwitch.addEventListener('click', (e) => {
  const b = e.target.closest('[data-mode]');
  if (!b || (b.dataset.mode === 'agents') === model.enabled) return;
  setEnabled(b.dataset.mode === 'agents');
  applyEnabled();
  if (model.enabled) { $('#tabRoster').click(); $('#tabAgent').click(); }
});
on('mode', (next) => { if (next === 'direct') $('#tabRoster').click(); else $('#tabBranches').click(); });

const SOURCES = [
  { id: 'claude', name: 'Built-in model', sub: 'Claude Opus 5.5, Sonnet 5.5 or Haiku 4.5' },
  { id: 'mcp', name: 'Connect over MCP', sub: 'Point at any agent server' },
  { id: 'key', name: 'API key', sub: 'Use a model key you already pay for' },
  { id: 'local', name: 'Local agent', sub: 'Runs on your machine through the desktop app' },
];
function openSheet(agent) {
  const used = model.agents.map((a) => a.color);
  const d = agent
    ? { id: agent.id, name: agent.name, color: agent.color, source: { ...agent.source }, perms: { ...agent.perms }, limit: agent.limit, runs: agent.runs }
    : { name: '', color: COLORS.find((c) => !used.includes(c)) || 'orange', source: { type: 'mcp', url: '', model: MODELS[1].id }, perms: { timing: 'turn', motion: 'propose', look: 'propose', material: 'propose', logo: 'see' }, limit: 200, runs: 'open' };
  const m = document.createElement('div');
  m.className = 'modal';
  const sourceFields = () => {
    const s = d.source;
    if (s.type === 'claude') return `<div class="group"><div class="group-h"><b>Model</b></div><label class="f30"><select data-f="model" aria-label="Model">${MODELS.map((x) => `<option value="${x.id}"${x.id === s.model ? ' selected' : ''}>${x.name}</option>`).join('')}</select></label><div class="muted">Runs through the local server once live agents are connected. Simulated until then.</div></div>`;
    if (s.type === 'mcp') return `<div class="group"><div class="group-h"><b>Server URL</b></div><label class="f30"><input class="mono" data-f="url" aria-label="Server URL" placeholder="https://agents.example.com/mcp" value="${esc(s.url || '')}" spellcheck="false"><span class="conn">Not connected</span></label><div class="muted">Live MCP connections arrive with the local server. Until then this agent runs simulated.</div></div>`;
    if (s.type === 'key') return '<div class="group"><div class="group-h"><b>API key</b></div><label class="f30"><input aria-label="API key" placeholder="Held by the local server, never by the browser" disabled></label><div class="muted">Keys are not accepted here. They will be read by the local server once live agents are connected.</div></div>';
    return `<div class="group"><div class="group-h"><b>Local address</b></div><label class="f30"><input class="mono" data-f="url" aria-label="Local address" placeholder="http://localhost:8787" value="${esc(s.url || '')}" spellcheck="false"></label><div class="muted">Local agents connect through the desktop app. Simulated until then.</div></div>`;
  };
  const render = () => {
    const name = d.name.trim() || 'Your agent';
    m.innerHTML = `<div class="sheet" role="dialog" aria-modal="true" aria-label="${agent ? 'Edit agent' : 'Bring your own agent'}">
      <div class="sheet-head"><div><h2>${agent ? `Edit ${esc(agent.name)}` : 'Bring an agent into Logos coming to life'}</h2><div class="muted">Agents join the rings like collaborators. You decide which dials they can see, propose on, or turn.</div></div><button class="x" data-act="cancel" aria-label="Close">✕</button></div>
      <div class="sheet-body">
        <div class="sources" role="radiogroup" aria-label="Source"><b class="eyebrow-t">Source</b>${SOURCES.map((s) => `<button class="source" role="radio" aria-checked="${s.id === d.source.type}" data-source="${s.id}"><i class="radio"></i><span class="tx"><b>${s.name}</b><span class="muted">${s.sub}</span></span></button>`).join('')}</div>
        <div class="config">${sourceFields()}
          <div class="group"><div class="group-h"><b>Tools it can use</b><span class="muted">${toolSchemas.length} in this file</span></div><div class="toolchips">${toolSchemas.map((t) => `<span class="toolchip">${t.name}</span>`).join('')}</div></div>
          <div class="group"><div class="group-h"><b>Name and colour</b></div><div class="idrow"><span class="avatar s30" style="--c:var(--${d.color})">${esc(initials(name))}</span><label class="f30 grow"><input data-f="name" aria-label="Name" placeholder="acme-motion" maxlength="28" value="${esc(d.name)}"></label>
            <div class="swatches" role="radiogroup" aria-label="Colour">${COLORS.map((c) => `<button class="swatch" role="radio" aria-checked="${c === d.color}" aria-label="${c}" data-color="${c}" style="--c:var(--${c})"></button>`).join('')}</div></div></div>
          <div class="group"><div class="group-h"><b>What it can touch</b><span class="muted">per ring</span></div>${SCOPES.map((s) => `<div class="perm-row"><span class="tx"><b>${esc(s.name)}</b><span class="muted">${esc(s.sub)}</span></span><div class="segmented level" role="radiogroup" aria-label="${esc(s.name)}">${PERMS.map((p) => `<button role="radio" aria-checked="${d.perms[s.id] === p}" data-scope="${s.id}" data-perm="${p}">${p[0].toUpperCase() + p.slice(1)}</button>`).join('')}</div></div>`).join('')}</div>
          <div class="limits"><div class="group"><div class="group-h"><b>Spend limit</b></div><label class="f30"><select data-f="limit" aria-label="Spend limit">${LIMITS.map((x) => `<option value="${x.id}"${x.id === d.limit ? ' selected' : ''}>${x.name}</option>`).join('')}</select></label></div>
            <div class="group"><div class="group-h"><b>Runs</b></div><label class="f30"><select data-f="runs" aria-label="Runs">${RUNS.map((x) => `<option value="${x.id}"${x.id === d.runs ? ' selected' : ''}>${x.name}</option>`).join('')}</select></label></div></div>
        </div>
      </div>
      <div class="sheet-foot"><p>${esc(name)} appears on the rings as ${/^[aeio]/.test(d.color) ? 'an' : 'a'} ${d.color} cursor. Every change it makes is in the activity log and can be undone.</p>${agent ? '<button class="btn h30 ghost" data-act="remove">Remove</button>' : ''}<button class="btn h30" data-act="cancel">Cancel</button><button class="btn h30 blue" data-act="save">${agent ? 'Save' : 'Add agent'}</button></div></div>`;
  };
  const close = () => m.remove();
  const keep = (sel) => { render(); m.querySelector(sel)?.focus(); };
  m.addEventListener('input', (e) => {
    const f = e.target.dataset.f;
    if (f === 'name') { d.name = e.target.value; const n = d.name.trim() || 'Your agent'; m.querySelector('.avatar.s30').textContent = initials(n); m.querySelector('.sheet-foot p').textContent = `${n} appears on the rings as ${/^[aeio]/.test(d.color) ? 'an' : 'a'} ${d.color} cursor. Every change it makes is in the activity log and can be undone.`; }
    if (f === 'url') d.source.url = e.target.value;
  });
  m.addEventListener('change', (e) => {
    const f = e.target.dataset.f;
    if (f === 'model') d.source.model = e.target.value;
    if (f === 'limit') d.limit = +e.target.value;
    if (f === 'runs') d.runs = e.target.value;
  });
  m.addEventListener('click', (e) => {
    if (e.target === m) { close(); return; }
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.source) { d.source.type = b.dataset.source; keep(`[data-source="${b.dataset.source}"]`); }
    if (b.dataset.color) { d.color = b.dataset.color; keep(`[data-color="${b.dataset.color}"]`); }
    if (b.dataset.scope) { d.perms[b.dataset.scope] = b.dataset.perm; keep(`[data-scope="${b.dataset.scope}"][data-perm="${b.dataset.perm}"]`); }
    if (b.dataset.act === 'cancel') close();
    if (b.dataset.act === 'remove') { removeAgent(agent.id); close(); }
    if (b.dataset.act === 'save') {
      if (!d.name.trim()) { const el = m.querySelector('[data-f="name"]'); el.focus(); el.closest('.f30').classList.add('bad'); return; }
      saveAgent({ ...d, name: d.name.trim() });
      close();
    }
  });
  m.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  render();
  document.body.appendChild(m);
  m.querySelector(agent ? '[data-f="name"]' : `[data-source="${d.source.type}"]`)?.focus();
}

function renderAll() { renderRoster(); renderDirect(); renderPresence(); renderGhosts(); renderNotes(); renderComposer(); }
on('agents', renderAll);
on('agent-cursors', renderPresence);
on('rings', renderGhosts);
on('value', () => { renderGhosts(); renderDirect(); });
on('explore', renderComposer);
setInterval(renderRoster, 15000);
renderAll();
applyEnabled();
requestAnimationFrame(placeCursors);
