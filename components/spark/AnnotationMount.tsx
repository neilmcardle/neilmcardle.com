"use client";

import dynamic from "next/dynamic";

const AnnotationLayer =
  process.env.NODE_ENV === "development"
    ? dynamic(
        () => import("./AnnotationLayer").then((m) => m.AnnotationLayer),
        {
          ssr: false,
        },
      )
    : null;

export function AnnotationMount() {
  if (!AnnotationLayer) return null;
  return <AnnotationLayer />;
}
