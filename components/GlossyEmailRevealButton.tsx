"use client"

import { useState } from "react"
import { Mail, Check, Copy } from "lucide-react"

interface GlossyEmailRevealButtonProps {
  className?: string
}

export function GlossyEmailRevealButton({ className = "" }: GlossyEmailRevealButtonProps) {
  const [isRevealed, setIsRevealed] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  // Email parts are split to prevent scraping
  const emailParts = {
    username: "neil",
    domain: "neilmcardle",
    tld: "com",
  }

  const handleReveal = () => {
    setIsRevealed(true)
  }

  const handleCopy = () => {
    const email = `${emailParts.username}@${emailParts.domain}.${emailParts.tld}`
    navigator.clipboard.writeText(email)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      {!isRevealed ? (
        <button
          onClick={handleReveal}
          className="relative inline-flex items-center justify-center px-8 py-4 rounded-full bg-black text-white font-medium transition-all duration-200 overflow-hidden group"
          style={{
            boxShadow:
              "0 10px 25px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.2)",
            background: "linear-gradient(to bottom, #333333, #000000)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
          }}
        >
          {/* Top gradient shine */}
          <span className="absolute inset-0 w-full h-full bg-gradient-to-b from-white/20 to-transparent opacity-50 group-hover:opacity-70 transition-opacity"></span>
          <span className="absolute inset-0 w-full h-[40%] bg-gradient-to-b from-white/30 to-transparent"></span>

          {/* Single horizontal shine effect that moves on hover */}
          <span className="absolute inset-y-0 left-[-100%] w-[35%] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-100 group-hover:translate-x-[250%] transition-transform duration-1500 ease-in-out"></span>

          <Mail className="h-5 w-5 mr-2 relative z-10" />
          <span className="relative z-10">Get in Touch for Pricing</span>
        </button>
      ) : (
        <div
          className="flex items-center bg-black text-white px-6 py-3 rounded-full"
          style={{
            boxShadow:
              "0 10px 25px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.2)",
            background: "linear-gradient(to bottom, #333333, #000000)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
          }}
        >
          <span className="absolute inset-0 w-full h-[40%] bg-gradient-to-b from-white/20 to-transparent rounded-full"></span>
          <span className="font-medium relative z-10">
            {emailParts.username}
            <span>@</span>
            {emailParts.domain}
            <span>.</span>
            {emailParts.tld}
          </span>
          <button
            onClick={handleCopy}
            className="ml-3 p-1 rounded-full hover:bg-white/10 transition-colors relative z-10"
          >
            {isCopied ? <Check className="h-5 w-5 text-green-400" /> : <Copy className="h-5 w-5" />}
            <span className="sr-only">{isCopied ? "Copied" : "Copy to clipboard"}</span>
          </button>
        </div>
      )}
    </div>
  )
}
