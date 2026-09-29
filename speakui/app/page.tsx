"use client";

import dynamic from "next/dynamic";

const Editor = dynamic(
  () => import("@/components/editor/editor").then((m) => m.Editor),
  {
    ssr: false,
    loading: () => <div className="h-dvh bg-background" />,
  },
);

export default function Home() {
  return <Editor />;
}
