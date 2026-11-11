import type { Metadata } from "next";
import Article from "../../_article/Article";
import { share } from "../../../shared-metadata";

const title = "Scorecard: A History of Design Tools · Neil McArdle";
const description =
  "Every tool considered for A History of Design Tools, scored on five questions.";

export const metadata: Metadata = {
  title,
  description,
  ...share({
    title,
    description,
    path: "/writing/history-of-design-tools/scorecard",
  }),
};

export default function Page() {
  return (
    <Article
      path="app/writing/history-of-design-tools/scorecard/content.md"
      back="/writing/history-of-design-tools"
      backLabel="History"
      endLabel="Back to the history"
      wide
    />
  );
}
