import type React from "react";
import type { Metadata } from "next";
import "./globals.css";
import "../styles/immersive.css";
import "../styles/vendor/draft-js.css";
import "../styles/vendor/google-fonts.css";
import { AuthProvider } from "@/lib/hooks/useAuth";
import { Toaster } from "@/components/ui/toaster";
import ClientFooterWrapper from "@/components/ClientFooterWrapper"; // NEW

export const metadata: Metadata = {
  title: "Neil McArdle - Digital Product Designer",
  description:
    "Personal wesbite of Digital Product Designer, Neil McArdle.",
  generator: "",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans" style={{ fontFamily: 'var(--font-inter)' }}>
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <main className="flex-1">{children}</main>
            <ClientFooterWrapper /> {/* Use the client-side wrapper */}
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
