import type React from "react"

export default function FocusModeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // This layout doesn't include the site navigation
  // It just renders the children directly
  return <>{children}</>
}
