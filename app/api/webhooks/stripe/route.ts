import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import {
  getUserByStripeCustomerId,
  getUserByEmail,
  getUserById,
  updateUserSubscription,
  grantLifetimeAccess,
  createUser,
} from '@/lib/db/users'
import { createAdminClient } from '@/lib/supabase/admin'
import { getProduct, type VectorPaintProductId } from '@/lib/vector-paint/products'
import { createGelatoOrder } from '@/lib/vector-paint/gelato'

// Raw body required for signature verification.
export const runtime = 'nodejs'

/**
 * Webhook handler for subscription and payment events.
 */
export async function POST(req: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('Stripe not configured')
      return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 })
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-06-20',
    })
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
      console.error('Webhook error: No signature provided')
      return NextResponse.json({ error: 'No signature provided' }, { status: 400 })
    }

    // Signature verification is required.
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      const error = err as Error
      console.error('Webhook signature verification failed:', error.message)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    console.log(`Received webhook event: ${event.type}`)

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription, stripe)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionCanceled(event.data.object as Stripe.Subscription, stripe)
        break

      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session, stripe)
        break

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice, stripe)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

/**
 * Look up a user by external customer ID, with email fallback.
 */
async function findUserByCustomerId(customerId: string, stripe: Stripe) {
  const { user } = await getUserByStripeCustomerId(customerId)
  if (user) return { user, error: null }

  try {
    const stripeCustomer = await stripe.customers.retrieve(customerId) as Stripe.Customer
    if (!stripeCustomer.deleted && stripeCustomer.email) {
      const { user: emailUser, error: emailError } = await getUserByEmail(stripeCustomer.email)
      if (emailUser) {
        if (!emailUser.stripeCustomerId) {
          await updateUserSubscription(emailUser.id, { stripeCustomerId: customerId })
        }
        return { user: emailUser, error: null }
      }
      return { user: null, error: emailError }
    }
  } catch (e) {
    console.error('Failed to look up Stripe customer for email fallback:', e)
  }

  return { user: null, error: null }
}

/**
 * Sync subscription state to the database.
 */
async function handleSubscriptionUpdate(subscription: Stripe.Subscription, stripe: Stripe) {
  const customerId = subscription.customer as string
  console.log(`Handling subscription update for customer: ${customerId}`)

  const { user, error } = await findUserByCustomerId(customerId, stripe)

  if (error || !user) {
    console.error(`User not found for Stripe customer: ${customerId}`)
    return
  }

  if (user.isGrandfathered) {
    console.log(`User ${user.id} is grandfathered - keeping Pro access`)
    return
  }

  const tier: 'free' | 'pro' = subscription.status === 'active' ? 'pro' : 'free'

  // current_period_end is on the subscription item in newer API versions.
  const periodEndRaw = subscription.items?.data[0]?.current_period_end
  let subscriptionCurrentPeriodEnd: Date | undefined
  if (periodEndRaw && typeof periodEndRaw === 'number') {
    const periodEndMs = periodEndRaw * 1000
    const dateObj = new Date(periodEndMs)
    if (!isNaN(dateObj.getTime())) {
      subscriptionCurrentPeriodEnd = dateObj
    }
  }

  const { error: updateError } = await updateUserSubscription(user.id, {
    stripeSubscriptionId: subscription.id,
    subscriptionStatus: subscription.status as 'active' | 'canceled' | 'past_due' | 'incomplete',
    subscriptionTier: tier,
    subscriptionCurrentPeriodEnd,
    stripePriceId: subscription.items.data[0]?.price.id,
  })

  if (updateError) {
    console.error(`Failed to update user ${user.id}:`, updateError)
    return
  }

  console.log(`✅ Subscription updated for user ${user.id}: ${subscription.status} (${tier})`)
}

/**
 * Downgrade the user to the free tier.
 */
async function handleSubscriptionCanceled(subscription: Stripe.Subscription, stripe: Stripe) {
  const customerId = subscription.customer as string
  console.log(`Handling subscription cancellation for customer: ${customerId}`)

  const { user, error } = await findUserByCustomerId(customerId, stripe)

  if (error || !user) {
    console.error(`User not found for Stripe customer: ${customerId}`)
    return
  }

  if (user.isGrandfathered) {
    console.log(`User ${user.id} is grandfathered - keeping Pro access despite cancellation`)
    return
  }

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
 * Handle a successful payment notification.
 */
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string
  console.log(`Payment succeeded for customer: ${customerId}`)
  // Subscription status is synced via the subscription.updated event.
}

