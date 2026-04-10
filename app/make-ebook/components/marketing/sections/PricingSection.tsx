'use client';

import React, { forwardRef } from 'react';

import FadeIn from '../FadeIn';
import { SECTION_TIERS } from '../sectionTiers';
import { PRICING, FAQ, type CheckoutType } from '../marketing-content';

type PricingSectionProps = {
  onCheckout: (type: 'pro' | 'lifetime') => void;
  onFreeCtaClick: () => void;
  checkoutLoading: CheckoutType;
  checkoutError: string | null;
};

const PricingSection = forwardRef<HTMLElement, PricingSectionProps>(function PricingSection(
  { onCheckout, onFreeCtaClick, checkoutLoading, checkoutError },
  ref
) {
  const lifetime = PRICING[2];

  return (
    <section
      id="pricing"
      ref={ref}
      className={SECTION_TIERS.standard.section}
      style={{ scrollMarginTop: '6rem' }}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        <FadeIn>
          <div className="max-w-3xl mb-14 sm:mb-16">
            <h2 className="font-serif font-bold text-gray-900 text-balance" style={SECTION_TIERS.standard.title}>
              Pricing that respects your draft.
            </h2>
            <p className="mt-5 text-lg sm:text-xl text-gray-600 max-w-xl text-pretty" style={{ fontFamily: 'Georgia, serif', lineHeight: 1.55 }}>
              Start free and stay free for as long as you like. Upgrade when the book is ready, not before.
            </p>
            {checkoutError && (
              <p className="mt-4 text-sm text-red-500">{checkoutError}</p>
            )}
          </div>
        </FadeIn>

        {/* Free + Pro lead the comparison */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl">
          {[PRICING[0], PRICING[1]].map((plan, index) => (
            <div key={index} className="group relative rounded-2xl">
              {plan.highlighted && (
                <div className="absolute -top-3.5 left-8 z-10">
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-900 text-white whitespace-nowrap uppercase tracking-wider">
                    Most popular
                  </span>
                </div>
              )}
              <div
                className={`relative rounded-2xl p-8 sm:p-10 h-full flex flex-col transition-all duration-300 group-hover:-translate-y-1 ${
                  plan.highlighted
                    ? 'bg-gray-900 border border-gray-900 shadow-xl'
                    : 'bg-white border border-gray-200 shadow-lg hover:shadow-xl'
                }`}
              >
                <h3 className={`text-2xl font-semibold mb-2 ${plan.highlighted ? 'text-white' : 'text-gray-900'}`} style={{ letterSpacing: '-0.02em' }}>{plan.name}</h3>
                <div className="mb-4 flex items-baseline gap-1">
                  <span className={`text-5xl font-bold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`} style={{ letterSpacing: '-0.03em' }}>{plan.price}</span>
                  <span className={plan.highlighted ? 'text-gray-400' : 'text-gray-500'}>{plan.period}</span>
                </div>
                <p className={`mb-8 text-pretty ${plan.highlighted ? 'text-gray-300' : 'text-gray-600'}`} style={{ fontFamily: 'Georgia, serif', lineHeight: 1.5 }}>{plan.description}</p>
                <ul className="space-y-3 mb-10 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <svg className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.highlighted ? 'text-blue-400' : 'text-blue-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className={plan.highlighted ? 'text-gray-200' : 'text-gray-700'}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => {
                    if (plan.checkoutType) {
                      onCheckout(plan.checkoutType);
                    } else {
                      onFreeCtaClick();
                    }
                  }}
                  disabled={!!plan.checkoutType && checkoutLoading === plan.checkoutType}
                  className={`w-full py-3.5 rounded-full font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${plan.highlighted ? 'bg-white text-gray-900 hover:bg-gray-100' : 'bg-gray-900 text-white hover:bg-gray-700'}`}
                >
                  {plan.checkoutType && checkoutLoading === plan.checkoutType ? 'Redirecting\u2026' : plan.cta}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Lifetime — graduation stripe */}
        {lifetime && (
          <FadeIn delay={120}>
            <div className="mt-6 lg:mt-8 max-w-5xl">
              <div className="relative rounded-2xl border border-gray-200 bg-gradient-to-br from-amber-50 via-white to-amber-50/40 p-8 sm:p-10 shadow-sm">
                <div className="absolute -top-3.5 left-8">
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-900 text-amber-50 whitespace-nowrap uppercase tracking-wider">
                    Pay once, write forever
                  </span>
                </div>
                <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-center">
                  <div className="lg:col-span-5">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2 text-balance" style={{ letterSpacing: '-0.02em' }}>{lifetime.name}</h3>
                    <div className="mb-3 flex items-baseline gap-1">
                      <span className="text-5xl font-bold text-gray-900" style={{ letterSpacing: '-0.03em' }}>{lifetime.price}</span>
                      <span className="text-gray-500">{lifetime.period}</span>
                    </div>
                    <p className="text-gray-600 text-pretty" style={{ fontFamily: 'Georgia, serif', lineHeight: 1.5 }}>{lifetime.description}</p>
                  </div>
                  <ul className="lg:col-span-5 grid sm:grid-cols-2 gap-x-6 gap-y-3">
                    {lifetime.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="lg:col-span-2 flex lg:justify-end">
                    <button
                      onClick={() => lifetime.checkoutType && onCheckout(lifetime.checkoutType)}
                      disabled={!!lifetime.checkoutType && checkoutLoading === lifetime.checkoutType}
                      className="w-full lg:w-auto px-6 py-3.5 rounded-full font-semibold bg-amber-900 text-amber-50 hover:bg-amber-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {lifetime.checkoutType && checkoutLoading === lifetime.checkoutType ? 'Redirecting\u2026' : lifetime.cta}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        )}

        {/* FAQ */}
        <div className="max-w-2xl mx-auto mt-20">
          <h3 className="font-serif font-semibold text-gray-900 text-center mb-8" style={{ fontSize: '1.25rem' }}>Common questions</h3>
          {FAQ.map((item, i) => (
            <div key={i} className={`py-5 ${i > 0 ? 'border-t border-gray-200' : ''}`}>
              <h4 className="font-semibold text-gray-900 mb-1 text-balance">{item.q}</h4>
              <p className="text-gray-600 text-sm text-pretty" style={{ fontFamily: 'Georgia, serif', lineHeight: 1.7 }}>{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

export default PricingSection;
