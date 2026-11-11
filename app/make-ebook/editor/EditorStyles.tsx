"use client";

export default function EditorStyles() {
  return (
    <style jsx global>{`
      .editor-root p {
        margin: 0.5rem 0;
      }
      .editor-root h1 {
        font-size: 2rem !important;
        font-weight: 700 !important;
        margin: 1.5rem 0 1rem 0 !important;
        line-height: 1.2 !important;
        color: inherit !important;
        display: block !important;
      }
      .editor-root h2 {
        font-size: 1.5rem !important;
        font-weight: 700 !important;
        margin: 1.25rem 0 0.75rem 0 !important;
        line-height: 1.3 !important;
        color: inherit !important;
        display: block !important;
      }
      .editor-root h3 {
        font-size: 1.25rem !important;
        font-weight: 700 !important;
        margin: 1rem 0 0.5rem 0 !important;
        line-height: 1.4 !important;
        color: inherit !important;
        display: block !important;
      }
      .editor-root pre {
        background: #f2f3f5;
        padding: 0.75rem 0.9rem;
        border-radius: 6px;
        font-size: 0.85rem;
        line-height: 1.4;
        overflow-x: auto;
        font-family:
          ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
          "Liberation Mono", "Courier New", monospace;
        white-space: pre;
        margin: 0.8rem 0;
      }
      .editor-root img {
        max-width: 100%;
        display: block;
        margin: 1em 0;
        border-radius: 6px;
        box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.07);
      }
      .editor-root li > p:first-child {
        margin: 0;
      }
      .editor-root img.ProseMirror-separator {
        display: inline !important;
        border: none !important;
        margin: 0 !important;
        box-shadow: none !important;
      }
      .editor-root.ProseMirror-hideselection {
        caret-color: transparent;
      }
      .editor-root .ProseMirror-selectednode {
        outline: 2px solid color-mix(in srgb, var(--acid) 60%, transparent);
      }
      .editor-root .find-match {
        background: color-mix(in srgb, var(--acid) 32%, transparent);
        border-radius: 2px;
      }
    `}</style>
  );
}
