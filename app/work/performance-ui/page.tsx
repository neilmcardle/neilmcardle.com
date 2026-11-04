import type { Metadata } from "next";
import PerformanceUiCase from "./Case";
import { share } from "../../shared-metadata";

const description =
  "A design system written for agents, with the reason behind every rule.";

export const metadata: Metadata = {
  title: "Performance UI · Neil McArdle",
  description,
  ...share({
    title: "Performance UI · Neil McArdle",
    description,
    path: "/work/performance-ui",
  }),
};

export default function Page() {
  return <PerformanceUiCase />;
}
