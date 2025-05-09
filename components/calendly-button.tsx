"use client"

import type React from "react"

import { useEffect } from "react"
import Script from "next/script"

interface CalendlyButtonProps {
  text?: string
  className?: string
}

export function CalendlyButton({ text = "Schedule Consultation", className = "" }: CalendlyButtonProps) {
  useEffect(() => {
    // This ensures Calendly is defined when the component mounts
    return () => {
      // Clean up if needed
    }
  }, [])

  const openCalendly = (e: React.MouseEvent) => {
    e.preventDefault()
    if ((window as any).Calendly) {
      ;(window as any).Calendly.initPopupWidget({
        url: "https://calendly.com/neilmcardlemail?hide_landing_page_details=1&hide_gdpr_banner=1&background_color=1a1a1a&text_color=ffffff&primary_color=d4b86a",
      })
    }
    return false
  }

  return (
    <>
      <Script src="https://assets.calendly.com/assets/external/widget.js" strategy="lazyOnload" />
      <link href="https://assets.calendly.com/assets/external/widget.css" rel="stylesheet" />
      <a href="#" onClick={openCalendly} className={className}>
        {text}
      </a>
    </>
  )
}
