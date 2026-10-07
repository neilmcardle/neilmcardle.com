import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import Home from "./_home/Home";
import Intro from "./_home/Intro";
import { INTRO_CSS, INTRO_SCRIPT } from "./_home/intro-script";
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
      <style>
        {"html,body{background:#ffffff}html{scrollbar-color:#d6d4cf #ffffff}@media (max-width:959px){html{scroll-padding-top:104px}}" +
          INTRO_CSS}
      </style>
      <script dangerouslySetInnerHTML={{ __html: INTRO_SCRIPT }} />
      <Intro />
      <Home />
    </div>
  );
}
