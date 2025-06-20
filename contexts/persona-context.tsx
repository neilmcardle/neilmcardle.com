"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type PersonaType = "digital" | "traditional"

interface PersonaContextType {
  persona: PersonaType
  setPersona: (persona: PersonaType) => void
  togglePersona: () => void
}

const PersonaContext = createContext<PersonaContextType | undefined>(undefined)

export function PersonaProvider({ children }: { children: React.ReactNode }) {
  const [persona, setPersona] = useState<PersonaType>("digital")
  const [mounted, setMounted] = useState(false)

  // Initialize from localStorage when component mounts
  useEffect(() => {
    setMounted(true)
    const savedPersona = localStorage.getItem("persona") as PersonaType
    if (savedPersona && (savedPersona === "digital" || savedPersona === "traditional")) {
      setPersona(savedPersona)
    }
  }, [])

  // Save to localStorage when persona changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("persona", persona)
    }
  }, [persona, mounted])

  const togglePersona = () => {
    setPersona(persona === "digital" ? "traditional" : "digital")
  }

  return <PersonaContext.Provider value={{ persona, setPersona, togglePersona }}>{children}</PersonaContext.Provider>
}

export function usePersona() {
  const context = useContext(PersonaContext)
  if (context === undefined) {
    throw new Error("usePersona must be used within a PersonaProvider")
  }
  return context
}
