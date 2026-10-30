import { $, mk, toast } from './dom.js';
import {
  on, emit, live, clamp, smooth, f2, reduceMotion, EASES, RINGS, PARAMS, P, state, beginEdit, endEdit, frameAt, filterCss,
  polar, arcPath, wrap180, timed, setAt, pulseOf, KIND, setValue, setLocks, setScale, select, setPlaying, note,
} from './engine.js';
import { logo, logoName, loadFile } from './logo.js';
import { PAD, attach } from './material.js';

const logoBox = $('#logo'), logoInner = $('#logoInner');
const glass = $('#glass'), material = attach(glass), frameEl = $('#logoFrame');

const readout = $('#timeReadout');
readout.textContent = '';
const readNow = readout.appendChild(document.createElement('b')).appendChild(document.createTextNode('0.00'));
const readAll = readout.appendChild(document.createTextNode(' / 2.40s'));

function applyFrame() {
  const v = live();
  const { whole, parts } = frameAt(state.t, logo.parts.length, v);
  const shaded = !!material && material.ready && v.depth > 0;
  glass.hidden = !shaded;
  logoInner.style.visibility = shaded ? 'hidden' : '';
  if (shaded) { material.render({ whole, parts }, v); if (logoInner.style.filter) logoInner.style.filter = ''; }
  else drawSvg(whole, parts);
  drawPlayhead(whole.g, whole);
  readNow.data = (whole.g * v.duration).toFixed(2);
  readAll.data = ` / ${v.duration.toFixed(2)}s`;
}

function drawSvg(whole, parts) {
  logoInner.style.transform = `rotate(${f2(whole.spin)}deg) rotateY(${f2(whole.flip)}deg)`;
  logoInner.style.filter = filterCss(whole);
  const k = logo.raster ? logoSize / 200 : logo.k;
  logo.parts.forEach((part, i) => {
    const f = parts[i];
    part.el.style.transform = `translate(${f2(f.tx * k)}px, ${f2(f.ty * k)}px) rotate(${f2(f.rot)}deg) scale(${f2(f.sc * 1000) / 1000})`;
    part.el.style.opacity = f.op < 1 ? f2(f.op) : '';
    if (logo.raster) { part.el.style.clipPath = f.p < 1 ? `inset(0 ${f2((1 - f.p) * 100)}% 0 0)` : ''; return; }
    for (const s of part.shapes) {
      const st = s.el.style;
      if (f.p >= 0.999) {
        if (!s.drawn) { st.strokeDasharray = st.strokeDashoffset = st.fillOpacity = st.stroke = st.strokeWidth = ''; s.drawn = true; }
      } else {
        if (s.drawn && !s.hasStroke) { st.stroke = s.color; st.strokeWidth = `${f2(logo.k * 2)}px`; }
        s.drawn = false;
        st.strokeDasharray = '1 1';
        st.strokeDashoffset = String(f2((1 - f.p) * 1000) / 1000);
        st.fillOpacity = String(f2(s.fo * smooth(0.55, 1, f.p)));
      }
    }
  });
}

const angleAt = (ev) => {
  const b = svgEl.getBoundingClientRect();
  const x = ev.clientX - b.left - geo.cx, y = ev.clientY - b.top - geo.cy;
  return (Math.atan2(x, -y) * 180) / Math.PI; 
};

const stage = $('#stage'), svgEl = $('#rings');
let geo = { cx: 0, cy: 0, R: 100, d: 20, limb: 110 };
let logoSize = 200;
let clock = null, marker = null, curveG = null, stagG = null, echoBlur = null;
const dialEls = {};
const ringEls = RINGS.map((r, i) => ({ i }));
const sky = document.createElement('canvas');
sky.className = 'sky';
sky.setAttribute('aria-hidden', 'true');
stage.prepend(sky);
const SEC = (deg) => (deg / 360) * state.v.duration;
const deg = (rad2) => (rad2 * 180) / Math.PI;
const minSep = (i) => deg((geo.d * 2 + 6) / ringEls[i].rr);
const active = (id) => timed(id) && state.v[id] !== (P[id].bipolar ? 0 : P[id].min);

function layout() {
  const W = stage.clientWidth, H = stage.clientHeight;
  const narrow = W < 520;
  const bar = $('#composer'), barH = bar && bar.offsetParent ? bar.offsetHeight + 24 : 0;
  const usableH = H - Math.max(narrow ? 60 : 72, barH) - 32;
  const avail = Math.max(240, Math.min(W - 32, usableH));
  const R = avail / 2 / 1.17;
  geo = { cx: W / 2, cy: 32 + usableH / 2, R, d: clamp(R * 0.07, 13, 23), limb: R * 1.075 };
  placeLogo();
  svgEl.classList.toggle('compact', R < 210);
  svgEl.setAttribute('viewBox', `0 0 ${W} ${H}`);
  clearTimeout(skyTimer); skyTimer = setTimeout(paintSky, sky.width ? 120 : 0);
  buildRings();
}
function placeLogo() {
  logoSize = geo.R * 0.5 * state.scale;
  const side = logoSize * PAD, box = { width: logoSize + 'px', height: logoSize + 'px', left: geo.cx - logoSize / 2 + 'px', top: geo.cy - logoSize / 2 + 'px' };
  Object.assign(glass.style, { width: side + 'px', height: side + 'px', left: geo.cx - side / 2 + 'px', top: geo.cy - side / 2 + 'px' });
  glass.width = glass.height = Math.min(1024, Math.round(side * Math.min(2, devicePixelRatio || 1) * q));
  Object.assign(logoBox.style, box);
  Object.assign(frameEl.style, box);
  frameEl.setAttribute('aria-valuenow', Math.round(state.scale * 100));
  frameEl.setAttribute('aria-valuetext', `${Math.round(state.scale * 100)}%`);
  frameEl.querySelector('.size-chip').textContent = `${Math.round(state.scale * 100)}%`;
}

