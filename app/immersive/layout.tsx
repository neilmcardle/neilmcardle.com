import type React from "react"
import { Inter } from "next/font/google"
import "../../styles/immersive.css"

const inter = Inter({ subsets: ["latin"] })

export default function ImmersiveLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className={`${inter.className} min-h-screen`}>{children}</div>
}
