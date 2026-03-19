"use client"

import React from 'react';

interface EmptyStateHintProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  compact?: boolean;
}

export default function EmptyStateHint({ icon, title, description, action, compact }: EmptyStateHintProps) {
  return (
    <div className={`flex flex-col items-center text-center ${compact ? 'py-4 px-2' : 'py-6 px-3'}`}>
      {icon && (
        <div className={`text-gray-300 dark:text-[#888] ${compact ? 'mb-1.5' : 'mb-2'}`}>
          {icon}
        </div>
      )}
      <p className={`font-medium text-gray-500 dark:text-[#a3a3a3] ${compact ? 'text-3xs mb-0.5' : 'text-xs mb-1'}`}>
        {title}
      </p>
      <p className={`text-gray-400 dark:text-[#737373] ${compact ? 'text-2xs' : 'text-3xs'}`}>
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className={`mt-2 text-gray-600 dark:text-[#d4d4d4] underline hover:text-gray-900 dark:hover:text-white transition-colors ${compact ? 'text-2xs' : 'text-xs'}`}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
