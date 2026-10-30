const listeners = {};
const on = (type, fn) => { (listeners[type] ||= []).push(fn); };
const emit = (type, data) => { (listeners[type] || []).forEach((fn) => fn(data)); };

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const frac = (x) => x - Math.floor(x);
const rad = (d) => (d * Math.PI) / 180;
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

const outBounce = (t) => {
  const n = 7.5625, d = 2.75;
  if (t < 1 / d) return n * t * t;
  if (t < 2 / d) return n * (t -= 1.5 / d) * t + 0.75;
  if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + 0.9375;
  return n * (t -= 2.625 / d) * t + 0.984375;
};
const EASES = [
  { name: 'Linear', short: 'lin', f: (t) => t },
  { name: 'Ease in-out', short: 'ease', f: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2) },
  { name: 'Back', short: 'back', f: (t) => { const c = 1.70158 * 1.525; return t < 0.5 ? (Math.pow(2 * t, 2) * ((c + 1) * 2 * t - c)) / 2 : (Math.pow(2 * t - 2, 2) * ((c + 1) * (t * 2 - 2) + c) + 2) / 2; } },
  { name: 'Elastic', short: 'elas', f: (t) => (t <= 0 ? 0 : t >= 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1) },
  { name: 'Bounce', short: 'bnce', f: outBounce },
];

