import type { Metadata } from "next";
import "./coverly-tokens.css";

export const metadata: Metadata = {
  title: "Coverly — Neil McArdle",
  description:
    "Comparable research for book cover designers. Thousands of searchable fiction covers, with customisable mood boards and exportable PDF comparison deck.",
};

export default function CoverlyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
