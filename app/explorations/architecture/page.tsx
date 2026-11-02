import type { Metadata, Viewport } from "next";
import { share } from "../../shared-metadata";
import Architecture from "./Architecture";

const DESCRIPTION =
  "A history of architecture in thirty line drawings, each building drawn for the one idea it added to how we build.";

export const metadata: Metadata = {
  title: "Architecture · Neil McArdle",
  description: DESCRIPTION,
  robots: { index: false, follow: false },
  ...share({
    title: "Architecture · Neil McArdle",
    description: DESCRIPTION,
    path: "/explorations/architecture",
  }),
};

export const viewport: Viewport = {
  themeColor: "#f0ece3",
};

export default function ArchitecturePage() {
  return (
    <>
      <style>{"html,body{background:#f0ece3}"}</style>
      <Architecture />
    </>
  );
}
