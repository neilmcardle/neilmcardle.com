"use client"

import { usePersona } from "@/contexts/persona-context"

export function PersonaToggle() {
  const { persona, setPersona } = usePersona()

  return (
    <div className="flex items-center p-1 bg-gray-200 rounded-full">
      <button
        onClick={() => setPersona("digital")}
        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
          persona === "digital" ? "bg-black text-white" : "bg-transparent text-gray-500 hover:text-gray-700"
        }`}
      >
        Digital
      </button>
      <button
        onClick={() => setPersona("traditional")}
        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
          persona === "traditional" ? "bg-black text-white" : "bg-transparent text-gray-500 hover:text-gray-700"
        }`}
      >
        Traditional
      </button>
    </div>
  )
}
