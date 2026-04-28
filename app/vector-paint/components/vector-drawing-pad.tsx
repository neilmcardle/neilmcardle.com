"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import Toolbar from "./toolbar"
import SizeOpacityPanel from "./size-opacity-panel"
import SavePanel from "./save-panel"
import ColorPalette from "./color-palette"
import PaintbrushHint from "./paintbrush-hint"

export default function VectorDrawingPad() {
  const svgCanvasRef = useRef<SVGSVGElement>(null)
  const [drawColor, setDrawColor] = useState("#000000")
  const [lineWidth, setLineWidth] = useState(5)
  const [opacity, setOpacity] = useState(1.0)
  const [isDrawing, setIsDrawing] = useState(false)
  const [isDrawActive, setIsDrawActive] = useState(false)
  const [showSizeOpacity, setShowSizeOpacity] = useState(false)
  const [showColorPalette, setShowColorPalette] = useState(false)
  const [showSavePanel, setShowSavePanel] = useState(false)
  const [showHint, setShowHint] = useState(false) // Changed to false to hide the hint by default
  const [savedDrawings, setSavedDrawings] = useState<Array<{ name: string; data: string }>>([])
  const [savedHuePosition, setSavedHuePosition] = useState<{ x: number; y: number } | null>(null)
  const [savedSquarePosition, setSavedSquarePosition] = useState<{ x: number; y: number } | null>(null)

  // History for undo/redo
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  const currentPathRef = useRef<SVGPathElement | null>(null)
  const isFirefoxiOS = useRef<boolean>(false)

  // Check for Firefox on iOS
  useEffect(() => {
    // Firefox on iOS includes FxiOS in the user agent
    isFirefoxiOS.current =
      navigator.userAgent.includes("FxiOS") ||
      (navigator.userAgent.includes("Firefox") && navigator.userAgent.includes("iPhone"))
  }, [])

  // Initialize history with empty canvas
  useEffect(() => {
    if (svgCanvasRef.current) {
      const initialState = svgCanvasRef.current.innerHTML
      setHistory([initialState])
      setHistoryIndex(0)
    }
  }, [])

  // Load saved drawings from localStorage on component mount
  useEffect(() => {
    const savedDrawingsData = localStorage.getItem("vectorDrawings")
    if (savedDrawingsData) {
      try {
        setSavedDrawings(JSON.parse(savedDrawingsData))
      } catch (e) {
        console.error("Failed to load saved drawings:", e)
      }
    }
  }, [])

  // Save drawings to localStorage whenever they change
  useEffect(() => {
    if (savedDrawings.length > 0) {
      localStorage.setItem("vectorDrawings", JSON.stringify(savedDrawings))
    }
  }, [savedDrawings])

  // Add keyboard listener for Escape key to close panels
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowSizeOpacity(false)
        setShowColorPalette(false)
        setShowSavePanel(false)
      }

      // Undo with Ctrl+Z
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault()
        undoDrawing()
      }

      // Redo with Ctrl+Y or Ctrl+Shift+Z
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault()
        redoDrawing()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  // Add touch event listeners directly to the SVG element for Firefox iOS
  useEffect(() => {
    const svgCanvas = svgCanvasRef.current
    if (!svgCanvas) return

    const handleTouchStartDirect = (e: TouchEvent) => {
      if (!isDrawActive) return

      e.preventDefault()
      setIsDrawing(true)

      const rect = svgCanvas.getBoundingClientRect()
      const touch = e.touches[0]
      const x = touch.clientX - rect.left
      const y = touch.clientY - rect.top

      const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
      path.setAttribute("d", `M${x},${y}`)
      path.setAttribute("stroke", drawColor)
      path.setAttribute("stroke-opacity", opacity.toString())
      path.setAttribute("stroke-width", lineWidth.toString())
      path.setAttribute("fill", "none")
      path.setAttribute("stroke-linecap", "round")
      path.setAttribute("stroke-linejoin", "round")

      svgCanvas.appendChild(path)
      currentPathRef.current = path
    }

    const handleTouchMoveDirect = (e: TouchEvent) => {
      if (!isDrawing || !currentPathRef.current) return

      e.preventDefault()

      const rect = svgCanvas.getBoundingClientRect()
      const touch = e.touches[0]
      const x = touch.clientX - rect.left
      const y = touch.clientY - rect.top

      const d = currentPathRef.current.getAttribute("d")
      currentPathRef.current.setAttribute("d", `${d} L${x},${y}`)
    }

    const handleTouchEndDirect = () => {
      if (isDrawing && svgCanvas) {
        // Save to history when drawing stops
        const newState = svgCanvas.innerHTML

        // Only save if something changed
        if (history[historyIndex] !== newState) {
          // Remove any future history if we're in the middle of the history array
          const newHistory = history.slice(0, historyIndex + 1)
          setHistory([...newHistory, newState])
          setHistoryIndex(historyIndex + 1)
        }
      }

      setIsDrawing(false)
      currentPathRef.current = null
    }

    // Only add these direct event listeners if we're on Firefox iOS
    if (isFirefoxiOS.current) {
      svgCanvas.addEventListener("touchstart", handleTouchStartDirect, { passive: false })
      svgCanvas.addEventListener("touchmove", handleTouchMoveDirect, { passive: false })
      svgCanvas.addEventListener("touchend", handleTouchEndDirect)
      svgCanvas.addEventListener("touchcancel", handleTouchEndDirect)
    }

    return () => {
      if (isFirefoxiOS.current) {
        svgCanvas.removeEventListener("touchstart", handleTouchStartDirect)
        svgCanvas.removeEventListener("touchmove", handleTouchMoveDirect)
        svgCanvas.removeEventListener("touchend", handleTouchEndDirect)
        svgCanvas.removeEventListener("touchcancel", handleTouchEndDirect)
      }
    }
  }, [isDrawActive, isDrawing, drawColor, opacity, lineWidth, history, historyIndex])

  const getCoordinates = (
    e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>,
    isTouch = false,
  ): { x: number; y: number } | null => {
    const svgCanvas = svgCanvasRef.current
    if (!svgCanvas) return null

    const rect = svgCanvas.getBoundingClientRect()

    if (isTouch) {
      const touchEvent = e as React.TouchEvent<SVGSVGElement>
      if (touchEvent.touches.length === 0) return null

      const touch = touchEvent.touches[0]
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      }
    } else {
      const mouseEvent = e as React.MouseEvent<SVGSVGElement>
      return {
        x: mouseEvent.clientX - rect.left,
        y: mouseEvent.clientY - rect.top,
      }
    }
  }

  const startDrawing = (e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>, isTouch = false) => {
    if (!isDrawActive) return

    // Prevent scrolling on touch devices
    if (isTouch) {
      e.preventDefault()
    }

    setIsDrawing(true)
    const svgCanvas = svgCanvasRef.current
    if (!svgCanvas) return

    const coords = getCoordinates(e, isTouch)
    if (!coords) return

    const { x, y } = coords

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
    path.setAttribute("d", `M${x},${y}`)
    path.setAttribute("stroke", drawColor)
    path.setAttribute("stroke-opacity", opacity.toString())
    path.setAttribute("stroke-width", lineWidth.toString())
    path.setAttribute("fill", "none")
    path.setAttribute("stroke-linecap", "round")
    path.setAttribute("stroke-linejoin", "round")

    svgCanvas.appendChild(path)
    currentPathRef.current = path
  }

  const moveDrawing = (e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>, isTouch = false) => {
    if (!isDrawing || !currentPathRef.current) return

    // Prevent scrolling on touch devices
    if (isTouch) {
      e.preventDefault()
    }

    const svgCanvas = svgCanvasRef.current
    if (!svgCanvas) return

    const coords = getCoordinates(e, isTouch)
    if (!coords) return

    const { x, y } = coords

    const d = currentPathRef.current.getAttribute("d")
    currentPathRef.current.setAttribute("d", `${d} L${x},${y}`)
  }

  const stopDrawing = () => {
    if (isDrawing && svgCanvasRef.current) {
      // Save to history when drawing stops
      const newState = svgCanvasRef.current.innerHTML

      // Only save if something changed
      if (history[historyIndex] !== newState) {
        // Remove any future history if we're in the middle of the history array
        const newHistory = history.slice(0, historyIndex + 1)
        setHistory([...newHistory, newState])
        setHistoryIndex(historyIndex + 1)
      }
    }

    setIsDrawing(false)
    currentPathRef.current = null
  }

  const undoDrawing = () => {
    if (historyIndex > 0 && svgCanvasRef.current) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      svgCanvasRef.current.innerHTML = history[newIndex]
    }
  }

  const redoDrawing = () => {
    if (historyIndex < history.length - 1 && svgCanvasRef.current) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      svgCanvasRef.current.innerHTML = history[newIndex]
    }
  }

  const resetCanvas = () => {
    if (window.confirm("Are you sure you want to reset the canvas?")) {
      if (svgCanvasRef.current) {
        svgCanvasRef.current.innerHTML = ""

        // Add to history
        const newState = svgCanvasRef.current.innerHTML
        const newHistory = history.slice(0, historyIndex + 1)
        setHistory([...newHistory, newState])
        setHistoryIndex(historyIndex + 1)
      }
    }
  }

  const saveDrawing = () => {
    const drawingName = window.prompt("Enter a name for your drawing:")
    if (!drawingName || savedDrawings.some((d) => d.name === drawingName)) {
      alert("Invalid or duplicate name. Please try again.")
      return
    }

    if (svgCanvasRef.current) {
      const svgData = new XMLSerializer().serializeToString(svgCanvasRef.current)
      setSavedDrawings([...savedDrawings, { name: drawingName, data: svgData }])
      alert("Drawing saved successfully!")
    }
  }

  const loadSavedDrawing = (index: number) => {
    const confirmLoad = window.confirm("This will overwrite the current canvas. Continue?")
    if (confirmLoad && svgCanvasRef.current) {
      const drawing = savedDrawings[index]
      svgCanvasRef.current.innerHTML = drawing.data

      // Add to history
      const newState = svgCanvasRef.current.innerHTML
      const newHistory = history.slice(0, historyIndex + 1)
      setHistory([...newHistory, newState])
      setHistoryIndex(historyIndex + 1)

      alert("Drawing loaded successfully!")
    }
  }

  const deleteSavedDrawing = (index: number) => {
    if (window.confirm("Are you sure you want to delete this drawing?")) {
      const newDrawings = [...savedDrawings]
      newDrawings.splice(index, 1)
      setSavedDrawings(newDrawings)
      alert("Drawing deleted successfully!")
    }
  }

  const exportDrawing = (index: number) => {
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

  const toggleDrawActive = () => {
    setIsDrawActive(!isDrawActive)
    setShowHint(false)
  }

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent<SVGSVGElement>) => {
    // Skip if we're using direct event listeners for Firefox iOS
    if (isFirefoxiOS.current) return
    startDrawing(e, true)
  }

  const handleTouchMove = (e: React.TouchEvent<SVGSVGElement>) => {
    // Skip if we're using direct event listeners for Firefox iOS
    if (isFirefoxiOS.current) return
    moveDrawing(e, true)
  }

  const handleTouchEnd = () => {
    // Skip if we're using direct event listeners for Firefox iOS
    if (isFirefoxiOS.current) return
    stopDrawing()
  }

  return (
    <div className="relative w-full h-screen">
      <svg
        ref={svgCanvasRef}
        className="w-full h-full touch-none bg-white"
        onMouseDown={startDrawing}
        onMouseMove={moveDrawing}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      />

      {showHint && <PaintbrushHint />}

      <Toolbar
        isDrawActive={isDrawActive}
        showSizeOpacity={showSizeOpacity}
        showColorPalette={showColorPalette}
        showSavePanel={showSavePanel}
        toggleDrawActive={toggleDrawActive}
        toggleSizeOpacity={() => setShowSizeOpacity(!showSizeOpacity)}
        toggleColorPalette={() => setShowColorPalette(!showColorPalette)}
        toggleSavePanel={() => setShowSavePanel(!showSavePanel)}
        resetCanvas={resetCanvas}
        saveDrawing={saveDrawing}
        drawColor={drawColor}
        undoDrawing={undoDrawing}
        redoDrawing={redoDrawing}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
      />

      {showSizeOpacity && (
        <SizeOpacityPanel
          lineWidth={lineWidth}
          opacity={opacity}
          setLineWidth={setLineWidth}
          setOpacity={setOpacity}
          onClose={() => setShowSizeOpacity(false)}
        />
      )}

      {showSavePanel && (
        <SavePanel
          savedDrawings={savedDrawings}
          loadSavedDrawing={loadSavedDrawing}
          deleteSavedDrawing={deleteSavedDrawing}
          exportDrawing={exportDrawing}
          onClose={() => setShowSavePanel(false)}
        />
      )}

      {showColorPalette && (
        <ColorPalette
          drawColor={drawColor}
          setDrawColor={setDrawColor}
          onClose={() => setShowColorPalette(false)}
          savedHuePosition={savedHuePosition}
          savedSquarePosition={savedSquarePosition}
          setSavedHuePosition={setSavedHuePosition}
          setSavedSquarePosition={setSavedSquarePosition}
        />
      )}
    </div>
  )
}
