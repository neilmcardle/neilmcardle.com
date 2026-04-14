import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { CookieOptions } from '@supabase/ssr'
import { getUserById, getUserByEmail } from '@/lib/db/users'

/**
 * Subscription Data Endpoint
 *
 * Returns current user's subscription information for client-side display.
 * Used by the useSubscription hook.
 */
export async function GET(req: NextRequest) {
  try {
    const response = NextResponse.json({ error: 'Internal server error' }, { status: 500 })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return req.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            response.cookies.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            response.cookies.set({ name, value: '', ...options })
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: response.headers }
      )
    }

    // Primary lookup by auth UUID. Happy path.
    let { user: dbUser } = await getUserById(user.id)

    // Defensive fallback: if the id lookup returned null, try email. This
    // handles the (rare) case where public.users.id has drifted out of
    // sync with auth.users.id — from a manual DB edit, a deleted-and-
    // recreated auth row, or an older auth flow that never wrote through
    // the current callback. The email is on the validated JWT and
    // users.email is UNIQUE, so it's a safe second lookup. When the
    // fallback fires, a warning is logged so the drift shows up in Vercel
    // runtime logs for later cleanup.
    if (!dbUser && user.email) {
      const { user: fallbackUser } = await getUserByEmail(user.email)
      if (fallbackUser) {
        console.warn(
          `[subscription] id lookup failed but email lookup succeeded for ${user.email}. ` +
          `auth.id=${user.id}, public.users.id=${fallbackUser.id}. ` +
          `Fix with: UPDATE public.users SET id = '${user.id}' WHERE email = '${user.email}';`
        )
        dbUser = fallbackUser
      }
    }

    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404, headers: response.headers }
      )
    }

    // Compute tier inline from the dbUser we already have rather than
    // re-querying via getUserSubscriptionTier — which would hit the same
    // drift bug the fallback above is defending against. Mirrors the
    // logic in lib/db/users.ts exactly.
    let tier: 'free' | 'pro' = 'free'
    if (dbUser.isGrandfathered) {
      tier = 'pro'
    } else if (dbUser.hasLifetimeAccess) {
      tier = 'pro'
    } else if (dbUser.subscriptionStatus === 'active' && dbUser.subscriptionTier === 'pro') {
      tier = 'pro'
    }

    return NextResponse.json(
      {
        tier,
        status: dbUser.subscriptionStatus,
        isGrandfathered: dbUser.isGrandfathered,
        currentPeriodEnd: dbUser.subscriptionCurrentPeriodEnd,
        stripeCustomerId: dbUser.stripeCustomerId,
        isPro: tier === 'pro',
      },
      { status: 200, headers: response.headers }
    )
  } catch (error: any) {
    console.error('Error fetching subscription data:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch subscription data' },
      { status: 500 }
    )
  }
}
