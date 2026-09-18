"use client";

import React, { useState } from "react";
import { useSubscription } from "@/lib/hooks/useSubscription";
import { CreditCard, ExternalLink } from "lucide-react";

interface ManageBillingButtonProps {
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export default function ManageBillingButton({
  className = "",
  variant = "default",
  size = "md",
}: ManageBillingButtonProps) {
  const { tier, isGrandfathered, stripeCustomerId, isLoading } =
    useSubscription();
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log("ManageBillingButton:", {
    tier,
    isGrandfathered,
    stripeCustomerId,
    isLoading,
  });

  if (tier !== "pro" || isGrandfathered || !stripeCustomerId) {
    console.log("ManageBillingButton not showing because:", {
      isPro: tier === "pro",
      isGrandfathered,
      hasStripeId: !!stripeCustomerId,
    });
    return null;
  }

  const handleOpenPortal = async () => {
    console.log("🔵 handleOpenPortal called - button clicked");
    setPortalLoading(true);
    setError(null);

    try {
      console.log("🔵 Making POST request to /api/customer-portal");
      const response = await fetch("/api/customer-portal", {
        method: "POST",
        credentials: "include",
      });

      console.log("🔵 Response received:", {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
      });

      if (!response.ok) {
        const data = await response.json();
        console.error("❌ API error response:", data);
        throw new Error(data.error || "Failed to open billing portal");
      }

      const { url } = await response.json();
      console.log("🔵 Portal URL received:", url);

      if (url) {
        console.log("🔵 Redirecting to:", url);
        window.location.href = url;
      } else {
        console.error("❌ No URL in response");
        throw new Error("No portal URL returned");
      }
    } catch (err) {
      console.error("❌ Portal error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to open billing portal",
      );
      setPortalLoading(false);
    }
  };

  const sizeClasses = {
    sm: "px-3 py-2 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const variantClasses = {
    default:
      "bg-gray-900 dark:bg-white text-white dark:text-[var(--ink-deep)] hover:bg-gray-800 dark:hover:bg-[var(--paper)]",
    outline:
      "border border-gray-300 dark:border-[var(--rule)] text-gray-700 dark:text-[var(--clay)] hover:bg-gray-50 dark:hover:bg-[var(--rule)]",
    ghost:
      "text-gray-700 dark:text-[var(--clay)] hover:bg-gray-100 dark:hover:bg-[var(--rule)]",
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleOpenPortal}
        disabled={portalLoading || isLoading}
        className={`inline-flex items-center gap-2 font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      >
        <CreditCard className="w-4 h-4" />
        {portalLoading ? "Opening..." : "Manage Billing"}
        <ExternalLink className="w-3 h-3 opacity-60" />
      </button>

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}

export function ManageBillingLink({ className = "" }: { className?: string }) {
  const { tier, isGrandfathered, stripeCustomerId } = useSubscription();
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (tier !== "pro" || isGrandfathered || !stripeCustomerId) {
    return null;
  }

  const handleOpenPortal = async () => {
    console.log("🔵 ManageBillingLink handleOpenPortal called");
    setPortalLoading(true);
    setError(null);

    try {
      console.log("🔵 Making POST request to /api/customer-portal");
      const response = await fetch("/api/customer-portal", {
        method: "POST",
        credentials: "include",
      });

      console.log("🔵 Response received:", {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
      });

      if (!response.ok) {
        const data = await response.json();
        console.error("❌ API error response:", data);
        throw new Error(data.error || "Failed to open billing portal");
      }

      const { url } = await response.json();
      console.log("🔵 Portal URL received:", url);

      if (url) {
        console.log("🔵 Redirecting to:", url);
        window.location.href = url;
      } else {
        console.error("❌ No URL in response");
        throw new Error("No portal URL returned");
      }
    } catch (err) {
      console.error("❌ Portal error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to open billing portal",
      );
      setPortalLoading(false);
    }
  };

  return (
    <div className="space-y-1">
      <button
        onClick={handleOpenPortal}
        disabled={portalLoading}
        className={`inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
      >
        {portalLoading ? "Opening portal..." : "Manage subscription"}
        <ExternalLink className="w-3 h-3" />
      </button>

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
