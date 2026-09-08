import { NextRequest, NextResponse } from "next/server";

import { claimMonthlyBrief, getBriefGrantStatus } from "@/lib/ai/briefGrant";
import { resolveAuthedUser } from "./requirePro";

export interface BriefAccessResult {
  ok: boolean;
  response?: NextResponse;
  user?: { id: string; email?: string };

  usedFreeGrant?: boolean;
}

export async function requireBriefAccess(
  req: NextRequest,
): Promise<BriefAccessResult> {
  const resolved = await resolveAuthedUser(req);
  if (!resolved.ok || !resolved.user) {
    return { ok: false, response: resolved.response };
  }

  if (resolved.isPro) {
    return { ok: true, user: resolved.user, usedFreeGrant: false };
  }

  if (await claimMonthlyBrief(resolved.user.id)) {
    return { ok: true, user: resolved.user, usedFreeGrant: true };
  }

  const status = await getBriefGrantStatus(resolved.user.id);
  return {
    ok: false,
    response: NextResponse.json(
      {
        error:
          "You have used your free manuscript brief for this month. Pay as you go and bring your own key are coming soon.",
        freeGrantSpent: true,
        resetsAt: status.resetsAt?.toISOString() ?? null,
      },
      { status: 402 },
    ),
  };
}
