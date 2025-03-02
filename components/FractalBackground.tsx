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

    const drawSpiralCircles = (
      centerX: number,
      centerY: number,
      startColor: string,
      endColor: string,
      progress: number,
      isBottomRight: boolean,
    ) => {
      const maxRadius = Math.min(canvas.width, canvas.height) * (isBottomRight ? 0.5 : 0.6) // Reduced max radius for bottom right
      const totalRotations = 15
      const pointsPerRotation = 200
      const growthFactor = 0.08

      ctx.beginPath()
      for (let i = 0; i <= totalRotations * pointsPerRotation * progress; i++) {
        const angle = (i / pointsPerRotation) * 2 * Math.PI
        const radius = Math.exp(growthFactor * angle) * 5
        if (radius > maxRadius) break

        const x = centerX + radius * Math.cos(angle)
        const y = centerY + radius * Math.sin(angle)

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }

        const gradientProgress = i / (totalRotations * pointsPerRotation)
        const color = interpolateColor(startColor, endColor, gradientProgress)
        ctx.strokeStyle = color
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(x, y)
      }
    }

    const interpolateColor = (color1: string, color2: string, factor: number) => {
      const r1 = Number.parseInt(color1.slice(1, 3), 16)
      const g1 = Number.parseInt(color1.slice(3, 5), 16)
      const b1 = Number.parseInt(color1.slice(5, 7), 16)
      const r2 = Number.parseInt(color2.slice(1, 3), 16)
      const g2 = Number.parseInt(color2.slice(3, 5), 16)
      const b2 = Number.parseInt(color2.slice(5, 7), 16)
      const r = Math.round(r1 + factor * (r2 - r1))
      const g = Math.round(g1 + factor * (g2 - g1))
      const b = Math.round(b1 + factor * (b2 - b1))
      return `rgba(${r}, ${g}, ${b}, 0.8)`
    }

    let startTime: number | null = null
    const animationDuration = 2000 // 2 seconds

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / animationDuration, 1)

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw spiral circles in top left corner (magenta to cyan)
      drawSpiralCircles(0, 0, "#FF00FF", "#00FFFF", progress, false)

      // Draw spiral circles in bottom right corner (cyan to magenta)
      drawSpiralCircles(canvas.width, canvas.height, "#00FFFF", "#FF00FF", progress, true)

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate)
      }
    }

    const startAnimation = () => {
      startTime = null
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

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-[-1]"
      style={{ opacity: 0.5 }}
    />
  )
}

export default FractalBackground

