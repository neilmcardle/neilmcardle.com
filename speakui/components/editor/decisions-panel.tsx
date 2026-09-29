"use client";

import { Check, Copy, X } from "lucide-react";
import { useState } from "react";
import type { Source, Step } from "@/lib/engine/apply";
import { cn } from "@/lib/utils";
import { type DecisionEntry, useEditor } from "@/stores/editor";
import { formatUsd } from "./top-bar";

const SOURCE_STYLE: Record<Source, string> = {
  "Your words": "text-subtle",
  Jev: "bg-ochre/12 text-ochre-strong",
  Claude: "bg-ochre-strong text-paper",
  Parser: "border border-edge text-ink/70",
  Pointer: "border border-edge text-ink/70",
  Recent: "border border-edge text-ink/70",
  Code: "bg-ink/[0.06] text-ink/60",
};

const STATUS: Record<string, { label: string; className: string }> = {
  applied: { label: "Applied", className: "text-ink" },
  no_change: { label: "No change", className: "text-subtle" },
  error: { label: "Error", className: "text-destructive" },
  empty: { label: "Empty", className: "text-subtle" },
  preview: { label: "Deciding", className: "text-ochre" },
};

function sessionText(decisions: DecisionEntry[]): string {
  const lines: string[] = [];

  for (const d of [...decisions].reverse()) {
    lines.push(`> ${d.transcript}`);
    const outcome =
      d.error ?? (d.clauses.map((c) => c.summary).join(" · ") || "—");
    lines.push(`  ${STATUS[d.status]?.label ?? d.status}: ${outcome}`);
    for (const s of d.clauses.flatMap((c) => c.steps)) {
      const who =
        s.source === "Jev" && s.confidence !== undefined
          ? `Jev ${Math.round(s.confidence * 100)}%`
          : s.source;
      lines.push(
        `  · ${s.label}: ${s.value}${s.detail ? ` (${s.detail})` : ""} [${who}]`,
      );
    }
    if (d.meta)
      lines.push(
        `  ${d.meta.jevMs}ms · ${d.meta.questions} questions · $${d.meta.costUsd.toFixed(6)}`,
      );
    lines.push("");
  }
  return lines.join("\n").trim();
}

function CopySession() {
  const decisions = useEditor((s) => s.decisions);

  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const copied = state === "copied";

  if (decisions.length === 0) return <span className="ml-auto" />;
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard.writeText(sessionText(decisions)).then(
          () => setState("copied"),
          () => setState("failed"),
        );
        setTimeout(() => setState("idle"), 2200);
      }}
      className="ml-auto flex h-7 cursor-pointer items-center gap-1.5 rounded-full px-2.5 text-[11.5px] text-subtle hover:bg-ink/6 hover:text-ink"
      aria-label="Copy this session as text"
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {state === "copied"
        ? "Copied"
        : state === "failed"
          ? "Couldn't copy"
          : "Copy session"}
    </button>
  );
}

export function DecisionsPanel() {
  const decisions = useEditor((s) => s.decisions);
  const preview = useEditor((s) => s.preview);
  const usage = useEditor((s) => s.usage);
  const togglePanel = useEditor((s) => s.togglePanel);
  const [openId, setOpenId] = useState<string | null>(null);

  const avgMs = usage.calls ? Math.round(usage.totalMs / usage.calls) : 0;

  return (
    <aside className="flex w-[23rem] shrink-0 flex-col border-l border-hairline bg-paper">
      <div className="flex h-12 shrink-0 items-center gap-2.5 border-b border-hairline px-5">
        <h2 className="text-[13px] font-semibold tracking-[-0.01em] text-ink">
          Decisions
        </h2>
        <span className="flex items-center gap-1.5 text-[11px] text-subtle">
          <span
            className={cn(
              "size-1.5 rounded-full",
              preview ? "animate-pulse bg-ochre" : "bg-ink/35",
            )}
          />
          {preview ? "Deciding" : "Live"}
        </span>
        <CopySession />
        <button
          type="button"
          onClick={togglePanel}
          className="grid size-7 cursor-pointer place-items-center rounded-full text-subtle hover:bg-ink/6 hover:text-ink"
          aria-label="Close decisions"
        >
          <X className="size-3.5" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {preview && (
          <Entry
            entry={{ ...preview, id: "preview", at: 0, version: null }}
            open
            live
          />
        )}
        {decisions.length === 0 && !preview && (
          <div className="px-5 py-10 text-[13.5px] leading-relaxed text-subtle">
            Each request shows up here, broken into the steps that produced the
            change. The label on each step says whether{" "}
            <SourceTag source="Jev" /> decided it or plain code did (
            <SourceTag source="Parser" />, <SourceTag source="Pointer" />,{" "}
            <SourceTag source="Code" />
            ).
          </div>
        )}
        {decisions.map((d, i) => (
          <Entry
            key={d.id}
            entry={d}
            open={openId ? openId === d.id : i === 0 && !preview}
            onToggle={() => setOpenId(openId === d.id ? "__none" : d.id)}
          />
        ))}
      </div>

      <div className="grid shrink-0 grid-cols-3 border-t border-hairline font-mono text-[11px] tracking-normal tabular-nums">
        <Total label="Jev calls" value={String(usage.calls)} />
        <Total label="Avg time" value={usage.calls ? `${avgMs} ms` : "–"} />
        <Total label="Session cost" value={formatUsd(usage.costUsd)} />
      </div>
    </aside>
  );
}

