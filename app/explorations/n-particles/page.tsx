import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { share } from "../../shared-metadata";
import NLab from "./NLab";

const DESCRIPTION =
  "The N logomark as 40,000 particles that scatter and reform. Tune every dial live. Inspired by Neuma by Kris Puckett.";

export const metadata: Metadata = {
  title: "N particles · Neil McArdle",
  description: DESCRIPTION,
  ...share({
    title: "N particles · Neil McArdle",
    description: DESCRIPTION,
    path: "/explorations/n-particles",
  }),
};

export const viewport: Viewport = {
  themeColor: "#ebe8e4",
};

export default function NParticlesPage() {
  return (
    <div className={GeistSans.variable}>
      <style>{"html,body{background:#ebe8e4}"}</style>
      <NLab />
    </div>
  );
}
