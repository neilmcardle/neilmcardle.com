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
        { error: 'Unauthorized', authError: authError?.message ?? null },
        { status: 401, headers: response.headers }
      )
    }

    // DIAGNOSTIC MODE v2: run both lookups and surface raw results in the
    // response. This is here because the normal error-swallowing path in
    // getUserById/getUserByEmail has been hiding the true reason production
    // Drizzle reads of public.users return null despite the rows existing.
    // Remove this block and restore normal logic once the root cause is
    // identified from the returned debug payload.
    const byIdResult = await getUserById(user.id)
    const byEmailResult = user.email ? await getUserByEmail(user.email) : null

    const dbUser = byIdResult.user || byEmailResult?.user || null

    if (!dbUser) {
      return NextResponse.json(
        {
          error: 'User not found',
          debug: {
            authId: user.id,
            authEmail: user.email ?? null,
            getUserById: {
              foundUser: byIdResult.user ? true : false,
              error: byIdResult.error
                ? {
                    message: (byIdResult.error as Error).message ?? String(byIdResult.error),
                    name: (byIdResult.error as Error).name ?? null,
                    stack: (byIdResult.error as Error).stack ?? null,
                  }
                : null,
            },
            getUserByEmail: byEmailResult
              ? {
                  foundUser: byEmailResult.user ? true : false,
                  error: byEmailResult.error
                    ? {
                        message: (byEmailResult.error as Error).message ?? String(byEmailResult.error),
                        name: (byEmailResult.error as Error).name ?? null,
                        stack: (byEmailResult.error as Error).stack ?? null,
                      }
                    : null,
                }
              : null,
            databaseUrlHostFragment: (process.env.DATABASE_URL ?? '').split('@')[1]?.split(':')[0] ?? 'none',
          },
        },
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
