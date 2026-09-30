"use client";

import {
  Check,
  Cpu,
  Download,
  Mic,
  SearchCheck,
  ShieldCheck,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { checkAllInputs, type InputCheck } from "@/lib/voice/devices";
import { downloadBytes } from "@/lib/voice/model";
import { Mic as MicCapture, type MicStatus } from "@/lib/voice/voice";
import { cn } from "@/lib/utils";
import { useVoice } from "@/stores/voice";

const mb = (bytes: number) => Math.round(bytes / 1e6).toLocaleString();
const gbOrMb = (bytes: number) =>
  bytes >= 1e9 ? `${(bytes / 1e9).toFixed(2)} GB` : `${mb(bytes)} MB`;

function eta(seconds: number): string {
  if (!isFinite(seconds) || seconds <= 0) return "";
  if (seconds < 60)
    return `about ${Math.max(5, Math.round(seconds / 5) * 5)}s left`;
  return `about ${Math.round(seconds / 60)} min left`;
}

export function VoiceSetup({ floating }: { floating?: boolean }) {
  const phase = useVoice((s) => s.phase);
  const soundTestDone = useVoice((s) => s.soundTestDone);

  let body: React.ReactNode;
  if (phase === "checking") body = <Checking />;
  else if (phase === "not_set_up" || phase === "error") body = <Intro />;
  else if (phase === "downloading") body = <Downloading />;
  else if (phase === "preparing") body = <Preparing />;
  else if (!soundTestDone) body = <SoundTest />;
  else body = <Done />;

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={cn(
        "glass-sheet relative w-[29rem] max-w-full animate-rise cursor-default rounded-[24px] p-7 text-left",
        floating &&
          "shadow-[inset_0_1px_0_rgb(255_255_255/0.6),0_32px_80px_rgb(20_18_14/0.2)]",
      )}
    >
      <CloseButton />
      {body}
    </div>
  );
}

function CloseButton() {
  const phase = useVoice((s) => s.phase);
  const { closeSetup, dismiss } = useVoice.getState();

  const onClose = phase === "not_set_up" ? dismiss : closeSetup;
  return (
    <button
      type="button"
      onClick={onClose}
      className="absolute top-5 right-5 grid size-7 cursor-pointer place-items-center rounded-full text-subtle hover:bg-ink/6 hover:text-ink"
      aria-label="Close"
    >
      <X className="size-4" />
    </button>
  );
}

function Header({
  step,
  title,
  children,
}: {
  step?: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="space-y-2 pr-8">
      {step && <p className="eyebrow">{step}</p>}
      <h2 className="text-[20px] leading-[1.2] font-medium tracking-[-0.02em] text-ink">
        {title}
      </h2>
      {children && (
        <p className="text-[14px] leading-relaxed text-subtle">{children}</p>
      )}
    </div>
  );
}

function Checking() {
  const [stuck, setStuck] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setStuck(true), 8000);
    return () => clearTimeout(t);
  }, []);

  if (!stuck) return <Header title="Checking this browser…" />;
  return (
    <div className="space-y-5">
      <Header title="This is taking longer than it should">
        The browser hasn&apos;t answered whether the voice model is already
        downloaded. You can carry on: nothing already downloaded is lost, and
        setup will reuse it.
      </Header>
      <button
        type="button"
        onClick={() => useVoice.setState({ phase: "not_set_up" })}
        className="pill pill-ink h-9 px-4 text-[13px]"
      >
        Continue
      </button>
    </div>
  );
}

