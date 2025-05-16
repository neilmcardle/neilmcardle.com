"use client"

import type React from "react"

import { PersonaProvider } from "@/contexts/persona-context"
import FractalBackground from "@/components/FractalBackground"
import ElevenLabsAgent from "@/components/eleven-labs-agent"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <PersonaProvider>
      <FractalBackground />
      <main className="min-h-screen">{children}</main>
      <ElevenLabsAgent />
    </PersonaProvider>
  )
}
