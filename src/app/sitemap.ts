import type { MetadataRoute } from "next";

const SITE = "https://nuvora0.netlify.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE}/`, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE}/teams`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE}/signup`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
  ];
}
