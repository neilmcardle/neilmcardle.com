import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import ColumnHome from "./_column/ColumnHome";
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
        {
          "html,body{background:#fafafa}html{scrollbar-color:#d4d4d4 #fafafa}@media(min-width:1200px){html,body{overscroll-behavior-y:none}}"
        }
      </style>
      <ColumnHome />
    </div>
  );
}
