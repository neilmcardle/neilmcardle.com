import React from "react";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "makeEbook - Create Beautiful eBooks",
  description: "Create, edit, and export professional eBooks right in your browser. Works offline.",
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
    title: "makeEbook - Create Beautiful eBooks",
    description: "The complete ebook creation tool for authors. Write, edit, and export professional EPUB files in minutes.",
    url: "https://makeebook.ink",
    siteName: "makeEbook",
    type: "website",
    images: [
      {
        url: "/social-make-ebook.png",
        width: 1200,
        height: 630,
        alt: "makeEbook - Create Beautiful eBooks",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "makeEbook - Create Beautiful eBooks",
    description: "The complete ebook creation tool for authors. Write, edit, and export professional EPUB files in minutes.",
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