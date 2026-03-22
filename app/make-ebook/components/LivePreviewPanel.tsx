'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
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
type ViewMode = 'scroll' | 'page';

const deviceDimensions = {
  kindle: { width: 280, height: 390, name: 'Kindle' },
  ipad:   { width: 310, height: 420, name: 'iPad' },
  phone:  { width: 220, height: 390, name: 'Phone' },
};

const CONTENT_CLASSES = [
  '[&_p]:mb-3',
  '[&_h1]:text-xl [&_h1]:font-bold [&_h1]:mt-5 [&_h1]:mb-3 [&_h1]:leading-tight [&_h1]:[text-indent:0]',
  '[&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:leading-tight [&_h2]:[text-indent:0]',
  '[&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-2 [&_h3]:leading-tight [&_h3]:[text-indent:0]',
  '[&_h4]:text-sm [&_h4]:font-semibold [&_h4]:mt-3 [&_h4]:mb-1 [&_h4]:[text-indent:0]',
  '[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3',
  '[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3',
  '[&_li]:mb-1',
  '[&_blockquote]:border-l-2 [&_blockquote]:border-current [&_blockquote]:border-opacity-30 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:opacity-70 [&_blockquote]:mb-3',
  '[&_strong]:font-bold',
  '[&_em]:italic',
  '[&_a]:underline',
  '[&_hr]:my-4 [&_hr]:border-current [&_hr]:opacity-20',
  '[&_pre]:bg-black/10 [&_pre]:rounded [&_pre]:p-2 [&_pre]:mb-3 [&_pre]:text-xs [&_pre]:overflow-x-auto',
  '[&_code]:bg-black/10 [&_code]:rounded [&_code]:px-1 [&_code]:text-xs',
].join(' ');

function ArticleContent({
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
        className={CONTENT_CLASSES}
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
  const [viewMode, setViewMode] = useState<ViewMode>('scroll');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const measureRef = useRef<HTMLDivElement>(null);

  const dims = deviceDimensions[device];

  // Reset to first page when chapter, device, or view mode changes
  useEffect(() => { setCurrentPage(0); }, [selectedChapter, device, viewMode]);

  // Measure total pages via hidden div — runs whenever content or device size changes
  const measurePages = useCallback(() => {
    if (measureRef.current) {
      const pages = Math.max(1, Math.ceil(measureRef.current.scrollHeight / dims.height));
      setTotalPages(pages);
    }
  }, [dims.height]);

  useEffect(() => {
    if (viewMode !== 'page') return;
    const id = requestAnimationFrame(measurePages);
    return () => cancelAnimationFrame(id);
  }, [viewMode, selectedChapter, chapters, measurePages]);

  const bgColor = theme === 'light' ? '#ffffff' : theme === 'sepia' ? '#f4ecd8' : '#1a1a1a';
  const chapter = chapters[selectedChapter];

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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Controls row: device + view mode toggle + typography */}
        <div className="flex items-center justify-between gap-2">
          {/* Device selector */}
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

          <div className="flex items-center gap-1">
            {/* Scroll / Page toggle */}
            <div className="flex rounded overflow-hidden border border-gray-200 dark:border-[#2f2f2f]">
              <button
                onClick={() => setViewMode('scroll')}
                title="Continuous scroll"
                className={`px-2 py-1 text-xs transition-colors ${
                  viewMode === 'scroll'
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-black'
                    : 'bg-gray-100 dark:bg-[#262626] text-gray-500 dark:text-[#a3a3a3] hover:bg-gray-200 dark:hover:bg-[#2f2f2f]'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('page')}
                title="Page turn"
                className={`px-2 py-1 text-xs transition-colors border-l border-gray-200 dark:border-[#2f2f2f] ${
                  viewMode === 'page'
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-black'
                    : 'bg-gray-100 dark:bg-[#262626] text-gray-500 dark:text-[#a3a3a3] hover:bg-gray-200 dark:hover:bg-[#2f2f2f]'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </button>
            </div>

            {/* Typography preset */}
            {setTypographyPreset && (
              <div className="relative">
                <button
                  onClick={() => setThemeDropdownOpen(v => !v)}
                  className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-gray-200 dark:bg-[#2f2f2f] text-gray-600 dark:text-[#d4d4d4] hover:bg-gray-300 dark:hover:bg-[#3a3a3a] transition-colors whitespace-nowrap"
                >
                  <span>{PRESET_DESCRIPTIONS[typographyPreset].name}</span>
                  <svg className={`w-3 h-3 transition-transform duration-150 ${themeDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M19 9l-7 7-7-7" />
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
                              ? 'font-medium text-[#4070ff] bg-[#4070ff]/10 dark:bg-[#4070ff]/15'
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
      </div>

      {/* E-reader frame */}
      <div className="flex-1 flex flex-col items-center justify-center gap-3 p-4 overflow-hidden">
        <div
          className="relative bg-[#2a2a2a] p-2 shadow-2xl max-w-full"
          style={{ width: dims.width + 16, borderRadius: 20 }}
        >
          <div
            className="w-full rounded-lg overflow-hidden relative"
            style={{ width: dims.width, height: dims.height, backgroundColor: bgColor }}
          >
            {viewMode === 'scroll' ? (
              <div className="h-full overflow-y-auto">
                <ArticleContent chapter={chapter} theme={theme} typographyPreset={typographyPreset} />
              </div>
            ) : (
              <div style={{ width: dims.width, height: dims.height, overflow: 'hidden' }}>
                {/* Hidden div used only to measure total content height */}
                <div
                  ref={measureRef}
                  style={{ position: 'absolute', visibility: 'hidden', top: 0, left: 0, width: dims.width, pointerEvents: 'none' }}
                >
                  <ArticleContent chapter={chapter} theme={theme} typographyPreset={typographyPreset} />
                </div>

                {/* Horizontal track: N page windows side-by-side, slides left per page */}
                <div
                  style={{
                    display: 'flex',
                    width: totalPages * dims.width,
                    transform: `translateX(${-currentPage * dims.width}px)`,
                    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    willChange: 'transform',
                  }}
                >
                  {Array.from({ length: totalPages }, (_, i) => (
                    <div
                      key={i}
                      style={{ width: dims.width, height: dims.height, overflow: 'hidden', flexShrink: 0 }}
                    >
                      {/* Each window shows a different vertical slice of the same content */}
                      <div style={{ transform: `translateY(${-i * dims.height}px)` }}>
                        <ArticleContent chapter={chapter} theme={theme} typographyPreset={typographyPreset} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Page navigation — only shown in page mode */}
        {viewMode === 'page' && (
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-200 dark:bg-[#2f2f2f] text-gray-600 dark:text-[#d4d4d4] hover:bg-gray-300 dark:hover:bg-[#3a3a3a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-xs text-gray-400 dark:text-[#737373] tabular-nums">
              {currentPage + 1} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage >= totalPages - 1}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-200 dark:bg-[#2f2f2f] text-gray-600 dark:text-[#d4d4d4] hover:bg-gray-300 dark:hover:bg-[#3a3a3a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
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
