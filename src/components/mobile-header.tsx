"use client"

import { Menu } from "lucide-react"
import { useCallback } from "react"

export default function MobileHeader() {
  // Create a custom event to communicate with the Nav component
  const toggleMobileMenu = useCallback(() => {
    const event = new CustomEvent("toggleMobileMenu")
    window.dispatchEvent(event)
  }, [])

  return (
    <header className="md:hidden flex items-center h-16 px-8 border-b">
      <button onClick={toggleMobileMenu} className="p-2 hover:bg-gray-100 rounded-md transition-colors">
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle navigation menu</span>
      </button>
    </header>
  )
}

