"use client"

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const LITERARY_QUOTES = [
  {
    text: "There is no greater agony than bearing an untold story inside you.",
    author: "Maya Angelou"
  },
  {
    text: "The scariest moment is always just before you start.",
    author: "Stephen King"
  },
  {
    text: "It is written: ‘Man shall not live on bread alone, but on every word that comes from the mouth of God.'",
    author: "Matthew quoting Jesus, quoting Moses, quoting God"
  },
  {
    text: "You can make anything by writing.",
    author: "C.S. Lewis"
  },
  {
    text: "Start writing, no matter what. The water does not flow until the faucet is turned on.",
    author: "Louis L'Amour"
  },
  {
    text: "If there's a book that you want to read, but it hasn't been written yet, then you must write it.",
    author: "Toni Morrison"
  },
  {
    text: "Write what should not be forgotten.",
    author: "Isabel Allende"
  },
  {
    text: "One day I will find the right words, and they will be simple.",
    author: "Jack Kerouac"
  },
  {
    text: "The first draft is just you telling yourself the story.",
    author: "Terry Pratchett"
  },
  {
    text: "Fill your paper with the breathings of your heart.",
    author: "William Wordsworth"
  },
  {
    text: "We write to taste life twice, in the moment and in retrospect.",
    author: "Anaïs Nin"
  },
  {
    text: "The role of a writer is not to say what we can all say, but what we are unable to say.",
    author: "Anaïs Nin"
  },
  {
    text: "I can shake off everything as I write; my sorrows disappear, my courage is reborn.",
    author: "Anne Frank"
  }
];

interface LandingPageProps {
  onNewBook: () => void;
  onOpenLibrary: () => void;
  libraryCount: number;
}

export default function LandingPage({ onNewBook, onOpenLibrary, libraryCount }: LandingPageProps) {
  const [quote, setQuote] = useState(LITERARY_QUOTES[0]);

  useEffect(() => {
    // Select a random quote on mount
    const randomIndex = Math.floor(Math.random() * LITERARY_QUOTES.length);
    setQuote(LITERARY_QUOTES[randomIndex]);
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 py-16 min-h-0">
      {/* Logo */}
      <div className="mb-12">
        <Image
          src="/make-ebook-logo.svg"
          alt="makeEbook"
          width={80}
          height={80}
          className="w-20 h-20 dark:invert opacity-40"
          priority
        />
      </div>

      {/* Quote */}
      <div className="max-w-3xl mb-16 text-center animate-in fade-in duration-1000">
        <p className="text-2xl md:text-3xl lg:text-4xl font-serif italic text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
          "{quote.text}"
        </p>
  <p className="text-lg md:text-xl text-gray-500 dark:text-gray-200 font-light">
          — {quote.author}
        </p>
      </div>

      {/* Tagline */}
  <h2 className="text-xl md:text-2xl text-gray-600 dark:text-gray-200 mb-12 font-light">
        What would you like to create today?
      </h2>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        {/* Start New Book Button */}
        <button
          type="button"
          onClick={onNewBook}
          className="px-8 py-3.5 text-sm font-semibold uppercase tracking-wide bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a] rounded-full hover:bg-[#2a2a2a] dark:hover:bg-gray-100 transition-all shadow-lg"
        >
          Start New Book
        </button>
        
        {/* Browse Library Button */}
        <button
          type="button"
          onClick={onOpenLibrary}
          className="px-8 py-3.5 text-sm font-semibold uppercase tracking-wide border-2 border-[#d1d5db] dark:border-[#525252] text-[#1a1a1a] dark:text-white rounded-full hover:border-[#9ca3af] dark:hover:border-[#737373] hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-all flex items-center justify-center gap-3"
        >
          Browse Library
          {libraryCount > 0 && (
            <span className="px-2.5 py-0.5 bg-[#e5e7eb] dark:bg-[#404040] text-[#374151] dark:text-[#d1d5db] rounded-full text-xs font-semibold">
              {libraryCount}
            </span>
          )}
        </button>
      </div>

      {/* Helper text */}
    </div>
  );
}
