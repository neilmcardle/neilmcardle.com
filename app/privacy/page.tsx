import type { Metadata } from "next";

import SitePage from "@/components/home/SitePage";
import Policy from "./Policy";

export const metadata: Metadata = {
  title: "Privacy Policy — Neil McArdle",
  description: "How neilmcardle.com collects and handles personal data.",
};

export default function PrivacyPage() {
  return (
    <SitePage>
      <div className="home-prose max-w-3xl pb-24">
        <Policy />
      </div>
    </SitePage>
  );
}
