"use client"

import { useSubscription } from "@/lib/hooks/useSubscription"

/**
 * Renders only when the active subscription is in its Stripe-managed trial.
 * Shows a thin strip at the top of the editor with days remaining and a
 * billing link, so trial users always know when their card will be charged.
 */
export default function TrialBanner() {
  const { status, currentPeriodEnd, isLoading } = useSubscription()

  if (isLoading) return null
  if (status !== "trialing") return null

  const daysLeft = calculateDaysLeft(currentPeriodEnd)
  if (daysLeft === null) return null

  const label =
    daysLeft <= 0
      ? "Trial ends today"
      : daysLeft === 1
        ? "1 day left in your trial"
        : `${daysLeft} days left in your trial`

  return (
    <div className="w-full bg-[#141413] text-[#faf9f5] border-b border-black/10 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-center gap-3 flex-wrap">
        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-medium">{label}</span>
        <span className="text-white/50 hidden sm:inline">·</span>
        <span className="text-white/70">
          Card on file. You can cancel anytime before your trial ends.
        </span>
      </div>
    </div>
  )
}

function calculateDaysLeft(periodEnd: string | null): number | null {
  if (!periodEnd) return null
  const end = new Date(periodEnd).getTime()
  if (Number.isNaN(end)) return null
  const msLeft = end - Date.now()
  if (msLeft < 0) return 0
  return Math.ceil(msLeft / (1000 * 60 * 60 * 24))
}
