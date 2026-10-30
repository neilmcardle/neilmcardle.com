import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Time Teacher",
  description:
    "A learning clock that lights up the words you say to tell the time.",
};

export default function YboLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
