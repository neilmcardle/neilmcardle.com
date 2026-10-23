const TARGETS: Record<string, string> = {
  speakui: '[data-group="demo"]',
  paintings: '[data-group="paintings"]',
  tools: '[data-group="tools"]',
  kids: '[data-group="kids"]',
  audiobook: '[data-group="books"]',
};

export function targetFor(id: string) {
  return document.querySelector<HTMLElement>(
    TARGETS[id] ?? `[data-item="${CSS.escape(id)}"]`,
  );
}

export function reveal(target: HTMLElement) {
  const fold =
    target.closest<HTMLDetailsElement>("details") ??
    target.querySelector<HTMLDetailsElement>("details");
  if (!fold || fold.open) return;
  fold.dataset.instant = "";
  fold.open = true;
  void fold.offsetHeight;
  requestAnimationFrame(() => delete fold.dataset.instant);
}
