import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const SITE = path.join(process.cwd(), "app/_studio/data/hotspots.json");
const NIGHTWALK = path.join(
  process.cwd(),
  "../nightwalk/game/data/hotspots.json",
);

type Poly = number[][];

function valid(value: unknown): value is Record<string, Poly[]> {
  if (!value || typeof value !== "object") return false;
  return Object.values(value).every(
    (polys) =>
      Array.isArray(polys) &&
      polys.every(
        (poly) =>
          Array.isArray(poly) &&
          poly.length >= 3 &&
          poly.every(
            (pt) =>
              Array.isArray(pt) &&
              pt.length === 2 &&
              pt.every((n) => typeof n === "number" && Number.isFinite(n)),
          ),
      ),
  );
}

async function merge(
  file: string,
  outlines: Record<string, Poly[]>,
  pretty: boolean,
) {
  const data = JSON.parse(await readFile(file, "utf8"));
  for (const key of Object.keys(outlines)) {
    if (!(key in data.studio)) continue;
    data.studio[key] = outlines[key];
  }
  if (pretty) {
    const prettier = await import("prettier");
    await writeFile(
      file,
      await prettier.format(JSON.stringify(data), { parser: "json" }),
    );
  } else {
    await writeFile(
      file,
      JSON.stringify(data).replace(/,/g, ", ").replace(/:/g, ": "),
    );
  }
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "development")
    return new NextResponse(null, { status: 404 });
  const body = await request.json().catch(() => null);
  if (!valid(body?.outlines))
    return NextResponse.json({ error: "Bad outlines" }, { status: 400 });
  await merge(SITE, body.outlines, true);
  await merge(NIGHTWALK, body.outlines, false).catch(() => undefined);
  return NextResponse.json({ ok: true });
}
