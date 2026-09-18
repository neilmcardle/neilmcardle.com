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
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[var(--ink-window)] dark:bg-white border border-gray-200 dark:border-[var(--rule)] ${className}`}
      >
        <span className="text-2xs font-semibold text-white dark:text-[var(--ink-window)] uppercase tracking-wide">
          Pro (Lifetime)
        </span>
      </div>
    );
  }

  if (tier === "pro") {
    return (
      <div
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[var(--ink-window)] dark:bg-white border border-gray-200 dark:border-[var(--rule)] ${className}`}
      >
        <span className="text-2xs font-semibold text-white dark:text-[var(--ink-window)] uppercase tracking-wide">
          Pro
        </span>
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
