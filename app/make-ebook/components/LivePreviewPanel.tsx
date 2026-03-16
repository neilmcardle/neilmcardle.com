'use client';

import React, { useState } from 'react';
import { Chapter } from '../types';
import { TypographyPreset, PRESET_DESCRIPTIONS, TYPOGRAPHY_PRESETS } from '../utils/typographyPresets';

interface LivePreviewPanelProps {
  chapters: Chapter[];
  selectedChapter: number;
  onChapterSelect?: (index: number) => void;
  onClose?: () => void;
  typographyPreset?: TypographyPreset;
  setTypographyPreset?: (p: TypographyPreset) => void;
}

type DeviceType = 'kindle' | 'ipad' | 'phone';
type ThemeType = 'light' | 'sepia' | 'dark';

const deviceDimensions = {
  kindle: { width: 280, height: 390, name: 'Kindle' },
  ipad:   { width: 310, height: 420, name: 'iPad' },
  phone:  { width: 220, height: 390, name: 'Phone' },
};

function EReaderContent({
  chapter,
  theme,
  typographyPreset = 'default',
}: {
  chapter?: Chapter;
  theme: ThemeType;
  typographyPreset?: TypographyPreset;
}) {
  const textColor = theme === 'dark' ? '#e5e5e5' : '#141413';
  const linkColor = theme === 'dark' ? '#93c5fd' : '#2563eb';
  const preset = TYPOGRAPHY_PRESETS[typographyPreset];

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
        fontFamily: preset.fontFamily,
        color: textColor,
        lineHeight: preset.lineHeight,
        fontSize: '13px',
        textAlign: preset.textAlign as 'left' | 'justify',
      }}
    >
      {chapter.title && (
        <h1
          className="text-base font-bold mb-4"
          style={{ color: textColor, textAlign: (preset.chapterTitleAlign || 'center') as 'left' | 'center' }}
        >
          {chapter.title}
        </h1>
      )}
      <div
        dangerouslySetInnerHTML={{ __html: chapter.content || '<p style="color:#999;font-style:italic;">No content yet…</p>' }}
        className="[&_p]:mb-3"
        style={{ textIndent: preset.textIndent }}
      />
      <style jsx>{`
        article :global(a) { color: ${linkColor}; }
        article :global(p:first-of-type) { text-indent: 0; }
        article :global(h1 + p), article :global(h2 + p), article :global(h3 + p) { text-indent: 0; }
      `}</style>
    </article>
  );
}

export default function LivePreviewPanel({
  chapters, selectedChapter, onChapterSelect, onClose,
  typographyPreset = 'default', setTypographyPreset,
}: LivePreviewPanelProps) {
  const [device, setDevice] = useState<DeviceType>('kindle');
  const [theme, setTheme] = useState<ThemeType>('light');
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);

  const dims = deviceDimensions[device];

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-[#1e1e1e]">
      {/* Header */}
      <div className="flex-shrink-0 p-3 border-b border-gray-200 dark:border-[#2f2f2f]">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Live Preview</h3>
          {onClose && (
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-[#d4d4d4] hover:bg-gray-200 dark:hover:bg-[#2f2f2f] transition-colors"
              title="Close preview"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        {/* Device selector + EPUB Theme */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-1">
            {(Object.entries(deviceDimensions) as [DeviceType, typeof deviceDimensions.kindle][]).map(([key, val]) => (
              <button
                key={key}
                onClick={() => setDevice(key)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  device === key
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-black'
                    : 'bg-gray-200 dark:bg-[#2f2f2f] text-gray-600 dark:text-[#d4d4d4] hover:bg-gray-300 dark:hover:bg-[#3a3a3a]'
                }`}
              >
                {val.name}
              </button>
            ))}
          </div>
          {setTypographyPreset && (
            <div className="relative">
              <button
                onClick={() => setThemeDropdownOpen(v => !v)}
                className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-gray-200 dark:bg-[#2f2f2f] text-gray-600 dark:text-[#d4d4d4] hover:bg-gray-300 dark:hover:bg-[#3a3a3a] transition-colors whitespace-nowrap"
              >
                <span>{PRESET_DESCRIPTIONS[typographyPreset].name}</span>
                <svg className={`w-3 h-3 transition-transform duration-150 ${themeDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {themeDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setThemeDropdownOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#2f2f2f] rounded shadow-lg z-50 min-w-[110px] py-1">
                    {(Object.keys(PRESET_DESCRIPTIONS) as TypographyPreset[]).map((preset) => (
                      <button
                        key={preset}
                        onClick={() => { setTypographyPreset(preset); setThemeDropdownOpen(false); }}
                        className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                          typographyPreset === preset
                            ? 'font-medium text-[#050505] dark:text-white bg-gray-50 dark:bg-[#2a2a2a]'
                            : 'text-gray-600 dark:text-[#d4d4d4] hover:bg-gray-100 dark:hover:bg-[#2a2a2a]'
                        }`}
                      >
                        {PRESET_DESCRIPTIONS[preset].name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
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
              <EReaderContent chapter={chapters[selectedChapter]} theme={theme} typographyPreset={typographyPreset} />
            </div>
          </div>
        </div>
      </div>

      {/* Chapter nav */}
      {chapters.length > 1 && (
        <div className="flex-shrink-0 px-3 pb-2 border-t border-gray-200 dark:border-[#2f2f2f]">
          <div className="flex gap-1 overflow-x-auto py-2">
            {chapters.map((ch, i) => (
              <button
                key={ch.id}
                onClick={() => onChapterSelect?.(i)}
                className={`px-2 py-1 text-xs rounded-full whitespace-nowrap transition-colors ${
                  i === selectedChapter
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-black'
                    : 'bg-gray-200 dark:bg-[#262626] text-gray-600 dark:text-[#d4d4d4] hover:bg-gray-300 dark:hover:bg-[#2f2f2f]'
                }`}
              >
                {ch.title || `Ch ${i + 1}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Theme picker */}
      <div className="flex-shrink-0 p-3 border-t border-gray-200 dark:border-[#2f2f2f]">
        <div className="flex items-center justify-center gap-3">
          {(['light', 'sepia', 'dark'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`w-6 h-6 rounded-full border-2 transition-all ${
                theme === t
                  ? 'scale-110 border-gray-900 dark:border-white shadow-md'
                  : 'border-gray-300 dark:border-[#3a3a3a] hover:border-gray-500'
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
