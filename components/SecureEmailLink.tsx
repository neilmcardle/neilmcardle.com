"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Mail, Check, Copy } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface SecureEmailLinkProps {
  className?: string
}

export function SecureEmailLink({ className = "" }: SecureEmailLinkProps) {
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
    <div className={`flex items-center gap-2 ${className}`}>
      {!isRevealed ? (
        <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={handleReveal}>
          <Mail className="h-4 w-4" />
          <span>Get in Touch</span>
        </Button>
      ) : (
        <>
          <span className="font-medium">
            {emailParts.username}
            <span>@</span>
            {emailParts.domain}
            <span>.</span>
            {emailParts.tld}
          </span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopy}>
                  {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isCopied ? "Copied!" : "Copy to clipboard"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </>
      )}
    </div>
  )
}
