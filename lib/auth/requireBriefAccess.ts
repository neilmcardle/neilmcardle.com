import { NextRequest, NextResponse } from "next/server";

import { claimGrant, readGrant } from "@/lib/ai/grants";
import { dailyCapResponse, resolveAuthedUser } from "./requirePro";

export interface BriefAccessResult {
  ok: boolean;
  response?: NextResponse;
  user?: { id: string; email?: string };

  usedFreeGrant?: boolean;
  claimedAt?: Date;
}

export async function requireBriefAccess(
  req: NextRequest,
): Promise<BriefAccessResult> {
  const resolved = await resolveAuthedUser(req);
  if (!resolved.ok || !resolved.user) {
    return { ok: false, response: resolved.response };
  }

  if (resolved.isPro) {
    const capped = await dailyCapResponse(resolved.user.id);
    if (capped) return { ok: false, response: capped };
    return { ok: true, user: resolved.user, usedFreeGrant: false };
  }

  const claim = await claimGrant("brief", resolved.user.id);
  if (claim.status === "claimed") {
    return {
      ok: true,
      user: resolved.user,
      usedFreeGrant: true,
      claimedAt: claim.claimedAt,
    };
  }
  if (claim.status === "error") {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "We could not check your free allowance. Please try again." },
        { status: 503 },
      ),
    };
  }

  const status = await readGrant("brief", resolved.user.id);
  return {
    ok: false,
    response: NextResponse.json(
      {
        error:
          "You have used your free manuscript brief for this month. Pay as you go and bring your own key are coming soon.",
        freeGrantSpent: true,
        resetsAt:
          status.state === "spent"
            ? (status.resetsAt?.toISOString() ?? null)
            : null,
      },
      { status: 402 },
    ),
  };
}
