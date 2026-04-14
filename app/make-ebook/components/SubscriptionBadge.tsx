"use client";

// Pure status badge: Pro / Lifetime / Free. No click target, no upgrade
// prompt. Upgrade messaging lives exclusively in the account dropdown
// menus (UserDropdownSlim, UserDropdownMobile) per CLAUDE.md Pro vs Free
// UI policy — one upgrade location, everywhere else the badge is
// information-only.

import React from 'react';
import { useSubscription } from '@/lib/hooks/useSubscription';

interface SubscriptionBadgeProps {
  className?: string;
}

export default function SubscriptionBadge({ className = '' }: SubscriptionBadgeProps) {
  const { tier, isGrandfathered, isLoading } = useSubscription();

  if (isLoading) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-[#262626] ${className}`}>
        <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-[#3a3a3a] animate-pulse" />
        <span className="text-xs font-medium text-gray-500 dark:text-[#a3a3a3]">Loading…</span>
      </div>
    );
  }

  if (isGrandfathered) {
    return (
      <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#1a1a1a] dark:bg-white border border-gray-200 dark:border-[#2f2f2f] ${className}`}>
        <span className="text-2xs font-semibold text-white dark:text-[#1a1a1a] uppercase tracking-wide">Pro (Lifetime)</span>
      </div>
    );
  }

  if (tier === 'pro') {
    return (
      <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#1a1a1a] dark:bg-white border border-gray-200 dark:border-[#2f2f2f] ${className}`}>
        <span className="text-2xs font-semibold text-white dark:text-[#1a1a1a] uppercase tracking-wide">Pro</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-[#262626] border border-gray-300 dark:border-[#2f2f2f] ${className}`}>
      <span className="text-xs font-medium text-gray-600 dark:text-[#a3a3a3] uppercase tracking-wide">Free</span>
    </div>
  );
}
