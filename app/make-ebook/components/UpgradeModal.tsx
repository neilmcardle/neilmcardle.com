"use client";

import React, { useEffect, useState } from "react";
import { track } from "@vercel/analytics";
import { useSubscription } from "@/lib/hooks/useSubscription";
import { Sparkles, Cloud, BookOpen, Clock, Check } from "lucide-react";
import { Modal, ModalHeader, ModalBody } from "./Modal";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: string;
}

export default function UpgradeModal({
  isOpen,
  onClose,
  feature,
}: UpgradeModalProps) {
  const { isGrandfathered, isLoading } = useSubscription();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "lifetime">(
    "monthly",
  );
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      track("upgrade_clicked", {
        source: "modal",
        feature: feature ?? "unknown",
      });
    }
  }, [isOpen, feature]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleCheckout = async (mode: "subscription" | "lifetime") => {
    track("checkout_started", {
      tier: mode === "subscription" ? "pro" : "lifetime",
    });
    setCheckoutLoading(true);
    setError(null);

    try {
      const endpoint =
        mode === "subscription" ? "/api/checkout" : "/api/checkout-lifetime";

      const response = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to start checkout");
      }

      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setError(err instanceof Error ? err.message : "Failed to start checkout");
      setCheckoutLoading(false);
    }
  };

  if (isGrandfathered) {
    return null;
  }

  if (!isOpen || !mounted) return null;

  const features = [
    {
      icon: Sparkles,
      title: "Book Mind AI",
      desc: "AI-powered analysis: summarize chapters, find plot holes, character analysis",
    },
    {
      icon: Cloud,
      title: "Cloud Sync",
      desc: "Sync your books across all devices automatically",
    },
    {
      icon: BookOpen,
      title: "Priority Support",
      desc: "Get help faster with priority email support",
    },
    {
      icon: Clock,
      title: "Early Access",
      desc: "Be first to try new features as they release",
    },
  ];

  return (
    <Modal open={isOpen} onClose={onClose} width="lg" label="Choose your plan">
      <ModalHeader title="Choose your plan" onClose={onClose} />
      <ModalBody className="space-y-6">
        {feature && (
          <div className="bg-gray-50 dark:bg-[#111] border border-gray-300 dark:border-[#2f2f2f] rounded-lg p-4">
            <p className="text-sm text-gray-700 dark:text-[#d4d4d4] text-center">
              <strong>{feature}</strong> is a Pro feature
            </p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <div
            onClick={() => setSelectedPlan("monthly")}
            className={`cursor-pointer rounded-lg border-2 p-6 transition-all ${
              selectedPlan === "monthly"
                ? "border-gray-900 dark:border-white bg-gray-50 dark:bg-[#111]"
                : "border-gray-200 dark:border-[#2f2f2f] hover:border-gray-400 dark:hover:border-[#3a3a3a]"
            }`}
          >
            <div className="flex items-center gap-2 mb-4">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedPlan === "monthly"
                    ? "border-gray-900 dark:border-white bg-gray-900 dark:bg-white"
                    : "border-gray-400 dark:border-[#3a3a3a]"
                }`}
              >
                {selectedPlan === "monthly" && (
                  <Check className="w-3 h-3 text-white dark:text-black" />
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Pro Monthly
              </h3>
            </div>

            <div className="mb-4">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                $9
                <span className="text-lg text-gray-600 dark:text-[#a3a3a3]">
                  /mo
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-[#a3a3a3] mt-1">
                Cancel anytime, no commitment
              </p>
            </div>
          </div>

          <div
            onClick={() => setSelectedPlan("lifetime")}
            className={`cursor-pointer rounded-lg border-2 p-6 transition-all relative ${
              selectedPlan === "lifetime"
                ? "border-gray-900 dark:border-white bg-gray-50 dark:bg-[#111]"
                : "border-gray-200 dark:border-[#2f2f2f] hover:border-gray-400 dark:hover:border-[#3a3a3a]"
            }`}
          >
            <div className="absolute top-3 right-3 bg-gray-900 dark:bg-white text-white dark:text-black text-xs font-semibold px-3 py-1 rounded">
              BEST VALUE
            </div>

            <div className="flex items-center gap-2 mb-4">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedPlan === "lifetime"
                    ? "border-gray-900 dark:border-white bg-gray-900 dark:bg-white"
                    : "border-gray-400 dark:border-[#3a3a3a]"
                }`}
              >
                {selectedPlan === "lifetime" && (
                  <Check className="w-3 h-3 text-white dark:text-black" />
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Pro Lifetime
              </h3>
            </div>

            <div className="mb-4">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                $149
                <span className="text-lg text-gray-600 dark:text-[#a3a3a3]">
                  {" "}
                  once
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-[#a3a3a3] mt-1">
                One-time payment, forever access
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-[#2f2f2f]">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
            Pro includes:
          </h3>

          <div className="space-y-2">
            {features.map((f, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#2f2f2f] rounded-lg"
              >
                <f.icon className="w-5 h-5 text-gray-900 dark:text-white mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                    {f.title}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-[#a3a3a3] mt-1">
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-[#111] rounded-lg p-4">
          <p className="text-xs text-gray-600 dark:text-[#a3a3a3]">
            <strong>Free tier includes:</strong> Unlimited books, EPUB/PDF
            export, professional typography, offline mode, version history,
            export history
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <button
          onClick={() =>
            handleCheckout(
              selectedPlan === "monthly" ? "subscription" : "lifetime",
            )
          }
          disabled={checkoutLoading || isLoading}
          className="w-full py-3.5 bg-action-primary-500 dark:bg-action-primary-dark text-white font-semibold rounded-full transition-all hover:bg-action-primary-600 dark:hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg uppercase tracking-wide text-sm"
        >
          {checkoutLoading
            ? "Redirecting..."
            : selectedPlan === "monthly"
              ? "Subscribe to Pro - $9/month"
              : "Buy Lifetime - $149"}
        </button>

        <p className="text-xs text-center text-gray-500 dark:text-[#a3a3a3]">
          Secure checkout powered by Stripe • 30-day money back guarantee
        </p>
      </ModalBody>
    </Modal>
  );
}
