"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";

const WIDTHS = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
} as const;

export type ModalWidth = keyof typeof WIDTHS;

interface ModalProps {
  open: boolean;
  onClose: () => void;
  width?: ModalWidth;
  zIndex?: number;
  label: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({
  open,
  onClose,
  width = "md",
  zIndex = 10000,
  label,
  children,
  className = "",
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm me-fade-in"
      style={{ zIndex }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={label}
    >
      <div
        className={`me-rise-in flex flex-col w-full ${WIDTHS[width]} max-h-[90vh] overflow-hidden bg-white dark:bg-[#1c1c1c] rounded-modal border border-gray-200 dark:border-white/10 shadow-modal ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}

export function ModalHeader({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle?: string;
  onClose?: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex-shrink-0 flex items-start justify-between gap-4 px-6 py-4 border-b border-gray-200 dark:border-white/10">
      <div className="min-w-0">
        <h2 className="text-[15px] font-semibold text-gray-900 dark:text-[#f5f5f5] truncate">
          {title}
        </h2>
        {subtitle && (
          <p className="text-11 text-gray-500 dark:text-[#a3a3a3] mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
      <div className="flex items-center gap-1 flex-shrink-0 -mr-2">
        {children}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-control text-gray-500 dark:text-[#a3a3a3] hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors duration-[var(--me-dur-fast)]"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

export function ModalBody({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex-1 min-h-0 overflow-y-auto px-6 py-5 ${className}`}>
      {children}
    </div>
  );
}

export function ModalFooter({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex-shrink-0 flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-200 dark:border-white/10 ${className}`}
    >
      {children}
    </div>
  );
}
