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
    text: "You don't start out writing good stuff. You start out writing crap and thinking it's good stuff, and then gradually you get better at it.",
    author: "Octavia Butler"
  },
  {
    text: "Fill your paper with the breathings of your heart.",
    author: "William Wordsworth"
  },
  {
    text: "There is nothing to writing. All you do is sit down at a typewriter and bleed.",
    author: "Ernest Hemingway"
  },
  {
    text: "We write to taste life twice, in the moment and in retrospect.",
    author: "Anaïs Nin"
  },
  {
    text: "A word after a word after a word is power.",
    author: "Margaret Atwood"
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
        <button
          onClick={onNewBook}
          className="px-8 py-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
        >
          Start New Book
        </button>
        <button
          onClick={onOpenLibrary}
          className="px-8 py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700"
        >
          Browse Library
          {libraryCount > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-full text-sm">
              {libraryCount}
            </span>
          )}
        </button>
      </div>

      {/* Helper text */}
  <p className="text-sm text-gray-200 dark:text-gray-200 mt-8">
        Click an icon on the left to get started
      </p>
    </div>
  );
}
