import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { PWA } from "@/components/PWA";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
// Display face for headings + big numbers — geometric, confident, a little character.
const display = Space_Grotesk({ variable: "--font-display", subsets: ["latin"], weight: ["500", "600", "700"] });

export const metadata: Metadata = {
  title: "Fenom — Build habits that actually stick",
  description:
    "The most beautiful way to build habits. Streaks, heatmaps, analytics, XP and gorgeous dashboards — designed to make consistency feel effortless.",
  metadataBase: new URL("https://fenom.app"),
  applicationName: "Fenom",
  keywords: ["habit tracker", "habits", "streaks", "productivity", "routine", "momentum"],
  alternates: { canonical: "/" },
  appleWebApp: {
    capable: true,
    title: "Fenom",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    title: "Fenom — Build habits that actually stick",
    description: "Streaks, heatmaps, analytics and XP in the most beautiful habit tracker ever made.",
    type: "website",
    siteName: "Fenom",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fenom — Build habits that actually stick",
    description: "Streaks, heatmaps, analytics and XP in the most beautiful habit tracker ever made.",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
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
    var a = localStorage.getItem('fenom-accent');
    var M = {
      navy:['#3a5a94','#40619c','#4a6ba6','rgba(58,90,148,0.16)','rgba(58,90,148,0.42)','#eef2f8'],
      green:['#45c68e','#52c795','#5ec99a','rgba(69,198,142,0.14)','rgba(69,198,142,0.40)','#07130d'],
      lime:['#d7ff28','#c9f51e','#e4ff5c','rgba(215,255,40,0.12)','rgba(215,255,40,0.40)','#0b1400'],
      amber:['#e0a44b','#e6ad5a','#ecb86e','rgba(224,164,75,0.14)','rgba(224,164,75,0.40)','#170f00'],
      violet:['#8f7fb0','#9a8bbb','#a897c6','rgba(143,127,176,0.16)','rgba(143,127,176,0.42)','#0d0a14'],
      aqua:['#49c8d0','#57cfd6','#6ad7dd','rgba(73,200,208,0.14)','rgba(73,200,208,0.40)','#031316']
    };
    var K=['--accent','--accent-2','--accent-3','--accent-soft','--accent-ring','--accent-ink'];
    if (a && M[a]) { for (var i=0;i<K.length;i++) document.documentElement.style.setProperty(K[i], M[a][i]); }
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${display.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen">
        <div className="app-bg" aria-hidden="true" />
        <div className="app-grain" aria-hidden="true" />
        <Providers>{children}</Providers>
        <PWA />
      </body>
    </html>
  );
}
