"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { TopNavigation } from "@/components/top-navigation"
import "./globals.css"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

export const ClientLayout = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const pathname = usePathname()
  const isEbookPage = pathname === "/make-ebook" || pathname === "/make-ebook/dashboard"
  const isBetterThingsPage = pathname === "/better-things"

  return (
    <html lang="en">
      <body className={inter.className}>
        {!isEbookPage && !isBetterThingsPage && <TopNavigation />}
        <main className={`min-h-screen ${!isEbookPage && !isBetterThingsPage ? "pt-28" : ""}`}>{children}</main>
      </body>
    </html>
  )
}

