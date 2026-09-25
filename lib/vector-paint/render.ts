import { Resvg } from "@resvg/resvg-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { drawingToSvg, pageSize, type DrawingPayload } from "./drawing";
import { PRINT_DPI, WRAP_MM, type VectorPaintProduct } from "./products";

const BUCKET = "vector-paint-orders";
const PREVIEW_WIDTH = 900;

let bucketReady = false;

async function ensureBucket(supabase: ReturnType<typeof createAdminClient>) {
  if (bucketReady) return;
  const { data, error } = await supabase.storage.getBucket(BUCKET);
  if (error || !data) {
    const { error: createError } = await supabase.storage.createBucket(BUCKET, {
      public: false,
    });
    if (
      createError &&
      !createError.message.toLowerCase().includes("already exists")
    ) {
      throw new Error(`Storage createBucket failed: ${createError.message}`);
    }
  } else if (data.public) {
    throw new Error(
      `Bucket ${BUCKET} is public; order files must stay private`,
    );
  }
  bucketReady = true;
}

function mmToPx(mm: number) {
  return Math.round((mm / 25.4) * PRINT_DPI);
}

export function renderPrintPng(
  drawing: DrawingPayload,
  product: VectorPaintProduct,
): Buffer {
  const page = pageSize(drawing.orientation);
  const marginX = (WRAP_MM / product.widthMm) * page.w;
  const marginY = (WRAP_MM / product.heightMm) * page.h;
  const widthPx = mmToPx(product.widthMm + WRAP_MM * 2);
  const heightPx = mmToPx(product.heightMm + WRAP_MM * 2);
  const svg = drawingToSvg(drawing, { widthPx, heightPx, marginX, marginY });
  return new Resvg(svg, { fitTo: { mode: "width", value: widthPx } })
    .render()
    .asPng();
}

export function renderPreviewPng(drawing: DrawingPayload): Buffer {
  const page = pageSize(drawing.orientation);
  const heightPx = Math.round((PREVIEW_WIDTH / page.w) * page.h);
  const svg = drawingToSvg(drawing, { widthPx: PREVIEW_WIDTH, heightPx });
  return new Resvg(svg, { fitTo: { mode: "width", value: PREVIEW_WIDTH } })
    .render()
    .asPng();
}

export interface StoredOrderFiles {
  printPath: string;
  previewPath: string;
  previewUrl: string;
}

export async function storeOrderFiles(
  orderId: string,
  drawing: DrawingPayload,
  product: VectorPaintProduct,
): Promise<StoredOrderFiles> {
  const supabase = createAdminClient();
  await ensureBucket(supabase);

  const printPath = `${orderId}/print.png`;
  const previewPath = `${orderId}/preview.png`;
  const drawingPath = `${orderId}/drawing.json`;

  const uploads: Array<[string, Buffer | string, string]> = [
    [printPath, renderPrintPng(drawing, product), "image/png"],
    [previewPath, renderPreviewPng(drawing), "image/png"],
    [drawingPath, JSON.stringify(drawing), "application/json"],
  ];
  for (const [path, body, contentType] of uploads) {
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, body, { contentType, upsert: true });
    if (error)
      throw new Error(`Storage upload failed for ${path}: ${error.message}`);
  }

  const previewUrl = await signedUrl(previewPath, 60 * 60 * 24 * 2);
  return { printPath, previewPath, previewUrl };
}

export async function signedUrl(
  path: string,
  expiresInSeconds: number,
): Promise<string> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, expiresInSeconds);
  if (error || !data)
    throw new Error(`Could not sign ${path}: ${error?.message ?? "no url"}`);
  return data.signedUrl;
}
