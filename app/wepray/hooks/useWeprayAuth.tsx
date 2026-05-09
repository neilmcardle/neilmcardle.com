'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { User, AuthError, SupabaseClient } from '@supabase/supabase-js'
import { getWeprayBrowserClient } from '@/lib/wepray/supabase'

function ensureClient(): SupabaseClient | null {
  if (typeof window === 'undefined') return null
  try {
    return getWeprayBrowserClient()
  } catch (err) {
    console.error('WePray Supabase init failed:', err)
    return null
  }
}

interface WeprayAuthContext {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null; needsVerification?: boolean }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  authError: string | null
  clearError: () => void
}

const Ctx = createContext<WeprayAuthContext | undefined>(undefined)

export function WeprayAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = ensureClient()
    if (!supabase) { setLoading(false); return }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = useCallback(async (email: string, password: string) => {
    setAuthError(null)
    const supabase = ensureClient()
    if (!supabase) {
      const error = { name: 'ClientError', message: 'Auth unavailable' } as AuthError
      setAuthError(error.message); return { error }
    }
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: `${window.location.origin}/wepray/auth/callback` },
    })
    if (error) { setAuthError(error.message); return { error } }
    if (data.user?.identities?.length === 0) {
      const msg = 'An account with this email already exists.'
      setAuthError(msg)
      return { error: { name: 'UserExists', message: msg } as AuthError }
    }
    return { error: null, needsVerification: !data.user?.email_confirmed_at }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    setAuthError(null)
    const supabase = ensureClient()
    if (!supabase) {
      const error = { name: 'ClientError', message: 'Auth unavailable' } as AuthError
      setAuthError(error.message); return { error }
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setAuthError(error.message)
    return { error }
  }, [])

  const signOut = useCallback(async () => {
    setUser(null)
    const supabase = ensureClient()
    if (supabase) {
      try { await supabase.auth.signOut({ scope: 'local' }) }
      catch (err) { console.error('signOut error (continuing):', err) }
    }
    if (typeof window !== 'undefined') {
      try {
        for (const k of Object.keys(localStorage)) {
          if (k.startsWith('sb-') && k.endsWith('-auth-token')) localStorage.removeItem(k)
        }
      } catch {}
      window.location.replace('/wepray')
    }
  }, [])

  return (
    <Ctx.Provider value={{ user, loading, signUp, signIn, signOut, authError, clearError: () => setAuthError(null) }}>
      {children}
    </Ctx.Provider>
  )
}

export function useWeprayAuth() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useWeprayAuth must be used inside WeprayAuthProvider')
  return ctx
}
