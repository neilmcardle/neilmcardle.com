"use client"

import { useEffect, useRef, useState } from "react"

interface UIElement {
  type: string
  x: number
  y: number
  width?: number
  height?: number
  radius?: number
  delay: number
  state?: {
    hovered: boolean
    toggled?: boolean
    active?: boolean
  }
}

interface ElectricityPath {
  points: { x: number; y: number }[]
  progress: number
  speed: number
  maxPoints: number
  active: boolean
}

export function DotGridAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [elements, setElements] = useState<UIElement[]>([])
  const [electricityPaths, setElectricityPaths] = useState<ElectricityPath[]>([])
  const animationCompleteRef = useRef(false)
  const animationFrameIdRef = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions to match window
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight

      // Recalculate element positions on resize
      initializeElements()
      initializeElectricityPaths()
    }

    // Grid settings - match the existing CSS grid
    const gridSize = 30
    const lineColor = "rgba(0, 0, 0, 0.08)"
    const hoverColor = "rgba(0, 0, 0, 0.15)"
    const activeColor = "rgba(0, 0, 0, 0.25)"
    const animationDuration = 3000 // 3 seconds

    // Initialize UI elements
    const initializeElements = () => {
      const newElements: UIElement[] = [
        // Left margin pill button
        {
          type: "pill",
          x: Math.floor((canvas.width * 0.15) / gridSize) * gridSize,
          y: Math.floor((canvas.height * 0.3) / gridSize) * gridSize,
          width: Math.round((5 * gridSize) / gridSize) * gridSize,
          height: Math.round((2 * gridSize) / gridSize) * gridSize,
          delay: 300,
          state: { hovered: false, active: false },
        },
        // Right margin card
        {
          type: "card",
          x: Math.floor((canvas.width * 0.8) / gridSize) * gridSize,
          y: Math.floor((canvas.height * 0.2) / gridSize) * gridSize,
          width: Math.round((6 * gridSize) / gridSize) * gridSize,
          height: Math.round((8 * gridSize) / gridSize) * gridSize,
          delay: 600,
          state: { hovered: false },
        },
        // Bottom left circle
        {
          type: "circle",
          x: Math.floor((canvas.width * 0.2) / gridSize) * gridSize,
          y: Math.floor((canvas.height * 0.7) / gridSize) * gridSize,
          radius: Math.round((3 * gridSize) / gridSize) * gridSize,
          delay: 900,
          state: { hovered: false },
        },
        // Top right toggle
        {
          type: "toggle",
          x: Math.floor((canvas.width * 0.85) / gridSize) * gridSize,
          y: Math.floor((canvas.height * 0.6) / gridSize) * gridSize,
          width: Math.round((3 * gridSize) / gridSize) * gridSize,
          height: Math.round((1.5 * gridSize) / gridSize) * gridSize,
          delay: 1200,
          state: { hovered: false, toggled: false },
        },
        // Bottom right input field
        {
          type: "input",
          x: Math.floor((canvas.width * 0.75) / gridSize) * gridSize,
          y: Math.floor((canvas.height * 0.8) / gridSize) * gridSize,
          width: Math.round((7 * gridSize) / gridSize) * gridSize,
          height: Math.round((2 * gridSize) / gridSize) * gridSize,
          delay: 1500,
          state: { hovered: false },
        },
      ]

      setElements(newElements)
    }

    // Initialize electricity paths
    const initializeElectricityPaths = () => {
      const numPaths = 15 // Number of electricity paths
      const newPaths: ElectricityPath[] = []

      for (let i = 0; i < numPaths; i++) {
        newPaths.push({
          points: [
            {
              x: Math.floor((Math.random() * canvas.width) / gridSize) * gridSize,
              y: 0,
            },
          ],
          progress: 0,
          speed: 0.005 + Math.random() * 0.01, // Random speed
          maxPoints: 10 + Math.floor(Math.random() * 10), // Random length
          active: false,
        })
      }

      setElectricityPaths(newPaths)
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Mouse event handlers
    const handleMouseMove = (e: MouseEvent) => {
      if (!animationCompleteRef.current) return

      const rect = canvas.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      // Check if mouse is over any element
      let needsUpdate = false

      setElements((prevElements) => {
        return prevElements.map((element) => {
          const isHovered = isPointInElement(mouseX, mouseY, element)

          if (isHovered !== element.state?.hovered) {
            needsUpdate = true
            return {
              ...element,
              state: { ...element.state, hovered: isHovered },
            }
          }
          return element
        })
      })

      if (needsUpdate) {
        requestAnimationFrame(drawElements)
      }
    }

    const handleMouseClick = (e: MouseEvent) => {
      if (!animationCompleteRef.current) return

      const rect = canvas.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      setElements((prevElements) => {
        return prevElements.map((element) => {
          if (isPointInElement(mouseX, mouseY, element)) {
            if (element.type === "toggle") {
              return {
                ...element,
                state: {
                  ...element.state,
                  toggled: !element.state?.toggled,
                  active: true,
                },
              }
            }
            if (element.type === "pill") {
              return {
                ...element,
                state: {
                  ...element.state,
                  active: true,
                },
              }
            }
          }
          return element
        })
      })

      requestAnimationFrame(drawElements)

      // Reset active state after a short delay
      setTimeout(() => {
        setElements((prevElements) => {
          return prevElements.map((element) => {
            if (element.type === "pill" && element.state?.active) {
              return {
                ...element,
                state: {
                  ...element.state,
                  active: false,
                },
              }
            }
            return element
          })
        })
        requestAnimationFrame(drawElements)
      }, 200)
    }

    // Hit detection
    const isPointInElement = (x: number, y: number, element: UIElement): boolean => {
      switch (element.type) {
        case "pill":
          return isPointInRoundedRect(
            x,
            y,
            element.x!,
            element.y!,
            element.width!,
            element.height!,
            element.height! / 2,
          )
        case "card":
          return isPointInRoundedRect(x, y, element.x!, element.y!, element.width!, element.height!, gridSize / 4)
        case "circle":
          return isPointInCircle(x, y, element.x!, element.y!, element.radius!)
        case "toggle":
          return isPointInRoundedRect(
            x,
            y,
            element.x!,
            element.y!,
            element.width!,
            element.height!,
            element.height! / 2,
          )
        case "input":
          return isPointInRoundedRect(x, y, element.x!, element.y!, element.width!, element.height!, gridSize / 8)
        default:
          return false
      }
    }

    const isPointInCircle = (x: number, y: number, cx: number, cy: number, radius: number): boolean => {
      const dx = x - cx
      const dy = y - cy
      return dx * dx + dy * dy <= radius * radius
    }

    const isPointInRoundedRect = (
      x: number,
      y: number,
      rx: number,
      ry: number,
      width: number,
      height: number,
      radius: number,
    ): boolean => {
      // Check if point is inside the rectangle (excluding corners)
      if (x >= rx + radius && x <= rx + width - radius && y >= ry && y <= ry + height) {
        return true
      }
      if (x >= rx && x <= rx + width && y >= ry + radius && y <= ry + height - radius) {
        return true
      }

      // Check if point is inside any of the corner circles
      if (isPointInCircle(x, y, rx + radius, ry + radius, radius)) return true
      if (isPointInCircle(x, y, rx + width - radius, ry + radius, radius)) return true
      if (isPointInCircle(x, y, rx + width - radius, ry + height - radius, radius)) return true
      if (isPointInCircle(x, y, rx + radius, ry + height - radius, radius)) return true

      return false
    }

    // Update electricity paths
    const updateElectricityPaths = () => {
      setElectricityPaths((prevPaths) => {
        return prevPaths.map((path) => {
          // Increase progress
          let newProgress = path.progress + path.speed
          let newPoints = [...path.points]
          let newActive = path.active

          // If we need to add a new point
          if (newProgress >= 1 / path.maxPoints && path.points.length < path.maxPoints) {
            const lastPoint = path.points[path.points.length - 1]

            // Determine next point (generally moving downward)
            const direction = Math.random()
            let newX = lastPoint.x
            const newY = lastPoint.y + gridSize // Always move down

            // Sometimes move diagonally
            if (direction < 0.3) {
              newX = lastPoint.x - gridSize // Move left
            } else if (direction < 0.6) {
              newX = lastPoint.x + gridSize // Move right
            }

            // Keep within canvas bounds
            newX = Math.max(0, Math.min(canvas.width, newX))

            // Add new point
            newPoints.push({ x: newX, y: newY })
            newProgress = 0
            newActive = true
          }

          // Reset path if it reaches the bottom
          if (newPoints.length > 0 && newPoints[newPoints.length - 1].y > canvas.height) {
            newPoints = [
              {
                x: Math.floor((Math.random() * canvas.width) / gridSize) * gridSize,
                y: 0,
              },
            ]
            newProgress = 0
            newActive = false
          }

          return {
            ...path,
            points: newPoints,
            progress: newProgress,
            active: newActive,
          }
        })
      })

      // Continue animation
      animationFrameIdRef.current = requestAnimationFrame(updateElectricityPaths)

      // Redraw everything
      drawElements()
    }

    // Draw electricity paths
    const drawElectricityPaths = () => {
      if (!ctx) return

      electricityPaths.forEach((path) => {
        if (path.points.length < 2 || !path.active) return

        ctx.beginPath()
        ctx.strokeStyle = "rgba(0, 0, 0, 0.05)"
        ctx.lineWidth = 1
        ctx.setLineDash([2, 4]) // Dashed line for electricity effect

        // Draw path
        for (let i = 0; i < path.points.length - 1; i++) {
          const p1 = path.points[i]
          const p2 = path.points[i + 1]

          ctx.moveTo(p1.x, p1.y)
          ctx.lineTo(p2.x, p2.y)
        }

        ctx.stroke()
        ctx.setLineDash([]) // Reset dash
      })
    }

    // Drawing functions
    const drawElements = (progress = 1) => {
      if (!ctx) return

      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw electricity paths
      drawElectricityPaths()

      // Draw each element
      elements.forEach((element) => {
        const elementProgress = progress

        if (elementProgress <= 0) return

        switch (element.type) {
          case "pill":
            drawPill(
              ctx,
              element.x!,
              element.y!,
              element.width!,
              element.height!,
              elementProgress,
              element.state?.hovered || false,
              element.state?.active || false,
            )
            break
          case "card":
            drawCard(
              ctx,
              element.x!,
              element.y!,
              element.width!,
              element.height!,
              elementProgress,
              element.state?.hovered || false,
            )
            break
          case "circle":
            drawCircle(ctx, element.x!, element.y!, element.radius!, elementProgress, element.state?.hovered || false)
            break
          case "toggle":
            drawToggle(
              ctx,
              element.x!,
              element.y!,
              element.width!,
              element.height!,
              elementProgress,
              element.state?.hovered || false,
              element.state?.toggled || false,
            )
            break
          case "input":
            drawInput(
              ctx,
              element.x!,
              element.y!,
              element.width!,
              element.height!,
              elementProgress,
              element.state?.hovered || false,
            )
            break
        }
      })
    }

    // Draw a pill button with progressive stroke
    const drawPill = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      width: number,
      height: number,
      progress: number,
      hovered: boolean,
      active: boolean,
    ) => {
      const radius = height / 2
      const pathLength = 2 * Math.PI * radius + 2 * (width - 2 * radius)
      const currentLength = pathLength * progress

      // Draw background if hovered or active
      if ((hovered || active) && progress >= 1) {
        ctx.beginPath()
        ctx.moveTo(x + radius, y)
        ctx.lineTo(x + width - radius, y)
        ctx.arc(x + width - radius, y + radius, radius, -Math.PI / 2, Math.PI / 2)
        ctx.lineTo(x + radius, y + height)
        ctx.arc(x + radius, y + radius, radius, Math.PI / 2, -Math.PI / 2)
        ctx.closePath()

        if (active) {
          ctx.fillStyle = activeColor
        } else {
          ctx.fillStyle = hoverColor
        }
        ctx.fill()
      }

      // Draw outline
      ctx.beginPath()

      // Start at top-left corner of the straight part
      ctx.moveTo(x + radius, y)

      let lengthSoFar = 0
      let nextSegmentLength = width - 2 * radius

      // Top straight line
      if (currentLength > lengthSoFar) {
        const segmentProgress = Math.min(1, (currentLength - lengthSoFar) / nextSegmentLength)
        ctx.lineTo(x + radius + (width - 2 * radius) * segmentProgress, y)
      }

      lengthSoFar += nextSegmentLength
      nextSegmentLength = Math.PI * radius

      // Right arc
      if (currentLength > lengthSoFar) {
        const segmentProgress = Math.min(1, (currentLength - lengthSoFar) / nextSegmentLength)
        ctx.arc(x + width - radius, y + radius, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * segmentProgress)
      }

      lengthSoFar += nextSegmentLength
      nextSegmentLength = width - 2 * radius

      // Bottom straight line
      if (currentLength > lengthSoFar) {
        const segmentProgress = Math.min(1, (currentLength - lengthSoFar) / nextSegmentLength)
        const startX = x + width - radius
        const startY = y + height
        const endX = x + radius
        ctx.lineTo(startX - (startX - endX) * segmentProgress, startY)
      }

      lengthSoFar += nextSegmentLength
      nextSegmentLength = Math.PI * radius

      // Left arc
      if (currentLength > lengthSoFar) {
        const segmentProgress = Math.min(1, (currentLength - lengthSoFar) / nextSegmentLength)
        ctx.arc(x + radius, y + radius, radius, Math.PI / 2, Math.PI / 2 + Math.PI * segmentProgress)
      }

      ctx.strokeStyle = hovered ? hoverColor : lineColor
      ctx.lineWidth = 1
      ctx.stroke()

      // Add button text if fully drawn
      if (progress >= 1) {
        ctx.beginPath()
        ctx.moveTo(x + width * 0.3, y + height / 2)
        ctx.lineTo(x + width * 0.7, y + height / 2)
        ctx.strokeStyle = hovered ? hoverColor : lineColor
        ctx.lineWidth = 1
        ctx.stroke()
      }
    }

    // Draw a card with progressive stroke
    const drawCard = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      width: number,
      height: number,
      progress: number,
      hovered: boolean,
    ) => {
      const radius = gridSize / 4 // Corner radius aligned to grid

      // Draw background if hovered
      if (hovered && progress >= 1) {
        ctx.beginPath()
        ctx.moveTo(x + radius, y)
        ctx.lineTo(x + width - radius, y)
        ctx.arc(x + width - radius, y + radius, radius, -Math.PI / 2, 0)
        ctx.lineTo(x + width, y + height - radius)
        ctx.arc(x + width - radius, y + height - radius, radius, 0, Math.PI / 2)
        ctx.lineTo(x + radius, y + height)
        ctx.arc(x + radius, y + height - radius, radius, Math.PI / 2, Math.PI)
        ctx.lineTo(x, y + radius)
        ctx.arc(x + radius, y + radius, radius, Math.PI, -Math.PI / 2)
        ctx.closePath()
        ctx.fillStyle = hoverColor
        ctx.fill()
      }

      // Calculate total path length
      const pathLength = 2 * (width + height) - 8 * radius + 2 * Math.PI * radius
      const currentLength = pathLength * progress

      ctx.beginPath()

      // Start at top-left corner after the arc
      ctx.moveTo(x + radius, y)

      let lengthSoFar = 0
      let nextSegmentLength = width - 2 * radius

      // Top edge
      if (currentLength > lengthSoFar) {
        const segmentProgress = Math.min(1, (currentLength - lengthSoFar) / nextSegmentLength)
        ctx.lineTo(x + radius + nextSegmentLength * segmentProgress, y)
      }

      lengthSoFar += nextSegmentLength
      nextSegmentLength = (Math.PI * radius) / 2

      // Top-right corner
      if (currentLength > lengthSoFar) {
        const segmentProgress = Math.min(1, (currentLength - lengthSoFar) / nextSegmentLength)
        ctx.arc(x + width - radius, y + radius, radius, -Math.PI / 2, -Math.PI / 2 + (Math.PI / 2) * segmentProgress)
      }

      lengthSoFar += nextSegmentLength
      nextSegmentLength = height - 2 * radius

      // Right edge
      if (currentLength > lengthSoFar) {
        const segmentProgress = Math.min(1, (currentLength - lengthSoFar) / nextSegmentLength)
        ctx.lineTo(x + width, y + radius + nextSegmentLength * segmentProgress)
      }

      lengthSoFar += nextSegmentLength
      nextSegmentLength = (Math.PI * radius) / 2

      // Bottom-right corner
      if (currentLength > lengthSoFar) {
        const segmentProgress = Math.min(1, (currentLength - lengthSoFar) / nextSegmentLength)
        ctx.arc(x + width - radius, y + height - radius, radius, 0, (Math.PI / 2) * segmentProgress)
      }

      lengthSoFar += nextSegmentLength
      nextSegmentLength = width - 2 * radius

      // Bottom edge
      if (currentLength > lengthSoFar) {
        const segmentProgress = Math.min(1, (currentLength - lengthSoFar) / nextSegmentLength)
        ctx.lineTo(x + width - radius - nextSegmentLength * segmentProgress, y + height)
      }

      lengthSoFar += nextSegmentLength
      nextSegmentLength = (Math.PI * radius) / 2

      // Bottom-left corner
      if (currentLength > lengthSoFar) {
        const segmentProgress = Math.min(1, (currentLength - lengthSoFar) / nextSegmentLength)
        ctx.arc(x + radius, y + height - radius, radius, Math.PI / 2, Math.PI / 2 + (Math.PI / 2) * segmentProgress)
      }

      lengthSoFar += nextSegmentLength
      nextSegmentLength = height - 2 * radius

      // Left edge
      if (currentLength > lengthSoFar) {
        const segmentProgress = Math.min(1, (currentLength - lengthSoFar) / nextSegmentLength)
        ctx.lineTo(x, y + height - radius - nextSegmentLength * segmentProgress)
      }

      lengthSoFar += nextSegmentLength
      nextSegmentLength = (Math.PI * radius) / 2

      // Top-left corner
      if (currentLength > lengthSoFar) {
        const segmentProgress = Math.min(1, (currentLength - lengthSoFar) / nextSegmentLength)
        ctx.arc(x + radius, y + radius, radius, Math.PI, Math.PI + (Math.PI / 2) * segmentProgress)
      }

      ctx.strokeStyle = hovered ? hoverColor : lineColor
      ctx.lineWidth = 1
      ctx.stroke()

      // Add content lines if we're almost done drawing
      if (progress >= 1) {
        // Header
        ctx.beginPath()
        ctx.moveTo(x + width * 0.2, y + height * 0.15)
        ctx.lineTo(x + width * 0.8, y + height * 0.15)
        ctx.strokeStyle = hovered ? hoverColor : lineColor
        ctx.lineWidth = 1
        ctx.stroke()

        // Content lines
        for (let i = 0; i < 3; i++) {
          const lineY = y + height * (0.3 + i * 0.15)
          ctx.beginPath()
          ctx.moveTo(x + width * 0.2, lineY)
          ctx.lineTo(x + width * 0.8, lineY)
          ctx.strokeStyle = hovered ? hoverColor : lineColor
          ctx.lineWidth = 1
          ctx.stroke()
        }
      }
    }

    // Draw a circle with progressive stroke
    const drawCircle = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      radius: number,
      progress: number,
      hovered: boolean,
    ) => {
      // Draw background if hovered
      if (hovered && progress >= 1) {
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.fillStyle = hoverColor
        ctx.fill()
      }

      const startAngle = -Math.PI / 2 // Start from the top
      const endAngle = startAngle + Math.PI * 2 * progress

      ctx.beginPath()
      ctx.arc(x, y, radius, startAngle, endAngle)
      ctx.strokeStyle = hovered ? hoverColor : lineColor
      ctx.lineWidth = 1
      ctx.stroke()

      // Add a simple face sketch inside if fully drawn
      if (progress >= 1) {
        // Eyes
        ctx.beginPath()
        ctx.arc(x - radius * 0.3, y - radius * 0.2, radius * 0.1, 0, Math.PI * 2)
        ctx.strokeStyle = hovered ? hoverColor : lineColor
        ctx.stroke()

        ctx.beginPath()
        ctx.arc(x + radius * 0.3, y - radius * 0.2, radius * 0.1, 0, Math.PI * 2)
        ctx.strokeStyle = hovered ? hoverColor : lineColor
        ctx.stroke()

        // Smile
        ctx.beginPath()
        ctx.arc(x, y + radius * 0.2, radius * 0.4, 0.1, Math.PI - 0.1, false)
        ctx.strokeStyle = hovered ? hoverColor : lineColor
        ctx.stroke()
      }
    }

    // Draw a toggle switch with progressive stroke
    const drawToggle = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      width: number,
      height: number,
      progress: number,
      hovered: boolean,
      toggled: boolean,
    ) => {
      const radius = height / 2

      // Draw background if hovered
      if (hovered && progress >= 1) {
        ctx.beginPath()
        ctx.moveTo(x + radius, y)
        ctx.lineTo(x + width - radius, y)
        ctx.arc(x + width - radius, y + radius, radius, -Math.PI / 2, Math.PI / 2)
        ctx.lineTo(x + radius, y + height)
        ctx.arc(x + radius, y + radius, radius, Math.PI / 2, -Math.PI / 2)
        ctx.closePath()
        ctx.fillStyle = hoverColor
        ctx.fill()
      }

      // Calculate total path length for the track
      const pathLength = 2 * Math.PI * radius + 2 * (width - 2 * radius)
      const currentLength = pathLength * progress

      ctx.beginPath()

      // Start at top-left corner of the straight part
      ctx.moveTo(x + radius, y)

      let lengthSoFar = 0
      let nextSegmentLength = width - 2 * radius

      // Top straight line
      if (currentLength > lengthSoFar) {
        const segmentProgress = Math.min(1, (currentLength - lengthSoFar) / nextSegmentLength)
        ctx.lineTo(x + radius + (width - 2 * radius) * segmentProgress, y)
      }

      lengthSoFar += nextSegmentLength
      nextSegmentLength = Math.PI * radius

      // Right arc
      if (currentLength > lengthSoFar) {
        const segmentProgress = Math.min(1, (currentLength - lengthSoFar) / nextSegmentLength)
        ctx.arc(x + width - radius, y + radius, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * segmentProgress)
      }

      lengthSoFar += nextSegmentLength
      nextSegmentLength = width - 2 * radius

      // Bottom straight line
      if (currentLength > lengthSoFar) {
        const segmentProgress = Math.min(1, (currentLength - lengthSoFar) / nextSegmentLength)
        const startX = x + width - radius
        const startY = y + height
        const endX = x + radius
        ctx.lineTo(startX - (startX - endX) * segmentProgress, startY)
      }

      lengthSoFar += nextSegmentLength
      nextSegmentLength = Math.PI * radius

      // Left arc
      if (currentLength > lengthSoFar) {
        const segmentProgress = Math.min(1, (currentLength - lengthSoFar) / nextSegmentLength)
        ctx.arc(x + radius, y + radius, radius, Math.PI / 2, Math.PI / 2 + Math.PI * segmentProgress)
      }

      ctx.strokeStyle = hovered ? hoverColor : lineColor
      ctx.lineWidth = 1
      ctx.stroke()

      // Draw the knob if fully drawn
      if (progress >= 1) {
        const knobX = toggled ? x + width - radius - radius * 0.2 : x + radius + radius * 0.2

        ctx.beginPath()
        ctx.arc(knobX, y + radius, radius * 0.8, 0, Math.PI * 2)
        ctx.strokeStyle = hovered ? hoverColor : lineColor
        ctx.lineWidth = 1
        ctx.stroke()

        // Fill the knob if toggled
        if (toggled) {
          ctx.fillStyle = hovered ? activeColor : hoverColor
          ctx.fill()
        }
      }
    }

    // Draw an input field with progressive stroke
    const drawInput = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      width: number,
      height: number,
      progress: number,
      hovered: boolean,
    ) => {
      const radius = gridSize / 8 // Corner radius aligned to grid

      // Draw background if hovered
      if (hovered && progress >= 1) {
        ctx.beginPath()
        ctx.moveTo(x + radius, y)
        ctx.lineTo(x + width - radius, y)
        ctx.arc(x + width - radius, y + radius, radius, -Math.PI / 2, 0)
        ctx.lineTo(x + width, y + height - radius)
        ctx.arc(x + width - radius, y + height - radius, radius, 0, Math.PI / 2)
        ctx.lineTo(x + radius, y + height)
        ctx.arc(x + radius, y + height - radius, radius, Math.PI / 2, Math.PI)
        ctx.lineTo(x, y + radius)
        ctx.arc(x + radius, y + radius, radius, Math.PI, -Math.PI / 2)
        ctx.closePath()
        ctx.fillStyle = hoverColor
        ctx.fill()
      }

      // Calculate total path length
      const pathLength = 2 * (width + height) - 8 * radius + 2 * Math.PI * radius
      const currentLength = pathLength * progress

      ctx.beginPath()

      // Start at top-left corner after the arc
      ctx.moveTo(x + radius, y)

      let lengthSoFar = 0
      let nextSegmentLength = width - 2 * radius

      // Top edge
      if (currentLength > lengthSoFar) {
        const segmentProgress = Math.min(1, (currentLength - lengthSoFar) / nextSegmentLength)
        ctx.lineTo(x + radius + nextSegmentLength * segmentProgress, y)
      }

      lengthSoFar += nextSegmentLength
      nextSegmentLength = (Math.PI * radius) / 2

      // Top-right corner
      if (currentLength > lengthSoFar) {
        const segmentProgress = Math.min(1, (currentLength - lengthSoFar) / nextSegmentLength)
        ctx.arc(x + width - radius, y + radius, radius, -Math.PI / 2, -Math.PI / 2 + (Math.PI / 2) * segmentProgress)
      }

      lengthSoFar += nextSegmentLength
      nextSegmentLength = height - 2 * radius

      // Right edge
      if (currentLength > lengthSoFar) {
        const segmentProgress = Math.min(1, (currentLength - lengthSoFar) / nextSegmentLength)
        ctx.lineTo(x + width, y + radius + nextSegmentLength * segmentProgress)
      }

      lengthSoFar += nextSegmentLength
      nextSegmentLength = (Math.PI * radius) / 2

      // Bottom-right corner
      if (currentLength > lengthSoFar) {
        const segmentProgress = Math.min(1, (currentLength - lengthSoFar) / nextSegmentLength)
        ctx.arc(x + width - radius, y + height - radius, radius, 0, (Math.PI / 2) * segmentProgress)
      }

      lengthSoFar += nextSegmentLength
      nextSegmentLength = width - 2 * radius

      // Bottom edge
      if (currentLength > lengthSoFar) {
        const segmentProgress = Math.min(1, (currentLength - lengthSoFar) / nextSegmentLength)
        ctx.lineTo(x + width - radius - nextSegmentLength * segmentProgress, y + height)
      }

      lengthSoFar += nextSegmentLength
      nextSegmentLength = (Math.PI * radius) / 2

      // Bottom-left corner
      if (currentLength > lengthSoFar) {
        const segmentProgress = Math.min(1, (currentLength - lengthSoFar) / nextSegmentLength)
        ctx.arc(x + radius, y + height - radius, radius, Math.PI / 2, Math.PI / 2 + (Math.PI / 2) * segmentProgress)
      }

      lengthSoFar += nextSegmentLength
      nextSegmentLength = height - 2 * radius

      // Left edge
      if (currentLength > lengthSoFar) {
        const segmentProgress = Math.min(1, (currentLength - lengthSoFar) / nextSegmentLength)
        ctx.lineTo(x, y + height - radius - nextSegmentLength * segmentProgress)
      }

      lengthSoFar += nextSegmentLength
      nextSegmentLength = (Math.PI * radius) / 2

      // Top-left corner
      if (currentLength > lengthSoFar) {
        const segmentProgress = Math.min(1, (currentLength - lengthSoFar) / nextSegmentLength)
        ctx.arc(x + radius, y + radius, radius, Math.PI, Math.PI + (Math.PI / 2) * segmentProgress)
      }

      ctx.strokeStyle = hovered ? hoverColor : lineColor
      ctx.lineWidth = 1
      ctx.stroke()

      // Add placeholder text if we're almost done drawing
      if (progress >= 1) {
        // Add cursor effect if hovered
        if (hovered) {
          const cursorX = x + width * 0.15
          ctx.beginPath()
          ctx.moveTo(cursorX, y + height * 0.3)
          ctx.lineTo(cursorX, y + height * 0.7)
          ctx.strokeStyle = hoverColor
          ctx.lineWidth = 1
          ctx.stroke()
        } else {
          // Show placeholder text when not hovered
          ctx.beginPath()
          ctx.moveTo(x + width * 0.1, y + height * 0.5)
          ctx.lineTo(x + width * 0.4, y + height * 0.5)
          ctx.strokeStyle = lineColor
          ctx.lineWidth = 1
          ctx.stroke()
        }
      }
    }

    // Animation loop
    let startTime: number | null = null
    let animationFrameId: number

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / animationDuration, 1)

      // Clear the canvas before drawing
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw UI elements with their individual delays
      elements.forEach((element) => {
        const elementProgress = Math.max(
          0,
          Math.min(1, (elapsed - element.delay) / (animationDuration - element.delay)),
        )

        if (elementProgress <= 0) return

        switch (element.type) {
          case "pill":
            drawPill(
              ctx,
              element.x!,
              element.y!,
              element.width!,
              element.height!,
              elementProgress,
              element.state?.hovered || false,
              element.state?.active || false,
            )
            break
          case "card":
            drawCard(
              ctx,
              element.x!,
              element.y!,
              element.width!,
              element.height!,
              elementProgress,
              element.state?.hovered || false,
            )
            break
          case "circle":
            drawCircle(ctx, element.x!, element.y!, element.radius!, elementProgress, element.state?.hovered || false)
            break
          case "toggle":
            drawToggle(
              ctx,
              element.x!,
              element.y!,
              element.width!,
              element.height!,
              elementProgress,
              element.state?.hovered || false,
              element.state?.toggled || false,
            )
            break
          case "input":
            drawInput(
              ctx,
              element.x!,
              element.y!,
              element.width!,
              element.height!,
              elementProgress,
              element.state?.hovered || false,
            )
            break
        }
      })

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate)
      } else {
        animationCompleteRef.current = true

        // Add event listeners after animation is complete
        canvas.addEventListener("mousemove", handleMouseMove)
        canvas.addEventListener("click", handleMouseClick)

        // Start electricity animation
        animationFrameIdRef.current = requestAnimationFrame(updateElectricityPaths)
      }
    }

    // Start the animation
    animationFrameId = requestAnimationFrame(animate)

    // Cleanup
    return () => {
      window.removeEventListener("resize", resizeCanvas)
      canvas.removeEventListener("mousemove", handleMouseMove)
      canvas.removeEventListener("click", handleMouseClick)
      cancelAnimationFrame(animationFrameId)

      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full z-[-1]"
      style={{ cursor: "pointer" }}
      aria-hidden="true"
    />
  )
}
