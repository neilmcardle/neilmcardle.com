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
        console.log('EPUB blob size:', epubBlob.size, 'type:', epubBlob.type);

        // Convert blob to ArrayBuffer which epubjs handles better
        const arrayBuffer = await epubBlob.arrayBuffer();
        console.log('EPUB ArrayBuffer created, size:', arrayBuffer.byteLength);

        // Initialize ePub.js with ArrayBuffer
        const book = ePub(arrayBuffer);
        bookRef.current = book;

        // Wait for book to be ready
        await book.ready;
        console.log('EPUB book is ready');

        // Render the book
        const rendition = book.renderTo(viewerRef.current!, {
          width: '100%',
          height: '100%',
          spread: 'none',
        });
        renditionRef.current = rendition;

        // Display the first page
        await rendition.display();
        console.log('EPUB rendition displayed successfully');
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
    <div className="fixed inset-0 z-[10000] bg-black/90 flex items-center justify-center">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gray-900/80 backdrop-blur-sm border-b border-gray-700 flex items-center justify-between px-6 z-10">
        <h2 className="text-lg font-semibold text-white">
          {bookTitle || 'EPUB Preview'}
        </h2>
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          Close
        </button>
      </div>

      {/* EPUB Viewer */}
      <div className="w-full h-full pt-16 pb-20">
        <div
          ref={viewerRef}
          className="w-full h-full bg-white"
          style={{ maxWidth: '800px', margin: '0 auto' }}
        />
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gray-900/80 backdrop-blur-sm border-t border-gray-700 flex items-center justify-center gap-4 z-10">
        <button
          onClick={handlePrevPage}
          disabled={!isReady || !canGoPrev}
          className="px-6 py-3 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          ← Previous
        </button>
        <div className="text-sm text-gray-400">
          {isReady ? 'Use arrow keys to navigate' : 'Loading...'}
        </div>
        <button
          onClick={handleNextPage}
          disabled={!isReady || !canGoNext}
          className="px-6 py-3 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
