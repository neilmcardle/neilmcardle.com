import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerClient } from '@supabase/ssr'
import { CookieOptions } from '@supabase/ssr'
import { getUserById, updateUser } from '@/lib/db/users'

/**
 * Checkout Session Endpoint
 *
 * Creates a Stripe Checkout Session for subscribing to Pro tier.
 * Works for both authenticated and unauthenticated users:
 * - Authenticated: uses existing Stripe customer, checks for duplicate subscription
 * - Unauthenticated: Stripe collects email during checkout; webhook creates account after payment
 */
export async function POST(req: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 })
    }

    if (!process.env.STRIPE_PRO_PRICE_ID) {
      return NextResponse.json({ error: 'Stripe Pro price not configured' }, { status: 500 })
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-08-27.basil',
    })

    // Try to get authenticated user (optional — unauthenticated checkout is allowed)
    let supabaseUserId: string | null = null
    let existingCustomerId: string | null = null

    try {
      const tempResponse = new NextResponse()
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return req.cookies.get(name)?.value
            },
            set(name: string, value: string, options: CookieOptions) {
              tempResponse.cookies.set({ name, value, ...options })
            },
            remove(name: string, options: CookieOptions) {
              tempResponse.cookies.set({ name, value: '', ...options })
            },
          },
        }
      )

      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        supabaseUserId = user.id
        const { user: dbUser } = await getUserById(user.id)

        if (dbUser) {
          // Already subscribed — prevent duplicate
          if (dbUser.subscriptionTier === 'pro' && dbUser.subscriptionStatus === 'active') {
            return NextResponse.json({ error: 'Already subscribed to Pro' }, { status: 400 })
          }

          existingCustomerId = dbUser.stripeCustomerId ?? null

          // Create Stripe customer if this user doesn't have one yet
          if (!existingCustomerId) {
            const customer = await stripe.customers.create({
              email: user.email!,
              metadata: { supabase_user_id: user.id },
            })
            existingCustomerId = customer.id
            await updateUser(user.id, { stripeCustomerId: existingCustomerId })
          }
        }
      }
    } catch {
      // User not authenticated — proceed with unauthenticated checkout
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: process.env.STRIPE_PRO_PRICE_ID, quantity: 1 }],
      success_url: `${appUrl}/make-ebook?checkout=success`,
      cancel_url: `${appUrl}/make-ebook?checkout=canceled`,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      metadata: {
        purchase_type: 'pro',
        ...(supabaseUserId ? { supabase_user_id: supabaseUserId } : {}),
      },
    }

    if (existingCustomerId) {
      sessionParams.customer = existingCustomerId
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    console.log(`✅ Pro checkout session created: ${session.id}`)

    return NextResponse.json({ url: session.url }, { status: 200 })
  } catch (error: any) {
    console.error('Error creating checkout session:', error)

    if (error.type === 'StripeCardError') {
      return NextResponse.json(
        { error: 'Your card was declined. Please try a different payment method.' },
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
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