const RINGS = [
  { id: 'timing', name: 'Timing', rf: 0.37 },
  { id: 'motion', name: 'Motion', rf: 0.765 },
  { id: 'look', name: 'Look', rf: 0.95 },
  { id: 'material', name: 'Material', rf: 0.565 },
];
const sign = (v) => (v > 0 ? '+' : '');
const PARAMS = [
  { id: 'duration', ring: 0, label: 'Duration', min: 0.4, max: 8, step: 0.1, def: 2.4, unit: 's', fmt: (v) => v.toFixed(1) + 's', desc: 'Length of one loop.' },
  { id: 'easing', ring: 0, label: 'Easing', min: 0, max: 4, step: 1, def: 1, unit: '', options: true, fmt: (v) => EASES[v].short, desc: 'Curve applied to every channel.' },
  { id: 'stagger', ring: 0, label: 'Stagger', min: 0, max: 100, step: 1, def: 35, unit: '%', fmt: (v) => v + '%', desc: 'Spreads the parts of the logo across the loop so they move one after another.' },
  { id: 'spin', ring: 1, label: 'Spin', min: -3, max: 3, step: 0.25, def: 0, unit: 'turns', bipolar: true, fmt: (v) => sign(v) + v, desc: 'Whole turns per loop. Negative spins anticlockwise.' },
  { id: 'flip', ring: 1, label: 'Flip', min: -2, max: 2, step: 0.5, def: 0, unit: 'turns', bipolar: true, fmt: (v) => sign(v) + v, desc: '3D turns around the vertical axis.' },
  { id: 'wobble', ring: 1, label: 'Wobble', min: 0, max: 45, step: 1, def: 6, unit: '°', fmt: (v) => v + '°', desc: 'Each part rocks back and forth.' },
  { id: 'bounce', ring: 1, label: 'Bounce', min: 0, max: 80, step: 1, def: 14, unit: 'px', fmt: (v) => v + '', desc: 'Each part hops up and lands once per loop. Measured on a 200px logo.' },
  { id: 'pulse', ring: 1, label: 'Pulse', min: 0, max: 60, step: 1, def: 6, unit: '%', fmt: (v) => v + '%', desc: 'Each part swells and settles.' },
  { id: 'drift', ring: 1, label: 'Drift', min: 0, max: 60, step: 1, def: 0, unit: 'px', fmt: (v) => v + '', desc: 'Each part sways sideways.' },
  { id: 'draw', ring: 2, label: 'Draw', min: 0, max: 100, step: 1, def: 0, unit: '%', fmt: (v) => v + '%', desc: 'Share of the loop spent tracing outlines in and out. Works on vector logos.' },
  { id: 'fade', ring: 2, label: 'Fade', min: 0, max: 100, step: 1, def: 0, unit: '%', fmt: (v) => v + '%', desc: 'Share of the loop spent fading parts in and out.' },
  { id: 'hue', ring: 2, label: 'Hue', min: 0, max: 360, step: 5, def: 0, unit: '°', fmt: (v) => v + '°', desc: 'How far the colour swings round the wheel.' },
  { id: 'glow', ring: 2, label: 'Glow', min: 0, max: 40, step: 1, def: 8, unit: 'px', fmt: (v) => v + '', desc: 'Breathing halo in the logo colour.' },
  { id: 'blur', ring: 2, label: 'Blur', min: 0, max: 12, step: 0.5, def: 0, unit: 'px', fmt: (v) => v + '', desc: 'Softens the logo at the peak of the motion.' },
  { id: 'depth', ring: 3, label: 'Depth', min: 0, max: 100, step: 1, def: 60, unit: '%', fmt: (v) => v + '%', desc: 'How far the surface domes up from its edge. At 0 the material is off and the logo is flat.' },
  { id: 'metal', ring: 3, label: 'Metal', min: 0, max: 100, step: 1, def: 35, unit: '%', fmt: (v) => v + '%', desc: 'From clear glass at 0 to liquid chrome at 100.' },
  { id: 'refract', ring: 3, label: 'Refraction', min: 0, max: 100, step: 1, def: 55, unit: '%', fmt: (v) => v + '%', desc: 'How strongly the glass bends what it shows through it.' },
  { id: 'disperse', ring: 3, label: 'Dispersion', min: 0, max: 100, step: 1, def: 40, unit: '%', fmt: (v) => v + '%', desc: 'Rainbow fringing where the surface curves.' },
  { id: 'flow', ring: 3, label: 'Flow', min: 0, max: 100, step: 1, def: 30, unit: '%', fmt: (v) => v + '%', desc: 'Liquid ripples that travel through the surface once per loop.' },
  { id: 'gloss', ring: 3, label: 'Gloss', min: 0, max: 100, step: 1, def: 70, unit: '%', fmt: (v) => v + '%', desc: 'From soft satin highlights to sharp mirror ones.' },
  { id: 'sheen', ring: 3, label: 'Sheen', min: 0, max: 100, step: 1, def: 20, unit: '%', fmt: (v) => v + '%', desc: 'Iridescent colour that shifts with the angle of the surface.' },
];
const P = Object.fromEntries(PARAMS.map((p) => [p.id, p]));
RINGS.forEach((r, i) => { r.params = PARAMS.filter((p) => p.ring === i); r.slots = r.params.length + 1; r.step = 360 / r.slots; });
const PEAK = { spin: 0.5, flip: 0.5, wobble: 0.25, bounce: 0.5, pulse: 0.5, drift: 0.25, draw: 0.5, fade: 0.5, hue: 0.5, glow: 0.25, blur: 0.5 };
const KIND = { spin: 'turn', flip: 'turn', wobble: 'wav', drift: 'wav', glow: 'wav', bounce: 'hop', pulse: 'hop', hue: 'hop', blur: 'hop', draw: 'env', fade: 'env' };
const timed = (id) => id in PEAK;
const AT = {
  duration: 300, easing: 0, stagger: 60,
  wobble: 60, drift: 115, bounce: 180, pulse: 212, spin: 270, flip: 325,
  glow: 30, draw: 100, fade: 145, hue: 235, blur: 295,
  depth: 202.5, metal: 247.5, refract: 292.5, disperse: 337.5, flow: 22.5, gloss: 67.5, sheen: 112.5,
};

