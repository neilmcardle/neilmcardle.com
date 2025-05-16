"use client"
import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { ExternalLink, Mail, ChevronRight, Eye, EyeOff } from "lucide-react"
import { PersonaToggle } from "@/components/persona-toggle"
import { usePersona } from "@/contexts/persona-context"
import { cn } from "@/lib/utils"
import { NMLogoIcon } from "@/components/NMLogoIcon"
import { LinkedInIcon } from "@/components/LinkedInIcon"
import { MediumIcon } from "@/components/MediumIcon"

// Custom X icon
const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M12.6 2h1.9L9.7 7.6l5.7 6.4h-4.2l-3.5-3.9-4 3.9H1.8l5.2-6-5.4-6h4.3l3.2 3.6L12.6 2zm-1.7 12.1h1.1L5.3 3.8H4.1l6.8 10.3z" />
  </svg>
)

export default function Home() {
  // Animation states
  const [isLoaded, setIsLoaded] = useState(false)
  const { persona } = usePersona()
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [shouldScroll, setShouldScroll] = useState(false)
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)
  const [isEmailVisible, setIsEmailVisible] = useState(false)
  const [videoDuration, setVideoDuration] = useState(0)
  const [hasInteracted, setHasInteracted] = useState(false)

  useEffect(() => {
    // Set isLoaded to true after a short delay to ensure components are mounted
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 100)

    // Add interaction detection
    const handleInteraction = () => {
      console.log("User interaction detected")
      setHasInteracted(true)
    }

    window.addEventListener("click", handleInteraction)
    window.addEventListener("touchstart", handleInteraction)
    window.addEventListener("keydown", handleInteraction)

    return () => {
      clearTimeout(timer)
      window.removeEventListener("click", handleInteraction)
      window.removeEventListener("touchstart", handleInteraction)
      window.removeEventListener("keydown", handleInteraction)
    }
  }, [])

  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current) {
        const containerHeight = containerRef.current.scrollHeight
        const windowHeight = window.innerHeight
        setShouldScroll(containerHeight > windowHeight)
      }
    }

    // Check on initial load and whenever the window is resized
    checkOverflow()
    window.addEventListener("resize", checkOverflow)

    // Also check after a short delay to ensure all content is rendered
    const timer = setTimeout(checkOverflow, 500)

    return () => {
      window.removeEventListener("resize", checkOverflow)
      clearTimeout(timer)
    }
  }, [persona]) // Re-check when persona changes

  // Handle video looping
  useEffect(() => {
    const video = videoRef.current
    if (!video || !isVideoLoaded) return

    // Store the original duration
    setVideoDuration(video.duration)

    // Calculate playback rate to make the video last 10 seconds
    // Only calculate if we have a valid duration
    if (video.duration > 0) {
      const targetDuration = 10 // seconds
      const newPlaybackRate = video.duration / targetDuration

      // Set playback rate to make video play over 10 seconds
      video.playbackRate = newPlaybackRate

      console.log(`Video original duration: ${video.duration}s, Playback rate: ${newPlaybackRate}`)
    } else {
      // Fallback if duration is not available
      video.playbackRate = 0.2 // Very slow default
    }

    // Mute the video (we'll use separate audio)
    video.muted = true

    // Start playing
    video.play().catch((error) => {
      console.error("Error playing video:", error)
    })

    // Handle the loop transition to avoid jittering
    const handleTimeUpdate = () => {
      // If we're near the end of the video, start crossfade
      if (video.currentTime > video.duration - 0.5) {
        video.style.opacity = String(Math.max(0, (video.duration - video.currentTime) * 2))
      } else if (video.currentTime < 0.5) {
        // If we're at the beginning, fade in
        video.style.opacity = String(Math.min(1, video.currentTime * 2))
      } else {
        video.style.opacity = "1"
      }
    }

    // When the video ends, reset to beginning with a smooth transition
    const handleEnded = () => {
      // Reset to beginning
      video.currentTime = 0
      video.play()
    }

    // Get duration once it's available
    const handleLoadedMetadata = () => {
      if (video.duration > 0) {
        setVideoDuration(video.duration)
        const targetDuration = 10 // seconds
        const newPlaybackRate = video.duration / targetDuration
        video.playbackRate = newPlaybackRate
        console.log(`Video duration updated: ${video.duration}s, New playback rate: ${newPlaybackRate}`)
      }
    }

    video.addEventListener("timeupdate", handleTimeUpdate)
    video.addEventListener("ended", handleEnded)
    video.addEventListener("loadedmetadata", handleLoadedMetadata)

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate)
      video.removeEventListener("ended", handleEnded)
      video.removeEventListener("loadedmetadata", handleLoadedMetadata)
    }
  }, [isVideoLoaded])

  // Toggle email visibility
  const toggleEmailVisibility = () => {
    setIsEmailVisible(!isEmailVisible)
  }

  // List of products
  const products = [
    { name: "makeEbook", href: "/make-ebook" },
    { name: "Waves", href: "https://wavesapp.vercel.app/" },
    { name: "Vector Paint", href: "https://vectorpaint.vercel.app" },
  ]

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex flex-col items-center min-h-screen px-4 relative",
        shouldScroll ? "overflow-auto" : "overflow-hidden",
      )}
    >
      {/* Background with styling based on persona */}
      <div
        className={cn(
          "fixed inset-0 z-[-1] transition-all duration-700",
          persona === "digital" ? "bg-white" : "bg-gray-100",
        )}
      ></div>

      <div className="w-full max-w-6xl mx-auto relative z-[15] flex flex-col justify-center h-full py-8">
        {/* Simplified Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex flex-col items-center gap-4">
            <NMLogoIcon className={persona === "digital" ? "text-black w-10 h-10" : "text-white w-10 h-10"} />
            <PersonaToggle />
          </div>
        </div>

        {/* Main Content */}
        <section
          className={`transition-all duration-1000 ease-out transform ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
        >
          {persona === "digital" ? (
            // Digital Mode - Business Card Layout
            <div className="flex flex-col items-center w-full">
              {/* Business Card with updated border to match traditional card */}
              <div
                className="relative w-full max-w-md mx-auto rounded-sm shadow-xl"
                style={{
                  background: "linear-gradient(to bottom, #444, #222)",
                  padding: "16px",
                }}
              >
                {/* Card Content with Background */}
                <div className="relative overflow-hidden rounded-sm">
                  {/* Video Background */}
                  <div className="absolute inset-0 overflow-hidden">
                    {/* Video with blur effect */}
                    <video
                      ref={videoRef}
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover transition-opacity duration-1000"
                      style={{
                        filter: "blur(8px)",
                        transform: "scale(1.1)", // Slightly scale up to avoid blur edges
                        willChange: "opacity",
                      }}
                      onLoadedData={() => setIsVideoLoaded(true)}
                    >
                      <source src="/bird-loop.mp4" type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>

                    {/* Texture overlay */}
                    <div
                      className="absolute inset-0 z-[1]"
                      style={{
                        backgroundImage:
                          'url("data:image/png;base64,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")',
                        opacity: 0.15,
                        mixBlendMode: "overlay",
                      }}
                    ></div>

                    {/* Semi-transparent overlay to ensure text readability */}
                    <div className="absolute inset-0 bg-black bg-opacity-50 z-[2]"></div>
                  </div>

                  {/* Card Content */}
                  <div className="flex flex-col justify-between h-full p-6 text-white space-y-4 relative z-[5]">
                    {/* Top Section - Logo and Name */}
                    <div>
                      <h1 className="text-xl font-bold text-white mb-1">Neil McArdle</h1>
                    </div>

                    {/* Middle Section - Brief Description */}
                    <div className="mt-0">
                      <p className="text-sm text-gray-300 max-w-xs -mt-2">
                        Creating elegant digital experiences through clean, purposeful code.
                      </p>
                    </div>

                    {/* Products Section */}
                    <div className="mb-3">
                      <h3 className="text-xs uppercase text-gray-400 mb-2 font-medium tracking-wider">Products</h3>
                      <div className="flex flex-col gap-1">
                        {products.map((product, index) => (
                          <Link
                            key={index}
                            href={product.href}
                            className="text-sm text-gray-300 hover:text-white transition-colors py-1 flex items-center justify-between"
                            target={product.href.startsWith("http") ? "_blank" : undefined}
                            rel={product.href.startsWith("http") ? "noopener noreferrer" : undefined}
                          >
                            <span>{product.name}</span>
                            <ChevronRight className="w-3 h-3 text-gray-400" />
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Section - Contact and Links */}
                    <div className="flex flex-col gap-3 mt-auto pt-3">
                      {/* Contact Section */}
                      <div>
                        <h3 className="text-xs uppercase text-gray-400 mb-2 font-medium tracking-wider">Contact</h3>
                        {/* Email with reveal/conceal functionality */}
                        <div className="flex items-center text-sm text-white rounded-md">
                          <Mail className="w-4 h-4 mr-2 text-white" />
                          <span className="flex-1">
                            {isEmailVisible ? (
                              "neil@neilmcardle.com"
                            ) : (
                              <span className="text-gray-500">Click to reveal email</span>
                            )}
                          </span>
                          <button
                            onClick={toggleEmailVisibility}
                            className="ml-2 p-1 rounded-full hover:bg-gray-800 transition-colors"
                            aria-label={isEmailVisible ? "Hide email" : "Show email"}
                          >
                            {isEmailVisible ? (
                              <EyeOff className="w-4 h-4 text-gray-400" />
                            ) : (
                              <Eye className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>
                      {/* Social Links */}
                      <div className="mt-2">
                        <h3 className="text-xs uppercase text-gray-400 mb-2 font-medium tracking-wider">
                          Read my mind
                        </h3>
                        <div className="flex items-center gap-6">
                          <Link
                            href="https://www.linkedin.com/in/neilmcardle/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white hover:text-gray-300 transition-colors"
                          >
                            <LinkedInIcon className="w-4 h-4" />
                          </Link>
                          <Link
                            href="https://x.com/betterneil"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white hover:text-gray-300 transition-colors"
                          >
                            <XIcon />
                          </Link>
                          <Link
                            href="https://medium.com/@BetterNeil"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white hover:text-gray-300 transition-colors"
                          >
                            <MediumIcon className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>

                      {/* Design Agency Link - Moved to bottom */}
                      <Link
                        href="https://www.betterthings.design"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-white hover:text-gray-300 transition-colors mt-2 underline"
                      >
                        <span>Looking for my design agency?</span>
                        <ExternalLink className="w-3 h-3 ml-1 text-gray-400" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information Below Card - Moved to a separate div with margin-top */}
            </div>
          ) : (
            // Traditional Mode Layout with Painting
            <div className="flex flex-col items-center w-full">
              <div className="relative w-full max-w-md mx-auto flex flex-col items-center">
                {/* Dark Grey Gradient Frame */}
                <div
                  className="rounded-sm shadow-xl mx-auto"
                  style={{
                    background: "linear-gradient(to bottom, #444, #222)",
                    padding: "16px",
                  }}
                >
                  {/* Painting - Removed border and centered */}
                  <div className="relative bg-white flex justify-center">
                    <Image
                      src="/bonsai-painting.png"
                      alt="From the Tree - Oil Painting by Neil McArdle"
                      width={400}
                      height={500}
                      className="object-contain"
                    />
                  </div>
                </div>

                {/* Painting Information */}
                <div className="absolute -bottom-24 left-0 right-0">
                  <div className="space-y-1 text-center">
                    <h3 className="font-serif font-medium text-gray-900">From the Tree</h3>
                    <p className="text-sm text-gray-700 font-serif">Oil on board, 9 W x 12 H x 1 D in</p>
                    <div className="flex justify-center items-center gap-2 mt-1">
                      <span className="text-sm font-serif text-gray-900">£1,200</span>
                      <span className="text-xs text-gray-500">|</span>
                      <Link
                        href="https://www.greengallery.space/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-sm text-green-700 font-serif underline"
                      >
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></div>
                        Available at Green Gallery
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="ml-1 h-3 w-3 text-green-600"
                        >
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Social Links for Traditional View */}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
