"use client"

import { useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Checkbox } from './ui/checkbox'
import { useToast } from './ui/use-toast'
import Link from 'next/link'

interface AuthModalProps {
  trigger: React.ReactNode
  mode?: 'signin' | 'signup'
}

export function AuthModal({ trigger, mode = 'signin' }: AuthModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [authMode, setAuthMode] = useState(mode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()
  const { toast } = useToast()
  const [showVerifyEmail, setShowVerifyEmail] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (authMode === 'signup' && (!acceptedTerms || !acceptedPrivacy)) {
      toast({
        title: "Consent Required",
        description: "Please accept the Terms of Service and Privacy Policy to continue.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const { error } = authMode === 'signin'
        ? await signIn(email, password)
        : await signUp(email, password)

      if (error) {
        toast({
          title: "Authentication Error",
          description: error.message,
          variant: "destructive",
        })
      } else {
        if (authMode === 'signin') {
          toast({
            title: "Welcome back!",
            description: "You have successfully signed in.",
          })
          setIsOpen(false)
          setShowVerifyEmail(false)
          setEmail('')
          setPassword('')
          setAcceptedTerms(false)
          setAcceptedPrivacy(false)
        } else {
          // Sign up: show persistent verify message & keep modal open
          setShowVerifyEmail(true)
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (open) {
      setAuthMode(mode)
      setShowVerifyEmail(false)
      setEmail('')
      setPassword('')
      setAcceptedTerms(false)
      setAcceptedPrivacy(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {authMode === 'signin' ? 'Sign In' : 'Sign Up'}
          </DialogTitle>
        </DialogHeader>
        {showVerifyEmail ? (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded text-blue-900 text-center mb-2">
            <div className="font-semibold mb-1">Check your email to verify your address!</div>
            <div className="text-sm">
              We've sent you a verification link. Please check your inbox and click the link to complete your signup.<br />
              After verifying, you can <button
                className="text-blue-600 underline font-medium ml-1"
                onClick={() => {
                  setShowVerifyEmail(false)
                  setAuthMode("signin")
                }}
              >sign in</button>.
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {/* GDPR Consent Checkboxes for Signup */}
            {authMode === 'signup' && (
              <div className="space-y-3 pt-2">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={acceptedTerms}
                    onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                  />
                  <Label htmlFor="terms" className="text-sm leading-5">
                    I agree to the{' '}
                    <Link href="/terms" className="text-blue-600 hover:underline" target="_blank">
                      Terms of Service
                    </Link>
                  </Label>
                </div>
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="privacy"
                    checked={acceptedPrivacy}
                    onCheckedChange={(checked) => setAcceptedPrivacy(checked as boolean)}
                  />
                  <Label htmlFor="privacy" className="text-sm leading-5">
                    I agree to the{' '}
                    <Link href="/privacy" className="text-blue-600 hover:underline" target="_blank">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Processing...' : (authMode === 'signin' ? 'Sign In' : 'Sign Up')}
            </Button>
          </form>
        )}
        {!showVerifyEmail && (
          <div className="text-center">
            <Button
              variant="link"
              onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
            >
              {authMode === 'signin'
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}