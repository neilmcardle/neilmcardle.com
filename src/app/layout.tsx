import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Nav from "@/components/nav"
import MobileHeader from "@/components/mobile-header"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Neil McArdle",
  description: "Personal website and projects of Neil McArdle",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex min-h-screen">
          <Nav />
          <main className="flex-1 md:ml-16 lg:ml-64 transition-all duration-300">
            <MobileHeader />
            <div className="p-8">{children}</div>
          </main>
        </div>
      </body>
    </html>
  )
}

