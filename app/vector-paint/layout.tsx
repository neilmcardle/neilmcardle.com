import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vector Paint — Neil McArdle",
  description: "Vector drawing in the browser. Sketch freehand, export SVG, print crisp at any size from sticker to poster.",
};

export default function VectorPaintLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
