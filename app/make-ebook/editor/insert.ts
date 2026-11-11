import type { EditorView } from "prosemirror-view";

export function readImageFile(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result;
      resolve(typeof src === "string" ? src : null);
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

export function promptForLink(): string | null {
  const url = window.prompt("Enter the URL:");
  return url ? url : null;
}

export function cleanAnchorId(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function promptForAnchor(): string | null {
  const raw = window.prompt(
    'Enter anchor ID (for linking from index):\n\nExample: chapter-introduction\n\nThis will create: <a id="chapter-introduction"></a>',
  );
  if (!raw || !raw.trim()) return null;
  return cleanAnchorId(raw) || null;
}

export async function copySelection(view: EditorView, cut: boolean) {
  const slice = view.state.selection.content();
  const { dom, text } = view.serializeForClipboard(slice);
  if (cut && view.editable) {
    view.dispatch(view.state.tr.deleteSelection().scrollIntoView());
  }
  try {
    await navigator.clipboard.write([
      new ClipboardItem({
        "text/html": new Blob([dom.innerHTML], { type: "text/html" }),
        "text/plain": new Blob([text], { type: "text/plain" }),
      }),
    ]);
  } catch {
    await navigator.clipboard?.writeText(text).catch(() => {});
  }
}
