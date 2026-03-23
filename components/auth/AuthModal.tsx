"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { Loader2, Mail, CheckCircle, AlertCircle, X, ArrowRight } from 'lucide-react'
import Image from 'next/image'

// Dialog-based modal: uses browser top-layer via showModal() — bypasses all
// CSS stacking / z-index / position:fixed coordinate issues on iOS Safari.
const dialogStyles = `
  dialog[data-auth-modal] {
    border: none;
    background: transparent;
    padding: 0;
  }
  dialog[data-auth-modal][open] {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    max-width: 100%;
    max-height: 100%;
    margin: 0;
    padding: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    overflow-y: auto;
  }
  dialog[data-auth-modal]::backdrop {
    background: rgba(0, 0, 0, 0.6);
  }
  dialog[data-auth-modal] input:-webkit-autofill,
  dialog[data-auth-modal] input:-webkit-autofill:hover,
  dialog[data-auth-modal] input:-webkit-autofill:focus,
  dialog[data-auth-modal] input:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 30px white inset !important;
    -webkit-text-fill-color: #111 !important;
    caret-color: #111 !important;
  }
  .dark dialog[data-auth-modal] input:-webkit-autofill,
  .dark dialog[data-auth-modal] input:-webkit-autofill:hover,
  .dark dialog[data-auth-modal] input:-webkit-autofill:focus,
  .dark dialog[data-auth-modal] input:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 30px #262626 inset !important;
    -webkit-text-fill-color: #fff !important;
    caret-color: #fff !important;
  }
`

interface AuthModalProps {
  isOpen: boolean
  onCloseAction: () => void
  defaultMode?: 'signin' | 'signup' | 'reset'
}

