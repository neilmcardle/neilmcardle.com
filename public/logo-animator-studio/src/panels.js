import { $, toast } from './dom.js';
import { on, f2, clamp, timed, setAt, arrangeAt, EASES, RINGS, PARAMS, P, PRESETS, LOGOS, state, save, beginEdit, endEdit, note, polar, setValue, setLocks, setScale, select, setPlaying, setColor } from './engine.js';
import { logo, parseSVG, logoName, buildLogo, loadFile, editParts } from './logo.js';
import { partSources } from './material.js';
import { buildExportSVG } from './export.js';
import { dialEls, animateTo } from './stage.js';

const ICONS = {
  frame: '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor"><path d="M3.5 1v10M8.5 1v10M1 3.5h10M1 8.5h10"/></svg>',
  logo: '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor"><path d="M6 1.2 10.8 6 6 10.8 1.2 6Z"/></svg>',
  ring: '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor"><circle cx="6" cy="6" r="4.8"/><circle cx="6" cy="6" r="1.6"/></svg>',
  dial: '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor"><circle cx="6" cy="6" r="4.3"/><path d="M6 6 8.6 3.4"/></svg>',
  part: '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor"><rect x="2" y="2" width="8" height="8" rx="1"/></svg>',
};
const LOCKED = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor"><rect x="2.5" y="5.5" width="7" height="5" rx="1" fill="currentColor"/><path d="M4 5.5V4a2 2 0 0 1 4 0v1.5"/></svg>';
const UNLOCKED = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor"><rect x="2.5" y="5.5" width="7" height="5" rx="1"/><path d="M4 5.5V4a2 2 0 0 1 3.8-.9"/></svg>';
const layersPane = $('#layersPane');
const picked = new Set();
function row({ depth, icon, name, value = '', id = '', group = false, lock = null }) {
  const r = document.createElement('div');
  r.className = 'layer' + (group ? ' group' : '');
  r.style.setProperty('--depth', depth);
  r.innerHTML = `<span class="ico">${ICONS[icon]}</span><span class="nm"></span><span class="vl"></span>`;
  r.querySelector('.nm').textContent = name;
  r.querySelector('.vl').textContent = value;
  if (id) { r.dataset.id = id; r.setAttribute('role', 'option'); r.tabIndex = -1; r.addEventListener('click', () => { select(id); dialEls[id]?.g.focus({ preventScroll: true }); }); }
  if (lock) {
    const b = document.createElement('button');
    b.className = 'lk'; b.dataset.ids = lock.join(','); b.dataset.label = name;
    b.addEventListener('click', (e) => { e.stopPropagation(); setLocks(lock, !lock.every((k) => state.locks[k])); });
    r.appendChild(b);
  }
  return r;
}
function markLocks() {
  layersPane.querySelectorAll('.lk').forEach((b) => {
    const ids = b.dataset.ids.split(','), n = ids.filter((k) => state.locks[k]).length, all = n === ids.length;
    b.classList.toggle('on', all); b.classList.toggle('some', n > 0 && !all);
    b.innerHTML = all ? LOCKED : UNLOCKED;
    b.setAttribute('aria-pressed', all);
    b.title = `${all ? 'Unlock' : 'Lock'} ${b.dataset.label}`;
    b.setAttribute('aria-label', b.title);
  });
}
function buildLayers() {
  layersPane.textContent = '';
  layersPane.setAttribute('aria-label', 'Layers');
  layersPane.appendChild(row({ depth: 0, icon: 'frame', name: 'Stage', group: true, lock: PARAMS.map((p) => p.id) }));
  [...RINGS].reverse().forEach((ring) => {
    const g = row({ depth: 1, icon: 'ring', name: ring.name, group: true, lock: ring.params.map((p) => p.id) });
    g.dataset.ring = ring.id;
    layersPane.appendChild(g);
    ring.params.forEach((p) => layersPane.appendChild(row({ depth: 2, icon: 'dial', name: p.label, value: P[p.id].fmt(state.v[p.id]), id: p.id, lock: [p.id] })));
  });
  layersPane.appendChild(row({ depth: 1, icon: 'logo', name: `Logo · ${logoName()}`, group: true }));
  if (!logo.raster) {
    const tools = document.createElement('div');
    tools.className = 'parts-tools';
    tools.innerHTML = '<button class="ibtn" data-op="merge">Merge</button><button class="ibtn" data-op="split">Split</button><button class="ibtn" data-op="up" aria-label="Move earlier" title="Move earlier in the stagger">↑</button><button class="ibtn" data-op="down" aria-label="Move later" title="Move later in the stagger">↓</button><button class="ibtn" data-op="reset">Reset</button>';
    tools.addEventListener('click', (e) => {
      const op = e.target.closest('[data-op]')?.dataset.op;
      if (!op) return;
      const sel = [...picked], msg = editParts(op, sel);
      if (msg) { toast(msg); return; }
      picked.clear();
      if ((op === 'up' || op === 'down') && sel.length === 1) picked.add(Math.max(0, Math.min(logo.parts.length - 1, sel[0] + (op === 'up' ? -1 : 1))));
      markParts();
    });
    layersPane.appendChild(tools);
  }
  [...picked].forEach((i) => { if (i >= logo.parts.length) picked.delete(i); });
  const thumbs = partSources(48);
  logo.parts.forEach((part, i) => {
    const r = row({ depth: 2, icon: 'part', name: `Part ${i + 1}`, value: part.el.querySelectorAll ? `${Math.max(1, part.shapes.length)} shape${part.shapes.length > 1 ? 's' : ''}` : '' });
    r.classList.add('part-row'); r.dataset.part = i; r.tabIndex = 0; r.setAttribute('role', 'option');
    r.querySelector('.ico').innerHTML = `<img alt="" src="${thumbs[i] || thumbs[0]}">`;
    const toggle = () => { if (picked.has(i)) picked.delete(i); else picked.add(i); markParts(); };
    r.addEventListener('click', toggle);
    r.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(); } });
    layersPane.appendChild(r);
  });
  if (!logo.raster) {
    const hint = document.createElement('div');
    hint.className = 'hint parts-hint';
    hint.textContent = 'Pick parts, then merge or split them. Order sets which part moves first when Stagger is up.';
    layersPane.appendChild(hint);
  }
  markLayers(); markLocks(); markParts();
}
function markParts() {
  layersPane.querySelectorAll('.part-row').forEach((r) => r.setAttribute('aria-selected', picked.has(+r.dataset.part)));
}
function updateLayerValue(id) {
  const r = layersPane.querySelector(`[data-id="${id}"] .vl`);
  if (r) r.textContent = P[id].fmt(state.v[id]);
}
function markLayers() {
  layersPane.querySelectorAll('.layer:not(.part-row)').forEach((r) => {
    r.setAttribute('aria-selected', r.dataset.id === state.sel ? 'true' : 'false');
    r.classList.toggle('child-sel', !!r.dataset.ring && RINGS[P[state.sel].ring].id === r.dataset.ring);
  });
}

