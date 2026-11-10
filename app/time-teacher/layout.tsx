import type React from "react";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Time Teacher",
  description:
    "A learning clock that lights up the words you say to tell the time.",
};

export const viewport: Viewport = {
  themeColor: "#0d0d0c",
};

export default function TimeTeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
