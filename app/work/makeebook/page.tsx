import type { Metadata } from "next";
import MakeebookCase from "./Case";
import { share } from "../../shared-metadata";

const description =
  "Designing Book Mind, the writing assistant in makeebook that only speaks when asked.";

export const metadata: Metadata = {
  title: "makeebook · Neil McArdle",
  description,
  ...share({
    title: "makeebook · Neil McArdle",
    description,
    path: "/work/makeebook",
  }),
};

export default function Page() {
  return <MakeebookCase />;
}