let skyTimer = 0;
function paintSky() {
  const W = stage.clientWidth, H = stage.clientHeight, k = Math.min(2, devicePixelRatio || 1);
  if (!W || !H) return;
  sky.width = Math.round(W * k); sky.height = Math.round(H * k);
  const g = sky.getContext('2d'), css = getComputedStyle(stage);
  g.setTransform(k, 0, 0, k, 0, 0);
  const dark = css.getPropertyValue('--sky-mode').trim() === 'dark', star = css.getPropertyValue('--star').trim() || '120,126,138';
  const { cx, cy, R } = geo;
  let seed = 7;
  const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  if (!dark) {
    g.strokeStyle = css.getPropertyValue('--chart').trim(); g.lineWidth = 1;
    for (let r = R * 0.2, n = 1; r < Math.hypot(W, H); r += R * 0.2, n++) { g.setLineDash(n % 2 ? [2, 4] : []); g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.stroke(); }
    g.setLineDash([]);
    for (let a = 0; a < 360; a += 15) { const [x0, y0] = polar(cx, cy, R * 0.34, a), [x1, y1] = polar(cx, cy, Math.hypot(W, H), a); g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); }
  }
  const n = Math.round((W * H) / (dark ? 1800 : 3600)), bright = [];
  for (let i = 0; i < n; i++) {
    const x = rand() * W, y = rand() * H, m = Math.pow(rand(), 3);
    const r = 0.35 + m * 1.1, a = (dark ? 0.12 : 0.18) + m * 0.6;
    g.fillStyle = `rgba(${star},${a})`; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
    if (m > 0.55) bright.push([x, y]);
    if (dark && m > 0.7) { g.strokeStyle = `rgba(${star},${a * 0.35})`; g.lineWidth = 0.6; g.beginPath(); g.moveTo(x - 4, y); g.lineTo(x + 4, y); g.moveTo(x, y - 4); g.lineTo(x, y + 4); g.stroke(); }
  }
  if (!dark) {
    g.strokeStyle = `rgba(${star},.22)`; g.lineWidth = 0.6;
    const far = bright.filter(([x, y]) => Math.hypot(x - cx, y - cy) > geo.limb + 20);
    for (let i = 0; i < far.length; i++) for (let j = i + 1; j < far.length; j++) {
      if (Math.hypot(far[i][0] - far[j][0], far[i][1] - far[j][1]) > R * 0.22) continue;
      g.beginPath(); g.moveTo(far[i][0], far[i][1]); g.lineTo(far[j][0], far[j][1]); g.stroke();
    }
  }
}
new ResizeObserver(() => { if (stage.clientWidth) layout(); }).observe($('#composer'));
const schemes = matchMedia('(prefers-color-scheme: dark)');
schemes.addEventListener?.('change', () => paintSky());
new MutationObserver(() => paintSky()).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

function arcSweep(cx, cy, r, from, to, clockwise) {
  const [x0, y0] = polar(cx, cy, r, from), [x1, y1] = polar(cx, cy, r, to);
  return `M${f2(x0)} ${f2(y0)}A${f2(r)} ${f2(r)} 0 0 ${clockwise ? 1 : 0} ${f2(x1)} ${f2(y1)}`;
}

