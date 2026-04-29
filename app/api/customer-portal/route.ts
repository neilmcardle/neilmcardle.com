export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerClient } from '@supabase/ssr'
import { CookieOptions } from '@supabase/ssr'
import { getUserById } from '@/lib/db/users'

/**
 * Create a billing portal session for the current user.
 */
export async function POST(req: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 500 }
      )
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-06-20',
    })

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

    const { user: dbUser, error: dbError } = await getUserById(user.id)

    if (dbError || !dbUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404, headers: response.headers }
      )
    }

    if (!dbUser.stripeCustomerId) {
      console.log(`❌ User ${user.id} has no Stripe customer ID`);
      return NextResponse.json(
        { error: 'No subscription found. Please subscribe to Pro first.' },
        { status: 404, headers: response.headers }
      )
    }

    if (dbUser.isGrandfathered) {
      console.log(`❌ User ${user.id} is grandfathered - cannot access portal`);
      return NextResponse.json(
        { error: 'Grandfathered users cannot manage subscription. You have lifetime Pro access!' },
        { status: 403, headers: response.headers }
      )
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    console.log(`🔗 Creating portal session for user ${user.id}, customer ${dbUser.stripeCustomerId}, return URL: ${appUrl}/make-ebook`);

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: dbUser.stripeCustomerId,
      return_url: `${appUrl}/make-ebook`,
    })

    console.log(`✅ Customer portal session created for user ${user.id}`)

    return NextResponse.json(
      { url: portalSession.url },
      { status: 200, headers: response.headers }
    )
  } catch (error: any) {
    console.error('Error creating customer portal session:', error)

    if (error.type === 'StripeInvalidRequestError') {
      return NextResponse.json(
        { error: 'Invalid customer. Please contact support.' },
        { status: 400 }
      )
    }

    if (error.type === 'StripeRateLimitError') {
      return NextResponse.json(
        { error: 'Too many requests. Please try again in a moment.' },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Failed to create customer portal session' },
      { status: 500 }
    )
  }
}
