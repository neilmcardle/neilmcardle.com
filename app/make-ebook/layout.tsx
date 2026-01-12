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
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
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