const PRESETS = [
  { name: 'Draw on', desc: 'Outlines trace in, part by part', v: { duration: 3.2, easing: 1, stagger: 55, draw: 70, fade: 0, bounce: 0, pulse: 0, wobble: 0, spin: 0, flip: 0, drift: 0, glow: 6, hue: 0, blur: 0 }, at: { draw: 180, glow: 215 } },
  { name: 'Heartbeat', desc: 'Tight pulse with a halo', v: { duration: 1.1, easing: 2, stagger: 0, pulse: 24, glow: 18, bounce: 0, wobble: 0, draw: 0, fade: 0, spin: 0, flip: 0, drift: 0, hue: 0, blur: 0 }, at: { pulse: 180, glow: 180 } },
  { name: 'Jelly', desc: 'Wobbly, springy, a bit silly', v: { duration: 1.8, easing: 3, stagger: 25, wobble: 16, pulse: 12, bounce: 8, draw: 0, fade: 0, spin: 0, flip: 0, drift: 0, glow: 0, hue: 0, blur: 0 }, at: { wobble: 140, bounce: 180, pulse: 205 } },
  { name: 'Orbit', desc: 'One clean turn, then a breath', v: { duration: 3, easing: 1, stagger: 20, spin: 1, wobble: 0, bounce: 0, pulse: 0, draw: 0, fade: 0, flip: 0, drift: 0, glow: 4, hue: 0, blur: 0 }, at: { spin: 180, glow: 180 } },
  { name: 'Pop in', desc: 'Parts hop in and out of view', v: { duration: 2.2, easing: 2, stagger: 60, bounce: 30, fade: 70, pulse: 10, wobble: 0, draw: 0, spin: 0, flip: 0, drift: 0, glow: 0, hue: 0, blur: 0 }, at: { bounce: 180, pulse: 205, fade: 180 } },
  { name: 'Flip card', desc: 'A full 3D turn with overshoot', v: { duration: 2.6, easing: 2, stagger: 0, flip: 1, spin: 0, bounce: 6, pulse: 0, wobble: 0, draw: 0, fade: 0, drift: 0, glow: 6, hue: 0, blur: 0 }, at: { flip: 180, bounce: 250, glow: 180 } },
  { name: 'Neon', desc: 'Colour cycling glow, soft focus', v: { duration: 4, easing: 0, stagger: 40, hue: 180, glow: 26, blur: 1.5, pulse: 4, bounce: 0, wobble: 0, draw: 0, fade: 0, spin: 0, flip: 0, drift: 6 }, at: { drift: 90, pulse: 180, glow: 90, hue: 180, blur: 270 } },
  { name: 'Liquid chrome', desc: 'Mirror metal with a slow ripple', v: { depth: 72, metal: 100, refract: 40, disperse: 22, flow: 48, gloss: 88, sheen: 8 } },
  { name: 'Clear glass', desc: 'Thick glass with rainbow edges', v: { depth: 78, metal: 0, refract: 78, disperse: 65, flow: 18, gloss: 82, sheen: 10 } },
  { name: 'Pearl', desc: 'Soft iridescent satin', v: { depth: 42, metal: 18, refract: 35, disperse: 30, flow: 36, gloss: 48, sheen: 88 } },
  { name: 'Flat', desc: 'Material off, plain colour', v: { depth: 0 } },
  { name: 'Still', desc: 'Everything at rest', v: { spin: 0, flip: 0, wobble: 0, bounce: 0, pulse: 0, drift: 0, draw: 0, fade: 0, hue: 0, glow: 0, blur: 0 } },
];

