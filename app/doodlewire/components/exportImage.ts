import { toPng } from "html-to-image";

// Captures the wireframe surface as a PNG. Chrome (toolbar, top bar, modal
// dialogs, hover-only handles) is excluded via data-skip-export markers and
// a filter pass. If region is provided, the result is cropped to that
// rectangle (canvas-space coordinates).
export async function captureWireframePng(
  node: HTMLElement,
  region?: { x: number; y: number; w: number; h: number },
): Promise<string> {
  const dataUrl = await toPng(node, {
    cacheBust: true,
    pixelRatio: window.devicePixelRatio || 2,
    backgroundColor: "#ffffff",
    filter: (n) => {
      if (!(n instanceof HTMLElement)) return true;
      return n.dataset.skipExport !== "1";
    },
  });
  if (!region) return dataUrl;
  return cropDataUrl(dataUrl, region, node.getBoundingClientRect());
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

export function defaultPngFilename(): string {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `doodlewire-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}.png`;
}
