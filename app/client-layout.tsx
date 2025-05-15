"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import "./globals.css"
import { Inter, Playfair_Display } from "next/font/google"
import { PersonaProvider } from "@/contexts/persona-context"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" })

export const ClientLayout = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const pathname = usePathname()
  const isEbookPage = pathname === "/make-ebook" || pathname === "/make-ebook/dashboard"
  const isBetterThingsPage = pathname === "/better-things"

  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className={inter.className}>
        <main className={`${!isEbookPage && !isBetterThingsPage ? "" : "min-h-screen"}`}>
          <PersonaProvider>{children}</PersonaProvider>
        </main>
      </body>
    </html>
  )
}

export default ClientLayout
