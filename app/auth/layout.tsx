import type React from "react";
import type { Metadata } from "next";
import MakeEbookProviders from "@/app/make-ebook/components/MakeEbookProviders";

export const metadata: Metadata = {
  title: "makeebook",
  robots: { index: false },
  icons: {
    icon: [
      { url: "/makeebook-icon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MakeEbookProviders>{children}</MakeEbookProviders>;
}
