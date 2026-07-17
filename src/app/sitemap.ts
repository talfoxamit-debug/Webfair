import type { MetadataRoute } from "next";
import { freeTools } from "@/lib/tools";
import { site } from "@/lib/content";
import { GUIDES } from "@/lib/guides";

/** Generated at /sitemap.xml: lists every public, indexable route. */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = `https://${site.domain}`;
  const lastModified = new Date();

  return [
    { url: base, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/work`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/services`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/pricing`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/guides`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/contact`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/privacy`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/tools`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    ...freeTools.map((t) => ({
      url: `${base}/tools/${t.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...GUIDES.map((g) => ({
      url: `${base}/guides/${g.slug}`,
      lastModified: new Date(g.updated ?? g.date),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
