"use client";

import {
  useState,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";
import { keys, readLocal, removeLocal, writeLocal } from "../storage/keys";

export interface OnboardingStep {
  id: string;
  target: string;
  title: string;
  description: string;
  placement: "top" | "bottom" | "left" | "right";
}

const DESKTOP_STEPS: OnboardingStep[] = [
  {
    id: "book-details",
    target: '[data-tour="book-details"]',
    title: "Book details",
    description:
      "Add your title and author here. They go on the title page and into every file you export.",
    placement: "right",
  },
  {
    id: "chapters",
    target: '[data-tour="chapters"]',
    title: "Chapters",
    description:
      "Add, rename and drag chapters into order. Mark each one as front matter, a chapter or back matter.",
    placement: "right",
  },
  {
    id: "editor",
    target: '[data-tour="editor"]',
    title: "Writing",
    description:
      "Write here. The toolbar adds headings, lists, links, endnotes and images.",
    placement: "bottom",
  },
  {
    id: "preview",
    target: '[data-tour="preview"]',
    title: "Preview",
    description:
      "Read your chapter as it will look on a Kindle, an iPad or a phone, and choose its book style.",
    placement: "bottom",
  },
  {
    id: "export",
    target: '[data-tour="export"]',
    title: "Export",
    description:
      "Download your book as an EPUB for Kindle and Apple Books, a PDF or a Word file.",
    placement: "bottom",
  },
  {
    id: "auto-save",
    target: '[data-tour="auto-save"]',
    title: "Saving",
    description:
      "Your book saves on this device a couple of seconds after you stop typing. The green dot means it's saved.",
    placement: "bottom",
  },
];

const MOBILE_STEPS: OnboardingStep[] = [
  {
    id: "mobile-menu",
    target: '[data-tour="mobile-menu"]',
    title: "Menu",
    description: "Your library, book details and chapters are all in here.",
    placement: "bottom",
  },
  {
    id: "mobile-editor",
    target: '[data-tour="mobile-editor"]',
    title: "Writing",
    description: "Write here. The formatting tools sit above the keyboard.",
    placement: "top",
  },
  {
    id: "mobile-preview",
    target: '[data-tour="mobile-preview"]',
    title: "Preview",
    description:
      "Read your chapter as it will look on a Kindle, an iPad or a phone.",
    placement: "bottom",
  },
];

interface UseOnboardingOptions {
  stepCallbacks?: Record<string, () => void>;
  onEnd?: () => void;
  userId?: string;
}

export function useOnboarding(options: UseOnboardingOptions = {}) {
  const { stepCallbacks, onEnd, userId } = options;
  const STORAGE_KEY = keys.onboardingComplete(userId);

  const [isTourActive, setIsTourActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(true);
  const [steps, setSteps] = useState<OnboardingStep[]>(DESKTOP_STEPS);
  const callbacksRef = useRef(stepCallbacks);
  const onEndRef = useRef(onEnd);
  useLayoutEffect(() => {
    callbacksRef.current = stepCallbacks;
    onEndRef.current = onEnd;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = readLocal(STORAGE_KEY);
    setIsOnboardingComplete(stored === "true");
  }, []);

  const getSteps = useCallback(() => {
    if (typeof window === "undefined") return DESKTOP_STEPS;
    return window.innerWidth < 1024 ? MOBILE_STEPS : DESKTOP_STEPS;
  }, []);

  const runStepCallback = useCallback(
    (stepIndex: number, stepList: OnboardingStep[]) => {
      const step = stepList[stepIndex];
      if (step && callbacksRef.current?.[step.id]) {
        callbacksRef.current[step.id]();
      }
    },
    [],
  );

  const startTour = useCallback(() => {
    const currentSteps = getSteps();
    setSteps(currentSteps);
    setCurrentStep(0);
    setIsTourActive(true);

    setTimeout(() => runStepCallback(0, currentSteps), 50);
  }, [getSteps, runStepCallback]);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => {
      const next = prev + 1;
      if (next >= steps.length) {
        setIsTourActive(false);
        onEndRef.current?.();
        setIsOnboardingComplete(true);
        if (typeof window !== "undefined") {
          writeLocal(STORAGE_KEY, "true");
        }
        return prev;
      }
      runStepCallback(next, steps);
      return next;
    });
  }, [steps, runStepCallback]);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => {
      const next = Math.max(0, prev - 1);
      runStepCallback(next, steps);
      return next;
    });
  }, [steps, runStepCallback]);

  const skipTour = useCallback(() => {
    setIsTourActive(false);
    onEndRef.current?.();
    setIsOnboardingComplete(true);
    if (typeof window !== "undefined") {
      writeLocal(STORAGE_KEY, "true");
    }
  }, []);

  const completeTour = useCallback(() => {
    skipTour();
  }, [skipTour]);

  const resetOnboarding = useCallback(() => {
    if (typeof window !== "undefined") {
      removeLocal(STORAGE_KEY);
    }
    setIsOnboardingComplete(false);
  }, []);

  return {
    isTourActive,
    currentStep,
    totalSteps: steps.length,
    currentStepData: isTourActive ? (steps[currentStep] ?? null) : null,
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
