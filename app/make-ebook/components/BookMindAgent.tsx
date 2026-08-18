'use client';

import React from 'react';

interface BookMindAgentProps {
  isLoading?: boolean;
  onOpen?: () => void;
}

export default function BookMindAgent({ isLoading = false, onOpen }: BookMindAgentProps) {
  return (
    <button
      onClick={onOpen}
      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      title="Open Book Mind"
    >
      <div className="w-5 h-5 flex-shrink-0">
        <svg width="20" height="20" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="13" height="13" rx="3" fill="white"/>
          <rect x="6" y="5" width="2" height="3" rx="1" fill="#09090A"/>
          <rect x="9" y="5" width="2" height="3" rx="1" fill="#09090A"/>
        </svg>
      </div>
      <span className="text-xs font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
        Book Mind
      </span>
    </button>
  );
}
