'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface ModuleCardProps {
  mod: {
    slug: string;
    title: string;
    module: number;
    phase: string;
    promise: string;
  };
}

export function ModuleCard({ mod }: ModuleCardProps) {
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const key = `spark_module_${mod.module}_complete`;
    const stored = localStorage.getItem(key);
    setIsComplete(stored === 'true');
  }, [mod.module]);

  const toggleComplete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const key = `spark_module_${mod.module}_complete`;
    const newValue = !isComplete;
    localStorage.setItem(key, newValue ? 'true' : 'false');
    setIsComplete(newValue);
  };

  return (
    <Link
      href={`/spark/lessons/${mod.slug}`}
      className="group relative block"
    >
      {/* Card */}
      <div className="relative p-8 bg-transparent rounded-lg shadow-border hover:shadow-border-hover transition-shadow aspect-square flex flex-col overflow-hidden">
        {/* Checkbox */}
        <button
          onClick={toggleComplete}
          className="absolute top-4 right-4 w-6 h-6 rounded border-2 transition-colors flex items-center justify-center z-20"
          style={{
            background: isComplete ? '#374151' : 'transparent',
            borderColor: isComplete ? '#374151' : '#d1d5db',
          }}
        >
          {isComplete && (
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Content - number above title */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center flex-1 px-4">
          {/* Large number */}
          <span className="text-8xl font-bold leading-none mb-4" style={{fontFamily: 'var(--font-playfair)', color: 'rgba(0,0,0,0.1)'}}>
            {String(mod.module).padStart(2, '0')}
          </span>

          {/* Title */}
          <h3 className="text-4xl font-bold text-gray-900 leading-tight" style={{fontFamily: 'var(--font-playfair)'}}>
            {mod.title || 'Module'}
          </h3>
        </div>

        <div className="relative z-10 text-center pt-4">
          <span className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors">
            Read module →
          </span>
        </div>
      </div>
    </Link>
  );
}
