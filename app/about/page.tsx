import type { Metadata } from "next"
import AboutPageClient from "./AboutPageClient"

export const metadata: Metadata = {
  title: "About | BetterThings.design",
  description:
    "Meet the designer behind BetterThings.design - crafting premium brand identities with precision and purpose.",
}

export default function AboutPage() {
  return <AboutPageClient />
}
