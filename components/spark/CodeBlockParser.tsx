'use client';

import React from 'react';
import { CodeBlock } from './CodeBlock';
import { FilteringWidget } from './FilteringWidget';

// Create a stub Check component since we can't render the real one from text
const Check = ({ question, answer }: { question: string; answer: string }) => (
  <div className="my-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
    <p className="font-semibold text-sm text-blue-900 mb-2">{question}</p>
    <p className="text-sm text-blue-800">{answer}</p>
  </div>
);

interface CodeBlockParserProps {
  children: string;
}

const COMPONENTS: Record<string, React.ComponentType<any>> = {
  FilteringWidget,
  Check,
};

export function CodeBlockParser({ children }: CodeBlockParserProps) {
  const parts: (string | { type: 'code'; language: string; code: string } | { type: 'component'; name: string; attrs: Record<string, string> })[] = [];
  const codeBlockRegex = /```(\w+)?\s*\n([\s\S]*?)\n```/g;
  const componentRegex = /<(\w+)[^>]*\/>/g;

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
    const fullTag = match[0];
    const componentName = match[1];
    const attrs = parseAttributes(fullTag);

    matches.push({
      index: match.index,
      length: fullTag.length,
      type: 'component',
      data: { name: componentName, attrs },
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
        attrs: m.data.attrs,
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
            return <Component key={i} {...part.attrs} />;
          }
          return <div key={i} className="text-red-500">Unknown component: {part.name}</div>;
        }
      })}
    </div>
  );
}

function parseAttributes(tag: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const attrRegex = /(\w+)=["']([^"']*)["']/g;
  let match;

  while ((match = attrRegex.exec(tag)) !== null) {
    attrs[match[1]] = match[2];
  }

  return attrs;
}