function buildRings() {
  svgEl.textContent = '';
  const { cx, cy, R, d, limb } = geo;
  const defs = mk('defs', {}, svgEl);
  marker = null;

  const ph = mk('g', { class: 'playhead' }, svgEl);
  mk('circle', { class: 'playhead-line', cx, cy, r: limb }, ph);
  for (let k = 0; k < 4; k++) { const [x0, y0] = polar(cx, cy, limb - 4, k * 90), [x1, y1] = polar(cx, cy, limb + 4, k * 90); mk('line', { class: 'playhead-tick', x1: f2(x0), y1: f2(y0), x2: f2(x1), y2: f2(y1) }, ph); }
  const labels = Array.from({ length: 8 }, (_, k) => { const [x, y] = polar(cx, cy, limb + 14, k * 45); return mk('text', { class: 'limb-label', x: f2(x), y: f2(y) }, ph); });
  const arc = mk('path', { class: 'playhead-arc' }, ph);
  const hit = mk('circle', { class: 'playhead-hit', cx, cy, r: limb, 'stroke-width': 22, role: 'slider', tabindex: '-1', 'aria-label': 'Scrub time' }, ph);
  const dot = mk('circle', { class: 'playhead-dot', r: 5 }, ph);
  clock = { labels, arc, dot, hit };
  bindScrub(hit);
  renderClock();
  const echoGlow = mk('radialGradient', { id: 'echo-glow' }, defs);
  mk('stop', { offset: 0.45, class: 'echo-0' }, echoGlow);
  mk('stop', { offset: 1, class: 'echo-1' }, echoGlow);
  const blurF = mk('filter', { id: 'echo-blur', x: '-50%', y: '-50%', width: '200%', height: '200%' }, defs);
  echoBlur = mk('feGaussianBlur', { stdDeviation: 0 }, blurF);
  curveG = mk('g', { class: 'curve' }, svgEl);
  stagG = mk('g', { class: 'stag' }, svgEl);

  RINGS.forEach((ring, i) => {
    const rr = R * ring.rf, re = ringEls[i];
    const timeline = ring.params.some((p) => timed(p.id));
    const g = mk('g', { class: `ring ${timeline ? 'timeline' : 'spec'}`, 'data-ring': i }, svgEl);
    const hitEl = mk('circle', { class: 'ring-hit', cx, cy, r: rr, 'stroke-width': Math.min(d * 2 + 10, R * 0.16) }, g);
    const line = mk('path', { class: 'ring-line' }, g);
    const line2 = mk('path', { class: 'ring-line2' }, g);
    const held = mk('g', { class: 'held-rails' }, g);
    const namePath = mk('path', { id: `ring-name-${i}`, fill: 'none' }, defs);
    const name = mk('text', { class: 'ring-name', 'dominant-baseline': 'central' }, g);
    const tp = mk('textPath', { href: `#ring-name-${i}`, startOffset: '50%', 'text-anchor': 'middle' }, name);
    tp.textContent = ring.name.toUpperCase();
    const nameW = ring.name.length * 7.4 + 4;
    const lock = padlock(g, () => ring.params.map((p) => p.id), `the ${ring.name} ring`);
    Object.assign(re, { g, line, line2, held, namePath, name, nameW, lock, rr, hitEl });
    bindRing(hitEl, re);

    ring.params.forEach((p) => {
      const lit = mk('radialGradient', { id: `face-${p.id}`, cx: 0.5, cy: 0.5, r: 0.62, fx: 0.5, fy: 0.16 }, defs);
      mk('stop', { offset: 0, class: 'face-0' }, lit);
      mk('stop', { offset: 0.35, class: 'face-0' }, lit);
      mk('stop', { offset: 1, class: 'face-1' }, lit);
      const label = mk('text', { class: 'dial-label movable', 'text-anchor': 'middle', 'dominant-baseline': 'central' }, g);
      label.textContent = p.label;
      mk('title', {}, label).textContent = timed(p.id) ? `Drag to move the ${p.label} keyframe` : `Drag to arrange ${p.label}`;
      const dg = mk('g', { class: `dial${timed(p.id) ? ' timed' : ''}`, tabindex: '0', role: 'slider', 'aria-label': `${p.label} (${ring.name})`, 'aria-valuemin': p.min, 'aria-valuemax': p.max, 'data-id': p.id }, g);
      const halo = timed(p.id) ? { fill: mk('circle', { class: 'halo', r: d + 12, opacity: 0 }, dg), ring: mk('circle', { class: 'halo-ring', r: d + 4, opacity: 0 }, dg) } : null;
      const s = d + 5;
      mk('rect', { class: 'sel', x: -s, y: -s, width: s * 2, height: s * 2 }, dg);
      [[-s, -s], [s, -s], [-s, s], [s, s]].forEach(([x, y]) => mk('rect', { class: 'hdl', x: x - 3, y: y - 3, width: 6, height: 6 }, dg));
      const body = mk('g', { class: 'body' }, dg);
      const glow = p.id === 'glow' ? mk('circle', { class: 'echo-glow', r: d + 10, opacity: 0, fill: 'url(#echo-glow)' }, body) : null;
      mk('circle', { class: 'face-shadow', r: d, cy: 1 }, body);
      const face = mk('circle', { class: 'face', r: d, fill: `url(#face-${p.id})` }, body);
      const ar = d - 4, sw = Math.max(2, d * 0.13);
      const track = mk('path', { class: 'arc-track', d: arcPath(0, 0, ar, -135, 135), 'stroke-width': sw, pathLength: 1 }, body);
      if (p.options) for (let k = 0; k <= p.max; k++) { const [x, y] = polar(0, 0, ar + sw + 1.5, -135 + (270 * k) / p.max); mk('circle', { class: 'stop', cx: x, cy: y, r: 1 }, body); }
      const arcVal = mk('path', { class: 'arc-val', 'stroke-width': sw, pathLength: 1 }, body);
      const knob = mk('circle', { class: 'knob', r: sw * 0.9 + 0.6 }, body);
      const val = mk('text', { class: 'val', 'font-size': clamp(d * 0.44, 8, 11) }, body);
      const lock = padlock(dg, () => [p.id], p.label);
      lock.setAttribute('transform', `translate(${f2(d * 0.74)} ${f2(-d * 0.74)})`);
      dialEls[p.id] = { g: dg, arcVal, knob, val, label, ring: i, ar, labelW: 0, grad: lit, halo, body, face, track, glow, hl: -1, echo: false };
      bindDial(dg, p);
      bindMove(label, p);
    });
  });
  PARAMS.forEach((p) => { try { dialEls[p.id].labelW = dialEls[p.id].label.getComputedTextLength(); } catch (e) { dialEls[p.id].labelW = p.label.length * 5.6; } });
  RINGS.forEach((_, i) => positionRing(i));
  PARAMS.forEach((p) => renderDial(p.id));
  const [m0x, m0y] = polar(cx, cy, R * RINGS[1].rf - d - 8, 0);
  marker = mk('line', { class: 'marker', x1: f2(m0x), y1: f2(m0y), x2: cx, y2: cy - limb }, svgEl);
  markLocked();
  markSelected();
  renderCurve();
  applyFrame();
  emit('rings');
}

function renderClock() {
  if (!clock) return;
  clock.labels.forEach((t, i) => { t.textContent = `${((i / 8) * state.v.duration).toFixed(1)}s`; });
}

function positionRing(i) {
  const ring = RINGS[i], re = ringEls[i];
  if (!re.g) return;
  const { cx, cy, d } = geo, rr = re.rr;
  const angles = ring.params.map((p) => state.at[p.id]).sort((a, b) => a - b);
  let gapMid = 180, gapSize = 360;
  if (angles.length) {
    gapSize = -1;
    angles.forEach((a, k) => { const next = k + 1 < angles.length ? angles[k + 1] : angles[0] + 360, size = next - a; if (size > gapSize) { gapSize = size; gapMid = (a + size / 2) % 360; } });
  }
  const nameDeg = deg(re.nameW / rr), room = gapSize - deg((d * 2 + 8) / rr);
  const showName = room > nameDeg + 4;
  re.name.style.display = showName ? '' : 'none';
  const bottom = gapMid > 90 && gapMid < 270;
  re.namePath.setAttribute('d', bottom ? arcSweep(cx, cy, rr, gapMid + 80, gapMid - 80, false) : arcSweep(cx, cy, rr, gapMid - 80, gapMid + 80, true));
  const cut = showName ? nameDeg / 2 + 3 : 0;
  re.line.setAttribute('d', cut ? arcPath(cx, cy, rr, gapMid + cut, gapMid + 360 - cut) : arcPath(cx, cy, rr, 0, 359.99));
  re.line2.setAttribute('d', re.line.getAttribute('d'));
  const lockDeg = showName ? gapMid + (bottom ? -1 : 1) * (nameDeg / 2 + deg(12 / rr)) : gapMid;
  const [lx0, ly0] = polar(cx, cy, rr, lockDeg);
  re.lock.setAttribute('transform', `translate(${f2(lx0)} ${f2(ly0)})`);

  const sep = minSep(i);
  ring.params.forEach((p) => {
    const a = state.at[p.id], de = dialEls[p.id];
    const [x, y] = polar(cx, cy, rr, a);
    de.g.setAttribute('transform', `translate(${f2(x)} ${f2(y)})`);
    de.grad.setAttribute('gradientTransform', `rotate(${f2(a + 180)} 0.5 0.5)`);
    const off = deg((d + 10 + de.labelW / 2) / rr), need = off + deg((de.labelW / 2 + 4) / rr);
    const near = (dir) => ring.params.some((o) => o !== p && ((wrap180(state.at[o.id] - a) * dir) > 0) && Math.abs(wrap180(state.at[o.id] - a)) < need + sep / 2);
    const side = !near(1) ? 1 : !near(-1) ? -1 : 0;
    de.label.classList.toggle('crowded', side === 0);
    const [lx, ly] = polar(cx, cy, rr, a + off * (side || 1));
    de.label.setAttribute('x', f2(lx)); de.label.setAttribute('y', f2(ly));
  });
  renderHeld(i);
}

