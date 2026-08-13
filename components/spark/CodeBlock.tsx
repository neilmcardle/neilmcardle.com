import React from 'react';

interface CodeBlockProps {
  children: string;
  language?: string;
}

export function CodeBlock({ children, language = 'javascript' }: CodeBlockProps) {
  return (
    <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto my-4 text-sm">
      <code className={`language-${language}`}>
        {children}
      </code>
    </pre>
  );
}
