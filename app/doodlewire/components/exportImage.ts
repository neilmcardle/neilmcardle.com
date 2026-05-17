import { toPng } from "html-to-image";

interface CaptureOptions {
  // Crop the result to this rectangle (screen-space coordinates).
  region?: { x: number; y: number; w: number; h: number };
  // Explicit output size. Used for full-page capture, where the document is
  // taller than the viewport — the caller temporarily expands the canvas and
  // element layer, then passes the document height here.
  width?: number;
  height?: number;
}

// Captures the wireframe surface as a PNG. Chrome (toolbar, top bar, modal
// dialogs, hover-only handles) is excluded via data-skip-export markers and
// a filter pass.
export async function captureWireframePng(
  node: HTMLElement,
  opts: CaptureOptions = {},
): Promise<string> {
  const dataUrl = await toPng(node, {
    cacheBust: true,
    pixelRatio: window.devicePixelRatio || 2,
    backgroundColor: "#ffffff",
    width: opts.width,
    height: opts.height,
    filter: (n) => {
      if (!(n instanceof HTMLElement)) return true;
      return n.dataset.skipExport !== "1";
    },
  });
  if (!opts.region) return dataUrl;
  return cropDataUrl(dataUrl, opts.region, node.getBoundingClientRect());
}

async function cropDataUrl(
  dataUrl: string,
  region: { x: number; y: number; w: number; h: number },
  sourceRect: DOMRect,
): Promise<string> {
  const img = await loadImage(dataUrl);
  const scale = img.width / sourceRect.width;
  const sx = Math.max(0, Math.round(region.x * scale));
  const sy = Math.max(0, Math.round(region.y * scale));
  const sw = Math.max(1, Math.round(region.w * scale));
  const sh = Math.max(1, Math.round(region.h * scale));
  const canvas = document.createElement("canvas");
  canvas.width = sw;
  canvas.height = sh;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, sw, sh);
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
  return canvas.toDataURL("image/png");
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export type SaveResult = "shared" | "downloaded" | "cancelled";

// Save a PNG. On platforms with the Web Share API and file sharing (iOS,
// Android), pop the native share sheet so the user can pick Save to Photos,
// Files, Messages, etc. Otherwise fall back to the standard <a download>
// route. Returns which path actually ran so the caller can show feedback.
export async function savePng(dataUrl: string, filename: string): Promise<SaveResult> {
  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], filename, { type: "image/png" });
      const canShareFiles =
        typeof navigator.canShare === "function" ? navigator.canShare({ files: [file] }) : true;
      if (canShareFiles) {
        try {
          await navigator.share({ files: [file], title: "DoodleWire" });
          return "shared";
        } catch (err) {
          if (err instanceof Error && err.name === "AbortError") return "cancelled";
          // Any other share error: fall through to download.
        }
      }
    } catch {
      // Blob conversion or canShare check failed: fall through to download.
    }
  }
  downloadDataUrl(dataUrl, filename);
  return "downloaded";
}

export function defaultPngFilename(): string {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `doodlewire-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}.png`;
}
