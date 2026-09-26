"use client";

import dynamic from "next/dynamic";

const SparkMocks = dynamic(() => import("@/components/home/SparkMocks"), {
  ssr: false,
});

export default function SparkIntro() {
  return <SparkMocks only="intro" />;
}
