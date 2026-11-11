import { NextResponse } from "next/server";
import { createCoverlyPublicClient } from "@/lib/coverly/supabase/public";
import { checkOrigin } from "@/lib/auth/checkOrigin";
import { clientIp, hit, waitPhrase } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_COVERS = 120;
const HOUR = 60 * 60 * 1000;
const SHARES_PER_HOUR = 20;
const SHARES_PER_DAY = 500;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req: Request) {
  const originError = checkOrigin(req);
  if (originError) return originError;

  const mine = await hit(
    `coverly-share:ip:${clientIp(req)}`,
    SHARES_PER_HOUR,
    HOUR,
  );
  if (!mine.allowed) {
    return NextResponse.json(
      {
        error: `Too many share links. Try again in ${waitPhrase(mine.retryAfterSeconds)}.`,
      },
      { status: 429 },
    );
  }

  const everyone = await hit("coverly-share:day", SHARES_PER_DAY, 24 * HOUR);
  if (!everyone.allowed) {
    return NextResponse.json(
      { error: "Sharing is busy today. Try again tomorrow." },
      { status: 429 },
    );
  }

  let body: { boardName?: unknown; coverIds?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "invalid request body" },
      { status: 400 },
    );
  }

  const boardName =
    typeof body.boardName === "string" && body.boardName.trim()
      ? body.boardName.trim().slice(0, 120)
      : "Untitled board";

  const coverIds = Array.isArray(body.coverIds)
    ? Array.from(
        new Set(
          body.coverIds.filter(
            (id): id is string => typeof id === "string" && UUID.test(id),
          ),
        ),
      ).slice(0, MAX_COVERS)
    : [];

  if (coverIds.length === 0) {
    return NextResponse.json({ error: "board is empty" }, { status: 400 });
  }

  const supabase = createCoverlyPublicClient();
  if (!supabase) {
    return NextResponse.json({ error: "not configured" }, { status: 503 });
  }

  const { data, error } = await supabase.rpc("create_shared_board", {
    p_name: boardName,
    p_cover_ids: coverIds,
  });

  if (error) {
    console.error("coverly share create failed", error);
    return NextResponse.json(
      { error: "Could not create the link. Try again." },
      { status: 500 },
    );
  }

  const row = (Array.isArray(data) ? data[0] : data) as
    { token?: string; revoke_key?: string } | null | undefined;

  if (!row?.token || !row?.revoke_key) {
    return NextResponse.json(
      { error: "Could not create the link. Try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ token: row.token, revokeKey: row.revoke_key });
}
