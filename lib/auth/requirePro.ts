import { NextRequest, NextResponse } from "next/server";
import { createServerClient, CookieOptions } from "@supabase/ssr";
import { getUserById, getUserByEmail } from "@/lib/db/users";
import { hit, waitPhrase } from "@/lib/rateLimit";
import { devProEmails, isProUser } from "@/lib/billing/proStatus";

export interface ProAuthResult {
  ok: boolean;
  response?: NextResponse;
  user?: { id: string; email?: string };
}

const DAILY_CAP = 200;

async function checkDailyCap(
  userId: string,
): Promise<{ allowed: boolean; message?: string }> {
  const result = await hit(`ai:user:${userId}`, DAILY_CAP, 24 * 60 * 60 * 1000);
  if (result.allowed) return { allowed: true };
  return {
    allowed: false,
    message: `You've reached the daily AI usage limit (${DAILY_CAP} calls). Try again in ${waitPhrase(result.retryAfterSeconds)}.`,
  };
}

export interface ResolvedUser {
  ok: boolean;
  response?: NextResponse;
  user?: { id: string; email?: string };
  isPro?: boolean;
}

export async function resolveAuthedUser(
  req: NextRequest,
): Promise<ResolvedUser> {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(_name: string, _value: string, _options: CookieOptions) {
          /* handled by middleware */
        },
        remove(_name: string, _options: CookieOptions) {
          /* handled by middleware */
        },
      },
    },
  );

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Authentication required. Please sign in." },
        { status: 401 },
      ),
    };
  }

  const identity = { id: user.id, email: user.email ?? undefined };

  let { user: dbUser } = await getUserById(user.id);
  if (!dbUser && user.email) {
    const { user: fallbackUser } = await getUserByEmail(user.email);
    if (fallbackUser) {
      console.warn(
        `[requirePro] id lookup failed but email lookup succeeded. ` +
          `auth.id=${user.id}, public.users.id=${fallbackUser.id}.`,
      );
      dbUser = fallbackUser;
    }
  }

  if (!dbUser && process.env.NODE_ENV === "development") {
    if (user.email && devProEmails().includes(user.email.toLowerCase())) {
      return { ok: true, user: identity, isPro: true };
    }
  }

  return { ok: true, user: identity, isPro: isProUser(dbUser) };
}

export async function dailyCapResponse(
  userId: string,
): Promise<NextResponse | null> {
  const cap = await checkDailyCap(userId);
  if (cap.allowed) return null;
  return NextResponse.json({ error: cap.message }, { status: 429 });
}

export async function requirePro(req: NextRequest): Promise<ProAuthResult> {
  const resolved = await resolveAuthedUser(req);
  if (!resolved.ok || !resolved.user) {
    return { ok: false, response: resolved.response };
  }

  if (!resolved.isPro) {
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

  const cap = await checkDailyCap(resolved.user.id);
  if (!cap.allowed) {
    return {
      ok: false,
      response: NextResponse.json({ error: cap.message }, { status: 429 }),
    };
  }

  return { ok: true, user: resolved.user };
}
