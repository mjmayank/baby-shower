import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({ subsets: ["latin"], variable: "--font-heading" });
const nunito = Nunito({ subsets: ["latin"], variable: "--font-body" });

// iMessage/Slack need absolute URLs for og:image; Vercel injects the
// production domain at build time. Override with NEXT_PUBLIC_SITE_URL if
// the app is ever hosted elsewhere.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? process.env.NEXT_PUBLIC_SITE_URL
  : process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Mayank & Cayley's Baby Shower 🌊",
  description: "Take a photo and get your very own baby caricature!",
  openGraph: {
    title: "Mayank & Cayley's Baby Shower 🌊",
    description: "Turn yourself into an adorable baby caricature — snapped by our camera, drawn by AI!",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${fredoka.variable} ${nunito.variable}`}>{children}</body>
    </html>
  );
}
