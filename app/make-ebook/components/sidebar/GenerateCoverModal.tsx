"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Modal, ModalHeader, ModalFooter } from "../Modal";
import {
  COVER_PALETTES,
  generateCoverDataUrl,
  type CoverPalette,
} from "../../utils/generateCover";
import studio from "../../styles/studio.module.css";

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
          <p className="mt-2 text-center text-xs text-[var(--clay-muted)] font-medium">
            {selected.name}
          </p>
        </div>

        <div className="flex-1">
          {(() => {
            const [house, ...classics] = COVER_PALETTES;
            const swatch = (palette: CoverPalette, featured = false) => {
              const active = palette.name === selected.name;
              return (
                <button
                  key={palette.name}
                  type="button"
                  onClick={() => setSelected(palette)}
                  aria-pressed={active}
                  aria-label={palette.name}
                  title={palette.name}
                  className={`relative aspect-[2/3] rounded-[3px] transition-transform overflow-hidden ${
                    featured ? "w-14 flex-shrink-0" : ""
                  } ${
                    active
                      ? "ring-2 ring-offset-2 ring-[var(--paper)] ring-offset-[var(--ink-panel)] scale-[1.03]"
                      : "hover:scale-[1.03]"
                  }`}
                  style={{ background: palette.bg }}
                >
                  <span
                    className="absolute left-1 top-0 bottom-0 w-px"
                    style={{ background: "rgba(0,0,0,0.18)" }}
                  />
                </button>
              );
            };
            return (
              <>
                <div className="flex items-center gap-4 mb-5">
                  {swatch(house, true)}
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-[var(--paper)]">
                      makeebook yellow
                    </p>
                    <p className="text-[11.5px] text-[var(--clay-muted)] mt-1">
                      The house cover. Black type on Finish Acid.
                    </p>
                  </div>
                </div>
                <div className="text-[11.5px] font-medium text-[var(--clay-muted)] mb-3">
                  Or a classic
                </div>
                <div className="grid grid-cols-6 sm:grid-cols-4 gap-2">
                  {classics.map((palette) => swatch(palette))}
                </div>
              </>
            );
          })()}

          {(!title || !author) && (
            <p className="mt-4 text-xs text-[var(--warning)]">
              {!title && !author
                ? "Add a title and author to the Book panel for a better cover."
                : !title
                  ? "Add a title to the Book panel for a better cover."
                  : "Add an author to the Book panel for a better cover."}
            </p>
          )}
        </div>
      </div>

      <ModalFooter>
        <button type="button" onClick={onClose} className={studio.quiet}>
          Cancel
        </button>
        <button type="button" onClick={handleAccept} className={studio.acid}>
          Use this cover
        </button>
      </ModalFooter>
    </Modal>
  );
}
