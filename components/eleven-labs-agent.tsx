"use client"

import { useState, useEffect } from "react"

interface ElevenLabsAgentProps {
  initialPrompt?: string
  voiceId?: string
  className?: string
  agentId?: string
}

export default function ElevenLabsAgent({
  initialPrompt = "Hi, I'm Neil's AI assistant. How can I help you today?",
  voiceId = "pNInz6obpgDQGcFmaJgB",
  className = "",
  agentId = "wjHL8KdEVglYcTYadlxF",
}: ElevenLabsAgentProps) {
  const [isWidgetLoaded, setIsWidgetLoaded] = useState(false)

  useEffect(() => {
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
      document.body.appendChild(widgetElement)
    }

    return () => {
      // Cleanup function
      const widgetElement = document.querySelector("elevenlabs-convai")
      if (widgetElement) {
        widgetElement.remove()
      }
    }
  }, [agentId])

  return null // This component doesn't render anything visible, it just injects the widget
}
