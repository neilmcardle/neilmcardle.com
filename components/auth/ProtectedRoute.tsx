"use client"

import { ReactNode, useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { AuthModal } from './AuthModal'
import { Button } from '../ui/button'
import { Lock, Edit3, BookOpen, Download, BookHeart, BookDown, BookText } from 'lucide-react'
import { MakeEbookIcon } from '@/components/MakeEbookIcon'
import Image from 'next/image'
import { useTheme } from '@/lib/contexts/ThemeContext'

interface ProtectedRouteProps {
  children: ReactNode
  fallback?: ReactNode
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const { theme } = useTheme()

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
          <div className="relative h-32 px-6 pb-8 flex flex-col items-center justify-center bg-white dark:bg-[#1a1a1a] transition-colors">
            <div className="flex justify-center items-center w-full" style={{ paddingTop: '40px' }}>
              <Image
                src="/make-ebook-logomark.svg"
                alt="MakeEbook Logo"
                width={320}
                height={320}
                className="object-contain dark:invert"
                style={{ color: 'transparent' }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pt-4 pb-8">
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