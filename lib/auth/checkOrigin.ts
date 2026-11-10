import { NextResponse } from "next/server";

const PRODUCTION_ORIGINS = [
  "https://makeebook.ink",
  "https://www.makeebook.ink",
  "https://neilmcardle.com",
  "https://www.neilmcardle.com",
];

const ALLOWED_ORIGINS = new Set(
  process.env.NODE_ENV === "production"
    ? PRODUCTION_ORIGINS
    : [...PRODUCTION_ORIGINS, "http://localhost:3000"],
);

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export function checkOrigin(req: Request): NextResponse | null {
  const origin = req.headers.get("origin");
  if (!origin) {
    if (SAFE_METHODS.has(req.method.toUpperCase())) return null;
    return NextResponse.json({ error: "Missing origin" }, { status: 403 });
  }
  if (ALLOWED_ORIGINS.has(origin)) return null;
  return NextResponse.json({ error: "Forbidden origin" }, { status: 403 });
}
