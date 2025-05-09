"use client"

import type React from "react"

import { useEffect } from "react"
import Script from "next/script"

interface CalendlyEmbedProps {
  url?: string
  style?: React.CSSProperties
  className?: string
  prefill?: {
    name?: string
    email?: string
    customAnswers?: {
      [key: string]: string
    }
  }
}

export function CalendlyEmbed({
  url = "https://calendly.com/neilmcardlemail?hide_landing_page_details=1&hide_gdpr_banner=1&background_color=1a1a1a&text_color=ffffff&primary_color=d4b86a",
  style = { minWidth: "320px", height: "630px" },
  className = "",
  prefill,
}: CalendlyEmbedProps) {
  useEffect(() => {
    // Initialize Calendly when the component mounts
    if ((window as any).Calendly) {
      ;(window as any).Calendly.initInlineWidget({
        url,
        parentElement: document.getElementById("calendly-embed"),
        prefill,
      })
    }
  }, [url, prefill])

  return (
    <>
      <Script src="https://assets.calendly.com/assets/external/widget.js" strategy="lazyOnload" />
      <div
        id="calendly-embed"
        className={`calendly-inline-widget ${className}`}
        style={style}
        data-auto-load="false"
      ></div>
    </>
  )
}
