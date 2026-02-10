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
    text: "It is written: 'Man shall not live on bread alone, but on every word that comes from the mouth of God.'",
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
    const randomIndex = Math.floor(Math.random() * LITERARY_QUOTES.length);
    setQuote(LITERARY_QUOTES[randomIndex]);
  }, []);

  return (
    <div className="flex-1 relative overflow-hidden">
      {/* Background gradient — matches marketing hero */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-[#0a0a0a] to-gray-900" />

      <div className="relative flex flex-col items-center justify-center h-full px-4 sm:px-8 py-8 sm:py-16 min-h-0 overflow-y-auto">
        {/* Logo */}
        <div className="mb-8 sm:mb-12 flex-shrink-0">
          <Image
            src="/make-ebook-logo.svg"
            alt="makeEbook"
            width={96}
            height={96}
            className="w-16 h-16 sm:w-24 sm:h-24 invert opacity-80"
            priority
          />
        </div>

        {/* Quote */}
        <div className="max-w-3xl mb-8 sm:mb-16 text-center animate-in fade-in duration-1000 flex-shrink-0">
          <p className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-serif italic text-gray-300 leading-relaxed mb-4 sm:mb-6">
            &ldquo;{quote.text}&rdquo;
          </p>
          <p className="text-sm sm:text-lg md:text-xl text-gray-500 font-light">
            — {quote.author}
          </p>
        </div>

        {/* Tagline */}
        <h2 className="text-base sm:text-xl md:text-2xl text-gray-400 mb-8 sm:mb-12 font-light text-center flex-shrink-0">
          What would you like to create today?
        </h2>

        {/* Action Buttons — matches marketing hero CTA style */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4 sm:mb-8 w-full sm:w-auto px-4 sm:px-0 flex-shrink-0">
          <button
            type="button"
            onClick={onNewBook}
            className="w-full sm:w-auto px-8 py-4 text-lg font-semibold bg-white text-gray-900 rounded-full hover:bg-gray-100 transition-all"
          >
            Start New Book
          </button>

          <button
            type="button"
            onClick={onOpenLibrary}
            className="w-full sm:w-auto px-8 py-4 text-lg font-semibold border-2 border-gray-700 text-white rounded-full hover:border-gray-600 transition-colors flex items-center justify-center gap-3"
          >
            Browse Library
            {libraryCount > 0 && (
              <span className="px-2.5 py-0.5 bg-gray-700 text-gray-300 rounded-full text-xs font-semibold">
                {libraryCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