function Entry({
  entry,
  open,
  live,
  onToggle,
}: {
  entry: DecisionEntry;
  open: boolean;
  live?: boolean;
  onToggle?: () => void;
}) {
  const status = live ? STATUS.preview : STATUS[entry.status];
  const steps: (Step & { clause?: number })[] = entry.clauses.flatMap((c, ci) =>
    c.steps.map((s) => ({ ...s, clause: ci })),
  );
  const multi = entry.clauses.length > 1;

  return (
    <div className={cn("border-b border-hairline", live && "bg-ochre/[0.04]")}>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full cursor-pointer items-start gap-3 px-5 py-3.5 text-left transition-colors hover:bg-ink/[0.03]"
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13.5px] font-medium tracking-[-0.01em] text-ink">
            {entry.transcript}
          </p>
          <p className="mt-0.5 truncate text-[12px] text-subtle">
            {entry.error ??
              (entry.clauses.map((c) => c.summary).join(" · ") || "—")}
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 pt-px text-[11px] font-medium",
            status.className,
          )}
        >
          {status.label}
          {entry.version !== null && !live ? ` · v${entry.version}` : ""}
        </span>
      </button>

      {open && steps.length > 0 && (
        <ol className="animate-rise space-y-3 px-5 pb-5">
          {steps.map((s, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-px flex size-5 shrink-0 items-center justify-center rounded-full border border-edge font-mono text-[9.5px] text-subtle tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-subtle">
                    {s.label}
                    {multi && s.label === "Read request"
                      ? ` ${(s.clause ?? 0) + 1}`
                      : ""}
                  </span>
                  <span className="ml-auto flex items-center gap-1.5">
                    {s.confidence !== undefined && (
                      <Confidence value={s.confidence} />
                    )}
                    <SourceTag source={s.source} />
                  </span>
                </div>
                <p className="mt-0.5 text-[13px] leading-snug break-words text-ink">
                  {s.value}
                </p>
                {s.detail && (
                  <p className="text-[11.5px] text-subtle">{s.detail}</p>
                )}
              </div>
            </li>
          ))}
          {entry.meta && (
            <li className="flex flex-wrap gap-x-3 gap-y-1 pt-1 pl-8 font-mono text-[10.5px] tracking-normal text-subtle tabular-nums">
              <span>Jev {entry.meta.jevMs} ms</span>
              <span>round trip {entry.meta.roundTripMs} ms</span>
              <span>{entry.meta.questions} questions</span>
              <span>{entry.meta.inputTokens.toLocaleString()} tokens</span>
              <span>{formatUsd(entry.meta.costUsd)}</span>
            </li>
          )}
        </ol>
      )}
    </div>
  );
}

function SourceTag({ source }: { source: Source }) {
  return (
    <span
      className={cn(
        "inline-block rounded-full px-2 py-px text-[10.5px] leading-4 font-medium",
        SOURCE_STYLE[source],
      )}
    >
      {source}
    </span>
  );
}

function Confidence({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  return (
    <span
      className="flex items-center gap-1 font-mono text-[10.5px] tracking-normal text-subtle tabular-nums"
      title={`Jev's probability for this choice: ${pct}%`}
    >
      <span className="relative h-1 w-8 overflow-hidden rounded-full bg-ink/10">
        <span
          className={cn(
            "absolute inset-y-0 left-0 rounded-full",
            value >= 0.7
              ? "bg-ink/70"
              : value >= 0.45
                ? "bg-ochre"
                : "bg-destructive",
          )}
          style={{ width: `${pct}%` }}
        />
      </span>
      {pct}%
    </span>
  );
}

function Total({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 border-r border-hairline px-4 py-3 whitespace-nowrap last:border-r-0">
      <div className="eyebrow text-[11px]">{label}</div>
      <div className="mt-1 text-ink/80">{value}</div>
    </div>
  );
}
