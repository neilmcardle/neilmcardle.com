import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Promptr — Neil McArdle",
  description:
    "A workshop for your first draft. Score and refine your prompts against a world-class rubric, browse a curated library, and learn what makes a great prompt.",
};

export default function PromptrLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
