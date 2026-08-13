'use client';

import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CodeBlockProps {
  children: string;
  language?: string;
}

export function CodeBlock({ children, language = 'js' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const languageLabels: Record<string, string> = {
    js: 'JavaScript',
    jsx: 'JSX',
    ts: 'TypeScript',
    tsx: 'TSX',
    css: 'CSS',
    html: 'HTML',
    json: 'JSON',
    bash: 'Bash',
    sh: 'Shell',
    sql: 'SQL',
    md: 'Markdown',
  };

  const label = languageLabels[language] || language.toUpperCase();

  return (
    <div className="my-6 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-100 border-b border-gray-200">
        <span className="text-xs font-mono font-semibold text-gray-600 uppercase tracking-wide">
          {label}
        </span>
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-2 px-3 py-1 rounded text-xs font-medium text-gray-600 hover:bg-gray-200 transition-colors"
          title="Copy to clipboard"
        >
          {copied ? (
            <>
              <Check size={14} />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code */}
      <pre className="p-4 overflow-x-auto text-sm leading-relaxed bg-white">
        <code className="font-mono text-gray-900 whitespace-pre">
          {children}
        </code>
      </pre>
    </div>
  );
}
