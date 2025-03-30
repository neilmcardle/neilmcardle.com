"use client"
import { useState } from "react"
import { AlertCircle } from "lucide-react"

export default function ElevenLabsErrorMessage() {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 flex flex-col items-center max-w-xs">
      <div className="flex items-center mb-2 text-red-500">
        <AlertCircle className="w-5 h-5 mr-2" />
        <span className="font-medium">Authentication Error</span>
      </div>
      <p className="text-sm text-gray-600 mb-3 text-center">
        Could not authorize the ElevenLabs conversation. Please check your API key.
      </p>
      <button
        onClick={() => setDismissed(true)}
        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium transition-colors"
      >
        Dismiss
      </button>
    </div>
  )
}

