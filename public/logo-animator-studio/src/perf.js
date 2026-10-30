import { quality, materialOn } from './stage.js';
import { state } from './engine.js';

const on = new URLSearchParams(location.search).has('perf');
const box = on ? document.createElement('div') : null;

function renderer() {
  try {
    const gl = document.createElement('canvas').getContext('webgl2');
    const ext = gl && gl.getExtension('WEBGL_debug_renderer_info');
    return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl ? 'WebGL 2' : 'No WebGL 2';
  } catch (e) { return 'Unknown'; }
}

if (on) {
  box.className = 'perf';
  document.body.appendChild(box);
  const gpu = renderer();
  let gaps = [], last = performance.now(), shown = last;
  const tick = (t) => {
    gaps.push(t - last); last = t;
    if (t - shown > 1000) {
      const s = [...gaps].sort((a, b) => a - b), pick = (q) => s[Math.min(s.length - 1, Math.floor(s.length * q))];
      const glass = document.getElementById('glass');
      box.textContent = [
        `${Math.round((gaps.length * 1000) / (t - shown))} fps`,
        `frame ${pick(0.5).toFixed(1)} ms · slow ${pick(0.95).toFixed(1)} ms · worst ${s[s.length - 1].toFixed(0)} ms`,
        `glass ${!materialOn() ? 'not supported in this browser' : glass.hidden ? (state.v.depth > 0 ? 'loading' : 'off (Depth is 0)') : `${glass.width}px · quality ${Math.round(quality() * 100)}%`}`,
        gpu,
      ].join('\n');
      gaps = []; shown = t;
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
