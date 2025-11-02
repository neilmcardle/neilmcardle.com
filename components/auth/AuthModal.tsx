"use client"

import { useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog'
import { Alert, AlertDescription } from '../ui/alert'
import { Loader2, Mail, CheckCircle, AlertCircle, Lock, Star, Rocket } from 'lucide-react'
import { useTheme } from '@/lib/contexts/ThemeContext'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  defaultMode?: 'signin' | 'signup' | 'reset'
}

export function AuthModal({ isOpen, onClose, defaultMode = 'signup' }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>(defaultMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showVerificationMessage, setShowVerificationMessage] = useState(false)
  const [showResetMessage, setShowResetMessage] = useState(false)
  const { signIn, signUp, resetPassword, authError, clearError } = useAuth()
  const { theme } = useTheme()

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
    onClose()
  }

  const handleModeSwitch = (newMode: 'signin' | 'signup' | 'reset') => {
    setMode(newMode)
    clearError()
    setShowVerificationMessage(false)
    setShowResetMessage(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // For reset mode, only email is required
    if (mode === 'reset') {
      if (!email.trim()) return
    } else {
      if (!email.trim() || !password.trim()) return
    }

    setIsLoading(true)
    clearError()

    try {
      if (mode === 'signup') {
        const { error, needsVerification } = await signUp(email.trim(), password)
        
        if (!error) {
          if (needsVerification) {
            setShowVerificationMessage(true)
          } else {
            // User signed up and is immediately authenticated
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

  if (showVerificationMessage) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <DialogTitle>Check Your Email</DialogTitle>
            <DialogDescription className="text-center">
              We've sent a verification link to <strong>{email}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Click the link in your email to complete your account setup and access makeEbook.
              </AlertDescription>
            </Alert>
            <div style={{
              borderRadius: '999px',
              padding: '2.5px',
              background: 'linear-gradient(45deg, #733F06 0%, #FEF3E7 50%, #B1916B 100%)',
              display: 'inline-block',
              width: '100%',
            }}>
              <button
                onClick={handleClose}
                className="px-6 py-3 font-medium flex items-center justify-center gap-2 transition-all focus:outline-none w-full"
                style={{
                  borderRadius: '999px',
                  background: theme === 'dark' ? '#1a1a1a' : '#fff',
                  border: 'none',
                  boxShadow: '0 6px 8px 0 rgba(0,0,0,0.16)',
                  transition: 'background 0.2s, color 0.2s',
                  display: 'flex',
                  fontSize: '14px',
                  color: theme === 'dark' ? '#fff' : '#1a1a1a',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = theme === 'dark' ? '#2a2a2a' : 'linear-gradient(225deg, #733F06 0%, #FEF3E7 50%, #B1916B 100%)'
                  e.currentTarget.style.color = theme === 'dark' ? '#fff' : '#1a1a1a'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = theme === 'dark' ? '#1a1a1a' : '#fff'
                  e.currentTarget.style.color = theme === 'dark' ? '#fff' : '#1a1a1a'
                }}
              >
                Got it
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (showResetMessage) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-green-600" />
            </div>
            <DialogTitle>Password Reset Sent</DialogTitle>
            <DialogDescription className="text-center">
              We've sent a password reset link to <strong>{email}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Click the link in your email to reset your password. The link will expire in 1 hour.
              </AlertDescription>
            </Alert>
            <div style={{
              borderRadius: '999px',
              padding: '2.5px',
              background: 'linear-gradient(45deg, #733F06 0%, #FEF3E7 50%, #B1916B 100%)',
              display: 'inline-block',
              width: '100%',
            }}>
              <button
                onClick={() => {
                  setShowResetMessage(false)
                  setMode('signin')
                }}
                className="px-6 py-3 font-medium flex items-center justify-center gap-2 transition-all focus:outline-none w-full"
                style={{
                  borderRadius: '999px',
                  background: theme === 'dark' ? '#1a1a1a' : '#fff',
                  border: 'none',
                  boxShadow: '0 6px 8px 0 rgba(0,0,0,0.16)',
                  transition: 'background 0.2s, color 0.2s',
                  display: 'flex',
                  fontSize: '14px',
                  color: theme === 'dark' ? '#fff' : '#1a1a1a',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = theme === 'dark' ? '#2a2a2a' : 'linear-gradient(225deg, #733F06 0%, #FEF3E7 50%, #B1916B 100%)'
                  e.currentTarget.style.color = theme === 'dark' ? '#fff' : '#1a1a1a'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = theme === 'dark' ? '#1a1a1a' : '#fff'
                  e.currentTarget.style.color = theme === 'dark' ? '#fff' : '#1a1a1a'
                }}
              >
                Back to Sign In
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'signin' ? 'Welcome Back' : mode === 'reset' ? 'Reset Password' : (
              <span className="flex items-center justify-center">
                <img src="/make-ebook-logomark.svg" alt="Make eBook logo" className="h-8 w-auto mx-auto dark:invert" />
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            {mode === 'signin' 
              ? 'Sign in to access your eBook projects' 
              : mode === 'reset'
              ? 'Enter your email address and we\'ll send you a reset link'
              : ""
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {authError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              disabled={isLoading}
              className="bg-transparent"
            />
          </div>
          
          {mode !== 'reset' && (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Choose a secure password"
                required
                minLength={6}
                disabled={isLoading}
                className="bg-transparent"
              />
              {mode === 'signup' && (
                <p className="text-xs text-gray-500">At least 6 characters</p>
              )}
              {mode === 'signin' && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => handleModeSwitch('reset')}
                    className="text-xs text-gray-500 hover:text-gray-700 underline"
                    disabled={isLoading}
                  >
                    Forgot password?
                  </button>
                </div>
              )}
            </div>
          )}
          
          <div style={{
            borderRadius: '999px',
            padding: '2.5px',
            background: 'linear-gradient(45deg, #733F06 0%, #FEF3E7 50%, #B1916B 100%)',
            display: 'inline-block',
            width: '100%',
          }}>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 font-medium flex items-center justify-center gap-2 transition-all focus:outline-none w-full"
              style={{
                borderRadius: '999px',
                background: theme === 'dark' ? '#1a1a1a' : '#fff',
                border: 'none',
                boxShadow: '0 6px 8px 0 rgba(0,0,0,0.16)',
                transition: 'background 0.2s, color 0.2s',
                display: 'flex',
                fontSize: '14px',
                color: theme === 'dark' ? '#fff' : '#1a1a1a',
              }}
              onMouseEnter={e => {
                if (!isLoading) {
                  e.currentTarget.style.background = theme === 'dark' ? '#2a2a2a' : 'linear-gradient(225deg, #733F06 0%, #FEF3E7 50%, #B1916B 100%)'
                  e.currentTarget.style.color = theme === 'dark' ? '#fff' : '#1a1a1a'
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = theme === 'dark' ? '#1a1a1a' : '#fff'
                e.currentTarget.style.color = theme === 'dark' ? '#fff' : '#1a1a1a'
              }}
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === 'signin' ? 'SIGN IN' : mode === 'reset' ? 'SEND RESET LINK' : 'SIGN UP FOR FREE'}
            </button>
          </div>
        </form>
        
        <div className="text-center text-sm">
          {mode === 'reset' ? (
            <>
              <span className="text-gray-500">Remember your password? </span>
              <button
                type="button"
                onClick={() => handleModeSwitch('signin')}
                className="text-gray-400 hover:text-gray-600 font-medium underline"
                disabled={isLoading}
              >
                Sign in
              </button>
            </>
          ) : (
            <>
              <span className="text-gray-500">
                {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
              </span>
              <button
                type="button"
                onClick={() => handleModeSwitch(mode === 'signin' ? 'signup' : 'signin')}
                className="text-gray-400 hover:text-gray-600 font-medium underline"
                disabled={isLoading}
              >
                {mode === 'signin' ? 'Sign up' : 'Sign in'}
              </button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}