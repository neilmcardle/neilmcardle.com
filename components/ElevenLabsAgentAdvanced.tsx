"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mic, Play, Pause, Volume2, VolumeX, Loader2, Settings, X, ChevronDown, Check } from "lucide-react"
import { generateSpeech, getVoices } from "@/app/api/elevenlabs/actions"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"

interface Voice {
  voice_id: string
  name: string
}

interface ElevenLabsAgentAdvancedProps {
  initialPrompt?: string
  defaultVoiceId?: string
  className?: string
}

export function ElevenLabsAgentAdvanced({
  initialPrompt = "Hi, I'm Neil's AI assistant. How can I help you today?",
  defaultVoiceId = "pNInz6obpgDQGcFmaJgB",
  className = "",
}: ElevenLabsAgentAdvancedProps) {
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [audioSrc, setAudioSrc] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [voices, setVoices] = useState<Voice[]>([])
  const [selectedVoiceId, setSelectedVoiceId] = useState(defaultVoiceId)
  const [selectedVoiceName, setSelectedVoiceName] = useState("Default Voice")
  const [volume, setVolume] = useState(1)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Fetch available voices on component mount
  useEffect(() => {
    async function fetchVoices() {
      const result = await getVoices()
      if (result.success && result.voices) {
        setVoices(result.voices)

        // Set the name of the default voice
        const defaultVoice = result.voices.find((v) => v.voice_id === defaultVoiceId)
        if (defaultVoice) {
          setSelectedVoiceName(defaultVoice.name)
        }
      }
    }

    fetchVoices()
  }, [defaultVoiceId])

  // Generate initial greeting on component mount
  useEffect(() => {
    if (initialPrompt) {
      handleInitialGreeting()
    }
  }, [initialPrompt])

  // Update audio volume when volume state changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  const handleInitialGreeting = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      const result = await generateSpeech(initialPrompt, selectedVoiceId)

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
      const result = await generateSpeech(prompt, selectedVoiceId)

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

  const handleVoiceSelect = (voiceId: string, voiceName: string) => {
    setSelectedVoiceId(voiceId)
    setSelectedVoiceName(voiceName)
  }

  if (isMinimized) {
    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <Button
          onClick={() => setIsMinimized(false)}
          className="rounded-full h-12 w-12 bg-blue-500 hover:bg-blue-600 text-white shadow-lg"
        >
          <Mic className="h-6 w-6" />
        </Button>
      </div>
    )
  }

  return (
    <div className={`rounded-lg bg-white text-black ${className}`}>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Mic className="h-5 w-5 text-[#5e7fff]" />
            <h3 className="text-lg font-semibold">Neil's AI Assistant</h3>
          </div>

          <div className="flex items-center space-x-1">
            {audioSrc && (
              <>
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
              </>
            )}

            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-600 hover:text-black hover:bg-gray-100">
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white border border-[#e6e6e6] text-black">
                <DialogHeader>
                  <DialogTitle>Voice Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Select Voice</Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between bg-white border-[#e6e6e6] text-black hover:bg-gray-50"
                        >
                          {selectedVoiceName}
                          <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-full max-h-[300px] overflow-auto bg-white border-[#e6e6e6] text-black">
                        {voices.map((voice) => (
                          <DropdownMenuItem
                            key={voice.voice_id}
                            onClick={() => handleVoiceSelect(voice.voice_id, voice.name)}
                            className="flex items-center justify-between hover:bg-gray-50"
                          >
                            {voice.name}
                            {voice.voice_id === selectedVoiceId && <Check className="h-4 w-4 text-[#5e7fff]" />}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-zinc-300">Volume</Label>
                      <span className="text-sm text-zinc-400">{Math.round(volume * 100)}%</span>
                    </div>
                    <Slider
                      value={[volume * 100]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={(value) => setVolume(value[0] / 100)}
                      className="[&>span]:bg-[#5e7fff]"
                    />
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMinimized(true)}
              className="text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
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
