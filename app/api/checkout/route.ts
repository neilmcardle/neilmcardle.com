import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerClient } from '@supabase/ssr'
import { CookieOptions } from '@supabase/ssr'
import { getUserById, updateUser } from '@/lib/db/users'

/**
 * Checkout Session Endpoint
 *
 * Creates a Stripe Checkout Session for subscribing to Pro tier
 * Redirects user to Stripe-hosted checkout page
 *
 * Advantages over Payment Intents:
 * - Better UX with hosted checkout page
 * - Handles 3D Secure automatically
 * - Includes tax calculation if configured
 * - Built-in success/cancel URLs
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

    if (!process.env.STRIPE_PRO_PRICE_ID) {
      return NextResponse.json(
        { error: 'Stripe Pro price not configured' },
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

    // Check if user is already Pro
    if (dbUser.subscriptionTier === 'pro' && dbUser.subscriptionStatus === 'active') {
      return NextResponse.json(
        { error: 'Already subscribed to Pro' },
        { status: 400, headers: response.headers }
      )
    }

    // Create or get Stripe customer
    let customerId = dbUser.stripeCustomerId

    if (!customerId) {
      console.log(`Creating Stripe customer for user ${user.id}`)
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: {
          supabase_user_id: user.id,
        },
      })
      customerId = customer.id

      // Update user with customer ID
      await updateUser(user.id, {
        stripeCustomerId: customerId,
      })
    }

    // Build app URL for redirects
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRO_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/make-ebook?checkout=success`,
      cancel_url: `${appUrl}/make-ebook?checkout=canceled`,
      allow_promotion_codes: true, // Allow users to apply promo codes
      billing_address_collection: 'auto',
      metadata: {
        supabase_user_id: user.id,
      },
    })

    console.log(`✅ Checkout session created for user ${user.id}: ${session.id}`)

    return NextResponse.json(
      { url: session.url },
      { status: 200, headers: response.headers }
    )
  } catch (error: any) {
    console.error('Error creating checkout session:', error)

    // Handle specific Stripe errors
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
