import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import PortfolioHome from "./portfolio-home";
import { SITE_DESCRIPTION, SITE_TITLE, share } from "./shared-metadata";

export const metadata: Metadata = share({
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  path: "/",
});

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function Homepage() {
  return (
    <div className={GeistSans.variable}>
      <PortfolioHome />
    </div>
  );
}
