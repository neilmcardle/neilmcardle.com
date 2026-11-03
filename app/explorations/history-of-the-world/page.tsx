import type { Metadata, Viewport } from "next";
import { share } from "../../shared-metadata";
import { heavy } from "../../_signature/fonts";
import WorldHistory from "./WorldHistory";

const DESCRIPTION =
  "An interactive globe of world history: sixty-odd moments across 300,000 years, from the first Homo sapiens to the present day.";

export const metadata: Metadata = {
  title: "A history of the world · Neil McArdle",
  description: DESCRIPTION,
  ...share({
    title: "A history of the world",
    description: DESCRIPTION,
    path: "/explorations/history-of-the-world",
  }),
};

export const viewport: Viewport = {
  themeColor: "#f4f3ef",
};

export default function HistoryOfTheWorldPage() {
  return (
    <div className={heavy.variable}>
      <style>{"html,body{background:#f4f3ef}"}</style>
      <WorldHistory />
    </div>
  );
}
