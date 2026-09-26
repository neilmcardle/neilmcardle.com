import type { Metadata } from "next";

export const SITE_TITLE = "Neil McArdle · Product Designer";
export const SITE_DESCRIPTION =
  "Product designer in London. Building makeebook, Coverly, DoodleWire and Spark.";
export const SHARE_ALT =
  "Neil McArdle, product designer in London. Things he has said and done: makeebook, Coverly, DoodleWire and Spark.";

const SHARE_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: SHARE_ALT,
};

export function share({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Pick<Metadata, "alternates" | "openGraph" | "twitter"> {
  return {
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: "Neil McArdle",
      type: "website",
      locale: "en_GB",
      images: [SHARE_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: "@BetterNeil",
      images: [SHARE_IMAGE],
    },
  };
}
