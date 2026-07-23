import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { PWA } from "@/components/PWA";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Momentum — Build habits that actually stick",
  description:
    "The most beautiful way to build habits. Streaks, heatmaps, analytics, XP and gorgeous dashboards — designed to make consistency feel effortless.",
  metadataBase: new URL("https://nuvora0.netlify.app"),
  applicationName: "Momentum",
  appleWebApp: {
    capable: true,
    title: "Momentum",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    title: "Momentum — Build habits that actually stick",
    description: "Streaks, heatmaps, analytics and XP in the most beautiful habit tracker ever made.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0d11",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Dark is the default; only add the `.light` class if the user opted into light.
// Runs before first paint to avoid a flash.
const themeScript = `
(function() {
  try {
    if (localStorage.getItem('momentum-theme') === 'light') {
      document.documentElement.classList.add('light');
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
        <PWA />
      </body>
    </html>
  );
}
