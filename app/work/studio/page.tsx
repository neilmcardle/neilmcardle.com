import type { Metadata } from "next";
import StudioCase from "./Case";
import { share } from "../../shared-metadata";

const description =
  "How my homepage became a painted studio that says who I am, prompt by prompt.";

export const metadata: Metadata = {
  title: "The studio · Neil McArdle",
  description,
  ...share({
    title: "The studio · Neil McArdle",
    description,
    path: "/work/studio",
  }),
};

export default function Page() {
  return <StudioCase />;
}
