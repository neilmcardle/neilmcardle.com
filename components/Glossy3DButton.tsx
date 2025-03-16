"use client"

import type { ReactNode } from "react"
import Link from "next/link"

interface Glossy3DButtonProps {
  href: string
  children: ReactNode
  className?: string
  external?: boolean
}

export function Glossy3DButton({ href, children, className = "", external = false }: Glossy3DButtonProps) {
  const buttonStyle = {
    boxShadow:
      "0 10px 25px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.2)",
    background: "linear-gradient(to bottom, #333333, #000000)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
  }

  const linkProps = external ? { target: "_blank", rel: "noopener noreferrer" } : {}

  return (
    <Link
      href={href}
      {...linkProps}
      className={`relative inline-flex items-center justify-center px-8 py-4 rounded-full bg-black text-white font-medium transition-all duration-200 overflow-hidden group ${className}`}
      style={buttonStyle}
    >
      {/* Top gradient shine */}
      <span className="absolute inset-0 w-full h-full bg-gradient-to-b from-white/20 to-transparent opacity-50 group-hover:opacity-70 transition-opacity"></span>
      <span className="absolute inset-0 w-full h-[40%] bg-gradient-to-b from-white/30 to-transparent"></span>

      {/* Single horizontal shine effect that moves on hover */}
      <span className="absolute inset-y-0 left-[-100%] w-[35%] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-100 group-hover:translate-x-[250%] transition-transform duration-1500 ease-in-out"></span>

      {/* Content with z-index to stay above effects */}
      <span className="relative z-10 flex items-center">{children}</span>
    </Link>
  )
}
