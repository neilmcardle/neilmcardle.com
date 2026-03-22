"use client";

import React, { useState } from 'react';
import { useSubscription } from '@/lib/hooks/useSubscription';
import { Sparkles } from 'lucide-react';
import UpgradeModal from './UpgradeModal';

interface SubscriptionBadgeProps {
  className?: string;
  showUpgradeButton?: boolean; // If true, Free users see an upgrade button
}

export default function SubscriptionBadge({
  className = '',
  showUpgradeButton = true
}: SubscriptionBadgeProps) {
  const { tier, isGrandfathered, isLoading } = useSubscription();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  if (isLoading) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-[#262626] ${className}`}>
        <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-[#3a3a3a] animate-pulse" />
        <span className="text-xs font-medium text-gray-500 dark:text-[#a3a3a3]">
          Loading...
        </span>
      </div>
    );
  }

  // Pro Badge (for active Pro subscribers)
  if (tier === 'pro' && !isGrandfathered) {
    return (
      <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#1a1a1a] dark:bg-white border border-gray-200 dark:border-[#2f2f2f] ${className}`}>
        <span className="text-2xs font-semibold text-white dark:text-[#1a1a1a] uppercase tracking-wide">Pro</span>
      </div>
    );
  }

  // Grandfathered Badge (lifetime Pro access)
  if (isGrandfathered) {
    return (
      <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#1a1a1a] dark:bg-white border border-gray-200 dark:border-[#2f2f2f] ${className}`}>
        <span className="text-2xs font-semibold text-white dark:text-[#1a1a1a] uppercase tracking-wide">Pro (Lifetime)</span>
      </div>
    );
  }

  // Free Tier - show upgrade button if enabled
  if (showUpgradeButton) {
    return (
      <>
        <button
          onClick={() => setShowUpgradeModal(true)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#262626] border-2 border-gray-300 dark:border-[#2f2f2f] hover:border-gray-900 dark:hover:border-white transition-all ${className}`}
        >
          <Sparkles className="w-3.5 h-3.5 text-gray-700 dark:text-[#d4d4d4]" />
          <span className="text-xs font-semibold text-gray-700 dark:text-[#d4d4d4] uppercase tracking-wide">
            Upgrade
          </span>
        </button>

        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
        />
      </>
    );
  }

  // Free Tier - plain badge (no upgrade button)
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-[#262626] border border-gray-300 dark:border-[#2f2f2f] ${className}`}>
      <span className="text-xs font-medium text-gray-600 dark:text-[#a3a3a3] uppercase tracking-wide">Free</span>
    </div>
  );
}

/**
 * Compact version of the badge for headers/toolbars
 */
export function SubscriptionBadgeCompact({ className = '' }: { className?: string }) {
  const { tier, isGrandfathered, isLoading } = useSubscription();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  if (isLoading) {
    return (
      <div className={`w-6 h-6 rounded-full bg-gray-200 dark:bg-[#2f2f2f] animate-pulse ${className}`} />
    );
  }

  // Pro Badge
  if (tier === 'pro') {
    return (
      <div
        className={`w-6 h-6 rounded-full bg-[#1a1a1a] dark:bg-white flex items-center justify-center border border-gray-200 dark:border-[#2f2f2f] ${className}`}
        title={isGrandfathered ? "Pro (Lifetime)" : "Pro"}
      >
        <span className="text-white dark:text-[#1a1a1a] font-bold text-2xs">P</span>
      </div>
    );
  }

  // Free Tier - clickable upgrade button
  return (
    <>
      <button
        onClick={() => setShowUpgradeModal(true)}
        className={`w-6 h-6 rounded-full bg-white dark:bg-[#262626] border-2 border-gray-300 dark:border-[#2f2f2f] hover:border-gray-900 dark:hover:border-white flex items-center justify-center transition-all ${className}`}
        title="Upgrade to Pro"
      >
        <Sparkles className="w-3.5 h-3.5 text-gray-700 dark:text-[#d4d4d4]" />
      </button>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </>
  );
}
