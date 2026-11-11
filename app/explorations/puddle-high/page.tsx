import type { Metadata, Viewport } from "next";
import { share } from "@/app/shared-metadata";
import Wellie from "./Wellie";

const DESCRIPTION =
  "Puddle High II: an old wellie, launched like a limited-edition sneaker. A 3D model built from a reference sheet.";

export const metadata: Metadata = {
  title: "Puddle High II · Neil McArdle",
  description: DESCRIPTION,
  ...share({
    title: "Puddle High II",
    description: DESCRIPTION,
    path: "/explorations/puddle-high",
  }),
};

export const viewport: Viewport = {
  themeColor: "#0c0d0c",
  colorScheme: "dark",
};

export default function PuddleHighPage() {
  return <Wellie />;
}
