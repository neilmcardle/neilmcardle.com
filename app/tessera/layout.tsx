import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tessera — The Triangle Game",
  description:
    "Tessera is a two-player dice game on a hexagonal triangle grid. Roll, claim edges, complete triangles, win the board.",
  alternates: { canonical: "https://neilmcardle.com/tessera" },
  openGraph: {
    title: "Tessera — The Triangle Game",
    description:
      "A quietly competitive dice-and-edges game on a hexagonal triangle grid.",
    url: "https://neilmcardle.com/tessera",
    type: "website",
    locale: "en_GB",
  },
};

export default function TesseraLayout({ children }: { children: React.ReactNode }) {
  return children;
}
