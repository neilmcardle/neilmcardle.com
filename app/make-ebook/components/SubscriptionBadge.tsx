"use client";

import React from "react";
import { useSubscription } from "@/lib/hooks/useSubscription";

interface SubscriptionBadgeProps {
  className?: string;
}

export default function SubscriptionBadge({
  className = "",
}: SubscriptionBadgeProps) {
  const { tier, isGrandfathered, isLoading } = useSubscription();

  if (isLoading) {
    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-full bg-gray-100 dark:bg-[var(--ink-raised)] ${className}`}
      >
        <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-[var(--ink-hover)] animate-pulse" />
        <span className="text-xs font-medium text-gray-500 dark:text-[var(--clay-muted)]">
          Loading…
        </span>
      </div>
    );
  }

  if (isGrandfathered) {
    return (
      <div
        className={`inline-flex items-center h-[20px] px-2 rounded-full border border-[rgba(243,239,229,0.18)] ${className}`}
      >
        <span className="text-[11px] font-medium text-[var(--paper)]">
          Pro, lifetime
        </span>
      </div>
    );
  }

  if (tier === "pro") {
    return (
      <div
        className={`inline-flex items-center h-[20px] px-2 rounded-full border border-[rgba(243,239,229,0.18)] ${className}`}
      >
        <span className="text-[11px] font-medium text-[var(--paper)]">Pro</span>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-full bg-gray-100 dark:bg-[var(--ink-raised)] border border-gray-300 dark:border-[var(--rule)] ${className}`}
    >
      <span className="text-xs font-medium text-gray-600 dark:text-[var(--clay-muted)] uppercase tracking-wide">
        Free
      </span>
    </div>
  );
}
