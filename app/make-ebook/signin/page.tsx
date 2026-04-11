"use client"

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { Loader2, Mail, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react'
import MarketingNav from '../components/MarketingNav'
import MarketingFooter from '../components/MarketingFooter'

// ── Shared shells ──────────────────────────────────────────────────────────
// Defined outside SignInContent so they keep stable component identity across
// re-renders. If these lived inside the parent component, every keystroke
// would rebuild the component tree and inputs would lose focus after each
// character typed.
function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex flex-col bg-me-cream dark:bg-me-cream-dark text-gray-700 dark:text-[#d4d4d4]">
      <MarketingNav />
      <main id="main-content" className="flex-1 flex flex-col px-6 sm:px-10 py-16 sm:py-20">
        <div className="my-auto mx-auto w-full flex justify-center">
          {children}
        </div>
      </main>
      <MarketingFooter showWordmark={false} />
    </div>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-md rounded-2xl border border-gray-200 dark:border-[#2f2f2f] bg-white dark:bg-[#1e1e1e] shadow-sm">
      {children}
    </div>
  )
}

function SignInContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawMode = searchParams.get('mode') ?? 'signup'
  const initialMode = (rawMode === 'signin' || rawMode === 'signup' || rawMode === 'reset')
    ? rawMode as 'signin' | 'signup' | 'reset'
    : 'signup'

  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showVerificationMessage, setShowVerificationMessage] = useState(false)
  const [showResetMessage, setShowResetMessage] = useState(false)
  const { signIn, signUp, resetPassword, authError, clearError } = useAuth()

  // Sync URL ?mode= changes into state. The page is already mounted when the
  // user clicks Sign in / Start writing in the nav, so a route change without a
  // remount would otherwise leave the form on the previous mode.
  useEffect(() => {
    if (rawMode === 'signin' || rawMode === 'signup' || rawMode === 'reset') {
      setMode(rawMode)
      clearError()
      setShowVerificationMessage(false)
      setShowResetMessage(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawMode])

  const handleModeSwitch = (newMode: 'signin' | 'signup' | 'reset') => {
    setMode(newMode)
    clearError()
    setShowVerificationMessage(false)
    setShowResetMessage(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === 'reset') {
      if (!email.trim()) return
    } else {
      if (!email.trim() || !password.trim()) return
    }
    setIsLoading(true)
    clearError()
    try {
      if (mode === 'signup') {
        const { error, needsVerification, userExists } = await signUp(email.trim(), password)
        if (userExists) {
          setMode('signin')
        } else if (!error) {
          if (needsVerification) {
            setShowVerificationMessage(true)
          } else {
            router.push('/make-ebook')
          }
        }
      } else if (mode === 'signin') {
        const { error } = await signIn(email.trim(), password)
        if (!error) router.push('/make-ebook')
      } else if (mode === 'reset') {
        const { error, resetSent } = await resetPassword(email.trim())
        if (!error && resetSent) setShowResetMessage(true)
      }
    } catch (err) {
      console.error('Auth error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // ── Verification / reset success state ───────────────────────────────────────
  if (showVerificationMessage || showResetMessage) {
    return (
      <PageShell>
        <Card>
          <div className="p-8 sm:p-10 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center mb-6 border border-green-100 dark:border-green-800">
              <Mail className="w-7 h-7 text-green-700 dark:text-green-400" />
            </div>
            <h1
              className="font-serif font-bold text-gray-900 dark:text-white text-balance"
              style={{
                fontSize: 'clamp(1.75rem, 1vw + 1.5rem, 2.25rem)',
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
              }}
            >
              {showVerificationMessage ? 'Check your email.' : 'Reset link sent.'}
            </h1>
            <p
              className="mt-4 text-gray-600 dark:text-[#a3a3a3] text-pretty"
              style={{ fontFamily: 'Georgia, serif', lineHeight: 1.55 }}
            >
              We&rsquo;ve sent {showVerificationMessage ? 'a verification link' : 'a password reset link'} to{' '}
              <span className="font-semibold text-gray-900 dark:text-white">{email}</span>.
            </p>

            <div className="mt-8 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-700 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-900 dark:text-green-200 text-left text-pretty">
                  {showVerificationMessage
                    ? 'Click the link in your email to finish setting up your account.'
                    : 'Click the link in your email to reset your password. The link expires in one hour.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                if (showResetMessage) {
                  setShowResetMessage(false)
                  setMode('signin')
                } else {
                  router.push('/make-ebook')
                }
              }}
              className="mt-8 w-full py-3.5 px-6 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
            >
              {showResetMessage ? 'Back to sign in' : 'Continue'}
            </button>
          </div>
        </Card>
      </PageShell>
    )
  }

  // ── Main form ────────────────────────────────────────────────────────────────
  const headline =
    mode === 'signin' ? 'Welcome back.'
    : mode === 'reset' ? 'Reset your password.'
    : 'Start writing.'

  const sub =
    mode === 'signin' ? 'Pick up exactly where you left off.'
    : mode === 'reset' ? 'Enter your email and we\u2019ll send a reset link.'
    : 'Free, in your browser. No credit card. No install.'

  const ctaLabel =
    mode === 'signin' ? 'Sign in'
    : mode === 'reset' ? 'Send reset link'
    : 'Create account'

  return (
    <PageShell>
      <Card>
        <div className="p-8 sm:p-10">
          {/* Header */}
          <div>
            <h1
              className="font-serif font-bold text-gray-900 dark:text-white text-balance"
              style={{
                fontSize: 'clamp(1.875rem, 1vw + 1.5rem, 2.5rem)',
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
              }}
            >
              {headline}
            </h1>
            <p
              className="mt-3 text-gray-600 dark:text-[#a3a3a3] text-pretty"
              style={{ fontFamily: 'Georgia, serif', lineHeight: 1.55 }}
            >
              {sub}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {authError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-900 dark:text-red-200 text-pretty">{authError}</p>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="signin-email" className="block text-sm font-medium text-gray-700 dark:text-[#d4d4d4] mb-2">
                Email
              </label>
              <input
                id="signin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                disabled={isLoading}
                style={{ fontSize: '16px' }}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-[#2f2f2f] bg-white dark:bg-[#262626] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[#737373] focus:outline-none focus:ring-2 focus:ring-gray-900/15 dark:focus:ring-white/20 focus:border-gray-900 dark:focus:border-[#555] transition-shadow disabled:opacity-50"
              />
            </div>

            {mode !== 'reset' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="signin-password" className="block text-sm font-medium text-gray-700 dark:text-[#d4d4d4]">
                    Password
                  </label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => handleModeSwitch('reset')}
                      disabled={isLoading}
                      className="text-sm text-gray-600 dark:text-[#a3a3a3] hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <input
                  id="signin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? 'Create a password' : 'Enter your password'}
                  required
                  minLength={6}
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  disabled={isLoading}
                  style={{ fontSize: '16px' }}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-[#2f2f2f] bg-white dark:bg-[#262626] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[#737373] focus:outline-none focus:ring-2 focus:ring-gray-900/15 dark:focus:ring-white/20 focus:border-gray-900 dark:focus:border-[#555] transition-shadow disabled:opacity-50"
                />
                {mode === 'signup' && (
                  <p className="mt-2 text-xs text-gray-500 dark:text-[#a3a3a3]">At least 6 characters.</p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="group w-full py-3.5 px-6 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {ctaLabel}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <div className="text-center pt-1">
              {mode === 'reset' ? (
                <p className="text-sm text-gray-600 dark:text-[#a3a3a3]">
                  Remember your password?{' '}
                  <button
                    type="button"
                    onClick={() => handleModeSwitch('signin')}
                    disabled={isLoading}
                    className="text-gray-900 dark:text-white hover:underline font-semibold"
                  >
                    Sign in
                  </button>
                </p>
              ) : (
                <p className="text-sm text-gray-600 dark:text-[#a3a3a3]">
                  {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
                  <button
                    type="button"
                    onClick={() => handleModeSwitch(mode === 'signin' ? 'signup' : 'signin')}
                    disabled={isLoading}
                    className="text-gray-900 dark:text-white hover:underline font-semibold"
                  >
                    {mode === 'signin' ? 'Sign up' : 'Sign in'}
                  </button>
                </p>
              )}
            </div>
          </form>

          {mode === 'signup' && (
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-[#2f2f2f]">
              <p className="text-xs text-center text-gray-500 dark:text-[#a3a3a3] text-pretty">
                By creating an account, you agree to our{' '}
                <a href="https://neilmcardle.com/terms" target="_blank" rel="noopener noreferrer" className="underline decoration-gray-300 hover:decoration-gray-700 hover:text-gray-700 dark:hover:text-gray-300">Terms</a>
                {' '}and{' '}
                <a href="https://neilmcardle.com/privacy" target="_blank" rel="noopener noreferrer" className="underline decoration-gray-300 hover:decoration-gray-700 hover:text-gray-700 dark:hover:text-gray-300">Privacy Policy</a>.
              </p>
            </div>
          )}
        </div>
      </Card>
    </PageShell>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-me-cream dark:bg-me-cream-dark flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    }>
      <SignInContent />
    </Suspense>
  )
}
