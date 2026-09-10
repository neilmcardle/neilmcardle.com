import type { Metadata } from "next";
import HomeShell from "@/components/home/HomeShell";

export const metadata: Metadata = {
  title: "Homepage lab",
  robots: { index: false, follow: false },
};

export default function HomepageLab() {
  return <HomeShell refresh />;
}
