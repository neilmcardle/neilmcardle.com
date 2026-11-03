import type { Metadata, Viewport } from "next";
import { SHOWCASE } from "../../_signature/data/showcase";
import PodiumCase from "./Case";
import { share } from "../../shared-metadata";

const description = SHOWCASE.Podium.what;

export const metadata: Metadata = {
  title: "Podium · Neil McArdle",
  description,
  ...share({
    title: "Podium · Neil McArdle",
    description,
    path: "/work/podium",
  }),
};

export const viewport: Viewport = {
  themeColor: "#0d0d0c",
};

export default function PodiumPage() {
  return <PodiumCase />;
}
