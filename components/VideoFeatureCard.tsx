"use client"

import { useState, useRef, useEffect } from "react"
import { FigmaIcon } from "./FigmaIcon"
import { Lock } from "lucide-react"
import Link from "next/link"

interface VideoFeatureCardProps {
  videoUrl: string
  title: string
  name: string
  description: string
  ctaText: string
  ctaLink: string
  className?: string
}

export function VideoFeatureCard({
  videoUrl = "https://storage.googleapis.com/web-dev-assets/video-and-source-tags/chrome.mp4",
  title = "Design Engineer",
  name = "Neil McArdle",
  description = "Elegant designs realised through clean, purposeful code.",
  ctaText = "Access Figma Portfolio",
  ctaLink = "https://www.figma.com/proto/zZcc3Li72GhWFVpv1PxC0O/%F0%9F%91%A8%F0%9F%8F%BC%E2%80%8D%F0%9F%9A%80--Neil-McArdle?page-id=7947%3A56485&node-id=7947-56486&viewport=119%2C809%2C0.29&t=9uLN4opTMa6jNFaW-1&scaling=min-zoom&content-scaling=fixed&starting-point-node-id=7947%3A56486",
  className = "",
}: VideoFeatureCardProps) {
  const [isPlaying, setIsPlaying] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  useEffect(() => {
    const videoElement = videoRef.current
    if (videoElement) {
      // Try to play the video when component mounts
      videoElement.play().catch((error) => {
        console.log("Auto-play was prevented:", error)
        setIsPlaying(false)
      })

      const handleEnded = () => setIsPlaying(false)
      videoElement.addEventListener("ended", handleEnded)

      return () => {
        videoElement.removeEventListener("ended", handleEnded)
      }
    }
  }, [])

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
      <div className="p-6 pb-0">
        {/* Pre-title */}
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-gray-100 text-gray-600 text-sm font-medium mb-4">
          {title}
        </div>

        {/* Main headline */}
        <h2 className="text-3xl font-bold tracking-tight mb-3">{name}</h2>

        {/* Subtitle */}
        <p className="text-lg text-gray-500 mb-6">{description}</p>
      </div>

      {/* Video section */}
      <div className="relative aspect-video bg-black cursor-pointer" onClick={togglePlay}>
        <video ref={videoRef} src={videoUrl} className="w-full h-full object-contain" playsInline muted loop autoPlay />
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white"
              >
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* CTA section */}
      <div className="p-6 pt-4">
        <Link
          href={ctaLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-black text-white font-medium transition-all duration-200 hover:bg-gray-800"
        >
          <FigmaIcon variant="color" className="w-5 h-5 mr-2" />
          {ctaText}
          <Lock className="w-4 h-4 ml-2" />
        </Link>
      </div>
    </div>
  )
}
