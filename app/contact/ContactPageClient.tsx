"use client"

import { motion } from "framer-motion"
import { Mail } from "lucide-react"
import { CalendlyButton } from "@/components/calendly-button"

export default function ContactPageClient() {
  return (
    <div className="min-h-screen pt-24 pb-16 relative">
      {/* Remove background pattern */}
      {/* <div className="absolute inset-0 luxury-diamond-pattern"></div> */}

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact</h1>
            <div className="w-16 h-px bg-gradient-to-r from-gold/30 via-gold to-gold/30 mx-auto mb-6"></div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col items-center justify-center space-y-8"
          >
            <div className="flex items-center justify-center">
              <Mail className="h-5 w-5 text-gold mr-4" />
              <a href="mailto:hello@betterthings.design" className="hover:text-gold transition-colors">
                hello@betterthings.design
              </a>
            </div>

            <div className="w-16 h-px bg-gradient-to-r from-gold/30 via-gold to-gold/30 mx-auto my-6"></div>

            <CalendlyButton
              text="Book Consultation"
              className="gold-button px-10 py-4 text-sm uppercase tracking-widest inline-block"
            />
          </motion.div>
        </div>
      </div>
    </div>
  )
}
