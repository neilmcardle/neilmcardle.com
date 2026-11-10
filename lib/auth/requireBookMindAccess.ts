import { NextRequest, NextResponse } from "next/server";

import { claimFreeQuestion } from "@/lib/ai/questionGrant";
import { dailyCapResponse, resolveAuthedUser } from "./requirePro";

export interface BookMindAccessResult {
  ok: boolean;
  response?: NextResponse;
  user?: { id: string; email?: string };
  usedFreeQuestion?: boolean;
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

  if (await claimFreeQuestion(resolved.user.id)) {
    return { ok: true, user: resolved.user, usedFreeQuestion: true };
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
