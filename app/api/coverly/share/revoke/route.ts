import { NextResponse } from "next/server";
import { createCoverlyPublicClient } from "@/lib/coverly/supabase/public";
import { checkOrigin } from "@/lib/auth/checkOrigin";
import { clientIp, hit, waitPhrase } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HOUR = 60 * 60 * 1000;
const REVOKES_PER_HOUR = 40;

export async function POST(req: Request) {
  const originError = checkOrigin(req);
  if (originError) return originError;

  const mine = await hit(
    `coverly-share-revoke:ip:${clientIp(req)}`,
    REVOKES_PER_HOUR,
    HOUR,
  );
  if (!mine.allowed) {
    return NextResponse.json(
      {
        error: `Too many attempts. Try again in ${waitPhrase(mine.retryAfterSeconds)}.`,
      },
      { status: 429 },
    );
  }

  let body: { token?: unknown; revokeKey?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "invalid request body" },
      { status: 400 },
    );
  }

  const token = typeof body.token === "string" ? body.token.slice(0, 64) : "";
  const revokeKey =
    typeof body.revokeKey === "string" ? body.revokeKey.slice(0, 64) : "";

  if (!token || !revokeKey) {
    return NextResponse.json({ error: "missing token" }, { status: 400 });
  }

  const supabase = createCoverlyPublicClient();
  if (!supabase) {
    return NextResponse.json({ error: "not configured" }, { status: 503 });
  }

  const { data, error } = await supabase.rpc("revoke_shared_board", {
    p_token: token,
    p_revoke_key: revokeKey,
  });

  if (error) {
    console.error("coverly share revoke failed", error);
    return NextResponse.json(
      { error: "Could not stop sharing. Try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ revoked: data === true });
}
