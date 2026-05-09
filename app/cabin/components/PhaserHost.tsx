"use client";

import dynamic from "next/dynamic";

// Phaser references `window` at module scope, so the entire mount tree
// must be skipped during SSR. next/dynamic with ssr:false is the
// canonical pattern for client-only browser libraries in App Router.
const PhaserMount = dynamic(() => import("./PhaserMount"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-inter)",
        fontSize: 13,
        color: "rgba(0,0,0,0.4)",
      }}
    >
      Loading the clearing…
    </div>
  ),
});

export default function PhaserHost() {
  return <PhaserMount />;
}
