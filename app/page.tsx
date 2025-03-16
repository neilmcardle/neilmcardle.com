"use client"

import Link from "next/link"
import { FigmaIcon } from "@/components/FigmaIcon"
import { LinkedInIcon } from "@/components/LinkedInIcon"
import { Lock } from "lucide-react"
import { Glossy3DButton } from "@/components/Glossy3DButton"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-6rem)] px-4 -mt-20">
      <div className="w-full max-w-4xl mx-auto text-center relative z-[15]">
        {/* Pre-title */}
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-white text-gray-600 text-sm font-medium mb-3">
          Design Engineer
        </div>

        {/* Main headline */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8">Neil McArdle</h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-gray-500 max-w-2xl mx-auto mb-4">
          Elegant designs realised through clean, purposeful code.
        </p>

        {/* Action buttons - stacked vertically */}
        <div className="flex flex-col items-center gap-4 pt-2">
          <Glossy3DButton
            href="https://www.figma.com/proto/zZcc3Li72GhWFVpv1PxC0O/%F0%9F%91%A8%F0%9F%8F%BC%E2%80%8D%F0%9F%9A%80--Neil-McArdle?page-id=7947%3A56485&node-id=7947-56486&viewport=119%2C809%2C0.29&t=9uLN4opTMa6jNFaW-1&scaling=min-zoom&content-scaling=fixed&starting-point-node-id=7947%3A56486"
            external={true}
          >
            <FigmaIcon variant="color" className="w-5 h-5 mr-2" />
            Access Figma Portfolio
            <Lock className="w-5 h-5 ml-2" />
          </Glossy3DButton>
          <Link
            href="https://www.linkedin.com/in/neilmcardle/"
            className="inline-flex items-center px-6 py-3 rounded-full bg-white text-black font-medium transition-all duration-200 
  shadow-md hover:shadow-inner hover:scale-[0.98] hover:translate-y-[1px] active:scale-[0.96]"
            target="_blank"
            rel="noopener noreferrer"
          >
            <LinkedInIcon className="w-5 h-5 mr-2 fill-black" />
            Connect on LinkedIn
          </Link>
        </div>
      </div>
    </div>
  )
}

