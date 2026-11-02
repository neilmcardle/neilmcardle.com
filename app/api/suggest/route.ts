import { NextResponse } from "next/server";
import { db, suggestions } from "@/lib/db";

const MAX_LENGTH = 500;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX = 3;
const DAILY_LIMIT = 100;
const ipBuckets = new Map<string, { count: number; resetAt: number }>();
let daily = { count: 0, resetAt: Date.now() + 24 * 60 * 60 * 1000 };

function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) {
    const first = fwd.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip") || "unknown";
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  if (now >= daily.resetAt) {
    daily = { count: 0, resetAt: now + 24 * 60 * 60 * 1000 };
  }
  if (daily.count >= DAILY_LIMIT) return false;
  const entry = ipBuckets.get(ip);
  if (!entry || now >= entry.resetAt) {
    ipBuckets.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
  } else if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  } else {
    entry.count++;
  }
  daily.count++;
  return true;
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (typeof body.website === "string" && body.website.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const text =
    typeof body.request === "string"
      ? body.request.replace(/\s+/g, " ").trim()
      : "";
  if (text.length < 8) {
    return NextResponse.json(
      { error: "Say a little more about the change you’d like." },
      { status: 400 },
    );
  }
  if (text.length > MAX_LENGTH) {
    return NextResponse.json(
      { error: `Keep it under ${MAX_LENGTH} characters.` },
      { status: 400 },
    );
  }

  if (!checkRateLimit(getClientIp(request))) {
    return NextResponse.json(
      { error: "That’s plenty for now. Try again in an hour." },
      { status: 429 },
    );
  }

  try {
    await db.insert(suggestions).values({ request: text });
  } catch (err) {
    console.error("[suggest] insert failed", err);
    return NextResponse.json(
      { error: "That didn’t send. Try again later." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
