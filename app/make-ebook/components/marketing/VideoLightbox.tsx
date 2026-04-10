'use client';

import React, { useEffect, useState } from 'react';
import MuxPlayer from '@mux/mux-player-react';
import { X } from 'lucide-react';

type VideoLightboxProps = {
  open: boolean;
  onClose: () => void;
  /** Mux playback ID. Defaults to the makeEbook product demo. */
  playbackId?: string;
};

export default function VideoLightbox({
  open,
  onClose,
  playbackId = 'MsFzJTzHanW3aB7bGesbMq21aB13vj9I9nVV4Lrp4Bg',
}: VideoLightboxProps) {
  // Two-stage visibility so we can animate the backdrop and player in/out.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      // Schedule visibility flip on the next paint so the transition runs.
      const id = requestAnimationFrame(() =>
        requestAnimationFrame(() => setVisible(true))
      );
      return () => cancelAnimationFrame(id);
    } else {
      setVisible(false);
    }
  }, [open]);

  // Esc to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
      style={{
        backgroundColor: `rgba(0,0,0,${visible ? 0.85 : 0})`,
        backdropFilter: visible ? 'blur(8px)' : 'none',
        transition: 'background-color 0.3s ease, backdrop-filter 0.3s ease',
      }}
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors p-2"
        onClick={onClose}
        aria-label="Close video"
      >
        <X size={28} />
      </button>
      <div
        className="relative w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl border border-gray-200"
        style={{
          transform: visible ? 'scale(1)' : 'scale(0.92)',
          opacity: visible ? 1 : 0,
          transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease',
        }}
        onClick={e => e.stopPropagation()}
      >
        <MuxPlayer
          playbackId={playbackId}
          metadata={{ video_title: 'makeEbook Product Demo' }}
          style={{ aspectRatio: '16/9', width: '100%' }}
          accentColor="#ffffff"
          autoPlay
        />
      </div>
    </div>
  );
}
