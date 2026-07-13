import type { Metadata } from "next";
import FenceSite from "@/components/FenceSite";

/**
 * Flagship demo — "Apex Fence Co." Renders the reusable <FenceSite/> with its
 * default config. The same component powers the /mockup generator (personalized
 * per prospect). Noindex.
 */
export const metadata: Metadata = {
  title: "Apex Fence Co. — South Florida Fence Installation (Demo)",
  robots: { index: false, follow: false },
};

export default function ApexFenceDemo() {
  return (
    <main>
      <FenceSite />
    </main>
  );
}
