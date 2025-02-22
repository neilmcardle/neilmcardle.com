"use client"

import React, { useState, useEffect, useRef } from "react"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Undo, Redo, Trash, Save, Upload, X } from "lucide-react"
import "./icon-creator.css"
import ReactDOM from "react-dom/client"

interface Shape {
  type: string
  attributes: { [key: string]: string | number }
}

interface Point {
  x: number
  y: number
}

export default function IconCreator() {
  const svgRef = useRef<SVGSVGElement>(null)
  const shapesGroupRef = useRef<SVGGElement>(null)
  const previewRef = useRef<SVGGElement>(null)
  const [shapeType, setShapeType] = useState("line")
  const [strokeWidth, setStrokeWidth] = useState(2)
  const [useRoundedCaps, setUseRoundedCaps] = useState(false)
  const [savedIcons, setSavedIcons] = useState<string[]>([])
  const [currentIcon, setCurrentIcon] = useState("")
  const [undoStack, setUndoStack] = useState<Shape[][]>([])
  const [redoStack, setRedoStack] = useState<Shape[][]>([])
  const [shapes, setShapes] = useState<Shape[]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPoint, setStartPoint] = useState<Point | null>(null)
  const [currentPoint, setCurrentPoint] = useState<Point | null>(null)

  useEffect(() => {
    if (svgRef.current) {
      createGrid()
    }
    loadSavedIcons()
  }, [])

  // Update preview when drawing
  useEffect(() => {
    if (isDrawing && startPoint && currentPoint && previewRef.current) {
      const preview = createShape(startPoint, currentPoint)
      if (preview) {
        const { type, attributes } = preview
        const element = document.createElementNS("http://www.w3.org/2000/svg", type)
        Object.entries(attributes).forEach(([key, value]) => {
          element.setAttribute(key, value.toString())
        })
        previewRef.current.innerHTML = ""
        previewRef.current.appendChild(element)
      }
    } else if (previewRef.current) {
      previewRef.current.innerHTML = ""
    }
  }, [isDrawing, startPoint, currentPoint])

  const createGrid = () => {
    const svg = svgRef.current
    const gridGroup = svg?.getElementById("grid") as SVGGElement
    if (!svg || !gridGroup) return

    const gridSize = 24
    const gridLines: JSX.Element[] = []

    for (let i = 0; i <= gridSize; i++) {
      gridLines.push(<line key={`v-${i}`} x1={i} y1={0} x2={i} y2={gridSize} className="grid-line" />)
      gridLines.push(<line key={`h-${i}`} x1={0} y1={i} x2={gridSize} y2={i} className="grid-line" />)
    }

    const gridFragment = <React.Fragment>{gridLines}</React.Fragment>
    ReactDOM.createRoot(gridGroup).render(gridFragment)
  }

  const snapToGrid = (point: Point): Point => {
    return {
      x: Math.round(point.x),
      y: Math.round(point.y),
    }
  }

  const getSVGPoint = (e: React.MouseEvent<SVGSVGElement>): Point | null => {
    const svg = svgRef.current
    if (!svg) return null

    const point = svg.createSVGPoint()
    point.x = e.clientX
    point.y = e.clientY
    const svgPoint = point.matrixTransform(svg.getScreenCTM()?.inverse())
    return snapToGrid(svgPoint)
  }

  const createShape = (start: Point, end: Point): Shape | null => {
    switch (shapeType) {
      case "line":
        return {
          type: "line",
          attributes: {
            x1: start.x,
            y1: start.y,
            x2: end.x,
            y2: end.y,
            stroke: "black",
            strokeWidth,
            strokeLinecap: useRoundedCaps ? "round" : "butt",
          },
        }
      case "circle":
        const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2))
        return {
          type: "circle",
          attributes: {
            cx: start.x,
            cy: start.y,
            r: radius,
            stroke: "black",
            strokeWidth,
            fill: "none",
          },
        }
      case "rectangle":
        return {
          type: "rect",
          attributes: {
            x: Math.min(start.x, end.x),
            y: Math.min(start.y, end.y),
            width: Math.abs(end.x - start.x),
            height: Math.abs(end.y - start.y),
            stroke: "black",
            strokeWidth,
            fill: "none",
          },
        }
      default:
        return null
    }
  }

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    const point = getSVGPoint(e)
    if (!point) return

    setStartPoint(point)
    setCurrentPoint(point)
    setIsDrawing(true)
  }

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const point = getSVGPoint(e)
    if (!point) return

    if (isDrawing) {
      setCurrentPoint(point)
    }
  }

  const handleMouseUp = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDrawing || !startPoint || !currentPoint) return

    const shape = createShape(startPoint, currentPoint)
    if (shape) {
      const newShapes = [...shapes, shape]
      setShapes(newShapes)
      setUndoStack([...undoStack, shapes])
      setRedoStack([])
    }

    setIsDrawing(false)
    setStartPoint(null)
    setCurrentPoint(null)
  }

  const handleMouseLeave = () => {
    setIsDrawing(false)
    setStartPoint(null)
    setCurrentPoint(null)
  }

  const loadSavedIcons = () => {
    const icons = Object.keys(localStorage).filter((key) => key.startsWith("icon_"))
    setSavedIcons(icons.map((key) => key.replace("icon_", "")))
  }

  const handleUndo = () => {
    if (undoStack.length > 0) {
      const previousShapes = undoStack[undoStack.length - 1]
      setRedoStack([...redoStack, shapes])
      setShapes(previousShapes)
      setUndoStack(undoStack.slice(0, -1))
    }
  }

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const nextShapes = redoStack[redoStack.length - 1]
      setUndoStack([...undoStack, shapes])
      setShapes(nextShapes)
      setRedoStack(redoStack.slice(0, -1))
    }
  }

  const handleClear = () => {
    setUndoStack([...undoStack, shapes])
    setRedoStack([])
    setShapes([])
  }

  const handleSave = () => {
    const iconName = prompt("Enter a name for your icon:")
    if (iconName) {
      localStorage.setItem(`icon_${iconName}`, JSON.stringify(shapes))
      loadSavedIcons()
    }
  }

  const handleLoad = () => {
    if (currentIcon) {
      const loadedIcon = localStorage.getItem(`icon_${currentIcon}`)
      if (loadedIcon) {
        const parsedShapes = JSON.parse(loadedIcon)
        setUndoStack([...undoStack, shapes])
        setRedoStack([])
        setShapes(parsedShapes)
      }
    }
  }

  const handleDelete = () => {
    if (currentIcon) {
      localStorage.removeItem(`icon_${currentIcon}`)
      loadSavedIcons()
      setCurrentIcon("")
    }
  }

  const handleExport = () => {
    const svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        ${shapes
          .map((shape) => {
            const { type, attributes } = shape
            const attrs = Object.entries(attributes)
              .map(([key, value]) => `${key}="${value}"`)
              .join(" ")
            return `<${type} ${attrs} />`
          })
          .join("\n")}
      </svg>
    `
    const blob = new Blob([svgContent], { type: "image/svg+xml" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "icon.svg"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Icon Creator 🚧</h1>

      <svg
        ref={svgRef}
        id="svg-grid"
        width="480"
        height="480"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        className="border border-gray-300 rounded-lg shadow-md mb-6"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <g id="grid"></g>
        <g id="keyline-template">
          <line x1="0" y1="0" x2="24" y2="24" className="template-line" />
          <line x1="0" y1="24" x2="24" y2="0" className="template-line" />
          <circle cx="12" cy="12" r="10" className="template-circle" />
          <circle cx="12" cy="12" r="4" className="template-circle" />
          <rect x="0" y="0" width="24" height="24" className="template-square" />
          <rect x="3" y="3" width="18" height="18" className="rounded-rect" />
          <rect x="2" y="4" width="20" height="16" className="rounded-rect" />
          <rect x="4" y="2" width="16" height="20" className="rounded-rect" />
        </g>
        <g ref={shapesGroupRef} id="shapes">
          {shapes.map((shape, index) => {
            const { type, attributes } = shape
            return React.createElement(type, { key: index, ...attributes })
          })}
        </g>
        <g ref={previewRef} id="preview" className="preview-shape"></g>
      </svg>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <Label htmlFor="shape-select">Shape</Label>
          <Select value={shapeType} onValueChange={setShapeType}>
            <SelectTrigger id="shape-select">
              <SelectValue placeholder="Select shape" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="line">Line</SelectItem>
              <SelectItem value="circle">Circle</SelectItem>
              <SelectItem value="rectangle">Rectangle</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="stroke-width">Stroke Width</Label>
          <Slider
            id="stroke-width"
            value={[strokeWidth]}
            onValueChange={(value) => setStrokeWidth(value[0])}
            min={0.2}
            max={10}
            step={0.1}
          />
        </div>

        <div className="flex items-center">
          <Label htmlFor="rounded-caps" className="flex items-center space-x-2 cursor-pointer">
            <Input
              id="rounded-caps"
              type="checkbox"
              checked={useRoundedCaps}
              onChange={(e) => setUseRoundedCaps(e.target.checked)}
              className="w-4 h-4"
            />
            <span>Rounded Caps</span>
          </Label>
        </div>

        <div>
          <Label htmlFor="load-icon-select">Saved Icons</Label>
          <Select value={currentIcon} onValueChange={setCurrentIcon}>
            <SelectTrigger id="load-icon-select">
              <SelectValue placeholder="Select icon" />
            </SelectTrigger>
            <SelectContent>
              {savedIcons.map((icon) => (
                <SelectItem key={icon} value={icon}>
                  {icon}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <Button onClick={handleUndo} disabled={undoStack.length === 0}>
          <Undo className="mr-2 h-4 w-4" /> Undo
        </Button>
        <Button onClick={handleRedo} disabled={redoStack.length === 0}>
          <Redo className="mr-2 h-4 w-4" /> Redo
        </Button>
        <Button onClick={handleClear}>
          <Trash className="mr-2 h-4 w-4" /> Clear
        </Button>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" /> Save
        </Button>
        <Button onClick={handleLoad} disabled={!currentIcon}>
          <Upload className="mr-2 h-4 w-4" /> Load
        </Button>
        <Button onClick={handleDelete} disabled={!currentIcon}>
          <X className="mr-2 h-4 w-4" /> Delete
        </Button>
        <Button onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" /> Export
        </Button>
      </div>
    </div>
  )
}

