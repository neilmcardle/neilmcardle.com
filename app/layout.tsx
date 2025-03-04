import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ClientLayout } from "./client-layout"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Neil McArdle - Designer & Developer",
  description:
    "Portfolio of Neil McArdle, a designer with over 10 years of experience crafting thoughtful and engaging digital experiences.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ClientLayout>{children}</ClientLayout>
}



import './globals.css'