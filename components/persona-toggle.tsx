"use client"

import { usePersona } from "@/contexts/persona-context"
import { MouseIcon } from "./MouseIcon"
import { FrameIcon } from "./FrameIcon"
import { useEffect, useRef, useState } from "react"

export function PersonaToggle() {
  const { persona, setPersona } = usePersona()
  const containerRef = useRef<HTMLDivElement>(null)
  const digitalRef = useRef<HTMLButtonElement>(null)
  const traditionalRef = useRef<HTMLButtonElement>(null)
  const [highlightStyle, setHighlightStyle] = useState({
    width: 0,
    left: 0,
  })

  // Extra padding for the highlight pill (in pixels)
  const EXTRA_PADDING = 8

  // Update highlight position when persona changes or on initial render
  useEffect(() => {
    const updateHighlight = () => {
      if (!containerRef.current) return

      const activeTab = persona === "digital" ? digitalRef.current : traditionalRef.current
      if (!activeTab) return

      const containerLeft = containerRef.current.getBoundingClientRect().left
      const activeLeft = activeTab.getBoundingClientRect().left
      const activeWidth = activeTab.offsetWidth

      setHighlightStyle({
        width: activeWidth + EXTRA_PADDING, // Add extra padding to width
        left: activeLeft - containerLeft - EXTRA_PADDING / 2, // Adjust position to center the highlight
      })
    }

    // Run on initial render and when persona changes
    updateHighlight()

    // Also run on window resize to ensure correct positioning
    window.addEventListener("resize", updateHighlight)
    return () => window.removeEventListener("resize", updateHighlight)
  }, [persona])

  return (
    <div
      ref={containerRef}
      className="inline-flex relative bg-gray-100 rounded-full p-1 shadow-inner"
      style={{ boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.1)" }}
    >
      {/* Animated highlight pill with extra padding */}
      <div
        className="absolute rounded-full bg-black z-0 transition-all duration-300 ease-in-out"
        style={{
          width: `${highlightStyle.width}px`,
          height: "calc(100% - 2px)",
          top: "1px",
          left: `${highlightStyle.left}px`,
        }}
      />

      {/* Digital tab */}
      <button
        ref={digitalRef}
        onClick={() => setPersona("digital")}
        className={`relative z-10 flex items-center justify-center px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${
          persona === "digital" ? "text-white" : "text-gray-500 hover:text-gray-700"
        }`}
        aria-current={persona === "digital" ? "page" : undefined}
      >
        <MouseIcon className="w-4 h-4 mr-2" />
        <span>Digital</span>
      </button>

      {/* Traditional tab */}
      <button
        ref={traditionalRef}
        onClick={() => setPersona("traditional")}
        className={`relative z-10 flex items-center justify-center px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${
          persona === "traditional" ? "text-white" : "text-gray-500 hover:text-gray-700"
        }`}
        aria-current={persona === "traditional" ? "page" : undefined}
      >
        <FrameIcon className="w-4 h-4 mr-2" />
        <span>Traditional</span>
      </button>
    </div>
  )
}
