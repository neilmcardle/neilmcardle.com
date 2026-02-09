"use client";

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSubscription } from '@/lib/hooks/useSubscription';
import { Sparkles, Cloud, BookOpen, Clock, X, Check } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: string; // Optional: name of feature that triggered the modal
}

export default function UpgradeModal({ isOpen, onClose, feature }: UpgradeModalProps) {
  const { isGrandfathered, isLoading } = useSubscription();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'lifetime'>('monthly');
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

  const handleCheckout = async (mode: 'subscription' | 'lifetime') => {
    setCheckoutLoading(true);
    setError(null);

    try {
      const endpoint = mode === 'subscription' ? '/api/checkout' : '/api/checkout-lifetime';
      
      const response = await fetch(endpoint, {
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

  const features = [
    { icon: Sparkles, title: 'Book Mind AI', desc: 'AI-powered analysis: summarize chapters, find plot holes, character analysis' },
    { icon: Cloud, title: 'Cloud Sync', desc: 'Sync your books across all devices automatically' },
    { icon: BookOpen, title: 'Priority Support', desc: 'Get help faster with priority email support' },
    { icon: Clock, title: 'Early Access', desc: 'Be first to try new features as they release' }
  ];

  const modalContent = (
    <div 
      className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      style={{ pointerEvents: 'auto' }}
      onClick={(e) => {
        // Only close if clicking the backdrop itself, not the modal
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-white dark:bg-[#0a0a0a] rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-800"
        style={{ pointerEvents: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-[#0a0a0a] border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Choose Your Plan
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
          {/* Feature that triggered modal */}
          {feature && (
            <div className="bg-gray-50 dark:bg-[#111] border border-gray-300 dark:border-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
                <strong>{feature}</strong> is a Pro feature
              </p>
            </div>
          )}

          {/* Pricing Plans */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Monthly Plan */}
            <div
              onClick={() => setSelectedPlan('monthly')}
              className={`cursor-pointer rounded-lg border-2 p-6 transition-all ${
                selectedPlan === 'monthly'
                  ? 'border-gray-900 dark:border-white bg-gray-50 dark:bg-[#111]'
                  : 'border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedPlan === 'monthly'
                    ? 'border-gray-900 dark:border-white bg-gray-900 dark:bg-white'
                    : 'border-gray-400 dark:border-gray-600'
                }`}>
                  {selectedPlan === 'monthly' && (
                    <Check className="w-3 h-3 text-white dark:text-black" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pro Monthly</h3>
              </div>
              
              <div className="mb-4">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  $9<span className="text-lg text-gray-600 dark:text-gray-400">/mo</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Cancel anytime, no commitment
                </p>
              </div>
            </div>

            {/* Lifetime Plan */}
            <div
              onClick={() => setSelectedPlan('lifetime')}
              className={`cursor-pointer rounded-lg border-2 p-6 transition-all relative ${
                selectedPlan === 'lifetime'
                  ? 'border-gray-900 dark:border-white bg-gray-50 dark:bg-[#111]'
                  : 'border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600'
              }`}
            >
              <div className="absolute top-3 right-3 bg-gray-900 dark:bg-white text-white dark:text-black text-xs font-semibold px-2.5 py-1 rounded">
                BEST VALUE
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedPlan === 'lifetime'
                    ? 'border-gray-900 dark:border-white bg-gray-900 dark:bg-white'
                    : 'border-gray-400 dark:border-gray-600'
                }`}>
                  {selectedPlan === 'lifetime' && (
                    <Check className="w-3 h-3 text-white dark:text-black" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pro Lifetime</h3>
              </div>
              
              <div className="mb-4">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  $149<span className="text-lg text-gray-600 dark:text-gray-400"> once</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  One-time payment, forever access
                </p>
              </div>
            </div>
          </div>

          {/* Features List */}
          <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
              Pro includes:
            </h3>

            <div className="space-y-2">
              {features.map((f, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-lg">
                  <f.icon className="w-5 h-5 text-gray-900 dark:text-white mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{f.title}</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Free Tier Features */}
          <div className="bg-gray-50 dark:bg-[#111] rounded-lg p-4">
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

          {/* Checkout Button */}
          <button
            onClick={() => handleCheckout(selectedPlan === 'monthly' ? 'subscription' : 'lifetime')}
            disabled={checkoutLoading || isLoading}
            className="w-full py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-full transition-all hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg uppercase tracking-wide text-sm"
          >
            {checkoutLoading ? 'Redirecting...' : 
              selectedPlan === 'monthly' ? 'Subscribe to Pro - $9/month' : 'Buy Lifetime - $149'}
          </button>

          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            Secure checkout powered by Stripe • 30-day money back guarantee
          </p>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