function Intro() {
  const browser = useVoice((s) => s.browser);
  const backend = useVoice((s) => s.backend);
  const phase = useVoice((s) => s.phase);
  const error = useVoice((s) => s.error);
  const { download, dismiss } = useVoice.getState();
  const gpu = backend === "webgpu-hybrid";
  const size = downloadBytes(backend);
  const slowBrowser = !gpu && (browser === "firefox" || browser === "safari");

  return (
    <div className="space-y-5">
      <Header step="Step 1 of 2 · Voice" title="Set up voice for this browser">
        SpeakUI turns your speech into text on this computer. To do that, this
        browser needs a speech model. It&apos;s a one-time download.
      </Header>

      <ul className="space-y-2.5 text-[13px]">
        <Fact icon={<Download />}>
          <strong className="font-medium">{gbOrMb(size)}</strong> one-time
          download, kept in this browser
        </Fact>
        <Fact icon={gpu ? <Zap /> : <Cpu />}>
          {gpu ? (
            <>
              <strong className="font-medium">GPU mode</strong>: replies in well
              under a second
            </>
          ) : (
            <>
              <strong className="font-medium">CPU mode</strong>: this browser
              can&apos;t use the GPU for speech, so expect 1–3s after you stop
              talking
            </>
          )}
        </Fact>
        <Fact icon={<ShieldCheck />}>
          Your voice never leaves this computer. Only the text of each
          instruction is sent to Jev.
        </Fact>
      </ul>

      {slowBrowser && (
        <p className="rounded-[12px] bg-ochre/8 px-3.5 py-3 text-[12.5px] leading-relaxed text-ochre-strong">
          {browser === "firefox" ? "Firefox" : "Safari"} on this computer runs
          speech on the CPU. Chrome is noticeably faster. Each browser keeps its
          own copy, so switching later means downloading again.
        </p>
      )}

      {phase === "error" && (
        <div className="space-y-2 rounded-[12px] bg-destructive/8 px-3 py-2.5 text-[12.5px] text-destructive">
          <p>Setup didn&apos;t finish: {error}</p>
          {gpu && (
            <button
              type="button"
              onClick={() => void download("wasm")}
              className="cursor-pointer font-medium underline underline-offset-2"
            >
              Try CPU mode instead ({gbOrMb(downloadBytes("wasm"))} download)
            </button>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => void download()}
          className="pill pill-ink h-9 px-4 text-[13px]"
        >
          <Download className="size-3.5" />
          {phase === "error"
            ? "Try again"
            : `Download voice model (${gbOrMb(size)})`}
        </button>
        <button
          type="button"
          onClick={dismiss}
          className="pill pill-ghost h-9 px-3.5 text-[13px] text-subtle"
        >
          Just type for now
        </button>
      </div>
      <p className="text-[12px] text-subtle">
        Keep this tab open while it downloads. You can type instructions in the
        meantime.
      </p>
    </div>
  );
}

function Fact({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-2.5">
      <span className="mt-px text-subtle [&_svg]:size-4">{icon}</span>
      <span className="leading-snug text-ink/85">{children}</span>
    </li>
  );
}

function Downloading() {
  const progress = useVoice((s) => s.progress);
  const closeSetup = useVoice((s) => s.closeSetup);
  const loaded = progress?.loaded ?? 0;
  const total = progress?.total ?? 1;
  const pct = Math.min(100, (loaded / total) * 100);
  const bps = progress?.bytesPerSec ?? 0;

  return (
    <div className="space-y-5">
      <Header step="Step 1 of 2 · Voice" title="Downloading the speech model">
        This is a one-time download into this browser. You can close this card
        and start typing; it keeps going in the background.
      </Header>
      <div className="space-y-2">
        <div className="relative h-1.5 overflow-hidden rounded-full bg-ink/8">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-ochre transition-[width] duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between font-mono text-[11.5px] text-subtle tabular-nums">
          <span>
            {mb(loaded)} / {mb(total)} MB
          </span>
          <span>
            {bps > 0
              ? `${(bps / 1e6).toFixed(1)} MB/s · ${eta((total - loaded) / bps)}`
              : "Starting…"}
          </span>
        </div>
      </div>
      <p className="text-[12px] text-subtle">
        Reloading or closing this tab restarts the download.
      </p>
      <button
        type="button"
        onClick={closeSetup}
        className="pill h-9 px-4 text-[13px]"
      >
        Keep going in the background
      </button>
    </div>
  );
}

function Preparing() {
  return (
    <div className="space-y-4">
      <Header step="Step 1 of 2 · Voice" title="Getting voice ready…">
        The model is on this computer now. It&apos;s warming up, which takes a
        few seconds the first time.
      </Header>
      <div className="relative h-1.5 overflow-hidden rounded-full bg-ink/8">
        <div className="absolute inset-y-0 w-1/3 animate-[slide_1.1s_ease-in-out_infinite] rounded-full bg-ochre/70" />
      </div>
    </div>
  );
}

type TestState = {
  status: MicStatus | "denied" | "idle";
  level: number;
  peak: number;
  heard: string | null;
  startedAt: number;
  problem: string | null;
};

function SoundTest() {
  const finish = useVoice((s) => s.finishSoundTest);
  const [t, setT] = useState<TestState>({
    status: "idle",
    level: 0,
    peak: 0,
    heard: null,
    startedAt: 0,
    problem: null,
  });
  const [now, setNow] = useState(0);
  const micRef = useRef<MicCapture | null>(null);

  const start = async () => {
    micRef.current?.stop();
    const mic = new MicCapture({
      onStatus: (status) => setT((s) => ({ ...s, status })),
      onProblem: (problem) => setT((s) => ({ ...s, problem })),
      onLevel: (level) =>
        setT((s) =>
          Math.abs(s.level - level) > 0.02 || level > s.peak
            ? { ...s, level, peak: Math.max(s.peak, level) }
            : s,
        ),
      onPartial: () => {},
      onFinal: (text) => setT((s) => ({ ...s, heard: text })),
    });
    mic.partials = false;
    micRef.current = mic;
    setT({
      status: "starting",
      level: 0,
      peak: 0,
      heard: null,
      startedAt: Date.now(),
      problem: null,
    });
    try {
      await mic.start();
    } catch (err) {
      mic.stop();
      micRef.current = null;
      const denied = /Permission|NotAllowed/i.test(
        String((err as Error)?.name ?? "") +
          String((err as Error)?.message ?? ""),
      );
      setT((s) => ({ ...s, status: denied ? "denied" : "error" }));
    }
  };

  useEffect(() => () => micRef.current?.stop(), []);

  const listening = t.status === "listening" || t.status === "hearing";
  useEffect(() => {
    if (!listening || t.heard) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [listening, t.heard]);

  const done = () => {
    micRef.current?.stop();
    finish();
  };

  const quietTooLong =
    listening && !t.heard && t.status !== "hearing" && now - t.startedAt > 8000;

  return (
    <div className="space-y-5">
      <Header
        step="Step 2 of 2 · Microphone"
        title={t.heard ? "Here's what it heard" : "Check your microphone"}
      >
        {t.status === "idle"
          ? "Allow microphone access, then say anything, like “add a button that says continue”."
          : t.heard
            ? "If that's close to what you said, you're set. Speech that's slightly off can be retyped in the box."
            : "Say anything, then pause. It will show you what it heard."}
      </Header>

      {t.status === "idle" && (
        <button
          type="button"
          onClick={() => void start()}
          className="pill pill-ink h-9 px-4 text-[13px]"
        >
          <Mic className="size-3.5" />
          Allow microphone
        </button>
      )}

      {t.status === "denied" && (
        <p className="rounded-[12px] bg-destructive/8 px-3 py-2.5 text-[12.5px] leading-relaxed text-destructive">
          Microphone access was blocked. Click the icon at the left of the
          address bar, allow the microphone for this site, then try again.
        </p>
      )}
      {t.status === "error" && (
        <p className="text-[12.5px] text-destructive">
          The microphone couldn&apos;t start. Check that one is connected.
        </p>
      )}

      {(listening || t.status === "starting") && !t.heard && (
        <div className="flex items-center gap-3 rounded-[14px] border border-edge bg-white/40 px-4 py-3">
          <LevelBars level={t.level} active={t.status === "hearing"} />
          <span
            className={cn(
              "text-[13px]",
              t.status === "hearing" ? "text-ochre" : "text-subtle",
            )}
          >
            {t.status === "starting"
              ? "Starting microphone…"
              : t.status === "hearing"
                ? "Hearing you…"
                : "Listening. Say something."}
          </span>
          <span
            className="ml-auto font-mono text-[11px] text-subtle tabular-nums"
            title="Live input level, and the loudest so far. If these stay at 0 while you talk, no audio is reaching the browser."
          >
            {Math.round(t.level * 100)}% · peak {Math.round(t.peak * 100)}%
          </span>
        </div>
      )}
      <InputChecker />

      {t.problem && (
        <p className="rounded-[12px] bg-destructive/8 px-3.5 py-3 text-[12.5px] leading-relaxed text-destructive">
          {t.problem}
        </p>
      )}

      {quietTooLong && (
        <p className="text-[12.5px] leading-relaxed text-subtle">
          Nothing heard yet. If the level stays at 0 while you talk, the browser
          isn&apos;t getting audio: check microphone access for your browser in
          System Settings → Privacy &amp; Security, and the input device in
          System Settings → Sound.
        </p>
      )}

      {t.heard && (
        <p className="rounded-[14px] border border-edge bg-white/60 px-4 py-3 text-[16px] tracking-[-0.01em] text-ink">
          “{t.heard}”
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {t.heard && (
          <>
            <button
              type="button"
              onClick={done}
              className="pill pill-ink h-9 px-4 text-[13px]"
            >
              <Check className="size-3.5" />
              Sounds right, start building
            </button>
            <button
              type="button"
              onClick={() =>
                setT((s) => ({
                  ...s,
                  heard: null,
                  peak: 0,
                  startedAt: Date.now(),
                  problem: null,
                }))
              }
              className="pill pill-ghost h-9 px-3.5 text-[13px] text-subtle"
            >
              Try again
            </button>
          </>
        )}
        {(t.status === "denied" || t.status === "error") && (
          <button
            type="button"
            onClick={() => void start()}
            className="pill h-9 px-4 text-[13px]"
          >
            Try again
          </button>
        )}
        {!t.heard && (
          <button
            type="button"
            onClick={done}
            className="pill pill-ghost h-9 px-3.5 text-[13px] text-subtle"
          >
            Skip the test
          </button>
        )}
      </div>
    </div>
  );
}

function Done() {
  const closeSetup = useVoice((s) => s.closeSetup);
  const retestMic = useVoice((s) => s.retestMic);
  return (
    <div className="space-y-4">
      <Header title="Voice is ready">
        Press M or the Microphone button, then speak. Pause for a moment to
        apply each instruction.
      </Header>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={closeSetup}
          className="pill pill-ink h-9 px-4 text-[13px]"
        >
          Close
        </button>
        <button
          type="button"
          onClick={retestMic}
          className="pill h-9 px-4 text-[13px]"
        >
          Test the microphone
        </button>
      </div>
    </div>
  );
}

export function LevelBars({
  level,
  active,
}: {
  level: number;
  active: boolean;
}) {
  const bars = [0.5, 0.8, 1, 0.8, 0.5];
  return (
    <span className="flex h-3.5 items-center gap-[2px]" aria-hidden>
      {bars.map((w, i) => (
        <span
          key={i}
          className={cn(
            "w-[2px] rounded-full transition-[height] duration-75",
            active ? "bg-ochre" : "bg-ink/25",
          )}
          style={{
            height: `${Math.max(3, Math.min(14, 3 + level * 14 * w))}px`,
          }}
        />
      ))}
    </span>
  );
}

function InputChecker() {
  const deviceId = useVoice((s) => s.deviceId);
  const chooseInput = useVoice((s) => s.chooseInput);
  const [state, setState] = useState<{
    running: boolean;
    now: string;
    results: InputCheck[] | null;
    error: string | null;
  }>({
    running: false,
    now: "",
    results: null,
    error: null,
  });

  const run = async () => {
    setState({ running: true, now: "", results: null, error: null });
    try {
      const results = await checkAllInputs(1500, (label) =>
        setState((s) => ({ ...s, now: label })),
      );
      setState({ running: false, now: "", results, error: null });
    } catch (err) {
      setState({
        running: false,
        now: "",
        results: null,
        error: (err as Error).message || "Couldn't check the inputs.",
      });
    }
  };

  const best = state.results?.reduce<InputCheck | null>(
    (a, b) => (!a || b.peak > a.peak ? b : a),
    null,
  );
  const allSilent = state.results?.length ? (best?.peak ?? 0) < 0.01 : false;

  return (
    <div className="space-y-3 rounded-[14px] border border-edge bg-white/40 p-4">
      <div className="flex items-center gap-3">
        <p className="text-[13px] font-medium text-ink">
          Not hearing anything?
        </p>
        <button
          type="button"
          onClick={() => void run()}
          disabled={state.running}
          className="pill ml-auto h-7 gap-1.5 px-3 text-[12px]"
        >
          <SearchCheck className="size-3.5" />
          {state.running
            ? "Checking…"
            : state.results
              ? "Check again"
              : "Check every input"}
        </button>
      </div>
      <p className="text-[12.5px] leading-relaxed text-subtle">
        {state.running
          ? `Keep talking. Testing “${state.now}”…`
          : "Opens each microphone in turn and measures it while you talk, about 1.5s each."}
      </p>

      {state.error && (
        <p className="text-[12.5px] text-destructive">{state.error}</p>
      )}

      {state.results && (
        <ul className="space-y-1.5">
          {state.results.map((r) => {
            const live = r.peak >= 0.01;
            return (
              <li
                key={r.deviceId}
                className="flex items-center gap-3 text-[12.5px]"
              >
                <span className="min-w-0 flex-1 truncate text-ink/85">
                  {r.label}
                </span>
                <span className="relative h-1 w-16 shrink-0 overflow-hidden rounded-full bg-ink/10">
                  <span
                    className={cn(
                      "absolute inset-y-0 left-0 rounded-full",
                      live ? "bg-ochre" : "bg-ink/20",
                    )}
                    style={{
                      width: `${Math.min(100, Math.round(r.peak * 140))}%`,
                    }}
                  />
                </span>
                <span className="w-16 shrink-0 text-right font-mono text-[11px] text-subtle tabular-nums">
                  {r.error ? r.error : `${Math.round(r.peak * 100)}%`}
                </span>
                <button
                  type="button"
                  onClick={() => chooseInput(r.deviceId)}
                  className={cn(
                    "pill h-6 shrink-0 px-2.5 text-[11.5px]",
                    deviceId === r.deviceId && "pill-ink",
                  )}
                  disabled={!!r.error}
                >
                  {deviceId === r.deviceId ? "In use" : "Use"}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {allSilent && (
        <div className="space-y-2 rounded-[10px] bg-destructive/8 px-3 py-2.5 text-[12.5px] leading-relaxed text-destructive">
          <p>
            Every input read silent, so nothing is reaching this browser. Open
            System Settings → Sound → Input and talk at the level meter — that
            one test says where the fault is.
          </p>
          <p>
            <span className="font-medium">The meter doesn&apos;t move:</span>{" "}
            macOS itself isn&apos;t getting audio, so no browser setting will
            help. Its audio daemon has usually wedged; running{" "}
            <span className="font-mono text-[11.5px]">
              sudo killall coreaudiod
            </span>{" "}
            in Terminal restarts it, and a reboot is the next step after that.
          </p>
          <p>
            <span className="font-medium">The meter moves:</span> the microphone
            is being withheld from this browser. Check Privacy &amp; Security →
            Microphone, making sure it&apos;s the entry for the browser
            you&apos;re actually in, then quit it fully and reopen.
          </p>
        </div>
      )}
      {state.results && best && best.peak >= 0.01 && (
        <p className="text-[12.5px] leading-relaxed text-subtle">
          Loudest: <span className="text-ink">{best.label}</span> at{" "}
          {Math.round(best.peak * 100)}%. Press “Use” beside it, then try the
          test again.
        </p>
      )}
    </div>
  );
}
