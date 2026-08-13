'use client';

import React, { useState, useEffect } from 'react';
import { Check, Copy } from 'lucide-react';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';

interface CodeBlockProps {
  children: string;
  language?: string;
}

export function CodeBlock({ children, language = 'javascript' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [highlighted, setHighlighted] = useState('');

  useEffect(() => {
    try {
      const result = hljs.highlight(children, { language, ignoreIllegals: true });
      setHighlighted(result.value);
    } catch (error) {
      setHighlighted(hljs.highlightAuto(children).value);
    }
  }, [children, language]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const languageLabels: Record<string, string> = {
    js: 'JavaScript',
    javascript: 'JavaScript',
    jsx: 'JSX',
    ts: 'TypeScript',
    typescript: 'TypeScript',
    tsx: 'TSX',
    css: 'CSS',
    html: 'HTML',
    json: 'JSON',
    bash: 'Bash',
    sh: 'Shell',
    sql: 'SQL',
    md: 'Markdown',
    python: 'Python',
  };

  const label = languageLabels[language] || language.toUpperCase();

  return (
    <div className="my-6 rounded-lg overflow-hidden border border-gray-300">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
        <span className="text-xs font-mono font-semibold text-gray-300 uppercase tracking-wide">
          {label}
        </span>
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-2 px-3 py-1 rounded text-xs font-medium text-gray-300 hover:bg-gray-700 transition-colors"
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
      <pre className="p-4 overflow-x-auto text-sm leading-relaxed bg-gray-900">
        <code
          className="font-mono whitespace-pre hljs"
          dangerouslySetInnerHTML={{ __html: highlighted || children }}
        />
      </pre>
    </div>
  );
}
