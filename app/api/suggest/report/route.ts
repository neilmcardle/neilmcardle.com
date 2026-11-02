import { NextResponse } from "next/server";
import { and, eq, inArray, sql } from "drizzle-orm";
import { db, suggestions } from "@/lib/db";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PR_RE =
  /^https:\/\/github\.com\/neilmcardle\/neilmcardle\.com\/pull\/\d+$/;

function authorised(request: Request): boolean {
  const secret = process.env.SUGGEST_REPORT_SECRET;
  const header = request.headers.get("authorization") ?? "";
  const given = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!secret || given.length !== secret.length) return false;
  let diff = 0;
  for (let i = 0; i < secret.length; i++) {
    diff |= secret.charCodeAt(i) ^ given.charCodeAt(i);
  }
  return diff === 0;
}

export async function POST(request: Request) {
  if (!authorised(request)) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id : "";
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const prUrl =
    typeof body.prUrl === "string" && PR_RE.test(body.prUrl)
      ? body.prUrl
      : null;
  const costUsd =
    typeof body.costUsd === "number" && Number.isFinite(body.costUsd)
      ? Math.max(0, body.costUsd)
      : 0;
  const note =
    typeof body.note === "string" ? body.note.trim().slice(0, 500) : null;

  const [current] = await db
    .select({ status: suggestions.status })
    .from(suggestions)
    .where(
      and(
        eq(suggestions.id, id),
        inArray(suggestions.status, ["building", "failed"]),
      ),
    );
  if (!current) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const running = current.status === "building";
  const [row] = await db
    .update(suggestions)
    .set({
      status: running ? (prUrl ? "ready" : "failed") : "failed",
      prUrl: running ? prUrl : null,
      costMicroUsd: sql`${suggestions.costMicroUsd} + ${Math.ceil(costUsd * 1_000_000)}`,
      note: running ? note || null : "Stopped by hand.",
      updatedAt: new Date(),
    })
    .where(eq(suggestions.id, id))
    .returning({ id: suggestions.id });

  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
