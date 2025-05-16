"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Mail, Sun, Moon, Volume2, VolumeX } from "lucide-react"
import { NMLogoIcon } from "@/components/NMLogoIcon"

export default function ImmersivePage() {
  const [isMuted, setIsMuted] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [email, setEmail] = useState("")
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Toggle sound
  const toggleSound = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted
      setIsMuted(!isMuted)
    }
  }

  // Toggle dark/light mode
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle the email submission logic here
    alert(`Thank you! ${email} has been added to the waitlist.`)
    setEmail("")
  }

  useEffect(() => {
    // Set isLoaded to true after a short delay to ensure components are mounted
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 500)

    return () => {
      clearTimeout(timer)
    }
  }, [])

  return (
    <div
      className={`min-h-screen w-full flex items-center justify-center p-4 relative ${
        isDarkMode ? "text-white" : "text-black"
      }`}
    >
      {/* Video Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute inset-0 ${isDarkMode ? "bg-black/30" : "bg-white/10"} z-10`}></div>
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className={`w-full h-full object-cover ${isLoaded ? "opacity-100" : "opacity-0"} transition-opacity duration-1000`}
        >
          <source src="/bird-loop.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Main Container with Border Radius */}
      <div className="w-full h-full fixed inset-0 p-4 flex items-center justify-center">
        <div
          className={`w-full h-full rounded-3xl border-2 ${
            isDarkMode ? "border-white/20" : "border-black/10"
          } overflow-hidden relative flex flex-col items-center justify-between p-8`}
        >
          {/* Top Navigation */}
          <div className="w-full flex justify-between items-center z-20">
            <Link href="/" className="rounded-full p-2 bg-white/10 backdrop-blur-md">
              <NMLogoIcon className="w-6 h-6" />
            </Link>
            <div className="text-sm font-light">人間が作ったもの</div>
            <button
              onClick={toggleTheme}
              className="rounded-full p-2 bg-white/10 backdrop-blur-md"
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>

          {/* Center Content */}
          <div
            className={`flex flex-col items-center justify-center space-y-4 z-20 transition-all duration-700 ${
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <div className="text-5xl md:text-7xl font-light tracking-wide flex items-center">
              Neil McArdle
              <div className="flex items-center ml-2">
                <span className="inline-block rounded-full bg-white/20 p-1 mx-0.5">
                  <NMLogoIcon className="w-5 h-5 md:w-6 md:h-6" />
                </span>
                <span className="inline-block rounded-full bg-white/20 p-1 mx-0.5">
                  <span className="text-sm">☺</span>
                </span>
                <span className="inline-block rounded-full bg-white/20 p-1 mx-0.5">
                  <span className="text-sm">✴</span>
                </span>
              </div>
            </div>
            <div className="flex items-center text-sm font-light">
              <span className="mr-1">✦</span>
              <span className="mr-1">$</span>
              <span className="italic">Creative Developer.</span>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="w-full flex flex-col md:flex-row justify-between items-center z-20">
            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              className="rounded-full p-2 bg-white/10 backdrop-blur-md mb-4 md:mb-0"
              aria-label={isMuted ? "Unmute background" : "Mute background"}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>

            {/* Email Form */}
            <div
              className={`transition-all duration-700 delay-300 ${
                isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
            >
              <div className="text-sm mb-2 text-center md:text-left">Get notified when the portfolio drops.</div>
              <form onSubmit={handleSubmit} className="flex">
                <div className="relative flex-grow">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full px-4 py-2 pr-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                  <button
                    type="submit"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 rounded-full p-1.5 bg-red-500"
                    aria-label="Submit"
                  >
                    <Mail className="w-4 h-4 text-white" />
                  </button>
                </div>
                <button
                  type="submit"
                  className="ml-2 px-4 py-2 rounded-full bg-black text-white hover:bg-gray-800 transition-colors"
                >
                  Notify me
                </button>
              </form>
            </div>

            {/* Coming Soon */}
            <div
              className={`text-sm font-light hidden md:block transition-all duration-700 delay-500 ${
                isLoaded ? "opacity-100" : "opacity-0"
              }`}
            >
              coming soon
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
