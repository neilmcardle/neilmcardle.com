import { NextResponse } from "next/server";

const COOKIE_NAME = "nm-portfolio";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 90;

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function POST(request: Request) {
  const expectedPassword = process.env.PORTFOLIO_PASSWORD;
  const secret = process.env.PORTFOLIO_COOKIE_SECRET;
  if (!expectedPassword || !secret) {
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  let submitted = "";
  try {
    const body = await request.json();
    submitted = typeof body?.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (submitted !== expectedPassword) {
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
