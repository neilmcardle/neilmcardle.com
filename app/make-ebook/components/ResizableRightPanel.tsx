'use client';

import React, { useRef, useState, useEffect } from 'react';

const MIN_WIDTH = 280;
const MAX_WIDTH = 720;
const DEFAULT_WIDTH = 384; // w-96
const STORAGE_KEY = 'me-right-panel-width';

interface ResizableRightPanelProps {
  children: React.ReactNode;
  className?: string;
}

export default function ResizableRightPanel({ children, className = '' }: ResizableRightPanelProps) {
  const [width, setWidth] = useState(() => {
    if (typeof window === 'undefined') return DEFAULT_WIDTH;
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? Math.min(Math.max(parseInt(saved, 10), MIN_WIDTH), MAX_WIDTH) : DEFAULT_WIDTH;
  });

  const panelRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(DEFAULT_WIDTH);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    startX.current = e.clientX;
    startWidth.current = width;
    if (panelRef.current) panelRef.current.style.transition = 'none';
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      // dragging left increases width (panel is on the right)
      const next = Math.min(Math.max(startWidth.current - (e.clientX - startX.current), MIN_WIDTH), MAX_WIDTH);
      if (panelRef.current) panelRef.current.style.width = `${next}px`;
    };

    const onUp = () => {
      if (!isResizing.current) return;
      isResizing.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      if (panelRef.current) {
        panelRef.current.style.transition = '';
        const final = Math.min(Math.max(Math.round(parseFloat(panelRef.current.style.width) || startWidth.current), MIN_WIDTH), MAX_WIDTH);
        setWidth(final);
        try { localStorage.setItem(STORAGE_KEY, String(final)); } catch {}
      }
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, []);

  return (
    <div
      ref={panelRef}
      style={{ width }}
      className={`hidden lg:flex flex-col flex-shrink-0 h-screen overflow-hidden border-l border-gray-200 dark:border-gray-800 relative ${className}`}
    >
      {/* Resize handle — left edge */}
      <div
        className="absolute left-0 top-0 h-full w-1 cursor-col-resize z-50 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        onMouseDown={handleResizeStart}
      />
      {children}
    </div>
  );
}
