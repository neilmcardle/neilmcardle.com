import type { ReactNode } from "react";
import { AnnotationMount } from "@/components/spark/AnnotationMount";

export default function SparkLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      {process.env.NODE_ENV === "development" && <AnnotationMount />}
    </>
  );
}
