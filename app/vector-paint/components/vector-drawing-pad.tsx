"use client"

import type React from "react"
import type { CSSProperties } from "react"

import { useEffect, useRef, useState } from "react"
import Toolbar from "./toolbar"
import SizeOpacityPanel from "./size-opacity-panel"
import SavePanel from "./save-panel"
import ColorPalette from "./color-palette"
import PaintbrushHint from "./paintbrush-hint"
import OrderPanel from "./order-panel"
import styles from "../vector-paint.module.css"
import {
  DEFAULT_PRODUCT_ID,
  VECTOR_PAINT_PRODUCTS,
  isProductActive,
  type VectorPaintProductId,
} from "@/lib/vector-paint/products"

interface SavedDrawing {
  name: string
  data: string
  format?: VectorPaintProductId
}

const DEFAULT_FORMAT: VectorPaintProductId = DEFAULT_PRODUCT_ID
const FORMAT_STORAGE_KEY = "vp_currentFormat"

export default function VectorDrawingPad() {
  const svgCanvasRef = useRef<SVGSVGElement>(null)
  const [drawColor, setDrawColor] = useState("#FF69B4")
  const [lineWidth, setLineWidth] = useState(32)
  const [opacity, setOpacity] = useState(1.0)
  const [isDrawing, setIsDrawing] = useState(false)
  const [isDrawActive, setIsDrawActive] = useState(true)
  const [isEraseActive, setIsEraseActive] = useState(false)
  const [showSizeOpacity, setShowSizeOpacity] = useState(false)
  const [showColorPalette, setShowColorPalette] = useState(false)
  const [showSavePanel, setShowSavePanel] = useState(false)
  const [showHint, setShowHint] = useState(false) // Changed to false to hide the hint by default
  const [savedDrawings, setSavedDrawings] = useState<Array<SavedDrawing>>([])
  const [orderingDrawing, setOrderingDrawing] = useState<SavedDrawing | null>(null)
  const [parentalGatePassed, setParentalGatePassed] = useState(false)
  const [currentFormat, setCurrentFormat] = useState<VectorPaintProductId>(DEFAULT_FORMAT)
  const [pendingUndo, setPendingUndo] = useState<{ drawing: SavedDrawing; index: number } | null>(null)
  const [undoSecondsLeft, setUndoSecondsLeft] = useState(0)
  const pendingUndoTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const undoTickInterval = useRef<ReturnType<typeof setInterval> | null>(null)
  const [savedHuePosition, setSavedHuePosition] = useState<{ x: number; y: number } | null>(null)
  const [savedSquarePosition, setSavedSquarePosition] = useState<{ x: number; y: number } | null>(null)

  // History for undo/redo
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  const currentPathRef = useRef<SVGPathElement | null>(null)
  const isFirefoxiOS = useRef<boolean>(false)
  const isErasingRef = useRef(false)
  const removedDuringEraseRef = useRef(false)

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

  // Load saved drawings from localStorage on component mount.
  // Normalize the format field so legacy entries (saved before the
  // canvas pivot, when A4 was the default) still resolve to a real
  // current product id rather than crashing the order panel.
  useEffect(() => {
    const savedDrawingsData = localStorage.getItem("vectorDrawings")
    if (!savedDrawingsData) return
    try {
      const parsed = JSON.parse(savedDrawingsData) as SavedDrawing[]
      const normalized = parsed.map((d) => ({
        ...d,
        format:
          d.format && VECTOR_PAINT_PRODUCTS[d.format as VectorPaintProductId]
            ? (d.format as VectorPaintProductId)
            : DEFAULT_FORMAT,
      }))
      setSavedDrawings(normalized)
    } catch (e) {
      console.error("Failed to load saved drawings:", e)
    }
  }, [])

  // Hydrate currentFormat from localStorage and stay in sync with the
  // top-nav dropdown via a window event so both stay aligned without
  // lifting state into a shared parent client component.
  useEffect(() => {
    const stored = localStorage.getItem(FORMAT_STORAGE_KEY) as VectorPaintProductId | null
    if (stored && VECTOR_PAINT_PRODUCTS[stored] && isProductActive(stored)) {
      setCurrentFormat(stored)
    }

    const onChange = (e: Event) => {
      const id = (e as CustomEvent<VectorPaintProductId>).detail
      if (id && VECTOR_PAINT_PRODUCTS[id] && isProductActive(id)) {
        setCurrentFormat(id)
      }
    }
    window.addEventListener("vp-format-changed", onChange)
    return () => window.removeEventListener("vp-format-changed", onChange)
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
    if (isEraseActive) {
      if (isTouch) e.preventDefault()
      const coords = getCoordinates(e, isTouch)
      if (!coords) return
      isErasingRef.current = true
      removedDuringEraseRef.current = false
      if (eraseAtPoint(coords.x, coords.y)) {
        removedDuringEraseRef.current = true
      }
      return
    }

    if (!isDrawActive) return

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
    if (isErasingRef.current) {
      if (isTouch) e.preventDefault()
      const coords = getCoordinates(e, isTouch)
      if (!coords) return
      if (eraseAtPoint(coords.x, coords.y)) {
        removedDuringEraseRef.current = true
      }
      return
    }

    if (!isDrawing || !currentPathRef.current) return

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
    if (isErasingRef.current) {
      isErasingRef.current = false
      if (removedDuringEraseRef.current) {
        pushHistory()
        removedDuringEraseRef.current = false
      }
      return
    }

    if (isDrawing && svgCanvasRef.current) {
      pushHistory()
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
    // No native confirm dialog — it's unreliable on some mobile browsers
    // and the reset is fully undoable via the history stack anyway.
    if (!svgCanvasRef.current) return
    svgCanvasRef.current.innerHTML = ""
    const newState = svgCanvasRef.current.innerHTML
    const newHistory = history.slice(0, historyIndex + 1)
    setHistory([...newHistory, newState])
    setHistoryIndex(historyIndex + 1)
  }

  const nextDrawingName = () => {
    let n = savedDrawings.length + 1
    while (savedDrawings.some((d) => d.name === `Drawing ${n}`)) n++
    return `Drawing ${n}`
  }

  // Capture a snapshot of the live SVG canvas as a SavedDrawing.
  // Inject viewBox + explicit dimensions so the saved SVG renders
  // correctly inside thumbnail boxes (the live canvas relies on CSS sizing).
  const captureSnapshot = (): SavedDrawing | null => {
    if (!svgCanvasRef.current) return null
    const svg = svgCanvasRef.current
    const rect = svg.getBoundingClientRect()
    const w = Math.max(1, Math.round(rect.width))
    const h = Math.max(1, Math.round(rect.height))
    const clone = svg.cloneNode(true) as SVGSVGElement
    clone.setAttribute("viewBox", `0 0 ${w} ${h}`)
    clone.setAttribute("width", String(w))
    clone.setAttribute("height", String(h))
    clone.removeAttribute("class")
    clone.removeAttribute("style")
    return {
      name: nextDrawingName(),
      data: new XMLSerializer().serializeToString(clone),
      format: currentFormat ?? DEFAULT_FORMAT,
    }
  }

  const saveDrawing = () => {
    const snap = captureSnapshot()
    if (!snap) return
    setSavedDrawings([...savedDrawings, snap])
    setShowSavePanel(true)
  }

  const renameSavedDrawing = (index: number, name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return
    setSavedDrawings((prev) => {
      if (prev.some((d, i) => i !== index && d.name === trimmed)) return prev
      const next = [...prev]
      next[index] = { ...next[index], name: trimmed }
      return next
    })
  }

  const loadSavedDrawing = (index: number) => {
    if (!svgCanvasRef.current) return
    const drawing = savedDrawings[index]
    if (!drawing) return

    // If the live canvas has strokes, snapshot first so the user
    // never loses work when opening another drawing. The auto-saved
    // entry appears in Memory Box with the next default name.
    let nextSaved = savedDrawings
    if (svgCanvasRef.current.children.length > 0) {
      const snap = captureSnapshot()
      if (snap) nextSaved = [...savedDrawings, snap]
    }

    // The saved SVG has fixed pixel width/height from when it was drawn.
    // Force it to scale fluidly so it fits whatever format the editor
    // is in now, preserving the original aspect ratio (centered, with
    // letterbox margins if the new canvas has a different aspect).
    let svgToInsert = drawing.data
    try {
      const doc = new DOMParser().parseFromString(drawing.data, "image/svg+xml")
      const inner = doc.documentElement
      if (inner.tagName.toLowerCase() === "svg") {
        inner.setAttribute("width", "100%")
        inner.setAttribute("height", "100%")
        inner.setAttribute("preserveAspectRatio", "xMidYMid meet")
        svgToInsert = new XMLSerializer().serializeToString(inner)
      }
    } catch {
      // Fall back to raw data if parsing fails — better to load the
      // drawing at its old size than not at all.
    }

    svgCanvasRef.current.innerHTML = svgToInsert
    if (nextSaved !== savedDrawings) setSavedDrawings(nextSaved)

    const newState = svgCanvasRef.current.innerHTML
    const newHistory = history.slice(0, historyIndex + 1)
    setHistory([...newHistory, newState])
    setHistoryIndex(historyIndex + 1)

    // Switch the editor to the loaded drawing's format if it has one.
    if (drawing.format && VECTOR_PAINT_PRODUCTS[drawing.format]) {
      setCurrentFormat(drawing.format)
      localStorage.setItem(FORMAT_STORAGE_KEY, drawing.format)
      window.dispatchEvent(new CustomEvent("vp-format-changed", { detail: drawing.format }))
    }

    // Close the Memory Box so the user immediately sees the loaded
    // drawing on the canvas — that's the feedback.
    setShowSavePanel(false)
  }

  const deleteSavedDrawing = (index: number) => {
    // Block stacked deletes — overwriting pendingUndo would silently
    // strand the previous drawing with no way to restore it. The UI
    // disables Delete buttons while the undo toast is up, but the
    // server-of-truth check stays here in case something slips through.
    if (pendingUndo) return

    const drawingToDelete = savedDrawings[index]
    if (!drawingToDelete) return

    if (pendingUndoTimer.current) clearTimeout(pendingUndoTimer.current)
    if (undoTickInterval.current) clearInterval(undoTickInterval.current)

    setSavedDrawings((prev) => prev.filter((_, i) => i !== index))
    setPendingUndo({ drawing: drawingToDelete, index })
    setUndoSecondsLeft(8)

    undoTickInterval.current = setInterval(() => {
      setUndoSecondsLeft((s) => Math.max(0, s - 1))
    }, 1000)

    pendingUndoTimer.current = setTimeout(() => {
      setPendingUndo(null)
      setUndoSecondsLeft(0)
      if (undoTickInterval.current) {
        clearInterval(undoTickInterval.current)
        undoTickInterval.current = null
      }
      pendingUndoTimer.current = null
    }, 8000)
  }

  const undoDelete = () => {
    if (!pendingUndo) return
    const { drawing, index } = pendingUndo
    setSavedDrawings((prev) => {
      const next = [...prev]
      next.splice(index, 0, drawing)
      return next
    })
    setPendingUndo(null)
    setUndoSecondsLeft(0)
    if (pendingUndoTimer.current) {
      clearTimeout(pendingUndoTimer.current)
      pendingUndoTimer.current = null
    }
    if (undoTickInterval.current) {
      clearInterval(undoTickInterval.current)
      undoTickInterval.current = null
    }
  }

  const toggleDrawActive = () => {
    const next = !isDrawActive
    setIsDrawActive(next)
    if (next) setIsEraseActive(false)
    setShowHint(false)
  }

  const toggleEraseActive = () => {
    const next = !isEraseActive
    setIsEraseActive(next)
    if (next) setIsDrawActive(false)
  }

  const pushHistory = () => {
    if (!svgCanvasRef.current) return
    const newState = svgCanvasRef.current.innerHTML
    if (history[historyIndex] === newState) return
    const newHistory = history.slice(0, historyIndex + 1)
    setHistory([...newHistory, newState])
    setHistoryIndex(historyIndex + 1)
  }

  // Erase mode: drag-to-rub interaction with a generous hit tolerance.
  // Whole-stroke erase only — true partial erase needs geometric path
  // chopping (Bezier intersections, segment splitting) which is a much
  // bigger undertaking. Hit-test samples each path along its length;
  // tolerance scales with stroke width so wide strokes still feel right
  // and tiny fingers can hit thin strokes.
  const eraseAtPoint = (x: number, y: number): boolean => {
    const svg = svgCanvasRef.current
    if (!svg) return false
    const tolerance = Math.max(12, lineWidth + 4)
    const tol2 = tolerance * tolerance
    const paths = Array.from(svg.querySelectorAll("path"))
    for (const p of paths) {
      const path = p as SVGPathElement
      let length = 0
      try {
        length = path.getTotalLength()
      } catch {
        continue
      }
      if (length === 0) continue
      const samples = Math.max(2, Math.min(200, Math.ceil(length / 4)))
      for (let i = 0; i <= samples; i++) {
        const t = (i / samples) * length
        const pt = path.getPointAtLength(t)
        const dx = pt.x - x
        const dy = pt.y - y
        if (dx * dx + dy * dy <= tol2) {
          path.remove()
          return true
        }
      }
    }
    return false
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

  const activeProduct = VECTOR_PAINT_PRODUCTS[currentFormat]
  const aspectRatioVar: CSSProperties = {
    "--vp-ratio": String(activeProduct.aspect.w / activeProduct.aspect.h),
    "--vp-size-scale": String(activeProduct.sizeScale),
  } as CSSProperties

  return (
    <div className="relative w-full h-full" style={aspectRatioVar}>
      <div className={styles.pageWrap}>
        <div className={styles.page}>
          <svg
            ref={svgCanvasRef}
            className="w-full h-full touch-none bg-white"
            style={isEraseActive ? { cursor: "pointer" } : undefined}
            onMouseDown={startDrawing}
            onMouseMove={moveDrawing}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
          />
        </div>
      </div>

      {showHint && <PaintbrushHint />}

      <Toolbar
        isDrawActive={isDrawActive}
        isEraseActive={isEraseActive}
        showSizeOpacity={showSizeOpacity}
        showColorPalette={showColorPalette}
        showSavePanel={showSavePanel}
        toggleDrawActive={toggleDrawActive}
        toggleEraseActive={toggleEraseActive}
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
          renameSavedDrawing={renameSavedDrawing}
          onOrderPrint={(index) => setOrderingDrawing(savedDrawings[index])}
          onClose={() => setShowSavePanel(false)}
          deleteDisabled={pendingUndo !== null}
        />
      )}

      {pendingUndo && (
        <div
          key={`${pendingUndo.index}-${pendingUndo.drawing.name}`}
          role="status"
          aria-live="polite"
          className={styles.undoToast}
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 80,
            display: "flex",
            alignItems: "center",
            gap: 14,
            background: "rgba(20,20,20,0.92)",
            color: "#ffffff",
            padding: "10px 12px 10px 16px",
            borderRadius: 999,
            boxShadow: "0 1px 2px rgba(0,0,0,0.06), 0 12px 32px rgba(0,0,0,0.18)",
            fontFamily: "var(--font-inter)",
            fontSize: 13,
            overflow: "hidden",
          }}
        >
          <span>Drawing deleted</span>
          <span
            aria-hidden
            style={{
              fontVariantNumeric: "tabular-nums",
              color: "rgba(255,255,255,0.65)",
              fontSize: 12,
              fontWeight: 500,
              minWidth: 22,
              textAlign: "center",
            }}
          >
            {undoSecondsLeft}s
          </span>
          <button
            onClick={undoDelete}
            style={{
              background: "rgba(255,255,255,0.14)",
              color: "#ffffff",
              border: "1px solid rgba(255,255,255,0.22)",
              borderRadius: 999,
              padding: "5px 12px",
              fontFamily: "inherit",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Undo
          </button>
          <span
            className={styles.undoProgress}
            aria-hidden
            style={{
              position: "absolute",
              left: 0,
              bottom: 0,
              height: 3,
              width: "100%",
              background: "rgba(255,255,255,0.85)",
              transformOrigin: "left center",
            }}
          />
        </div>
      )}

      {orderingDrawing && (
        <OrderPanel
          drawing={orderingDrawing}
          productId={orderingDrawing.format ?? DEFAULT_FORMAT}
          parentalGatePassed={parentalGatePassed}
          onParentalGatePassed={() => setParentalGatePassed(true)}
          onClose={() => setOrderingDrawing(null)}
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
