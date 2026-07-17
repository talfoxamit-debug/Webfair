import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import AttributionCapture from "@/components/AttributionCapture";
import MetaPixel from "@/components/MetaPixel";
import Nav from "@/components/Nav";
import ScrollProgress from "@/components/ScrollProgress";
import CustomCursor from "@/components/CustomCursor";
import ScrollToTop from "@/components/ScrollToTop";
import "./globals.css";

const title = "Stackwrk: Bold Websites, Real Results.";
const description =
  "Custom web apps and sites that get you more bookings, leads, and revenue. Built fast, built to convert.";

export const metadata: Metadata = {
  metadataBase: new URL("https://stackwrk.com"),
  title,
  description,
  keywords: [
    "web development",
    "custom websites",
    "Next.js",
    "conversion-focused design",
    "site audit",
    "web apps",
  ],
  openGraph: {
    title,
    description,
    url: "https://stackwrk.com",
    siteName: "Stackwrk",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "https://stackwrk.com" },
};

export const viewport: Viewport = {
  themeColor: "#070312",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Preload the display font used in the LCP headline so it is not
            discovered only after CSS parse (cuts the swap window / CLS). */}
        <link rel="preload" href="/fonts/anton-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body>
        <a href="#main" className="skip-link">Skip to content</a>
        <ScrollProgress />
        <CustomCursor />
        <Nav />
        <main id="main">{children}</main>
        <ScrollToTop />
        <AttributionCapture />
        <MetaPixel />
        <Analytics />
      </body>
    </html>
  );
}
