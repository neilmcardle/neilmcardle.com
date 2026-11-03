import type { Metadata } from "next";
import AvisCase from "./Case";
import { share } from "../../shared-metadata";

const description =
  "Taking the Avis car rental checkout from five steps to three.";

export const metadata: Metadata = {
  title: "Avis checkout · Neil McArdle",
  description,
  ...share({
    title: "Avis checkout · Neil McArdle",
    description,
    path: "/work/avis",
  }),
};

export default function Page() {
  return <AvisCase />;
}
