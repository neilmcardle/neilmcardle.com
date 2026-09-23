import type { Metadata } from "next";
import LabStage from "./LabStage";

export const metadata: Metadata = {
  title: "Lab",
  description:
    "Seven generative rules drawn live in your browser from a seed number. Reroll, animate and copy the seed.",
};

export default function LabPage() {
  return <LabStage />;
}
