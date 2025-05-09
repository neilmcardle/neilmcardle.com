import type React from "react"
import type { Metadata } from "next"
import { Cormorant, Montserrat } from "next/font/google"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ScrollReset } from "@/components/scroll-reset"
import "./globals.css"

// Load Cormorant as our serif font (more refined than Playfair)
const cormorant = Cormorant({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
  weight: ["300", "400", "500", "600", "700"],
})

// Load Montserrat as our sans-serif font (more distinctive than Raleway)
const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-raleway",
  weight: ["200", "300", "400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "BetterThings.design | Bespoke Luxury Branding",
  description: "Exquisite branding for discerning luxury and heritage brands. Crafted with precision and elegance.",
  icons: {
    icon: "/images/better-things-logo.svg",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${montserrat.variable}`}>
      <body className="bg-deep-black text-white">
        <ScrollReset />
        <Navigation />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
