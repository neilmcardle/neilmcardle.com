import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cabin — Neil McArdle",
  description: "A small isometric exploration game. Walk a forest clearing, interact with the world, gather what's there.",
  robots: { index: false, follow: false },
};

export default function DioramaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
