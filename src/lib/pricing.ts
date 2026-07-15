/**
 * Pricing engine: single source of truth for ALL prices.
 * Used by the public Plans section (founding rates) and the internal quote
 * builder at /quote (founding + standard toggle).
 *
 * "founding" = live launch pricing (Tal's original ladder, first-5-clients rate).
 * "standard" = the benchmark-informed step-up (see PRICING-BENCHMARKS.md).
 * The standard rate is ALSO shown on the site as the anchor price (struck
 * through) so the founding rate reads as a concrete, expiring deal.
 */

export type PriceItem = {
  id: string;
  label: string;
  category: "build" | "care" | "growth" | "automation" | "ai" | "crm" | "cto";
  blurb: string;
  /** one-time fee (founding / standard). 0 = subscription-only item */
  founding: number;
  standard: number;
  /** recurring monthly fee, if any */
  monthlyFounding?: number;
  monthlyStandard?: number;
  from?: boolean; // display as "from $X"
};

export const priceItems: PriceItem[] = [
  // ---- Builds ----
  {
    id: "launch-site",
    label: "Launch Site",
    category: "build",
    blurb: "5–7 pages, booking or lead capture, mobile-first, live in 2–3 weeks.",
    founding: 2000,
    standard: 3000,
    from: true,
  },
  {
    id: "growth-site",
    label: "Growth Site",
    category: "build",
    blurb: "Custom tools (calculators, portals, CMS) built around your funnel.",
    founding: 4500,
    standard: 6500,
    from: true,
  },
  {
    id: "custom-app",
    label: "Custom App / Platform",
    category: "build",
    blurb: "Marketplaces, portals, SaaS-style products. Scoped fixed-price.",
    founding: 8000,
    standard: 12000,
    from: true,
  },
  // ---- Care plans (MRR) ----
  {
    id: "care-essential",
    label: "Care: Essential",
    category: "care",
    blurb: "Hosting, updates, backups, uptime monitoring, small edits (30 min/mo).",
    founding: 0,
    standard: 0,
    monthlyFounding: 99,
    monthlyStandard: 99,
  },
  {
    id: "care-growth",
    label: "Care: Growth",
    category: "care",
    blurb: "Everything in Essential + 2h changes, SEO upkeep, monthly report, priority.",
    founding: 0,
    standard: 0,
    monthlyFounding: 249,
    monthlyStandard: 249,
  },
  {
    id: "care-partner",
    label: "Care: Partner",
    category: "care",
    blurb: "Everything in Growth + 4h dev, automation upkeep, quarterly strategy call.",
    founding: 0,
    standard: 0,
    monthlyFounding: 499,
    monthlyStandard: 499,
  },
  // ---- Growth ----
  {
    id: "growth-retainer",
    label: "Growth Retainer",
    category: "growth",
    blurb: "Ongoing CRO, landing pages, campaign support.",
    founding: 0,
    standard: 0,
    monthlyFounding: 1000,
    monthlyStandard: 2000,
    from: true,
  },
  // ---- Automation ----
  {
    id: "automation-sprint",
    label: "Automation Sprint",
    category: "automation",
    blurb: "One painful manual workflow, automated end-to-end in about a week.",
    founding: 2500,
    standard: 3500,
  },
  {
    id: "automation-program",
    label: "Automation Program",
    category: "automation",
    blurb: "Multiple connected workflows: ops, follow-ups, reporting.",
    founding: 5000,
    standard: 7500,
    from: true,
  },
  // ---- AI ----
  {
    id: "ai-assistant",
    label: "AI Assistant",
    category: "ai",
    blurb: "24/7 site AI that answers questions, qualifies leads, books appointments.",
    founding: 1500,
    standard: 2500,
    monthlyFounding: 150,
    monthlyStandard: 250,
  },
  // ---- CRM ----
  {
    id: "custom-crm",
    label: "Custom CRM",
    category: "crm",
    blurb: "Your process, your data, no per-seat fees. Custom at off-the-shelf prices.",
    founding: 6000,
    standard: 9500,
    monthlyFounding: 200,
    monthlyStandard: 300,
    from: true,
  },
  // ---- CTO ----
  {
    id: "fractional-cto",
    label: "Fractional CTO",
    category: "cto",
    blurb: "An operator-developer in your corner for strategy, vendors, and roadmap.",
    founding: 0,
    standard: 0,
    monthlyFounding: 2500,
    monthlyStandard: 4000,
    from: true,
  },
];

export const money = (n: number) => "$" + n.toLocaleString("en-US");

/**
 * Care-plan feature matrix for the public pricing cards.
 * stripeUrl: paste a Stripe Payment Link (dashboard → Payment Links → recurring
 * $X/mo product) and a "Subscribe now" button appears on the card automatically.
 * Empty string = button hidden, card CTA stays "Start with a free audit".
 */
export const carePlans = [
  {
    id: "care-essential",
    name: "Essential",
    price: 99,
    stripeUrl: "",
    tagline: "Never worry about your site again.",
    features: [
      "Managed hosting & SSL",
      "Software updates & security",
      "Daily backups",
      "Uptime monitoring",
      "Small edits (30 min/mo)",
    ],
    highlight: false,
  },
  {
    id: "care-growth",
    name: "Growth",
    price: 249,
    stripeUrl: "",
    tagline: "Keep improving while you run the business.",
    features: [
      "Everything in Essential",
      "2h of changes every month",
      "SEO monitoring & upkeep",
      "Monthly performance report",
      "Priority support",
    ],
    highlight: true,
  },
  {
    id: "care-partner",
    name: "Partner",
    price: 499,
    stripeUrl: "",
    tagline: "Your dedicated web & software partner, on call.",
    features: [
      "Everything in Growth",
      "4h dev time every month",
      "Automations kept running",
      "Quarterly strategy call",
      "Same-day emergency response",
    ],
    highlight: false,
  },
];
