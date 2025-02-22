"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Brush, AlignJustify, Save, Archive, RotateCcw, X } from "lucide-react"
import "./vector-paint.css"

export default function VectorPaint() {
  const svgCanvasRef = useRef<SVGSVGElement>(null)
  const colorPickerCanvasRef = useRef<HTMLCanvasElement>(null)
  const innerColorSquareRef = useRef<HTMLDivElement>(null)
  const [drawColor, setDrawColor] = useState("#000000")
  const [lineWidth, setLineWidth] = useState(5)
  const [opacity, setOpacity] = useState(1.0)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentPath, setCurrentPath] = useState<SVGPathElement | null>(null)
  const [savedDrawings, setSavedDrawings] = useState<{ name: string; data: string }[]>([])
  const [isDrawActive, setIsDrawActive] = useState(false)
  const [isSizeOpacityOpen, setIsSizeOpacityOpen] = useState(false)
  const [isColorPaletteOpen, setIsColorPaletteOpen] = useState(false)
  const [isSavePanelOpen, setIsSavePanelOpen] = useState(false)

  useEffect(() => {
    if (colorPickerCanvasRef.current) {
      drawColorPicker()
    }
  }, [])

  const startDrawing = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDrawActive) return
    setIsDrawing(true)
    const { x, y } = getMousePosition(e)
    const newPath = document.createElementNS("http://www.w3.org/2000/svg", "path")
    newPath.setAttribute("d", `M${x},${y}`)
    newPath.setAttribute("stroke", drawColor)
    newPath.setAttribute("stroke-opacity", opacity.toString())
    newPath.setAttribute("stroke-width", lineWidth.toString())
    newPath.setAttribute("fill", "none")
    newPath.setAttribute("stroke-linecap", "round")
    newPath.setAttribute("stroke-linejoin", "round")
    svgCanvasRef.current?.appendChild(newPath)
    setCurrentPath(newPath)
  }

  const moveDrawing = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDrawing) return
    const { x, y } = getMousePosition(e)
    const d = currentPath?.getAttribute("d")
    currentPath?.setAttribute("d", `${d} L${x},${y}`)
  }

  const stopDrawing = () => {
    setIsDrawing(false)
    setCurrentPath(null)
  }

  const getMousePosition = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = svgCanvasRef.current?.getBoundingClientRect()
    return {
      x: e.clientX - (rect?.left || 0),
      y: e.clientY - (rect?.top || 0),
    }
  }

  const drawColorPicker = () => {
    const canvas = colorPickerCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = 280
    canvas.height = 280

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const outerRadius = canvas.width / 2 - 20 // Leave some padding
    const innerRadius = outerRadius * 0.6

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw color wheel
    for (let angle = 0; angle <= 360; angle += 1) {
      const startAngle = ((angle - 2) * Math.PI) / 180
      const endAngle = (angle * Math.PI) / 180

      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle)
      ctx.closePath()

      const gradient = ctx.createRadialGradient(centerX, centerY, innerRadius, centerX, centerY, outerRadius)

      const hue = angle
      gradient.addColorStop(0, `hsla(${hue}, 100%, 50%, 0)`)
      gradient.addColorStop(1, `hsl(${hue}, 100%, 50%)`)

      ctx.fillStyle = gradient
      ctx.fill()
    }

    // Draw inner circle for visual separation
    ctx.beginPath()
    ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2)
    ctx.fillStyle = "#333"
    ctx.fill()

    drawInnerColorSquare()
  }

  const handleColorPickerClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = colorPickerCanvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()

    // Get click position relative to canvas
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Calculate distance from center
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const dx = x - centerX
    const dy = y - centerY
    const distance = Math.sqrt(dx * dx + dy * dy)

    // Only process if click is in the color ring
    const outerRadius = canvas.width / 2 - 20
    const innerRadius = outerRadius * 0.6

    if (distance > innerRadius && distance < outerRadius) {
      // Calculate angle and convert to hue
      let angle = Math.atan2(dy, dx) * (180 / Math.PI)
      angle = (angle + 360) % 360

      const newColor = `hsl(${angle}, 100%, 50%)`
      setDrawColor(newColor)
      drawInnerColorSquare()
    }
  }

  const drawInnerColorSquare = () => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx || !innerColorSquareRef.current) return

    const width = 150
    const height = 150
    canvas.width = width
    canvas.height = height

    // Draw saturation gradient (white to color)
    const gradientWhiteToColor = ctx.createLinearGradient(0, 0, width, 0)
    gradientWhiteToColor.addColorStop(0, "#ffffff")
    gradientWhiteToColor.addColorStop(1, drawColor)
    ctx.fillStyle = gradientWhiteToColor
    ctx.fillRect(0, 0, width, height)

    // Draw brightness gradient (transparent to black)
    const gradientToBlack = ctx.createLinearGradient(0, height, 0, 0)
    gradientToBlack.addColorStop(0, "#000000")
    gradientToBlack.addColorStop(1, "rgba(0,0,0,0)")
    ctx.fillStyle = gradientToBlack
    ctx.fillRect(0, 0, width, height)

    innerColorSquareRef.current.style.backgroundImage = `url(${canvas.toDataURL()})`
  }

  const handleInnerColorSquareClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = innerColorSquareRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const width = rect.width
    const height = rect.height

    // Create temporary canvas to sample color
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = width
    canvas.height = height

    // Recreate the gradients
    const gradientWhiteToColor = ctx.createLinearGradient(0, 0, width, 0)
    gradientWhiteToColor.addColorStop(0, "#ffffff")
    gradientWhiteToColor.addColorStop(1, drawColor)
    ctx.fillStyle = gradientWhiteToColor
    ctx.fillRect(0, 0, width, height)

    const gradientToBlack = ctx.createLinearGradient(0, 0, 0, height)
    gradientToBlack.addColorStop(0, "rgba(0,0,0,0)")
    gradientToBlack.addColorStop(1, "#000000")
    ctx.fillStyle = gradientToBlack
    ctx.fillRect(0, 0, width, height)

    // Sample the color at click position
    const pixel = ctx.getImageData(x, y, 1, 1).data
    const newColor = `rgba(${pixel[0]}, ${pixel[1]}, ${pixel[2]}, ${pixel[3] / 255})`
    setDrawColor(newColor)
  }

  const handleSaveDrawing = () => {
    const drawingName = prompt("Enter a name for your drawing:")
    if (!drawingName || savedDrawings.some((d) => d.name === drawingName)) {
      alert("Invalid or duplicate name. Please try again.")
      return
    }
    const svgData = new XMLSerializer().serializeToString(svgCanvasRef.current!)
    setSavedDrawings([...savedDrawings, { name: drawingName, data: svgData }])
    alert("Drawing saved successfully!")
  }

  const handleLoadDrawing = (index: number) => {
    const confirmLoad = confirm("This will overwrite the current canvas. Continue?")
    if (confirmLoad) {
      const drawing = savedDrawings[index]
      if (svgCanvasRef.current) {
        svgCanvasRef.current.innerHTML = drawing.data
      }
      alert("Drawing loaded successfully!")
    }
  }

  const handleDeleteDrawing = (index: number) => {
    if (confirm("Are you sure you want to delete this drawing?")) {
      const newSavedDrawings = [...savedDrawings]
      newSavedDrawings.splice(index, 1)
      setSavedDrawings(newSavedDrawings)
      alert("Drawing deleted successfully!")
    }
  }

  const handleExportDrawing = (index: number) => {
    const drawing = savedDrawings[index]
    if (!drawing || !drawing.data) {
      alert("No valid drawing data to export.")
      return
    }
    const blob = new Blob([drawing.data], { type: "image/svg+xml;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${drawing.name || "untitled"}.svg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleResetCanvas = () => {
    if (confirm("Are you sure you want to reset the canvas?")) {
      if (svgCanvasRef.current) {
        svgCanvasRef.current.innerHTML = ""
      }
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold ml-[8%]">Vector Paint 🚧</h1>
      </div>

      <div className="canvas-container">
        <svg
          ref={svgCanvasRef}
          id="drawingCanvas"
          className="canvas"
          style={{ width: "100%", height: "100%" }}
          onMouseDown={startDrawing}
          onMouseMove={moveDrawing}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        ></svg>

        <div className="toolbar">
          <Button
            id="drawBtn"
            className={`icon-btn ${isDrawActive ? "active" : ""}`}
            onClick={() => setIsDrawActive(!isDrawActive)}
          >
            <Brush className="h-4 w-4" />
          </Button>
          <Button id="sizeOpacityBtn" className="icon-btn" onClick={() => setIsSizeOpacityOpen(!isSizeOpacityOpen)}>
            <AlignJustify className="h-4 w-4" />
          </Button>
          <div
            id="colorPreview"
            className="icon-btn"
            style={{ backgroundColor: drawColor }}
            onClick={() => setIsColorPaletteOpen(!isColorPaletteOpen)}
          ></div>
          <Button id="saveDrawingBtn" className="icon-btn" onClick={handleSaveDrawing}>
            <Save className="h-4 w-4" />
          </Button>
          <Button id="loadDrawingBtn" className="icon-btn" onClick={() => setIsSavePanelOpen(!isSavePanelOpen)}>
            <Archive className="h-4 w-4" />
          </Button>
          <Button id="resetBtn" className="icon-btn" onClick={handleResetCanvas}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        {isSizeOpacityOpen && (
          <div className="sizeOpacityDiv open" id="sizeOpacityDiv">
            <span className="sizeOpacitySpan">Brush Size</span>
            <Slider
              id="lineSizeSlider"
              min={1}
              max={50}
              value={[lineWidth]}
              onValueChange={(value) => setLineWidth(value[0])}
            />
            <span className="sizeOpacitySpan">Opacity</span>
            <Slider
              id="opacitySlider"
              min={0.1}
              max={1}
              step={0.1}
              value={[opacity]}
              onValueChange={(value) => setOpacity(value[0])}
            />
          </div>
        )}

        {isSavePanelOpen && (
          <div className="savePanel open" id="savePanel">
            <div className="saved-drawings" id="savedDrawings">
              {savedDrawings.map((drawing, index) => (
                <div key={index} className="saved-drawing">
                  <span>{drawing.name}</span>
                  <Button onClick={() => handleLoadDrawing(index)}>
                    <Archive className="h-4 w-4" />
                  </Button>
                  <Button onClick={() => handleExportDrawing(index)}>
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button onClick={() => handleDeleteDrawing(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {isColorPaletteOpen && (
          <div className="colorPaletteDiv open" id="colorPaletteDiv">
            <canvas
              ref={colorPickerCanvasRef}
              id="colorPickerCanvas"
              width={280}
              height={280}
              onClick={handleColorPickerClick}
            ></canvas>
            <div
              ref={innerColorSquareRef}
              className="innerColorSquare"
              id="innerColorSquare"
              onClick={handleInnerColorSquareClick}
            ></div>
          </div>
        )}
      </div>
    </div>
  )
}

