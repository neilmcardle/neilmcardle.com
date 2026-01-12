'use client';

import React, { useState } from 'react';
import { Chapter } from '../types';

interface SplitPreviewLayoutProps {
  children: React.ReactNode;
  chapters: Chapter[];
  selectedChapter: number;
  isPreviewEnabled: boolean;
  onTogglePreviewAction: () => void;
  onChapterSelectAction?: (index: number) => void;
}

type DeviceType = 'kindle' | 'ipad' | 'phone';
type ThemeType = 'light' | 'sepia' | 'dark';

// Aspect ratios for devices (will scale to fit)
const deviceDimensions = {
  kindle: { width: 300, height: 420, name: 'Kindle' },
  ipad: { width: 340, height: 450, name: 'iPad' },
  phone: { width: 240, height: 420, name: 'Phone' },
};

export function SplitPreviewLayout({
  children,
  chapters,
  selectedChapter,
  isPreviewEnabled,
  onTogglePreviewAction,
  onChapterSelectAction,
}: SplitPreviewLayoutProps) {
  const [previewDevice, setPreviewDevice] = useState<DeviceType>('kindle');
  const [previewTheme, setPreviewTheme] = useState<ThemeType>('light');

  const device = deviceDimensions[previewDevice];

  return (
    <div className="flex h-full w-full">
      {/* Editor Panel */}
      <div className={`flex-1 min-w-0 transition-all duration-300 ${
        isPreviewEnabled ? 'lg:pr-4' : ''
      }`}>
        {children}
      </div>

      {/* Preview Panel - Slides in from right */}
      <div className={`hidden lg:block transition-all duration-300 ease-in-out overflow-hidden ${
        isPreviewEnabled ? 'w-[420px] opacity-100' : 'w-0 opacity-0'
      }`}>
        <div className="h-full flex flex-col bg-gray-50 dark:bg-[#0f0f0f] rounded-lg border border-gray-200 dark:border-[#2a2a2a]">
          
          {/* Preview Header */}
          <div className="flex-shrink-0 p-3 border-b border-gray-200 dark:border-[#2a2a2a]">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="inline-block">
                    <img
                      src="/preview-ereader.svg"
                      alt="E-reader preview"
                      className="w-4 h-4 dark:hidden"
                    />
                    <img
                      src="/preview-ereader-dark.svg"
                      alt="E-reader preview dark"
                      className="w-4 h-4 hidden dark:inline"
                    />
                  </span>
                Live Preview
              </h3>
              <button
                onClick={onTogglePreviewAction}
                className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                aria-label="Close preview"
              >
                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Device Selector */}
            <div className="flex gap-1">
              {(Object.entries(deviceDimensions) as [DeviceType, typeof deviceDimensions.kindle][]).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => setPreviewDevice(key)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    previewDevice === key
                      ? 'bg-black text-white dark:bg-white dark:text-black'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {val.name}
                </button>
              ))}
            </div>
          </div>

          {/* E-Reader Frame */}
          <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
            <div 
              className="relative bg-[#2a2a2a] rounded-2xl p-2 shadow-2xl max-w-full"
              style={{ 
                width: device.width + 16,
              }}
            >
              {/* Screen */}
              <div 
                className={`w-full rounded-lg overflow-hidden transition-colors ${
                  previewTheme === 'light' ? 'bg-white' :
                  previewTheme === 'sepia' ? 'bg-[#f4ecd8]' :
                  'bg-[#1a1a1a]'
                }`}
                style={{ 
                  width: device.width, 
                  height: device.height,
                  maxWidth: '100%',
                }}
              >
                {/* Chapter content preview */}
                <div className="h-full overflow-y-auto">
                  <EReaderContent
                    chapter={chapters[selectedChapter]}
                    theme={previewTheme}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Chapter Navigation */}
          {chapters.length > 1 && (
            <div className="flex-shrink-0 px-3 pb-2 border-t border-gray-200 dark:border-[#2a2a2a]">
              <div className="flex gap-1 overflow-x-auto py-2 scrollbar-thin">
                {chapters.map((ch, i) => (
                  <button
                    key={ch.id}
                    onClick={() => onChapterSelectAction?.(i)}
                    className={`px-2 py-1 text-xs rounded-full whitespace-nowrap transition-colors ${
                      i === selectedChapter
                        ? 'bg-black text-white dark:bg-white dark:text-black'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {ch.title || `Ch ${i + 1}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Theme Controls */}
          <div className="flex-shrink-0 p-3 border-t border-gray-200 dark:border-[#2a2a2a]">
            <div className="flex items-center justify-center gap-3">
              <span className="text-xs text-gray-500 dark:text-gray-400">Theme:</span>
              {(['light', 'sepia', 'dark'] as const).map((theme) => (
                <button
                  key={theme}
                  onClick={() => setPreviewTheme(theme)}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${
                    previewTheme === theme 
                      ? 'scale-110 border-blue-500 shadow-md' 
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                  } ${
                    theme === 'light' ? 'bg-white' :
                    theme === 'sepia' ? 'bg-[#f4ecd8]' :
                    'bg-[#1a1a1a]'
                  }`}
                  aria-label={`${theme} theme`}
                  title={theme.charAt(0).toUpperCase() + theme.slice(1)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// E-Reader content renderer with proper typography
function EReaderContent({ 
  chapter, 
  theme 
}: { 
  chapter?: Chapter; 
  theme: ThemeType;
}) {
  const textColor = theme === 'dark' ? '#e5e5e5' : '#1a1a1a';
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
      style={{ 
        fontFamily: 'Georgia, "Times New Roman", serif',
        color: textColor,
        lineHeight: 1.8,
        fontSize: '14px',
      }}
    >
      {chapter.title && (
        <h1 
          className="text-lg font-bold mb-4 text-center"
          style={{ color: textColor }}
        >
          {chapter.title}
        </h1>
      )}
      <div 
        dangerouslySetInnerHTML={{ __html: chapter.content || '<p style="color: #999; font-style: italic;">No content yet...</p>' }}
        style={{
          textAlign: 'justify',
        }}
        className="prose-sm [&_p]:mb-3 [&_p]:text-indent-4 [&_a]:no-underline"
      />
      <style jsx>{`
        article :global(a) {
          color: ${linkColor};
        }
        article :global(p:first-of-type) {
          text-indent: 0;
        }
        article :global(h1 + p),
        article :global(h2 + p),
        article :global(h3 + p) {
          text-indent: 0;
        }
      `}</style>
    </article>
  );
}

export default SplitPreviewLayout;