const presetsPane = $('#presetsPane');
PRESETS.forEach((pr, i) => {
  const b = document.createElement('button');
  b.className = 'preset';
  const n = 3 + (i % 4);
  const dots = Array.from({ length: n }, (_, k) => { const [x, y] = polar(12, 12, 8, (360 * k) / n + i * 15); return `<circle cx="${f2(x)}" cy="${f2(y)}" r="${k === 0 ? 2.6 : 1.6}"/>`; }).join('');
  b.innerHTML = `<span class="preset-thumb"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-opacity=".3"/>${dots}</svg></span><span><b></b><span></span></span>`;
  b.querySelector('b').textContent = pr.name;
  b.querySelector('span span').textContent = pr.desc;
  b.addEventListener('click', () => {
    note(`Preset: ${pr.name}`); animateTo(pr.v);
    if (pr.at) { const at = arrangeAt(pr.at); for (const id in at) if (at[id] !== state.at[id]) setAt(id, at[id]); }
    if (!state.playing && pr.name !== 'Still') setPlaying(true); toast(`Applied ${pr.name}`);
  });
  presetsPane.appendChild(b);
});
function bindTabs(pairs) {
  pairs.forEach(([tab, pane]) => tab.addEventListener('click', () => pairs.forEach(([t, p]) => { t.setAttribute('aria-selected', t === tab); p.hidden = p !== pane; })));
}
bindTabs([[$('#tabRoster'), $('#rosterPane')], [$('#tabBranches'), $('#branchesPane')], [$('#tabLayers'), layersPane], [$('#tabPresets'), presetsPane]]);
bindTabs([[$('#tabDesign'), $('#designPane')], [$('#tabAgent'), $('#agentPane')], [$('#tabExport'), $('#exportPane')], [$('#tabHistory'), $('#historyPane')]]);

