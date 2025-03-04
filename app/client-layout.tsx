"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { TopNavigation } from "@/components/top-navigation"
import FractalBackground from "@/components/FractalBackground"
import "./globals.css"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

export const ClientLayout = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const pathname = usePathname()
  const isEbookPage = pathname === "/make-ebook"

  return (
    <html lang="en">
      <body className={inter.className}>
        <FractalBackground />
        {!isEbookPage && <TopNavigation />}
        <main className={`min-h-screen ${!isEbookPage ? "pt-24" : ""}`}>{children}</main>
      </body>
    </html>
  )
}

