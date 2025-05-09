import { Suspense } from "react"
import dynamic from "next/dynamic"

// Dynamically import the client components
const ElevenLabsWidget = dynamic(() => import("./ElevenLabsWidget"), {
  ssr: false,
})

const ElevenLabsErrorMessage = dynamic(() => import("./ElevenLabsErrorMessage"), {
  ssr: false,
})

export default function ElevenLabsWidgetWrapper() {
  // Check if the API key exists
  const hasApiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY !== undefined

  return <Suspense fallback={null}>{hasApiKey ? <ElevenLabsWidget /> : <ElevenLabsErrorMessage />}</Suspense>
}

