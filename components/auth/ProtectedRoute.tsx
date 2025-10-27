"use client"

import { ReactNode, useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { AuthModal } from './AuthModal'
import { Button } from '../ui/button'
import { Lock, Edit3, BookOpen, Download, BookHeart, BookDown, BookText } from 'lucide-react'
import { MakeEbookIcon } from '@/components/MakeEbookIcon'
import Image from 'next/image'

interface ProtectedRouteProps {
  children: ReactNode
  fallback?: ReactNode
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)

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
    <div className="min-h-screen bg-white">
      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultMode="signup"
      />

      {/* Locked State Overlay */}
      <div className="relative">
        {/* Blurred background content */}
        <div className="blur-sm pointer-events-none">
          {children}
        </div>

        {/* Lock overlay */}
        <div className="absolute inset-0 bg-white/90 flex items-center justify-center">
          <div className="max-w-md mx-auto p-8 text-center">
            <div className="mb-6">
              <div className="flex justify-center mb-6">
                <Image
                  src="/make-ebook-logomark.svg"
                  alt="MakeEbook Logo"
                  width={160}
                  height={160}
                  className="object-contain"
                />
              </div>
              <div className="space-y-3 mb-6 text-left">
                <div className="flex items-center text-base text-gray-700">
                  <BookHeart className="w-5 h-5 mr-3 text-green-600" /> Craft your own eBook masterpiece...
                </div>
                <div className="flex items-center text-base text-gray-700">
                  <BookDown className="w-5 h-5 mr-3 text-blue-600" /> Author eBooks and export to eReader...
                </div>
                <div className="flex items-center text-base text-gray-700">
                  <BookText className="w-5 h-5 mr-3 text-purple-600" /> Start now, write your first eBook today!
                </div>
              </div>
            </div>

            <Button
              onClick={() => setShowAuthModal(true)}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white"
              size="lg"
            >
              Sign up for free
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}