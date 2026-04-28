"use client"

import { Trash2, Download, ArchiveRestoreIcon as WindowRestore, X } from "lucide-react"

interface SavePanelProps {
  savedDrawings: Array<{ name: string; data: string }>
  loadSavedDrawing: (index: number) => void
  deleteSavedDrawing: (index: number) => void
  exportDrawing: (index: number) => void
  onClose: () => void
}

export default function SavePanel({
  savedDrawings,
  loadSavedDrawing,
  deleteSavedDrawing,
  exportDrawing,
  onClose,
}: SavePanelProps) {
  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-gray-800 p-4 rounded-xl z-30 w-[90%] max-w-[350px]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white text-lg font-bold">Memory Box</h3>
        <button onClick={onClose} className="text-white hover:bg-gray-700 rounded-full p-1" aria-label="Close panel">
          <X size={16} />
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {savedDrawings.length === 0 ? (
          <p className="text-white text-sm">No saved drawings yet.</p>
        ) : (
          savedDrawings.map((drawing, index) => (
            <div key={index} className="bg-gray-700 p-2 rounded-lg flex justify-between items-center">
              <span className="text-white flex-grow">{drawing.name}</span>

              <div className="flex items-center">
                <div className="flex flex-col items-center mx-1">
                  <button
                    onClick={() => loadSavedDrawing(index)}
                    className="bg-transparent border-none text-white cursor-pointer p-1 hover:bg-gray-600 rounded"
                    aria-label={`Load drawing: ${drawing.name}`}
                    title="Load drawing"
                  >
                    <WindowRestore size={14} />
                  </button>
                  <span className="text-white text-[10px] mt-0.5">Load</span>
                </div>

                <div className="flex flex-col items-center mx-1">
                  <button
                    onClick={() => exportDrawing(index)}
                    className="bg-transparent border-none text-white cursor-pointer p-1 hover:bg-gray-600 rounded"
                    aria-label={`Export drawing: ${drawing.name}`}
                    title="Export as SVG"
                  >
                    <Download size={14} />
                  </button>
                  <span className="text-white text-[10px] mt-0.5">Export</span>
                </div>

                <div className="flex flex-col items-center mx-1">
                  <button
                    onClick={() => deleteSavedDrawing(index)}
                    className="bg-transparent border-none text-white cursor-pointer p-1 hover:bg-gray-600 rounded"
                    aria-label={`Delete drawing: ${drawing.name}`}
                    title="Delete drawing"
                  >
                    <Trash2 size={14} />
                  </button>
                  <span className="text-white text-[10px] mt-0.5">Delete</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
