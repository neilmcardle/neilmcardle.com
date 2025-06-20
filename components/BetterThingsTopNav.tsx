"use client"
import { useState } from "react"
import { BetterThingsLogo } from "./BetterThingsLogo"
import { Button } from "@/components/ui/button"
import { Mail, Check, Copy } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function BetterThingsTopNav() {
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
    <header className="py-4 bg-white border-b border-gray-100 fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <BetterThingsLogo className="w-8 h-8 text-black" />
            <span className="text-xl font-bold text-black">Better Things</span>
          </div>
          <div>
            {!isRevealed ? (
              <Button variant="ghost" size="sm" className="flex items-center gap-2" onClick={handleReveal}>
                <Mail className="h-4 w-4" />
                <span>Get in touch</span>
              </Button>
            ) : (
              <div className="flex items-center gap-2">
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
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
