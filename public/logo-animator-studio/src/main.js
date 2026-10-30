import { toast } from './dom.js';
import { on, state, undo, redo, steps, setPlaying } from './engine.js';
import { buildLogo } from './logo.js';
import { stage, layout, start } from './stage.js';
import { renderPanel, renderExport } from './panels.js';
import './tools.js';
import './agent-ui.js';
import './kit.js';
import './history.js';
import './perf.js';

on('toast', toast);
on('parting', buildLogo);
const undoBtn = document.querySelector('#undoBtn'), redoBtn = document.querySelector('#redoBtn');
undoBtn.addEventListener('click', undo);
redoBtn.addEventListener('click', redo);
const markSteps = () => { const n = steps(); undoBtn.disabled = !n.undo; redoBtn.disabled = !n.redo; };
on('history', markSteps);
markSteps();

document.addEventListener('keydown', (e) => {
  const tag = e.target.tagName;
  const typing = tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA';
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z' && !typing) { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
  if (typing || tag === 'BUTTON') return;
  if (e.key === ' ') { e.preventDefault(); setPlaying(!state.playing); }
});

setPlaying(state.playing);
buildLogo();
layout();
renderPanel();
renderExport();
new ResizeObserver(() => layout()).observe(stage);
if (document.fonts?.ready) document.fonts.ready.then(() => layout());

start();
