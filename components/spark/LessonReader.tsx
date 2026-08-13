'use client';

import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';

interface Section {
  title: string;
  index: number;
}

interface LessonReaderProps {
  title: string;
  module: number;
  phase: string;
  sections: Section[];
  mdxContent: React.ReactNode;
}

export function LessonReader({ title, module, phase, sections, mdxContent }: LessonReaderProps) {
  const [currentSection, setCurrentSection] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const key = `spark_progress_m${module}`;
    const saved = localStorage.getItem(key);
    if (saved) setCurrentSection(parseInt(saved));
  }, [module]);

  useEffect(() => {
    const key = `spark_progress_m${module}`;
    localStorage.setItem(key, currentSection.toString());
    setProgress(Math.round(((currentSection + 1) / sections.length) * 100));
  }, [currentSection, module, sections.length]);

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen">
      {/* Header */}
      <header className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-40">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Module {module} • {phase}</p>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-600 dark:text-slate-300">{currentSection + 1} of {sections.length}</p>
              <div className="w-32 h-2 bg-slate-200 dark:bg-slate-700 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-6 py-12">
        {mdxContent}
      </main>

      {/* Navigation */}
      <nav className="max-w-2xl mx-auto px-6 py-8 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
        <button
          onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
          disabled={currentSection === 0}
          className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 dark:text-white"
        >
          Previous
        </button>

        <div className="flex gap-2">
          {sections.map((section, i) => (
            <button
              key={i}
              onClick={() => setCurrentSection(i)}
              className={`px-2 py-1 rounded text-xs font-medium transition ${
                i === currentSection
                  ? 'bg-blue-500 text-white'
                  : i < currentSection
                  ? 'bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <button
          onClick={() => setCurrentSection(Math.min(sections.length - 1, currentSection + 1))}
          disabled={currentSection === sections.length - 1}
          className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white flex items-center gap-2"
        >
          Next <ChevronRight size={16} />
        </button>
      </nav>
    </div>
  );
}
