import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Coverly — Neil McArdle",
  description:
    "Comp research for book cover designers. Thousands of covers searchable by design attributes rather than genre, with boards and PDF comp-deck export. Free, with email sign-up.",
};

export default function CoverlyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
