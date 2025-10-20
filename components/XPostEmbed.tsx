"use client"
import { useEffect, useRef } from "react"

interface XPostEmbedProps {
  tweetUrl: string
  theme?: "light" | "dark"
  align?: "left" | "center" | "right"
  conversation?: "all" | "none"
  cards?: "hidden" | "visible"
  width?: number
  mediaMaxWidth?: number
  className?: string
}

export function XPostEmbed({
  tweetUrl,
  theme = "light",
  align = "center",
  conversation = "none",
  cards = "visible",
  width,
  mediaMaxWidth,
  className = "",
}: XPostEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Simple placeholder for preview
    if (containerRef.current) {
      containerRef.current.innerHTML = `
        <div class="bg-white p-4 rounded-lg border border-gray-200">
          <div class="flex items-center mb-3">
            <div class="w-10 h-10 rounded-full bg-gray-200 mr-3"></div>
            <div>
              <div class="font-bold">@BetterNeil</div>
              <div class="text-gray-500 text-sm">Twitter Post</div>
            </div>
          </div>
          <div class="mb-3">
            This is a placeholder for the Twitter post that will be loaded in production.
          </div>
          <div class="text-blue-500 text-sm">View on Twitter</div>
        </div>
      `
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ""
      }
    }
  }, [tweetUrl])

  return (
    <div
      ref={containerRef}
      className={`twitter-embed ${className}`}
      data-tweet-url={tweetUrl}
      data-theme={theme}
      data-align={align}
      data-conversation={conversation}
      data-cards={cards}
    ></div>
  )
}
