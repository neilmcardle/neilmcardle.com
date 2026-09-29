"use client";

import {
  CornerDownLeft,
  Keyboard,
  Lock,
  LockOpen,
  Mic,
  MousePointer2,
  Square,
  X,
} from "lucide-react";
import { forwardRef } from "react";
import {
  SECTION_NAMES,
  capitalise,
  describeElement,
} from "@/lib/design/catalog";
import { findElement } from "@/lib/design/ops";
import type { MicStatus } from "@/lib/voice/voice";
import { cn } from "@/lib/utils";
import { selectTarget, useEditor } from "@/stores/editor";
import { useVoice } from "@/stores/voice";
import { LevelBars } from "./voice-setup";

export type MicState = { status: MicStatus; level: number };

type Props = {
  draft: string;
  onDraft: (s: string) => void;
  onSubmit: () => void;
  busy: boolean;
  error: string | null;
  onDismissError: () => void;
  mic: MicState;
  onToggleMic: () => void;

  holding?: boolean;
};

export const Composer = forwardRef<HTMLInputElement, Props>(function Composer(
  {
    draft,
    onDraft,
    onSubmit,
    busy,
    error,
    onDismissError,
    mic,
    onToggleMic,
    holding,
  },
  ref,
) {
  const target = useEditor(selectTarget);
  const locked = useEditor((s) => s.locked);
  const committed = useEditor((s) => s.committed);
  const pointerMode = useEditor((s) => s.pointerMode);
  const livePreview = useEditor((s) => s.livePreview);
  const { toggleLock, clearTarget, toggleLivePreview } = useEditor.getState();

  const micOn = mic.status !== "off" && mic.status !== "error";
  const demoLimit = useEditor((s) => s.demoLimit);
  const targetEl =
    target?.type === "element" ? findElement(committed, target.id) : null;
  const targetLabel =
    target?.type === "card"
      ? `${committed.name} (card)`
      : targetEl
        ? describeElement(targetEl)
        : null;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center px-6">
      <div className="pointer-events-auto w-full max-w-[38rem] space-y-2">
        {demoLimit && (
          <div className="flex items-start gap-2.5 border-b border-hairline px-4 py-3 text-[13px] leading-snug text-ink">
            <span className="flex-1">
              {demoLimit}{" "}
              <a
                href="https://x.com/BetterNeil"
                target="_blank"
                rel="noreferrer"
                className="underline decoration-ochre/50 underline-offset-2 hover:decoration-ochre"
              >
                See how it works
              </a>
              .
            </span>
          </div>
        )}
        {error && !demoLimit && (
          <div
            role="alert"
            className="glass-sheet flex animate-rise items-start gap-2 rounded-[17px] px-4 py-3 text-[13px] text-destructive"
          >
            <span className="flex-1 leading-snug">{error}</span>
            <button
              type="button"
              onClick={onDismissError}
              className="cursor-pointer rounded-full p-0.5 text-destructive/70 hover:text-destructive"
              aria-label="Dismiss"
            >
              <X className="size-3.5" />
            </button>
          </div>
        )}

        {pointerMode && targetLabel && (
          <div className="flex animate-rise items-center gap-2.5 rounded-full bg-ink py-1.5 pr-1.5 pl-3.5 text-[12px] text-paper shadow-[0_8px_24px_rgb(20_18_14/0.2)]">
            <MousePointer2 className="size-3 shrink-0 opacity-70" />
            <span className="truncate font-medium">{targetLabel}</span>
            {targetEl && (
              <span className="shrink-0 opacity-55">
                {capitalise(SECTION_NAMES[targetEl.section])}
              </span>
            )}
            <button
              type="button"
              onClick={toggleLock}
              className="ml-auto flex h-6 shrink-0 cursor-pointer items-center gap-1 rounded-full px-2.5 text-paper/80 hover:bg-paper/12 hover:text-paper"
              title="Lock target (L). Or click an element to lock it."
            >
              {locked ? (
                <Lock className="size-3" />
              ) : (
                <LockOpen className="size-3" />
              )}
              {locked ? "Locked" : "Lock target"}
            </button>
            <button
              type="button"
              onClick={clearTarget}
              className="grid size-6 shrink-0 cursor-pointer place-items-center rounded-full text-paper/60 hover:bg-paper/12 hover:text-paper"
              aria-label="Clear target (Esc)"
            >
              <X className="size-3" />
            </button>
          </div>
        )}

        <div
          className={cn(
            "glass-dock rounded-[22px] transition-shadow",
            micOn &&
              "shadow-[0_0_0_1px_rgb(134_98_27/0.35),0_16px_40px_rgb(20_18_14/0.12)]",
          )}
        >
          <div className="flex items-center gap-2 border-b border-hairline px-2.5 py-2">
            <div className="seg" role="group" aria-label="Input mode">
              <ModeButton
                active={!micOn}
                onClick={() => micOn && onToggleMic()}
                icon={<Keyboard />}
                label="Typing"
              />
              <ModeButton
                active={micOn}
                onClick={() => !micOn && onToggleMic()}
                icon={<Mic />}
                label="Microphone"
              />
            </div>
            <label
              className="ml-1 flex cursor-pointer items-center gap-1.5 text-[12px] text-subtle select-none"
              title="Evaluate while you're still talking. Costs extra Jev calls."
            >
              <input
                type="checkbox"
                checked={livePreview}
                onChange={toggleLivePreview}
                className="size-3 accent-[var(--ink)]"
              />
              Live preview
            </label>
            <div className="ml-auto flex items-center gap-2 pr-1">
              {holding && micOn ? (
                <span
                  className="text-[11.5px] text-ochre"
                  title="That sounded unfinished, so it's waiting for the rest. Press Apply to use it as it is."
                >
                  Waiting for the rest…
                </span>
              ) : (
                <VoiceIndicator mic={mic} />
              )}
              {micOn && (
                <button
                  type="button"
                  onClick={onToggleMic}
                  className="pill h-6 gap-1.5 px-2.5 text-[11.5px]"
                >
                  <Square className="size-2 fill-current" />
                  Stop
                </button>
              )}
            </div>
          </div>

          <form
            className="flex items-center gap-2 py-2 pr-2 pl-4"
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit();
            }}
          >
            <input
              ref={ref}
              value={draft}
              onChange={(e) => onDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  onSubmit();
                }
              }}
              disabled={!!demoLimit}
              placeholder={
                demoLimit
                  ? "Demo limit reached"
                  : micOn
                    ? "Speak a change. Pause to apply."
                    : targetLabel
                      ? `Say what to change about the ${targetEl ? describeElement(targetEl) : "card"}…`
                      : "Type a change, e.g. “add an email field”"
              }
              className="h-10 min-w-0 flex-1 bg-transparent text-[15px] tracking-[-0.01em] text-ink outline-none placeholder:text-subtle/70"
              aria-label="Instruction"
              autoComplete="off"
              spellCheck={false}
            />
            <button
              type="submit"
              disabled={!draft.trim() || busy || !!demoLimit}
              className="pill pill-ink h-9 px-4 text-[12.5px]"
            >
              {busy ? "Deciding…" : "Apply"}
              {!busy && <CornerDownLeft className="size-3 opacity-60" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
});

function ModeButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="seg-item [&_svg]:size-3.5"
    >
      {icon}
      {label}
    </button>
  );
}

function VoiceIndicator({ mic }: { mic: MicState }) {
  const phase = useVoice((s) => s.phase);
  const progress = useVoice((s) => s.progress);
  const openSetup = useVoice((s) => s.openSetup);
  const link =
    "cursor-pointer text-[11.5px] underline-offset-2 hover:underline";

  if (phase === "checking") return null;
  if (phase === "not_set_up" || phase === "error") {
    return (
      <button
        type="button"
        onClick={openSetup}
        className={cn(
          link,
          phase === "error" ? "text-destructive" : "text-subtle",
        )}
      >
        {phase === "error"
          ? "Voice setup failed · Retry"
          : "Voice not set up · Set up"}
      </button>
    );
  }
  if (phase === "downloading") {
    const pct = progress
      ? Math.round((progress.loaded / progress.total) * 100)
      : 0;
    return (
      <button
        type="button"
        onClick={openSetup}
        className="flex cursor-pointer items-center gap-2 font-mono text-[11px] text-subtle tabular-nums"
        title="Voice model download. Click for details."
      >
        <span className="relative h-1 w-16 overflow-hidden rounded-full bg-ink/10">
          <span
            className="absolute inset-y-0 left-0 rounded-full bg-ochre transition-[width]"
            style={{ width: `${pct}%` }}
          />
        </span>
        <span className="font-sans">Voice {pct}%</span>
      </button>
    );
  }
  if (phase === "preparing")
    return (
      <span className="text-[11.5px] text-subtle">Getting voice ready…</span>
    );

  if (mic.status === "off")
    return (
      <span className="text-[11.5px] text-subtle/70">Mic off · M to start</span>
    );
  if (mic.status === "error")
    return (
      <span className="text-[11.5px] text-destructive">Mic unavailable</span>
    );
  if (mic.status === "starting")
    return <span className="text-[11.5px] text-subtle">Starting mic…</span>;
  return (
    <span className="flex items-center gap-2">
      <LevelBars level={mic.level} active={mic.status === "hearing"} />
      <span
        className={cn(
          "font-mono text-[11px]",
          mic.status === "hearing" ? "text-ochre" : "text-subtle",
        )}
      >
        {mic.status === "hearing" ? "Hearing you" : "Listening"}
      </span>
    </span>
  );
}
