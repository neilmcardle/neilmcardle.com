"use client";

import React, { useEffect, useRef, useState } from 'react';
import ePub, { Book, Rendition } from 'epubjs';

interface EPUBReaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  epubBlob: Blob | null;
  bookTitle?: string;
}

export default function EPUBReaderModal({ isOpen, onClose, epubBlob, bookTitle }: EPUBReaderModalProps) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<Book | null>(null);
  const renditionRef = useRef<Rendition | null>(null);

  const [currentLocation, setCurrentLocation] = useState('');
  const [canGoPrev, setCanGoPrev] = useState(false);
  const [canGoNext, setCanGoNext] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isOpen || !epubBlob || !viewerRef.current) return;

    setIsReady(false);
    let urlToRevoke: string | null = null;

    const initializeEpub = async () => {
      try {
        const arrayBuffer = await epubBlob.arrayBuffer();
        const book = ePub(arrayBuffer);
        bookRef.current = book;

        await book.ready;

        const rendition = book.renderTo(viewerRef.current!, {
          width: '100%',
          height: '100%',
          spread: 'none',
        });
        renditionRef.current = rendition;

        await rendition.display();
        setIsReady(true);

        // Track location changes
        rendition.on('relocated', (location: any) => {
          setCurrentLocation(location.start.cfi);
          setCanGoPrev(!location.atStart);
          setCanGoNext(!location.atEnd);
        });
      } catch (err) {
        console.error('Failed to initialize EPUB:', err);
        setIsReady(true); // Set ready to show error state
      }
    };

    initializeEpub();

    // Cleanup
    return () => {
      setIsReady(false);
      renditionRef.current?.destroy();
      bookRef.current?.destroy();
      if (urlToRevoke) {
        URL.revokeObjectURL(urlToRevoke);
      }
    };
  }, [isOpen, epubBlob]);

  const handlePrevPage = () => {
    if (!isReady || !renditionRef.current) return;
    renditionRef.current.prev();
  };

  const handleNextPage = () => {
    if (!isReady || !renditionRef.current) return;
    renditionRef.current.next();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || !isReady) return;
      if (e.key === 'ArrowLeft') handlePrevPage();
      if (e.key === 'ArrowRight') handleNextPage();
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isReady]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] bg-black/70 dark:bg-black/85 flex items-center justify-center">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-[#f0eee6]/95 dark:bg-[#0a0a0a]/90 backdrop-blur-sm border-b border-[#e4e4de] dark:border-[#333] flex items-center justify-between px-6 z-10">
        <h2 className="text-lg font-semibold text-[#141413] dark:text-white">
          {bookTitle || 'EPUB Preview'}
        </h2>
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-[#141413] dark:text-white hover:bg-[#e9e8e4] dark:hover:bg-white/10 rounded-lg transition-colors"
        >
          Close
        </button>
      </div>

      {/* EPUB Viewer */}
      <div className="w-full h-full pt-16 pb-20">
        <div
          ref={viewerRef}
          className="w-full h-full bg-[#faf9f5] dark:bg-white"
          style={{ maxWidth: '800px', margin: '0 auto' }}
        />
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-[#f0eee6]/95 dark:bg-[#0a0a0a]/90 backdrop-blur-sm border-t border-[#e4e4de] dark:border-[#333] flex items-center justify-center gap-4 z-10">
        <button
          onClick={handlePrevPage}
          disabled={!isReady || !canGoPrev}
          className="px-6 py-3 bg-[#141413] dark:bg-white text-[#faf9f5] dark:text-gray-900 rounded-lg font-medium hover:bg-[#141413]/80 dark:hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          ← Previous
        </button>
        <div className="text-sm text-[#141413]/60 dark:text-gray-400">
          {isReady ? 'Use arrow keys to navigate' : 'Loading...'}
        </div>
        <button
          onClick={handleNextPage}
          disabled={!isReady || !canGoNext}
          className="px-6 py-3 bg-[#141413] dark:bg-white text-[#faf9f5] dark:text-gray-900 rounded-lg font-medium hover:bg-[#141413]/80 dark:hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
