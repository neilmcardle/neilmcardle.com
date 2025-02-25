"use client"

import type React from "react"
import { useRef, useEffect } from "react"

const FractalBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const drawFractal = (x: number, y: number, len: number, angle: number, depth: number) => {
      if (depth === 0) return

      const endX = x + len * Math.cos(angle)
      const endY = y + len * Math.sin(angle)

      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(endX, endY)
      ctx.stroke()

      drawFractal(endX, endY, len * 0.8, angle - Math.PI / 6, depth - 1)
      drawFractal(endX, endY, len * 0.8, angle + Math.PI / 6, depth - 1)
    }

    let startTime: number
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.strokeStyle = "rgba(180, 180, 180, 0.5)"
      ctx.lineWidth = 1

      const progress = Math.min(elapsed / 2000, 1) // Animation lasts 2 seconds
      const maxDepth = Math.floor(progress * 8) // Max depth of 8

      // Draw fractal in top left corner
      drawFractal(0, 0, 100, Math.PI / 4, maxDepth)

      // Draw fractal in bottom right corner
      drawFractal(canvas.width, canvas.height, 100, (-3 * Math.PI) / 4, maxDepth)

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate)
      }
    }

    const startAnimation = () => {
      startTime = 0
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
      animationFrameId = requestAnimationFrame(animate)
    }

    resizeCanvas()
    startAnimation()

    window.addEventListener("resize", () => {
      resizeCanvas()
      startAnimation()
    })

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full pointer-events-none z-[-1]" />
}

export default FractalBackground

