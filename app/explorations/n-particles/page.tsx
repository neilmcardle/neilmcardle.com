import type { Metadata, Viewport } from "next";
import { share } from "@/app/shared-metadata";
import NLab from "./NLab";

const DESCRIPTION =
  "My N mark as 40,000 particles that scatter and settle back into shape, with every dial live.";

export const metadata: Metadata = {
  title: "N particles · Neil McArdle",
  description: DESCRIPTION,
  ...share({
    title: "N particles",
    description: DESCRIPTION,
    path: "/explorations/n-particles",
  }),
};

export const viewport: Viewport = {
  themeColor: "#0d0d0c",
  colorScheme: "dark",
};

export default function NParticlesPage() {
  return (
    <>
      <style>{"html,body{background:#0d0d0c;color-scheme:dark}"}</style>
      <NLab />
    </>
  );
}
