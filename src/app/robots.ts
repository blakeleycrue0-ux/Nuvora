import type { MetadataRoute } from "next";

const SITE = "https://fenom.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // The app screens live behind auth; keep them out of the index.
        disallow: ["/dashboard", "/habits", "/progress", "/settings", "/onboarding"],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
