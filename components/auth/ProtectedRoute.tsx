"use client"

import { ReactNode, useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { AuthModal } from './AuthModal'
import { Button } from '../ui/button'
import { Lock, Edit3, BookOpen, Download } from 'lucide-react'
import { MakeEbookIcon } from '@/components/MakeEbookIcon'

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
              <div className="flex justify-center mb-4">
                <MakeEbookIcon className="w-20 h-20 text-gray-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Start Creating eBooks
              </h2>
              <p className="text-gray-600 mb-6">
                Sign up for free to access the eBook creation tool and start building professional eBooks in minutes.
              </p>
            </div>

            {/* Features Preview */}
            <div className="space-y-3 mb-6 text-left">
              <div className="flex items-center text-sm text-gray-600">
                <Edit3 className="w-4 h-4 mr-3 text-gray-400" />
                Rich text editor with formatting
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <BookOpen className="w-4 h-4 mr-3 text-gray-400" />
                Chapter management & organization
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Download className="w-4 h-4 mr-3 text-gray-400" />
                Export as ePub format
              </div>
            </div>

            <Button
              onClick={() => setShowAuthModal(true)}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white"
              size="lg"
            >
              Get Started Free
            </Button>

            <p className="text-xs text-gray-500 mt-4">
              No credit card required
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}