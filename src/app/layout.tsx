import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import AttributionCapture from "@/components/AttributionCapture";
import MetaPixel from "@/components/MetaPixel";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import Clarity from "@/components/Clarity";
import JsonLd from "@/components/JsonLd";
import Nav from "@/components/Nav";
import ScrollProgress from "@/components/ScrollProgress";
import CustomCursor from "@/components/CustomCursor";
import ScrollToTop from "@/components/ScrollToTop";
import { site } from "@/lib/content";
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

// Sitewide entity graph: helps Google and AI answer engines understand who
// Stackwrk is (name, contact, area served, brand), which powers the knowledge
// panel and citation in AI overviews. sameAs is filled as real profiles land.
const orgLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": "https://stackwrk.com/#org",
  name: "Stackwrk",
  legalName: site.legalEntity,
  url: "https://stackwrk.com",
  telephone: site.phoneHref.replace("tel:", ""),
  email: site.email,
  image: "https://stackwrk.com/fox.webp",
  logo: "https://stackwrk.com/fox.webp",
  description:
    "Stackwrk builds custom software, automations, CRMs, and lead-generating websites for small and mid-size businesses. Based in South Florida, working remotely across the US.",
  areaServed: [
    { "@type": "State", name: "Florida" },
    { "@type": "Country", name: "United States" },
  ],
  founder: { "@type": "Person", name: "Tal" },
  sameAs: [] as string[],
};

const websiteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://stackwrk.com/#website",
  url: "https://stackwrk.com",
  name: "Stackwrk",
  publisher: { "@id": "https://stackwrk.com/#org" },
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
        <JsonLd data={[orgLd, websiteLd]} />
        <a href="#main" className="skip-link">Skip to content</a>
        <ScrollProgress />
        <CustomCursor />
        <Nav />
        <main id="main">{children}</main>
        <ScrollToTop />
        <AttributionCapture />
        <MetaPixel />
        <GoogleAnalytics />
        <Clarity />
        <Analytics />
      </body>
    </html>
  );
}
