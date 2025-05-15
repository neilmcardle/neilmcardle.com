"use client"

import { usePersona } from "@/contexts/persona-context"
import { cn } from "@/lib/utils"
import { Mouse } from "lucide-react"
import { PictureFrameIcon } from "@/components/PictureFrameIcon"

export function PersonaToggle() {
  const { persona, togglePersona } = usePersona()

  return (
    <div className="inline-flex p-1 rounded-full bg-gray-100 shadow-inner">
      <button
        onClick={togglePersona}
        className={cn(
          "relative flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300",
          persona === "digital"
            ? "bg-gradient-to-r from-[#d4b86a] to-[#f0d78a] text-black shadow-md"
            : "bg-transparent text-gray-500 hover:text-gray-700",
        )}
      >
        <Mouse className="h-4 w-4" />
        <span className="text-sm font-medium">Digital</span>
      </button>
      <button
        onClick={togglePersona}
        className={cn(
          "relative flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300",
          persona === "traditional"
            ? "bg-black text-white shadow-md"
            : "bg-transparent text-gray-500 hover:text-gray-700",
        )}
      >
        <PictureFrameIcon className="h-4 w-4" />
        <span className="text-sm font-medium">Traditional</span>
      </button>
    </div>
  )
}
