'use client';

import React, { useState } from 'react';
import { Chapter } from '../types';

interface LivePreviewPanelProps {
  chapters: Chapter[];
  selectedChapter: number;
  onChapterSelect?: (index: number) => void;
  onClose?: () => void;
}

type DeviceType = 'kindle' | 'ipad' | 'phone';
type ThemeType = 'light' | 'sepia' | 'dark';

const deviceDimensions = {
  kindle: { width: 280, height: 390, name: 'Kindle' },
  ipad:   { width: 310, height: 420, name: 'iPad' },
  phone:  { width: 220, height: 390, name: 'Phone' },
};

function EReaderContent({ chapter, theme }: { chapter?: Chapter; theme: ThemeType }) {
  const textColor = theme === 'dark' ? '#e5e5e5' : '#141413';
  const linkColor = theme === 'dark' ? '#93c5fd' : '#2563eb';

  if (!chapter) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <p className="text-gray-400 text-sm">No chapter selected</p>
      </div>
    );
  }

  return (
    <article
      className="p-6"
      style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: textColor, lineHeight: 1.8, fontSize: '13px' }}
    >
      {chapter.title && (
        <h1 className="text-base font-bold mb-4 text-center" style={{ color: textColor }}>
          {chapter.title}
        </h1>
      )}
      <div
        dangerouslySetInnerHTML={{ __html: chapter.content || '<p style="color:#999;font-style:italic;">No content yet…</p>' }}
        style={{ textAlign: 'justify' }}
        className="[&_p]:mb-3"
      />
      <style jsx>{`
        article :global(a) { color: ${linkColor}; }
        article :global(p:first-of-type) { text-indent: 0; }
        article :global(h1 + p), article :global(h2 + p), article :global(h3 + p) { text-indent: 0; }
      `}</style>
    </article>
  );
}

export default function LivePreviewPanel({ chapters, selectedChapter, onChapterSelect, onClose }: LivePreviewPanelProps) {
  const [device, setDevice] = useState<DeviceType>('kindle');
  const [theme, setTheme] = useState<ThemeType>('light');

  const dims = deviceDimensions[device];

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-[#0a0a0a]">
      {/* Header */}
      <div className="flex-shrink-0 p-3 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Live Preview</h3>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded transition-colors"
              title="Close preview"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        {/* Device selector */}
        <div className="flex gap-1">
          {(Object.entries(deviceDimensions) as [DeviceType, typeof deviceDimensions.kindle][]).map(([key, val]) => (
            <button
              key={key}
              onClick={() => setDevice(key)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                device === key
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-black'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {val.name}
            </button>
          ))}
        </div>
      </div>

      {/* E-reader frame */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        <div
          className="relative bg-[#2a2a2a] p-2 shadow-2xl max-w-full"
          style={{ width: dims.width + 16, borderRadius: 20 }}
        >
          <div
            className="w-full rounded-lg overflow-hidden"
            style={{
              width: dims.width,
              height: dims.height,
              maxWidth: '100%',
              backgroundColor: theme === 'light' ? '#ffffff' : theme === 'sepia' ? '#f4ecd8' : '#1a1a1a',
            }}
          >
            <div className="h-full overflow-y-auto">
              <EReaderContent chapter={chapters[selectedChapter]} theme={theme} />
            </div>
          </div>
        </div>
      </div>

      {/* Chapter nav */}
      {chapters.length > 1 && (
        <div className="flex-shrink-0 px-3 pb-2 border-t border-gray-200 dark:border-gray-800">
          <div className="flex gap-1 overflow-x-auto py-2">
            {chapters.map((ch, i) => (
              <button
                key={ch.id}
                onClick={() => onChapterSelect?.(i)}
                className={`px-2 py-1 text-xs rounded-full whitespace-nowrap transition-colors ${
                  i === selectedChapter
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-black'
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {ch.title || `Ch ${i + 1}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Theme picker */}
      <div className="flex-shrink-0 p-3 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-center gap-3">
          {(['light', 'sepia', 'dark'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`w-6 h-6 rounded-full border-2 transition-all ${
                theme === t
                  ? 'scale-110 border-gray-900 dark:border-white shadow-md'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-500'
              }`}
              style={{ backgroundColor: t === 'light' ? '#ffffff' : t === 'sepia' ? '#f4ecd8' : '#1a1a1a' }}
              title={t.charAt(0).toUpperCase() + t.slice(1)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
