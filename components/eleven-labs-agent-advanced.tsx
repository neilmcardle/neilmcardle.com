"use client"

import { useState, useEffect } from "react"

interface ElevenLabsAgentAdvancedProps {
  initialPrompt?: string
  voiceId?: string
  className?: string
  agentId?: string
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left"
  theme?: "light" | "dark"
}

export default function ElevenLabsAgentAdvanced({
  initialPrompt = "Hi, I'm Neil's AI assistant. How can I help you today?",
  voiceId = "pNInz6obpgDQGcFmaJgB",
  className = "",
  agentId = "wjHL8KdEVglYcTYadlxF",
  position = "bottom-right",
  theme = "dark",
}: ElevenLabsAgentAdvancedProps) {
  const [isWidgetLoaded, setIsWidgetLoaded] = useState(false)

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return

    // Check if the widget script is already loaded
    const isScriptLoaded = document.querySelector('script[src="https://elevenlabs.io/convai-widget/index.js"]')

    if (!isScriptLoaded) {
      const script = document.createElement("script")
      script.src = "https://elevenlabs.io/convai-widget/index.js"
      script.async = true
      script.type = "text/javascript"

      script.onload = () => {
        setIsWidgetLoaded(true)
        console.log("ElevenLabs widget script loaded")
      }

      document.body.appendChild(script)
    } else {
      setIsWidgetLoaded(true)
    }

    // Create the widget element if it doesn't exist
    if (!document.querySelector("elevenlabs-convai")) {
      const widgetElement = document.createElement("elevenlabs-convai")
      widgetElement.setAttribute("agent-id", agentId)

      // Add data attributes for customization if they become available
      if (position) {
        widgetElement.setAttribute("data-position", position)
      }

      if (theme) {
        widgetElement.setAttribute("data-theme", theme)
      }

      document.body.appendChild(widgetElement)

      // Apply custom styling
      const styleElement = document.createElement("style")
      styleElement.textContent = `
        elevenlabs-convai {
          --el-convai-primary-color: #D4AF37;
          --el-convai-background-color: #000000;
          --el-convai-text-color: #FFFFFF;
        }
      `
      document.head.appendChild(styleElement)
    }

    return () => {
      // Cleanup function
      const widgetElement = document.querySelector("elevenlabs-convai")
      if (widgetElement) {
        widgetElement.remove()
      }

      // Remove custom styling
      const styleElement = document.querySelector("style[data-elevenlabs-styles]")
      if (styleElement) {
        styleElement.remove()
      }
    }
  }, [agentId, position, theme])

  return null // This component doesn't render anything visible, it just injects the widget
}
