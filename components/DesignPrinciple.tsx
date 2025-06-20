import type React from "react"
import { cn } from "@/lib/utils"

interface DesignPrincipleProps {
  title: string
  description: string
  icon: React.ReactNode
  className?: string
}

export function DesignPrinciple({ title, description, icon, className }: DesignPrincipleProps) {
  return (
    <div
      className={cn(
        "backdrop-blur-md rounded-xl shadow-md p-5 transition-all duration-300 hover:shadow-lg bg-white/80",
        className,
      )}
    >
      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-3">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2 text-gray-800">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  )
}
