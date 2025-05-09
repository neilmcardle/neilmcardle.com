import type { Metadata } from "next"
import BookingPageClient from "./BookingPageClient"

export const metadata: Metadata = {
  title: "Book a Consultation | BetterThings.design",
  description: "Schedule a consultation to discuss your branding needs with our design experts.",
}

export default function BookingPage() {
  return <BookingPageClient />
}
