import { NS, $, toast } from './dom.js';
import { state, LOGOS, emit, save, setParting } from './engine.js';

const logoInner = $('#logoInner');
const GFX = new Set(['g', 'path', 'circle', 'ellipse', 'rect', 'polygon', 'polyline', 'line', 'text', 'use', 'image']);
const SHAPES = 'path,circle,ellipse,rect,polygon,polyline,line';
let logo = { parts: [], k: 1, svg: null, raster: false, vb: [0, 0, 200, 200] };

const parseSVG = (text) => new DOMParser().parseFromString(/<svg[^>]*\sxmlns=/i.test(text) ? text : text.replace(/<svg\b/i, `<svg xmlns="${NS}"`), 'image/svg+xml');
function sanitizeSVG(text) {
  const doc = parseSVG(text);
  const svg = doc.documentElement;
  if (!svg || svg.localName !== 'svg' || doc.querySelector('parsererror')) throw new Error('That file is not a readable SVG.');
  svg.querySelectorAll('script,foreignObject,iframe,animate,set,animateTransform,animateMotion').forEach((n) => n.remove());
  [svg, ...svg.querySelectorAll('*')].forEach((n) => {
    [...n.attributes].forEach((a) => {
      if (/^on/i.test(a.name) || (/href$/i.test(a.name) && /^\s*javascript:/i.test(a.value))) n.removeAttribute(a.name);
    });
  });
  return new XMLSerializer().serializeToString(svg);
}

const kidsOf = (n) => [...n.children].filter((c) => GFX.has(c.localName));
const pathOf = (el, root) => { const out = []; for (let n = el; n !== root; n = n.parentNode) out.unshift([...n.parentNode.children].indexOf(n)); return out.join('/'); };
const nodeAt = (root, path) => path.split('/').reduce((n, i) => n && n.children[+i], root);
const parentOf = (path) => path.split('/').slice(0, -1).join('/');
const byPath = (a, b) => { const x = a.split('/').map(Number), y = b.split('/').map(Number); for (let i = 0; i < Math.min(x.length, y.length); i++) if (x[i] !== y[i]) return x[i] - y[i]; return x.length - y.length; };

function autoGroups(svg) {
  let host = svg;
  for (let i = 0; i < 5; i++) {
    const kids = kidsOf(host);
    if (kids.length === 1 && kids[0].localName === 'g' && kidsOf(kids[0]).length > 1) host = kids[0]; else break;
  }
  const kids = kidsOf(host);
  let groups = kids.map((k) => [k]);
  if (kids.length > 24) {
    const size = Math.ceil(kids.length / 24); groups = [];
    for (let i = 0; i < kids.length; i += size) groups.push(kids.slice(i, i + size));
  }
  return groups;
}
function resolveGroups(svg, spec) {
  if (!Array.isArray(spec) || !spec.length) return null;
  const groups = spec.map((paths) => (Array.isArray(paths) ? paths.map((p) => nodeAt(svg, String(p))) : []));
  const all = groups.flat();
  if (groups.some((g) => !g.length || g.some((e) => !e || !GFX.has(e.localName) || e.parentNode !== g[0].parentNode))) return null;
  if (all.some((a) => all.some((b) => a !== b && a.contains(b)))) return null;
  return groups;
}
function wrapGroups(groups) {
  return groups.map((gr, i) => {
    const w = document.createElementNS(NS, 'g');
    w.setAttribute('class', 'part');
    w.setAttribute('data-i', i);
    gr[0].before(w);
    gr.forEach((n) => w.appendChild(n));
    return w;
  });
}

const logoName = () => (state.logo === 'custom' ? (state.custom?.name || 'Your logo') : LOGOS[state.logo].name);

