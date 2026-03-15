'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Chapter } from '../types';
import { TypographyPreset, PRESET_DESCRIPTIONS, TYPOGRAPHY_PRESETS } from '../utils/typographyPresets';

interface SplitPreviewLayoutProps {
  children: React.ReactNode;
  chapters: Chapter[];
  selectedChapter: number;
  isPreviewEnabled: boolean;
  onTogglePreviewAction: () => void;
  onChapterSelectAction?: (index: number) => void;
  typographyPreset?: TypographyPreset;
  setTypographyPreset?: (p: TypographyPreset) => void;
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
  typographyPreset = 'default',
  setTypographyPreset,
}: SplitPreviewLayoutProps) {
  const [previewDevice, setPreviewDevice] = useState<DeviceType>('kindle');
  const [previewTheme, setPreviewTheme] = useState<ThemeType>('light');
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);

  // ── Resizable width ──────────────────────────────────────────────
  const [panelWidth, setPanelWidth] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('me-right-panel-width');
      return saved ? Math.min(Math.max(parseInt(saved, 10), 280), 600) : 420;
    }
    return 420;
  });
  const panelRef   = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);
  const startX     = useRef(0);
  const startWidth = useRef(420);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    startX.current     = e.clientX;
    startWidth.current = panelWidth;
    if (panelRef.current) panelRef.current.style.transition = 'none';
    document.body.style.cursor     = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      // dragging left increases width (panel is on the right)
      const next = Math.min(Math.max(startWidth.current - (e.clientX - startX.current), 280), 600);
      if (panelRef.current) panelRef.current.style.width = `${next}px`;
    };
    const onUp = () => {
      if (!isResizing.current) return;
      isResizing.current = false;
      document.body.style.cursor = document.body.style.userSelect = '';
      if (panelRef.current) {
        panelRef.current.style.transition = '';
        const final = Math.min(Math.max(Math.round(parseFloat(panelRef.current.style.width) || startWidth.current), 280), 600);
        setPanelWidth(final);
        try { localStorage.setItem('me-right-panel-width', String(final)); } catch {}
      }
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup',   onUp);
    return () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
  }, []);
  // ────────────────────────────────────────────────────────────────

  const device = deviceDimensions[previewDevice];

  return (
    <div className="flex h-full w-full">
      {/* Editor Panel */}
      <div className="flex-1 min-w-0 flex flex-col transition-all duration-300">
        {children}
      </div>

      {/* Preview Panel - Slides in from right, full height, flush right */}
      <div
        ref={panelRef}
        data-tour="preview"
        className={`hidden lg:block transition-all duration-300 ease-in-out overflow-hidden relative ${
          isPreviewEnabled ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{ width: isPreviewEnabled ? panelWidth : 0 }}
      >
        <div className="h-full flex flex-col bg-gray-50 dark:bg-[#1e1e1e] border-l border-gray-200 dark:border-[#2f2f2f] relative">

          {/* Resize handle — left edge of right panel */}
          <div
            className="absolute left-0 top-0 h-full w-1 cursor-col-resize z-50 hidden lg:block hover:bg-gray-300 dark:hover:bg-[#3a3a3a] transition-colors"
            onMouseDown={handleResizeStart}
          />

          {/* Preview Header */}
          <div className="flex-shrink-0 p-3 border-b border-gray-200 dark:border-[#2f2f2f]">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-[#141413] dark:text-white">
                Live Preview
              </h3>
              <button
                onClick={onTogglePreviewAction}
                className="p-1.5 hover:bg-gray-200 dark:hover:bg-[#2f2f2f] rounded transition-colors"
                aria-label="Close preview"
              >
                <svg className="w-4 h-4 text-[#141413]/50 dark:text-[#a3a3a3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Device Selector + EPUB Theme */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex gap-1">
                {(Object.entries(deviceDimensions) as [DeviceType, typeof deviceDimensions.kindle][]).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => setPreviewDevice(key)}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      previewDevice === key
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

          {/* E-Reader Frame */}
          <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
            <div
              className="relative bg-[#2a2a2a] p-2 shadow-2xl max-w-full"
              style={{
                width: device.width + 16,
                borderRadius: 24,
              }}
            >
              {/* Screen */}
              <div
                className="w-full rounded-lg overflow-hidden transition-colors"
                style={{
                  width: device.width,
                  height: device.height,
                  maxWidth: '100%',
                  backgroundColor: previewTheme === 'light' ? '#ffffff' :
                                   previewTheme === 'sepia' ? '#f4ecd8' :
                                   '#1a1a1a',
                }}
              >
                {/* Chapter content preview */}
                <div className="h-full overflow-y-auto">
                  <EReaderContent
                    chapter={chapters[selectedChapter]}
                    theme={previewTheme}
                    typographyPreset={typographyPreset}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Chapter Navigation */}
          {chapters.length > 1 && (
            <div className="flex-shrink-0 px-3 pb-2 border-t border-gray-200 dark:border-[#2f2f2f]">
              <div className="flex gap-1 overflow-x-auto py-2 scrollbar-thin">
                {chapters.map((ch, i) => (
                  <button
                    key={ch.id}
                    onClick={() => onChapterSelectAction?.(i)}
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

          {/* Theme Controls */}
          <div className="flex-shrink-0 p-3 border-t border-gray-200 dark:border-[#2f2f2f]">
            <div className="flex items-center justify-center gap-3">
              {(['light', 'sepia', 'dark'] as const).map((theme) => (
                <button
                  key={theme}
                  onClick={() => setPreviewTheme(theme)}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${
                    previewTheme === theme
                      ? 'scale-110 border-[#141413] dark:border-white shadow-md'
                      : 'border-[#dedddd] dark:border-[#3a3a3a] hover:border-[#141413]/40'
                  }`}
                  style={{
                    backgroundColor: theme === 'light' ? '#ffffff' :
                                     theme === 'sepia' ? '#f4ecd8' :
                                     '#1a1a1a',
                  }}
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
        fontSize: '14px',
        textAlign: preset.textAlign as 'left' | 'justify',
      }}
    >
      {chapter.title && (
        <h1
          className="text-lg font-bold mb-4"
          style={{ color: textColor, textAlign: (preset.chapterTitleAlign || 'center') as 'left' | 'center' }}
        >
          {chapter.title}
        </h1>
      )}
      <div
        dangerouslySetInnerHTML={{ __html: chapter.content || '<p style="color: #999; font-style: italic;">No content yet...</p>' }}
        className="[&_p]:mb-3 [&_a]:no-underline"
        style={{ textIndent: preset.textIndent }}
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
