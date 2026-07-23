import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Momentum",
    short_name: "Momentum",
    description: "Build habits that actually stick.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#0a0d11",
    theme_color: "#0a0d11",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
