"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { evaluate, type EvalResult } from "@/lib/engine/evaluate";
import { looksUnfinished } from "@/lib/engine/parse";
import { Mic } from "@/lib/voice/voice";
import { selectTarget, useEditor } from "@/stores/editor";
import { useBuilds } from "@/stores/builds";
import { useVoice } from "@/stores/voice";
import { Canvas } from "./canvas";
import { Composer, type MicState } from "./composer";
import { DecisionsPanel } from "./decisions-panel";
import { BuildsPanel } from "./builds-panel";
import { TopBar } from "./top-bar";

async function evaluateNow(
  text: string,
  signal?: AbortSignal,
  preview = false,
): Promise<{ result: EvalResult; version: number }> {
  const s = useEditor.getState();
  const version = s.version;
  const result = await evaluate(
    text,
    s.committed,
    {
      pointer: s.pointerMode ? selectTarget(s) : null,
      lastAddedId: s.lastAddedId,
    },
    signal,
    {
      allowDraft: !preview,
    },
  );
  s.recordUsage(result.meta);
  return { result, version };
}

const isAbort = (err: unknown) => (err as Error)?.name === "AbortError";

export function Editor() {
  const panelOpen = useEditor((s) => s.panelOpen);
  const buildsOpen = useBuilds((s) => s.open);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mic, setMic] = useState<MicState>({ status: "off", level: 0 });
  const voicePhase = useVoice((s) => s.phase);

  useEffect(() => {
    void useVoice.getState().bootstrap();
  }, []);

  useEffect(() => {
    if (voicePhase !== "downloading") return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [voicePhase]);
  const inputRef = useRef<HTMLInputElement>(null);

  const micRef = useRef<Mic | null>(null);
  const live = useRef({
    finalizing: false,
    inflight: null as AbortController | null,

    inflightText: null as string | null,
    inflightPromise: null as Promise<{
      result: EvalResult;
      version: number;
    }> | null,
    queued: null as string | null,
    last: null as { text: string; result: EvalResult; version: number } | null,

    held: "",
  });
  const [holding, setHolding] = useState(false);
  const join = (a: string, b: string) =>
    [a.trim(), b.trim()].filter(Boolean).join(" ");

  const submit = useCallback(async (text: string) => {
    const t = text.trim();
    if (!t) return;
    live.current.held = "";
    setHolding(false);
    setBusy(true);
    setError(null);
    try {
      const first = await evaluateNow(t);

      const result =
        first.version === useEditor.getState().version
          ? first.result
          : (await evaluateNow(t)).result;
      useEditor.getState().commit(result);
      if (result.status === "error")
        setError(result.error ?? "Something went wrong.");
      else setDraft("");
    } finally {
      setBusy(false);
    }
  }, []);

  const runPreview = useCallback(async (text: string) => {
    const l = live.current;
    if (l.finalizing || !useEditor.getState().livePreview) return;
    if (text.split(/\s+/).length < 2) return;
    if (l.inflight) {
      l.queued = text;
      return;
    }

    let current: string | null = text;
    while (current && !l.finalizing) {
      const ac = new AbortController();
      l.inflight = ac;
      l.inflightText = current;
      const pending = evaluateNow(current, ac.signal, true);
      l.inflightPromise = pending;
      try {
        const { result, version } = await pending;
        if (l.finalizing || ac.signal.aborted) break;
        l.last = { text: current, result, version };
        useEditor
          .getState()
          .setPreview(
            result.status === "applied" || result.clauses.length
              ? result
              : null,
          );
      } catch (err) {
        if (!isAbort(err)) console.error(err);
        break;
      } finally {
        if (l.inflight === ac) {
          l.inflight = null;
          l.inflightText = null;
          l.inflightPromise = null;
        }
      }
      const next: string | null = l.queued;
      l.queued = null;
      current = next && next !== current ? next : null;
    }
  }, []);

  const onFinal = useCallback(async (spoken: string) => {
    const l = live.current;
    const text = join(l.held, spoken);

    if (looksUnfinished(text)) {
      l.held = text;
      setHolding(true);
      setDraft(text);
      useEditor.getState().setPreview(null);
      return;
    }
    l.held = "";
    setHolding(false);
    l.finalizing = true;
    l.queued = null;
    setDraft(text);
    try {
      const store = useEditor.getState();

      const usable = (r: EvalResult, version: number) =>
        version === store.version && !r.deferredCompose && !r.deferred;

      let result: EvalResult | null = null;

      if (
        l.last &&
        l.last.text === text &&
        usable(l.last.result, l.last.version)
      ) {
        l.inflight?.abort();
        result = l.last.result;
      } else if (l.inflightText === text && l.inflightPromise) {
        try {
          const pending = await l.inflightPromise;
          if (usable(pending.result, pending.version)) result = pending.result;
        } catch (err) {
          if (!isAbort(err)) console.error(err);
        }
      }

      if (!result) {
        if (l.inflight) {
          l.inflight.abort();
          l.inflight = null;
        }
        ({ result } = await evaluateNow(text));
      }
      useEditor.getState().commit(result);
      if (result.status === "error")
        setError(result.error ?? "Something went wrong.");
    } catch (err) {
      if (!isAbort(err)) console.error(err);
    } finally {
      l.last = null;
      l.inflightText = null;
      l.inflightPromise = null;
      l.finalizing = false;
      useEditor.getState().setPreview(null);
    }
  }, []);

  const toggleMic = useCallback(async () => {
    if (micRef.current) {
      micRef.current.stop();
      micRef.current = null;
      return;
    }

    if (useVoice.getState().phase !== "ready") {
      useVoice.getState().openSetup();
      return;
    }
    const m = new Mic({
      onStatus: (status) => setMic((s) => ({ ...s, status })),
      onProblem: (message) => {
        setError(message);

        useVoice.getState().retestMic();
      },
      onLevel: (level) =>
        setMic((s) => (Math.abs(s.level - level) > 0.02 ? { ...s, level } : s)),
      onPartial: (text) => {
        const full = join(live.current.held, text);
        setDraft(full);
        void runPreview(full);
      },
      onFinal: (text) => void onFinal(text),
    });
    micRef.current = m;
    setError(null);
    try {
      await m.start();
    } catch (err) {
      m.stop();
      micRef.current = null;
      const msg = String((err as Error)?.message ?? err);
      const friendly = /Permission|NotAllowed/i.test(
        msg + String((err as Error)?.name),
      )
        ? "Microphone access was blocked. Allow it from the icon at the left of the address bar."
        : `The microphone couldn't start: ${msg}`;
      setMic({ status: "error", level: 0 });
      setError(friendly);
    }
  }, [onFinal, runPreview]);

  useEffect(() => () => micRef.current?.stop(), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = useEditor.getState();
      const typing =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement;
      const mod = e.metaKey || e.ctrlKey;

      if (e.key === "Escape") {
        if (typing) (e.target as HTMLElement).blur();
        s.clearTarget();
        return;
      }
      if (mod && e.key.toLowerCase() === "z" && !typing) {
        e.preventDefault();
        if (e.shiftKey) s.redo();
        else s.undo();
        return;
      }
      if (typing || mod || e.altKey) return;
      const k = e.key.toLowerCase();
      if (k === "p") s.togglePointer();
      else if (k === "l") s.toggleLock();
      else if (k === "d") s.togglePanel();
      else if (k === "m") void toggleMic();
      else if (k === "/" || k === "enter") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleMic]);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <TopBar />
      <div className="flex min-h-0 flex-1">
        {buildsOpen && <BuildsPanel />}
        <main className="relative flex min-w-0 flex-1 flex-col">
          <Canvas />
          <Composer
            ref={inputRef}
            draft={draft}
            onDraft={(v) => {
              setDraft(v);
              if (holding) {
                live.current.held = "";
                setHolding(false);
              }
            }}
            holding={holding}
            onSubmit={() => void submit(draft)}
            busy={busy}
            error={error}
            onDismissError={() => setError(null)}
            mic={mic}
            onToggleMic={() => void toggleMic()}
          />
        </main>
        {panelOpen && <DecisionsPanel />}
      </div>
    </div>
  );
}
