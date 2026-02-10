"use client"

import React, { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react';
import type { OnboardingStep } from '../hooks/useOnboarding';

interface OnboardingTourProps {
  isTourActive: boolean;
  currentStep: number;
  totalSteps: number;
  stepData: OnboardingStep | null;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
  bottom: number;
  right: number;
}

const PADDING = 8;
const TOOLTIP_GAP = 12;
const VIEWPORT_MARGIN = 16;

export default function OnboardingTour({
  isTourActive,
  currentStep,
  totalSteps,
  stepData,
  onNext,
  onPrev,
  onSkip,
}: OnboardingTourProps) {
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const [arrowStyle, setArrowStyle] = useState<React.CSSProperties>({});
  const [arrowDirection, setArrowDirection] = useState<'top' | 'bottom' | 'left' | 'right'>('top');
  const [visible, setVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const nextBtnRef = useRef<HTMLButtonElement>(null);

  const updatePosition = useCallback(() => {
    if (!stepData) return;

    const el = document.querySelector(stepData.target);
    if (!el) {
      // Fallback: center on screen
      setTargetRect(null);
      setTooltipStyle({
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      });
      setArrowDirection('top');
      setArrowStyle({ display: 'none' });
      return;
    }

    const rect = el.getBoundingClientRect();
    setTargetRect({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      bottom: rect.bottom,
      right: rect.right,
    });

    // Calculate tooltip position after render
    requestAnimationFrame(() => {
      if (!tooltipRef.current) return;
      const tooltip = tooltipRef.current.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const isMobile = vw < 1024;

      let top = 0;
      let left = 0;
      let placement = stepData.placement;

      if (isMobile) {
        const spaceBelow = vh - rect.bottom;
        const spaceAbove = rect.top;
        placement = spaceBelow > spaceAbove ? 'bottom' : 'top';
        left = Math.max(VIEWPORT_MARGIN, Math.min(vw - tooltip.width - VIEWPORT_MARGIN, (vw - tooltip.width) / 2));
      } else {
        // Smart placement: flip if not enough room on the preferred side
        const spaceLeft = rect.left - PADDING - TOOLTIP_GAP;
        const spaceRight = vw - rect.right - PADDING - TOOLTIP_GAP;
        const spaceTop = rect.top - PADDING - TOOLTIP_GAP;
        const spaceBottom = vh - rect.bottom - PADDING - TOOLTIP_GAP;

        if (placement === 'left' && spaceLeft < tooltip.width) {
          placement = spaceRight >= tooltip.width ? 'right' : 'bottom';
        } else if (placement === 'right' && spaceRight < tooltip.width) {
          placement = spaceLeft >= tooltip.width ? 'left' : 'bottom';
        } else if (placement === 'top' && spaceTop < tooltip.height) {
          placement = spaceBottom >= tooltip.height ? 'bottom' : 'right';
        } else if (placement === 'bottom' && spaceBottom < tooltip.height) {
          placement = spaceTop >= tooltip.height ? 'top' : 'right';
        }
      }

      if (placement === 'bottom') {
        top = rect.bottom + PADDING + TOOLTIP_GAP;
        if (!isMobile) left = rect.left + rect.width / 2 - tooltip.width / 2;
        setArrowDirection('top');
      } else if (placement === 'top') {
        top = rect.top - PADDING - TOOLTIP_GAP - tooltip.height;
        if (!isMobile) left = rect.left + rect.width / 2 - tooltip.width / 2;
        setArrowDirection('bottom');
      } else if (placement === 'left') {
        top = rect.top + rect.height / 2 - tooltip.height / 2;
        left = rect.left - PADDING - TOOLTIP_GAP - tooltip.width;
        setArrowDirection('right');
      } else if (placement === 'right') {
        top = rect.top + rect.height / 2 - tooltip.height / 2;
        left = rect.right + PADDING + TOOLTIP_GAP;
        setArrowDirection('left');
      }

      // Clamp to viewport
      top = Math.max(VIEWPORT_MARGIN, Math.min(vh - tooltip.height - VIEWPORT_MARGIN, top));
      left = Math.max(VIEWPORT_MARGIN, Math.min(vw - tooltip.width - VIEWPORT_MARGIN, left));

      setTooltipStyle({ position: 'fixed', top, left });

      // Position arrow
      const arrowPos: React.CSSProperties = {};
      if (placement === 'bottom' || placement === 'top') {
        const arrowLeft = Math.max(16, Math.min(tooltip.width - 16, rect.left + rect.width / 2 - left));
        arrowPos.left = arrowLeft;
      } else {
        const arrowTop = Math.max(16, Math.min(tooltip.height - 16, rect.top + rect.height / 2 - top));
        arrowPos.top = arrowTop;
      }
      setArrowStyle(arrowPos);
    });
  }, [stepData]);

  // Update positions on step change, resize, scroll
  useLayoutEffect(() => {
    if (!isTourActive || !stepData) return;

    // Delay to allow sidebar panels to open, then recalculate after transitions settle
    const timer1 = setTimeout(() => {
      updatePosition();
      setVisible(true);
    }, 150);
    const timer2 = setTimeout(() => {
      updatePosition();
    }, 400);

    return () => { clearTimeout(timer1); clearTimeout(timer2); };
  }, [isTourActive, stepData, currentStep, updatePosition]);

  useEffect(() => {
    if (!isTourActive) {
      setVisible(false);
      return;
    }

    const handleResize = () => updatePosition();
    const handleScroll = () => updatePosition();

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isTourActive, updatePosition]);

  // Escape key to dismiss
  useEffect(() => {
    if (!isTourActive) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onSkip();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTourActive, onSkip]);

  // Focus the Next button when step changes
  useEffect(() => {
    if (isTourActive && visible) {
      setTimeout(() => nextBtnRef.current?.focus(), 200);
    }
  }, [isTourActive, visible, currentStep]);

  // Reset visibility on step change for smooth transition
  useEffect(() => {
    if (isTourActive) {
      setVisible(false);
    }
  }, [currentStep, isTourActive]);

  if (!isTourActive || !stepData) return null;

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <>
      {/* Transparent click-away backdrop */}
      <div
        className="fixed inset-0 z-[200]"
        onClick={onSkip}
      />

      {/* Highlight ring around target element */}
      {targetRect && (
        <div
          className={`fixed z-[200] pointer-events-none rounded-lg border-2 border-blue-400/60 transition-all duration-300 ease-out ${visible ? 'opacity-100' : 'opacity-0'}`}
          style={{
            top: targetRect.top - PADDING,
            left: targetRect.left - PADDING,
            width: targetRect.width + PADDING * 2,
            height: targetRect.height + PADDING * 2,
          }}
        />
      )}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Onboarding tour step ${currentStep + 1} of ${totalSteps}`}
        className={`fixed z-[201] w-[300px] max-w-[calc(100vw-32px)] bg-white dark:bg-[#0a0a0a] rounded-xl shadow-2xl border border-blue-400/60 p-4 transition-all duration-150 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        style={tooltipStyle}
      >
        {/* Arrow — border layer (blue outline) */}
        <div
          className="absolute w-0 h-0"
          style={{
            ...arrowStyle,
            ...(arrowDirection === 'top' && {
              top: -7,
              borderLeft: '7px solid transparent',
              borderRight: '7px solid transparent',
              borderBottom: '7px solid rgb(96 165 250 / 0.6)',
              transform: 'translateX(-7px)',
            }),
            ...(arrowDirection === 'bottom' && {
              bottom: -7,
              borderLeft: '7px solid transparent',
              borderRight: '7px solid transparent',
              borderTop: '7px solid rgb(96 165 250 / 0.6)',
              transform: 'translateX(-7px)',
            }),
            ...(arrowDirection === 'left' && {
              left: -7,
              borderTop: '7px solid transparent',
              borderBottom: '7px solid transparent',
              borderRight: '7px solid rgb(96 165 250 / 0.6)',
              transform: 'translateY(-7px)',
            }),
            ...(arrowDirection === 'right' && {
              right: -7,
              borderTop: '7px solid transparent',
              borderBottom: '7px solid transparent',
              borderLeft: '7px solid rgb(96 165 250 / 0.6)',
              transform: 'translateY(-7px)',
            }),
          }}
        />
        {/* Arrow — fill layer (background color) */}
        <div
          className="absolute w-0 h-0"
          style={{
            ...arrowStyle,
            ...(arrowDirection === 'top' && {
              top: -5,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderBottom: '6px solid var(--arrow-color, white)',
              transform: 'translateX(-6px)',
            }),
            ...(arrowDirection === 'bottom' && {
              bottom: -5,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid var(--arrow-color, white)',
              transform: 'translateX(-6px)',
            }),
            ...(arrowDirection === 'left' && {
              left: -5,
              borderTop: '6px solid transparent',
              borderBottom: '6px solid transparent',
              borderRight: '6px solid var(--arrow-color, white)',
              transform: 'translateY(-6px)',
            }),
            ...(arrowDirection === 'right' && {
              right: -5,
              borderTop: '6px solid transparent',
              borderBottom: '6px solid transparent',
              borderLeft: '6px solid var(--arrow-color, white)',
              transform: 'translateY(-6px)',
            }),
            // @ts-expect-error CSS custom property
            '--arrow-color': 'var(--tour-arrow-bg)',
          }}
        />

        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            Step {currentStep + 1} of {totalSteps}
          </span>
          <button
            onClick={onSkip}
            className="p-1 -m-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
            aria-label="Close tour"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-1">
          {stepData.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
          {stepData.description}
        </p>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <div>
            {!isFirstStep && (
              <button
                onClick={onPrev}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                Back
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            {!isLastStep && (
              <button
                onClick={onSkip}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                Skip
              </button>
            )}
            <button
              ref={nextBtnRef}
              onClick={onNext}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
            >
              {isLastStep ? 'Done' : 'Next'}
            </button>
          </div>
        </div>
      </div>

      {/* CSS custom property for arrow color */}
      <style jsx global>{`
        :root {
          --tour-arrow-bg: white;
        }
        .dark {
          --tour-arrow-bg: #0a0a0a;
        }
      `}</style>
    </>
  );
}
