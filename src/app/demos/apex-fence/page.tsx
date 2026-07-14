import type { Metadata } from "next";
import FenceSite from "@/components/FenceSite";
import { DEFAULT_CONFIG } from "@/lib/fence-config";

/**
 * Flagship demo — "Apex Fence Co." Renders the reusable <FenceSite/> with its
 * default config in `demo` mode (adds the demo banner + resources/blog). The same
 * component powers the /mockup generator (personalized per prospect). Noindex.
 */
export const metadata: Metadata = {
  title: "Apex Fence Co., South Florida Fence Installation (Demo)",
  description:
    "Sample fencing website by Stackwrk: instant cost estimator, gallery, reviews, financing, guides and a same-day quote flow. Wood, vinyl, aluminum & gates across South Florida.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Apex Fence Co., South Florida Fence Installation",
    description: "Instant fence cost estimator, gallery, reviews and same-day quotes.",
    type: "website",
  },
};

export default function ApexFenceDemo() {
  const c = DEFAULT_CONFIG;
  const bizLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: c.business,
    telephone: c.phone,
    areaServed: c.region,
    description: `Fence installation across ${c.region}: wood, vinyl, aluminum, gates and more.`,
    aggregateRating: { "@type": "AggregateRating", ratingValue: c.rating, reviewCount: c.reviewCount },
    priceRange: "$$",
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(bizLd) }} />
      <FenceSite demo />
    </main>
  );
}
