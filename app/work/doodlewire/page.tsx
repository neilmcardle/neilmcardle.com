import type { Metadata } from "next";
import DoodleWireCase from "./Case";

export const metadata: Metadata = {
  title: "DoodleWire · Neil McArdle",
  description: "Brand and product design for DoodleWire.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <DoodleWireCase />;
}
