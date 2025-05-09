"use client"

import { useEffect, useRef } from "react"

interface XPostEmbedProps {
  tweetUrl: string
  className?: string
  mediaMaxWidth?: number
  theme?: "light" | "dark"
  align?: "left" | "center" | "right"
  conversation?: "none" | "all"
  cards?: "hidden" | "visible"
}

export function XPostEmbed({
  tweetUrl,
  className = "",
  mediaMaxWidth,
  theme,
  align = "center",
  conversation = "all",
  cards = "visible",
}: XPostEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Only load the script if we're in the browser
    if (typeof window !== "undefined" && containerRef.current) {
      // Clear any existing content
      containerRef.current.innerHTML = ""

      // Create a new blockquote element with the tweet URL
      const tweetElement = document.createElement("blockquote")
      tweetElement.className = "twitter-tweet"

      // Add optional attributes if provided
      if (mediaMaxWidth) {
        tweetElement.setAttribute("data-media-max-width", mediaMaxWidth.toString())
      }
      if (theme) {
        tweetElement.setAttribute("data-theme", theme)
      }

      // Set alignment
      tweetElement.setAttribute("data-align", align)

      // Set conversation display
      tweetElement.setAttribute("data-conversation", conversation)

      // Set cards display
      tweetElement.setAttribute("data-cards", cards)

      // Ensure media is displayed
      tweetElement.setAttribute("data-dnt", "false")
      tweetElement.setAttribute("data-lang", "en")
      tweetElement.setAttribute("data-video-controls", "true")
      tweetElement.setAttribute("data-chrome", "noheader nofooter noborders")

      // Create an anchor element with the tweet URL
      const anchor = document.createElement("a")
      anchor.href = tweetUrl
      tweetElement.appendChild(anchor)

      // Append the tweet element to the container
      containerRef.current.appendChild(tweetElement)

      // Function to load Twitter widgets
      const loadTwitterWidgets = () => {
        if (window.twttr && window.twttr.widgets) {
          window.twttr.widgets.load(containerRef.current)
        }
      }

      // Load the Twitter widget script if it doesn't exist
      if (!document.querySelector('script[src="https://platform.twitter.com/widgets.js"]')) {
        const script = document.createElement("script")
        script.src = "https://platform.twitter.com/widgets.js"
        script.async = true
        script.charset = "utf-8"
        script.onload = loadTwitterWidgets
        document.body.appendChild(script)
      } else {
        // If the script already exists, just load the widgets
        loadTwitterWidgets()
      }
    }

    // No need to remove the script on unmount as it's used globally
  }, [tweetUrl, mediaMaxWidth, theme, align, conversation, cards])

  return (
    <div ref={containerRef} className={`x-post-embed ${className}`}>
      {/* The tweet will be rendered here */}
      <div className="flex justify-center items-center p-4 bg-gray-100 rounded-lg animate-pulse">
        <p className="text-gray-500">Loading post...</p>
      </div>
    </div>
  )
}

// Add TypeScript declaration for the Twitter widgets API
declare global {
  interface Window {
    twttr?: {
      widgets: {
        load: (element?: HTMLElement) => void
      }
    }
  }
}

