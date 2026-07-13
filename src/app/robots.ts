import type { MetadataRoute } from "next";
import { site } from "@/lib/content";

/** Generated at /robots.txt. Internal routes (CRM board, quote builder) stay out. */
export default function robots(): MetadataRoute.Robots {
  const base = `https://${site.domain}`;
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/crm", "/quote", "/prospects", "/mockup"] }],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
