import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nuvora — One app. Everything your health needs.",
  description:
    "Track workouts, nutrition, calories, progress and habits in one beautiful experience. Nuvora replaces every fitness app you use with one, powered by AI.",
  metadataBase: new URL("https://nuvora.app"),
  openGraph: {
    title: "Nuvora — One app. Everything your health needs.",
    description:
      "Track workouts, nutrition, calories, progress and habits in one beautiful experience.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nuvora — One app. Everything your health needs.",
    description:
      "Track workouts, nutrition, calories, progress and habits in one beautiful experience.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-text">{children}</body>
    </html>
  );
}
