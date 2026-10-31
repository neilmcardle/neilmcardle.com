import type { Metadata } from "next";
import AvisCase from "./Case";

export const metadata: Metadata = {
  title: "Avis checkout · Neil McArdle",
  description: "Redesigning the Avis car rental checkout.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AvisCase />;
}
