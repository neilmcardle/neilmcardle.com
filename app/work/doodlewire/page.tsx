import type { Metadata } from "next";
import DoodleWireCase from "./Case";
import { share } from "../../shared-metadata";

const description = "Brand and product design for DoodleWire.";

export const metadata: Metadata = {
  title: "DoodleWire · Neil McArdle",
  description,
  ...share({
    title: "DoodleWire · Neil McArdle",
    description,
    path: "/work/doodlewire",
  }),
};

export default function Page() {
  return <DoodleWireCase />;
}