const petals = [0, 60, 120, 180, 240, 300].map((a) => `<ellipse cx="100" cy="56" rx="19" ry="36" transform="rotate(${a} 100 100)"/>`).join('');
const LOGOS = {
  bloom: { name: 'Bloom', svg: `<svg viewBox="0 0 200 200" fill="currentColor">${petals}<circle cx="100" cy="100" r="15"/></svg>` },
  orbit: { name: 'Orbit', svg: `<svg viewBox="0 0 200 200" fill="currentColor"><circle cx="100" cy="100" r="68" fill="none" stroke="currentColor" stroke-width="13"/><circle cx="100" cy="100" r="30"/><circle cx="148" cy="52" r="17"/></svg>` },
  stack: { name: 'Stack', svg: `<svg viewBox="0 0 200 200" fill="currentColor" stroke-linejoin="round"><path fill-opacity=".4" d="M100 108 172 140 100 172 28 140Z"/><path fill-opacity=".7" d="M100 70 172 102 100 134 28 102Z"/><path d="M100 32 172 64 100 96 28 64Z"/></svg>` },
  spark: { name: 'Spark', svg: `<svg viewBox="0 0 200 200" fill="currentColor"><path d="M96 24c5 50 22 68 72 74-50 6-67 24-72 74-5-50-22-68-72-74 50-6 67-24 72-74Z"/><path d="M158 22c2 14 7 19 21 21-14 2-19 7-21 21-2-14-7-19-21-21 14-2 19-7 21-21Z"/><circle cx="160" cy="160" r="10"/><circle cx="34" cy="38" r="6"/></svg>` },
};

const STORE = 'logo-dials-v1';
const state = {
  v: Object.fromEntries(PARAMS.map((p) => [p.id, p.def])),
  sel: 'bounce', playing: !reduceMotion, t: 0,
  logo: 'bloom', color: '#7B61FF', custom: null, preview: null,
  locks: {}, scale: 1, parting: {}, at: { ...AT },
};
try {
  const saved = JSON.parse(localStorage.getItem(STORE) || 'null');
  if (saved) {
    for (const k in saved.v || {}) if (P[k] && Number.isFinite(saved.v[k])) state.v[k] = clamp(saved.v[k], P[k].min, P[k].max);
    if (saved.sel && P[saved.sel]) state.sel = saved.sel;
    if (/^#[0-9a-f]{6}$/i.test(saved.color || '')) state.color = saved.color;
    if (saved.custom && (saved.custom.type === 'svg' || saved.custom.type === 'img')) state.custom = saved.custom;
    if (saved.logo && (LOGOS[saved.logo] || (saved.logo === 'custom' && state.custom))) state.logo = saved.logo;
    for (const k in saved.locks || {}) if (P[k] && saved.locks[k]) state.locks[k] = true;
    if (Number.isFinite(saved.scale)) state.scale = clamp(saved.scale, 0.4, 1.5);
    if (saved.parting && typeof saved.parting === 'object') state.parting = saved.parting;
    for (const k in saved.at || {}) if (P[k] && Number.isFinite(saved.at[k])) state.at[k] = ((saved.at[k] % 360) + 360) % 360;
  }
} catch (e) { /* storage unavailable */ }
state.t = state.v.duration * 0.5; 

let saveTimer = 0;
const save = () => {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      const custom = state.custom && JSON.stringify(state.custom).length < 400000 ? state.custom : null;
      localStorage.setItem(STORE, JSON.stringify({ v: state.v, sel: state.sel, color: state.color, logo: custom || state.logo !== 'custom' ? state.logo : 'bloom', custom, locks: state.locks, scale: state.scale, parting: state.parting, at: state.at }));
    } catch (e) { /* ignore */ }
  }, 250);
};

