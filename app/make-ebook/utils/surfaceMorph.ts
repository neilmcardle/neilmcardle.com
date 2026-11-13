import { flushSync } from "react-dom";
import { preloadPreview } from "../components/previewLoader";
import { reducedMotion } from "./motion";

type Surface = "edit" | "preview";

type TransitionDocument = Document & {
  startViewTransition?: (update: () => Promise<void> | void) => {
    ready: Promise<void>;
    finished: Promise<void>;
  };
};

const READY_MS = 160;
const CHUNK_MS = 800;

function within<T>(promise: Promise<T>, ms: number): Promise<unknown> {
  return Promise.race([
    promise,
    new Promise((resolve) => setTimeout(resolve, ms)),
  ]);
}

function previewReady(ms: number): Promise<void> {
  const started = performance.now();
  return new Promise((resolve) => {
    const look = () => {
      const stage = document.querySelector("[data-preview-ready]");
      if (stage || performance.now() - started > ms) resolve();
      else setTimeout(look, 16);
    };
    look();
  });
}

export function morph(
  kind: string,
  apply: () => void,
  before?: () => Promise<unknown>,
  after?: () => Promise<unknown>,
) {
  const doc = document as TransitionDocument;
  if (!doc.startViewTransition) {
    apply();
    return;
  }
  const root = document.documentElement;
  if (!reducedMotion()) root.dataset.surfaceTo = kind;
  const transition = doc.startViewTransition(async () => {
    if (before) await before();
    flushSync(apply);
    if (after) await after();
  });
  transition.ready.catch(() => {});
  transition.finished
    .catch(() => {})
    .finally(() => {
      if (root.dataset.surfaceTo === kind) delete root.dataset.surfaceTo;
    });
}

export function morphSurface(to: Surface, apply: () => void) {
  if (to === "edit") {
    morph(to, apply);
    return;
  }
  morph(
    to,
    apply,
    () => within(preloadPreview(), CHUNK_MS),
    () => previewReady(READY_MS),
  );
}
