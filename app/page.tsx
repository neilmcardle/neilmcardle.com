"use client"
import { FigmaIcon } from "@/components/FigmaIcon"
import { Lock } from "lucide-react"
import { XPostEmbed } from "@/components/XPostEmbed"
import Image from "next/image"
import Link from "next/link"

export default function Home() {
  return (
    <div className="flex flex-col items-center h-screen overflow-hidden px-4 relative">
      {/* Background with subtle gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50/30 to-purple-50/30 z-[-1]"></div>

      <div className="w-full max-w-6xl mx-auto relative z-[15] mt-4">
        {/* Card frame for top content */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl p-4 sm:p-8">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Left column - Hero content */}
            <div className="flex flex-col items-start text-left">
              <div className="inline-flex items-center py-2 rounded-full bg-white text-gray-600 text-sm font-medium mb-4">
                Design Engineer
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4 sm:mb-6">Neil McArdle</h1>

              <p className="text-lg sm:text-xl text-gray-500 mb-6 sm:mb-10 max-w-md">
                Elegant designs realized through clean, purposeful code.
              </p>

              <Link
                href="https://www.figma.com/proto/zZcc3Li72GhWFVpv1PxC0O/%F0%9F%91%A8%F0%9F%8F%BC%E2%80%8D%F0%9F%9A%80--Neil-McArdle?page-id=7947%3A56485&node-id=7947-56486&viewport=119%2C809%2C0.29&t=9uLN4opTMa6jNFaW-1&scaling=min-zoom&content-scaling=fixed&starting-point-node-id=7947%3A56486"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-white text-gray-800 font-medium shadow-lg hover:shadow-xl transition-shadow text-sm sm:text-base"
              >
                <FigmaIcon variant="color" className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Access Figma Portfolio
                <Lock className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
              </Link>
            </div>

            {/* Right column - Custom X Post with working embed */}
            <div className="flex flex-col space-y-6 w-full">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden w-full">
                <div className="p-4 sm:p-6">
                  <div className="flex items-start mb-4">
                    {/* Profile image */}
                    <Image
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/profile-dONA7abEaJyCLzMSGtfxbqB76X5jfw.png"
                      alt="Neil McArdle"
                      width={40}
                      height={40}
                      className="rounded-full mr-3 w-10 h-10 sm:w-12 sm:h-12"
                    />

                    {/* Name and handle */}
                    <div>
                      <div className="flex items-center">
                        <span className="font-bold text-gray-900 text-sm sm:text-base">Neil McArdle</span>
                        <span className="text-gray-500 ml-1 text-xs sm:text-sm">@BetterNeil</span>
                      </div>

                      {/* Post content */}
                      <div className="mt-1">
                        <p className="text-gray-900 mb-1 text-sm sm:text-base">Resizable Figma button 🔥 ;P 🔥</p>
                        <p className="text-gray-900 mb-2 text-sm sm:text-base">Sound on... 🔊</p>
                        <p className="text-blue-500 text-xs sm:text-sm">
                          <span className="mr-2">#UI</span>
                          <span>#Design</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Working XPostEmbed directly in the card */}
                  <div className="mt-4 rounded-xl overflow-hidden">
                    <XPostEmbed
                      tweetUrl="https://twitter.com/BetterNeil/status/1901435678375972971"
                      mediaMaxWidth={550}
                      align="center"
                      cards="visible"
                      conversation="none"
                      theme="light"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

