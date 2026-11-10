import type { Metadata, Viewport } from "next";
import { share } from "@/app/shared-metadata";
import WorldHistory from "./WorldHistory";

const DESCRIPTION =
  "An interactive globe of world history I made: sixty-odd moments across 300,000 years, from the first Homo sapiens to 2015.";

export const metadata: Metadata = {
  title: "A History of the World · Neil McArdle",
  description: DESCRIPTION,
  ...share({
    title: "A History of the World",
    description: DESCRIPTION,
    path: "/explorations/history-of-the-world",
  }),
};

export const viewport: Viewport = {
  themeColor: "#0d0d0c",
};

export default function HistoryOfTheWorldPage() {
  return (
    <>
      <style>{"html,body{background:#0d0d0c}"}</style>
      <WorldHistory />
    </>
  );
}
