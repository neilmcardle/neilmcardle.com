import type { Metadata, Viewport } from "next";
import Shell from "../_signature/Shell";
import Header from "../_signature/Header";
import Hero from "../_signature/Hero";
import Work from "../_signature/Work";
import Moments from "../_signature/Moments";
import Playground from "../_signature/Playground";
import Index from "../_signature/Index";
import Finale from "../_signature/Finale";

export const metadata: Metadata = {
  title: "Neil McArdle, Product Designer",
  description: "Neil McArdle, product designer in London.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0d0d0c",
};

export default function NextHome() {
  return (
    <Shell>
      <Header home="/next" brand={false} />
      <Hero />
      <Work base="/next" />
      <Moments />
      <Playground base="/next" more={<Index base="/next" rest />} />
      <Finale />
    </Shell>
  );
}
