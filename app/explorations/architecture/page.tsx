import type { Metadata, Viewport } from "next";
import { share } from "../../shared-metadata";
import { heavy } from "../../_signature/fonts";
import Architecture from "./Architecture";

const DESCRIPTION =
  "A history of architecture in thirty line drawings, each building drawn for the one idea it added to how we build.";

export const metadata: Metadata = {
  title: "A History of Architecture · Neil McArdle",
  description: DESCRIPTION,
  robots: { index: false, follow: false },
  ...share({
    title: "A History of Architecture · Neil McArdle",
    description: DESCRIPTION,
    path: "/explorations/architecture",
  }),
};

export const viewport: Viewport = {
  themeColor: "#f4f3ef",
};

export default function ArchitecturePage() {
  return (
    <div className={heavy.variable}>
      <style>{"html,body{background:#f4f3ef}"}</style>
      <Architecture />
    </div>
  );
}
