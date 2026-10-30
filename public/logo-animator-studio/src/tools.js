import { frac, f2, EASES, RINGS, P, state, beginEdit, endEdit, quant, setValue, select, timed } from './engine.js';
import { logo, logoName } from './logo.js';
import { buildExportSVG, buildFrameSVG } from './export.js';
import { spinRing, moveDial, animateTo } from './stage.js';

const fail = (msg) => { throw new Error(msg); };
const dialOf = (id) => P[id] || fail(`Unknown dial "${id}". Call read_rings for the list.`);
const ringOf = (id) => {
  const i = RINGS.findIndex((r) => r.id === id);
  return i < 0 ? fail(`Unknown ring "${id}". Use timing, motion or look.`) : i;
};
function numberFor(p, value) {
  if (p.options && typeof value === 'string') {
    const i = EASES.findIndex((e) => e.name.toLowerCase() === value.toLowerCase() || e.short === value.toLowerCase());
    return i < 0 ? fail(`Unknown easing "${value}". Use one of: ${EASES.map((e) => e.name).join(', ')}.`) : i;
  }
  return Number.isFinite(value) ? value : fail(`"${p.id}" needs a number between ${p.min} and ${p.max}.`);
}
const show = (p, v) => (p.options ? EASES[v].name : v);
const withValues = (values = {}) => {
  const v = { ...state.v };
  for (const id in values) v[id] = quant(dialOf(id), numberFor(P[id], values[id]));
  return v;
};

const tools = {
  read_rings() {
    return {
      rings: RINGS.map((r) => ({
        id: r.id,
        name: r.name,
        dials: r.params.map((p) => ({
          id: p.id, label: p.label, value: show(p, state.v[p.id]), min: show(p, p.min), max: show(p, p.max), step: p.step, default: show(p, p.def),
          unit: p.unit, description: p.desc, ...(p.options ? { options: EASES.map((e) => e.name) } : {}),
          ...(timed(p.id) ? { keyframe: f2((state.at[p.id] / 360) * state.v.duration) } : {}), locked: !!state.locks[p.id],
        })),
      })),
      selected: state.sel,
      playing: state.playing,
      time: f2(frac(state.t / state.v.duration) * state.v.duration),
      logo: { name: logoName(), parts: logo.parts.length, vector: !logo.raster, color: state.color },
    };
  },
  set_dial({ dial, value, animate }) {
    const p = dialOf(dial), from = state.v[dial], asked = numberFor(p, value), to = quant(p, asked);
    if (state.locks[dial]) fail(`${p.label} is locked by the user. Leave it as it is.`);
    if (animate) animateTo({ [dial]: to });
    else { beginEdit(); setValue(dial, asked); endEdit(); }
    return { dial, from: show(p, from), to: show(p, to), clamped: asked < p.min || asked > p.max };
  },
  set_timing({ dial, at }) {
    const p = dialOf(dial);
    if (!timed(dial)) fail(`${p.label} stays the same all through the loop, so it has no timing.`);
    if (state.locks[dial]) fail(`${p.label} is locked by the user. Leave it as it is.`);
    if (!Number.isFinite(at)) fail('set_timing needs "at", the keyframe time in seconds.');
    const from = (state.at[dial] / 360) * state.v.duration;
    moveDial(dial, (at / state.v.duration) * 360);
    return { dial, from: f2(from), to: f2((state.at[dial] / 360) * state.v.duration) };
  },
  spin_ring({ ring, dial, degrees }) {
    if (dial) { select(dialOf(dial).id); return { ring: RINGS[P[dial].ring].id, selected: dial }; }
    const i = ringOf(ring);
    if (!Number.isFinite(degrees)) fail('spin_ring needs either a dial to select, or a ring and degrees.');
    spinRing(i, degrees);
    return { ring, degrees };
  },
  render_preview({ time, values } = {}) {
    const v = withValues(values);
    const t = Number.isFinite(time) ? time : state.t;
    return { time: f2(frac(t / v.duration) * v.duration), duration: v.duration, svg: buildFrameSVG(t, v) };
  },
  export_svg({ values } = {}) {
    const v = withValues(values);
    return { duration: v.duration, svg: buildExportSVG(v) };
  },
};

const dialIds = Object.keys(P);
const valuesSchema = { type: 'object', description: 'Dial values to use instead of the current ones, keyed by dial id. Nothing is changed in the app.', additionalProperties: { type: ['number', 'string'] } };
const toolSchemas = [
  { name: 'read_rings', description: 'Read every ring and dial with its current value, range, step and default, plus the selected dial, playback state and logo.', input_schema: { type: 'object', properties: {} } },
  {
    name: 'set_dial', description: 'Set one dial. The value is snapped to the dial step and clamped to its range. The change is undoable.',
    input_schema: { type: 'object', properties: { dial: { type: 'string', enum: dialIds }, value: { type: ['number', 'string'], description: 'A number, or an easing name for the easing dial.' }, animate: { type: 'boolean', description: 'Ease to the value instead of jumping.' } }, required: ['dial', 'value'] },
  },
  {
    name: 'set_timing', description: 'Move a Motion or Look dial\'s keyframe: the time in the loop when its effect is strongest. Dials on one ring cannot overlap, so the result may sit slightly to one side. The change is undoable.',
    input_schema: { type: 'object', properties: { dial: { type: 'string', enum: dialIds.filter(timed) }, at: { type: 'number', description: 'Seconds into the loop.' } }, required: ['dial', 'at'] },
  },
  {
    name: 'spin_ring', description: 'Turn a ring by degrees. On motion and look this moves all its unlocked dials earlier (negative) or later (positive) in the loop. On timing and material it only rearranges them. Or pass a dial to select it without moving anything. Only turn a ring when asked.',
    input_schema: { type: 'object', properties: { ring: { type: 'string', enum: RINGS.map((r) => r.id) }, dial: { type: 'string', enum: dialIds }, degrees: { type: 'number' } } },
  },
  {
    name: 'render_preview', description: 'Render one still frame of the logo as SVG, at a time in seconds, optionally with different dial values.',
    input_schema: { type: 'object', properties: { time: { type: 'number', description: 'Seconds into the loop. Defaults to the playhead.' }, values: valuesSchema } },
  },
  { name: 'export_svg', description: 'Export the loop as a standalone animated SVG, optionally with different dial values.', input_schema: { type: 'object', properties: { values: valuesSchema } } },
];

function callTool(name, args = {}) {
  if (!Object.hasOwn(tools, name)) fail(`Unknown tool "${name}".`);
  return tools[name](args || {});
}

window.logoAnimator = { tools: toolSchemas, call: callTool };

export { toolSchemas, callTool };
