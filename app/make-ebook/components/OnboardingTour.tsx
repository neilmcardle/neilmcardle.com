"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { OnboardingStep } from "../hooks/useOnboarding";
import styles from "../styles/studio.module.css";

interface OnboardingTourProps {
  isTourActive: boolean;
  currentStep: number;
  totalSteps: number;
  stepData: OnboardingStep | null;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}

type Side = "top" | "bottom" | "left" | "right";
type Box = { top: number; left: number; width: number; height: number };
type Layout = {
  spot: Box | null;
  card: { top: number; left: number };
  side: Side | "inside" | "centre";
  arrow: number;
};

const GAP = 14;
const MARGIN = 16;
const SPOT_PAD = 6;
const WAIT_MS = 2500;

function visibleTarget(selector: string): HTMLElement | null {
  for (const el of document.querySelectorAll<HTMLElement>(selector)) {
    const rect = el.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) continue;
    if (getComputedStyle(el).visibility === "hidden") continue;
    return el;
  }
  return null;
}

function layoutFor(
  target: DOMRect | null,
  card: { width: number; height: number },
  preferred: Side,
): Layout {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  if (!target) {
    return {
      spot: null,
      card: {
        top: Math.max(MARGIN, (vh - card.height) / 2),
        left: Math.max(MARGIN, (vw - card.width) / 2),
      },
      side: "centre",
      arrow: 0,
    };
  }

  const top = Math.max(8, target.top - SPOT_PAD);
  const bottom = Math.min(vh - 8, target.bottom + SPOT_PAD);
  const left = Math.max(8, target.left - SPOT_PAD);
  const right = Math.min(vw - 8, target.right + SPOT_PAD);
  const spot = { top, left, width: right - left, height: bottom - top };

  const room: Record<Side, boolean> = {
    right: vw - right - GAP >= card.width + MARGIN,
    left: left - GAP >= card.width + MARGIN,
    bottom: vh - bottom - GAP >= card.height + MARGIN,
    top: top - GAP >= card.height + MARGIN,
  };
  const narrow = vw < 640;
  const order: Side[] = narrow
    ? ["bottom", "top"]
    : [
        preferred,
        ...(["right", "left", "bottom", "top"] as Side[]).filter(
          (s) => s !== preferred,
        ),
      ];
  const side = order.find((s) => room[s]);

  const clampTop = (y: number) =>
    Math.min(vh - card.height - MARGIN, Math.max(MARGIN, y));
  const clampLeft = (x: number) =>
    Math.min(vw - card.width - MARGIN, Math.max(MARGIN, x));
  const tall = spot.height > card.height * 1.6;
  const wide = spot.width > card.width * 1.6;

  if (side === "right" || side === "left") {
    const y = clampTop(
      tall ? spot.top + 20 : spot.top + spot.height / 2 - card.height / 2,
    );
    const x = side === "right" ? right + GAP : left - GAP - card.width;
    const aim = tall ? spot.top + 40 : spot.top + spot.height / 2;
    return {
      spot,
      card: { top: y, left: x },
      side,
      arrow: Math.min(card.height - 20, Math.max(20, aim - y)),
    };
  }
  if (side === "bottom" || side === "top") {
    const x = clampLeft(
      wide ? spot.left + 20 : spot.left + spot.width / 2 - card.width / 2,
    );
    const y = side === "bottom" ? bottom + GAP : top - GAP - card.height;
    const aim = wide ? spot.left + 40 : spot.left + spot.width / 2;
    return {
      spot,
      card: { top: y, left: x },
      side,
      arrow: Math.min(card.width - 20, Math.max(20, aim - x)),
    };
  }
  return {
    spot,
    card: {
      top: clampTop(bottom - card.height - 24),
      left: clampLeft(right - card.width - 24),
    },
    side: "inside",
    arrow: 0,
  };
}

