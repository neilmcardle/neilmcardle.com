import type { Metadata } from "next"
import ContactPageClient from "./ContactPageClient"

export const metadata: Metadata = {
  title: "Contact | BetterThings.design",
  description: "Get in touch to elevate your brand with premium branding services.",
}

export default function ContactPage() {
  return <ContactPageClient />
}