function buildLogo() {
  logoInner.textContent = '';
  const src = state.logo === 'custom' && state.custom ? state.custom : { type: 'svg', text: LOGOS[state.logo]?.svg || LOGOS.bloom.svg };
  if (src.type === 'img') {
    const wrap = document.createElement('div');
    wrap.className = 'part img-part';
    const img = document.createElement('img');
    img.src = src.src; img.alt = '';
    wrap.appendChild(img);
    logoInner.appendChild(wrap);
    logo = { parts: [{ el: wrap, shapes: [] }], k: 1, svg: null, raster: true, src: src.src, vb: [0, 0, 200, 200] };
  } else {
    const doc = parseSVG(src.text);
    const svg = document.importNode(doc.documentElement, true);
    let vb = (svg.getAttribute('viewBox') || '').trim().split(/[\s,]+/).map(Number);
    const w = parseFloat(svg.getAttribute('width')), h = parseFloat(svg.getAttribute('height'));
    svg.removeAttribute('width'); svg.removeAttribute('height');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    logoInner.appendChild(svg);
    if (vb.length !== 4 || vb.some((n) => !Number.isFinite(n)) || vb[2] <= 0) {
      if (w > 0 && h > 0) vb = [0, 0, w, h];
      else { try { const b = svg.getBBox(); vb = [b.x, b.y, b.width || 200, b.height || 200]; } catch (e) { vb = [0, 0, 200, 200]; } }
      svg.setAttribute('viewBox', vb.join(' '));
    }
    const groups = resolveGroups(svg, state.parting[state.logo]) || autoGroups(svg);
    const spec = groups.map((gr) => gr.map((el) => pathOf(el, svg)));
    const inner = groups.map((gr) => (gr.length === 1 && gr[0].localName === 'g' && kidsOf(gr[0]).length > 1 ? kidsOf(gr[0]).map((el) => pathOf(el, svg)) : null));
    const parts = wrapGroups(groups).map((el, i) => ({
      el, inner: inner[i],
      shapes: [...el.querySelectorAll(SHAPES)].map((s) => {
        s.setAttribute('pathLength', '1');
        const cs = getComputedStyle(s);
        const hasStroke = cs.stroke !== 'none' && parseFloat(cs.strokeWidth) > 0;
        const fillAttr = s.closest('[fill]')?.getAttribute('fill');
        const color = fillAttr === 'currentColor' || !/^rgb/.test(cs.fill) ? 'currentColor' : cs.fill;
        return { el: s, hasStroke, color, fo: parseFloat(cs.fillOpacity) || 1, drawn: true };
      }),
    }));
    logo = { parts, spec, k: Math.max(vb[2], vb[3]) / 200, svg, raster: false, vb };
  }
  emit('logo');
}

function editParts(op, picked) {
  if (logo.raster) return 'An image is a single part. Upload an SVG to work with parts.';
  const spec = logo.spec.map((g) => [...g]), sel = [...picked].sort((a, b) => a - b);
  if (op === 'reset') { setParting(state.logo, null); return ''; }
  if (op === 'merge') {
    if (sel.length < 2) return 'Pick two or more parts to merge.';
    if (sel.some((i) => parentOf(spec[i][0]) !== parentOf(spec[sel[0]][0]))) return 'Those parts sit in different groups of the SVG, so they cannot be merged.';
    const merged = sel.flatMap((i) => spec[i]).sort(byPath);
    const next = spec.filter((_, i) => !sel.includes(i));
    next.splice(sel[0], 0, merged);
    setParting(state.logo, next); return '';
  }
  if (sel.length !== 1) return 'Pick one part.';
  const i = sel[0];
  if (op === 'split') {
    const pieces = spec[i].length > 1 ? spec[i].map((p) => [p]) : logo.parts[i].inner ? logo.parts[i].inner.map((p) => [p]) : null;
    if (!pieces) return 'That part is a single shape, so there is nothing to split.';
    spec.splice(i, 1, ...pieces);
    setParting(state.logo, spec); return '';
  }
  const j = op === 'up' ? i - 1 : i + 1;
  if (j < 0 || j >= spec.length) return '';
  [spec[i], spec[j]] = [spec[j], spec[i]];
  setParting(state.logo, spec); return '';
}

function loadFile(file) {
  if (!file) return;
  if (file.size > 3 * 1024 * 1024) { toast('That file is over 3 MB. Try a smaller export.'); return; }
  const name = file.name.replace(/\.[^.]+$/, '').slice(0, 40) || 'Your logo';
  const reader = new FileReader();
  if (/svg/.test(file.type) || /\.svg$/i.test(file.name)) {
    reader.onload = () => {
      try { state.custom = { type: 'svg', text: sanitizeSVG(String(reader.result)), name }; state.logo = 'custom'; delete state.parting.custom; buildLogo(); save(); toast(`Loaded ${name}`); }
      catch (e) { toast(e.message); }
    };
    reader.readAsText(file);
  } else if (/^image\//.test(file.type)) {
    reader.onload = () => { state.custom = { type: 'img', src: String(reader.result), name }; state.logo = 'custom'; delete state.parting.custom; buildLogo(); save(); toast(`Loaded ${name}. Draw needs an SVG; it wipes in instead.`); };
    reader.readAsDataURL(file);
  } else toast('Use an SVG, PNG, JPG, WebP or GIF.');
}

export { logo, SHAPES, parseSVG, sanitizeSVG, logoName, buildLogo, loadFile, editParts };
