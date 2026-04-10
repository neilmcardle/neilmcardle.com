import React from "react";
import type { Metadata, Viewport } from "next";

const TITLE = "makeEbook — Write the book you've been putting off";
const DESCRIPTION =
  "A free, browser-based editor that turns rough drafts into EPUBs ready for Kindle, Kobo, and Apple Books. No install, no credit card.";

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
        alt: "makeEbook — write, format, and export a professional EPUB",
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
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf9f5" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a1a" },
  ],
};

export default function MakeEbookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}