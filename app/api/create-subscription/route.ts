import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerClient } from '@supabase/ssr'
import { CookieOptions } from '@supabase/ssr'

export async function POST(req: NextRequest) {
  try {
    // Check for Stripe secret key at runtime, not build time
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 500 }
      )
    }

    // Initialize Stripe with the secret key
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-08-27.basil',
    })

    const { priceId } = await req.json()
    
    const response = NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    
    // Create Supabase client with cookie support
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return req.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: CookieOptions) {
            response.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    )

    // Get user from Supabase session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: response.headers })
    }

    // Check if user already has a subscription
    const { data: existingUser } = await supabase
      .from('users')
      .select('stripe_customer_id, stripe_subscription_id')
      .eq('id', user.id)
      .single()

    let customerId = existingUser?.stripe_customer_id

    // Create customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: {
          supabase_user_id: user.id,
        },
      })
      customerId = customer.id

      // Update user with customer ID
      await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email!,
          stripe_customer_id: customerId,
        })
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{
        price: priceId || process.env.STRIPE_PRICE_ID, // Fallback to env variable
      }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    })

    // Update user with subscription ID
    await supabase
      .from('users')
      .update({
        stripe_subscription_id: subscription.id,
        subscription_status: subscription.status as any,
      })
      .eq('id', user.id)

    return NextResponse.json({
      subscriptionId: subscription.id,
      clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
    }, { status: 200, headers: response.headers })
  } catch (error: any) {
    console.error('Error creating subscription:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}