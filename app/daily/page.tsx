import type { Metadata } from "next";
import DailyArchive from "@/components/home/DailyArchive";

const TITLE = "Daily drawings · Neil McArdle";
const DESCRIPTION =
  "A generated line drawing for every date, plotted in the browser. Pick any day, including your birthday, and download it.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "https://neilmcardle.com/daily" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://neilmcardle.com/daily",
    siteName: "Neil McArdle",
    type: "website",
    locale: "en_GB",
  },
};

export default function DailyArchivePage() {
  return <DailyArchive />;
}
