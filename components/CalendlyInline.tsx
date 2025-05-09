"use client"

import type React from "react"

import { useEffect } from "react"
import Script from "next/script"

interface CalendlyInlineProps {
  url?: string
  style?: React.CSSProperties
  className?: string
}

export function CalendlyInline({
  url = "https://calendly.com/neilmcardlemail?hide_landing_page_details=1&hide_gdpr_banner=1&background_color=1a1a1a&text_color=ffffff&primary_color=d4b86a",
  style = { minWidth: "320px", height: "700px" },
  className = "",
}: CalendlyInlineProps) {
  useEffect(() => {
    // This will re-initialize the widget if needed
    if ((window as any).Calendly && document.querySelector(".calendly-inline-widget")) {
      ;(window as any).Calendly.initInlineWidget({
        url,
        parentElement: document.querySelector(".calendly-inline-widget"),
      })
    }
  }, [url])

  return (
    <>
      <Script src="https://assets.calendly.com/assets/external/widget.js" strategy="lazyOnload" />
      <div className={`calendly-inline-widget ${className}`} data-url={url} style={style}></div>
    </>
  )
}
