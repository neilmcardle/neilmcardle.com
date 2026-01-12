import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book Mind - AI Analysis for Your Book",
  description: "Ask questions about your manuscript. Book Mind analyzes your writing without writing for you.",
};

export default function BookMindLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This layout renders only children, no footer
  // It overrides the root layout's footer by providing its own full-page structure
  return (
    <div className="fixed inset-0 overflow-hidden">
      {children}
    </div>
  );
}
