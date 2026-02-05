"use client";

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSubscription } from '@/lib/hooks/useSubscription';
import { Sparkles, Cloud, BookOpen, Clock, X } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: string; // Optional: name of feature that triggered the modal
}

export default function UpgradeModal({ isOpen, onClose, feature }: UpgradeModalProps) {
  const { isGrandfathered, isLoading } = useSubscription();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleUpgrade = async () => {
    setCheckoutLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to start checkout');
      }

      const { url } = await response.json();

      if (url) {
        // Redirect to Stripe Checkout
        window.location.href = url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'Failed to start checkout');
      setCheckoutLoading(false);
    }
  };

  // Don't show anything if the user is grandfathered (they already have lifetime Pro)
  if (isGrandfathered) {
    return null;
  }

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#0a0a0a] rounded-lg shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-800">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-[#0a0a0a] border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Upgrade to Pro
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Pricing */}
          <div className="text-center py-6 px-4 bg-gray-50 dark:bg-[#111] rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
              $9<span className="text-2xl text-gray-600 dark:text-gray-400">/month</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Cancel anytime • No commitment
            </p>
          </div>

          {/* Feature that triggered modal */}
          {feature && (
            <div className="bg-gray-50 dark:bg-[#111] border border-gray-300 dark:border-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
                <strong>{feature}</strong> is a Pro feature
              </p>
            </div>
          )}

          {/* Features List */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
              Pro includes:
            </h3>

            <div className="space-y-2">
              {[
                { icon: Sparkles, title: 'Book Mind AI', desc: 'AI-powered analysis: summarize chapters, find plot holes, character analysis' },
                { icon: Cloud, title: 'Cloud Sync', desc: 'Sync your books across all devices automatically' },
                { icon: BookOpen, title: 'Priority Support', desc: 'Get help faster with priority email support' },
                { icon: Clock, title: 'Early Access', desc: 'Be first to try new features as they release' }
              ].map((feature, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-lg">
                  <feature.icon className="w-5 h-5 text-gray-900 dark:text-white mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{feature.title}</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Free Tier Features */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              <strong>Free tier includes:</strong> Unlimited books, EPUB/PDF export, professional typography, offline mode, version history, export history
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Upgrade Button */}
          <button
            onClick={handleUpgrade}
            disabled={checkoutLoading || isLoading}
            className="w-full py-3.5 bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a] font-semibold rounded-full transition-all hover:bg-[#2a2a2a] dark:hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg uppercase tracking-wide text-sm"
          >
            {checkoutLoading ? 'Redirecting...' : 'Upgrade to Pro - $9/month'}
          </button>

          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            Secure checkout powered by Stripe • Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
