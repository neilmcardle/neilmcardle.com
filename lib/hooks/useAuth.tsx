"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { User, AuthError } from '@supabase/supabase-js'
import { getSupabaseBrowserClient } from '../supabase'
import type { SupabaseClient } from '@supabase/supabase-js'

// Lazy-initialise the auth client to avoid hydration issues.
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
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null, needsVerification?: boolean, userExists?: boolean }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: AuthError | null, resetSent?: boolean }>
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

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)

        if (event === 'SIGNED_IN' && session?.user) {
          if (session.user.email_confirmed_at && typeof window !== 'undefined') {
            // Only redirect from explicit auth pages, never from the homepage.
            const currentPath = window.location.pathname
            const shouldRedirect = currentPath === '/make-ebook/explore' || 
                                 currentPath.includes('auth') || 
                                 currentPath.includes('login') ||
                                 currentPath.includes('signup')
            
            if (shouldRedirect && currentPath !== '/make-ebook') {
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

      // Duplicate signup: identities array is empty for already-registered emails.
      if (data.user?.identities?.length === 0) {
        const msg = 'An account with this email already exists.'
        setAuthError(msg)
        return { error: { name: 'UserExists', message: msg } as AuthError, userExists: true }
      }

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

    // Drop in-memory user state first so the UI reflects sign-out immediately
    // even if any later step fails.
    setUser(null)

    const supabase = ensureSupabase()

    if (supabase) {
      try {
        await supabase.auth.signOut({ scope: 'local' })
      } catch (error) {
        console.error('Sign out error (continuing with local cleanup):', error)
      }
    }

    if (typeof window !== 'undefined') {
      try {
        for (const key of Object.keys(localStorage)) {
          if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
            localStorage.removeItem(key)
          }
        }
      } catch {
        // Private-mode browsers may throw on localStorage access.
      }

      // Hard navigation guarantees a clean slate (state, caches, contexts).
      // replace() also keeps the signed-in route out of history.
      window.location.replace('/make-ebook')
    }
  }
  
  const resetPassword = async (email: string) => {
    setAuthError(null)
    const supabase = ensureSupabase()
    if (!supabase) {
      const error = { name: 'ClientError', message: 'Authentication service unavailable' } as AuthError
      setAuthError(error.message)
      return { error }
    }
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`
      })
      
      if (error) {
        setAuthError(error.message)
        return { error }
      }
      
      return { error: null, resetSent: true }
    } catch (err) {
      const error = { name: 'UnknownError', message: 'Password reset failed' } as AuthError
      setAuthError(error.message)
      return { error }
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
      resetPassword,
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