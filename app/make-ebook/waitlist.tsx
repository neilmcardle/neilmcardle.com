"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function WaitlistForm() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      setSubmitted(true)
      setLoading(false)
    }, 1000)

    // In a real implementation, you would send the email to your backend
    // const response = await fetch('/api/waitlist', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ email }),
    // })
  }

  if (submitted) {
    return (
      <div className="text-center p-6 bg-[#F5F5F7] rounded-2xl">
        <h3 className="text-xl font-semibold mb-2">Thank you for joining!</h3>
        <p className="text-[#86868B]">We'll notify you when makeEbook is ready for early access.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-[#F5F5F7] rounded-2xl">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="rounded-lg"
        />
      </div>
      <Button type="submit" className="w-full bg-[#1D1D1F] hover:bg-black text-white rounded-full" disabled={loading}>
        {loading ? "Submitting..." : "Join the Waitlist"}
      </Button>
    </form>
  )
}

