'use client';

// Modal launched from the Book panel's "Generate cover" button. Lets the
// user pick one of the 12 marketing palettes and see a live preview before
// committing. On "Use this cover", renders the final PNG and hands it back
// via setCoverFile so it slots into the same coverUrl state the upload
// input writes to — no extra parent wiring needed for storage.

import React, { useEffect, useMemo, useState } from 'react';
import { COVER_PALETTES, generateCoverDataUrl, type CoverPalette } from '../../utils/generateCover';

interface GenerateCoverModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  author: string;
  genre?: string;
  onAccept: (dataUrl: string) => void;
}

export default function GenerateCoverModal({
  open,
  onClose,
  title,
  author,
  genre,
  onAccept,
}: GenerateCoverModalProps) {
  const [selected, setSelected] = useState<CoverPalette>(COVER_PALETTES[0]);

  // Recompute preview whenever metadata or palette changes. Preview is a
  // lower-res render of the same generator so what the user sees is
  // exactly what they'll get.
  const preview = useMemo(() => {
    if (!open) return '';
    try {
      return generateCoverDataUrl({
        title: title || 'Untitled',
        author: author || 'Author',
        genre,
        palette: selected,
        width: 400,
        height: 600,
      });
    } catch (err) {
      console.error('Cover preview failed:', err);
      return '';
    }
  }, [open, title, author, genre, selected]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleAccept = () => {
    const dataUrl = generateCoverDataUrl({
      title: title || 'Untitled',
      author: author || 'Author',
      genre,
      palette: selected,
    });
    onAccept(dataUrl);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Generate cover"
    >
      <div
        className="relative bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-[#2f2f2f]">
          <div>
            <h2 className="text-base font-semibold text-[#050505] dark:text-white">Generate cover</h2>
            <p className="text-xs text-gray-500 dark:text-[#a3a3a3] mt-0.5">
              Uses your title, author, and genre. Pick a colour.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-[#2a2a2a] text-gray-500 dark:text-[#a3a3a3]"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col sm:flex-row gap-6">
          {/* Preview */}
          <div className="flex-shrink-0 w-48 mx-auto sm:mx-0">
            <div
              className="w-full aspect-[2/3] rounded overflow-hidden shadow-lg"
              style={{ background: selected.bg }}
            >
              {preview && <img src={preview} alt="Cover preview" className="w-full h-full object-cover" />}
            </div>
            <p className="mt-2 text-center text-xs text-gray-500 dark:text-[#a3a3a3] font-medium">
              {selected.name}
            </p>
          </div>

          {/* Palette grid */}
          <div className="flex-1">
            <div className="text-xs font-medium text-gray-700 dark:text-[#a3a3a3] mb-3">Colour</div>
            <div className="grid grid-cols-6 sm:grid-cols-4 gap-2">
              {COVER_PALETTES.map((palette) => {
                const active = palette.name === selected.name;
                return (
                  <button
                    key={palette.name}
                    type="button"
                    onClick={() => setSelected(palette)}
                    className={`relative aspect-[2/3] rounded transition-all overflow-hidden ${
                      active
                        ? 'ring-2 ring-offset-2 ring-[#141413] dark:ring-white dark:ring-offset-[#1e1e1e] scale-[1.03]'
                        : 'hover:scale-[1.02]'
                    }`}
                    style={{ background: palette.bg }}
                    aria-label={palette.name}
                    title={palette.name}
                  >
                    <span
                      className="absolute left-1 top-0 bottom-0 w-px"
                      style={{ background: 'rgba(0,0,0,0.18)' }}
                    />
                  </button>
                );
              })}
            </div>

            {(!title || !author) && (
              <p className="mt-4 text-xs text-amber-700 dark:text-amber-400">
                {!title && !author
                  ? 'Add a title and author to the Book panel for a better cover.'
                  : !title
                  ? 'Add a title to the Book panel for a better cover.'
                  : 'Add an author to the Book panel for a better cover.'}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-200 dark:border-[#2f2f2f] bg-gray-50 dark:bg-[#171717]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-[#d4d4d4] hover:text-[#050505] dark:hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAccept}
            className="px-5 py-2 text-sm font-semibold bg-[#141413] text-[#faf9f5] hover:bg-[#2a2a28] rounded-full transition-colors"
          >
            Use this cover
          </button>
        </div>
      </div>
    </div>
  );
}
