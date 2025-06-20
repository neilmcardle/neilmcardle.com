"use client"

import { useEffect } from "react"

export function VideoAutoplayHelper() {
  useEffect(() => {
    // Function to enable sound on user interaction
    const enableSound = () => {
      const videos = document.querySelectorAll("video")
      videos.forEach((video) => {
        if (video.muted) {
          video.muted = false
        }

        // Remove the event listeners after first interaction
        document.removeEventListener("click", enableSound)
        document.removeEventListener("touchstart", enableSound)
        document.removeEventListener("keydown", enableSound)
      })
    }

    // Add event listeners for user interaction
    document.addEventListener("click", enableSound)
    document.addEventListener("touchstart", enableSound)
    document.addEventListener("keydown", enableSound)

    // Clean up
    return () => {
      document.removeEventListener("click", enableSound)
      document.removeEventListener("touchstart", enableSound)
      document.removeEventListener("keydown", enableSound)
    }
  }, [])

  return null
}
