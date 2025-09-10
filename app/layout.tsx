import type React from "react";
import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import "../styles/immersive.css";
import { AppProviders } from "./providers"; // <-- import here

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "Neil McArdle - Designer & Painter",
  description:
    "Portfolio of Neil McArdle, a digital product designer and traditional oil painter with over 10 years of experience.",
  generator: "me + copilot",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} font-sans`}>
        <AppProviders>
          <main className="min-h-screen">{children}</main>
        </AppProviders>
      </body>
    </html>
  );
}