import type React from "react";
import type { Metadata } from "next";
import "./globals.css";
import "../styles/immersive.css";
import "../styles/vendor/draft-js.css";
import "../styles/vendor/google-fonts.css";
import { AuthProvider } from "@/lib/hooks/useAuth";
import { SubscriptionProvider } from "@/lib/hooks/useSubscription";
import { ThemeProvider } from "@/lib/contexts/ThemeContext";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import ClientFooterWrapper from "@/components/ClientFooterWrapper";
import { Analytics } from "@vercel/analytics/next";

const TITLE = "Neil McArdle · Product Designer";
const DESCRIPTION =
  "Product designer from the UK. I make complex tools feel effortless. Building makeEbook, Icon Animator and Promptr.";

export const metadata: Metadata = {
  metadataBase: new URL("https://neilmcardle.com"),
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: "https://neilmcardle.com",
  },
  generator: "",
  icons: {
    icon: [
      { url: "/n-favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/n-favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/n-favicon.ico",
    apple: "/n-apple-touch-icon.png",
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://neilmcardle.com",
    siteName: "Neil McArdle",
    type: "website",
    locale: "en_GB",
    // images are auto-injected by Next.js from app/opengraph-image.tsx
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    creator: "@BetterNeil",
    // images auto-injected from app/opengraph-image.tsx (reused as twitter image)
  },
};

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": "https://neilmcardle.com/#person",
  name: "Neil McArdle",
  url: "https://neilmcardle.com",
  jobTitle: "Product Designer",
  description: DESCRIPTION,
  email: "mailto:neil@neilmcardle.com",
  image: "https://neilmcardle.com/me.png",
  nationality: "British",
  sameAs: [
    "https://www.linkedin.com/in/neilmcardle/",
    "https://github.com/neilmcardle",
    "https://x.com/BetterNeil",
    "https://medium.com/@BetterNeil",
  ],
  knowsAbout: [
    "Product Design",
    "Software Design",
    "User Experience",
    "EPUB",
    "Self-Publishing",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans" style={{ fontFamily: 'var(--font-inter)' }}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
        <AuthProvider>
          <SubscriptionProvider>
            <ThemeProvider>
              <div className="min-h-screen flex flex-col">
                <main className="flex-1">{children}</main>
                <ClientFooterWrapper /> {/* Use the client-side wrapper */}
              </div>
              <Toaster />
              <SonnerToaster />
            </ThemeProvider>
          </SubscriptionProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
