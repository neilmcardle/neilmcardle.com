// Persisted templates that teach the local recogniser the user's drawing
// style. Stored in localStorage, capped, and tagged with provenance so the
// feedback signal can later prune bad ones.

import type { ElementType } from "./wireframe-canvas";
import {
  type NormalizedCloud,
  type Stroke,
  normalize,
} from "./point-cloud-recognizer";

const STORAGE_KEY = "wireframe_templates_v1";
// Hard cap so the localStorage entry stays well under quota even if the
// user trains for an hour. ~200 templates × ~1.5 KB each is comfortable.
const MAX_TEMPLATES = 200;

export interface Template {
  id: string;
  type: ElementType;
  // Optional label captured at template time (e.g. an icon's "close"). When
  // the local matcher fires, we propagate this label so the rendered element
  // mirrors what the user drew during training.
  label?: string;
  cloud: NormalizedCloud;
  // "onboarding": from the guided flow.
  // "organic": auto-added after a successful API recognition.
  source: "onboarding" | "organic";
  createdAt: number;
  // Hits give a rough idea of which templates pull their weight, useful for
  // pruning later or for a future settings inspector.
  hits: number;
  // Negative feedback. When the user clicks the thumbs-down on a locally
  // matched element, we bump this. Templates above a threshold get retired.
  dislikes: number;
}

export interface TemplateInput {
  type: ElementType;
  strokes: Stroke[];
  label?: string;
  source: "onboarding" | "organic";
}

export function loadTemplates(): Template[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Template[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function saveTemplates(templates: Template[]): void {
  if (typeof window === "undefined") return;
  try {
    const trimmed = templates.slice(-MAX_TEMPLATES);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // Quota or disabled storage. Silent: the in-memory list still works for the session.
  }
}

export function addTemplate(input: TemplateInput): Template | null {
  if (input.strokes.length === 0) return null;
  const cloud = normalize(input.strokes);
  if (cloud.points.length === 0) return null;
  const template: Template = {
    id: `tpl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: input.type,
    label: input.label,
    cloud,
    source: input.source,
    createdAt: Date.now(),
    hits: 0,
    dislikes: 0,
  };
  const all = loadTemplates();
  all.push(template);
  saveTemplates(all);
  return template;
}

export function recordHit(templateId: string): void {
  const all = loadTemplates();
  const t = all.find((x) => x.id === templateId);
  if (!t) return;
  t.hits += 1;
  saveTemplates(all);
}

export function recordDislike(templateId: string): void {
  const all = loadTemplates();
  const t = all.find((x) => x.id === templateId);
  if (!t) return;
  t.dislikes += 1;
  saveTemplates(all);
}

// Retire templates that have accumulated more thumbs-down than thumbs-up.
// Cheap and easy and avoids needing a settings UI in v1.
export function pruneBadTemplates(): number {
  const all = loadTemplates();
  const kept = all.filter((t) => t.dislikes < 2 || t.hits > t.dislikes);
  if (kept.length === all.length) return 0;
  saveTemplates(kept);
  return all.length - kept.length;
}

export function deleteTemplate(id: string): Template | null {
  const all = loadTemplates();
  const idx = all.findIndex((t) => t.id === id);
  if (idx < 0) return null;
  const [removed] = all.splice(idx, 1);
  saveTemplates(all);
  return removed;
}

export function resetAllTemplates(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

