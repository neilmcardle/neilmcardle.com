import Image from "next/image"
import type React from "react"

interface BetterThingsIconProps extends React.HTMLAttributes<HTMLImageElement> {
  className?: string
  width?: number
  height?: number
}

export function BetterThingsIcon({ className = "", width = 24, height = 24, ...props }: BetterThingsIconProps) {
  return (
    <Image
      src="/images/BetterThings-Logo.svg"
      alt="Better Things Logo"
      width={width}
      height={height}
      className={className}
      {...props}
    />
  )
}

