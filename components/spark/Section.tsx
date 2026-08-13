import React from 'react';

interface SectionProps {
  title: string;
  children: React.ReactNode;
  index: number;
  isVisible: boolean;
}

export function Section({ title, children, index, isVisible }: SectionProps) {
  if (!isVisible) return null;

  return (
    <section className="min-h-screen py-16 px-6 max-w-2xl mx-auto animate-in fade-in">
      <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">
        {title}
      </h2>
      <div className="prose prose-invert max-w-none text-slate-700 dark:text-slate-300 space-y-4">
        {children}
      </div>
      <div className="mt-12 flex justify-between items-center">
        <span className="text-sm text-slate-500">Section {index + 1}</span>
      </div>
    </section>
  );
}
