"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import { CalendlyButton } from "@/components/calendly-button"

// Service data based on the provided comparison table
const services = [
  {
    id: "logo-design",
    title: "Logo Design",
    price: "£10,000",
    definition: "Creation of a symbol or wordmark representing a business.",
    scope: "Narrow – one visual mark (e.g. Nike swoosh).",
    deliverables: "Logo files, variations (e.g. icon-only, black and white).",
    focus: "Visual symbol for quick recognition.",
    disciplines: "Graphic design.",
  },
  {
    id: "identity-design",
    title: "Identity Design",
    price: "£20,000",
    definition: "Development of a cohesive visual system for a brand.",
    scope: "Medium – includes logo, colours, typography, imagery, layout.",
    deliverables: "Style guides, business cards, packaging, social media templates, etc.",
    focus: "Visual cohesion across touchpoints.",
    disciplines: "Graphic design, layout, systems thinking.",
  },
  {
    id: "branding-design",
    title: "Branding Design",
    price: "£35,000",
    definition: "Holistic strategy encompassing how a brand is perceived emotionally and visually.",
    scope: "Broad – includes identity design plus tone of voice, values, mission, experience, etc.",
    deliverables: "Brand strategy, messaging, brand guidelines, customer journey, etc.",
    focus: "Emotional and strategic relationship between brand and audience.",
    disciplines: "Graphic design, marketing, psychology, copywriting, UX.",
  },
]

export default function ServicesPageClient() {
  // Function to check for hash in URL and scroll to that element
  useEffect(() => {
    const hash = window.location.hash
    if (hash) {
      // Remove the # character
      const id = hash.substring(1)
      const element = document.getElementById(id)

      if (element) {
        // Wait a bit for the page to fully render before scrolling
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" })
        }, 300)
      }
    }
  }, [])

  return (
    <div className="min-h-screen pt-24 pb-16 relative">
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Services</h1>
            <div className="w-16 h-px bg-gradient-to-r from-gold/30 via-gold to-gold/30 mx-auto mb-6"></div>
          </motion.div>

          <div className="space-y-16">
            {services.map((service, index) => (
              <motion.div
                key={index}
                id={service.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="border border-gold/30 p-8 md:p-12 relative group rounded-[4px] overflow-hidden"
              >
                <div className="absolute -inset-px bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[4px]"></div>

                <div className="relative z-10">
                  <div className="mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold mb-2">{service.title}</h2>
                    <p className="text-2xl md:text-3xl text-gold">{service.price}</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                    <div className="space-y-2">
                      <h3 className="text-gold font-bold text-lg">Definition</h3>
                      <p className="text-white/80">{service.definition}</p>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-gold font-bold text-lg">Scope</h3>
                      <p className="text-white/80">{service.scope}</p>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-gold font-bold text-lg">Deliverables</h3>
                      <p className="text-white/80">{service.deliverables}</p>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-gold font-bold text-lg">Focus</h3>
                      <p className="text-white/80">{service.focus}</p>
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <h3 className="text-gold font-bold text-lg">Disciplines Involved</h3>
                      <p className="text-white/80">{service.disciplines}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Call to action */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-20 text-center"
          >
            <h2 className="text-2xl font-bold mb-6">Not Sure Which Service You Need?</h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              Book a consultation call and we'll discuss your specific needs to determine the best approach for your
              brand.
            </p>
            <CalendlyButton text="Schedule Consultation" className="gold-button px-10 py-4 text-lg inline-block" />
          </motion.div>
        </div>
      </div>
    </div>
  )
}