const valInput = $('#valInput'), easeSelect = $('#easeSelect');
EASES.forEach((e, i) => { const o = document.createElement('option'); o.value = i; o.textContent = e.name; easeSelect.appendChild(o); });
const unitText = (p) => (p.unit === 'turns' ? 'turns' : p.unit);
const plain = (p, v) => (p.options ? EASES[v].name : `${+v.toFixed(2)}${p.unit === 'turns' ? '' : p.unit}`);
function renderPanel() {
  const p = P[state.sel], v = state.v[p.id];
  $('#selName').textContent = p.label;
  $('#selRing').textContent = RINGS[p.ring].name;
  $('#selDesc').textContent = p.desc;
  $('#numRow').hidden = !!p.options;
  $('#selRow').hidden = !p.options;
  if (p.options) easeSelect.value = v;
  else if (document.activeElement !== valInput) valInput.value = +v.toFixed(2);
  $('#valUnit').textContent = unitText(p);
  $('#selMeter').style.width = `${((v - p.min) / (p.max - p.min)) * 100}%`;
  $('#selMin').textContent = plain(p, p.min);
  $('#selDef').textContent = `Default ${plain(p, p.def)}`;
  $('#selMax').textContent = plain(p, p.max);
  const locked = !!state.locks[p.id], lockBtn = $('#lockBtn');
  valInput.disabled = easeSelect.disabled = $('#resetBtn').disabled = locked;
  lockBtn.textContent = locked ? 'Unlock' : 'Lock';
  lockBtn.setAttribute('aria-pressed', locked);
  const t = timed(p.id);
  $('#atRow').hidden = !t;
  atInput.disabled = locked;
  if (t && document.activeElement !== atInput) atInput.value = ((state.at[p.id] / 360) * state.v.duration).toFixed(2);
  $('#atHint').textContent = t
    ? `When ${p.label} is strongest: ${Math.round((state.at[p.id] / 360) * 100)}% of the way through the loop.${locked ? ' Locked, so it holds this moment.' : ''}`
    : p.ring === 0 ? 'A spec: Timing sets the clock itself, so it never glows. Its place on the inner circle is yours to arrange.' : 'A spec: Material stays the same all through the loop, so it never glows. Its place on its circle is yours to arrange.';
}
const atInput = $('#atInput');
const commitAt = () => {
  const n = parseFloat(atInput.value), p = P[state.sel];
  if (Number.isFinite(n) && timed(p.id)) { note(`${p.label} keyframe ${clamp(n, 0, state.v.duration).toFixed(2)}s`); beginEdit(); setAt(p.id, (clamp(n, 0, state.v.duration) / state.v.duration) * 360); endEdit(); }
  atInput.value = ((state.at[p.id] / 360) * state.v.duration).toFixed(2);
  renderPanel();
};
atInput.addEventListener('change', commitAt);
atInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { commitAt(); atInput.blur(); } });
$('#lockBtn').addEventListener('click', () => setLocks([state.sel], !state.locks[state.sel]));
const scaleInput = $('#logoScale');
const showScale = () => { if (document.activeElement !== scaleInput) scaleInput.value = Math.round(state.scale * 100); };
scaleInput.addEventListener('change', () => { const n = parseFloat(scaleInput.value); if (Number.isFinite(n)) { beginEdit(); setScale(n / 100); endEdit(); } scaleInput.value = Math.round(state.scale * 100); });
scaleInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') scaleInput.blur(); });
showScale();
const commitInput = () => {
  const n = parseFloat(valInput.value);
  if (Number.isFinite(n)) { beginEdit(); setValue(state.sel, n); endEdit(); }
  renderPanel();
  valInput.value = +state.v[state.sel].toFixed(2);
};
valInput.addEventListener('change', commitInput);
valInput.addEventListener('keydown', (e) => {
  const p = P[state.sel];
  if (e.key === 'Enter') { commitInput(); valInput.blur(); }
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    e.preventDefault();
    beginEdit(); setValue(p.id, state.v[p.id] + (e.key === 'ArrowUp' ? 1 : -1) * p.step * (e.shiftKey ? 10 : 1)); endEdit();
    valInput.value = +state.v[p.id].toFixed(2);
  }
});
easeSelect.addEventListener('change', () => { beginEdit(); setValue('easing', +easeSelect.value); endEdit(); });
$('#resetBtn').addEventListener('click', () => { beginEdit(); setValue(state.sel, P[state.sel].def); endEdit(); });

