"use client"
import Script from "next/script"
import { useEffect, useState } from "react"

export default function ElevenLabsWidget() {
  const [apiKey, setApiKey] = useState<string | undefined>(undefined)

  useEffect(() => {
    // Access the environment variable in the client component
    setApiKey(process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY)
  }, [])

  return (
    <>
      <elevenlabs-convai agent-id="wjHL8KdEVglYcTYadlxF" data-api-key={apiKey}></elevenlabs-convai>
      <Script src="https://elevenlabs.io/convai-widget/index.js" strategy="afterInteractive" />
    </>
  )
}

