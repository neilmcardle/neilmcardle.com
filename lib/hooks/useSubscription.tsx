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
  const { user, isAuthenticated } = useAuth()
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
    if (!isAuthenticated || !user) {
      // User not authenticated - default to free tier
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

    // Fetch subscription data
    const fetchSubscription = async () => {
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
  }, [user, isAuthenticated])

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