const peaks = {};
const peakOf = (id) => {
  if (peaks[id] === undefined) { let m = 1e-6; for (let k = 0; k < 240; k++) m = Math.max(m, Math.abs(pulseOf(id, k / 240))); peaks[id] = m; }
  return peaks[id];
};
function renderCurve() {
  if (!curveG) return;
  curveG.textContent = ''; stagG.textContent = '';
  const p = P[state.sel];
  if (!p || !timed(p.id) || !active(p.id) || !dialEls[p.id]) return;
  const { cx, cy, d } = geo, rr = ringEls[p.ring].rr, n = 180, peak = peakOf(p.id);
  for (let k = 0; k < n; k++) {
    const m = pulseOf(p.id, (k + 0.5) / n) / peak;
    if (Math.abs(m) < 0.02) continue;
    mk('path', { class: m > 0 ? 'pos' : 'neg', d: arcPath(cx, cy, rr, (k / n) * 360, ((k + 1) / n) * 360 + 0.3), 'stroke-width': f2(1 + 6 * Math.abs(m)), opacity: f2(0.08 + 0.26 * Math.abs(m)) }, curveG);
  }
  const parts = logo.parts.length;
  if (KIND[p.id] === 'turn' || !state.v.stagger || parts < 2) return;
  for (let i = 1; i < parts; i++) {
    const a = state.at[p.id] + (state.v.stagger / 100) * (i / parts) * 360;
    const [x0, y0] = polar(cx, cy, rr + d + 5, a), [x1, y1] = polar(cx, cy, rr + d + 12, a);
    mk('line', { x1: f2(x0), y1: f2(y0), x2: f2(x1), y2: f2(y1), opacity: f2(1 - (i / parts) * 0.6) }, stagG);
  }
}

function renderHeld(i) {
  const re = ringEls[i];
  if (!re.held) return;
  re.held.textContent = '';
  const { cx, cy } = geo, rr = re.rr, w = deg((geo.d + 8) / rr);
  RINGS[i].params.forEach((p) => {
    if (!state.locks[p.id]) return;
    const a = state.at[p.id];
    mk('path', { d: arcPath(cx, cy, rr - 4, a - w, a + w) }, re.held);
    mk('path', { d: arcPath(cx, cy, rr + 4, a - w, a + w) }, re.held);
    [a - w, a + w].forEach((b) => { const [x0, y0] = polar(cx, cy, rr - 7, b), [x1, y1] = polar(cx, cy, rr + 7, b); mk('line', { x1: f2(x0), y1: f2(y0), x2: f2(x1), y2: f2(y1) }, re.held); });
  });
}

function drawPlayhead(turn, whole) {
  if (!clock) return;
  const { cx, cy, limb, d } = geo, a = turn * 360;
  clock.arc.setAttribute('d', a < 0.5 ? '' : arcPath(cx, cy, limb, 0, a));
  const [x, y] = polar(cx, cy, limb, a);
  clock.dot.setAttribute('cx', f2(x)); clock.dot.setAttribute('cy', f2(y));
  if (marker) marker.setAttribute('transform', `rotate(${f2(a)} ${f2(cx)} ${f2(cy)})`);
  const v = live();
  PARAMS.forEach((p) => {
    const de = dialEls[p.id];
    if (!de || !de.halo) return;
    const on = active(p.id), m = on ? pulseOf(p.id, turn, v) / peakOf(p.id) : 0, k = Math.min(1, Math.abs(m));
    const hl = Math.round(k * 50) * (m < 0 ? -1 : 1);
    if (hl !== de.hl) {
      de.hl = hl;
      de.halo.ring.setAttribute('opacity', f2(k));
      de.halo.fill.setAttribute('opacity', f2(Math.max(0, (k - 0.8) / 0.2) * 0.3));
      de.halo.ring.classList.toggle('neg', m < 0);
      de.halo.fill.classList.toggle('neg', m < 0);
    }
    const echo = liveDials && on && !reduceMotion;
    if (!echo) { if (de.echo) resetEcho(de); return; }
    de.echo = true;
    let tf = '';
    if (p.id === 'bounce') tf = `translate(0 ${f2(-d * 0.3 * k)})`;
    else if (p.id === 'pulse') tf = `scale(${f2(1 + 0.16 * k)})`;
    else if (p.id === 'wobble') tf = `rotate(${f2(22 * m)})`;
    else if (p.id === 'drift') tf = `translate(${f2(d * 0.28 * m)} 0)`;
    else if (p.id === 'spin') tf = `rotate(${f2(whole.spin)})`;
    else if (p.id === 'flip') tf = `scale(${f2(Math.cos((whole.flip * Math.PI) / 180))} 1)`;
    else if (p.id === 'fade') de.body.style.opacity = f2(0.2 + 0.8 * k);
    else if (p.id === 'draw') de.arcVal.style.strokeDasharray = `${f2(k)} 1`;
    else if (p.id === 'hue') { const c = shiftHue(state.color, whole.hue); de.arcVal.style.stroke = c; de.knob.style.fill = c; }
    else if (p.id === 'glow') de.glow.setAttribute('opacity', f2(0.25 + 0.75 * k));
    else if (p.id === 'blur') { echoBlur.setAttribute('stdDeviation', f2(1.8 * k)); de.body.setAttribute('filter', 'url(#echo-blur)'); }
    if (tf) de.body.setAttribute('transform', tf);
  });
}
function resetEcho(de) {
  de.echo = false;
  de.body.removeAttribute('transform'); de.body.removeAttribute('filter');
  de.body.style.opacity = ''; de.arcVal.style.cssText = ''; de.knob.style.fill = '';
  if (de.glow) de.glow.setAttribute('opacity', 0);
}
function shiftHue(hex, by) {
  const n = parseInt(hex.slice(1), 16), r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, dd = max - min;
  const s = dd ? dd / (1 - Math.abs(2 * l - 1)) : 0;
  let h = !dd ? 0 : max === r ? ((g - b) / dd) % 6 : max === g ? (b - r) / dd + 2 : (r - g) / dd + 4;
  h = (h * 60 + by + 720) % 360;
  return `hsl(${f2(h)} ${f2(s * 100)}% ${f2(Math.max(45, l * 100))}%)`;
}
let liveDials = true;
try { liveDials = localStorage.getItem('logo-live-dials-v1') !== 'off'; } catch (e) { /* storage unavailable */ }
const liveBtn = $('#liveBtn');
const markLive = () => { liveBtn.setAttribute('aria-pressed', liveDials); liveBtn.title = liveDials ? 'Dials act out their effect. Click to keep them still.' : 'Dials are still. Click to have them act out their effect.'; };
liveBtn.addEventListener('click', () => {
  liveDials = !liveDials;
  try { localStorage.setItem('logo-live-dials-v1', liveDials ? 'on' : 'off'); } catch (e) { /* storage unavailable */ }
  if (!liveDials) PARAMS.forEach((p) => dialEls[p.id] && resetEcho(dialEls[p.id]));
  markLive(); applyFrame();
  toast(liveDials ? 'Live dials on' : 'Live dials off');
});
markLive();

