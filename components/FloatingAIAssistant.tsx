"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Mic, X } from "lucide-react"
import { ElevenLabsAgentAdvanced } from "./ElevenLabsAgentAdvanced"

interface FloatingAIAssistantProps {
  initialPrompt?: string
  defaultVoiceId?: string
}

export function FloatingAIAssistant({
  initialPrompt = "Hi, I'm Neil's AI assistant. How can I help you today?",
  defaultVoiceId = "pNInz6obpgDQGcFmaJgB",
}: FloatingAIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed bottom-4 right-4 z-50 hidden md:block">
      {isOpen ? (
        <div className="w-80 md:w-96 bg-black rounded-2xl shadow-xl border border-[#333333] overflow-hidden">
          <div className="flex justify-between items-center p-3 border-b border-[#333333]">
            <h3 className="font-medium text-white">Neil's AI Assistant</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white hover:bg-[#333333]"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="p-0">
            <ElevenLabsAgentAdvanced
              initialPrompt={initialPrompt}
              defaultVoiceId={defaultVoiceId}
              className="border-none shadow-none"
            />
          </div>
        </div>
      ) : (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full h-14 w-14 bg-[#D4AF37] hover:bg-[#C09C2C] text-black shadow-lg"
        >
          <Mic className="h-6 w-6" />
        </Button>
      )}
    </div>
  )
}
