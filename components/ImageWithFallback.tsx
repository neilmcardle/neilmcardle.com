"use client"

import { useState } from "react"
import Image, { type ImageProps } from "next/image"

interface ImageWithFallbackProps extends ImageProps {
  fallbackSrc?: string
}

export default function ImageWithFallback({
  src,
  alt,
  fallbackSrc = "/abstract-colorful-painting.png",
  ...rest
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState(src)
  const [error, setError] = useState(false)

  return (
    <div className="relative">
      <Image
        {...rest}
        src={imgSrc || "/placeholder.svg"}
        alt={alt}
        onError={() => {
          setImgSrc(fallbackSrc)
          setError(true)
        }}
      />
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50 text-center p-4">
          <p className="text-sm text-gray-600">{alt} could not be loaded</p>
        </div>
      )}
    </div>
  )
}
