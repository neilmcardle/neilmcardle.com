import type { Metadata } from "next";
import CoverlyCase from "@/app/work/coverly/Case";

export const metadata: Metadata = {
  title: "coverly · Neil McArdle",
  description: "Brand and product design for coverly.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <CoverlyCase variant="signature" />;
}
