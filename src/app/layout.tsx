import type { Metadata, Viewport } from "next";
import { anton, inter } from "@/lib/fonts";
import Nav from "@/components/Nav";
import "./globals.css";

const title = "Fox Solutions — Bold Websites. Real Results.";
const description =
  "Custom web apps and sites that solve real problems, drive bookings, and grow your business. Built fast, built to convert.";

export const metadata: Metadata = {
  metadataBase: new URL("https://foxsolutions.dev"),
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
    url: "https://foxsolutions.dev",
    siteName: "Fox Solutions",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "https://foxsolutions.dev" },
};

export const viewport: Viewport = {
  themeColor: "#0B0616",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${anton.variable} ${inter.variable}`}>
      <body>
        <Nav />
        <main>{children}</main>
      </body>
    </html>
  );
}