const HISTORY = 'logo-history-v1';
const snapshot = () => ({ v: { ...state.v }, locks: { ...state.locks }, scale: state.scale, parting: JSON.stringify(state.parting), at: { ...state.at } });
const timeline = [];
let cursor = 0, editSnap = null, pending = null, historyTimer = 0;
try {
  const saved = JSON.parse(localStorage.getItem(HISTORY) || 'null');
  if (saved && Array.isArray(saved.timeline) && saved.timeline[saved.cursor] && JSON.stringify(saved.timeline[saved.cursor].snap) === JSON.stringify(snapshot())) { timeline.push(...saved.timeline); cursor = saved.cursor; }
} catch (e) { /* storage unavailable */ }
if (!timeline.length) timeline.push({ snap: snapshot(), label: 'Opened', who: 'you', at: Date.now() });
const saveHistory = () => {
  clearTimeout(historyTimer);
  historyTimer = setTimeout(() => {
    const from = Math.max(0, timeline.length - 100);
    try { localStorage.setItem(HISTORY, JSON.stringify({ timeline: timeline.slice(from), cursor: cursor - from })); } catch (e) { /* ignore */ }
  }, 400);
};
const shown = (p, v) => (p.options ? EASES[v].name : `${+(+v).toFixed(2)}${p.unit === 'turns' ? ' turns' : p.unit === 'px' ? '' : p.unit}`);
function describe(a, b) {
  const dials = PARAMS.filter((p) => a.v[p.id] !== b.v[p.id]);
  const group = (list) => {
    if (list.length === PARAMS.length) return 'everything';
    const ring = RINGS.find((r) => r.params.length === list.length && r.params.every((p) => list.includes(p)));
    return ring ? `the ${ring.name} ring` : list.length === 1 ? list[0].label : `${list.length} dials`;
  };
  const out = [];
  if (dials.length === 1) out.push(`${dials[0].label} ${shown(dials[0], a.v[dials[0].id])} → ${shown(dials[0], b.v[dials[0].id])}`);
  else if (dials.length) out.push(dials.length <= 3 ? dials.map((p) => p.label).join(', ') : `${dials.length} dials`);
  const locked = PARAMS.filter((p) => !a.locks[p.id] && b.locks[p.id]), unlocked = PARAMS.filter((p) => a.locks[p.id] && !b.locks[p.id]);
  if (locked.length) out.push(`Locked ${group(locked)}`);
  if (unlocked.length) out.push(`Unlocked ${group(unlocked)}`);
  if (a.scale !== b.scale) out.push(`Logo size ${Math.round(a.scale * 100)}% → ${Math.round(b.scale * 100)}%`);
  if (a.parting !== b.parting) out.push('Regrouped parts');
  const moved = PARAMS.filter((p) => a.at && b.at && Math.abs(a.at[p.id] - b.at[p.id]) > 0.01);
  const when = (p, s) => `${((s.at[p.id] / 360) * s.v.duration).toFixed(2)}s`;
  if (moved.length === 1) out.push(timed(moved[0].id) ? `${moved[0].label} keyframe ${when(moved[0], b)}` : `Moved ${moved[0].label}`);
  else if (moved.length) {
    const ring = RINGS.find((r) => moved.every((p) => r.params.includes(p)));
    const shift = wrap180(b.at[moved[0].id] - a.at[moved[0].id]), secs = (Math.abs(shift) / 360) * b.v.duration;
    out.push(ring && ring.params.some((p) => timed(p.id)) ? `Shifted the ${ring.name} ring ${secs.toFixed(2)}s ${shift > 0 ? 'later' : 'earlier'}` : `Moved ${ring ? `the ${ring.name} ring` : `${moved.length} dials`}`);
  }
  return out.join(' · ') || 'Change';
}
const note = (label, who = 'you') => { pending = { label, who }; };
const beginEdit = () => { if (!editSnap) editSnap = snapshot(); };
const endEdit = () => {
  if (!editSnap) return;
  const before = editSnap, after = snapshot();
  editSnap = null;
  if (JSON.stringify(before) === JSON.stringify(after)) { pending = null; return; }
  timeline.length = cursor + 1;
  timeline.push({ snap: after, label: pending?.label || describe(before, after), who: pending?.who || 'you', at: Date.now() });
  pending = null;
  if (timeline.length > 200) timeline.shift();
  cursor = timeline.length - 1;
  emit('history'); saveHistory();
};
const restore = (snap) => {
  emit('restore');
  state.locks = { ...snap.locks }; emit('locks');
  for (const k in snap.v) setValue(k, snap.v[k], true);
  if (snap.scale !== state.scale) { state.scale = snap.scale; emit('scale'); }
  if (snap.parting !== JSON.stringify(state.parting)) { state.parting = JSON.parse(snap.parting); emit('parting'); }
  if (snap.at) { state.at = { ...AT, ...snap.at }; emit('at'); }
  save();
};
const jump = (i) => {
  if (i < 0 || i >= timeline.length || i === cursor) return;
  editSnap = null; pending = null;
  cursor = i;
  restore(timeline[i].snap);
  emit('history'); saveHistory();
};
const restoreStep = (snap, label) => { beginEdit(); restore(snap); note(label); endEdit(); };
const undo = () => { if (cursor > 0) { jump(cursor - 1); emit('toast', 'Undo'); } };
const redo = () => { if (cursor < timeline.length - 1) { jump(cursor + 1); emit('toast', 'Redo'); } };
const steps = () => ({ undo: cursor, redo: timeline.length - 1 - cursor });
const historyView = () => ({ timeline, cursor });

