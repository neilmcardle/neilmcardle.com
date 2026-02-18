"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { Loader2, Mail, CheckCircle, AlertCircle, X, ArrowRight } from 'lucide-react'
import Image from 'next/image'

// CSS to override browser autofill styling
const autofillStyles = `
  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus,
  input:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 30px white inset !important;
    -webkit-text-fill-color: #111827 !important;
    caret-color: #111827 !important;
  }
  .dark input:-webkit-autofill,
  .dark input:-webkit-autofill:hover,
  .dark input:-webkit-autofill:focus,
  .dark input:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 30px #111827 inset !important;
    -webkit-text-fill-color: #fff !important;
    caret-color: #fff !important;
  }
`;

interface AuthModalProps {
  isOpen: boolean
  onCloseAction: () => void
  defaultMode?: 'signin' | 'signup' | 'reset'
  checkoutContext?: 'pro' | 'lifetime' | null
}

export function AuthModal({ isOpen, onCloseAction, defaultMode = 'signup', checkoutContext }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>(defaultMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showVerificationMessage, setShowVerificationMessage] = useState(false)
  const [showResetMessage, setShowResetMessage] = useState(false)
  const { signIn, signUp, resetPassword, authError, clearError } = useAuth()

  // Sync mode with defaultMode when modal opens or defaultMode changes
  useEffect(() => {
    if (isOpen) {
      setMode(defaultMode)
    }
  }, [isOpen, defaultMode])

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setIsLoading(false)
    setShowVerificationMessage(false)
    setShowResetMessage(false)
    clearError()
  }

  const handleClose = () => {
    resetForm()
    onCloseAction()
  }

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
          // Switch to sign-in mode so user can log in with their existing account
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
        
        if (!error) {
          handleClose()
        }
      } else if (mode === 'reset') {
        const { error, resetSent } = await resetPassword(email.trim())
        
        if (!error && resetSent) {
          setShowResetMessage(true)
        }
      }
    } catch (error) {
      console.error('Auth error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  // Success states (verification email sent, password reset sent)
  if (showVerificationMessage || showResetMessage) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: autofillStyles }} />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
        />
        
        {/* Modal */}
        <div className="relative w-full max-w-md bg-white dark:bg-[#0a0a0a] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors z-10"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          <div className="p-8 text-center">
            {/* Icon */}
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6">
              <Mail className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            
            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {showVerificationMessage ? 'Check Your Email' : 'Reset Link Sent'}
            </h2>
            
            {/* Description */}
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We&apos;ve sent {showVerificationMessage ? 'a verification link' : 'a password reset link'} to{' '}
              <span className="font-medium text-gray-900 dark:text-white">{email}</span>
            </p>
            
            {/* Info box */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-800 dark:text-green-200 text-left">
                  {showVerificationMessage 
                    ? 'Click the link in your email to complete your account setup.'
                    : 'Click the link in your email to reset your password. The link expires in 1 hour.'
                  }
                </p>
              </div>
            </div>
            
            {/* Action button */}
            <button
              onClick={() => {
                if (showResetMessage) {
                  setShowResetMessage(false)
                  setMode('signin')
                } else {
                  handleClose()
                }
              }}
              className="w-full py-3 px-6 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
            >
              {showResetMessage ? 'Back to Sign In' : 'Got it'}
            </button>
          </div>
        </div>
      </div>
      </>
    )
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: autofillStyles }} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
        />
        
        {/* Modal */}
        <div className="relative w-full max-w-md bg-white dark:bg-[#0a0a0a] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors z-10"
          >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Header */}
        <div className="pt-8 pb-4 px-8 text-center">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Image
              src="/make-ebook-logo.svg"
              alt="MakeEbook"
              width={48}
              height={48}
              className="w-12 h-12 dark:invert"
            />
          </div>
          
          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {mode === 'signin' ? 'Welcome back' : mode === 'reset' ? 'Reset password' : 'Create your account'}
          </h2>
          
          {/* Subtitle */}
          <p className="text-gray-600 dark:text-gray-400">
            {mode === 'signin'
              ? 'Sign in to continue writing'
              : mode === 'reset'
              ? 'Enter your email to receive a reset link'
              : 'Start creating beautiful ebooks today'
            }
          </p>

          {/* Checkout context banner */}
          {checkoutContext && mode !== 'reset' && (
            <p className="mt-4 text-sm text-green-600 dark:text-green-400 text-center">
              {checkoutContext === 'lifetime'
                ? "You're one step away from Lifetime access. Create an account to complete your purchase."
                : "You're one step away from Pro. Create an account to complete your subscription."
              }
            </p>
          )}
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-4">
          {/* Error Alert */}
          {authError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800 dark:text-red-200">{authError}</p>
              </div>
            </div>
          )}
          
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 focus:border-transparent transition-shadow disabled:opacity-50"
            />
          </div>
          
          {/* Password Field */}
          {mode !== 'reset' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => handleModeSwitch('reset')}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium underline"
                    disabled={isLoading}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'signup' ? 'Create a password' : 'Enter your password'}
                required
                minLength={6}
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 focus:border-transparent transition-shadow disabled:opacity-50"
              />
              {mode === 'signup' && (
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  At least 6 characters
                </p>
              )}
            </div>
          )}
          
          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="group w-full py-3.5 px-6 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
          
          {/* Mode Switch */}
          <div className="text-center pt-2">
            {mode === 'reset' ? (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Remember your password?{' '}
                <button
                  type="button"
                  onClick={() => handleModeSwitch('signin')}
                  className="text-gray-900 dark:text-white hover:underline font-medium"
                  disabled={isLoading}
                >
                  Sign in
                </button>
              </p>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={() => handleModeSwitch(mode === 'signin' ? 'signup' : 'signin')}
                  className="text-gray-900 dark:text-white hover:underline font-medium"
                  disabled={isLoading}
                >
                  {mode === 'signin' ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            )}
          </div>
        </form>
        
        {/* Footer */}
        {mode === 'signup' && (
          <div className="px-8 pb-6 pt-2 border-t border-gray-200 dark:border-gray-800">
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              By creating an account, you agree to our{' '}
              <a href="https://neilmcardle.com/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700 dark:hover:text-gray-300">Terms</a>
              {' '}and{' '}
              <a href="https://neilmcardle.com/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700 dark:hover:text-gray-300">Privacy Policy</a>
            </p>
          </div>
        )}
      </div>
    </div>
    </>
  )
}
