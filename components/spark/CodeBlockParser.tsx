'use client';

import React from 'react';
import { CodeBlock } from './CodeBlock';

interface CodeBlockParserProps {
  children: string;
}

export function CodeBlockParser({ children }: CodeBlockParserProps) {
  const parts: (string | { type: 'code'; language: string; code: string })[] = [];
  const codeBlockRegex = /```(\w+)?\s*\n([\s\S]*?)\n```/g;

  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(children)) !== null) {
    // Add text before the code block
    if (match.index > lastIndex) {
      parts.push(children.substring(lastIndex, match.index));
    }

    // Add the code block
    parts.push({
      type: 'code',
      language: match[1] || 'javascript',
      code: match[2].trim(),
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < children.length) {
    parts.push(children.substring(lastIndex));
  }

  return (
    <div className="space-y-4">
      {parts.map((part, i) => {
        if (typeof part === 'string') {
          return (
            <p key={i} className="text-slate-700 dark:text-slate-50 leading-relaxed whitespace-pre-wrap">
              {part}
            </p>
          );
        }

        return (
          <CodeBlock key={i} language={part.language}>
            {part.code}
          </CodeBlock>
        );
      })}
    </div>
  );
}
