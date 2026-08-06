import type { MetadataRoute } from "next";

const SITE = "https://fenom.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE}/`, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE}/signup`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
  ];
}