/**
 * Mark a subscription as past_due after a failed payment.
 */
async function handlePaymentFailed(invoice: Stripe.Invoice, stripe: Stripe) {
  const customerId = invoice.customer as string
  console.log(`Payment failed for customer: ${customerId}`)

  const { user, error } = await findUserByCustomerId(customerId, stripe)

  if (error || !user) {
    console.error(`User not found for Stripe customer: ${customerId}`)
    return
  }

  const { error: updateError } = await updateUserSubscription(user.id, {
    subscriptionStatus: 'past_due',
  })

  if (updateError) {
    console.error(`Failed to update user ${user.id} payment status:`, updateError)
    return
  }

  console.log(`⚠️ Payment failed for user ${user.id} - marked as past_due`)
}

/**
 * Grant access on checkout completion.
 */
async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
  stripe: Stripe
) {
  const customerId = session.customer as string
  const email = session.customer_details?.email
  const purchaseType = session.metadata?.purchase_type
  const supabaseUserId = session.metadata?.supabase_user_id

  console.log(`Checkout completed: ${session.id}, type: ${purchaseType}, customer: ${customerId}`)

  if (purchaseType === 'vector_paint_print') {
    await handleVectorPaintOrder(session)
    return
  }

  let user: Awaited<ReturnType<typeof getUserById>>['user'] = null

  if (supabaseUserId) {
    const { user: u } = await getUserById(supabaseUserId)
    user = u
  }

  if (!user) {
    const { user: u } = await getUserByStripeCustomerId(customerId)
    user = u
  }

  if (!user && email) {
    const { user: u, error: emailError } = await getUserByEmail(email)
    if (emailError) {
      console.error(`DB error looking up user by email ${email}:`, emailError)
      return
    }
    user = u
  }

  // Create a new user record for first-time checkout.
  if (!user && email) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://makeebook.ink'

    try {
      const adminClient = createAdminClient()

      const { data: inviteData, error: inviteError } =
        await adminClient.auth.admin.inviteUserByEmail(email, {
          redirectTo: `${appUrl}/auth/callback`,
        })

      if (inviteError) {
        console.error(`Failed to invite new user ${email}:`, inviteError)
        return
      }

      const { user: newUser, error: createError } = await createUser({
        id: inviteData.user.id,
        email: inviteData.user.email!,
      })

      if (createError || !newUser) {
        console.error(`Failed to create DB record for ${email}:`, createError)
        return
      }

      user = newUser
      console.log(`✅ New user invited and created: ${user.id} (${email})`)
    } catch (err) {
      console.error(`Failed to create user for ${email}:`, err)
      return
    }
  }

  if (!user) {
    console.error(`Could not find or create user for checkout session: ${session.id}`)
    return
  }

  if (!user.stripeCustomerId && customerId) {
    await updateUserSubscription(user.id, { stripeCustomerId: customerId })
  }

  if (purchaseType === 'lifetime' && session.payment_status === 'paid') {
    const paymentIntentId = session.payment_intent as string
    const { error: updateError } = await grantLifetimeAccess(user.id, paymentIntentId)

    if (updateError) {
      console.error(`Failed to grant lifetime access to user ${user.id}:`, updateError)
      return
    }

    console.log(`✅ Lifetime access granted to user ${user.id}`)
  } else if (purchaseType === 'pro') {
    // Access is granted by the subscription event that follows.
    console.log(`✅ Pro checkout completed for user ${user.id} — subscription event will follow`)
  } else {
    console.log(`Unrecognized purchase type: ${purchaseType} for session ${session.id}`)
  }
}

async function handleVectorPaintOrder(session: Stripe.Checkout.Session) {
  const productId = session.metadata?.product_id as VectorPaintProductId | undefined
  const printFileUrl = session.metadata?.print_file_url

  if (!productId || !printFileUrl) {
    console.error(`Vector Paint order missing metadata on session ${session.id}`)
    return
  }

  try {
    const product = getProduct(productId)
    const gelatoOrder = await createGelatoOrder({ session, product, printFileUrl })
    console.log(
      `Gelato order created: ${gelatoOrder.id} (status: ${gelatoOrder.fulfillmentStatus}) for Stripe session ${session.id}`
    )
  } catch (err: any) {
    console.error(`Vector Paint order failed for session ${session.id}:`, err.message ?? err)
    // Don't rethrow: payment succeeded but fulfilment failed; needs a manual recovery path.
    // TODO: surface to ops.
  }
}
