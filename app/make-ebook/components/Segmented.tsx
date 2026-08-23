"use client";

import React from "react";

export function SegmentedGroup({
  children,
  label,
  className = "",
}: {
  children: React.ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={`inline-flex items-center gap-0.5 p-0.5 rounded-full bg-gray-100 dark:bg-white/[0.06] ${className}`}
    >
      {children}
    </div>
  );
}

export function SegmentedItem({
  active,
  onClick,
  title,
  children,
  className = "",
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-pressed={active}
      className={`flex items-center justify-center h-7 px-2.5 rounded-full text-11 font-medium transition-colors duration-[var(--me-dur-fast)] ${
        active
          ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
          : "text-gray-600 dark:text-[#a3a3a3] hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/70 dark:hover:bg-white/[0.06]"
      } ${className}`}
    >
      {children}
    </button>
  );
}
