"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { User, AuthError } from '@supabase/supabase-js'
import { getSupabaseBrowserClient } from '../supabase'
import type { SupabaseClient } from '@supabase/supabase-js'

// Lazy initialize Supabase client to prevent hydration issues
function ensureSupabase(): SupabaseClient | null {
  if (typeof window === 'undefined') {
    return null
  }
  
  try {
    return getSupabaseBrowserClient() || null
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error)
    return null
  }
}

interface AuthContextType {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null, needsVerification?: boolean }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  clearError: () => void
  authError: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = ensureSupabase()
    if (!supabase) {
      setLoading(false)
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)

        // Handle user authentication events
        if (event === 'SIGNED_IN' && session?.user) {
          // User creation is now handled securely server-side in auth callback
          // If user has verified their email, redirect to make-ebook
          if (session.user.email_confirmed_at && typeof window !== 'undefined') {
            // Redirect to tool unless already on the main tool page
            if (window.location.pathname !== '/make-ebook') {
              window.location.href = '/make-ebook'
            }
          }
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string) => {
    setAuthError(null)
    const supabase = ensureSupabase()
    if (!supabase) {
      const error = { name: 'ClientError', message: 'Authentication service unavailable' } as AuthError
      setAuthError(error.message)
      return { error }
    }
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) {
        setAuthError(error.message)
        return { error }
      }
      
      // Check if user needs email verification
      const needsVerification = data.user && !data.user.email_confirmed_at ? true : undefined
      return { error: null, needsVerification }
    } catch (err) {
      const error = { name: 'UnknownError', message: 'Sign-up failed' } as AuthError
      setAuthError(error.message)
      return { error }
    }
  }

  const signIn = async (email: string, password: string) => {
    setAuthError(null)
    const supabase = ensureSupabase()
    if (!supabase) {
      const error = { name: 'ClientError', message: 'Authentication service unavailable' } as AuthError
      setAuthError(error.message)
      return { error }
    }
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        setAuthError(error.message)
      }
      
      return { error }
    } catch (err) {
      const error = { name: 'UnknownError', message: 'Sign-in failed' } as AuthError
      setAuthError(error.message)
      return { error }
    }
  }

  const signOut = async () => {
    setAuthError(null)
    const supabase = ensureSupabase()
    if (!supabase) {
      console.log('Authentication service not available for sign out')
      return
    }
    
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Sign out error:', error)
      setAuthError('Failed to sign out')
    }
  }
  
  const clearError = () => {
    setAuthError(null)
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: !!user,
      signUp,
      signIn,
      signOut,
      clearError,
      authError,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}