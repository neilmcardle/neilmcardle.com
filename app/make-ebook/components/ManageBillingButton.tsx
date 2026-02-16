"use client";

import React, { useState } from 'react';
import { useSubscription } from '@/lib/hooks/useSubscription';
import { CreditCard, ExternalLink } from 'lucide-react';

interface ManageBillingButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export default function ManageBillingButton({
  className = '',
  variant = 'default',
  size = 'md'
}: ManageBillingButtonProps) {
  const { tier, isGrandfathered, stripeCustomerId, isLoading } = useSubscription();
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debug logging
  console.log('ManageBillingButton:', { tier, isGrandfathered, stripeCustomerId, isLoading });

  // Don't show button for Free users or grandfathered users
  // Grandfathered users have lifetime access and shouldn't be able to cancel
  if (tier !== 'pro' || isGrandfathered || !stripeCustomerId) {
    console.log('ManageBillingButton not showing because:', {
      isPro: tier === 'pro',
      isGrandfathered,
      hasStripeId: !!stripeCustomerId
    });
    return null;
  }

  const handleOpenPortal = async () => {
    console.log('🔵 handleOpenPortal called - button clicked');
    setPortalLoading(true);
    setError(null);

    try {
      console.log('🔵 Making POST request to /api/customer-portal');
      const response = await fetch('/api/customer-portal', {
        method: 'POST',
        credentials: 'include',
      });

      console.log('🔵 Response received:', {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText
      });

      if (!response.ok) {
        const data = await response.json();
        console.error('❌ API error response:', data);
        throw new Error(data.error || 'Failed to open billing portal');
      }

      const { url } = await response.json();
      console.log('🔵 Portal URL received:', url);

      if (url) {
        console.log('🔵 Redirecting to:', url);
        // Redirect to Stripe Customer Portal
        window.location.href = url;
      } else {
        console.error('❌ No URL in response');
        throw new Error('No portal URL returned');
      }
    } catch (err) {
      console.error('❌ Portal error:', err);
      setError(err instanceof Error ? err.message : 'Failed to open billing portal');
      setPortalLoading(false);
    }
  };

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  // Variant classes
  const variantClasses = {
    default: 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100',
    outline: 'border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800',
    ghost: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleOpenPortal}
        disabled={portalLoading || isLoading}
        className={`inline-flex items-center gap-2 font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      >
        <CreditCard className="w-4 h-4" />
        {portalLoading ? 'Opening...' : 'Manage Billing'}
        <ExternalLink className="w-3 h-3 opacity-60" />
      </button>

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}

/**
 * Link variant for use in settings/account pages
 */
export function ManageBillingLink({ className = '' }: { className?: string }) {
  const { tier, isGrandfathered, stripeCustomerId } = useSubscription();
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Don't show for Free users or grandfathered users
  if (tier !== 'pro' || isGrandfathered || !stripeCustomerId) {
    return null;
  }

  const handleOpenPortal = async () => {
    console.log('🔵 ManageBillingLink handleOpenPortal called');
    setPortalLoading(true);
    setError(null);

    try {
      console.log('🔵 Making POST request to /api/customer-portal');
      const response = await fetch('/api/customer-portal', {
        method: 'POST',
        credentials: 'include',
      });

      console.log('🔵 Response received:', {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText
      });

      if (!response.ok) {
        const data = await response.json();
        console.error('❌ API error response:', data);
        throw new Error(data.error || 'Failed to open billing portal');
      }

      const { url } = await response.json();
      console.log('🔵 Portal URL received:', url);

      if (url) {
        console.log('🔵 Redirecting to:', url);
        window.location.href = url;
      } else {
        console.error('❌ No URL in response');
        throw new Error('No portal URL returned');
      }
    } catch (err) {
      console.error('❌ Portal error:', err);
      setError(err instanceof Error ? err.message : 'Failed to open billing portal');
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
        {portalLoading ? 'Opening portal...' : 'Manage subscription'}
        <ExternalLink className="w-3 h-3" />
      </button>

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
