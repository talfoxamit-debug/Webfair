/**
 * Free-tools registry — the single source of truth for the /tools hub, each
 * standalone tool page, the sitemap, and nav. Data-only (no JSX) so it can be
 * imported from both server and client components.
 *
 * Each tool doubles as an SEO/AIO landing page: a genuinely useful free tool at
 * the top (the lead magnet) and structured, answerable content below (FAQ →
 * FAQPage schema) so search + AI answer engines can cite it.
 */

export type ToolIcon = "bolt" | "trend" | "chat" | "target";

export type FaqItem = { q: string; a: string };

export type FreeTool = {
  slug: string;
  name: string;
  /** one-line label used on cards + nav */
  short: string;
  /** hub-card paragraph */
  blurb: string;
  icon: ToolIcon;
  /** on-page H1 + intro */
  h1: string;
  intro: string;
  cta: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  faq: FaqItem[];
};

export const freeTools: FreeTool[] = [
  {
    slug: "website-audit",
    name: "Instant Website Audit",
    short: "Score your site in seconds",
    blurb:
      "A free, Lighthouse-style scorecard for any website: speed, mobile, SEO and the conversion gaps quietly costing you customers.",
    icon: "bolt",
    h1: "Free Instant Website Audit",
    intro:
      "Drop in any website and get a 0–100 scorecard in seconds: load speed, mobile-friendliness, SEO basics and the conversion gaps that lose you customers. No signup to see your score.",
    cta: "Audit my website",
    metaTitle: "Free Instant Website Audit: Speed, SEO & Mobile Score | Stackwrk",
    metaDescription:
      "Run a free instant website audit. Get a 0–100 score for speed, mobile-friendliness, SEO and conversion in seconds, no signup. See exactly what's costing you customers.",
    keywords: [
      "free website audit",
      "website speed test",
      "seo checker",
      "site performance score",
      "mobile friendly test",
      "website grader",
    ],
    faq: [
      {
        q: "Is the website audit really free?",
        a: "Yes. You can run the audit and see your full 0–100 scorecard for free, with no signup. If you want the detailed report emailed to you with fixes, you just add your name and email.",
      },
      {
        q: "What does the audit check?",
        a: "It checks load speed, page weight, mobile-friendliness, core SEO signals (title, meta description, headings, indexability), HTTPS security and common conversion gaps, the same categories a Lighthouse audit weighs.",
      },
      {
        q: "How is the score calculated?",
        a: "Each category (speed, mobile, SEO, conversion) is scored 0–100 and weighted into an overall grade. Hard problems like a missing HTTPS certificate or a page blocked from search engines cap the score, the way a real Lighthouse-grade audit would.",
      },
      {
        q: "Will you fix the issues it finds?",
        a: "We can. Stackwrk builds fast, conversion-focused websites and offers care plans that keep your score high. Book a free call and we'll walk through your report together.",
      },
    ],
  },
  {
    slug: "roi-calculator",
    name: "Website ROI Calculator",
    short: "See what a better site is worth",
    blurb:
      "Estimate the monthly revenue a faster, higher-converting website could recover, based on your real traffic and average sale value.",
    icon: "trend",
    h1: "Website ROI Calculator",
    intro:
      "See the revenue a better website is actually worth. Enter your monthly visitors and average sale value, and we'll estimate the extra revenue a higher-converting site could recover every month.",
    cta: "Calculate my ROI",
    metaTitle: "Website ROI Calculator: What a Better Site Is Worth | Stackwrk",
    metaDescription:
      "Free website ROI calculator. Enter your monthly visitors and average sale value to estimate the revenue a higher-converting website could recover every month.",
    keywords: [
      "website roi calculator",
      "conversion rate revenue calculator",
      "website value calculator",
      "web design roi",
      "conversion rate optimization calculator",
    ],
    faq: [
      {
        q: "How does the ROI calculator work?",
        a: "It multiplies your monthly visitors by a conversion rate and your average sale value to estimate revenue, then compares a typical current conversion rate against the rate a well-built, fast site tends to achieve. The gap is the revenue you're likely leaving on the table.",
      },
      {
        q: "Where do the conversion rates come from?",
        a: "The defaults are conservative industry benchmarks: around 1–2% for a dated or slow site and 4–5% for a fast, conversion-focused one. Your real numbers depend on your traffic quality and offer, so treat the result as an illustrative estimate.",
      },
      {
        q: "Is a better website really worth it?",
        a: "For most small businesses, recovering even one or two extra conversions a week pays for the site many times over within a year. The calculator makes that trade-off concrete before you spend a dollar.",
      },
    ],
  },
  {
    slug: "meta-tag-generator",
    name: "Meta Tag & Social Preview Generator",
    short: "Preview & generate your SEO tags",
    blurb:
      "See exactly how your page looks in Google, X/Twitter and Facebook, then copy ready-made meta and Open Graph tags.",
    icon: "target",
    h1: "Meta Tag & Social Preview Generator",
    intro:
      "Type your title, description, URL and image, and see live previews of how your page appears in Google search, on X/Twitter, and on Facebook, then copy production-ready meta + Open Graph tags. No signup.",
    cta: "Generate my tags",
    metaTitle: "Free Meta Tag & Open Graph Preview Generator | Stackwrk",
    metaDescription:
      "Free meta tag and Open Graph generator. Preview how your page looks in Google, X/Twitter and Facebook, then copy ready-to-paste meta + OG tags. No signup.",
    keywords: [
      "meta tag generator",
      "open graph preview",
      "og tags generator",
      "twitter card preview",
      "google serp preview",
      "social media preview tool",
    ],
    faq: [
      {
        q: "What are meta tags and why do they matter?",
        a: "Meta tags are snippets of HTML that tell search engines and social networks what your page is about: its title, description, and preview image. They shape how your page looks in Google results and when shared on social media, which directly affects click-through rate.",
      },
      {
        q: "What's the ideal title and description length?",
        a: "Aim for a title around 50–60 characters and a description around 120–160 characters. Longer than that and search engines truncate it with an ellipsis. This tool flags when you go over.",
      },
      {
        q: "What is Open Graph (OG)?",
        a: "Open Graph is the tag standard (og:title, og:description, og:image) that Facebook, LinkedIn, and most platforms read to build a rich link preview. X/Twitter uses its own twitter:card tags. This tool generates all of them for you.",
      },
      {
        q: "Will meta tags improve my Google ranking?",
        a: "A great title and description won't magically rank you #1, but they strongly influence whether people click your result, and click-through is a signal that helps. Clean tags also prevent Google from writing its own (often worse) snippet for you.",
      },
    ],
  },
];

export const getTool = (slug: string): FreeTool | undefined =>
  freeTools.find((t) => t.slug === slug);

export const toolPath = (slug: string) => `/tools/${slug}`;
