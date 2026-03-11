"use client"

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

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
    <div className="flex-1 bg-white dark:bg-[#1e1e1e] overflow-hidden">
      <div className="flex flex-col items-center justify-center h-full px-6 sm:px-8 py-8 sm:py-16 min-h-0 overflow-y-auto">
        {/* Logo */}
        <div className="mb-8 sm:mb-12 flex-shrink-0">
          <Image
            src="/make-ebook-logo.svg"
            alt="makeEbook"
            width={96}
            height={96}
            className="w-16 h-16 sm:w-24 sm:h-24 dark:invert opacity-80"
            priority
          />
        </div>

        {/* Quote */}
        <div className="max-w-3xl mb-8 sm:mb-16 text-center animate-in fade-in duration-1000 flex-shrink-0">
          <p className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-serif italic text-[#444] dark:text-[#d4d4d4] leading-relaxed mb-4 sm:mb-6">
            &ldquo;{quote.text}&rdquo;
          </p>
          <p className="text-sm sm:text-lg md:text-xl text-[#999] dark:text-[#737373] font-light">
            — {quote.author}
          </p>
        </div>

        {/* Tagline */}
        <h2 className="text-base sm:text-xl md:text-2xl text-[#888] dark:text-[#a3a3a3] mb-8 sm:mb-12 font-light text-center flex-shrink-0">
          What would you like to create today?
        </h2>

        {/* Action Buttons */}
        <div className="flex items-center justify-center mb-4 sm:mb-8 w-full sm:w-auto px-4 sm:px-0 flex-shrink-0">
          {libraryCount === 0 ? (
            <button
              type="button"
              onClick={onNewBook}
              className="group w-full sm:w-auto px-8 py-4 text-lg font-semibold bg-[#111] dark:bg-white text-white dark:text-[#111] rounded-full hover:bg-[#333] dark:hover:bg-[#e5e5e5] transition-colors flex items-center justify-center gap-2"
            >
              Start New Book
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenLibrary}
              className="group w-full sm:w-auto px-8 py-4 text-lg font-semibold bg-[#111] dark:bg-white text-white dark:text-[#111] rounded-full hover:bg-[#333] dark:hover:bg-[#e5e5e5] transition-colors flex items-center justify-center gap-3"
            >
              Browse Library
              <span className="px-2.5 py-0.5 bg-[#333] dark:bg-[#262626] text-[#e5e5e5] dark:text-[#d4d4d4] rounded-full text-xs font-semibold">
                {libraryCount}
              </span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
