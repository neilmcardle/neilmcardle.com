import type React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Spark brand lab",
  robots: { index: false, follow: false },
};

export default function SparkBrandLabLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
