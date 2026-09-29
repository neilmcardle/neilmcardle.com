"use client";

import {
  Code2,
  Layers,
  MousePointer2,
  PanelRight,
  Plus,
  Redo2,
  Undo2,
} from "lucide-react";
import { useState } from "react";
import { toJsx } from "@/lib/design/export";
import { cn } from "@/lib/utils";
import { useBuilds } from "@/stores/builds";
import { useEditor } from "@/stores/editor";

export function formatUsd(n: number): string {
  if (n === 0) return "$0";
  if (n < 0.01) return `$${n.toFixed(6)}`;
  return `$${n.toFixed(4)}`;
}

export function TopBar() {
  const pointerMode = useEditor((s) => s.pointerMode);
  const panelOpen = useEditor((s) => s.panelOpen);
  const canUndo = useEditor((s) => s.past.length > 0);
  const canRedo = useEditor((s) => s.future.length > 0);
  const lastMeta = useEditor((s) => s.lastMeta);
  const usage = useEditor((s) => s.usage);
  const { togglePointer, togglePanel, undo, redo, reset } =
    useEditor.getState();
  const [copied, setCopied] = useState(false);
  const buildsOpen = useBuilds((s) => s.open);
  const toggleBuilds = useBuilds((s) => s.togglePanel);

  const exportJsx = async () => {
    try {
      await navigator.clipboard.writeText(
        toJsx(useEditor.getState().committed),
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked; nothing to do */
    }
  };

  return (
    <header className="flex h-[52px] shrink-0 items-center gap-1.5 border-b border-hairline bg-paper px-4">
      <span className="mr-4 pl-1 text-[15px] leading-none font-semibold tracking-[-0.03em] text-ink">
        speakUI
      </span>

      <Divider />
      <ToolButton
        active={pointerMode}
        onClick={togglePointer}
        label="Pointer"
        shortcut="P"
      >
        <MousePointer2 />
      </ToolButton>
      <Divider />
      <ToolButton onClick={undo} disabled={!canUndo} label="Undo" shortcut="⌘Z">
        <Undo2 />
      </ToolButton>
      <ToolButton
        onClick={redo}
        disabled={!canRedo}
        label="Redo"
        shortcut="⇧⌘Z"
      >
        <Redo2 />
      </ToolButton>
      <ToolButton onClick={() => reset()} label="New">
        <Plus />
      </ToolButton>
      <ToolButton
        active={buildsOpen}
        onClick={toggleBuilds}
        label="Builds"
        shortcut="B"
      >
        <Layers />
      </ToolButton>
      <ToolButton onClick={exportJsx} label={copied ? "Copied JSX" : "Export"}>
        <Code2 />
      </ToolButton>

      <div className="ml-auto flex min-w-0 items-center gap-3 overflow-hidden pl-3 font-mono text-[11px] tracking-normal whitespace-nowrap text-subtle tabular-nums">
        {lastMeta ? (
          <>
            <Stat title="Time Jev took for the last call">
              {lastMeta.jevMs} ms
            </Stat>
            <Stat title="Questions answered in that one call">
              {lastMeta.questions} questions
            </Stat>
            <Stat
              title={`${lastMeta.inputTokens.toLocaleString()} input tokens at $0.042 per million`}
            >
              {formatUsd(lastMeta.costUsd)}
            </Stat>
            <span className="hidden text-subtle/70 2xl:inline">
              {lastMeta.model}
            </span>
            <span className="hidden h-3.5 w-px bg-hairline xl:inline" />
            <span className="hidden xl:inline">
              <Stat title="All Jev calls this session, including live previews">
                {usage.calls} calls · {formatUsd(usage.costUsd)}
              </Stat>
            </span>
          </>
        ) : (
          <span className="text-subtle/70">No Jev calls yet</span>
        )}
      </div>

      <Divider />
      <ToolButton
        active={panelOpen}
        onClick={togglePanel}
        label="Decisions"
        shortcut="D"
      >
        <PanelRight />
      </ToolButton>
    </header>
  );
}

function ToolButton({
  children,
  label,
  shortcut,
  active,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  shortcut?: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={shortcut ? `${label} (${shortcut})` : label}
      aria-pressed={active}
      className={cn(
        "pill [&_svg]:size-3.5",
        active === undefined && "pill-ghost",
      )}
    >
      {children}
      <span className="hidden lg:inline">{label}</span>
    </button>
  );
}

function Divider() {
  return <span className="mx-1.5 h-4 w-px bg-hairline" aria-hidden />;
}

function Stat({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <span title={title} className="cursor-default">
      {children}
    </span>
  );
}
