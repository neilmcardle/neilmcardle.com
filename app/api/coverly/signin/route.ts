import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { coverlyWaitlist } from "@/lib/db/schema";

const SUPABASE_URL = process.env.NEXT_PUBLIC_COVERLY_SUPABASE_URL;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_COVERLY_SUPABASE_ANON_KEY;

const COVERLY_APP_URL = process.env.COVERLY_APP_URL ?? "http://localhost:3100";

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
    return NextResponse.json({ ok: true });
  }

  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email || email.length > 320 || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });
  }

  if (!SUPABASE_URL || !SUPABASE_ANON) {
    return NextResponse.json(
      { error: "Sign-in is not configured yet" },
      { status: 503 },
    );
  }

  try {
    await db
      .insert(coverlyWaitlist)
      .values({ email, source: "neilmcardle.com/coverly" })
      .onConflictDoNothing();
  } catch (err) {
    console.error("[coverly/signin] waitlist insert failed", err);
  }

  const redirectTo = `${COVERLY_APP_URL.replace(/\/$/, "")}/auth/callback`;
  try {
    const res = await fetch(
      `${SUPABASE_URL}/auth/v1/otp?redirect_to=${encodeURIComponent(redirectTo)}`,
      {
        method: "POST",
        headers: {
          apikey: SUPABASE_ANON,
          Authorization: `Bearer ${SUPABASE_ANON}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, create_user: true }),
      },
    );

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(
        "[coverly/signin] otp failed",
        res.status,
        detail.slice(0, 300),
      );
      return NextResponse.json(
        {
          error:
            res.status === 429
              ? "Too many attempts. Try again shortly."
              : "Could not send the link",
        },
        { status: res.status === 429 ? 429 : 502 },
      );
    }
  } catch (err) {
    console.error("[coverly/signin] otp request threw", err);
    return NextResponse.json(
      { error: "Could not send the link" },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
