import { NextResponse } from "next/server";
import { db, suggestions } from "@/lib/db";
import { clientIp, hit } from "@/lib/rateLimit";

const MAX_LENGTH = 500;
const HOUR = 60 * 60 * 1000;
const RATE_LIMIT_MAX = 3;
const DAILY_LIMIT = 100;

async function withinLimits(ip: string): Promise<boolean> {
  const mine = await hit(`suggest:ip:${ip}`, RATE_LIMIT_MAX, HOUR);
  if (!mine.allowed) return false;
  const everyone = await hit("suggest:day", DAILY_LIMIT, 24 * HOUR);
  return everyone.allowed;
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

  if (!(await withinLimits(clientIp(request)))) {
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