const envelope = (e, a) => (a <= 0 ? 1 : clamp(Math.min(e, 1 - e) / (a / 2)));
function frameAt(t, nParts, v = state.v, at = state.at) {
  const ease = EASES[v.easing].f;
  const g = frac(t / v.duration);
  const e = (id, peak, lag = 0) => ease(frac(g - lag - (at && Number.isFinite(at[id]) ? at[id] : peak * 360) / 360 + peak));
  const hop = (id, lag) => Math.sin(Math.PI * e(id, 0.5, lag)), wav = (id, lag) => Math.sin(2 * Math.PI * e(id, 0.25, lag));
  const turn = (id) => ease(Math.min(1, Math.max(0, (frac(g - (at && Number.isFinite(at[id]) ? at[id] : 180) / 360 + 0.5) - 0.25) / 0.5)));
  const whole = { g, spin: v.spin * 360 * turn('spin'), flip: v.flip * 360 * turn('flip'), hue: v.hue * hop('hue'), glow: v.glow * (0.6 + 0.4 * wav('glow')), blur: v.blur * hop('blur') };
  const parts = [];
  for (let i = 0; i < nParts; i++) {
    const lag = (v.stagger / 100) * (i / nParts);
    parts.push({ tx: v.drift * wav('drift', lag), ty: -v.bounce * hop('bounce', lag), rot: v.wobble * wav('wobble', lag), sc: 1 + (v.pulse / 100) * hop('pulse', lag), op: envelope(e('fade', 0.5, lag), v.fade / 100), p: envelope(e('draw', 0.5, lag), v.draw / 100) });
  }
  return { whole, parts };
}
function pulseOf(id, g, v = state.v, at = state.at) {
  const kind = KIND[id], ease = EASES[v.easing].f, x = frac(g - at[id] / 360 + PEAK[id]);
  if (kind === 'hop') return Math.sin(Math.PI * ease(x));
  if (kind === 'wav') return Math.sin(2 * Math.PI * ease(x));
  if (kind === 'env') return envelope(ease(x), v[id] / 100);
  const turnAt = (y) => ease(clamp((frac(y) - 0.25) / 0.5));
  return (turnAt(x + 0.002) - turnAt(x - 0.002)) / 0.004;
}
function arrangeAt(partial) {
  const out = { ...state.at, ...partial };
  [1, 2].forEach((ri) => {
    const ring = RINGS[ri].params.map((p) => p.id), fixed = ring.filter((id) => id in partial), free = ring.filter((id) => !(id in partial));
    if (!fixed.length || !free.length) return;
    const angles = fixed.map((id) => partial[id]).sort((a, b) => a - b);
    let start = 0, size = -1;
    angles.forEach((a, k) => { const next = k + 1 < angles.length ? angles[k + 1] : angles[0] + 360; if (next - a > size) { size = next - a; start = a; } });
    const margin = Math.min(24, size / (free.length + 1)), span = size - 2 * margin;
    free.sort((a, b) => ((state.at[a] - start + 360) % 360) - ((state.at[b] - start + 360) % 360))
      .forEach((id, k) => { out[id] = (start + margin + (free.length === 1 ? span / 2 : (span * k) / (free.length - 1))) % 360; });
  });
  return out;
}
const f2 = (n) => Math.round(n * 100) / 100;
const filterCss = (wh) => {
  const out = [];
  if (wh.hue) out.push(`hue-rotate(${f2(wh.hue)}deg)`);
  if (wh.glow > 0.05) out.push(`drop-shadow(0 0 ${f2(wh.glow)}px ${state.color}cc)`);
  if (wh.blur > 0.02) out.push(`blur(${f2(wh.blur)}px)`);
  return out.join(' ') || 'none';
};

