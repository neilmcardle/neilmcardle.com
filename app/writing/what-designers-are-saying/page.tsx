import type { Metadata } from "next";
import Article from "../_article/Article";
import { share } from "../../shared-metadata";

const title = "What designers are saying · Neil McArdle";
const description =
  "A year of popular design podcasts, 99 episodes and about 965,000 words, read for how designers talk about their tools.";

export const metadata: Metadata = {
  title,
  description,
  ...share({ title, description, path: "/writing/what-designers-are-saying" }),
};

const SIZES = {
  "/writing/what-designers-are-saying/chart-term-shifts.svg": {
    width: 760,
    height: 486,
  },
};

export default function Page() {
  return (
    <Article
      path="app/writing/what-designers-are-saying/content.md"
      sizes={SIZES}
    />
  );
}
