/**
 * Single source of truth for all site copy and links.
 * Public-facing brand is "Stackwrk". "Fox Solutions LLC" is the legal entity
 * and appears ONLY in the footer copyright — never as brand/imagery.
 *
 * Copy below is derived from the Direction B reference screenshot. Replace the
 * placeholder links (Calendly, live project URLs) with real values before launch.
 */

export const site = {
  brand: "STACKWRK",
  domain: "stackwrk.com",
  legalEntity: "Fox Solutions LLC",
  email: "hello@stackwrk.com",
  // TODO: confirm final Calendly link before launch.
  calendlyUrl: "https://calendly.com/",
  socials: {
    linkedin: "https://www.linkedin.com/",
    github: "https://github.com/",
    email: "mailto:hello@stackwrk.com",
  },
};

export const nav = [
  { label: "Work", href: "#work" },
  { label: "Process", href: "#process" },
  { label: "About", href: "#about" },
];

export const hero = {
  eyebrow: "Web development that delivers",
  // Hero mascot image (a file under /public). Renders when present; if the
  // file is missing or fails to load, HeroMedia falls back to the abstract
  // gradient visual — so this is safe to point at an asset that isn't uploaded
  // yet. Drop the PNG/SVG into /public at this path and it appears.
  image: "/fox-solutions-direction-b-fox-transparent.png" as string | null,
  titleLines: ["BOLD WEBSITES.", "REAL RESULTS."],
  subtitle:
    "Custom web apps and sites that solve real problems, drive bookings, and grow your business.",
  primaryCta: "Book a Free Site Audit",
  secondaryCta: "See My Work",
  highlights: [
    { title: "Fast", sub: "Launch in 2–4 weeks" },
    { title: "Converts", sub: "Built for leads & bookings" },
    { title: "Mobile First", sub: "Pixel-perfect on any device" },
  ],
};

export const stack = [
  { name: "Next.js" },
  { name: "TypeScript" },
  { name: "Tailwind" },
  { name: "Supabase" },
  { name: "Vercel" },
];

export type Project = {
  name: string;
  blurb: string;
  features: string[];
  href: string;
  accent: string; // tailwind gradient class for the screenshot placeholder
  tag: string;
};

export const projects: Project[] = [
  {
    name: "SeaTop Homes",
    tag: "Elevated living. Anywhere.",
    blurb:
      "Interactive tools that help buyers make smarter decisions with confidence.",
    features: ["Flood zone checker", "ROI calculator", "Home configurator"],
    href: "#work", // TODO: real live-site URL
    accent: "from-sky-800 via-indigo-900 to-ink-700",
  },
  {
    name: "Dock Rentals",
    tag: "Premium dock rentals in Fort Lauderdale",
    blurb:
      "Dual-sided dock rental marketplace with real-time booking and blog.",
    features: ["Dual-sided booking flow", "Real-time availability", "Blog & local SEO"],
    href: "#work", // TODO: real live-site URL
    accent: "from-teal-800 via-cyan-900 to-ink-700",
  },
  {
    name: "Capoeira Auê",
    tag: "Movement. Culture. Community.",
    blurb:
      "Local service website with class scheduling, multi-language and SEO.",
    features: ["Class scheduling system", "English / Português / עברית", "Custom CMS for content"],
    href: "#work", // TODO: real live-site URL
    accent: "from-amber-800 via-rose-900 to-ink-700",
  },
];

export const whatYouGet = {
  heading: ["Everything you need.", "Nothing you don’t."],
  items: [
    {
      icon: "code",
      title: "Custom-Built",
      body: "No templates. Built from scratch for your business.",
    },
    {
      icon: "bolt",
      title: "Fast Turnaround",
      body: "Most projects live in 2–4 weeks. No endless delays.",
    },
    {
      icon: "stack",
      title: "Modern Stack",
      body: "Next.js, TypeScript, Tailwind, Supabase & more.",
    },
    {
      icon: "target",
      title: "Built to Convert",
      body: "Strategy, UX, and performance that drive results.",
    },
  ],
};

export const investment = {
  eyebrow: "Investment",
  headline: "Projects starting at",
  price: "$2,000",
  sub: "Quality websites that pay for themselves. Serious projects. Serious results.",
  cta: "Book a Free Site Audit",
};

export const finalCta = {
  eyebrow: "Let’s build something great",
  heading: "Ready to get started?",
  body: "Book a free site audit and I’ll show you exactly how we can improve your online presence and drive more results.",
  points: ["Free 30-min audit", "Actionable insights", "No obligation"],
  formTitle: "Book a Free Site Audit",
  formSub: "Tell me about your project — I’ll reply within one business day.",
  formCta: "Request My Free Audit",
  calendlyLabel: "Prefer to pick a time? Book on Calendly",
  trust: "Trusted by business owners across the U.S. and beyond.",
};

export const footer = {
  copyright: "© 2026 Fox Solutions LLC",
  tagline: "Built with passion. Focused on results.",
};