$('#scrub').addEventListener('pointerdown', (ev) => {
  ev.preventDefault();
  const el = ev.currentTarget, p = P[state.sel], start = { x: ev.clientX, v: state.v[p.id] };
  el.setPointerCapture(ev.pointerId);
  beginEdit();
  document.body.style.cursor = 'ew-resize';
  const move = (e) => setValue(p.id, start.v + ((e.clientX - start.x) / 200) * (p.max - p.min) * (e.shiftKey ? 0.15 : 1));
  const up = () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); document.body.style.cursor = ''; endEdit(); };
  el.addEventListener('pointermove', move); el.addEventListener('pointerup', up);
});

const logoGrid = $('#logoGrid'), fileInput = $('#fileInput');
function renderLogoGrid() {
  logoGrid.textContent = '';
  const opts = Object.entries(LOGOS).map(([key, l]) => ({ key, name: l.name, html: l.svg }));
  if (state.custom) opts.push({ key: 'custom', name: state.custom.name || 'Your logo', html: state.custom.type === 'svg' ? state.custom.text : `<img src="${state.custom.src}" alt="" style="width:100%;height:100%;object-fit:contain">` });
  opts.forEach((o) => {
    const b = document.createElement('button');
    b.className = 'logo-opt';
    b.title = o.name;
    b.setAttribute('aria-label', `Use ${o.name}`);
    b.setAttribute('aria-pressed', state.logo === o.key);
    b.style.color = state.color;
    if (o.key === 'custom' && state.custom.type === 'svg') {
      const doc = parseSVG(o.html);
      const s = document.importNode(doc.documentElement, true);
      s.removeAttribute('width'); s.removeAttribute('height');
      b.appendChild(s);
    } else b.innerHTML = o.html;
    b.addEventListener('click', () => { state.logo = o.key; buildLogo(); save(); });
    logoGrid.appendChild(b);
  });
  const up = document.createElement('button');
  up.className = 'logo-opt upload';
  up.title = 'Upload SVG or image';
  up.setAttribute('aria-label', 'Upload SVG or image');
  up.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M8 11V3M4.8 6.2 8 3l3.2 3.2M3 13h10"/></svg>';
  up.addEventListener('click', () => fileInput.click());
  logoGrid.appendChild(up);
}

fileInput.addEventListener('change', () => { loadFile(fileInput.files[0]); fileInput.value = ''; });

const colorPick = $('#colorPick'), colorHex = $('#colorHex');

