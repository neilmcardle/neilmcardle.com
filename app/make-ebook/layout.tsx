import React from "react";
import type { Metadata, Viewport } from "next";

const TITLE = "makeEbook. Free Browser-Based Ebook Editor & EPUB Creator";
const DESCRIPTION =
  "Free browser-based ebook editor. Write, format, and export professional EPUBs for Kindle, Kobo, and Apple Books. No install, no credit card.";

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
    title: "makeEbook",
  },
  icons: {
    icon: [
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
    siteName: "makeEbook",
    type: "website",
    images: [
      {
        url: "/social-make-ebook.png",
        width: 1200,
        height: 630,
        alt: "makeEbook. Write, format, and export a professional EPUB.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/social-make-ebook.png"],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf9f5" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a1a" },
  ],
};

// SoftwareApplication schema.org JSON-LD — surfaces price + product type in
// Google search results. Lives in the layout so every page in the makeEbook
// surface advertises the product to crawlers, not just the landing page.
const softwareApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  '@id': 'https://makeebook.ink/#software',
  name: 'makeEbook',
  url: 'https://makeebook.ink',
  description: DESCRIPTION,
  applicationCategory: 'WritingApplication',
  operatingSystem: 'Web Browser',
  offers: [
    {
      '@type': 'Offer',
      name: 'Free',
      price: '0',
      priceCurrency: 'USD',
    },
    {
      '@type': 'Offer',
      name: 'Pro',
      price: '9',
      priceCurrency: 'USD',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: '9',
        priceCurrency: 'USD',
        unitText: 'MONTH',
      },
    },
    {
      '@type': 'Offer',
      name: 'Lifetime',
      price: '149',
      priceCurrency: 'USD',
    },
  ],
  creator: {
    '@type': 'Person',
    name: 'Neil McArdle',
    url: 'https://neilmcardle.com',
  },
  featureList: [
    'EPUB and PDF export',
    'Drag and drop chapter management',
    'AI manuscript analysis (Book Mind)',
    'Live ebook preview',
    'Multi-language support',
    'Works offline as a PWA',
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
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
      />
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      {children}
    </>
  );
}