function renderDial(id) {
  const p = P[id], de = dialEls[id];
  if (!de) return;
  const v = state.v[id], f = (v - p.min) / (p.max - p.min);
  let a0 = -135, a1 = -135 + 270 * f;
  if (p.bipolar) { a0 = 0; a1 = (f - 0.5) * 270; }
  de.arcVal.setAttribute('d', Math.abs(a1 - a0) < 0.5 ? '' : arcPath(0, 0, de.ar, a0, a1));
  const [kx, ky] = polar(0, 0, de.ar, a1);
  de.knob.setAttribute('cx', f2(kx)); de.knob.setAttribute('cy', f2(ky));
  de.val.textContent = p.fmt(v);
  de.val.classList.toggle('zero', !p.options && v === (p.bipolar ? 0 : p.min) && id !== 'duration');
  de.g.classList.toggle('dormant', timed(id) && !active(id));
  de.g.setAttribute('aria-valuenow', v);
  de.g.setAttribute('aria-valuetext', `${p.options ? EASES[v].name : `${v}${p.unit === 'turns' ? ' turns' : p.unit}`}${timed(id) ? `, keyframe at ${SEC(state.at[id]).toFixed(2)} seconds` : ''}`);
}

function padlock(parent, ids, label) {
  const g = mk('g', { class: 'lock', role: 'button', 'aria-label': `Lock ${label}` }, parent);
  mk('circle', { class: 'hit', r: 10 }, g);
  mk('circle', { class: 'bg', r: 6.5 }, g);
  mk('path', { class: 'body', d: 'M-2.4 -0.4h4.8v3.3h-4.8z' }, g);
  mk('path', { class: 'shackle shut', d: 'M-1.4 -0.4v-1.3a1.4 1.4 0 0 1 2.8 0v1.3' }, g);
  mk('path', { class: 'shackle open', d: 'M-1.4 -0.4v-1.3a1.4 1.4 0 0 1 2.6 -0.7' }, g);
  mk('title', {}, g).textContent = `Lock or unlock ${label}`;
  g.addEventListener('pointerdown', (ev) => {
    if (ev.button !== 0) return;
    ev.preventDefault(); ev.stopPropagation();
    const list = ids();
    setLocks(list, !list.every((id) => state.locks[id]));
  });
  return g;
}
const lockAll = $('#lockAllBtn');
lockAll.addEventListener('click', () => { const all = PARAMS.map((p) => p.id); setLocks(all, !all.every((id) => state.locks[id])); });
function markLocked() {
  PARAMS.forEach((p) => dialEls[p.id]?.g.classList.toggle('locked', !!state.locks[p.id]));
  RINGS.forEach((ring, i) => {
    const n = ring.params.filter((p) => state.locks[p.id]).length, g = ringEls[i].g;
    if (!g) return;
    g.classList.toggle('held', n === ring.params.length);
    g.classList.toggle('part-held', n > 0 && n < ring.params.length);
    renderHeld(i);
  });
  const every = PARAMS.every((p) => state.locks[p.id]);
  lockAll.setAttribute('aria-pressed', every);
  lockAll.title = every ? 'Unlock every dial' : 'Lock every dial';
  lockAll.setAttribute('aria-label', lockAll.title);
}

function markSelected() {
  PARAMS.forEach((p) => {
    const de = dialEls[p.id];
    if (!de) return;
    const on = p.id === state.sel;
    de.g.classList.toggle('selected', on);
    de.label.classList.toggle('on', on);
    if (on) { de.g.parentNode.appendChild(de.g); de.g.parentNode.appendChild(de.label); }
  });
}

function settle(i, moved) {
  const ring = RINGS[i], sep = minSep(i) - 0.01;
  for (let round = 0; round < 40; round++) {
    let clash = false;
    for (const id of moved) {
      if (state.locks[id]) continue;
      for (const o of ring.params) {
        if (o.id === id) continue;
        const gap = wrap180(state.at[id] - state.at[o.id]);
        if (Math.abs(gap) >= sep) continue;
        const dir = gap === 0 ? 1 : Math.sign(gap);
        setAt(id, state.at[o.id] + dir * (sep + 0.02));
        clash = true;
      }
    }
    if (!clash) return;
  }
}
const dirty = new Set();
on('at', (id) => {
  if (id && P[id]) dirty.add(P[id].ring); else RINGS.forEach((_, i) => dirty.add(i));
  if (id && P[id]) renderDial(id);
  if (!state.playing) applyFrame();
});
function flushRings() {
  if (!dirty.size) return;
  dirty.forEach((i) => positionRing(i));
  dirty.clear();
  for (const k in peaks) delete peaks[k];
  PARAMS.forEach((p) => { if (dialEls[p.id]) dialEls[p.id].hl = -1; });
  renderCurve();
}

