import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import Capture from "./Capture";

export const metadata: Metadata = {
  title: "Creature capture · Neil McArdle",
  description:
    "One AI video of a creature, filmed from two cameras in one frame, turned into a rigged 3D animation.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#ebe8e4",
};

export default function CreatureCapturePage() {
  return (
    <div className={GeistSans.variable}>
      <style>{"html,body{background:#ebe8e4}"}</style>
      <Capture />
    </div>
  );
}
