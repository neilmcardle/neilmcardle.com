"use client";

import React, { useRef, useState, useEffect } from "react";

const MIN_WIDTH = 280;
const MAX_WIDTH = 720;
const DEFAULT_WIDTH = 384;
const STORAGE_KEY = "me-right-panel-width";

interface ResizableRightPanelProps {
  children: React.ReactNode;
  className?: string;
}

export default function ResizableRightPanel({
  children,
  className = "",
}: ResizableRightPanelProps) {
  const [width, setWidth] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_WIDTH;
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved
      ? Math.min(Math.max(parseInt(saved, 10), MIN_WIDTH), MAX_WIDTH)
      : DEFAULT_WIDTH;
  });

  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setIsExpanded(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const panelRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(DEFAULT_WIDTH);

  const handleResizeStart = (e: React.PointerEvent) => {
    e.preventDefault();
    isResizing.current = true;
    startX.current = e.clientX;
    startWidth.current = width;
    if (panelRef.current) panelRef.current.style.transition = "none";
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  const commitWidth = (next: number) => {
    const clamped = Math.min(Math.max(next, MIN_WIDTH), MAX_WIDTH);
    setWidth(clamped);
    if (panelRef.current) panelRef.current.style.width = `${clamped}px`;
    try {
      localStorage.setItem(STORAGE_KEY, String(clamped));
    } catch {}
  };

  const handleResizeKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 48 : 16;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      commitWidth(width + step);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      commitWidth(width - step);
    } else if (e.key === "Home") {
      e.preventDefault();
      commitWidth(MAX_WIDTH);
    } else if (e.key === "End") {
      e.preventDefault();
      commitWidth(MIN_WIDTH);
    }
  };

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!isResizing.current) return;

      const next = Math.min(
        Math.max(startWidth.current - (e.clientX - startX.current), MIN_WIDTH),
        MAX_WIDTH,
      );
      if (panelRef.current) panelRef.current.style.width = `${next}px`;
    };

    const onUp = () => {
      if (!isResizing.current) return;
      isResizing.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      if (panelRef.current) {
        panelRef.current.style.transition = "";
        const final = Math.min(
          Math.max(
            Math.round(
              parseFloat(panelRef.current.style.width) || startWidth.current,
            ),
            MIN_WIDTH,
          ),
          MAX_WIDTH,
        );
        setWidth(final);
        try {
          localStorage.setItem(STORAGE_KEY, String(final));
        } catch {}
      }
    };

    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
    document.addEventListener("pointercancel", onUp);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointercancel", onUp);
    };
  }, []);

  return (
    <div
      ref={panelRef}
      style={{ width: isExpanded ? width : 0 }}
      className={`hidden lg:flex flex-col flex-shrink-0 h-screen overflow-hidden border-l-2 border-gray-300 dark:border-[#404040] relative transition-[width] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-x-hidden shadow-xl dark:shadow-black/20 ${className}`}
    >
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize panel"
        aria-valuenow={width}
        aria-valuemin={MIN_WIDTH}
        aria-valuemax={MAX_WIDTH}
        tabIndex={0}
        className="absolute left-0 top-0 h-full w-1 cursor-col-resize z-50 touch-none hover:bg-gray-300 dark:hover:bg-[#3a3a3a] focus-visible:bg-gray-400 dark:focus-visible:bg-[#4a4a4a] focus-visible:outline-none transition-colors"
        onPointerDown={handleResizeStart}
        onKeyDown={handleResizeKeyDown}
      />
      {children}
    </div>
  );
}
