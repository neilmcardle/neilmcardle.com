/// <reference lib="webworker" />

import { fromHub } from "parakeet.js";

type Model = Awaited<ReturnType<typeof fromHub>>;
type Backend = "webgpu-hybrid" | "wasm";

const MODEL_KEY = "parakeet-tdt-0.6b-v2";

const ctx = self as unknown as DedicatedWorkerGlobalScope;
let model: Model | null = null;

async function load(backend: Backend): Promise<Model> {
  if (model) return model;
  const m = await fromHub(MODEL_KEY, {
    backend,

    encoderQuant: backend === "wasm" ? "int8" : "fp16",
    decoderQuant: "int8",

    progress: ({ loaded, file }) =>
      ctx.postMessage({ type: "progress", loaded, file }),
  });
  ctx.postMessage({ type: "preparing" });

  await m.transcribe(new Float32Array(16000), 16000);
  model = m;
  return m;
}

ctx.onmessage = async (e: MessageEvent) => {
  const msg = e.data as
    | { type: "load"; backend: Backend }
    | { type: "transcribe"; id: number; audio: Float32Array };

  if (msg.type === "load") {
    try {
      await load(msg.backend);
      ctx.postMessage({ type: "ready" });
    } catch (err) {
      ctx.postMessage({
        type: "error",
        message: String((err as Error)?.message ?? err),
      });
    }
    return;
  }

  if (msg.type === "transcribe") {
    try {
      if (!model) throw new Error("not loaded");
      const started = performance.now();
      const out = await model.transcribe(msg.audio, 16000);
      ctx.postMessage({
        type: "result",
        id: msg.id,
        text: (out.utterance_text ?? "").trim(),
        ms: Math.round(performance.now() - started),
      });
    } catch (err) {
      ctx.postMessage({
        type: "result",
        id: msg.id,
        text: "",
        ms: 0,
        error: String(err),
      });
    }
  }
};
