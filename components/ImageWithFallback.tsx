"use client"

import { useState } from "react"
import Image, { type ImageProps } from "next/image"

interface ImageWithFallbackProps extends ImageProps {
  fallbackSrc?: string
}

export default function ImageWithFallback({
  src,
  fallbackSrc = "/abstract-colorful-painting.png",
  alt,
  ...rest
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState(src)
  const [hasError, setHasError] = useState(false)

  return (
    <div className="relative">
      <Image
        {...rest}
        src={imgSrc || "/placeholder.svg"}
        alt={alt}
        onError={() => {
          setHasError(true)
          setImgSrc(fallbackSrc)
        }}
      />
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500 text-sm">
          {alt || "Image could not be loaded"}
        </div>
      )}
    </div>
  )
}
