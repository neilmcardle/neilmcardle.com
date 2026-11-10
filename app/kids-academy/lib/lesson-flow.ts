"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import { play } from "@/app/kids-academy/lib/sound";
import {
  AUTO_ADVANCE_MS,
  CELEBRATE_MS,
  canAutoAdvance,
  initialLessonSteps,
  lessonProgress,
  lessonSteps,
} from "@/app/kids-academy/lib/lesson-steps";

export function useLessonSteps({
  totalSteps,
  onProgress,
  autoAdvance = false,
}: {
  totalSteps: number;
  onProgress: (percentage: number) => void;
  autoAdvance?: boolean;
}) {
  const [state, dispatch] = useReducer(
    lessonSteps,
    totalSteps,
    initialLessonSteps,
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const timers = useRef(new Map<number, Set<number>>());
  const onProgressRef = useRef(onProgress);

  useEffect(() => {
    onProgressRef.current = onProgress;
  });

  const scrollToStep = useCallback((index: number) => {
    const target = sectionRefs.current[index];
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const clearTimers = useCallback((step?: number) => {
    const entries = step === undefined ? [...timers.current.keys()] : [step];
    for (const key of entries) {
      timers.current.get(key)?.forEach((id) => window.clearTimeout(id));
      timers.current.delete(key);
    }
  }, []);

  const later = useCallback((step: number, fn: () => void, ms: number) => {
    const set = timers.current.get(step) ?? new Set<number>();
    timers.current.set(step, set);
    const id = window.setTimeout(() => {
      set.delete(id);
      fn();
    }, ms);
    set.add(id);
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const progress = lessonProgress(state);
  useEffect(() => {
    onProgressRef.current(progress);
  }, [progress]);

  useEffect(() => {
    if (state.celebrating === null) return;
    const step = state.celebrating;
    play("stepPass");
    const t = window.setTimeout(
      () => dispatch({ type: "celebrated", step }),
      CELEBRATE_MS,
    );
    return () => window.clearTimeout(t);
  }, [state.celebrating]);

  const finishedRef = useRef(state.finished);
  useEffect(() => {
    finishedRef.current = state.finished;
  });

  const playFinishOnce = useCallback(
    (from: number) => {
      if (from + 1 !== totalSteps || finishedRef.current) return;
      finishedRef.current = true;
      play("moduleComplete");
    },
    [totalSteps],
  );

  const autoStep =
    autoAdvance && canAutoAdvance(state) ? state.celebrating : null;
  useEffect(() => {
    if (autoStep === null) return;
    const t = window.setTimeout(() => {
      playFinishOnce(autoStep);
      dispatch({ type: "advance", from: autoStep, auto: true });
      requestAnimationFrame(() => scrollToStep(autoStep + 1));
    }, AUTO_ADVANCE_MS);
    return () => window.clearTimeout(t);
  }, [autoStep, scrollToStep, playFinishOnce]);

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const idx = Number((visible.target as HTMLElement).dataset.step);
        if (!Number.isNaN(idx)) dispatch({ type: "view", step: idx });
      },
      { root, threshold: [0.55, 0.9] },
    );
    sectionRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [state.unlockedUpTo]);

  const sectionRef = useCallback(
    (i: number) => (el: HTMLElement | null) => {
      sectionRefs.current[i] = el;
    },
    [],
  );

  const markStepComplete = useCallback(
    (step: number) => dispatch({ type: "complete", step }),
    [],
  );

  const continueFrom = useCallback(
    (from: number) => {
      if (from + 1 < totalSteps) play("continueTap");
      else playFinishOnce(from);
      dispatch({ type: "advance", from });
      requestAnimationFrame(() => scrollToStep(from + 1));
    },
    [scrollToStep, totalSteps, playFinishOnce],
  );

  const goBack = useCallback(
    (i: number) => {
      if (i <= 0) return;
      scrollToStep(i - 1);
    },
    [scrollToStep],
  );

  const goForward = useCallback(
    (i: number) => {
      if (i + 1 > state.unlockedUpTo) return;
      scrollToStep(i + 1);
    },
    [scrollToStep, state.unlockedUpTo],
  );

  const resetStep = useCallback(
    (step: number) => {
      clearTimers(step);
      dispatch({ type: "resetStep", step });
    },
    [clearTimers],
  );

  const restart = useCallback(() => {
    clearTimers();
    dispatch({ type: "restart" });
    requestAnimationFrame(() => scrollToStep(0));
  }, [clearTimers, scrollToStep]);

  return {
    activeStep: state.active,
    unlockedUpTo: state.unlockedUpTo,
    completedSteps: state.completed,
    justCompleted: state.celebrating,
    finished: state.finished,
    scrollRef,
    sectionRef,
    scrollToStep,
    markStepComplete,
    continueFrom,
    goBack,
    goForward,
    resetStep,
    restart,
    later,
  };
}
