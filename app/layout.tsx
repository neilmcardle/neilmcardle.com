import type React from "react";
import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import "../styles/immersive.css";
import 'draft-js/dist/Draft.css';
import { AuthProvider } from "@/lib/hooks/useAuth";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "makeEbook - Create Beautiful eBooks",
  description:
    "Professional eBook creation tool with rich text editing, chapter management, and export capabilities.",
  generator: "makeEbook",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} font-sans`}>
        <AuthProvider>
          <main className="min-h-screen">{children}</main>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}