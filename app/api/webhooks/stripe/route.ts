import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getUserByStripeCustomerId, updateUserSubscription } from '@/lib/db/users'

// Disable body parsing - we need the raw body for signature verification
export const runtime = 'nodejs'

/**
 * Stripe Webhook Handler
 *
 * This is the MOST CRITICAL endpoint for subscription management.
 * It receives events from Stripe and syncs subscription state to the database.
 *
 * Events handled:
 * - customer.subscription.created: New subscription started
 * - customer.subscription.updated: Subscription renewed or modified
 * - customer.subscription.deleted: Subscription canceled
 * - invoice.payment_succeeded: Payment successful
 * - invoice.payment_failed: Payment failed
 */
export async function POST(req: NextRequest) {
  try {
    // Initialize Stripe inside handler to avoid build-time errors
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('Stripe not configured')
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 500 }
      )
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia',
    })
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
      console.error('Webhook error: No signature provided')
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      )
    }

    // Verify webhook signature (CRITICAL for security)
    // This ensures the request actually came from Stripe
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      const error = err as Error
      console.error('Webhook signature verification failed:', error.message)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    console.log(`Received webhook event: ${event.type}`)

    // Handle the event
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionCanceled(event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

/**
 * Handle subscription creation or update
 * Syncs Stripe subscription state to database
 */
async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string

  console.log(`Handling subscription update for customer: ${customerId}`)

  // Find user by Stripe customer ID
  const { user, error } = await getUserByStripeCustomerId(customerId)

  if (error || !user) {
    console.error(`User not found for Stripe customer: ${customerId}`)
    return
  }

  // Don't downgrade grandfathered users
  if (user.isGrandfathered) {
    console.log(`User ${user.id} is grandfathered - keeping Pro access`)
    return
  }

  // Determine subscription tier based on status
  const tier: 'free' | 'pro' = subscription.status === 'active' ? 'pro' : 'free'

  // Update user subscription in database
  const { error: updateError } = await updateUserSubscription(user.id, {
    stripeSubscriptionId: subscription.id,
    subscriptionStatus: subscription.status as 'active' | 'canceled' | 'past_due' | 'incomplete',
    subscriptionTier: tier,
    subscriptionCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
    stripePriceId: subscription.items.data[0]?.price.id,
  })

  if (updateError) {
    console.error(`Failed to update user ${user.id}:`, updateError)
    return
  }

  console.log(`✅ Subscription updated for user ${user.id}: ${subscription.status} (${tier})`)
}

/**
 * Handle subscription cancellation
 * Downgrades user to free tier (unless grandfathered)
 */
async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string

  console.log(`Handling subscription cancellation for customer: ${customerId}`)

  const { user, error } = await getUserByStripeCustomerId(customerId)

  if (error || !user) {
    console.error(`User not found for Stripe customer: ${customerId}`)
    return
  }

  // Don't downgrade grandfathered users
  if (user.isGrandfathered) {
    console.log(`User ${user.id} is grandfathered - keeping Pro access despite cancellation`)
    return
  }

  // Downgrade to free tier
  const { error: updateError } = await updateUserSubscription(user.id, {
    subscriptionStatus: 'canceled',
    subscriptionTier: 'free',
  })

  if (updateError) {
    console.error(`Failed to downgrade user ${user.id}:`, updateError)
    return
  }

  console.log(`✅ Subscription canceled for user ${user.id} - downgraded to free`)
}

/**
 * Handle successful payment
 * Subscription status will be updated by subscription.updated webhook
 */
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string

  console.log(`Payment succeeded for customer: ${customerId}`)

  const { user } = await getUserByStripeCustomerId(customerId)

  if (user) {
    console.log(`✅ Payment succeeded for user ${user.id}`)
  }

  // Note: Subscription status will be updated by the subscription.updated webhook
  // No need to update database here
}

/**
 * Handle failed payment
 * Marks subscription as past_due
 * Stripe will automatically retry failed payments
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string

  console.log(`Payment failed for customer: ${customerId}`)

  const { user, error } = await getUserByStripeCustomerId(customerId)

  if (error || !user) {
    console.error(`User not found for Stripe customer: ${customerId}`)
    return
  }

  // Mark subscription as past_due
  // Stripe will automatically retry payment
  // User keeps access during retry period (grace period)
  const { error: updateError } = await updateUserSubscription(user.id, {
    subscriptionStatus: 'past_due',
  })

  if (updateError) {
    console.error(`Failed to update user ${user.id} payment status:`, updateError)
    return
  }

  console.log(`⚠️ Payment failed for user ${user.id} - marked as past_due`)

  // TODO: Send email notification to user about failed payment
  // TODO: Implement in Phase 3 or later
}
