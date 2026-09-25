import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque } from "next/font/google";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

export const metadata: Metadata = {
  title: "vector paint · From the fridge to the wall",
  description:
    "A drawing app for children, and a way for parents to keep the good ones. Print any drawing on canvas, sharp at any size, delivered free in the UK.",
};

export const viewport: Viewport = {
  themeColor: "#ECE5D8",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function VectorPaintLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={bricolage.variable}>{children}</div>;
}