function bindMove(label, p) {
  label.addEventListener('pointerdown', (ev) => {
    if (ev.button !== 0) return;
    ev.preventDefault(); ev.stopPropagation();
    select(p.id);
    if (state.locks[p.id]) { toast(`${p.label} is locked, so it holds its place. Click its padlock to unlock it.`); return; }
    label.setPointerCapture(ev.pointerId);
    const from = state.at[p.id], grab = wrap180(angleAt(ev) - from);
    let moved = false;
    const move = (e) => {
      if (!moved) { moved = true; beginEdit(); document.body.style.cursor = 'grabbing'; dialEls[p.id].g.classList.add('moving'); }
      setAt(p.id, angleAt(e) - grab);
    };
    const up = () => {
      label.removeEventListener('pointermove', move); label.removeEventListener('pointerup', up); label.removeEventListener('pointercancel', up);
      document.body.style.cursor = '';
      dialEls[p.id]?.g.classList.remove('moving');
      if (!moved) return;
      settle(p.ring, [p.id]);
      note(timed(p.id) ? `${p.label} keyframe ${SEC(state.at[p.id]).toFixed(2)}s` : `Moved ${p.label}`);
      endEdit();
    };
    label.addEventListener('pointermove', move); label.addEventListener('pointerup', up); label.addEventListener('pointercancel', up);
  });
}

function nudge(p, by) {
  if (state.locks[p.id]) { toast(`${p.label} is locked, so it holds its place.`); return; }
  beginEdit();
  setAt(p.id, state.at[p.id] + by);
  settle(p.ring, [p.id]);
  note(timed(p.id) ? `${p.label} keyframe ${SEC(state.at[p.id]).toFixed(2)}s` : `Moved ${p.label}`);
  endEdit();
}

let lastTap = { id: null, time: 0 };
function bindDial(dg, p) {
  dg.addEventListener('pointerdown', (ev) => {
    if (ev.button !== 0) return;
    ev.preventDefault(); ev.stopPropagation();
    dg.focus({ preventScroll: true });
    select(p.id);
    if (ev.altKey) { dialEls[p.id].label.dispatchEvent(new PointerEvent('pointerdown', ev)); return; }
    if (state.locks[p.id]) { toast(`${p.label} is locked. Click its padlock to unlock it.`); return; }
    const now = performance.now();
    if (lastTap.id === p.id && now - lastTap.time < 320) { beginEdit(); setValue(p.id, p.def); endEdit(); lastTap = { id: null, time: 0 }; return; }
    lastTap = { id: p.id, time: now };
    dg.setPointerCapture(ev.pointerId);
    const start = { x: ev.clientX, y: ev.clientY, v: state.v[p.id] };
    const box = dg.querySelector('.face').getBoundingClientRect();
    const mid = { x: box.left + box.width / 2, y: box.top + box.height / 2 };
    const around = (e) => (Math.atan2(e.clientX - mid.x, mid.y - e.clientY) * 180) / Math.PI;
    const turning = Math.hypot(start.x - mid.x, start.y - mid.y) > box.width * 0.27;
    const span = p.max - p.min;
    let moved = false, last = around(ev), raw = start.v;
    const move = (e) => {
      const dx = e.clientX - start.x, dy = e.clientY - start.y;
      if (!moved && Math.hypot(dx, dy) < 3) return;
      if (!moved) { moved = true; lastTap = { id: null, time: 0 }; beginEdit(); document.body.style.cursor = turning ? 'grabbing' : 'ns-resize'; }
      if (!turning) { setValue(p.id, start.v + ((dx - dy) / 180) * span * (e.shiftKey ? 0.15 : 1)); return; }
      const a = around(e);
      raw = clamp(raw + (wrap180(a - last) / 270) * span * (e.shiftKey ? 0.15 : 1), p.min, p.max);
      last = a;
      setValue(p.id, raw);
    };
    const up = () => {
      dg.removeEventListener('pointermove', move); dg.removeEventListener('pointerup', up); dg.removeEventListener('pointercancel', up);
      document.body.style.cursor = '';
      endEdit();
    };
    dg.addEventListener('pointermove', move); dg.addEventListener('pointerup', up); dg.addEventListener('pointercancel', up);
  });
  dg.addEventListener('focus', () => { if (state.sel !== p.id) select(p.id); });
  dg.addEventListener('wheel', (ev) => {
    ev.preventDefault();
    select(p.id); beginEdit();
    setValue(p.id, state.v[p.id] + (ev.deltaY < 0 ? 1 : -1) * p.step * (ev.shiftKey || p.options ? 1 : Math.max(1, Math.round((p.max - p.min) / p.step / 60))));
    clearTimeout(dg._wt); dg._wt = setTimeout(endEdit, 400);
  }, { passive: false });
  dg.addEventListener('keydown', (ev) => {
    if (ev.key.toLowerCase() === 'l' && !ev.metaKey && !ev.ctrlKey) { ev.preventDefault(); setLocks([p.id], !state.locks[p.id]); toast(`${p.label} ${state.locks[p.id] ? 'locked' : 'unlocked'}`); return; }
    if (ev.altKey && (ev.key === 'ArrowLeft' || ev.key === 'ArrowRight')) { ev.preventDefault(); nudge(p, (ev.key === 'ArrowRight' ? 1 : -1) * (ev.shiftKey ? 1 : 7.5)); return; }
    const big = ev.shiftKey ? 10 : 1;
    const map = { ArrowUp: p.step * big, ArrowRight: p.step * big, ArrowDown: -p.step * big, ArrowLeft: -p.step * big, PageUp: p.step * 10, PageDown: -p.step * 10 };
    let nv = null;
    if (ev.key in map) nv = state.v[p.id] + map[ev.key];
    else if (ev.key === 'Home') nv = p.min;
    else if (ev.key === 'End') nv = p.max;
    else if (ev.key === 'Backspace' || ev.key === 'Delete') nv = p.def;
    else if (ev.key === 'Enter') { select(p.id); ev.preventDefault(); return; }
    if (nv === null) return;
    ev.preventDefault();
    beginEdit(); setValue(p.id, nv); endEdit();
  });
}

