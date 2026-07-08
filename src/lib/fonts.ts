import { Anton, Inter } from "next/font/google";

// Poster-style condensed display face for major headlines.
export const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});

// Clean sans for body + UI.
export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
