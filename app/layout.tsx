import type React from "react";
import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import "../styles/immersive.css";
import 'draft-js/dist/Draft.css';
import { AuthProvider } from "@/lib/hooks/useAuth";
import { Toaster } from "@/components/ui/toaster";
import ClientFooterWrapper from "@/components/ClientFooterWrapper"; // NEW

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "Neil McArdle - Artist & Designer",
  description:
    "Personal wesbite of Artist and Designer, Neil McArdle.",
  generator: "",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} font-sans`}>
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