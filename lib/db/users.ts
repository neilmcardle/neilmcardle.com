import { eq } from 'drizzle-orm'
import { db } from './index'
import { users, type NewUser } from './schema'

export async function createUser(userData: {
  id: string
  email: string
  username?: string
}) {
  try {
    const [user] = await db
      .insert(users)
      .values({
        id: userData.id,
        email: userData.email,
        username: userData.username,
      })
      .returning()

    return { user, error: null }
  } catch (error) {
    console.error('Error creating user:', error)
    return { user: null, error }
  }
}

export async function getUserById(id: string) {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1)

    return { user: user || null, error: null }
  } catch (error) {
    console.error('Error fetching user:', error)
    return { user: null, error }
  }
}

export async function updateUser(id: string, updates: Partial<NewUser>) {
  try {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning()

    return { user, error: null }
  } catch (error) {
    console.error('Error updating user:', error)
    return { user: null, error }
  }
}

// ===== SUBSCRIPTION HELPER FUNCTIONS =====

/**
 * Get the subscription tier for a user
 * Returns 'pro' for grandfathered users, lifetime access users, and active Pro subscribers
 * Returns 'free' for all other cases
 */
export async function getUserSubscriptionTier(userId: string): Promise<'free' | 'pro'> {
  try {
    const [user] = await db
      .select({
        subscriptionTier: users.subscriptionTier,
        isGrandfathered: users.isGrandfathered,
        hasLifetimeAccess: users.hasLifetimeAccess,
        subscriptionStatus: users.subscriptionStatus,
        subscriptionCurrentPeriodEnd: users.subscriptionCurrentPeriodEnd,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (!user) return 'free'

    // Grandfathered users always get Pro (lifetime access)
    if (user.isGrandfathered) return 'pro'

    // Lifetime access users get Pro
    if (user.hasLifetimeAccess) return 'pro'

    // Check if subscription is active and valid
    if (user.subscriptionStatus === 'active' && user.subscriptionTier === 'pro') {
      // Optionally check if subscription period is still valid
      if (user.subscriptionCurrentPeriodEnd) {
        const now = new Date()
        const periodEnd = new Date(user.subscriptionCurrentPeriodEnd)
        if (periodEnd < now) {
          // Subscription expired but Stripe hasn't updated status yet
          // This is a grace period - still allow access
          console.warn(`User ${userId} subscription expired but status still active`)
        }
      }
      return 'pro'
    }

    // Default to free tier
    return 'free'
  } catch (error) {
    console.error('Error fetching user subscription tier:', error)
    // Fail safe: return free tier on error
    return 'free'
  }
}

/**
 * Update user's subscription information
 * Used by Stripe webhook handlers to sync subscription state
 */
export async function updateUserSubscription(
  userId: string,
  updates: {
    stripeCustomerId?: string
    stripeSubscriptionId?: string
    subscriptionStatus?: 'active' | 'canceled' | 'past_due' | 'incomplete'
    subscriptionTier?: 'free' | 'pro'
    subscriptionCurrentPeriodEnd?: Date
    stripePriceId?: string
  }
) {
  return updateUser(userId, updates)
}

/**
 * Find user by email address
 */
export async function getUserByEmail(email: string) {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    return { user: user || null, error: null }
  } catch (error) {
    console.error('Error fetching user by email:', error)
    return { user: null, error }
  }
}

/**
 * Find user by Stripe customer ID
 * Used by webhook handlers to identify which user the subscription belongs to
 */
export async function getUserByStripeCustomerId(stripeCustomerId: string) {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.stripeCustomerId, stripeCustomerId))
      .limit(1)

    return { user: user || null, error: null }
  } catch (error) {
    console.error('Error fetching user by Stripe customer ID:', error)
    return { user: null, error }
  }
}

/**
 * Check if a user has access to a Pro feature
 * Returns true if user is Pro or grandfathered
 */
export async function userHasProAccess(userId: string): Promise<boolean> {
  const tier = await getUserSubscriptionTier(userId)
  return tier === 'pro'
}

/**
 * Grant lifetime access to a user
 * Used by Stripe webhook handlers to process lifetime purchases
 */
export async function grantLifetimeAccess(
  userId: string,
  paymentId: string
) {
  return updateUser(userId, {
    hasLifetimeAccess: true,
    lifetimePaymentId: paymentId,
    subscriptionTier: 'pro',
  })
}