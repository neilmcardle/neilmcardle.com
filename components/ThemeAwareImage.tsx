"use client"

import Image from 'next/image'
import { useTheme } from '@/lib/contexts/ThemeContext'

interface ThemeAwareImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  style?: React.CSSProperties
  onClick?: () => void
}

/**
 * ThemeAwareImage component that automatically switches to dark mode variants
 * when they exist in the public folder.
 * 
 * Dark mode variants should be named with 'dark-' prefix:
 * - Light mode: /icon.svg
 * - Dark mode: /dark-icon.svg
 * 
 * If no dark variant exists, the component falls back to the original image.
 */
export function ThemeAwareImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  style,
  onClick,
}: ThemeAwareImageProps) {
  const { theme } = useTheme()

  // Determine if we should use the dark variant
  const getImageSrc = () => {
    if (theme !== 'dark') {
      return src
    }

    // Extract the filename from the path
    const parts = src.split('/')
    const filename = parts[parts.length - 1]
    
    // Check if a dark variant name would exist
    const darkFilename = `dark-${filename}`
    const darkSrc = parts.slice(0, -1).concat(darkFilename).join('/')
    
    // If the original already has 'dark-' prefix, use it as-is
    if (filename.startsWith('dark-')) {
      return src
    }
    
    // Return dark variant path
    // The component will attempt to load it, and if it fails, Next.js Image will handle it
    return darkSrc
  }

  const imageSrc = getImageSrc()

  return (
    <Image
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      style={style}
      onClick={onClick}
      onError={(e) => {
        // If dark variant fails to load, fall back to original
        if (theme === 'dark' && imageSrc !== src) {
          const target = e.target as HTMLImageElement
          target.src = src
        }
      }}
    />
  )
}
