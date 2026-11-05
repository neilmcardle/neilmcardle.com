import type { Metadata, Viewport } from "next";
import { share } from "../../shared-metadata";
import PixelTimeline from "./PixelTimeline";

const DESCRIPTION =
  "A history of architecture as small pixel dioramas. Scrub through time, change the light and tap a building to name its parts.";

export const metadata: Metadata = {
  title: "Architecture in pixels · Neil McArdle",
  description: DESCRIPTION,
  robots: { index: false, follow: false },
  ...share({
    title: "Architecture in pixels · Neil McArdle",
    description: DESCRIPTION,
    path: "/explorations/architecture-pixel",
  }),
};

export const viewport: Viewport = {
  themeColor: "#0d0d0c",
};

export default function ArchitecturePixelPage() {
  return (
    <>
      <style>{"html,body{background:#0d0d0c;color-scheme:dark}"}</style>
      <PixelTimeline />
    </>
  );
}
