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
        {/* Start New Book Button */}
        <div className="inline-flex items-center w-full" style={{background: 'linear-gradient(45deg, rgb(115, 63, 6) 0%, rgb(254, 243, 231) 50%, rgb(177, 145, 107) 100%)', borderRadius: '999px', padding: '2.5px'}}>
          <div className="flex-1 flex">
                <button
                  type="button"
                  onClick={onNewBook}
                  className="w-full text-white dark:text-white px-6 py-3 font-medium flex items-center justify-center gap-2 transition-all focus:outline-none uppercase custom-pill-btn"
                  style={{
                    borderRadius: '999px',
                    background: 'rgb(26, 26, 26)',
                    border: 'none',
                    boxShadow: 'rgba(0, 0, 0, 0.16) 0px 6px 8px 0px',
                    fontSize: '14px',
                    transition: 'background 0.2s',
                    width: '100%'
                  }}
                >
                  START NEW BOOK
                </button>
          </div>
        </div>
        {/* Browse Library Button - styled identically */}
        <div className="inline-flex items-center w-full" style={{background: 'linear-gradient(45deg, rgb(115, 63, 6) 0%, rgb(254, 243, 231) 50%, rgb(177, 145, 107) 100%)', borderRadius: '999px', padding: '2.5px'}}>
          <div className="flex-1 flex">
                <button
                  type="button"
                  onClick={onOpenLibrary}
                  className="w-full text-white dark:text-white px-6 py-3 font-medium flex items-center justify-center gap-2 transition-all focus:outline-none uppercase whitespace-nowrap custom-pill-btn"
                  style={{
                    borderRadius: '999px',
                    background: 'rgb(26, 26, 26)',
                    border: 'none',
                    boxShadow: 'rgba(0, 0, 0, 0.16) 0px 6px 8px 0px',
                    fontSize: '14px',
                    transition: 'background 0.2s',
                    width: '100%',
                    minWidth: '220px'
                  }}
                >
                  BROWSE LIBRARY
                  {libraryCount > 0 && (
                    <span style={{
                      marginLeft: '0.75rem',
                      padding: '0.125rem 0.75rem',
                      background: '#23272b',
                      color: '#fff',
                      borderRadius: '999px',
                      fontSize: '13px',
                      fontWeight: 600,
                      display: 'inline-block',
                      lineHeight: 1.2
                    }}>
                      {libraryCount}
                    </span>
                  )}
                </button>
          {/* Custom hover fill for pill buttons */}
          <style jsx global>{`
            .custom-pill-btn:hover {
              background: #353535 !important;
            }
            @media (prefers-color-scheme: dark) {
              .custom-pill-btn:hover {
                background: #444 !important;
              }
            }
          `}</style>
          </div>
        </div>
      </div>

      {/* Helper text */}
    </div>
  );
}
