"use client"

import { useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog'
import { Alert, AlertDescription } from '../ui/alert'
import { Loader2, Mail, CheckCircle, AlertCircle, Lock } from 'lucide-react'

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
            <Button 
              onClick={handleClose} 
              className="w-full bg-gray-900 hover:bg-gray-800"
            >
              Got it
            </Button>
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
            <Button 
              onClick={() => {
                setShowResetMessage(false)
                setMode('signin')
              }}
              className="w-full bg-gray-900 hover:bg-gray-800"
            >
              Back to Sign In
            </Button>
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
            {mode === 'signin' ? 'Welcome Back' : mode === 'reset' ? 'Reset Password' : 'Get Started Free'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'signin' 
              ? 'Sign in to access your eBook projects' 
              : mode === 'reset'
              ? 'Enter your email address and we\'ll send you a reset link'
              : 'Create your free account to start building eBooks'
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
          
          <Button 
            type="submit" 
            className="w-full bg-gray-900 hover:bg-gray-800" 
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === 'signin' ? 'Sign In' : mode === 'reset' ? 'Send Reset Link' : (
              <span className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Sign up for free
              </span>
            )}
          </Button>
        </form>
        
        <div className="text-center text-sm">
          {mode === 'reset' ? (
            <>
              <span className="text-gray-500">Remember your password? </span>
              <button
                type="button"
                onClick={() => handleModeSwitch('signin')}
                className="text-gray-900 hover:text-gray-700 font-medium underline"
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
                className="text-gray-900 hover:text-gray-700 font-medium underline"
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