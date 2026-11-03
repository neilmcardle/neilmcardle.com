import type { Metadata } from "next";
import CoverlyCase from "./Case";
import { share } from "../../shared-metadata";

const description = "Brand and product design for coverly.";

export const metadata: Metadata = {
  title: "coverly · Neil McArdle",
  description,
  ...share({
    title: "coverly · Neil McArdle",
    description,
    path: "/work/coverly",
  }),
};

export default function Page() {
  return <CoverlyCase />;
}
