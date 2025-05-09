"use client"

import { useEffect, useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { CalendlyButton } from "@/components/calendly-button"

export default function Home() {
  // Refs for each section
  const heroRef = useRef(null)
  const servicesRef = useRef(null)
  const portfolioRef = useRef(null)
  const testimonialsRef = useRef(null)
  const ctaRef = useRef(null)

  // Parallax effects for each section
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  })

  const { scrollYProgress: servicesProgress } = useScroll({
    target: servicesRef,
    offset: ["start end", "end start"],
  })

  const { scrollYProgress: portfolioProgress } = useScroll({
    target: portfolioRef,
    offset: ["start end", "end start"],
  })

  const { scrollYProgress: testimonialsProgress } = useScroll({
    target: testimonialsRef,
    offset: ["start end", "end start"],
  })

  const { scrollYProgress: ctaProgress } = useScroll({
    target: ctaRef,
    offset: ["start end", "end start"],
  })

  // Transform values for parallax effects
  const heroOpacity = useTransform(heroProgress, [0, 0.5], [1, 0])
  const heroScale = useTransform(heroProgress, [0, 0.5], [1, 0.8])
  const heroY = useTransform(heroProgress, [0, 1], [0, 200])

  const servicesY = useTransform(servicesProgress, [0, 1], [0, 100])
  const portfolioY = useTransform(portfolioProgress, [0, 1], [0, 100])
  const testimonialsY = useTransform(testimonialsProgress, [0, 1], [0, 100])
  const ctaY = useTransform(ctaProgress, [0, 1], [0, 100])

  // Parallax effect for background elements
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const patternElements = document.querySelectorAll(".parallax-pattern")

      patternElements.forEach((element, index) => {
        const speed = index % 2 === 0 ? 0.05 : -0.05
        const yPos = scrollY * speed
        element.style.transform = `translateY(${yPos}px)`
      })
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 bg-deep-black z-0"></div>

        {/* Content */}
        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
          className="container mx-auto px-4 relative z-10 pt-20 text-center"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="max-w-4xl mx-auto"
          >
            {/* Logo element - Updated to make the inside transparent */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-32 h-32 mx-auto mb-10 group"
            >
              <svg
                viewBox="0 0 73.68 73.68"
                className="h-full w-full text-gold transition-all duration-500 group-hover:text-transparent"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
              >
                <defs>
                  <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#D4B86A" />
                    <stop offset="50%" stopColor="#E6D296" />
                    <stop offset="100%" stopColor="#D4B86A" />
                  </linearGradient>
                  <linearGradient id="shimmerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                    <stop offset="50%" stopColor="rgba(255,255,255,0.2)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                  </linearGradient>
                  <mask id="shimmerMask">
                    <rect
                      x="0"
                      y="0"
                      width="200%"
                      height="100%"
                      fill="url(#shimmerGradient)"
                      className="animate-shimmer"
                    >
                      <animate attributeName="x" from="-100%" to="100%" dur="2s" begin="0s" repeatCount="indefinite" />
                    </rect>
                  </mask>
                </defs>
                <rect
                  x="4"
                  y="4"
                  width="65.68"
                  height="65.68"
                  stroke="url(#logoGradient)"
                  fill="transparent"
                  className="transition-all duration-500"
                />
                <rect
                  x="4"
                  y="4"
                  width="65.68"
                  height="65.68"
                  stroke="none"
                  fill="url(#logoGradient)"
                  fillOpacity="0"
                  mask="url(#shimmerMask)"
                  className="transition-all duration-500 opacity-0 group-hover:opacity-100"
                />
              </svg>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-sm uppercase tracking-[0.3em] text-gold mb-6"
            >
              Design Studio
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-4xl md:text-6xl lg:text-7xl font-light mb-8 leading-tight max-w-5xl mx-auto"
            >
              <span className="block">Crafting Timeless</span>
              <span className="text-gradient-gold font-medium">Brand Identities</span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="w-24 h-px bg-gradient-to-r from-gold/30 via-gold to-gold/30 mx-auto mb-8"
            ></motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="text-lg md:text-xl text-white/80 mb-12 max-w-2xl mx-auto font-light leading-relaxed"
            >
              Elevating heritage and luxury brands with meticulous attention to detail and uncompromising excellence.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16"
            >
              <CalendlyButton
                text="Book Consultation"
                className="gold-button px-10 py-4 text-sm uppercase tracking-widest"
              />

              <Link href="/services" className="outline-button px-10 py-4 text-sm uppercase tracking-widest">
                View Services
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center"
        >
          <span className="text-gold/60 text-xs uppercase tracking-widest mb-2">Scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-gold to-transparent"></div>
        </motion.div>
      </section>

      {/* Rest of the code remains unchanged */}
      {/* Services Preview Section - Further adjusted spacing */}
      <section ref={servicesRef} className="pt-10 pb-20 bg-charcoal relative overflow-hidden">
        {/* Keep the luxury pattern in the grey background section */}
        <div className="absolute inset-0 luxury-diamond-pattern"></div>

        <motion.div style={{ y: servicesY }} className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl md:text-4xl font-light mb-4">
              Our <span className="text-gold font-medium">Services</span>
            </h2>
            <div className="w-16 h-px bg-gradient-to-r from-gold/30 via-gold to-gold/30 mx-auto mb-6"></div>
            <p className="text-white/70 max-w-2xl mx-auto">
              Comprehensive branding solutions tailored for discerning luxury and heritage brands.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[
              {
                title: "Logo Design",
                price: "£10,000",
                description: "Distinctive visual marks crafted with precision and purpose.",
                id: "logo-design",
              },
              {
                title: "Identity Design",
                price: "£20,000",
                description: "Cohesive visual systems that embody your brand's essence.",
                id: "identity-design",
              },
              {
                title: "Branding Design",
                price: "£35,000",
                description: "Comprehensive strategy and visual identity for discerning brands.",
                id: "branding-design",
              },
            ].map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="luxury-card p-8 group"
              >
                <div className="mb-6">
                  <h3 className="text-2xl font-medium mb-2">{service.title}</h3>
                  <p className="text-gold">{service.price}</p>
                </div>
                <p className="text-white/70 mb-8 font-light">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Portfolio Section - Add this new section */}
      <section ref={portfolioRef} className="pt-10 pb-20 bg-deep-black relative overflow-hidden">
        <motion.div style={{ y: portfolioY }} className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-light mb-4">
              Featured <span className="text-gold font-medium">Work</span>
            </h2>
            <div className="w-16 h-px bg-gradient-to-r from-gold/30 via-gold to-gold/30 mx-auto mb-6"></div>
            <p className="text-white/70 max-w-2xl mx-auto">
              Distinctive brand identities crafted for exceptional clients.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
            {/* Gatewick Gardens */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="luxury-card p-8 md:p-10 flex flex-col items-center"
            >
              <div className="w-48 h-48 mb-8 relative flex items-center justify-center">
                <Image
                  src="/images/gatewick-house-logo.png"
                  alt="Gatewick Gardens Logo"
                  width={150}
                  height={150}
                  className="object-contain"
                />
              </div>
              <h3 className="text-2xl font-medium mb-3 text-center">Gatewick Gardens</h3>
              <p className="text-gold text-sm mb-4 text-center">Logo Design</p>
              <p className="text-white/70 text-center mb-8">
                A distinctive brand identity for an exclusive garden estate, blending heritage with contemporary
                elegance.
              </p>
            </motion.div>

            {/* NUK SOO */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="luxury-card p-8 md:p-10 flex flex-col items-center"
            >
              <div className="w-48 h-48 mb-8 relative flex items-center justify-center">
                <Image
                  src="/images/nuk-soo-logo.png"
                  alt="NUK SOO Logo"
                  width={150}
                  height={150}
                  className="object-contain"
                />
              </div>
              <h3 className="text-2xl font-medium mb-3 text-center">NUK SOO</h3>
              <p className="text-gold text-sm mb-4 text-center">Logo Design</p>
              <p className="text-white/70 text-center mb-8">
                Premium branding for a luxury wellness brand, capturing the essence of holistic wellbeing.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Testimonial Section - Further adjusted spacing */}
      <section ref={testimonialsRef} className="pt-10 pb-20 bg-charcoal relative overflow-hidden">
        {/* Add pattern background to testimonials section */}
        <div className="absolute inset-0 luxury-diamond-pattern"></div>

        <motion.div style={{ y: testimonialsY }} className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl md:text-4xl font-light mb-4">
              Client <span className="text-gold font-medium">Testimonials</span>
            </h2>
            <div className="w-16 h-px bg-gradient-to-r from-gold/30 via-gold to-gold/30 mx-auto mb-6"></div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
            {/* First Testimonial - Dan Roberts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="luxury-card p-8 md:p-10"
            >
              <div className="mb-8">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gold/30"
                >
                  <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path>
                  <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"></path>
                </svg>
              </div>
              <p className="text-lg font-light text-white/90 italic mb-8 leading-relaxed">
                "Neil is a talented designer who has an impressive work ethic. He has assisted on number of key design
                projects for our brand and he over-delivers each and every time! Neil is a delight to work with and I
                can't recommend him enough."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4 border border-gold/20">
                  <Image
                    src="/images/dan-roberts.png"
                    alt="Dan Roberts"
                    width={48}
                    height={48}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="text-left">
                  <p className="font-medium">Dan Roberts</p>
                  <p className="text-gold/80 text-sm">NUK SOO</p>
                </div>
              </div>
            </motion.div>

            {/* Second Testimonial - Guy Sanderson */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="luxury-card p-8 md:p-10"
            >
              <div className="mb-8">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gold/30"
                >
                  <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path>
                  <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"></path>
                </svg>
              </div>
              <p className="text-lg font-light text-white/90 italic mb-8 leading-relaxed">
                "I really enjoyed working with Neil. His skill brought my vision to life and he was happy to adapt and
                refine ideas until we had a logo and signage that perfectly suit Gatewick Gardens. I'm thrilled with the
                result."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4 border border-gold/20">
                  <Image
                    src="/images/gatewick-house.png"
                    alt="Gatewick House"
                    width={48}
                    height={48}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="text-left">
                  <p className="font-medium">Guy Sanderson</p>
                  <p className="text-gold/80 text-sm">Gatewick Gardens</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* CTA Section - Further adjusted spacing */}
      <section ref={ctaRef} className="pt-10 pb-20 bg-deep-black relative overflow-hidden">
        <motion.div style={{ y: ctaY }} className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-light mb-6">
              Ready to Elevate Your <span className="text-gold font-medium">Brand?</span>
            </h2>
            <div className="w-16 h-px bg-gradient-to-r from-gold/30 via-gold to-gold/30 mx-auto mb-6"></div>
            <p className="text-white/70 mb-10 font-light">
              Schedule a consultation to discuss how we can craft a distinctive luxury identity for your brand.
            </p>
            <CalendlyButton
              text="Book Consultation"
              className="gold-button px-10 py-4 text-sm uppercase tracking-widest inline-block mb-12"
            />
          </motion.div>
        </motion.div>
      </section>
    </div>
  )
}
