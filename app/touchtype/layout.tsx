import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Touchtype — Neil McArdle",
  description:
    "A touch-typing tutor with two modes. A playful course for kids and a focused practice ground for adults. Single page, no install.",
};

export default function TouchtypeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
