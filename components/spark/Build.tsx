"use client";

import { useState } from "react";
import { frameDoc, Sandbox } from "./Sandbox";
import { BUILDS } from "./builds";

export function Build({ id }: { id: string }) {
  const piece = BUILDS[id];
  const [shown, setShown] = useState(false);
  if (!piece) return null;

  const height = piece.height ?? 420;

  return (
    <section className="spark-sandbox my-10">
      <div className="mb-2.5 flex items-center gap-3">
        <span className="spark-eyebrow shrink-0 text-[var(--spark-phosphor)]">
          Finished piece
        </span>
        <span aria-hidden className="h-px flex-1 bg-[var(--spark-rule)]" />
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--spark-rule)] bg-[var(--spark-ink)]">
        <div className="flex items-center justify-between border-b border-[var(--spark-rule)] px-3 py-1.5">
          <span className="spark-eyebrow text-[var(--spark-faint)]">
            {piece.title}
          </span>
          <span className="spark-eyebrow text-[var(--spark-faint)]">
            what you are aiming for
          </span>
        </div>
        <iframe
          title={piece.title}
          srcDoc={frameDoc(piece.html, piece.css, piece.js)}
          sandbox="allow-scripts"
          className="w-full border-0 bg-white"
          style={{ height }}
        />
      </div>

      {piece.checks.length > 0 && (
        <div className="mt-4 rounded-lg border border-[var(--spark-rule)] bg-[var(--spark-sheet)] px-5 py-4">
          <p className="spark-eyebrow mb-3 text-[var(--spark-faint)]">
            Check yours against this
          </p>
          <ul className="grid gap-2">
            {piece.checks.map((check) => (
              <li
                key={check}
                className="grid grid-cols-[14px_minmax(0,1fr)] gap-3 text-[14.5px] leading-[1.55] text-[var(--spark-text)]"
              >
                <span
                  aria-hidden
                  className="mt-[7px] h-[5px] w-[5px] rounded-full bg-[var(--spark-phosphor)]"
                />
                {check}
              </li>
            ))}
          </ul>
        </div>
      )}

      {shown ? (
        <>
          <p className="mt-6 text-[14.5px] leading-[1.6] text-[var(--spark-muted)]">
            {piece.note ??
              "One way to write it, not the only way. Compare the decisions rather than the characters."}
          </p>
          <Sandbox
            title="My version, editable"
            html={piece.html}
            css={piece.css}
            js={piece.js}
            height={height}
          />
        </>
      ) : (
        <button
          type="button"
          className="spark-action mt-4"
          onClick={() => setShown(true)}
        >
          Build yours first, then show mine
        </button>
      )}
    </section>
  );
}
