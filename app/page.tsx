import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import OrbitHome from "./_orbit/OrbitHome";
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
        {"html,body{background:#ffffff}html{scrollbar-color:#d6d4cf #ffffff}" +
          INTRO_CSS}
      </style>
      <script dangerouslySetInnerHTML={{ __html: INTRO_SCRIPT }} />
      <Intro />
      <OrbitHome />
    </div>
  );
}
