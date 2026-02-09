import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerClient } from '@supabase/ssr'
import { CookieOptions } from '@supabase/ssr'
import { getUserById, updateUser } from '@/lib/db/users'

/**
 * Lifetime Checkout Endpoint
 *
 * Creates a Stripe Checkout Session for the one-time $149 lifetime purchase
 * Handles the one-time payment flow
 */
export async function POST(req: NextRequest) {
  try {
    // Check Stripe configuration
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 500 }
      )
    }

    if (!process.env.STRIPE_LIFETIME_PRICE_ID) {
      return NextResponse.json(
        { error: 'Stripe Lifetime price not configured' },
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

    // Check if user already has lifetime access
    if (dbUser.hasLifetimeAccess) {
      return NextResponse.json(
        { error: 'You already have lifetime access' },
        { status: 400, headers: response.headers }
      )
    }

    // Check if user already has active subscription
    if (dbUser.subscriptionTier === 'pro' && dbUser.subscriptionStatus === 'active') {
      return NextResponse.json(
        { error: 'You already have an active subscription. Please cancel it first to purchase lifetime access.' },
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

    // Create Checkout Session for one-time payment
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_LIFETIME_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/make-ebook?checkout=success&type=lifetime`,
      cancel_url: `${appUrl}/make-ebook?checkout=canceled`,
      billing_address_collection: 'auto',
      metadata: {
        supabase_user_id: user.id,
        purchase_type: 'lifetime',
      },
    })

    console.log(`✅ Lifetime checkout session created for user ${user.id}: ${session.id}`)

    return NextResponse.json(
      { url: session.url },
      { status: 200, headers: response.headers }
    )
  } catch (error: any) {
    console.error('Error creating lifetime checkout session:', error)

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
