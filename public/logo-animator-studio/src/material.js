import { NS } from './dom.js';
import { state } from './engine.js';
import { logo, SHAPES } from './logo.js';
import { PAD, SHADERS, createMaterial } from './material-core.js';

function loadImage(src) {
  return new Promise((resolve, reject) => { const img = new Image(); img.onload = () => resolve(img); img.onerror = reject; img.src = src; });
}
function partSources(size, outline = false) {
  if (logo.raster) return outline ? null : [logo.src];
  const base = logo.svg.cloneNode(true);
  base.querySelectorAll('[style]').forEach((e) => e.removeAttribute('style'));
  base.setAttribute('xmlns', NS);
  base.setAttribute('width', size); base.setAttribute('height', size);
  base.setAttribute('style', `color:${state.color}`);
  const n = base.querySelectorAll('.part').length;
  return Array.from({ length: n }, (_, i) => {
    const one = base.cloneNode(true);
    one.querySelectorAll('.part').forEach((p) => { if (+p.getAttribute('data-i') !== i) p.remove(); });
    if (outline) {
      [...one.querySelector('.part').querySelectorAll(SHAPES)].forEach((s, j) => {
        const info = logo.parts[i].shapes[j];
        s.setAttribute('style', info && !info.hasStroke ? `fill-opacity:0;stroke:${info.color};stroke-width:${logo.k * 2}px` : 'fill-opacity:0');
      });
    }
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(one))}`;
  });
}
function attach(canvas) {
  const material = createMaterial(canvas);
  if (!material) return null;
  let token = 0;
  async function load(size = logo.parts.length > 12 ? 768 : 1024) {
    const mine = ++token, outlines = partSources(Math.min(size, 1024), true);
    const [images, lines] = await Promise.all([Promise.all(partSources(size).map(loadImage)), outlines ? Promise.all(outlines.map(loadImage)) : null]);
    if (mine !== token) return false;
    material.setParts(images, lines);
    return true;
  }
  return { load, render: (frame, v, pad) => material.render(frame, v, state.color, pad), get ready() { return material.ready; } };
}

export { PAD, SHADERS, attach, partSources, loadImage };
