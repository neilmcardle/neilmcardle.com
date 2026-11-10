import type { Metadata, Viewport } from "next";
import PixelTimeline from "./PixelTimeline";

import { share } from "../../shared-metadata";

const DESCRIPTION =
  "A history of architecture as small pixel dioramas. Scrub through time, change the light and tap a building to name its parts.";

export const metadata: Metadata = {
  title: "Architecture in Pixels · Neil McArdle",
  description: DESCRIPTION,
  robots: { index: false, follow: false },
  ...share({
    title: "Architecture in Pixels · Neil McArdle",
    description: DESCRIPTION,
    path: "/explorations/architecture-pixel",
  }),
};

export const viewport: Viewport = {
  themeColor: "#0d0d0c",
  colorScheme: "dark",
};

export default function ArchitecturePixelLabPage() {
  return (
    <>
      <style>{"html,body{background:#0d0d0c;color-scheme:dark}"}</style>
      <PixelTimeline />
    </>
  );
}
