'use client';

import { useState } from 'react';

interface CheckProps {
  question: string;
  hint?: string;
}

export function Check({ question, hint }: CheckProps) {
  const [answered, setAnswered] = useState(false);

  return (
    <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-6 my-6">
      <p className="text-slate-900 dark:text-white font-semibold mb-4">
        {question}
      </p>
      {hint && (
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          <strong>Hint:</strong> {hint}
        </p>
      )}
      <button
        onClick={() => setAnswered(true)}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
      >
        {answered ? 'Got it ✓' : 'I can answer this'}
      </button>
    </div>
  );
}
