import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { CookieOptions } from '@supabase/ssr'
import { getUserSubscriptionTier, getUserById } from '@/lib/db/users'

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

    // Get user from database
    const { user: dbUser, error: dbError } = await getUserById(user.id)

    if (dbError || !dbUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404, headers: response.headers }
      )
    }

    // Get computed subscription tier (handles grandfathering logic)
    const tier = await getUserSubscriptionTier(user.id)

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
