import type React from "react";
import MakeEbookProviders from "@/app/make-ebook/components/MakeEbookProviders";

export default function StartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MakeEbookProviders>{children}</MakeEbookProviders>;
}
