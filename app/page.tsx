import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import ColumnHome from "./_column/ColumnHome";
import Intro from "./_home/Intro";
import { INTRO_CSS, INTRO_SCRIPT } from "./_home/intro-script";
import { SITE_DESCRIPTION, SITE_TITLE, share } from "./shared-metadata";

export const metadata: Metadata = share({
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  path: "/",
});

export const viewport: Viewport = {
  themeColor: "#fafafa",
};

export default function Homepage() {
  return (
    <div className={GeistSans.variable}>
      <style>
        {"html,body{background:#fafafa}html{scrollbar-color:#d4d4d4 #fafafa}@media(min-width:1200px){html,body{overscroll-behavior-y:none}}" +
          INTRO_CSS}
      </style>
      <script dangerouslySetInnerHTML={{ __html: INTRO_SCRIPT }} />
      <Intro />
      <ColumnHome />
    </div>
  );
}
