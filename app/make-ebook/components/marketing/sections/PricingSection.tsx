'use client';

import React, { forwardRef, useState } from 'react';

import FadeIn from '../FadeIn';
import { SECTION_TIERS } from '../sectionTiers';
import { PRICING, FAQ, type CheckoutType } from '../marketing-content';

type BillingPeriod = 'monthly' | 'yearly';

type PricingSectionProps = {
  onCheckout: (type: 'pro' | 'lifetime', period?: BillingPeriod) => void;
  onFreeCtaClick: () => void;
  checkoutLoading: CheckoutType;
  checkoutError: string | null;
};

// Pro tier annual pricing. $79/yr vs $9/mo × 12 = $108 → $29 saved.
const PRO_ANNUAL_PRICE = '$79';
const PRO_ANNUAL_SAVINGS = '$29';

const PricingSection = forwardRef<HTMLElement, PricingSectionProps>(function PricingSection(
  { onCheckout, onFreeCtaClick, checkoutLoading, checkoutError },
  ref
) {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');

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
              Free to write and ship. Pay only for Book Mind.
            </h2>
            <p className="mt-5 text-lg sm:text-xl text-gray-600 max-w-xl text-pretty" style={{ fontFamily: 'Georgia, serif', lineHeight: 1.55 }}>
              When you want Book Mind to read every chapter, try Pro with our 7-day free trial.
            </p>
            {checkoutError && (
              <p className="mt-4 text-sm text-red-500">{checkoutError}</p>
            )}
          </div>
        </FadeIn>

        {/* All three plans in a single row at lg, stack into one column at
            tablet and below. Lifetime sits on the right as the premium anchor. */}
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {PRICING.map((plan, index) => {
            const isPro = plan.checkoutType === 'pro';
            const isLifetime = plan.checkoutType === 'lifetime';
            const displayPrice = isPro && billingPeriod === 'yearly' ? PRO_ANNUAL_PRICE : plan.price;
            const displayPeriod = isPro && billingPeriod === 'yearly' ? '/year' : plan.period;
            // Two layers of microcopy: risk-reversal beside the price (the
            // place buyers are most anxious), and a payment-mechanic line under
            // the button to set expectations for the click itself.
            const priceMicrocopy = isPro
              ? 'Cancel anytime'
              : isLifetime
                ? '30-day refund, no questions'
                : null;
            const buttonMicrocopy = isPro
              ? 'No charge for 7 days'
              : isLifetime
                ? 'One-time payment. No subscription.'
                : 'No credit card needed';
            return (
              <div key={index} className="group relative rounded-2xl">
                {plan.highlighted && (
                  <div className="absolute -top-3.5 left-8 z-10">
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-600 text-white whitespace-nowrap uppercase tracking-wider">
                      Free 7-day trial
                    </span>
                  </div>
                )}
                {isLifetime && (
                  <div className="absolute -top-3.5 left-8 z-10">
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-[#141413] text-[#faf9f5] whitespace-nowrap uppercase tracking-wider">
                      Pay once, write forever
                    </span>
                  </div>
                )}
                <div
                  className={`relative rounded-2xl p-8 sm:p-10 h-full flex flex-col transition-all duration-300 group-hover:-translate-y-1 ${
                    plan.highlighted
                      ? 'bg-[#141413] border border-[#141413] shadow-xl'
                      : isLifetime
                        ? 'bg-gradient-to-br from-[#faf5e8] via-[#fdfbf3] to-[#faf5e8]/60 border border-gray-200 shadow-md hover:shadow-lg'
                        : 'bg-white border border-gray-200 shadow-lg hover:shadow-xl'
                  }`}
                >
                  <h3 className={`text-2xl font-semibold mb-2 ${plan.highlighted ? 'text-white' : 'text-gray-900'}`} style={{ letterSpacing: '-0.02em' }}>{plan.name}</h3>
                  {isPro && (
                    <BillingToggle period={billingPeriod} onChange={setBillingPeriod} />
                  )}
                  <div className="mb-1 flex items-baseline gap-1">
                    <span className={`text-5xl font-bold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`} style={{ letterSpacing: '-0.03em' }}>{displayPrice}</span>
                    <span className={plan.highlighted ? 'text-gray-400' : 'text-gray-500'}>{displayPeriod}</span>
                  </div>
                  {isPro && billingPeriod === 'yearly' && (
                    <div className="text-xs font-semibold text-emerald-300">
                      Save {PRO_ANNUAL_SAVINGS} vs monthly
                    </div>
                  )}
                  {priceMicrocopy && (
                    <p className={`mt-1 mb-4 text-xs ${plan.highlighted ? 'text-gray-400' : 'text-gray-500'}`}>
                      {priceMicrocopy}
                    </p>
                  )}
                  {!priceMicrocopy && <div className="mb-3" />}
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
                        onCheckout(plan.checkoutType, isPro ? billingPeriod : undefined);
                      } else {
                        onFreeCtaClick();
                      }
                    }}
                    disabled={!!plan.checkoutType && checkoutLoading === plan.checkoutType}
                    className={`w-full py-3.5 rounded-full font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${plan.highlighted ? 'bg-white text-gray-900 hover:bg-gray-100' : 'bg-gray-900 text-white hover:bg-gray-700'}`}
                  >
                    {plan.checkoutType && checkoutLoading === plan.checkoutType ? 'Redirecting\u2026' : plan.cta}
                  </button>
                  <p className={`mt-3 text-xs text-center ${plan.highlighted ? 'text-gray-400' : 'text-gray-500'}`}>
                    {buttonMicrocopy}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Plan comparison table — shows exactly what each tier loses or gains
            so visitors can pick without re-reading the cards. */}
        <ComparisonTable />

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

type Cell = boolean | string;

const COMPARISON_ROWS: Array<{ feature: string; free: Cell; pro: Cell; lifetime: Cell }> = [
  { feature: 'Unlimited books',                     free: true,  pro: true,  lifetime: true },
  { feature: 'EPUB, PDF & DOCX export',             free: true,  pro: true,  lifetime: true },
  { feature: 'Focus mode & offline writing',        free: true,  pro: true,  lifetime: true },
  { feature: 'Cloud sync across devices',           free: false, pro: true,  lifetime: true },
  { feature: 'Book Mind reads your manuscript',     free: false, pro: true,  lifetime: true },
  { feature: 'Amazon KDP pre-flight',               free: false, pro: true,  lifetime: true },
  { feature: 'Inline rewrites and /continue',       free: false, pro: true,  lifetime: true },
  { feature: 'Project memory across sessions',      free: false, pro: true,  lifetime: true },
  { feature: 'All future features included',        free: false, pro: false, lifetime: true },
  { feature: 'Billing',                             free: 'Free forever', pro: '$9/mo or $79/yr', lifetime: '$149 once' },
];

function ComparisonTable() {
  return (
    <div className="mt-20 max-w-5xl mx-auto">
      <h3
        className="font-serif font-semibold text-gray-900 mb-6"
        style={{ fontSize: '1.5rem', letterSpacing: '-0.01em' }}
      >
        Compare plans
      </h3>
      {/* Horizontal scroll on narrow viewports so the columns stay readable
          instead of crushing into illegible widths. */}
      <div className="overflow-x-auto -mx-6 sm:mx-0">
        <div className="min-w-[640px] sm:min-w-0 rounded-2xl border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-[1.6fr_1fr_1fr_1fr] text-sm">
            <div className="bg-gray-50 p-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">
              Feature
            </div>
            <div className="bg-gray-50 p-4 font-semibold text-gray-900 text-center">Free</div>
            <div className="bg-gray-900 p-4 font-semibold text-white text-center">Pro</div>
            <div className="bg-[#faf5e8] p-4 font-semibold text-gray-900 text-center">Lifetime</div>

            {COMPARISON_ROWS.map((row, i) => (
              <React.Fragment key={row.feature}>
                <div className={`p-4 text-gray-900 ${i > 0 ? 'border-t border-gray-200' : ''}`}>
                  {row.feature}
                </div>
                <CellRender value={row.free}    border={i > 0} />
                <CellRender value={row.pro}     border={i > 0} highlight />
                <CellRender value={row.lifetime} border={i > 0} tint />
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CellRender({
  value,
  border,
  highlight = false,
  tint = false,
}: {
  value: Cell;
  border: boolean;
  highlight?: boolean;
  tint?: boolean;
}) {
  const bg = highlight ? 'bg-gray-900/[0.03]' : tint ? 'bg-[#faf5e8]/40' : '';
  const borderClass = border ? 'border-t border-gray-200' : '';
  return (
    <div className={`p-4 text-center ${bg} ${borderClass}`}>
      {typeof value === 'string' ? (
        <span className="text-sm text-gray-700">{value}</span>
      ) : value ? (
        <svg className="w-5 h-5 mx-auto text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <span className="text-gray-300" aria-hidden>—</span>
      )}
    </div>
  );
}

function BillingToggle({
  period,
  onChange,
}: {
  period: BillingPeriod;
  onChange: (p: BillingPeriod) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Billing period"
      className="mb-4 inline-flex items-center gap-1 p-1 rounded-full bg-white/10 border border-white/10 self-start"
    >
      {(['monthly', 'yearly'] as const).map((value) => {
        const active = period === value;
        return (
          <button
            key={value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(value)}
            className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
              active ? 'bg-white text-gray-900' : 'text-gray-400 hover:text-white'
            }`}
          >
            {value === 'monthly' ? 'Monthly' : 'Yearly'}
          </button>
        );
      })}
    </div>
  );
}
