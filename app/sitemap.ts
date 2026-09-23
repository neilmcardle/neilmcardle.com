import type { MetadataRoute } from "next";
import { getAllModules } from "@/lib/spark/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://neilmcardle.com";
  const now = new Date();

  const lessons = (await getAllModules()).map((slug) => ({
    url: `${base}/spark/lessons/${slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  return [
    {
      url: `${base}/`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1.0,
    },
    {
      url: `${base}/icon-animator`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${base}/promptr`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${base}/spark`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${base}/spark/lessons`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...lessons,
    {
      url: `${base}/studio`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${base}/studio/lab`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${base}/studio/series-01`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${base}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
