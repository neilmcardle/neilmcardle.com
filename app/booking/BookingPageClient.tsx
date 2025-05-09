"use client"

import { motion } from "framer-motion"
import { CalendlyInline } from "@/components/CalendlyInline"

export default function BookingPageClient() {
  return (
    <div className="min-h-screen pt-24 pb-16 relative">
      {/* Remove background pattern */}
      {/* <div className="absolute inset-0 luxury-diamond-pattern"></div> */}

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Book a Consultation</h1>
            <p className="text-xl text-gold mb-6">Schedule a time to discuss your branding needs</p>
            <div className="w-16 h-px bg-gradient-to-r from-gold/30 via-gold to-gold/30 mx-auto mb-6"></div>
            <p className="text-white/70 max-w-2xl mx-auto">
              Select a convenient time for your consultation. We'll discuss your brand vision, goals, and how we can
              elevate your brand identity.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="luxury-card p-6 md:p-8 relative overflow-hidden"
          >
            {/* Remove pattern overlay inside the card */}
            {/* <div className="absolute inset-0 luxury-diamond-pattern opacity-5"></div> */}

            <div className="relative z-10">
              <CalendlyInline />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
