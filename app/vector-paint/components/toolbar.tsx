"use client"

import { PaintbrushIcon, BarChart2, Save, Archive, RotateCcw, Undo, Redo } from "lucide-react"

interface ToolbarProps {
  isDrawActive: boolean
  showSizeOpacity: boolean
  showColorPalette: boolean
  showSavePanel: boolean
  toggleDrawActive: () => void
  toggleSizeOpacity: () => void
  toggleColorPalette: () => void
  toggleSavePanel: () => void
  resetCanvas: () => void
  saveDrawing: () => void
  drawColor: string
  undoDrawing: () => void
  redoDrawing: () => void
  canUndo: boolean
  canRedo: boolean
}

export default function Toolbar({
  isDrawActive,
  showSizeOpacity,
  showColorPalette,
  showSavePanel,
  toggleDrawActive,
  toggleSizeOpacity,
  toggleColorPalette,
  toggleSavePanel,
  resetCanvas,
  saveDrawing,
  drawColor,
  undoDrawing,
  redoDrawing,
  canUndo,
  canRedo,
}: ToolbarProps) {
  return (
    <div className="fixed bottom-16 left-0 right-0 mx-auto w-auto max-w-md flex justify-around p-4 z-30">
      <div className="flex flex-col items-center">
        <button
          className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl text-white mb-1 shadow-lg ${
            isDrawActive
              ? "bg-gradient-to-b from-[rgb(9,2,210)] via-[rgb(222,48,242)] to-[rgb(249,15,120)]"
              : "bg-gray-700 hover:bg-gray-600 active:border active:border-white"
          }`}
          onClick={toggleDrawActive}
        >
          <PaintbrushIcon size={18} />
        </button>
        <span className="text-gray-700 text-[10px] sm:text-xs font-medium">Brush</span>
      </div>

      <div className="flex flex-col items-center">
        <button
          className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl text-white mb-1 shadow-lg ${
            showSizeOpacity
              ? "bg-gradient-to-b from-[rgb(9,2,210)] via-[rgb(222,48,242)] to-[rgb(249,15,120)]"
              : "bg-gray-700 hover:bg-gray-600 active:border active:border-white"
          }`}
          onClick={toggleSizeOpacity}
        >
          <BarChart2 size={18} />
        </button>
        <span className="text-gray-700 text-[10px] sm:text-xs font-medium">Settings</span>
      </div>

      <div className="flex flex-col items-center">
        <button
          className={`w-10 h-10 sm:w-12 sm:h-12 border-2 ${showColorPalette ? "border-[rgb(222,48,242)]" : "border-white"} rounded-xl mb-1 shadow-lg`}
          style={{ backgroundColor: drawColor }}
          onClick={toggleColorPalette}
        />
        <span className="text-gray-700 text-[10px] sm:text-xs font-medium">Colour</span>
      </div>

      <div className="flex flex-col items-center">
        <button
          className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl text-white mb-1 shadow-lg ${
            canUndo
              ? "bg-gray-700 hover:bg-gray-600 active:border active:border-white"
              : "bg-gray-700 opacity-50 cursor-not-allowed"
          }`}
          onClick={undoDrawing}
          disabled={!canUndo}
        >
          <Undo size={18} />
        </button>
        <span className="text-gray-700 text-[10px] sm:text-xs font-medium">Undo</span>
      </div>

      <div className="flex flex-col items-center">
        <button
          className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl text-white mb-1 shadow-lg ${
            canRedo
              ? "bg-gray-700 hover:bg-gray-600 active:border active:border-white"
              : "bg-gray-700 opacity-50 cursor-not-allowed"
          }`}
          onClick={redoDrawing}
          disabled={!canRedo}
        >
          <Redo size={18} />
        </button>
        <span className="text-gray-700 text-[10px] sm:text-xs font-medium">Redo</span>
      </div>

      <div className="flex flex-col items-center">
        <button
          className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-700 hover:bg-gray-600 flex items-center justify-center rounded-xl text-white active:border active:border-white mb-1 shadow-lg"
          onClick={saveDrawing}
        >
          <Save size={18} />
        </button>
        <span className="text-gray-700 text-[10px] sm:text-xs font-medium">Save</span>
      </div>

      <div className="flex flex-col items-center">
        <button
          className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl text-white mb-1 shadow-lg ${
            showSavePanel
              ? "bg-gradient-to-b from-[rgb(9,2,210)] via-[rgb(222,48,242)] to-[rgb(249,15,120)]"
              : "bg-gray-700 hover:bg-gray-600 active:border active:border-white"
          }`}
          onClick={toggleSavePanel}
        >
          <Archive size={18} />
        </button>
        <span className="text-gray-700 text-[10px] sm:text-xs font-medium">Load</span>
      </div>

      <div className="flex flex-col items-center">
        <button
          className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-700 hover:bg-gray-600 flex items-center justify-center rounded-xl text-white active:border active:border-white mb-1 shadow-lg"
          onClick={resetCanvas}
        >
          <RotateCcw size={18} />
        </button>
        <span className="text-gray-700 text-[10px] sm:text-xs font-medium">Reset</span>
      </div>
    </div>
  )
}
