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
  title: "Fenom — Show Up. See What You Become.",
  description:
    "Fenom turns your habits, focus and goals into a visual record of the work you actually put in. Consistency over intensity.",
  metadataBase: new URL("https://fenom.app"),
  applicationName: "Fenom",
  keywords: ["habit tracker", "habits", "focus", "streaks", "consistency", "discipline", "goals", "productivity"],
  alternates: { canonical: "/" },
  appleWebApp: {
    capable: true,
    title: "Fenom",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    title: "Fenom — Show Up. See What You Become.",
    description: "Your habits, focus and goals — turned into a visual record of the work you actually put in.",
    type: "website",
    siteName: "Fenom",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fenom — Show Up. See What You Become.",
    description: "Your habits, focus and goals — turned into a visual record of the work you actually put in.",
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
