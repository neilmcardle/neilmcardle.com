'use client';

import React from 'react';
import { CodeBlock } from './CodeBlock';
import { FilteringWidget } from './FilteringWidget';

interface CodeBlockParserProps {
  children: string;
}

const COMPONENTS: Record<string, React.ComponentType<any>> = {
  FilteringWidget,
};

export function CodeBlockParser({ children }: CodeBlockParserProps) {
  const parts: (string | { type: 'code'; language: string; code: string } | { type: 'component'; name: string })[] = [];
  const codeBlockRegex = /```(\w+)?\s*\n([\s\S]*?)\n```/g;
  const componentRegex = /<(\w+)\s*\/>/g;

  let lastIndex = 0;
  let match;
  const matches: { index: number; length: number; type: 'code' | 'component'; data: any }[] = [];

  while ((match = codeBlockRegex.exec(children)) !== null) {
    matches.push({
      index: match.index,
      length: match[0].length,
      type: 'code',
      data: { language: match[1] || 'javascript', code: match[2].trim() },
    });
  }

  while ((match = componentRegex.exec(children)) !== null) {
    matches.push({
      index: match.index,
      length: match[0].length,
      type: 'component',
      data: { name: match[1] },
    });
  }

  matches.sort((a, b) => a.index - b.index);

  lastIndex = 0;
  for (const m of matches) {
    if (m.index > lastIndex) {
      parts.push(children.substring(lastIndex, m.index));
    }

    if (m.type === 'code') {
      parts.push({
        type: 'code',
        language: m.data.language,
        code: m.data.code,
      });
    } else if (m.type === 'component') {
      parts.push({
        type: 'component',
        name: m.data.name,
      });
    }

    lastIndex = m.index + m.length;
  }

  if (lastIndex < children.length) {
    parts.push(children.substring(lastIndex));
  }

  return (
    <div className="space-y-4">
      {parts.map((part, i) => {
        if (typeof part === 'string') {
          return (
            <p key={i} className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {part}
            </p>
          );
        }

        if (part.type === 'code') {
          return (
            <CodeBlock key={i} language={part.language}>
              {part.code}
            </CodeBlock>
          );
        }

        if (part.type === 'component') {
          const Component = COMPONENTS[part.name];
          if (Component) {
            return <Component key={i} />;
          }
          return <div key={i} className="text-red-500">Unknown component: {part.name}</div>;
        }
      })}
    </div>
  );
}
