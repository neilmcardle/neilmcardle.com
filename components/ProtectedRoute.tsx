"use client"

import { useAuth } from '@/lib/hooks/useAuth'
import { AuthModal } from './AuthModal'
import { Button } from './ui/button'
import { Header } from './Header'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="pt-20 flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md mx-auto px-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Sign in to continue</h1>
            <p className="text-gray-600 mb-8">
              You need to be signed in to access the eBook maker tool.
            </p>
            <div className="space-y-4">
              <AuthModal 
                trigger={
                  <Button className="w-full bg-gray-900 hover:bg-gray-800">
                    Sign In
                  </Button>
                }
                mode="signin"
              />
              <AuthModal 
                trigger={
                  <Button variant="outline" className="w-full">
                    Create Account
                  </Button>
                }
                mode="signup"
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}