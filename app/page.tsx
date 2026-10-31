import type { Metadata, Viewport } from "next";
import Shell from "./_signature/Shell";
import Header from "./_signature/Header";
import NavMark from "./_signature/NavMark";
import Hero from "./_signature/Hero";
import Work from "./_signature/Work";
import Moments from "./_signature/Moments";
import Playground from "./_signature/Playground";
import Index from "./_signature/Index";
import Finale from "./_signature/Finale";
import { SITE_DESCRIPTION, SITE_TITLE, share } from "./shared-metadata";

export const metadata: Metadata = share({
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  path: "/",
});

export const viewport: Viewport = {
  themeColor: "#0d0d0c",
};

export default function Homepage() {
  return (
    <Shell>
      <Header mark={<NavMark />} />
      <Hero />
      <Work />
      <Moments />
      <Playground more={<Index rest />} />
      <Finale />
    </Shell>
  );
}
