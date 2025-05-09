"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Logo } from "@/components/ui/logo"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { CalendlyButton } from "@/components/calendly-button"

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isScrolled ? "bg-deep-black/90 backdrop-blur-lg py-3 border-b border-gold/10" : "bg-transparent py-5",
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Logo />

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-10">
          <Link
            href="/"
            className="text-white hover:text-gold transition-colors duration-300 text-sm uppercase tracking-widest font-light animated-underline"
          >
            Home
          </Link>
          <Link
            href="/about"
            className="text-white hover:text-gold transition-colors duration-300 text-sm uppercase tracking-widest font-light animated-underline"
          >
            About
          </Link>
          <Link
            href="/services"
            className="text-white hover:text-gold transition-colors duration-300 text-sm uppercase tracking-widest font-light animated-underline"
          >
            Services
          </Link>
          <Link
            href="/contact"
            className="text-white hover:text-gold transition-colors duration-300 text-sm uppercase tracking-widest font-light animated-underline"
          >
            Contact
          </Link>
          <CalendlyButton
            text="Book Consultation"
            className="outline-button px-6 py-2 text-sm uppercase tracking-widest font-light"
          />
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white hover:text-gold transition-colors duration-300"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-deep-black/95 backdrop-blur-lg border-b border-gold/10"
          >
            <nav className="container mx-auto px-4 py-8 flex flex-col space-y-6">
              <Link
                href="/"
                className="text-white hover:text-gold transition-colors duration-300 py-2 text-sm uppercase tracking-widest font-light"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/about"
                className="text-white hover:text-gold transition-colors duration-300 py-2 text-sm uppercase tracking-widest font-light"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/services"
                className="text-white hover:text-gold transition-colors duration-300 py-2 text-sm uppercase tracking-widest font-light"
                onClick={() => setMobileMenuOpen(false)}
              >
                Services
              </Link>
              <Link
                href="/contact"
                className="text-white hover:text-gold transition-colors duration-300 py-2 text-sm uppercase tracking-widest font-light"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <CalendlyButton
                text="Book Consultation"
                className="outline-button px-6 py-2 text-sm uppercase tracking-widest font-light text-center"
              />
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
