import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { CookieOptions } from '@supabase/ssr'
import { getUserById, getUserByEmail } from '@/lib/db/users'

/**
 * Subscription Data Endpoint
 *
 * Returns current user's subscription information for client-side display
 * Used by useSubscription hook
 */
export async function GET(req: NextRequest) {
  try {
    const response = NextResponse.json({ error: 'Internal server error' }, { status: 500 })

    // Get authenticated user
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

    // Primary lookup: match by auth UUID. This is the happy path and the
    // only path that should fire in a healthy system.
    let { user: dbUser } = await getUserById(user.id)

    // Fallback lookup: match by email. Fires when the public.users row's id
    // has drifted out of sync with auth.users.id — e.g. row created under an
    // older auth UUID that has since rotated, or inserted manually with a
    // stale id. The email is on the validated JWT so we can trust it, and
    // users.email is UNIQUE so this is a safe match. When this fallback
    // triggers, we log a loud warning so the mismatch shows up in runtime
    // logs and can be investigated and fixed at the data layer.
    if (!dbUser && user.email) {
      const { user: fallbackUser } = await getUserByEmail(user.email)
      if (fallbackUser) {
        console.warn(
          `[subscription] id-lookup failed but email-lookup succeeded for ${user.email}. ` +
          `auth.id=${user.id}, public.users.id=${fallbackUser.id}. ` +
          `Rows are out of sync — fix with: UPDATE public.users SET id = '${user.id}' WHERE email = '${user.email}';`
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

    // Compute tier from the dbUser we already have rather than hitting
    // getUserSubscriptionTier, which re-queries by id and would reproduce
    // the same drift bug. This mirrors the logic in lib/db/users.ts exactly.
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
