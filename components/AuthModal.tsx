"use client"

import { useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { useToast } from './ui/use-toast'

interface AuthModalProps {
  trigger: React.ReactNode
  mode?: 'signin' | 'signup'
}

export function AuthModal({ trigger, mode = 'signin' }: AuthModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [authMode, setAuthMode] = useState(mode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
        toast({
          title: authMode === 'signin' ? "Welcome back!" : "Account created!",
          description: authMode === 'signin' 
            ? "You have successfully signed in." 
            : "Please check your email to verify your account.",
        })
        setIsOpen(false)
        setEmail('')
        setPassword('')
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {authMode === 'signin' ? 'Sign In' : 'Sign Up'}
          </DialogTitle>
        </DialogHeader>
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
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Processing...' : (authMode === 'signin' ? 'Sign In' : 'Sign Up')}
          </Button>
        </form>
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
      </DialogContent>
    </Dialog>
  )
}