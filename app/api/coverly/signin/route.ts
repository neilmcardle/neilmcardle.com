import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { coverlyWaitlist } from "@/lib/db/schema";

const COVERLY_APP_URL = process.env.COVERLY_APP_URL;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 5;
const ipBuckets = new Map<string, { count: number; resetAt: number }>();

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
  const entry = ipBuckets.get(ip);
  if (!entry || now >= entry.resetAt) {
    ipBuckets.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Try again in a minute." },
      { status: 429 },
    );
  }

  let body: { email?: unknown; website?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (typeof body.website === "string" && body.website.length > 0) {
    return NextResponse.json({ ok: true, redirectTo: null });
  }

  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email || email.length > 320 || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });
  }

  try {
    await db
      .insert(coverlyWaitlist)
      .values({ email, source: "neilmcardle.com/coverly" })
      .onConflictDoNothing();
  } catch (err) {
    console.error("[coverly/signin] waitlist insert failed", err);
  }

  if (!COVERLY_APP_URL) {
    return NextResponse.json({ ok: true, redirectTo: null });
  }

  const redirectTo = `${COVERLY_APP_URL.replace(/\/$/, "")}/landing?email=${encodeURIComponent(email)}`;
  return NextResponse.json({ ok: true, redirectTo });
}