function shiftRing(i, by) {
  RINGS[i].params.forEach((p) => { if (!state.locks[p.id]) setAt(p.id, state.at[p.id] + by); });
}
function ringNote(i, total) {
  const ring = RINGS[i], secs = (Math.abs(total) / 360) * state.v.duration;
  note(ring.params.some((p) => timed(p.id)) ? `Shifted the ${ring.name} ring ${secs.toFixed(2)}s ${total > 0 ? 'later' : 'earlier'}` : `Turned the ${ring.name} ring`);
}
function bindRing(hitEl, re) {
  hitEl.addEventListener('pointerdown', (ev) => {
    if (ev.button !== 0) return;
    ev.preventDefault();
    hitEl.setPointerCapture(ev.pointerId);
    re.g.classList.add('spinning');
    const ring = RINGS[re.i];
    let last = angleAt(ev), total = 0, travel = 0, started = false;
    const move = (e) => {
      const a = angleAt(e), da = wrap180(a - last);
      last = a; total += da; travel += Math.abs(da);
      if (!started && travel < 3) return;
      if (!started) {
        started = true;
        if (ring.params.every((p) => state.locks[p.id])) { toast(`The ${ring.name} ring is locked. Click its padlock to unlock it.`); return; }
        beginEdit();
      }
      shiftRing(re.i, da);
    };
    const up = (e) => {
      hitEl.removeEventListener('pointermove', move); hitEl.removeEventListener('pointerup', up); hitEl.removeEventListener('pointercancel', up);
      re.g.classList.remove('spinning');
      if (!started) {
        const a = angleAt(e);
        let best = ring.params[0], bestD = 999;
        ring.params.forEach((p) => { const dd = Math.abs(wrap180(state.at[p.id] - a)); if (dd < bestD) { bestD = dd; best = p; } });
        select(best.id);
        return;
      }
      settle(re.i, ring.params.map((p) => p.id));
      ringNote(re.i, total);
      endEdit();
    };
    hitEl.addEventListener('pointermove', move); hitEl.addEventListener('pointerup', up); hitEl.addEventListener('pointercancel', up);
  });
  hitEl.addEventListener('wheel', (ev) => {
    ev.preventDefault();
    const ring = RINGS[re.i];
    if (ring.params.every((p) => state.locks[p.id])) return;
    const by = (ev.deltaY + ev.deltaX) * 0.25;
    if (!re.wheel) { re.wheel = 0; beginEdit(); }
    re.wheel += by;
    shiftRing(re.i, by);
    clearTimeout(re._wt);
    re._wt = setTimeout(() => { settle(re.i, ring.params.map((p) => p.id)); ringNote(re.i, re.wheel); re.wheel = 0; endEdit(); }, 400);
  }, { passive: false });
}

function bindScrub(hit) {
  hit.addEventListener('pointerdown', (ev) => {
    if (ev.button !== 0) return;
    ev.preventDefault(); ev.stopPropagation();
    hit.setPointerCapture(ev.pointerId);
    const was = state.playing;
    setPlaying(false);
    const scrubTo = (e) => { const a = (angleAt(e) + 360) % 360; state.t = (a / 360) * state.v.duration; applyFrame(); };
    scrubTo(ev);
    const up = () => { hit.removeEventListener('pointermove', scrubTo); hit.removeEventListener('pointerup', up); hit.removeEventListener('pointercancel', up); if (was) setPlaying(true); };
    hit.addEventListener('pointermove', scrubTo); hit.addEventListener('pointerup', up); hit.addEventListener('pointercancel', up);
  });
}

const playBtn = $('#playBtn');
const ICON_PLAY = '<svg width="16" height="16" viewBox="0 0 16 16"><path d="M5 3.2v9.6L12.6 8z" fill="currentColor"/></svg>';
const ICON_PAUSE = '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><rect x="4" y="3" width="2.6" height="10" rx=".6"/><rect x="9.4" y="3" width="2.6" height="10" rx=".6"/></svg>';
on('playing', (playing) => {
  playBtn.innerHTML = playing ? ICON_PAUSE : ICON_PLAY;
  playBtn.setAttribute('aria-label', playing ? 'Pause' : 'Play');
});
playBtn.addEventListener('click', () => setPlaying(!state.playing));
$('#restartBtn').addEventListener('click', () => { state.t = 0; applyFrame(); });

let q = 1, ema = 16, slow = 0;
const quality = () => q;
const materialOn = () => !!material;
function adapt(dt) {
  if (!state.playing || document.hidden || glass.hidden || q <= 0.5) { slow = 0; return; }
  ema += (dt - ema) * 0.05;
  slow = ema > 24 ? slow + 1 : 0;
  if (slow < 60) return;
  q = Math.max(0.5, q - 0.25); slow = 0; ema = 16;
  placeLogo();
}

let lastFrame = performance.now();
function tick(now) {
  const dt = Math.min(250, now - lastFrame);
  lastFrame = now;
  adapt(dt);
  if (state.playing) { state.t += dt / 1000; applyFrame(); }
  flushRings();
  stepTweens(now);
  requestAnimationFrame(tick);
}

