'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#faf9f5] dark:bg-[#0f0f0f] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <p className="text-5xl font-bold text-[#141413]/10 dark:text-white/10 mb-4">Oops</p>
        <h1 className="text-2xl font-bold text-[#141413] dark:text-white mb-2">
          Something went wrong
        </h1>
        <p className="text-[#141413]/60 dark:text-white/50 mb-8">
          An unexpected error occurred. Your work is safe — try refreshing or heading back.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-5 py-2.5 rounded-lg bg-[#141413] dark:bg-white text-[#faf9f5] dark:text-[#141413] text-sm font-medium hover:bg-[#141413]/80 dark:hover:bg-gray-100 transition-colors"
          >
            Try again
          </button>
          <a
            href="/"
            className="px-5 py-2.5 rounded-lg border border-[#e4e4de] dark:border-[#333] text-[#141413] dark:text-white text-sm font-medium hover:bg-[#f0eee6] dark:hover:bg-white/5 transition-colors"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}
