export type Backend = "webgpu-hybrid" | "wasm";

const REPO = "ysdede/parakeet-tdt-0.6b-v2-onnx";

const FILES: Record<Backend, { name: string; bytes: number }[]> = {
  "webgpu-hybrid": [
    { name: "encoder-model.fp16.onnx", bytes: 1_239_000_000 },
    { name: "decoder_joint-model.int8.onnx", bytes: 9_000_000 },
    { name: "vocab.txt", bytes: 100_000 },
  ],
  wasm: [
    { name: "encoder-model.int8.onnx", bytes: 652_200_000 },
    { name: "decoder_joint-model.int8.onnx", bytes: 9_000_000 },
    { name: "vocab.txt", bytes: 100_000 },
  ],
};

export function downloadBytes(backend: Backend): number {
  return FILES[backend].reduce((n, f) => n + f.bytes, 0);
}

export type BrowserName = "chrome" | "edge" | "firefox" | "safari" | "other";

export function detectBrowser(): BrowserName {
  const ua = navigator.userAgent;
  if (/Edg\//.test(ua)) return "edge";
  if (/Firefox\//.test(ua)) return "firefox";
  if (/Chrome\//.test(ua)) return "chrome";
  if (/Safari\//.test(ua)) return "safari";
  return "other";
}

function withTimeout<T>(work: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    work,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

export async function detectBackend(): Promise<Backend> {
  const gpu = (
    navigator as Navigator & {
      gpu?: { requestAdapter: () => Promise<unknown> };
    }
  ).gpu;
  if (!gpu) return "wasm";
  try {
    const adapter = await withTimeout(gpu.requestAdapter(), 4000, null);
    return adapter ? "webgpu-hybrid" : "wasm";
  } catch {
    return "wasm";
  }
}

export function cachedBackend(): Promise<Backend | null> {
  return withTimeout(
    readCachedBackend().catch(() => null),
    6000,
    null,
  );
}

async function readCachedBackend(): Promise<Backend | null> {
  if (typeof indexedDB === "undefined") return null;

  const dbs = await indexedDB.databases?.().catch(() => null);
  if (dbs && !dbs.some((d) => d.name === "parakeet-cache-db")) return null;

  const db = await new Promise<IDBDatabase | null>((resolve) => {
    const req = indexedDB.open("parakeet-cache-db", 1);
    req.onupgradeneeded = () => {
      req.transaction?.abort();
      resolve(null);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);

    req.onblocked = () => resolve(null);
  });
  if (!db) return null;

  try {
    if (!db.objectStoreNames.contains("file-store")) return null;
    const keys = await new Promise<string[]>((resolve) => {
      const req = db
        .transaction("file-store", "readonly")
        .objectStore("file-store")
        .getAllKeys();
      req.onsuccess = () => resolve(req.result.map(String));
      req.onerror = () => resolve([]);
    });
    const has = (b: Backend) =>
      FILES[b].every((f) => keys.includes(`hf-${REPO}-main--${f.name}`));
    return has("webgpu-hybrid") ? "webgpu-hybrid" : has("wasm") ? "wasm" : null;
  } finally {
    db.close();
  }
}

export type LoadProgress = { loaded: number; total: number };

type Pending = { resolve: (r: { text: string; ms: number }) => void };

class VoiceModel {
  private worker: Worker | null = null;
  private loading: Promise<Backend> | null = null;
  private pending = new Map<number, Pending>();
  private seq = 0;
  backend: Backend | null = null;

  get ready(): boolean {
    return this.backend !== null;
  }

  load(
    backend: Backend,
    onProgress?: (p: LoadProgress) => void,
    onPreparing?: () => void,
  ): Promise<Backend> {
    if (this.backend) return Promise.resolve(this.backend);
    if (this.loading) return this.loading;

    this.worker = new Worker(new URL("./asr.worker.ts", import.meta.url), {
      type: "module",
    });
    const total = downloadBytes(backend);
    const perFile = new Map<string, number>();

    this.loading = new Promise<Backend>((resolve, reject) => {
      this.worker!.onmessage = (e) => {
        const d = e.data;
        if (d.type === "progress") {
          perFile.set(d.file, d.loaded);
          let loaded = 0;
          for (const v of perFile.values()) loaded += v;
          onProgress?.({ loaded, total });
        } else if (d.type === "preparing") {
          onPreparing?.();
        } else if (d.type === "ready") {
          this.backend = backend;
          resolve(backend);
        } else if (d.type === "error") {
          reject(new Error(d.message));
        } else if (d.type === "result") {
          this.pending.get(d.id)?.resolve({ text: d.text, ms: d.ms });
          this.pending.delete(d.id);
        }
      };
    }).catch((err) => {
      this.worker?.terminate();
      this.worker = null;
      this.loading = null;
      throw err;
    });

    this.worker.postMessage({ type: "load", backend });
    return this.loading;
  }

  transcribe(audio: Float32Array): Promise<{ text: string; ms: number }> {
    if (!this.worker || !this.backend)
      return Promise.reject(new Error("Voice model isn't loaded."));
    const id = ++this.seq;
    return new Promise((resolve) => {
      this.pending.set(id, { resolve });
      this.worker!.postMessage({ type: "transcribe", id, audio }, [
        audio.buffer,
      ]);
    });
  }
}

export const voiceModel = new VoiceModel();
