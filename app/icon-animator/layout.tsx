import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Icon Animator — Neil McArdle",
  description: "Animate SVG icons with CSS keyframes. Pick a preset, tune the timing, copy the code.",
};

export default function IconAnimatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
