import { NextResponse } from "next/server";
import { Resend } from "resend";
import { db } from "@/lib/db";
import { sparkWaitlist } from "@/lib/db/schema";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Per-IP rate limit. In-memory; resets on cold start. Phase 2.3 of
// SECURITY-FIXES.md will swap this for Upstash. Turnstile is the
// remaining layer once a Cloudflare site is provisioned for the form.
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
    return NextResponse.json({ error: "Too many requests. Try again in a minute." }, { status: 429 });
  }

  let body: { email?: unknown; source?: unknown; website?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  // Honeypot: real users never fill this hidden field. Bots usually do.
  if (typeof body.website === "string" && body.website.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email || email.length > 320 || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });
  }

  const source = typeof body.source === "string" ? body.source.slice(0, 64) : null;

  try {
    await db.insert(sparkWaitlist).values({ email, source }).onConflictDoNothing();
  } catch (err) {
    console.error("[spark/waitlist] insert failed", err);
    return NextResponse.json({ error: "Could not save" }, { status: 500 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.SPARK_WAITLIST_FROM;
  if (apiKey && fromAddress) {
    try {
      const resend = new Resend(apiKey);
      await resend.emails.send({
        from: fromAddress,
        to: email,
        subject: "You're on the Spark waitlist",
        text: [
          "Thanks for signing up to Spark.",
          "",
          "Spark is a course that takes designers to full-stack engineer. Built for designers, by a designer, so they can build for themselves.",
          "",
          "I'm building it in public, evening by evening. You'll hear from me when the first modules land.",
          "",
          "Neil",
        ].join("\n"),
      });
    } catch (err) {
      // Email failure must not fail the signup. The row is already saved.
      console.error("[spark/waitlist] resend send failed", err);
    }
  }

  return NextResponse.json({ ok: true });
}
