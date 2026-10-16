const TARGETS: Record<string, string> = {
  speakui: '[data-group="demo"]',
  "book-covers": '[data-group="covers"]',
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
