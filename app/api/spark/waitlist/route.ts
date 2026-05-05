import { NextResponse } from "next/server";
import { Resend } from "resend";
import { db } from "@/lib/db";
import { sparkWaitlist } from "@/lib/db/schema";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
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
