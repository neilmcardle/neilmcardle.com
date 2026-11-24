import { NextResponse } from "next/server";
import { clientIp, hit, waitPhrase } from "@/lib/rateLimit";

const COOKIE_NAME = "nm-portfolio";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 90;

const ATTEMPTS_PER_HOUR = 10;

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(input),
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function POST(request: Request) {
  const expectedPassword = process.env.PORTFOLIO_PASSWORD;
  const secret = process.env.PORTFOLIO_COOKIE_SECRET;
  if (!expectedPassword || !secret) {
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  const limit = await hit(
    `portfolio-unlock:${clientIp(request)}`,
    ATTEMPTS_PER_HOUR,
    60 * 60 * 1000,
  );
  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: `Too many tries. Try again in ${waitPhrase(limit.retryAfterSeconds)}.`,
      },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      },
    );
  }

  let submitted = "";
  try {
    const body = await request.json();
    submitted = typeof body?.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const [given, expected] = await Promise.all([
    sha256Hex(submitted),
    sha256Hex(expectedPassword),
  ]);
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= given.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  if (diff !== 0) {
    return NextResponse.json({ error: "Invalid" }, { status: 401 });
  }

  const token = await sha256Hex(expectedPassword + secret);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
  return res;
}
