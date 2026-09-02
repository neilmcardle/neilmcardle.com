import type { Metadata } from "next";
import DailyArchive from "@/components/home/DailyArchive";

const TITLE = "Daily landscape · Neil McArdle";
const DESCRIPTION =
  "A landscape computed from every date. Pick any day, including your birthday, and download it.";

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
