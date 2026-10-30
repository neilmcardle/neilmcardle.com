import { NS, mk } from './dom.js';
import { state, clamp, rad, smooth, f2, frameAt, filterCss } from './engine.js';
import { logo, SHAPES } from './logo.js';

function exportRoot() {
  let root;
  if (logo.raster) {
    root = document.createElementNS(NS, 'svg');
    root.setAttribute('viewBox', '0 0 200 200');
    const part = mk('g', { class: 'part' }, root);
    mk('image', { href: logo.src, width: 200, height: 200, preserveAspectRatio: 'xMidYMid meet' }, part);
  } else {
    root = logo.svg.cloneNode(true);
    root.removeAttribute('aria-hidden');
    root.querySelectorAll('[style]').forEach((e) => e.removeAttribute('style'));
  }
  root.setAttribute('xmlns', NS);
  const css = [`svg{color:${state.color};overflow:visible}`, '.w{transform-box:view-box;transform-origin:50% 50%}', '.part{transform-box:fill-box;transform-origin:center}'];
  const w = document.createElementNS(NS, 'g');
  w.setAttribute('class', 'w');
  [...root.childNodes].filter((c) => !(c.localName === 'defs' || c.localName === 'style' || c.localName === 'title')).forEach((c) => w.appendChild(c));
  root.appendChild(w);
  return { root, w, css };
}

function buildExportSVG(v = state.v) {
  const D = v.duration, N = Math.round(clamp(D * 24, 24, 96));
  const n = logo.parts.length;
  const frames = Array.from({ length: N + 1 }, (_, k) => frameAt((k / N) * D, n, v));
  const pct = (k) => `${f2((k / N) * 100)}%`;
  const kf = (name, fn) => `@keyframes ${name}{${frames.map((f, k) => `${pct(k)}{${fn(f, k)}}`).join('')}}`;
  const anim = (name) => `animation:${name} ${D}s linear infinite`;
  const { root, css } = exportRoot();
  if (v.spin || v.flip) {
    css.push(kf('w', (f) => `transform:rotate(${f2(f.whole.spin)}deg) scaleX(${f2(Math.cos(rad(f.whole.flip)))})`), `.w{${anim('w')}}`);
  }
  if (v.hue || v.glow || v.blur) css.push(kf('fx', (f) => `filter:${filterCss(f.whole)}`), `svg{${anim('fx')}}`);
  const moves = v.bounce || v.drift || v.wobble || v.pulse || v.fade;
  const k = logo.raster ? 1 : logo.k;
  root.querySelectorAll('.part').forEach((part) => {
    const i = +part.getAttribute('data-i');
    part.removeAttribute('data-i');
    part.setAttribute('class', `part p${i}`);
    if (moves) {
      css.push(kf(`p${i}`, (f) => { const q = f.parts[i]; return `transform:translate(${f2(q.tx * k)}px,${f2(q.ty * k)}px) rotate(${f2(q.rot)}deg) scale(${f2(q.sc * 1000) / 1000})${v.fade ? `;opacity:${f2(q.op)}` : ''}`; }), `.p${i}{${anim(`p${i}`)}}`);
    }
    if (v.draw && !logo.raster) {
      [...part.querySelectorAll(SHAPES)].forEach((s, j) => {
        const info = logo.parts[i]?.shapes[j];
        if (!info) return;
        const cls = `s${i}_${j}`;
        s.classList.add(cls);
        s.setAttribute('pathLength', '1');
        if (!info.hasStroke) css.push(`.${cls}{stroke:${info.color};stroke-width:${f2(logo.k * 2)}px}`);
        css.push(`.${cls}{stroke-dasharray:1 1;${anim(cls)}}`);
        css.push(kf(cls, (f) => { const p = f.parts[i].p; return `stroke-dashoffset:${f2((1 - p) * 1000) / 1000};fill-opacity:${f2(info.fo * smooth(0.55, 1, p))}${info.hasStroke ? '' : `;stroke-opacity:${p >= 0.999 ? 0 : 1}`}`; }));
      });
    }
  });
  css.push('@media (prefers-reduced-motion:reduce){*{animation-play-state:paused!important}}');
  const style = document.createElementNS(NS, 'style');
  style.textContent = css.join('\n');
  root.insertBefore(style, root.firstChild);
  return new XMLSerializer().serializeToString(root);
}

function buildFrameSVG(t = state.t, v = state.v) {
  const { root, w, css } = exportRoot();
  const f = frameAt(t, logo.parts.length, v);
  const k = logo.raster ? 1 : logo.k;
  w.setAttribute('style', `transform:rotate(${f2(f.whole.spin)}deg) scaleX(${f2(Math.cos(rad(f.whole.flip)))})`);
  const fx = filterCss(f.whole);
  if (fx !== 'none') root.setAttribute('style', `filter:${fx}`);
  root.querySelectorAll('.part').forEach((part) => {
    const i = +part.getAttribute('data-i');
    part.removeAttribute('data-i');
    const q = f.parts[i];
    part.setAttribute('style', `transform:translate(${f2(q.tx * k)}px,${f2(q.ty * k)}px) rotate(${f2(q.rot)}deg) scale(${f2(q.sc * 1000) / 1000});opacity:${f2(q.op)}`);
    if (logo.raster || q.p >= 0.999) return;
    [...part.querySelectorAll(SHAPES)].forEach((s, j) => {
      const info = logo.parts[i]?.shapes[j];
      if (!info) return;
      s.setAttribute('pathLength', '1');
      s.setAttribute('style', `${info.hasStroke ? '' : `stroke:${info.color};stroke-width:${f2(logo.k * 2)}px;`}stroke-dasharray:1 1;stroke-dashoffset:${f2((1 - q.p) * 1000) / 1000};fill-opacity:${f2(info.fo * smooth(0.55, 1, q.p))}`);
    });
  });
  const style = document.createElementNS(NS, 'style');
  style.textContent = css.join('\n');
  root.insertBefore(style, root.firstChild);
  return new XMLSerializer().serializeToString(root);
}

export { buildExportSVG, buildFrameSVG };