const polar = (cx, cy, r, deg) => [cx + r * Math.sin(rad(deg)), cy - r * Math.cos(rad(deg))];
function arcPath(cx, cy, r, a0, a1) {
  if (a1 < a0) [a0, a1] = [a1, a0];
  if (a1 - a0 >= 359.99) a1 = a0 + 359.99;
  const [x0, y0] = polar(cx, cy, r, a0), [x1, y1] = polar(cx, cy, r, a1);
  return `M${f2(x0)} ${f2(y0)}A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${f2(x1)} ${f2(y1)}`;
}
const wrap180 = (d) => ((((d + 180) % 360) + 360) % 360) - 180;

const quant = (p, v) => {
  const q = Math.round((v - p.min) / p.step) * p.step + p.min;
  return clamp(Math.round(q * 1000) / 1000, p.min, p.max);
};
function setValue(id, v, force = false) {
  const p = P[id];
  const nv = quant(p, v);
  if (nv === state.v[id] || (state.locks[id] && !force)) return;
  const g = frac(state.t / state.v.duration);
  state.v[id] = nv;
  if (id === 'duration') state.t = g * nv; 
  emit('value', id);
  save();
}

function setAt(id, deg, force = false) {
  if (!P[id] || (state.locks[id] && !force)) return;
  const next = Math.round((((deg % 360) + 360) % 360) * 100) / 100;
  if (next === state.at[id]) return;
  state.at[id] = next;
  emit('at', id);
  save();
}

function setLocks(ids, on) {
  beginEdit();
  ids.forEach((id) => { if (on) state.locks[id] = true; else delete state.locks[id]; });
  emit('locks');
  endEdit(); save();
}
function setScale(s) {
  const next = clamp(Math.round(s * 100) / 100, 0.4, 1.5);
  if (next === state.scale) return;
  state.scale = next;
  emit('scale'); save();
}
function setParting(key, spec) {
  beginEdit();
  if (spec) state.parting[key] = spec; else delete state.parting[key];
  emit('parting');
  endEdit(); save();
}

function select(id, { spin = false } = {}) {
  if (!P[id]) return;
  state.sel = id;
  emit('select', { id, spin });
  save();
}

function setPlaying(playing) {
  state.playing = playing;
  emit('playing', playing);
}

const live = () => (state.preview ? { ...state.v, ...state.preview } : state.v);
function setPreview(values) {
  state.preview = values;
  emit('preview');
}

function setColor(hex) {
  state.color = hex.toUpperCase();
  emit('color', hex);
  save();
}

export {
  on, emit, clamp, frac, rad, smooth, f2, reduceMotion, EASES, RINGS, PARAMS, P, PRESETS, LOGOS, AT, PEAK, KIND, timed, setAt, pulseOf, arrangeAt,
  state, save, beginEdit, endEdit, note, undo, redo, jump, restoreStep, steps, historyView, snapshot, frameAt, envelope, filterCss, polar, arcPath, wrap180,
  quant, setValue, setLocks, setScale, setParting, select, setPlaying, setColor, live, setPreview,
};