export default function OnboardingTour({
  isTourActive,
  currentStep,
  totalSteps,
  stepData,
  onNext,
  onPrev,
  onSkip,
}: OnboardingTourProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const targetRef = useRef<HTMLElement | null>(null);
  const [placed, setPlaced] = useState<{
    step: number;
    layout: Layout;
  } | null>(null);
  const layout = placed?.step === currentStep ? placed.layout : null;

  const place = useCallback(() => {
    const card = cardRef.current;
    if (!card || !stepData) return;
    const size = { width: card.offsetWidth, height: card.offsetHeight };
    const target = targetRef.current?.isConnected
      ? targetRef.current.getBoundingClientRect()
      : null;
    setPlaced({
      step: currentStep,
      layout: layoutFor(target, size, stepData.placement),
    });
  }, [stepData, currentStep]);

  useEffect(() => {
    if (!isTourActive || !stepData) return;
    targetRef.current = null;
    const started = performance.now();
    let frame = 0;
    let last = "";
    const track = () => {
      if (!targetRef.current?.isConnected) {
        targetRef.current = visibleTarget(stepData.target);
      }
      const found = targetRef.current;
      const waited = performance.now() - started > WAIT_MS;
      if (found || waited) {
        const r = found?.getBoundingClientRect();
        const key = r
          ? `${r.top},${r.left},${r.width},${r.height},${window.innerWidth},${window.innerHeight}`
          : `none,${window.innerWidth},${window.innerHeight}`;
        if (key !== last) {
          last = key;
          place();
        }
      }
      frame = requestAnimationFrame(track);
    };
    frame = requestAnimationFrame(track);
    return () => cancelAnimationFrame(frame);
  }, [isTourActive, stepData, currentStep, place]);

  useEffect(() => {
    if (!isTourActive) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onSkip();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isTourActive, onSkip]);

  useEffect(() => {
    if (layout) nextRef.current?.focus({ preventScroll: true });
  }, [layout, currentStep]);

  if (!isTourActive || !stepData) return null;

  const first = currentStep === 0;
  const last = currentStep === totalSteps - 1;
  const shown = layout !== null;
  const arrowSide =
    layout && layout.side !== "inside" && layout.side !== "centre"
      ? layout.side
      : null;

  return (
    <>
      <div className={styles.tourCatch} onClick={onSkip} aria-hidden="true" />
      <div
        className={`${styles.tourSpot} ${shown ? styles.tourShown : ""}`}
        data-tour-spot
        style={
          layout?.spot
            ? {
                top: layout.spot.top,
                left: layout.spot.left,
                width: layout.spot.width,
                height: layout.spot.height,
              }
            : { top: "50%", left: "50%", width: 0, height: 0 }
        }
        aria-hidden="true"
      />
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
        aria-describedby="tour-body"
        className={`${styles.tourCard} ${shown ? styles.tourShown : ""}`}
        style={layout ? layout.card : { top: -9999, left: -9999 }}
      >
        {arrowSide && (
          <span
            className={styles.tourArrow}
            data-side={arrowSide}
            style={
              arrowSide === "left" || arrowSide === "right"
                ? { top: layout!.arrow }
                : { left: layout!.arrow }
            }
            aria-hidden="true"
          />
        )}
        <div className={styles.tourTop}>
          <span className={styles.tourCount}>
            {currentStep + 1} of {totalSteps}
          </span>
          <button
            type="button"
            className={styles.tourClose}
            onClick={onSkip}
            aria-label="Close the tour"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
              <path
                d="M2.5 2.5l7 7M9.5 2.5l-7 7"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <p id="tour-title" className={styles.tourTitle}>
          {stepData.title}
        </p>
        <p id="tour-body" className={styles.tourBody}>
          {stepData.description}
        </p>
        <div className={styles.tourFoot}>
          {!first ? (
            <button type="button" className={styles.quiet} onClick={onPrev}>
              Back
            </button>
          ) : (
            <span />
          )}
          <span className={styles.tourActions}>
            {!last && (
              <button type="button" className={styles.quiet} onClick={onSkip}>
                Skip
              </button>
            )}
            <button
              ref={nextRef}
              type="button"
              className={styles.acid}
              onClick={onNext}
            >
              {last ? "Done" : "Next"}
            </button>
          </span>
        </div>
      </div>
    </>
  );
}
