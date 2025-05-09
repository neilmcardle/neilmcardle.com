"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { CalendlyButton } from "@/components/calendly-button"

export default function AboutPageClient() {
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
            <h1 className="text-4xl md:text-5xl font-bold mb-4">About</h1>
            <div className="w-16 h-px bg-gradient-to-r from-gold/30 via-gold to-gold/30 mx-auto mb-6"></div>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-2 md:gap-0 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative md:pr-0 md:flex md:justify-end"
            >
              {/* Reduced image size with max-width and positioned to the right */}
              <div className="relative z-10 max-w-xs mx-auto md:mx-0 md:mr-4">
                <div className="relative overflow-hidden rounded-sm">
                  <Image
                    src="/images/me-social.png"
                    alt="Neil McArdle"
                    width={400}
                    height={400}
                    className="w-full h-auto object-cover rounded-full"
                    priority
                  />
                  {/* Soft vignette overlay */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: "radial-gradient(circle, transparent 40%, rgba(10, 10, 10, 0.4) 100%)",
                    }}
                  ></div>
                  {/* Gold border overlay */}
                  <div className="absolute inset-0 border border-gold/30 pointer-events-none"></div>
                </div>
                {/* Decorative elements - scaled down to match the new image size */}
                <div className="absolute -bottom-4 -right-4 w-full h-full border border-gold/20 z-0"></div>
                <div className="absolute -top-4 -left-4 w-20 h-20 border border-gold/10 z-0"></div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="space-y-6 md:pl-0"
            >
              <h2 className="text-3xl font-medium">Neil McArdle</h2>
              <div className="w-12 h-px bg-gradient-to-r from-gold to-transparent mb-6"></div>
              <p className="text-white/80 leading-relaxed">
                With over a decade of experience in design, I specialise in crafting distinctive brand identities that
                elevate luxury and heritage brands. My approach combines meticulous attention to detail with a deep
                understanding of what makes a brand truly resonate with its audience.
              </p>
              <p className="text-white/80 leading-relaxed">
                I believe that exceptional branding goes beyond aesthetics—it tells a compelling story, evokes emotion,
                and creates lasting impressions. Every project I undertake is approached with precision, purpose, and a
                commitment to excellence.
              </p>
              <p className="text-white/80 leading-relaxed">
                My work has helped transform businesses across various sectors, from boutique wellness brands to
                established heritage companies seeking to redefine their presence in the modern market.
              </p>
              <div className="pt-4">
                <CalendlyButton text="Book a Consultation" className="gold-button px-8 py-3 inline-block" />
              </div>
            </motion.div>
          </div>

          {/* Philosophy Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-24 luxury-card p-10 relative overflow-hidden"
          >
            <div className="relative z-10">
              <h2 className="text-2xl font-medium mb-6 text-center">Design Philosophy</h2>
              <div className="w-16 h-px bg-gradient-to-r from-gold/30 via-gold to-gold/30 mx-auto mb-8"></div>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full border border-gold/30 flex items-center justify-center mx-auto mb-4">
                    <span className="text-gold text-xl">01</span>
                  </div>
                  <h3 className="text-xl font-medium mb-3">Timeless Elegance</h3>
                  <p className="text-white/70">
                    Creating designs that transcend trends and maintain their impact and relevance for years to come.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full border border-gold/30 flex items-center justify-center mx-auto mb-4">
                    <span className="text-gold text-xl">02</span>
                  </div>
                  <h3 className="text-xl font-medium mb-3">Purposeful Simplicity</h3>
                  <p className="text-white/70">
                    Embracing refined minimalism where every element serves a purpose and contributes to the overall
                    narrative.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full border border-gold/30 flex items-center justify-center mx-auto mb-4">
                    <span className="text-gold text-xl">03</span>
                  </div>
                  <h3 className="text-xl font-medium mb-3">Authentic Connection</h3>
                  <p className="text-white/70">
                    Designing with empathy to create genuine emotional connections between brands and their audiences.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
