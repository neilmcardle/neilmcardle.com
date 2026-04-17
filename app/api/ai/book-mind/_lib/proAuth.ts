// Shared Pro-tier auth check for every Book Mind API route.
//
// Mirrors the defensive id-then-email lookup used in /api/subscription
// after the April 2026 DATABASE_URL incident — when an auth UUID drifts
// from the public.users id (replica desync, partial migration), a fresh
// email lookup recovers the row before we return a 403 to a real Pro
// user. See CLAUDE.md "Known non-obvious gotchas" for the history.

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, CookieOptions } from '@supabase/ssr';
import { getUserById, getUserByEmail } from '@/lib/db/users';

export interface ProAuthResult {
  ok: boolean;
  response?: NextResponse;
  user?: { id: string; email?: string };
}

export async function requireProUser(req: NextRequest): Promise<ProAuthResult> {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return req.cookies.get(name)?.value },
        set(_name: string, _value: string, _options: CookieOptions) { /* handled by middleware */ },
        remove(_name: string, _options: CookieOptions) { /* handled by middleware */ },
      },
    },
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Authentication required. Please sign in to use Book Mind.' },
        { status: 401 },
      ),
    };
  }

  // Defensive id+email fallback. See note in /api/subscription/route.ts.
  let { user: dbUser } = await getUserById(user.id);
  if (!dbUser && user.email) {
    const { user: fallbackUser } = await getUserByEmail(user.email);
    if (fallbackUser) {
      console.warn(
        `[book-mind auth] id lookup failed but email lookup succeeded for ${user.email}. ` +
        `auth.id=${user.id}, public.users.id=${fallbackUser.id}.`
      );
      dbUser = fallbackUser;
    }
  }

  // Local dev override: grant Pro when DB is unreachable and the
  // user matches a known dev email. See /api/subscription for the
  // same pattern and the reasoning behind it.
  if (!dbUser && process.env.NODE_ENV === 'development') {
    const devProEmails = ['neil@neilmcardle.com', 'neilmcardlemail@gmail.com', 'hello@makeebook.ink'];
    if (user.email && devProEmails.includes(user.email)) {
      return { ok: true, user: { id: user.id, email: user.email } };
    }
  }

  let isPro = false;
  if (dbUser) {
    if (dbUser.isGrandfathered) isPro = true;
    else if (dbUser.hasLifetimeAccess) isPro = true;
    else if (dbUser.subscriptionStatus === 'active' && dbUser.subscriptionTier === 'pro') isPro = true;
  }

  if (!isPro) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Book Mind is a Pro feature. Upgrade to access AI-powered book analysis.', requiresUpgrade: true, feature: 'book_mind_ai' },
        { status: 403 },
      ),
    };
  }

  return { ok: true, user: { id: user.id, email: user.email ?? undefined } };
}