colorPick.addEventListener('input', () => setColor(colorPick.value));
colorHex.addEventListener('change', () => {
  const m = colorHex.value.trim().replace(/^#/, '');
  const full = /^[0-9a-f]{3}$/i.test(m) ? m.split('').map((c) => c + c).join('') : m;
  if (/^[0-9a-f]{6}$/i.test(full)) setColor('#' + full); else colorHex.value = state.color.slice(1);
});
colorPick.value = state.color; colorHex.value = state.color.slice(1);

let exportTimer = 0;
function renderExport() {
  clearTimeout(exportTimer);
  exportTimer = setTimeout(() => {
    $('#settingsCode').textContent = JSON.stringify({ ...state.v, easing: EASES[state.v.easing].name }, null, 1);
    try { const s = buildExportSVG(); $('#svgSize').textContent = `${(s.length / 1024).toFixed(1)} KB · ${state.v.duration}s loop · ${logo.parts.length} parts`; } catch (e) { $('#svgSize').textContent = ''; }
  }, 200);
}
async function copyText(text, label) {
  try { await navigator.clipboard.writeText(text); toast(`Copied ${label}`); }
  catch (e) { showCode(text, label); }
}
function showCode(text, label) {
  const m = document.createElement('div');
  m.className = 'modal';
  m.innerHTML = `<div class="modal-card" role="dialog" aria-modal="true" aria-label="${label}"><div class="sec-title"><span></span><button class="ibtn">Close</button></div><div class="hint">Your browser blocked the clipboard, so the text is selected below. Copy it with ⌘C or Ctrl+C.</div><textarea readonly></textarea></div>`;
  m.querySelector('.sec-title span').textContent = label[0].toUpperCase() + label.slice(1);
  const ta = m.querySelector('textarea'); ta.value = text;
  const close = () => m.remove();
  m.querySelector('button').addEventListener('click', close);
  m.addEventListener('click', (e) => { if (e.target === m) close(); });
  m.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  document.body.appendChild(m);
  ta.focus(); ta.select();
}
$('#copySvgBtn').addEventListener('click', () => copyText(buildExportSVG(), 'animated SVG'));
$('#copyJsonBtn').addEventListener('click', () => copyText(JSON.stringify(state.v, null, 2), 'settings JSON'));

on('value', (id) => { updateLayerValue(id); if (id === state.sel) renderPanel(); if (MATERIAL.includes(id)) renderLook(); renderExport(); });
const LOOKS = { glass: 'Clear glass', chrome: 'Liquid chrome', pearl: 'Pearl' };
const MATERIAL = RINGS[3].params.map((p) => p.id);
const lookSeg = $('#lookSeg'), lookK = $('#lookK');
let look = { id: 'glass', k: 100 };
try { const saved = JSON.parse(localStorage.getItem('logo-look-v1') || 'null'); if (saved && (LOOKS[saved.id] || saved.id === 'flat') && Number.isFinite(saved.k)) look = saved; } catch (e) { /* storage unavailable */ }
function lookValues(id, k) {
  if (id === 'flat') return { depth: 0 };
  const full = PRESETS.find((p) => p.name === LOOKS[id]).v, rest = { depth: 12, metal: full.metal, refract: 0, disperse: 0, flow: 0, gloss: Math.round(full.gloss * 0.6), sheen: 0 };
  return Object.fromEntries(MATERIAL.map((d) => [d, Math.round(rest[d] + ((full[d] - rest[d]) * k) / 100)]));
}
function renderLook() {
  const want = lookValues(look.id, look.k), match = Object.keys(want).every((d) => state.locks[d] || want[d] === state.v[d]);
  lookSeg.querySelectorAll('button').forEach((b) => b.setAttribute('aria-checked', match && b.dataset.look === look.id));
  $('#lookName').textContent = match ? '' : 'Custom';
  lookK.disabled = look.id === 'flat';
  if (document.activeElement !== lookK) lookK.value = look.k;
  $('#lookKVal').textContent = look.id === 'flat' ? '' : `${look.k}%`;
}
const saveLook = () => { try { localStorage.setItem('logo-look-v1', JSON.stringify(look)); } catch (e) { /* ignore */ } };
lookSeg.addEventListener('click', (e) => {
  const b = e.target.closest('[data-look]');
  if (!b) return;
  look = { id: b.dataset.look, k: look.k || 100 };
  saveLook(); note(`Material: ${b.textContent}${look.id === 'flat' ? '' : ` ${look.k}%`}`); animateTo(lookValues(look.id, look.k)); renderLook();
});
lookK.addEventListener('input', () => {
  look.k = +lookK.value;
  beginEdit();
  const v = lookValues(look.id, look.k);
  for (const d in v) setValue(d, v[d]);
  renderLook();
});
lookK.addEventListener('change', () => { note(`Material intensity ${look.k}%`); endEdit(); saveLook(); });
renderLook();
on('select', () => { renderPanel(); markLayers(); });
on('at', () => renderPanel());
on('locks', () => { renderPanel(); markLocks(); });
on('scale', showScale);
on('logo', () => {
  const n = logo.parts.length;
  $('#partsInfo').textContent = `${logoName()} · ${n} part${n === 1 ? '' : 's'}`;
  renderLogoGrid();
  buildLayers();
  renderExport();
});
on('color', (hex) => {
  colorPick.value = hex; colorHex.value = hex.slice(1).toUpperCase();
  logoGrid.querySelectorAll('.logo-opt').forEach((b) => { if (!b.classList.contains('upload')) b.style.color = state.color; });
  renderExport();
});

export { renderPanel, renderExport };
