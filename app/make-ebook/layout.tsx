import React from "react";
import type { Metadata, Viewport } from "next";

import AdsTracking from "@/components/AdsTracking";
import MakeEbookProviders from "./components/MakeEbookProviders";

const TITLE = "makeebook, the eBook editor made for your manuscript";
const DESCRIPTION =
  "Bring the manuscript you have. Edit and preview every chapter, check it with Book Mind, and export EPUB, PDF and Word ready for Amazon, Apple Books and Kobo. Free to start, in your browser.";

export const metadata: Metadata = {
  metadataBase: new URL("https://makeebook.ink"),
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: "https://makeebook.ink",
  },
  manifest: "/makeebook-manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "makeebook",
  },
  icons: {
    icon: [
      { url: "/makeebook-icon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://makeebook.ink",
    siteName: "makeebook",
    type: "website",
    images: [
      {
        url: "/make-ebook/brand/social-v2.jpg",
        width: 2400,
        height: 1260,
        alt: "makeebook.ink. The eBook editor made for your manuscript.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@makeebook",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/make-ebook/brand/social-v2.jpg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf9f5" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a1a" },
  ],
};

const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": "https://makeebook.ink/#software",
  name: "makeebook",
  url: "https://makeebook.ink",
  description: DESCRIPTION,
  applicationCategory: "WritingApplication",
  operatingSystem: "Web Browser",
  offers: [
    {
      "@type": "Offer",
      name: "Free",
      price: "0",
      priceCurrency: "USD",
    },
    {
      "@type": "Offer",
      name: "Pro",
      price: "9",
      priceCurrency: "USD",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "9",
        priceCurrency: "USD",
        unitText: "MONTH",
      },
    },
    {
      "@type": "Offer",
      name: "Lifetime",
      price: "149",
      priceCurrency: "USD",
    },
  ],
  creator: {
    "@type": "Person",
    name: "Neil McArdle",
    url: "https://neilmcardle.com",
  },
  featureList: [
    "EPUB and PDF export",
    "Drag and drop chapter management",
    "AI manuscript analysis (Book Mind)",
    "Live ebook preview",
    "Multi-language support",
    "Works offline as a PWA",
  ],
};

export default function MakeEbookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.classList.add("dark")`,
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareApplicationSchema),
        }}
      />
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <MakeEbookProviders>{children}</MakeEbookProviders>
      <AdsTracking />
    </>
  );
}
