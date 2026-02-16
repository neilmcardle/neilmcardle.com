import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerClient } from '@supabase/ssr'
import { CookieOptions } from '@supabase/ssr'
import { getUserById } from '@/lib/db/users'

/**
 * Customer Portal Endpoint
 *
 * Creates a Stripe Customer Portal session
 * Allows Pro users to:
 * - Update payment method
 * - View invoices
 * - Cancel subscription
 * - Update billing details
 *
 * This saves you from building custom subscription management UI
 */
export async function POST(req: NextRequest) {
  try {
    // Check Stripe configuration and initialize inside handler
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 500 }
      )
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia',
    })

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

    // Check if user has a Stripe customer ID
    if (!dbUser.stripeCustomerId) {
      console.log(`❌ User ${user.id} has no Stripe customer ID`);
      return NextResponse.json(
        { error: 'No subscription found. Please subscribe to Pro first.' },
        { status: 404, headers: response.headers }
      )
    }

    // Don't allow grandfathered users to access portal
    // They have lifetime access and shouldn't be able to cancel
    if (dbUser.isGrandfathered) {
      console.log(`❌ User ${user.id} is grandfathered - cannot access portal`);
      return NextResponse.json(
        { error: 'Grandfathered users cannot manage subscription. You have lifetime Pro access!' },
        { status: 403, headers: response.headers }
      )
    }

    // Build app URL for redirect
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    console.log(`🔗 Creating portal session for user ${user.id}, customer ${dbUser.stripeCustomerId}, return URL: ${appUrl}/make-ebook`);

    // Create portal session
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

    // Handle specific Stripe errors
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
