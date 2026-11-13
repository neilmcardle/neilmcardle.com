import { NextRequest, NextResponse } from "next/server";

import { claimAllowance } from "@/lib/ai/allowances";
import { dailyCapResponse, resolveAuthedUser } from "./requirePro";

export interface BookMindAccessResult {
  ok: boolean;
  response?: NextResponse;
  user?: { id: string; email?: string };
  usedFreeQuestion?: boolean;
  claimedAt?: Date;
}

export async function requireBookMindAccess(
  req: NextRequest,
  options: { allowFreeQuestion: boolean },
): Promise<BookMindAccessResult> {
  const resolved = await resolveAuthedUser(req);
  if (!resolved.ok || !resolved.user) {
    return { ok: false, response: resolved.response };
  }

  if (resolved.isPro) {
    const capped = await dailyCapResponse(resolved.user.id);
    if (capped) return { ok: false, response: capped };
    return { ok: true, user: resolved.user, usedFreeQuestion: false };
  }

  if (!options.allowFreeQuestion) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "This is a Pro feature. Upgrade to access AI generation.",
          requiresUpgrade: true,
        },
        { status: 403 },
      ),
    };
  }

  const claim = await claimAllowance("question", resolved.user.id);
  if (claim.status === "claimed") {
    return {
      ok: true,
      user: resolved.user,
      usedFreeQuestion: true,
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

  return {
    ok: false,
    response: NextResponse.json(
      {
        error:
          "You have used your free question. Upgrade to Pro to keep asking Book Mind.",
        requiresUpgrade: true,
        freeQuestionSpent: true,
      },
      { status: 403 },
    ),
  };
}
