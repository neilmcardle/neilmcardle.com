"use client";

import { Layers, Trash2, X } from "lucide-react";
import { formatUsd } from "./top-bar";
import { cn } from "@/lib/utils";
import { useBuilds } from "@/stores/builds";
import { useEditor } from "@/stores/editor";

function ago(at: number): string {
  const s = Math.max(0, Math.round((Date.now() - at) / 1000));
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

export function BuildsPanel() {
  const builds = useBuilds((s) => s.builds);
  const remove = useBuilds((s) => s.remove);
  const closePanel = useBuilds((s) => s.closePanel);
  const loadBuild = useEditor((s) => s.loadBuild);
  const buildId = useEditor((s) => s.buildId);

  return (
    <aside className="flex w-[19rem] shrink-0 flex-col border-r border-hairline bg-paper">
      <div className="flex h-12 shrink-0 items-center gap-2.5 border-b border-hairline px-5">
        <h2 className="text-[13px] font-semibold tracking-[-0.01em] text-ink">
          Builds
        </h2>
        <span className="text-[11px] text-subtle">{builds.length || ""}</span>
        <button
          type="button"
          onClick={closePanel}
          className="ml-auto grid size-7 cursor-pointer place-items-center rounded-full text-subtle hover:bg-ink/6 hover:text-ink"
          aria-label="Close builds"
        >
          <X className="size-3.5" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {builds.length === 0 ? (
          <div className="px-5 py-10 text-[13.5px] leading-relaxed text-subtle">
            Anything you build is kept here on its own, with the instructions
            that made it. The canvas starts empty each time, so nothing you
            speak into existence gets in the way of the next thing.
          </div>
        ) : (
          <ul>
            {builds.map((b) => (
              <li
                key={b.id}
                className={cn(
                  "group border-b border-hairline",
                  b.id === buildId && "bg-ochre/[0.06]",
                )}
              >
                <div className="flex items-start gap-2 px-5 py-3.5">
                  <button
                    type="button"
                    onClick={() => loadBuild(b.id)}
                    className="min-w-0 flex-1 cursor-pointer text-left"
                  >
                    <p className="truncate text-[13.5px] font-medium tracking-[-0.01em] text-ink">
                      {b.name}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-[11.5px] text-subtle">
                      <Layers className="size-3" />
                      {b.design.elements.length}{" "}
                      {b.design.elements.length === 1 ? "part" : "parts"}
                      <span className="text-subtle/50">·</span>
                      {b.mode === "hero" ? "Hero" : "Card"}
                      <span className="text-subtle/50">·</span>
                      {ago(b.at)}
                    </p>
                    <p className="mt-0.5 font-mono text-[10.5px] tracking-normal text-subtle/80 tabular-nums">
                      {b.decisions.length}{" "}
                      {b.decisions.length === 1
                        ? "instruction"
                        : "instructions"}{" "}
                      · {formatUsd(b.costUsd)}
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(b.id)}
                    className="grid size-7 shrink-0 cursor-pointer place-items-center rounded-full text-subtle opacity-0 transition-opacity group-hover:opacity-100 hover:bg-ink/6 hover:text-destructive"
                    aria-label={`Delete ${b.name}`}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
