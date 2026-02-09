"use client"

import { useState, useCallback, useEffect, useRef } from 'react';

const STORAGE_KEY = 'makeebook_onboarding_complete';

export interface OnboardingStep {
  id: string;
  target: string;
  title: string;
  description: string;
  placement: 'top' | 'bottom' | 'left' | 'right';
}

const DESKTOP_STEPS: OnboardingStep[] = [
  {
    id: 'book-details',
    target: '[data-tour="book-details"]',
    title: 'Book Details',
    description: 'Start by adding your book title and author name. This information appears in your exported ebook.',
    placement: 'right',
  },
  {
    id: 'chapters',
    target: '[data-tour="chapters"]',
    title: 'Chapters',
    description: 'Add and manage your chapters here. You can create front matter, main chapters, and back matter.',
    placement: 'right',
  },
  {
    id: 'editor',
    target: '[data-tour="editor"]',
    title: 'Rich Text Editor',
    description: 'Write your content with full formatting — bold, italic, headings, lists, and more.',
    placement: 'bottom',
  },
  {
    id: 'preview',
    target: '[data-tour="preview"]',
    title: 'Live Preview',
    description: 'Preview how your ebook will look on different devices.',
    placement: 'left',
  },
  {
    id: 'export',
    target: '[data-tour="export"]',
    title: 'Save & Export',
    description: 'Save your book to the cloud, then export as EPUB or PDF when you\'re ready to publish.',
    placement: 'bottom',
  },
  {
    id: 'auto-save',
    target: '[data-tour="auto-save"]',
    title: 'Auto-Save',
    description: 'Your work auto-saves every 30 seconds. Look for the green tick when saved.',
    placement: 'bottom',
  },
];

const MOBILE_STEPS: OnboardingStep[] = [
  {
    id: 'mobile-menu',
    target: '[data-tour="mobile-menu"]',
    title: 'Menu',
    description: 'Tap here to access your book details, chapters, library, and settings.',
    placement: 'bottom',
  },
  {
    id: 'mobile-editor',
    target: '[data-tour="mobile-editor"]',
    title: 'Write Your Book',
    description: 'Write your content here with formatting tools below.',
    placement: 'top',
  },
  {
    id: 'mobile-preview',
    target: '[data-tour="mobile-preview"]',
    title: 'Preview',
    description: 'Tap to see how your ebook will look on different devices.',
    placement: 'bottom',
  },
];

interface UseOnboardingOptions {
  stepCallbacks?: Record<string, () => void>;
}

export function useOnboarding(options: UseOnboardingOptions = {}) {
  const { stepCallbacks } = options;

  const [isTourActive, setIsTourActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(true); // default true, read from storage on mount
  const [steps, setSteps] = useState<OnboardingStep[]>(DESKTOP_STEPS);
  const callbacksRef = useRef(stepCallbacks);
  callbacksRef.current = stepCallbacks;

  // Read localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(STORAGE_KEY);
    setIsOnboardingComplete(stored === 'true');
  }, []);

  const getSteps = useCallback(() => {
    if (typeof window === 'undefined') return DESKTOP_STEPS;
    return window.innerWidth < 1024 ? MOBILE_STEPS : DESKTOP_STEPS;
  }, []);

  const runStepCallback = useCallback((stepIndex: number, stepList: OnboardingStep[]) => {
    const step = stepList[stepIndex];
    if (step && callbacksRef.current?.[step.id]) {
      callbacksRef.current[step.id]();
    }
  }, []);

  const startTour = useCallback(() => {
    const currentSteps = getSteps();
    setSteps(currentSteps);
    setCurrentStep(0);
    setIsTourActive(true);
    // Run the callback for the first step after a brief delay for rendering
    setTimeout(() => runStepCallback(0, currentSteps), 50);
  }, [getSteps, runStepCallback]);

  const nextStep = useCallback(() => {
    setCurrentStep(prev => {
      const next = prev + 1;
      if (next >= steps.length) {
        // Tour complete
        setIsTourActive(false);
        setIsOnboardingComplete(true);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, 'true');
        }
        return prev;
      }
      runStepCallback(next, steps);
      return next;
    });
  }, [steps, runStepCallback]);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => {
      const next = Math.max(0, prev - 1);
      runStepCallback(next, steps);
      return next;
    });
  }, [steps, runStepCallback]);

  const skipTour = useCallback(() => {
    setIsTourActive(false);
    setIsOnboardingComplete(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, 'true');
    }
  }, []);

  const completeTour = useCallback(() => {
    skipTour();
  }, [skipTour]);

  const resetOnboarding = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    setIsOnboardingComplete(false);
  }, []);

  return {
    isTourActive,
    currentStep,
    totalSteps: steps.length,
    currentStepData: isTourActive ? steps[currentStep] ?? null : null,
    steps,
    startTour,
    nextStep,
    prevStep,
    skipTour,
    completeTour,
    isOnboardingComplete,
    resetOnboarding,
  };
}
