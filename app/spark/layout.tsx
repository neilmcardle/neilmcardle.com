import type { ReactNode } from "react";
import { AnnotationMount } from "@/components/spark/AnnotationMount";
import { SparkTerminal } from "@/components/spark/SparkTerminal";
import { getTerminalIndex } from "@/lib/spark/content";

export default async function SparkLayout({
  children,
}: {
  children: ReactNode;
}) {
  const index = await getTerminalIndex();

  return (
    <>
      {children}
      <SparkTerminal index={index} />
      {process.env.NODE_ENV === "development" && <AnnotationMount />}
    </>
  );
}
