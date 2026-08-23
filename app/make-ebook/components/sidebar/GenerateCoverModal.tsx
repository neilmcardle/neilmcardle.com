"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Modal, ModalHeader, ModalFooter } from "../Modal";
import {
  COVER_PALETTES,
  generateCoverDataUrl,
  type CoverPalette,
} from "../../utils/generateCover";

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

  const preview = useMemo(() => {
    if (!open) return "";
    try {
      return generateCoverDataUrl({
        title: title || "Untitled",
        author: author || "Author",
        genre,
        palette: selected,
        width: 400,
        height: 600,
      });
    } catch (err) {
      console.error("Cover preview failed:", err);
      return "";
    }
  }, [open, title, author, genre, selected]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleAccept = () => {
    const dataUrl = generateCoverDataUrl({
      title: title || "Untitled",
      author: author || "Author",
      genre,
      palette: selected,
    });
    onAccept(dataUrl);
    onClose();
  };

  return (
    <Modal
      open
      onClose={onClose}
      width="lg"
      zIndex={10020}
      label="Generate cover"
    >
      <ModalHeader
        title="Generate cover"
        subtitle="Uses your title, author, and genre. Pick a colour."
        onClose={onClose}
      />

      <div className="flex-1 min-h-0 overflow-y-auto p-6 flex flex-col sm:flex-row gap-6">
        <div className="flex-shrink-0 w-48 mx-auto sm:mx-0">
          <div
            className="w-full aspect-[2/3] rounded overflow-hidden shadow-lg"
            style={{ background: selected.bg }}
          >
            {preview && (
              <img
                src={preview}
                alt="Cover preview"
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <p className="mt-2 text-center text-xs text-gray-500 dark:text-[#a3a3a3] font-medium">
            {selected.name}
          </p>
        </div>

        <div className="flex-1">
          <div className="text-xs font-medium text-gray-700 dark:text-[#a3a3a3] mb-3">
            Colour
          </div>
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
                      ? "ring-2 ring-offset-2 ring-[#141413] dark:ring-white dark:ring-offset-[#1e1e1e] scale-[1.03]"
                      : "hover:scale-[1.02]"
                  }`}
                  style={{ background: palette.bg }}
                  aria-label={palette.name}
                  title={palette.name}
                >
                  <span
                    className="absolute left-1 top-0 bottom-0 w-px"
                    style={{ background: "rgba(0,0,0,0.18)" }}
                  />
                </button>
              );
            })}
          </div>

          {(!title || !author) && (
            <p className="mt-4 text-xs text-amber-700 dark:text-amber-400">
              {!title && !author
                ? "Add a title and author to the Book panel for a better cover."
                : !title
                  ? "Add a title to the Book panel for a better cover."
                  : "Add an author to the Book panel for a better cover."}
            </p>
          )}
        </div>
      </div>

      <ModalFooter className="bg-gray-50 dark:bg-white/[0.02]">
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
      </ModalFooter>
    </Modal>
  );
}
