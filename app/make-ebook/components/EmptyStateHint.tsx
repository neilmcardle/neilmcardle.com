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
        <div className={`text-gray-300 dark:text-gray-700 ${compact ? 'mb-1.5' : 'mb-2'}`}>
          {icon}
        </div>
      )}
      <p className={`font-medium text-gray-500 dark:text-gray-400 ${compact ? 'text-[11px] mb-0.5' : 'text-xs mb-1'}`}>
        {title}
      </p>
      <p className={`text-gray-400 dark:text-gray-500 ${compact ? 'text-[10px]' : 'text-[11px]'}`}>
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className={`mt-2 text-gray-600 dark:text-gray-300 underline hover:text-gray-900 dark:hover:text-white transition-colors ${compact ? 'text-[10px]' : 'text-xs'}`}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
