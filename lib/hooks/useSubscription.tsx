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
    // Wait for auth to settle before deciding a tier. While loading,
    // "not authenticated" really means "unknown", and treating that as
    // free causes downstream consumers to gate the wrong way.
    if (authLoading) return

    if (!isAuthenticated || !user) {
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

    // Fetch with a single retry to handle a known auth-cookie race on first load.
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

        // Authenticated user but server returned free: retry once for the
        // cookie race, then accept whatever comes back.
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
 * Access the current subscription state.
 */
export function useSubscription() {
  const context = useContext(SubscriptionContext)
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider')
  }
  return context
}

/**
 * Returns true when the user has Pro access.
 */
export function useIsPro() {
  const { isPro } = useSubscription()
  return isPro
}

/**
 * Check whether the current user has access to a specific feature.
 * @param feature - Feature key to check
 * @returns true if the feature is available to this user
 */
export function useFeatureAccess(feature: 'book_mind_ai' | 'cloud_sync' | 'version_history' | 'export_history') {
  const { tier } = useSubscription()

  const proFeatures = ['book_mind_ai', 'cloud_sync']

  if (proFeatures.includes(feature)) {
    return tier === 'pro'
  }

  return true
}
