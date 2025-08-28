"use client"

import type React from "react"

import { PersonaProvider } from "@/contexts/persona-context"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <PersonaProvider>
      <FractalBackground />
      <main className="min-h-screen">{children}</main>
    </PersonaProvider>
  )
}
