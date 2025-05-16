"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mic, Play, Pause, Volume2, VolumeX, Loader2 } from "lucide-react"
import { generateSpeech } from "@/app/api/elevenlabs/actions"

interface ElevenLabsAgentProps {
  initialPrompt?: string
  voiceId?: string
  className?: string
}

export function ElevenLabsAgent({
  initialPrompt = "Hi, I'm Neil's AI assistant. How can I help you today?",
  voiceId = "pNInz6obpgDQGcFmaJgB",
  className = "",
}: ElevenLabsAgentProps) {
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [audioSrc, setAudioSrc] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Generate initial greeting on component mount
  useEffect(() => {
    if (initialPrompt) {
      handleInitialGreeting()
    }
  }, [initialPrompt])

  const handleInitialGreeting = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      const result = await generateSpeech(initialPrompt, voiceId)

      if (result.success && result.audioBase64) {
        const audioDataUrl = `data:audio/mpeg;base64,${result.audioBase64}`
        setAudioSrc(audioDataUrl)
      } else {
        setError(result.error || "Failed to generate speech")
      }
    } catch (err) {
      setError("An unexpected error occurred")
      console.error(err)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!prompt.trim() || isGenerating) return

    setIsGenerating(true)
    setError(null)

    try {
      const result = await generateSpeech(prompt, voiceId)

      if (result.success && result.audioBase64) {
        const audioDataUrl = `data:audio/mpeg;base64,${result.audioBase64}`
        setAudioSrc(audioDataUrl)
        setPrompt("")
      } else {
        setError(result.error || "Failed to generate speech")
      }
    } catch (err) {
      setError("An unexpected error occurred")
      console.error(err)
    } finally {
      setIsGenerating(false)
    }
  }

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
    }
  }

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleAudioPlay = () => {
    setIsPlaying(true)
  }

  const handleAudioPause = () => {
    setIsPlaying(false)
  }

  const handleAudioEnded = () => {
    setIsPlaying(false)
  }

  return (
    <div className={`rounded-lg bg-white text-black ${className}`}>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Mic className="h-5 w-5 text-[#5e7fff]" />
            <h3 className="text-lg font-semibold">Neil's AI Assistant</h3>
          </div>

          {audioSrc && (
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePlayPause}
                disabled={isGenerating}
                className="text-gray-600 hover:text-black hover:bg-gray-100"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                disabled={isGenerating}
                className="text-gray-600 hover:text-black hover:bg-gray-100"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
            </div>
          )}
        </div>

        {error && <div className="text-sm text-red-400 p-2 bg-zinc-900 rounded">{error}</div>}

        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask me anything..."
            disabled={isGenerating}
            className="flex-1 bg-white border-[#e6e6e6] text-black placeholder:text-gray-400 focus:border-[#5e7fff] focus:ring-[#5e7fff]"
          />
          <Button
            type="submit"
            disabled={isGenerating || !prompt.trim()}
            className="bg-[#f1f1f1] hover:bg-gray-200 text-black"
          >
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Speak"}
          </Button>
        </form>

        {audioSrc && (
          <audio
            ref={audioRef}
            src={audioSrc}
            onPlay={handleAudioPlay}
            onPause={handleAudioPause}
            onEnded={handleAudioEnded}
            className="hidden"
          />
        )}

        {isGenerating && (
          <div className="flex justify-center items-center py-2">
            <Loader2 className="h-6 w-6 animate-spin text-[#5e7fff]" />
            <span className="ml-2 text-sm text-gray-500">Generating audio...</span>
          </div>
        )}
      </div>
    </div>
  )
}
