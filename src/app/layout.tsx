import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Momentum — Build habits that actually stick",
  description:
    "The most beautiful way to build habits. Streaks, heatmaps, analytics, XP and gorgeous dashboards — designed to make consistency feel effortless.",
  metadataBase: new URL("https://momentum.app"),
  openGraph: {
    title: "Momentum — Build habits that actually stick",
    description: "Streaks, heatmaps, analytics and XP in the most beautiful habit tracker ever made.",
    type: "website",
  },
};

// Apply the saved theme before first paint to avoid a flash.
const themeScript = `
(function() {
  try {
    var t = localStorage.getItem('momentum-theme');
    if (t === 'dark' || (t === null && window.matchMedia('(prefers-color-scheme: dark)').matches && false)) {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
