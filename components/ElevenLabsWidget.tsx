"use client"
import Script from "next/script"
import { useEffect, useState } from "react"

export default function ElevenLabsWidget() {
  const [apiKey, setApiKey] = useState<string | undefined>(undefined)
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Access the environment variable in the client component
    try {
      const key = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY
      setApiKey(key)

      if (!key) {
        console.warn("ElevenLabs API key is missing")
      }
    } catch (err) {
      console.error("Error accessing API key:", err)
      setError("Could not access API key")
    }
  }, [])

  const handleScriptLoad = () => {
    setScriptLoaded(true)
    console.log("ElevenLabs script loaded successfully")
  }

  const handleScriptError = (e: Error) => {
    console.error("Error loading ElevenLabs script:", e)
    setError("Failed to load ElevenLabs widget")
  }

  return (
    <>
      {error && <div className="bg-white rounded-lg shadow-lg p-4 text-sm text-red-600">{error}</div>}

      <elevenlabs-convai agent-id="wjHL8KdEVglYcTYadlxF" data-api-key={apiKey}></elevenlabs-convai>

      <Script
        src="https://elevenlabs.io/convai-widget/index.js"
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
        onError={handleScriptError}
      />
    </>
  )
}

