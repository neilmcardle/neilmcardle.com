"use client"

import { useEffect, useRef } from "react"

export function DesignerSketchBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Draw the sketches
    const drawSketches = () => {
      if (!ctx) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Set sketch style
      ctx.strokeStyle = "rgba(0, 0, 0, 0.07)"
      ctx.lineWidth = 1.5
      ctx.lineCap = "round"
      ctx.lineJoin = "round"

      // Calculate grid alignment (30px grid as defined in CSS)
      const gridSize = 30
      const alignToGrid = (value: number) => Math.round(value / gridSize) * gridSize

      // Draw wireframe elements aligned to grid
      drawWireframeBox(
        ctx,
        alignToGrid(canvas.width * 0.15),
        alignToGrid(canvas.height * 0.3),
        alignToGrid(canvas.width * 0.25),
        alignToGrid(canvas.height * 0.15),
      )

      drawWireframeCircle(ctx, alignToGrid(canvas.width * 0.75), alignToGrid(canvas.height * 0.25), alignToGrid(40))

      drawWireframeButton(
        ctx,
        alignToGrid(canvas.width * 0.6),
        alignToGrid(canvas.height * 0.4),
        alignToGrid(120),
        alignToGrid(40),
      )

      drawArrow(
        ctx,
        alignToGrid(canvas.width * 0.4),
        alignToGrid(canvas.height * 0.35),
        alignToGrid(canvas.width * 0.55),
        alignToGrid(canvas.height * 0.4),
      )

      // Draw a mobile wireframe
      drawMobileWireframe(
        ctx,
        alignToGrid(canvas.width * 0.8),
        alignToGrid(canvas.height * 0.6),
        alignToGrid(90),
        alignToGrid(180),
      )

      // Draw some connecting lines
      drawConnectingLine(
        ctx,
        alignToGrid(canvas.width * 0.3),
        alignToGrid(canvas.height * 0.6),
        alignToGrid(canvas.width * 0.5),
        alignToGrid(canvas.height * 0.7),
      )

      drawConnectingLine(
        ctx,
        alignToGrid(canvas.width * 0.6),
        alignToGrid(canvas.height * 0.65),
        alignToGrid(canvas.width * 0.75),
        alignToGrid(canvas.height * 0.55),
      )

      // Add more pure UI elements
      drawCircleWithCross(ctx, alignToGrid(canvas.width * 0.2), alignToGrid(canvas.height * 0.5), alignToGrid(15))

      drawSquareWithDiagonals(ctx, alignToGrid(canvas.width * 0.7), alignToGrid(canvas.height * 0.45), alignToGrid(30))

      // Draw a simple flowchart
      drawFlowChart(ctx, alignToGrid(canvas.width * 0.25), alignToGrid(canvas.height * 0.75))
    }

    // Helper functions to draw UI elements
    const drawWireframeBox = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) => {
      ctx.beginPath()
      // Add slight imperfections to make it look hand-drawn
      const jitter = () => (Math.random() - 0.5) * 2
      ctx.moveTo(x + jitter(), y + jitter())
      ctx.lineTo(x + width + jitter(), y + jitter())
      ctx.lineTo(x + width + jitter(), y + height + jitter())
      ctx.lineTo(x + jitter(), y + height + jitter())
      ctx.closePath()
      ctx.stroke()

      // Add some horizontal lines to represent text
      for (let i = 0; i < 3; i++) {
        ctx.beginPath()
        ctx.moveTo(x + 10, y + 15 + i * 10)
        ctx.lineTo(x + width - 10, y + 15 + i * 10)
        ctx.stroke()
      }
    }

    const drawWireframeCircle = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) => {
      ctx.beginPath()
      ctx.ellipse(x, y, radius, radius, 0, 0, Math.PI * 2)
      ctx.stroke()

      // Add a simple face sketch inside
      ctx.beginPath()
      ctx.arc(x - radius * 0.3, y - radius * 0.2, radius * 0.1, 0, Math.PI * 2)
      ctx.stroke()

      ctx.beginPath()
      ctx.arc(x + radius * 0.3, y - radius * 0.2, radius * 0.1, 0, Math.PI * 2)
      ctx.stroke()

      ctx.beginPath()
      ctx.arc(x, y + radius * 0.2, radius * 0.4, 0.1, Math.PI - 0.1, false)
      ctx.stroke()
    }

    const drawWireframeButton = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      width: number,
      height: number,
    ) => {
      // Draw rounded rectangle
      const radius = height / 2
      ctx.beginPath()
      ctx.moveTo(x + radius, y)
      ctx.lineTo(x + width - radius, y)
      ctx.arcTo(x + width, y, x + width, y + radius, radius)
      ctx.lineTo(x + width, y + height - radius)
      ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius)
      ctx.lineTo(x + radius, y + height)
      ctx.arcTo(x, y + height, x, y + height - radius, radius)
      ctx.lineTo(x, y + radius)
      ctx.arcTo(x, y, x + radius, y, radius)
      ctx.closePath()
      ctx.stroke()

      // Add button text
      ctx.beginPath()
      ctx.moveTo(x + width * 0.2, y + height / 2)
      ctx.lineTo(x + width * 0.8, y + height / 2)
      ctx.stroke()
    }

    const drawArrow = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) => {
      // Draw slightly curved line
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.quadraticCurveTo((x1 + x2) / 2, y1 - 20, x2, y2)
      ctx.stroke()

      // Draw arrowhead
      const angle = Math.atan2(y2 - ((y1 + y2) / 2 - 10), x2 - (x1 + x2) / 2)
      ctx.beginPath()
      ctx.moveTo(x2, y2)
      ctx.lineTo(x2 - 10 * Math.cos(angle - Math.PI / 6), y2 - 10 * Math.sin(angle - Math.PI / 6))
      ctx.moveTo(x2, y2)
      ctx.lineTo(x2 - 10 * Math.cos(angle + Math.PI / 6), y2 - 10 * Math.sin(angle + Math.PI / 6))
      ctx.stroke()
    }

    const drawMobileWireframe = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      width: number,
      height: number,
    ) => {
      // Draw phone outline
      const radius = 10
      ctx.beginPath()
      ctx.moveTo(x + radius, y)
      ctx.lineTo(x + width - radius, y)
      ctx.arcTo(x + width, y, x + width, y + radius, radius)
      ctx.lineTo(x + width, y + height - radius)
      ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius)
      ctx.lineTo(x + radius, y + height)
      ctx.arcTo(x, y + height, x, y + height - radius, radius)
      ctx.lineTo(x, y + radius)
      ctx.arcTo(x, y, x + radius, y, radius)
      ctx.closePath()
      ctx.stroke()

      // Draw status bar
      ctx.beginPath()
      ctx.moveTo(x + 5, y + 20)
      ctx.lineTo(x + width - 5, y + 20)
      ctx.stroke()

      // Draw content blocks
      for (let i = 0; i < 3; i++) {
        ctx.beginPath()
        ctx.rect(x + 10, y + 30 + i * 40, width - 20, 30)
        ctx.stroke()
      }

      // Draw bottom nav bar
      ctx.beginPath()
      ctx.moveTo(x + 5, y + height - 20)
      ctx.lineTo(x + width - 5, y + height - 20)
      ctx.stroke()

      // Draw nav icons
      for (let i = 0; i < 4; i++) {
        ctx.beginPath()
        ctx.arc(x + 20 + (i * (width - 40)) / 3, y + height - 10, 5, 0, Math.PI * 2)
        ctx.stroke()
      }
    }

    const drawConnectingLine = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) => {
      // Draw a dashed line
      ctx.beginPath()
      ctx.setLineDash([5, 5])
      ctx.moveTo(x1, y1)
      ctx.bezierCurveTo(x1 + (x2 - x1) * 0.4, y1 + (y2 - y1) * 0.1, x1 + (x2 - x1) * 0.6, y1 + (y2 - y1) * 0.9, x2, y2)
      ctx.stroke()
      ctx.setLineDash([])
    }

    const drawCircleWithCross = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) => {
      // Draw circle
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.stroke()

      // Draw cross
      ctx.beginPath()
      ctx.moveTo(x - radius * 0.7, y - radius * 0.7)
      ctx.lineTo(x + radius * 0.7, y + radius * 0.7)
      ctx.moveTo(x + radius * 0.7, y - radius * 0.7)
      ctx.lineTo(x - radius * 0.7, y + radius * 0.7)
      ctx.stroke()
    }

    const drawSquareWithDiagonals = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
      // Draw square
      ctx.beginPath()
      ctx.rect(x - size / 2, y - size / 2, size, size)
      ctx.stroke()

      // Draw diagonals
      ctx.beginPath()
      ctx.moveTo(x - size / 2, y - size / 2)
      ctx.lineTo(x + size / 2, y + size / 2)
      ctx.moveTo(x + size / 2, y - size / 2)
      ctx.lineTo(x - size / 2, y + size / 2)
      ctx.stroke()
    }

    const drawFlowChart = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
      // Draw a simple flowchart with three connected boxes
      const boxWidth = 80
      const boxHeight = 40

      // First box
      ctx.beginPath()
      ctx.rect(x, y, boxWidth, boxHeight)
      ctx.stroke()

      // Arrow down
      ctx.beginPath()
      ctx.moveTo(x + boxWidth / 2, y + boxHeight)
      ctx.lineTo(x + boxWidth / 2, y + boxHeight + 20)
      ctx.stroke()

      // Arrowhead
      ctx.beginPath()
      ctx.moveTo(x + boxWidth / 2, y + boxHeight + 20)
      ctx.lineTo(x + boxWidth / 2 - 5, y + boxHeight + 15)
      ctx.moveTo(x + boxWidth / 2, y + boxHeight + 20)
      ctx.lineTo(x + boxWidth / 2 + 5, y + boxHeight + 15)
      ctx.stroke()

      // Second box
      ctx.beginPath()
      ctx.rect(x, y + boxHeight + 20, boxWidth, boxHeight)
      ctx.stroke()

      // Arrow right
      ctx.beginPath()
      ctx.moveTo(x + boxWidth, y + boxHeight + 20 + boxHeight / 2)
      ctx.lineTo(x + boxWidth + 20, y + boxHeight + 20 + boxHeight / 2)
      ctx.stroke()

      // Arrowhead
      ctx.beginPath()
      ctx.moveTo(x + boxWidth + 20, y + boxHeight + 20 + boxHeight / 2)
      ctx.lineTo(x + boxWidth + 15, y + boxHeight + 20 + boxHeight / 2 - 5)
      ctx.moveTo(x + boxWidth + 20, y + boxHeight + 20 + boxHeight / 2)
      ctx.lineTo(x + boxWidth + 15, y + boxHeight + 20 + boxHeight / 2 + 5)
      ctx.stroke()

      // Third box
      ctx.beginPath()
      ctx.rect(x + boxWidth + 20, y + boxHeight + 20, boxWidth, boxHeight)
      ctx.stroke()
    }

    drawSketches()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-[-5]"
      aria-hidden="true"
    />
  )
}
