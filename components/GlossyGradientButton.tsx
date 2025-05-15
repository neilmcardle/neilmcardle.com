"use client"

import { type ReactNode, useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface GlossyGradientButtonProps {
  href?: string
  onClick?: () => void
  children: ReactNode
  className?: string
  external?: boolean
  type?: "button" | "submit" | "reset"
}

export function GlossyGradientButton({
  href,
  onClick,
  children,
  className = "",
  external = false,
  type = "button",
}: GlossyGradientButtonProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isActive, setIsActive] = useState(false)

  const linkProps = external ? { target: "_blank", rel: "noopener noreferrer" } : {}

  const buttonContent = (
    <div
      className={cn("button-wrap relative z-10 rounded-full pointer-events-none", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setIsActive(false)
      }}
      onMouseDown={() => setIsActive(true)}
      onMouseUp={() => setIsActive(false)}
      onTouchStart={() => setIsActive(true)}
      onTouchEnd={() => setIsActive(false)}
    >
      <button
        type={type}
        onClick={onClick}
        className={cn(
          "relative z-[3] cursor-pointer pointer-events-auto rounded-full overflow-hidden",
          "bg-white", // Solid white background
          "shadow-[0_4px_10px_rgba(0,0,0,0.1),inset_0_0_0_1px_rgba(255,255,255,0.2)]",
          "transition-all duration-500 ease-out transform",
          isHovered && "shadow-[0_6px_20px_rgba(0,0,0,0.15),inset_0_0_0_1px_rgba(255,255,255,0.3)]",
          isActive && "shadow-[0_2px_5px_rgba(0,0,0,0.1),inset_0_0_0_1px_rgba(255,255,255,0.25)] translate-y-[1px]",
        )}
      >
        {/* Subtle gradient overlay that shifts on hover */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br from-white/30 via-white/10 to-transparent opacity-80",
            "transition-opacity duration-500 ease-out",
            isHovered && "opacity-100",
          )}
        />

        {/* Top highlight */}
        <div
          className={cn(
            "absolute top-0 left-0 right-0 h-[1px] bg-white/50",
            "transition-all duration-500 ease-out",
            isHovered && "bg-white/70",
          )}
        />

        {/* Moving shine effect */}
        <div
          className={cn(
            "absolute inset-0 opacity-0",
            "bg-gradient-to-r from-transparent via-white/20 to-transparent",
            "translate-x-[-100%] skew-x-[-20deg]",
            "transition-opacity duration-300 ease-out",
            isHovered && "opacity-100 animate-shine",
          )}
        />

        {/* Button content */}
        <span
          className={cn(
            "relative flex items-center justify-center gap-2",
            "px-6 py-3.5 font-medium text-gray-800",
            "transition-all duration-500 ease-out",
            isHovered && "text-black",
            isActive && "transform scale-[0.98]",
          )}
        >
          {children}
        </span>
      </button>

      {/* Subtle shadow beneath the button */}
      <div
        className={cn(
          "absolute -inset-1 rounded-full bg-black/5 blur-md -z-10",
          "transition-all duration-500 ease-out",
          isHovered && "bg-black/10 blur-lg scale-[1.02]",
          isActive && "bg-black/5 blur-sm scale-[0.99]",
        )}
      />
    </div>
  )

  if (href) {
    return (
      <Link href={href} {...linkProps} className="inline-block">
        {buttonContent}
      </Link>
    )
  }

  return buttonContent
}
