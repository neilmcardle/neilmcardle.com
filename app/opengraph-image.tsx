import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { SHARE_ALT } from "./shared-metadata";

export const runtime = "nodejs";
export const alt = SHARE_ALT;
export const size = { width: 1200, height: 630 };
export const contentType = "image/jpeg";

export default async function OpenGraphImage() {
  const image = await readFile(
    join(process.cwd(), "public/og/studio-share.jpg"),
  );
  return new Response(new Uint8Array(image), {
    headers: { "Content-Type": "image/jpeg" },
  });
}
