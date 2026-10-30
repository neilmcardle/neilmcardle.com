import { on, emit, clamp, rad, reduceMotion, RINGS, PARAMS, P, EASES, state, quant, frameAt, setPreview, setPlaying, note } from './engine.js';
import { callTool } from './tools.js';
import { animateTo } from './stage.js';

const STORE = 'logo-agents-v2';
const COLORS = ['violet', 'green', 'orange', 'pink'];
const PERMS = ['see', 'propose', 'turn'];
const SCOPES = [
  ...RINGS.map((r) => ({ id: r.id, name: r.name, sub: r.params.map((p) => p.label.toLowerCase()).join(', ') })),
  { id: 'logo', name: 'Logo & export', sub: 'swap logo, copy SVG' },
];
const AUTONOMY = [{ id: 'suggest', name: 'Suggest' }, { id: 'copilot', name: 'Co-pilot' }, { id: 'autopilot', name: 'Autopilot' }];
const MODELS = [
  { id: 'claude-opus-5-5', name: 'Claude Opus 5.5', short: 'Opus 5.5' },
  { id: 'claude-sonnet-5-5', name: 'Claude Sonnet 5.5', short: 'Sonnet 5.5' },
  { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5', short: 'Haiku 4.5' },
];
const LIMITS = [{ id: 50, name: '50 credits per session' }, { id: 200, name: '200 credits per session' }, { id: 500, name: '500 credits per session' }, { id: 0, name: 'No limit' }];
const RUNS = [{ id: 'open', name: 'Only while this file is open' }, { id: 'always', name: 'Until I stop it' }];
const GUIDE = { file: 'acme-brand-guide.pdf', line: 'motion: confident, never frantic' };
const basePerms = () => ({ timing: 'turn', motion: 'propose', look: 'propose', material: 'propose', logo: 'see' });
const DEFAULTS = [
  { id: 'choreographer', name: 'Choreographer', color: 'violet', role: 'motion', idle: 'Idle', source: { type: 'claude', model: 'claude-opus-5-5' } },
  { id: 'critic', name: 'Brand critic', color: 'green', role: 'critic', idle: 'Watching brand fit', source: { type: 'claude', model: 'claude-sonnet-5-5' } },
  { id: 'acme', name: 'acme-motion', color: 'orange', role: 'guide', idle: 'Idle', source: { type: 'mcp', url: 'https://agents.acme.co/motion/mcp' } },
  { id: 'tester', name: 'Loop tester', color: 'pink', role: 'tester', idle: 'Watching the loop seam', source: { type: 'claude', model: 'claude-haiku-4-5-20251001' } },
].map((a) => ({ ...a, perms: basePerms(), limit: 200, runs: 'open' }));

const INTENTS = [
  { id: 'guide', label: 'brand guide', words: ['brand guide', 'guide', 'on brand', 'confident'], v: { duration: 3.2, easing: 2 } },
  { id: 'calm', label: 'calmer', words: ['calm', 'subtle', 'gentle', 'quiet', 'soft', 'slow', 'relax', 'settle'], v: { duration: 4.2, easing: 1, stagger: 45, bounce: 4, wobble: 2, pulse: 4, spin: 0, flip: 0, drift: 0, glow: 6, blur: 0, hue: 0 } },
  { id: 'playful', label: 'more playful', words: ['playful', 'fun', 'bouncy', 'silly', 'friendly', 'cheer', 'lively'], v: { duration: 1.8, easing: 3, stagger: 30, bounce: 26, wobble: 14, pulse: 12, glow: 4 } },
  { id: 'premium', label: 'premium', words: ['premium', 'elegant', 'luxur', 'refined', 'classy', 'sophisticated', 'minimal'], v: { duration: 3.6, easing: 1, stagger: 55, draw: 60, bounce: 0, wobble: 0, pulse: 3, spin: 0, flip: 0, drift: 0, glow: 5, hue: 0, blur: 0 } },
  { id: 'punchy', label: 'punchier', words: ['punch', 'energetic', 'snappy', 'bold', 'quick', 'excit'], v: { duration: 1.2, easing: 2, stagger: 15, pulse: 20, bounce: 18, wobble: 4, glow: 10 } },
  { id: 'heartbeat', label: 'nervous heartbeat', words: ['heartbeat', 'nervous', 'anxious', 'jitter'], v: { duration: 1.1, easing: 2, pulse: 24, wobble: 16, glow: 18 } },
  { id: 'chrome', label: 'liquid chrome', words: ['chrome', 'metal', 'mercury', 'liquid'], v: { depth: 72, metal: 100, flow: 48, gloss: 88, disperse: 22, sheen: 8 } },
  { id: 'glass', label: 'clear glass', words: ['glass', 'crystal'], v: { depth: 78, metal: 0, refract: 78, disperse: 65, gloss: 82 } },
  { id: 'pearl', label: 'pearl', words: ['pearl', 'iridescen', 'holograph', 'opal'], v: { depth: 42, metal: 18, sheen: 88, gloss: 48, flow: 36 } },
  { id: 'flat', label: 'flat', words: ['flat', 'matte'], v: { depth: 0 } },
  { id: 'spin', label: 'spin', words: ['spin', 'rotat', 'orbit'], v: { spin: 1, easing: 1, stagger: 20 } },
  { id: 'flip', label: 'flip', words: ['flip', '3d'], v: { flip: 1, easing: 2 } },
  { id: 'neon', label: 'neon', words: ['neon', 'halo', 'shine', 'rainbow'], v: { glow: 24, hue: 120, blur: 1 } },
  { id: 'draw', label: 'draw on', words: ['draw', 'trace', 'outline', 'sketch'], v: { draw: 70, stagger: 55, duration: 3.2 } },
  { id: 'reveal', label: 'fade in', words: ['reveal', 'appear'], v: { fade: 60, stagger: 50 } },
  { id: 'still', label: 'still', words: ['still', 'static', 'freeze'], v: { spin: 0, flip: 0, wobble: 0, bounce: 0, pulse: 0, drift: 0, draw: 0, fade: 0, hue: 0, glow: 0, blur: 0 } },
];
const TASTE = { motion: { bounce: 18, wobble: 8, pulse: 8 }, guide: INTENTS[0].v, critic: { hue: 0, glow: 10 }, tester: { stagger: 40 } };
const MOTION = ['spin', 'flip', 'wobble', 'bounce', 'pulse', 'drift', 'hue', 'glow', 'blur'];
const RULES = [
  { agent: 'critic', dial: 'hue', bad: (v) => v.hue > 20, lock: { max: 20 }, fix: 20, title: 'Flagged the Hue swing', sub: 'on-brand colour only', text: 'Keep the hue swing under 20°. The mark should stay brand colour the whole loop.' },
  { agent: 'critic', dial: 'duration', bad: (v) => v.duration < 1.2, lock: { min: 1.2 }, fix: 1.2, title: 'Flagged the pace', sub: 'confident, never frantic', text: 'Under 1.2s the loop reads as frantic. The guide asks for confident.' },
  { agent: 'critic', dial: 'blur', bad: (v) => v.blur > 3, lock: { max: 3 }, fix: 3, title: 'Flagged the Blur', sub: 'mark must stay legible', text: 'Keep blur at 3 or under so the mark stays legible at its peak.' },
];

const model = {
  agents: DEFAULTS.map((a) => ({ ...a, perms: { ...a.perms }, source: { ...a.source } })),
  enabled: true, autonomy: 'copilot', selected: 'choreographer', proposals: [], live: {}, notes: [], feed: [], status: {}, cursor: {}, locks: {}, steps: {},
  previewing: null, lastPrompt: '', busy: 0,
};
try {
  const saved = JSON.parse(localStorage.getItem(STORE) || 'null');
  if (saved) {
    if (AUTONOMY.some((a) => a.id === saved.autonomy)) model.autonomy = saved.autonomy;
    if (saved.enabled === false) model.enabled = false;
    if (Array.isArray(saved.agents) && saved.agents.length) {
      model.agents = saved.agents.filter((a) => a && a.id && a.name && COLORS.includes(a.color)).map((a) => ({
        id: String(a.id), name: String(a.name).slice(0, 28), color: a.color, role: a.role || 'motion', idle: String(a.idle || 'Idle'),
        source: { type: 'claude', ...a.source },
        perms: Object.fromEntries(SCOPES.map((s) => [s.id, PERMS.includes(a.perms?.[s.id]) ? a.perms[s.id] : s.id === 'material' ? 'propose' : 'see'])),
        limit: Number.isFinite(a.limit) ? a.limit : 200, runs: a.runs === 'always' ? 'always' : 'open',
      }));
      if (!model.agents.some((a) => a.id === model.selected)) model.selected = model.agents[0]?.id || null;
    }
  }
} catch (e) { /* storage unavailable */ }
const persist = () => { try { localStorage.setItem(STORE, JSON.stringify({ enabled: model.enabled, autonomy: model.autonomy, agents: model.agents })); } catch (e) { /* ignore */ } };

const RINGS_OF = { ...Object.fromEntries(PARAMS.map((p) => [p.id, RINGS[p.ring].id])) };
const sleep = (ms) => new Promise((r) => setTimeout(r, reduceMotion ? Math.min(ms, 60) : ms));
const agentById = (id) => model.agents.find((a) => a.id === id);
const byRole = (role) => model.agents.find((a) => a.role === role);
const rest = (p) => (p.bipolar ? 0 : p.min);
const ringOf = (dial) => RINGS[P[dial].ring];
const say = (id, v) => { const p = P[id]; return p.options ? EASES[v].name : `${+v.toFixed(2)}${p.unit === 'turns' ? ' turns' : p.unit === 'px' ? '' : p.unit}`; };
const list = (changes) => changes.map((c) => `${P[c.dial].label} ${say(c.dial, c.to)}`).join(', ');
const initials = (name) => { const w = name.trim().split(/\s+/); const s = w.length > 1 ? w[0][0] + w[1][0] : name.trim().slice(0, 2); return s ? s[0].toUpperCase() + s.slice(1).toLowerCase() : '?'; };
const modelOf = (agent) => MODELS.find((m) => m.id === agent.source.model) || MODELS[1];
function sourceLine(agent) {
  const s = agent.source;
  if (s.type === 'mcp') { let host = ''; try { host = new URL(s.url).host; } catch (e) { host = ''; } return `Your agent · MCP${host ? ` · ${host}` : ''}`; }
  if (s.type === 'key') return 'Your agent · API key';
  if (s.type === 'local') return 'Your agent · local';
  return `${modelOf(agent).name} · built-in`;
}
const sourceShort = (agent) => ({ mcp: 'MCP', key: 'API key', local: 'Local' }[agent.source.type] || modelOf(agent).short);

function feed(who, title, sub) {
  model.feed.unshift({ who, title, sub, at: Date.now() });
  if (model.feed.length > 24) model.feed.pop();
  emit('agents');
}
function setStatus(agent, text, active = true) {
  if (text) model.status[agent.id] = { text, active }; else delete model.status[agent.id];
  emit('agents');
}
function setCursor(agent, spot) {
  if (spot) model.cursor[agent.id] = spot; else delete model.cursor[agent.id];
  emit('agent-cursors');
}

function interpret(prompt, base = state.v) {
  const text = prompt.toLowerCase(), target = {}, labels = [], ids = [];
  for (const it of INTENTS) if (it.words.some((w) => new RegExp(`\\b${w}`).test(text))) { Object.assign(target, it.v); labels.push(it.label); ids.push(it.id); }
  const nudge = (id, k, label) => { const p = P[id]; target[id] = (target[id] ?? base[id]) + (p.max - p.min) * k; labels.push(label); };
  if (/\b(faster|speed up|quicker)\b/.test(text)) nudge('duration', -0.15, 'faster');
  if (/\b(slower|slow down)\b/.test(text)) nudge('duration', 0.15, 'slower');
  for (const p of PARAMS) {
    const name = p.label.toLowerCase();
    const num = text.match(new RegExp(`\\b${name}\\s*(?:to|=|:|at)?\\s*(-?\\d+(?:\\.\\d+)?)`));
    if (num && !p.options) { target[p.id] = +num[1]; labels.push(`${name} ${num[1]}`); }
    else if (new RegExp(`\\b(more|increase|raise|bigger|stronger|add)\\s+(?:the\\s+)?${name}\\b`).test(text)) nudge(p.id, 0.25, `more ${name}`);
    else if (new RegExp(`\\b(less|reduce|lower|decrease|smaller|weaker)\\s+(?:the\\s+)?${name}\\b`).test(text)) nudge(p.id, -0.25, `less ${name}`);
    else if (new RegExp(`\\b(no|remove|without)\\s+(?:the\\s+)?${name}\\b`).test(text) && !p.options && p.id !== 'duration') { target[p.id] = rest(p); labels.push(`no ${name}`); }
  }
  const curve = EASES.findIndex((e) => new RegExp(`\\b${e.name.toLowerCase()}\\s+eas|eas\\w*\\s+(?:to\\s+)?${e.name.toLowerCase()}`).test(text));
  if (curve >= 0) { target.easing = curve; labels.push(`${EASES[curve].name} easing`); }
  for (const id in target) {
    const lock = model.locks[id] || {};
    target[id] = quant(P[id], clamp(target[id], lock.min ?? P[id].min, lock.max ?? P[id].max));
  }
  return { target, labels, ids };
}

function energy(values) {
  return MOTION.reduce((sum, id) => { const p = P[id], r = rest(p); return sum + Math.abs(values[id] - r) / (p.max - r); }, 0) / MOTION.length;
}
const energyLabel = (e) => (e < 0.12 ? 'Calm' : e < 0.28 ? 'Balanced' : e < 0.45 ? 'Lively' : 'Frantic');
function fit(values, target = {}) {
  const ids = Object.keys(target);
  const miss = ids.length ? ids.reduce((s, id) => s + Math.abs(values[id] - target[id]) / (P[id].max - P[id].min), 0) / ids.length : 0.06;
  const broken = RULES.filter((r) => r.bad(values)).length;
  return Math.round(clamp(96 - miss * 130 - Math.max(0, energy(values) - 0.45) * 80 - broken * 9, 35, 98));
}
function seam(values) {
  const n = 6, a = frameAt(0, n, values), b = frameAt(values.duration * 0.99999, n, values);
  let d = Math.abs(Math.sin(rad(b.whole.spin - a.whole.spin) / 2)) + Math.abs(Math.cos(rad(b.whole.flip)) - Math.cos(rad(a.whole.flip))) / 2;
  for (let i = 0; i < n; i++) {
    const x = a.parts[i], y = b.parts[i];
    d += (Math.abs(x.tx - y.tx) + Math.abs(x.ty - y.ty)) / 80 + Math.abs(x.rot - y.rot) / 45 + Math.abs(x.sc - y.sc) + Math.abs(x.op - y.op) + Math.abs(x.p - y.p);
  }
  return d;
}
const seamClean = (values) => seam(values) < 0.05;

const rank = (a, ring) => (a.perms[ring] === 'turn' ? 0 : 1);
function plan(prompt, agentId) {
  const pool = agentId === 'all' ? model.agents : model.agents.filter((a) => a.id === agentId);
  const jobs = new Map(), skipped = [], locked = [];
  const give = (agent, dial, to) => { if (!jobs.has(agent)) jobs.set(agent, []); jobs.get(agent).push({ dial, to }); };
  if (prompt) {
    const { target, labels, ids } = interpret(prompt);
    for (const dial in target) {
      if (target[dial] === state.v[dial]) continue;
      if (state.locks[dial]) { locked.push(dial); continue; }
      const ring = ringOf(dial).id;
      const able = pool.filter((a) => a.perms[ring] !== 'see').sort((a, b) => rank(a, ring) - rank(b, ring));
      if (able.length) give(able[0], dial, target[dial]); else skipped.push(dial);
    }
    return { jobs, skipped, locked, target, goal: labels.join(', '), guide: ids.includes('guide'), understood: labels.length > 0 };
  }
  const target = {};
  for (const agent of pool) {
    const taste = TASTE[agent.role] || TASTE.motion;
    for (const dial in taste) {
      const to = quant(P[dial], taste[dial]);
      if (to === state.v[dial] || dial in target || state.locks[dial] || agent.perms[ringOf(dial).id] === 'see') continue;
      target[dial] = to; give(agent, dial, to);
    }
  }
  return { jobs, skipped, locked, target, goal: '', guide: false, understood: true };
}

let chain = Promise.resolve();
const turn = (dial, value, label, who) => (chain = chain.then(async () => {
  if (label) note(label, who);
  try { callTool('set_dial', { dial, value, animate: true }); } catch (e) { return; }
  await sleep(640);
}));

function candidates(changes, guide) {
  if (guide && changes.some((c) => c.dial === 'duration')) {
    const out = [];
    for (const duration of [1.6, 2.4, 3.2, 4.0]) for (const easing of [1, 2, 3]) out.push({ duration, easing });
    return out;
  }
  return Array.from({ length: 8 }, (_, k) => Object.fromEntries(changes.map((c) => [c.dial, quant(P[c.dial], state.v[c.dial] + ((c.to - state.v[c.dial]) * (k + 1)) / 8)])));
}

async function work(agent, changes, ctx, delay) {
  const { goal, guide, target } = ctx;
  await sleep(delay);
  setStatus(agent, 'Reading the rings');
  setCursor(agent, { verb: 'reading the rings' });
  callTool('read_rings');
  await sleep(550);

  const counts = RINGS.map((r) => changes.filter((c) => ringOf(c.dial) === r).length);
  const ring = RINGS[counts.indexOf(Math.max(...counts))];
  setStatus(agent, `Working on the ${ring.name} ring`);
  setCursor(agent, { ring: ring.id, verb: `on ${ring.name}` });
  const tries = candidates(changes, guide);
  let best = null, bestScore = -1;
  for (let k = 0; k < tries.length; k++) {
    if (!agentById(agent.id) || !model.enabled) { delete model.live[agent.id]; return; }
    const values = { ...state.v, ...tries[k] };
    callTool('render_preview', { values: tries[k] });
    const score = fit(values, target);
    if (score >= bestScore) { bestScore = score; best = tries[k]; }
    model.live[agent.id] = {
      text: `Working on the ${ring.name} ring${goal ? ` for “${goal}”` : ''}. Trying candidates before it picks one.`,
      rows: Object.keys(tries[k]).filter((d) => tries[k][d] !== state.v[d]).slice(0, 3).map((dial) => ({ dial, to: tries[k][dial] })), k: k + 1, n: tries.length,
    };
    emit('agents');
    await sleep(190);
  }
  delete model.live[agent.id];
  const picked = changes.map((c) => ({ dial: c.dial, to: best && c.dial in best ? best[c.dial] : c.to })).filter((c) => c.to !== state.v[c.dial]);

  const waiting = [];
  for (const c of picked) {
    if (!model.enabled) return;
    const p = P[c.dial], direct = model.autonomy !== 'suggest' && agent.perms[ringOf(c.dial).id] === 'turn';
    setCursor(agent, { dial: c.dial, verb: `${direct ? 'turning' : 'proposing'} ${p.fmt(c.to)}` });
    await sleep(520);
    if (direct) {
      const from = state.v[c.dial];
      await turn(c.dial, c.to, `${agent.name}: ${p.label} ${say(c.dial, from)} → ${say(c.dial, c.to)}`, agent.id);
      feed(agent.id, `${p.label} ${say(c.dial, from)} → ${say(c.dial, c.to)}`, `${ringOf(c.dial).name} ring`);
    } else waiting.push(c);
  }

  const first = tries[0], last = tries[tries.length - 1];
  model.steps[agent.id] = guide
    ? [
      { title: `Read ${GUIDE.file}`, sub: GUIDE.line },
      { title: `Rendered ${tries.length} candidate loops`, sub: `${first.duration?.toFixed(1)}s to ${last.duration?.toFixed(1)}s, 3 easings` },
      { title: 'Scored each against the guide', sub: `${list(picked.length ? picked : changes).replace(/, /g, ' + ')} scored highest` },
    ]
    : [
      { title: 'Read the rings', sub: `${PARAMS.length} dials on ${RINGS.length} rings` },
      { title: `Rendered ${tries.length} candidate loops`, sub: goal ? `stepping from the current loop towards “${goal}”` : 'small steps around the current loop' },
      { title: 'Scored each for brand fit', sub: `best candidate scored ${bestScore}%` },
    ];

  if (waiting.length) {
    const after = { ...state.v, ...Object.fromEntries(waiting.map((c) => [c.dial, c.to])) };
    model.proposals = model.proposals.filter((x) => x.agent !== agent.id);
    model.proposals.push({
      agent: agent.id, changes: waiting, before: fit(state.v, target), after: fit(after, target),
      text: guide
        ? 'Your brand guide says motion should feel “confident, never frantic”. A slower loop with a Back ease gives the mark a deliberate bloom.'
        : goal ? `For “${goal}”: ${list(waiting)}. These rings wait for you, so nothing has changed yet.` : `A small polish: ${list(waiting)}.`,
    });
    model.selected = agent.id;
    setStatus(agent, `Waiting on you · ${waiting.length} change${waiting.length === 1 ? '' : 's'}`);
    feed(agent.id, `Proposed ${list(waiting)}`, guide ? `read ${GUIDE.file}` : goal ? `for “${goal}”` : 'unprompted polish');
  } else {
    setStatus(agent, null);
    await sleep(900);
    setCursor(agent, null);
  }
}

function effective() {
  const v = { ...state.v };
  model.proposals.forEach((x) => x.changes.forEach((c) => { v[c.dial] = c.to; }));
  return v;
}
let lastSeam = '';
function review() {
  if (!model.enabled) return;
  const v = effective();
  for (const rule of RULES) {
    const agent = byRole('critic'), open = model.notes.find((n) => n.dial === rule.dial && n.rule);
    if (!agent || !rule.bad(v) || model.locks[rule.dial]) { if (open) dropNote(open.id); continue; }
    if (open) continue;
    model.notes.push({ id: `${rule.dial}-${Date.now()}`, agent: agent.id, dial: rule.dial, rule: true, text: rule.text, fix: rule.fix, lock: rule.lock, action: `Lock ${P[rule.dial].label} at ${say(rule.dial, rule.fix)}` });
    setStatus(agent, `Left a note on ${P[rule.dial].label}`);
    setCursor(agent, { dial: rule.dial });
    feed(agent.id, rule.title, rule.sub);
  }
  const tester = byRole('tester');
  if (tester) {
    const clean = seamClean(v), culprit = ['spin', 'flip'].find((d) => v[d] % 1 !== 0);
    const key = `${clean}-${culprit}`;
    const open = model.notes.find((n) => n.agent === tester.id);
    if (clean && open) dropNote(open.id);
    if (key !== lastSeam) {
      lastSeam = key;
      if (clean) { setStatus(tester, null); setCursor(tester, null); feed(tester.id, `Loop seam is clean at ${say('duration', v.duration)}`, 'no pops'); }
      else if (culprit && !open) {
        const to = Math.round(v[culprit]);
        model.notes.push({ id: `${culprit}-${Date.now()}`, agent: tester.id, dial: culprit, text: `${P[culprit].label} ${say(culprit, v[culprit])} never returns home, so the loop pops at the seam.`, fix: to, action: `Set ${P[culprit].label} to ${say(culprit, to)}` });
        setStatus(tester, `Left a note on ${P[culprit].label}`);
        setCursor(tester, { dial: culprit });
        feed(tester.id, 'Loop seam pops', `${P[culprit].label} ${say(culprit, v[culprit])}`);
      }
    }
  }
  emit('agents');
}
let reviewTimer = 0;
const reviewSoon = () => { clearTimeout(reviewTimer); reviewTimer = setTimeout(review, 900); };

async function run(prompt = '', agentId = model.selected, { auto = false } = {}) {
  if (!model.enabled) return 0;
  const text = prompt.trim();
  if (text) model.lastPrompt = text;
  const { jobs, skipped, locked, target, goal, guide, understood } = plan(text, agentId);
  const lead = agentById(agentId);
  if (text && !auto) feed('you', `You: “${text}”`, `to ${lead ? lead.name : 'everyone'}`);
  if (!understood) {
    if (!auto) feed(lead?.id || model.agents[0]?.id, 'Could not map that to a dial', 'try calmer, more glow, bounce 30');
    return 0;
  }
  if (!auto) skipped.forEach((dial) => feed(lead?.id || 'you', `${P[dial].label} left alone`, `${lead ? lead.name : 'No agent'} can only see the ${ringOf(dial).name} ring`));
  if (!auto) locked.forEach((dial) => feed(lead?.id || 'you', `${P[dial].label} left alone`, 'locked by you'));
  if (!jobs.size) {
    if (!auto && !skipped.length && !locked.length) feed(lead?.id || model.agents[0]?.id, 'Nothing to change', 'the loop already matches');
    return 0;
  }
  model.busy++; emit('agents');
  await Promise.all([...jobs].map(([agent, changes], i) => work(agent, changes, { goal, guide, target }, i * 320)));
  model.busy--;
  review();
  return [...jobs.values()].reduce((n, c) => n + c.length, 0);
}

function stopPreview() {
  if (!model.previewing) return;
  model.previewing = null; setPreview(null);
}
function togglePreview(agentId) {
  const x = model.proposals.find((q) => q.agent === agentId);
  if (!x || model.previewing === agentId) stopPreview();
  else { model.previewing = agentId; setPreview(Object.fromEntries(x.changes.map((c) => [c.dial, c.to]))); setPlaying(true); }
  emit('agents');
}
function drop(agentId) {
  if (model.previewing === agentId) stopPreview();
  model.proposals = model.proposals.filter((q) => q.agent !== agentId);
  const agent = agentById(agentId);
  if (agent) { setStatus(agent, null); setCursor(agent, null); }
}
function accept(agentId) {
  const x = model.proposals.find((q) => q.agent === agentId);
  if (!x) return;
  drop(agentId);
  chain = chain.then(async () => { note(`Accepted ${list(x.changes)} from ${agentById(agentId)?.name || 'an agent'}`); animateTo(Object.fromEntries(x.changes.map((c) => [c.dial, c.to]))); await sleep(640); });
  feed('you', `Accepted ${list(x.changes)}`, `from ${agentById(agentId)?.name || 'an agent'}`);
}
function reject(agentId) {
  const x = model.proposals.find((q) => q.agent === agentId);
  if (!x) return;
  drop(agentId);
  feed('you', `Rejected ${list(x.changes)}`, `from ${agentById(agentId)?.name || 'an agent'}`);
  reviewSoon();
}

function dropNote(id) {
  const n = model.notes.find((x) => x.id === id);
  if (!n) return;
  model.notes = model.notes.filter((x) => x.id !== id);
  const agent = agentById(n.agent);
  if (agent && !model.notes.some((x) => x.agent === n.agent)) { setStatus(agent, null); setCursor(agent, null); }
  emit('agents');
}
function applyNote(id) {
  const n = model.notes.find((x) => x.id === id);
  if (!n) return;
  if (n.lock) model.locks[n.dial] = n.lock;
  model.proposals.forEach((x) => { x.changes = x.changes.filter((c) => c.dial !== n.dial); });
  model.proposals.filter((x) => !x.changes.length).forEach((x) => drop(x.agent));
  dropNote(id);
  turn(n.dial, n.fix, n.action);
  feed('you', n.action, `from ${agentById(n.agent)?.name || 'an agent'}’s note`);
}

function setEnabled(on) {
  model.enabled = !!on;
  if (!model.enabled) {
    stopPreview();
    model.proposals = []; model.notes = []; model.live = {}; model.status = {}; model.cursor = {};
  }
  persist(); emit('agents'); emit('agent-cursors');
  if (model.enabled) reviewSoon();
}
function select(id) { if (agentById(id)) { model.selected = id; emit('agents'); } }
function setAutonomy(id) {
  if (!AUTONOMY.some((a) => a.id === id)) return;
  model.autonomy = id; persist(); emit('agents');
}
function saveAgent(data) {
  const existing = data.id && agentById(data.id);
  if (existing) Object.assign(existing, data);
  else { const id = `agent-${Date.now()}`; model.agents.push({ role: 'motion', idle: 'Idle', ...data, id }); model.selected = id; }
  persist(); emit('agents'); emit('agent-cursors');
}
function removeAgent(id) {
  drop(id);
  model.notes.filter((n) => n.agent === id).forEach((n) => dropNote(n.id));
  model.agents = model.agents.filter((a) => a.id !== id);
  delete model.status[id]; delete model.cursor[id]; delete model.live[id];
  if (model.selected === id) model.selected = model.agents[0]?.id || null;
  persist(); emit('agents'); emit('agent-cursors');
}

on('value', (id) => {
  let changed = false;
  model.proposals.forEach((x) => { const n = x.changes.length; x.changes = x.changes.filter((c) => !(c.dial === id && c.to === state.v[id])); changed = changed || n !== x.changes.length; });
  model.proposals.filter((x) => !x.changes.length).forEach((x) => drop(x.agent));
  if (changed) emit('agents');
  if (!model.busy && model.enabled) reviewSoon();
});

let turnIndex = 0;
setInterval(() => {
  if (!model.enabled || model.autonomy !== 'autopilot' || model.busy || document.hidden || !model.agents.length) return;
  const agent = model.agents[turnIndex++ % model.agents.length];
  if (model.proposals.some((x) => x.agent === agent.id)) return;
  run(model.lastPrompt, agent.id, { auto: true });
}, 9000);
setTimeout(review, 1200);

export {
  model, COLORS, PERMS, SCOPES, RINGS_OF, AUTONOMY, MODELS, LIMITS, RUNS, INTENTS, agentById, byRole, say, initials, sourceLine, sourceShort, modelOf,
  fit, energy, energyLabel, seamClean, interpret, feed, run, accept, reject, togglePreview, applyNote, dropNote, select, setEnabled, setAutonomy, saveAgent, removeAgent,
};
