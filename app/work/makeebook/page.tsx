import type { Metadata } from "next";
import MakeebookCase from "./Case";

export const metadata: Metadata = {
  title: "makeebook · Neil McArdle",
  description: "Brand and product design for makeebook.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <MakeebookCase />;
}
