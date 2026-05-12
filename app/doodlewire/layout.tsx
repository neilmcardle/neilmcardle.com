import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DoodleWire — Neil McArdle",
  description:
    "Doodle on a blank page. A local recogniser learns your drawing style and snaps your sketches into polished UI wireframe elements you can export as HTML or React. No AI, no API calls.",
};

export default function DoodleWireLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
