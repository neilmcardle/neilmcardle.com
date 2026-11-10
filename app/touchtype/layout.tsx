import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Touchtype — Neil McArdle",
  description:
    "A touch-typing tutor with two modes. A playful course for kids and a focused practice ground for adults. Single page, no install.",
};

export default function TouchtypeLabLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <style>{"html,body{background:#0d0d0c;color-scheme:dark}"}</style>
      <main id="main">{children}</main>
    </>
  );
}
