import type { Metadata } from "next"
import ServicesPageClient from "./ServicesPageClient"

export const metadata: Metadata = {
  title: "Services | BetterThings.design",
  description: "Premium branding services for luxury wellness and heritage brands.",
}

export default function ServicesPage() {
  return <ServicesPageClient />
}
