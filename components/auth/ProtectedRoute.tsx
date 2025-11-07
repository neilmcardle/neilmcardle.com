"use client"

import { ReactNode, useState, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { AuthModal } from './AuthModal'
import { Button } from '../ui/button'
import { Lock, Edit3, BookOpen, Download, BookHeart, BookDown, BookText } from 'lucide-react'
import { MakeEbookIcon } from '@/components/MakeEbookIcon'
import Image from 'next/image'
import { useTheme } from '@/lib/contexts/ThemeContext'

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
    text: "I can shake off everything as I write; my sorrows disappear, my courage is reborn.",
    author: "Anne Frank"
  },
  {
    text: "We write to taste life twice, in the moment and in retrospect.",
    author: "Anaïs Nin"
  },
  {
    text: "A word after a word after a word is power.",
    author: "Margaret Atwood"
  }
];

interface ProtectedRouteProps {
  children: ReactNode
  fallback?: ReactNode
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const { theme } = useTheme()
  const [quote, setQuote] = useState(LITERARY_QUOTES[0])

  useEffect(() => {
    // Select a random quote on mount
    const randomIndex = Math.floor(Math.random() * LITERARY_QUOTES.length)
    setQuote(LITERARY_QUOTES[randomIndex])
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse">
            <MakeEbookIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return <>{children}</>
  }

  // Show custom fallback if provided
  if (fallback) {
    return <>{fallback}</>
  }

  // Default locked state with sign-up prompt
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] relative transition-colors">
      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultMode="signup"
      />

      {/* Locked State - Card Layout */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl overflow-hidden max-w-md w-full z-10 transition-colors relative">
          
          {/* MakeEbook Logo Section */}
          <div className="relative px-6 pt-10 pb-6 flex flex-col items-center justify-center bg-white dark:bg-[#1a1a1a] transition-colors">
            <div className="flex justify-center items-center w-full mb-6">
              <Image
                src="/make-ebook-logomark.svg"
                alt="MakeEbook Logo"
                width={240}
                height={240}
                className="object-contain dark:invert opacity-90"
                style={{ color: 'transparent' }}
              />
            </div>
            
            {/* Literary Quote */}
            <div className="text-center mb-6 px-4 animate-in fade-in duration-1000">
              <p className="text-lg md:text-xl font-serif italic text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                "{quote.text}"
              </p>
              <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 font-light">
                — {quote.author}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pt-2 pb-8">
            {/* Features List */}
            <div className="space-y-3 mb-8">
              <div className="flex items-center justify-center text-base text-gray-700 dark:text-gray-300">
                <BookHeart className="w-5 h-5 mr-3" style={{ color: '#B1916B' }} /> Craft your own eBook masterpiece...
              </div>
              <div className="flex items-center justify-center text-base text-gray-700 dark:text-gray-300">
                <BookDown className="w-5 h-5 mr-3" style={{ color: '#B1916B' }} /> Author eBooks and export to eReader...
              </div>
              <div className="flex items-center justify-center text-base text-gray-700 dark:text-gray-300">
                <BookText className="w-5 h-5 mr-3" style={{ color: '#B1916B' }} /> Start now, write your first eBook today!
              </div>
            </div>

            {/* Sign Up Button - Unlock Pro Style with Dark Mode */}
            <div className="flex justify-center">
              <div
                style={{
                  borderRadius: '999px',
                  padding: '2.5px',
                  background: 'linear-gradient(45deg, #733F06 0%, #FEF3E7 50%, #B1916B 100%)',
                  display: 'inline-block',
                  width: '100%',
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowAuthModal(true)}
                  className="text-gray-900 dark:text-white px-6 py-3 font-medium inline-flex items-center justify-center gap-2 transition-all focus:outline-none w-full"
                  style={{
                    borderRadius: '999px',
                    background: theme === 'dark' ? '#1a1a1a' : '#fff',
                    border: 'none',
                    boxShadow: '0 6px 8px 0 rgba(0,0,0,0.16)',
                    transition: 'background 0.2s',
                    display: 'inline-block',
                    fontSize: '14px',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = theme === 'dark' ? '#2a2a2a' : 'linear-gradient(225deg, #733F06 0%, #FEF3E7 50%, #B1916B 100%)'}
                  onMouseLeave={e => e.currentTarget.style.background = theme === 'dark' ? '#1a1a1a' : '#fff'}
                >
                  SIGN UP FOR FREE
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}