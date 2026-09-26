import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import Home from "./_home/Home";
import { SITE_DESCRIPTION, SITE_TITLE, share } from "./shared-metadata";

export const metadata: Metadata = share({
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  path: "/",
});

export const viewport: Viewport = {
  themeColor: "#ebe8e4",
};

export default function Homepage() {
  return (
    <div className={GeistSans.variable}>
      <style>
        {
          "html,body{background:#ebe8e4}html{scrollbar-color:#c9c3bc #ebe8e4}@media (max-width:959px){html{scroll-padding-top:104px}}"
        }
      </style>
      <Home />
    </div>
  );
}
