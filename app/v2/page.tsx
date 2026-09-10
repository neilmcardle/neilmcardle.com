import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import V2Home from "./V2Home";

export const metadata: Metadata = {
  title: "Neil McArdle · Product Designer",
  description:
    "Everything Neil McArdle has designed and built: products, tools, things for his kids, a novel and paintings.",
  robots: { index: false, follow: false },
};

export default function V2Page() {
  return (
    <div className={GeistSans.variable}>
      <style>
        {"html,body{background:#ebe8e4}html{scrollbar-color:#c9c3bc #ebe8e4}"}
      </style>
      <V2Home />
    </div>
  );
}