let tweens = null;
function animateTo(values) {
  beginEdit();
  const from = { ...state.v };
  tweens = { start: performance.now(), dur: reduceMotion ? 0 : 520, from, to: { ...from, ...(tweens ? tweens.to : {}), ...values } };
}
function stepTweens(now) {
  if (!tweens) return;
  const k = tweens.dur ? clamp((now - tweens.start) / tweens.dur) : 1;
  const e = EASES[1].f(k);
  for (const id in tweens.to) {
    const p = P[id];
    const target = tweens.to[id], from = tweens.from[id];
    setValue(id, p.options ? (k < 0.5 ? from : target) : from + (target - from) * e);
  }
  if (k >= 1) {
    tweens = null; endEdit();
  }
}
on('restore', () => { if (tweens) { tweens = null; } });
$('#shuffleBtn').addEventListener('click', () => {
  note('Shuffle');
  const r = (a, b, step) => Math.round((a + Math.random() * (b - a)) / step) * step;
  const maybe = (n, v) => (Math.random() < n ? v : 0);
  animateTo({
    duration: r(1.2, 4, 0.1), easing: Math.floor(Math.random() * 5), stagger: r(0, 70, 1),
    spin: maybe(0.25, [-1, 1, 0.5, -0.5][Math.floor(Math.random() * 4)]), flip: maybe(0.15, 1),
    wobble: maybe(0.5, r(4, 20, 1)), bounce: maybe(0.6, r(6, 34, 1)), pulse: maybe(0.5, r(4, 20, 1)), drift: maybe(0.25, r(4, 20, 1)),
    draw: maybe(0.45, r(30, 80, 1)), fade: maybe(0.3, r(20, 70, 1)), hue: maybe(0.25, r(40, 220, 5)), glow: maybe(0.5, r(4, 24, 1)), blur: maybe(0.15, r(0.5, 3, 0.5)),
  });
  toast('Shuffled');
});
$('#resetAllBtn').addEventListener('click', () => { note('Reset all'); animateTo(Object.fromEntries(PARAMS.map((p) => [p.id, p.def]))); toast('Dials reset'); });

let dropHint = null;
stage.addEventListener('dragover', (e) => {
  e.preventDefault();
  if (!dropHint) { dropHint = document.createElement('div'); dropHint.className = 'drop-hint'; dropHint.textContent = 'Drop to animate this logo'; stage.appendChild(dropHint); }
});
stage.addEventListener('dragleave', (e) => { if (!stage.contains(e.relatedTarget) && dropHint) { dropHint.remove(); dropHint = null; } });
stage.addEventListener('drop', (e) => { e.preventDefault(); dropHint?.remove(); dropHint = null; loadFile(e.dataTransfer.files[0]); });

let materialTimer = 0;
function reloadMaterial() {
  if (material) material.load().then((ok) => { if (ok) applyFrame(); }).catch(() => {});
}

function spinRing(i, degrees) {
  beginEdit();
  shiftRing(i, degrees);
  settle(i, RINGS[i].params.map((p) => p.id));
  ringNote(i, degrees);
  endEdit();
}
function moveDial(id, degrees) {
  beginEdit();
  setAt(id, degrees);
  settle(P[id].ring, [id]);
  note(timed(id) ? `${P[id].label} keyframe ${SEC(state.at[id]).toFixed(2)}s` : `Moved ${P[id].label}`);
  endEdit();
}
function dialPoint(id) {
  const [x, y] = polar(geo.cx, geo.cy, ringEls[P[id].ring].rr || 0, state.at[id]);
  return { x, y };
}
const center = () => ({ x: geo.cx, y: geo.cy });
function ringPoint(i, d2) {
  const [x, y] = polar(geo.cx, geo.cy, ringEls[i].rr || 0, d2);
  return { x, y };
}
const start = () => requestAnimationFrame((t) => { lastFrame = t; tick(t); });

on('value', (id) => {
  renderDial(id);
  if (id === 'duration') { renderClock(); PARAMS.forEach((p) => timed(p.id) && renderDial(p.id)); }
  if (timed(id) || id === 'easing' || id === 'stagger') {
    for (const k in peaks) delete peaks[k];
    PARAMS.forEach((p) => { if (dialEls[p.id]) dialEls[p.id].hl = -1; });
    if (id === state.sel || id === 'easing' || id === 'stagger') renderCurve();
  }
  if (!state.playing) applyFrame();
});
on('select', () => { markSelected(); renderCurve(); });
on('logo', () => {
  const n = logo.parts.length;
  $('#frameName').textContent = logoName();
  $('#frameMeta').textContent = `${n} part${n === 1 ? '' : 's'}${logo.raster ? ' · image' : ''}`;
  logoBox.style.color = state.color;
  stage.style.setProperty('--logo', state.color);
  applyFrame();
  reloadMaterial();
});
on('preview', () => { if (!state.playing) applyFrame(); });
on('locks', markLocked);
on('scale', () => { placeLogo(); applyFrame(); });

let wheelTimer = 0;
frameEl.querySelectorAll('.h').forEach((h) => h.addEventListener('pointerdown', (ev) => {
  if (ev.button !== 0) return;
  ev.preventDefault(); ev.stopPropagation();
  h.setPointerCapture(ev.pointerId);
  const box = stage.getBoundingClientRect(), far = (e) => Math.hypot(e.clientX - box.left - geo.cx, e.clientY - box.top - geo.cy);
  const start = far(ev) || 1, from = state.scale;
  beginEdit(); frameEl.classList.add('dragging');
  const move = (e) => setScale((from * far(e)) / start);
  const up = () => { h.removeEventListener('pointermove', move); h.removeEventListener('pointerup', up); h.removeEventListener('pointercancel', up); frameEl.classList.remove('dragging'); endEdit(); };
  h.addEventListener('pointermove', move); h.addEventListener('pointerup', up); h.addEventListener('pointercancel', up);
}));
frameEl.addEventListener('wheel', (ev) => {
  ev.preventDefault();
  beginEdit(); setScale(state.scale * (ev.deltaY < 0 ? 1.04 : 0.96));
  frameEl.classList.add('dragging');
  clearTimeout(wheelTimer); wheelTimer = setTimeout(() => { frameEl.classList.remove('dragging'); endEdit(); }, 400);
}, { passive: false });
frameEl.addEventListener('keydown', (ev) => {
  const step = { ArrowUp: 0.05, ArrowRight: 0.05, ArrowDown: -0.05, ArrowLeft: -0.05 }[ev.key];
  if (!step && ev.key !== 'Home') return;
  ev.preventDefault();
  beginEdit(); setScale(step ? state.scale + step : 1); endEdit();
});
frameEl.addEventListener('dblclick', () => { beginEdit(); setScale(1); endEdit(); });
on('color', () => { logoBox.style.color = state.color; stage.style.setProperty('--logo', state.color); if (!state.playing) applyFrame(); clearTimeout(materialTimer); materialTimer = setTimeout(reloadMaterial, 160); });

export { quality, materialOn, stage, dialEls, applyFrame, layout, animateTo, spinRing, moveDial, dialPoint, ringPoint, center, start };
