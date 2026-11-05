import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Courier_Prime, Pixelify_Sans, VT323 } from "next/font/google";
import { share } from "../../shared-metadata";
import History from "./History";

const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-crt",
});
const courier = Courier_Prime({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-teletype",
});
const pixel = Pixelify_Sans({
  weight: ["400", "600"],
  subsets: ["latin"],
  variable: "--font-bitmap",
});

const DESCRIPTION =
  "Sixty years of user interfaces in sixteen eras, from Sketchpad's light pen to agents that use the screen for you.";

export const metadata: Metadata = {
  title: "A Brief History of UI · Neil McArdle",
  description: DESCRIPTION,
  ...share({
    title: "A Brief History of UI",
    description: DESCRIPTION,
    path: "/explorations/history-of-ui",
  }),
};

export const viewport: Viewport = {
  themeColor: "#ebe8e4",
};

export default function HistoryOfUiPage() {
  return (
    <div
      className={[
        GeistSans.variable,
        GeistMono.variable,
        vt323.variable,
        courier.variable,
        pixel.variable,
      ].join(" ")}
    >
      <style>{"html,body{background:#ebe8e4}"}</style>
      <History />
    </div>
  );
}
