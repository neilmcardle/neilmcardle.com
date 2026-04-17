"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './useAuth'

export type SubscriptionTier = 'free' | 'pro'
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'incomplete' | null

interface SubscriptionData {
  tier: SubscriptionTier
  status: SubscriptionStatus
  isGrandfathered: boolean
  currentPeriodEnd: string | null
  stripeCustomerId: string | null
  isPro: boolean
  isLoading: boolean
  error: string | null
}

const SubscriptionContext = createContext<SubscriptionData | undefined>(undefined)

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [data, setData] = useState<SubscriptionData>({
    tier: 'free',
    status: null,
    isGrandfathered: false,
    currentPeriodEnd: null,
    stripeCustomerId: null,
    isPro: false,
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    // Wait for auth to settle before making any tier decision. If auth
    // is still resolving, "not authenticated" actually means "we don't
    // know yet" — collapsing that to tier='free' causes a race where
    // downstream consumers (Book Mind redirect, LayoutSwitcher gating,
    // etc.) briefly see a Pro user as Free and make the wrong call. We
    // keep isLoading=true until auth has genuinely landed on an answer.
    if (authLoading) return

    if (!isAuthenticated || !user) {
      // Auth has settled: user is genuinely anonymous. Default to free.
      setData({
        tier: 'free',
        status: null,
        isGrandfathered: false,
        currentPeriodEnd: null,
        stripeCustomerId: null,
        isPro: false,
        isLoading: false,
        error: null,
      })
      return
    }

    // Fetch subscription data with a single retry. On ~1 in 10 logins
    // the Supabase auth cookie hasn't fully propagated to the server by
    // the time this fetch fires, so /api/subscription returns tier=free
    // for a real Pro user. A 1-second retry catches the race: by the
    // second attempt the cookie is always ready.
    const fetchSubscription = async (attempt = 1) => {
      try {
        setData(prev => ({ ...prev, isLoading: true, error: null }))

        const response = await fetch('/api/subscription', {
          method: 'GET',
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error('Failed to fetch subscription data')
        }

        const result = await response.json()

        // If the server returned free but the user IS authenticated,
        // retry once after a short delay. The cookie race means the
        // first attempt sometimes misses the session.
        if (
          attempt === 1 &&
          (!result.isPro && result.tier === 'free') &&
          user?.email
        ) {
          console.warn('[subscription] first fetch returned free for authenticated user, retrying in 1s')
          await new Promise(r => setTimeout(r, 1000))
          return fetchSubscription(2)
        }

        setData({
          tier: result.tier || 'free',
          status: result.status || null,
          isGrandfathered: result.isGrandfathered || false,
          currentPeriodEnd: result.currentPeriodEnd || null,
          stripeCustomerId: result.stripeCustomerId || null,
          isPro: result.isPro || false,
          isLoading: false,
          error: null,
        })
      } catch (error) {
        console.error('Error fetching subscription:', error)
        setData({
          tier: 'free',
          status: null,
          isGrandfathered: false,
          currentPeriodEnd: null,
          stripeCustomerId: null,
          isPro: false,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to load subscription',
        })
      }
    }

    fetchSubscription()
  }, [user?.id, isAuthenticated, authLoading])

  return (
    <SubscriptionContext.Provider value={data}>
      {children}
    </SubscriptionContext.Provider>
  )
}

/**
 * Hook to access subscription data
 * Returns subscription tier, status, and grandfathering information
 */
export function useSubscription() {
  const context = useContext(SubscriptionContext)
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider')
  }
  return context
}

/**
 * Helper hook to check if user has Pro access
 * Returns true for Pro subscribers and grandfathered users
 */
export function useIsPro() {
  const { isPro } = useSubscription()
  return isPro
}

/**
 * Helper hook to check if user has access to a specific feature
 * @param feature - Feature name to check (e.g., 'book_mind_ai', 'cloud_sync')
 * @returns true if user has access to the feature
 */
export function useFeatureAccess(feature: 'book_mind_ai' | 'cloud_sync' | 'version_history' | 'export_history') {
  const { tier } = useSubscription()

  // Define which features require Pro tier
  const proFeatures = ['book_mind_ai', 'cloud_sync']

  // Check if feature requires Pro
  if (proFeatures.includes(feature)) {
    return tier === 'pro'
  }

  // All other features are available to everyone
  return true
}