export function AuthModal({ isOpen, onCloseAction, defaultMode = 'signup' }: AuthModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>(defaultMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showVerificationMessage, setShowVerificationMessage] = useState(false)
  const [showResetMessage, setShowResetMessage] = useState(false)
  const { signIn, signUp, resetPassword, authError, clearError } = useAuth()

  // Open / close the native dialog
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (isOpen) {
      if (!dialog.open) dialog.showModal()
    } else {
      if (dialog.open) dialog.close()
    }
  }, [isOpen])

  // Keep mode in sync when modal opens
  useEffect(() => {
    if (isOpen) setMode(defaultMode)
  }, [isOpen, defaultMode])

  const resetForm = useCallback(() => {
    setEmail('')
    setPassword('')
    setIsLoading(false)
    setShowVerificationMessage(false)
    setShowResetMessage(false)
    clearError()
  }, [clearError])

  const handleClose = useCallback(() => {
    resetForm()
    onCloseAction()
  }, [resetForm, onCloseAction])

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
            handleClose()
          }
        }
      } else if (mode === 'signin') {
        const { error } = await signIn(email.trim(), password)
        if (!error) handleClose()
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

  // Clicking the dialog element itself (i.e. the backdrop area) closes it
  const handleDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) handleClose()
  }

  // Intercept native ESC so we can run our own close logic
  const handleCancel = (e: React.SyntheticEvent<HTMLDialogElement>) => {
    e.preventDefault()
    handleClose()
  }

  const modalCard = (content: React.ReactNode) => (
    <div
      className="w-full max-w-md bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#2f2f2f]"
      onClick={e => e.stopPropagation()}
    >
      {content}
    </div>
  )

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: dialogStyles }} />
      <dialog
        ref={dialogRef}
        data-auth-modal=""
        onClick={handleDialogClick}
        onCancel={handleCancel}
      >
        {showVerificationMessage || showResetMessage ? (
          modalCard(
            <>
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#262626] transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
              <div className="p-8 text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6">
                  <Mail className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {showVerificationMessage ? 'Check Your Email' : 'Reset Link Sent'}
                </h2>
                <p className="text-gray-600 dark:text-[#a3a3a3] mb-6">
                  We&apos;ve sent {showVerificationMessage ? 'a verification link' : 'a password reset link'} to{' '}
                  <span className="font-medium text-gray-900 dark:text-white">{email}</span>
                </p>
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-green-800 dark:text-green-200 text-left">
                      {showVerificationMessage
                        ? 'Click the link in your email to complete your account setup.'
                        : 'Click the link in your email to reset your password. The link expires in 1 hour.'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (showResetMessage) {
                      setShowResetMessage(false)
                      setMode('signin')
                    } else {
                      handleClose()
                    }
                  }}
                  className="w-full py-3 px-6 bg-[#111] dark:bg-white text-white dark:text-[#111] rounded-full font-semibold hover:bg-[#333] dark:hover:bg-[#e5e5e5] transition-colors"
                >
                  {showResetMessage ? 'Back to Sign In' : 'Got it'}
                </button>
              </div>
            </>
          )
        ) : (
          modalCard(
            <>
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#262626] transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>

              <div className="pt-8 pb-4 px-8 text-center">
                <div className="flex justify-center mb-6">
                  <Image
                    src="/make-ebook-logo.svg"
                    alt="MakeEbook"
                    width={48}
                    height={48}
                    className="w-12 h-12 dark:invert"
                  />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {mode === 'signin' ? 'Welcome back' : mode === 'reset' ? 'Reset password' : 'Create your account'}
                </h2>
                <p className="text-gray-600 dark:text-[#a3a3a3]">
                  {mode === 'signin'
                    ? 'Sign in to continue writing'
                    : mode === 'reset'
                    ? 'Enter your email to receive a reset link'
                    : 'Start creating beautiful ebooks today'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-4">
                {authError && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-800 dark:text-red-200">{authError}</p>
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="auth-email" className="block text-sm font-medium text-gray-700 dark:text-[#d4d4d4] mb-2">
                    Email
                  </label>
                  <input
                    id="auth-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                    disabled={isLoading}
                    style={{ touchAction: 'manipulation', fontSize: '16px' }}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-[#2f2f2f] bg-white dark:bg-[#262626] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-[#555] focus:border-transparent transition-shadow disabled:opacity-50"
                  />
                </div>

                {mode !== 'reset' && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label htmlFor="auth-password" className="block text-sm font-medium text-gray-700 dark:text-[#d4d4d4]">
                        Password
                      </label>
                      {mode === 'signin' && (
                        <button
                          type="button"
                          onClick={() => handleModeSwitch('reset')}
                          disabled={isLoading}
                          className="text-sm text-gray-600 dark:text-[#a3a3a3] hover:text-gray-900 dark:hover:text-white font-medium underline"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <input
                      id="auth-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={mode === 'signup' ? 'Create a password' : 'Enter your password'}
                      required
                      minLength={6}
                      autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                      disabled={isLoading}
                      style={{ touchAction: 'manipulation', fontSize: '16px' }}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-[#2f2f2f] bg-white dark:bg-[#262626] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-[#555] focus:border-transparent transition-shadow disabled:opacity-50"
                    />
                    {mode === 'signup' && (
                      <p className="mt-2 text-xs text-gray-500 dark:text-[#a3a3a3]">At least 6 characters</p>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="group w-full py-3.5 px-6 bg-[#111] dark:bg-white text-white dark:text-[#111] rounded-full font-semibold hover:bg-[#333] dark:hover:bg-[#e5e5e5] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      {mode === 'signin' ? 'Sign In' : mode === 'reset' ? 'Send Reset Link' : 'Create Account'}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  {mode === 'reset' ? (
                    <p className="text-sm text-gray-600 dark:text-[#a3a3a3]">
                      Remember your password?{' '}
                      <button
                        type="button"
                        onClick={() => handleModeSwitch('signin')}
                        disabled={isLoading}
                        className="text-gray-900 dark:text-white hover:underline font-medium"
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
                        className="text-gray-900 dark:text-white hover:underline font-medium"
                      >
                        {mode === 'signin' ? 'Sign up' : 'Sign in'}
                      </button>
                    </p>
                  )}
                </div>
              </form>

              {mode === 'signup' && (
                <div className="px-8 pb-6 pt-2 border-t border-gray-200 dark:border-[#2f2f2f]">
                  <p className="text-xs text-center text-gray-500 dark:text-[#a3a3a3]">
                    By creating an account, you agree to our{' '}
                    <a href="https://neilmcardle.com/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700 dark:hover:text-gray-300">Terms</a>
                    {' '}and{' '}
                    <a href="https://neilmcardle.com/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700 dark:hover:text-gray-300">Privacy Policy</a>
                  </p>
                </div>
              )}
            </>
          )
        )}
      </dialog>
    </>
  )
}
