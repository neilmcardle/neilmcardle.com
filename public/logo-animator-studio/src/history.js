import { $, esc, toast } from './dom.js';
import { on, historyView, jump, restoreStep, snapshot, setPreview } from './engine.js';
import { agentById, initials } from './agents.js';

const PINS = 'logo-pins-v1';
const pane = $('#historyPane');
let pins = [];
try { const saved = JSON.parse(localStorage.getItem(PINS) || '[]'); if (Array.isArray(saved)) pins = saved.filter((p) => p && p.id && p.snap); } catch (e) { /* storage unavailable */ }
const savePins = () => { try { localStorage.setItem(PINS, JSON.stringify(pins)); } catch (e) { toast('Could not save the snapshot in this browser'); } };

const ago = (at) => {
  const s = Math.round((Date.now() - at) / 1000);
  if (s < 10) return 'now';
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  return new Date(at).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
};
const who = (id) => {
  const a = id && id !== 'you' ? agentById(id) : null;
  return a
    ? { name: a.name, mark: `<span class="avatar s20" style="--c:var(--${a.color})">${esc(initials(a.name))}</span>` }
    : { name: 'You', mark: '<span class="avatar you s20">NM</span>' };
};

function render() {
  const { timeline, cursor } = historyView();
  const rows = timeline.map((step, i) => {
    const by = who(step.who), state = i === cursor ? 'now' : i > cursor ? 'future' : 'past';
    return `<div class="hrow ${state}" role="button" tabindex="0" data-step="${i}" aria-current="${i === cursor ? 'step' : 'false'}" title="${i === cursor ? 'Where you are now' : 'Go back to this step'}">
      ${by.mark}<span class="tx"><b>${esc(step.label)}</b><span class="muted">${ago(step.at)} · ${esc(by.name)}</span></span>
      ${i === cursor ? '<span class="chip">Now</span>' : ''}<button class="ibtn keep" data-keep="${i}" title="Save this step as a snapshot">Keep</button></div>`;
  }).reverse().join('');
  pane.innerHTML = `<section class="section">
    <div class="sec-title">Snapshots <button class="ibtn" data-act="pin">Save current</button></div>
    ${pins.length ? pins.map((p) => `<div class="hrow pin" data-pin="${esc(p.id)}">
        <span class="avatar s20 pin-mark" aria-hidden="true">★</span>
        <span class="tx"><input class="pin-name" value="${esc(p.name)}" aria-label="Snapshot name" maxlength="60"><span class="muted">${ago(p.at)}</span></span>
        <button class="ibtn" data-restore="${esc(p.id)}">Restore</button><button class="ibtn" data-drop="${esc(p.id)}" aria-label="Delete snapshot" title="Delete">✕</button></div>`).join('')
      : '<div class="hint">Save a state you like to come back to it later, even after closing the app.</div>'}
  </section>
  <section class="section last">
    <div class="sec-title">Steps <span class="muted" style="font-weight:400">${timeline.length}</span></div>
    <div class="hint">Click a step to go back to it. Hover to preview. Steps after the one you are on stay greyed until you make a new change.</div>
    <div class="hlist">${rows}</div>
  </section>`;
}

function keep(snap, name) {
  pins.unshift({ id: `pin-${Date.now()}`, name, snap, at: Date.now() });
  savePins(); render();
  pane.querySelector('.pin-name')?.select();
  toast('Snapshot saved');
}

pane.addEventListener('click', (e) => {
  const b = e.target.closest('button');
  const { timeline } = historyView();
  if (b?.dataset.act === 'pin') { keep(snapshot(), `Snapshot ${pins.length + 1}`); return; }
  if (b?.dataset.keep) { const s = timeline[+b.dataset.keep]; keep(s.snap, s.label); return; }
  if (b?.dataset.restore) { const p = pins.find((x) => x.id === b.dataset.restore); if (p) { setPreview(null); restoreStep(p.snap, `Restored “${p.name}”`); toast(`Restored ${p.name}`); } return; }
  if (b?.dataset.drop) { pins = pins.filter((x) => x.id !== b.dataset.drop); savePins(); render(); return; }
  const row = e.target.closest('[data-step]');
  if (row) { setPreview(null); jump(+row.dataset.step); }
});
pane.addEventListener('keydown', (e) => {
  const row = e.target.closest('[data-step]');
  if (row && e.target === row && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); setPreview(null); jump(+row.dataset.step); }
});
pane.addEventListener('change', (e) => {
  const input = e.target.closest('.pin-name');
  if (!input) return;
  const p = pins.find((x) => x.id === input.closest('[data-pin]').dataset.pin);
  if (p) { p.name = input.value.trim() || p.name; savePins(); }
});
let previewing = false;
pane.addEventListener('mouseover', (e) => {
  const row = e.target.closest('[data-step]');
  const { timeline, cursor } = historyView();
  if (!row || +row.dataset.step === cursor) { if (previewing) { setPreview(null); previewing = false; } return; }
  setPreview(timeline[+row.dataset.step].snap.v);
  previewing = true;
});
pane.addEventListener('mouseleave', () => { if (previewing) { setPreview(null); previewing = false; } });

on('history', render);
setInterval(() => { if (!pane.hidden) render(); }, 30000);
render();
