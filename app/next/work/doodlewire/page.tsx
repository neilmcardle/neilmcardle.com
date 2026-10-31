import type { Metadata } from "next";
import DoodleWireCase from "@/app/work/doodlewire/Case";

export const metadata: Metadata = {
  title: "DoodleWire · Neil McArdle",
  description: "Brand and product design for DoodleWire.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <DoodleWireCase variant="signature" />;
}
