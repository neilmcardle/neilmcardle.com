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
      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 ${className}`}>
        <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600 animate-pulse" />
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          Loading...
        </span>
      </div>
    );
  }

  // Pro Badge (for active Pro subscribers)
  if (tier === 'pro' && !isGrandfathered) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1a1a1a] dark:bg-white border border-gray-200 dark:border-gray-800 ${className}`}>
        <span className="text-xs font-semibold text-white dark:text-[#1a1a1a] uppercase tracking-wide">Pro</span>
      </div>
    );
  }

  // Grandfathered Badge (lifetime Pro access)
  if (isGrandfathered) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1a1a1a] dark:bg-white border border-gray-200 dark:border-gray-800 ${className}`}>
        <span className="text-xs font-semibold text-white dark:text-[#1a1a1a] uppercase tracking-wide">Pro (Lifetime)</span>
      </div>
    );
  }

  // Free Tier - show upgrade button if enabled
  if (showUpgradeButton) {
    return (
      <>
        <button
          onClick={() => setShowUpgradeModal(true)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#1a1a1a] border-2 border-gray-300 dark:border-gray-700 hover:border-gray-900 dark:hover:border-white transition-all ${className}`}
        >
          <Sparkles className="w-3.5 h-3.5 text-gray-700 dark:text-gray-300" />
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
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
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 ${className}`}>
      <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Free</span>
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
      <div className={`w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse ${className}`} />
    );
  }

  // Pro Badge
  if (tier === 'pro') {
    return (
      <div
        className={`w-6 h-6 rounded-full bg-[#1a1a1a] dark:bg-white flex items-center justify-center border border-gray-200 dark:border-gray-800 ${className}`}
        title={isGrandfathered ? "Pro (Lifetime)" : "Pro"}
      >
        <span className="text-white dark:text-[#1a1a1a] font-bold text-[10px]">P</span>
      </div>
    );
  }

  // Free Tier - clickable upgrade button
  return (
    <>
      <button
        onClick={() => setShowUpgradeModal(true)}
        className={`w-6 h-6 rounded-full bg-white dark:bg-[#1a1a1a] border-2 border-gray-300 dark:border-gray-700 hover:border-gray-900 dark:hover:border-white flex items-center justify-center transition-all ${className}`}
        title="Upgrade to Pro"
      >
        <Sparkles className="w-3.5 h-3.5 text-gray-700 dark:text-gray-300" />
      </button>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </>
  );
}
