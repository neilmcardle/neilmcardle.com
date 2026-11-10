import { NextResponse } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { db, suggestions } from "@/lib/db";
import { reportEvent, runToken } from "@/lib/suggest/buildState";
import { transitionSuggestion } from "@/lib/suggest/transition";

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

  const started = typeof body.started === "string" ? body.started : "";

  const [row] = await db
    .update(suggestions)
    .set({
      costMicroUsd: sql`${suggestions.costMicroUsd} + ${Math.ceil(costUsd * 1_000_000)}`,
      updatedAt: new Date(),
    })
    .where(eq(suggestions.id, id))
    .returning({ buildStartedAt: suggestions.buildStartedAt });

  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const sameRun = !started || started === runToken(row.buildStartedAt);
  if (!sameRun) {
    return NextResponse.json({ ok: true, stale: true });
  }

  const moved = await transitionSuggestion(id, reportEvent(prUrl), {
    prUrl,
    note: note || null,
  });

  if (!moved && prUrl) {
    await db
      .update(suggestions)
      .set({ prUrl, updatedAt: new Date() })
      .where(and(eq(suggestions.id, id), eq(suggestions.status, "failed")));
  }

  return NextResponse.json({ ok: true });
}
