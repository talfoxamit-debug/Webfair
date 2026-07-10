/**
 * Single source of truth for the Direction B landing page copy.
 * Replace the placeholder links (Calendly, live project URLs) with real values
 * before launch.
 */

export const site = {
  brand: "STACKWRK",
  domain: "stackwrk.com",
  legalEntity: "Fox Solutions LLC",
  email: "hello@stackwrk.com",
  calendlyUrl: "https://calendly.com/tal-foxamit-seatophomes/30min",
  socials: {
    linkedin: "https://www.linkedin.com/",
    github: "https://github.com/",
    email: "mailto:hello@stackwrk.com",
  },
};

export const nav = [
  { label: "Work", href: "#work" },
  { label: "Process", href: "#process" },
  { label: "Pricing", href: "#plans" },
  { label: "Free tools", href: "/tools" },
  { label: "About", href: "#about" },
];

export const hero = {
  eyebrow: "Web development that delivers",
  // Hero mascot: transparent webp under /public (optimized from the original
  // upload). Renders via HeroMedia; falls back to the abstract gradient visual
  // if missing.
  image: "/fox.webp" as string | null,
  titleLines: ["BOLD WEBSITES.", "REAL RESULTS."],
  subtitle:
    "Custom web apps and sites that solve real problems, drive bookings, leads, and revenue.",
  primaryCta: "Book a Free Site Audit",
  secondaryCta: "See My Work",
  highlights: [
    { title: "2-Week Launch", sub: "Most projects go live in ~2 weeks" },
    { title: "Built to Convert", sub: "Engineered for leads & bookings" },
    { title: "Work Direct With Me", sub: "No agencies. No handoffs." },
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
  accent: string; // tailwind gradient class — fallback tint behind the screenshot
  tag: string;
  result: string; // the business outcome — the "so what"
  image?: string; // real screenshot under /public/shots
  badge?: string; // overlay label on the screenshot (default "Live project")
  tier?: "featured" | "main" | "more"; // showcase prominence
};

export const projects: Project[] = [
  {
    name: "SeaTop Homes",
    tag: "Resilient homes, beautifully engineered.",
    blurb:
      "Interactive tools that help buyers make smarter decisions with confidence.",
    features: ["Flood zone checker", "ROI calculator", "Home configurator"],
    href: "https://seatophomes.com",
    result: "Buyers self-qualify with the flood-zone + ROI tools before they ever pick up the phone.",
    accent: "from-sky-800 via-indigo-900 to-ink-700",
    image: "/shots/seatophomes.webp",
    tier: "featured",
  },
  {
    name: "YatHub",
    tag: "The pro network for people who run yachting.",
    blurb:
      "A dual-sided marketplace for verified docks, crew, yacht jobs and marinas — book in real time.",
    features: ["Dock & marina search", "Crew & yacht jobs board", "Verified listings + instant book"],
    href: "https://yathub.com",
    result: "Owners, crew and captains match and book in real time — no more phone tag or double-bookings.",
    accent: "from-teal-800 via-cyan-900 to-ink-700",
    image: "/shots/yathub.webp",
    tier: "main",
  },
  {
    name: "Marco's · FTL",
    tag: "Where the steak sizzles and the band plays on.",
    blurb:
      "An upscale steakhouse experience — editorial design with reservations, menus and live events.",
    features: ["Table reservations", "Digital menus & events", "High-end editorial design"],
    href: "https://marcos-restaurant-demo.vercel.app",
    result: "A high-end first impression that turns browsers into booked tables the moment they land.",
    accent: "from-amber-900 via-rose-950 to-ink-800",
    image: "/shots/marcos.webp",
    badge: "Demo build",
    tier: "main",
  },
  {
    name: "Capoeira Auê",
    tag: "Movement. Culture. Community.",
    blurb:
      "Local service website with class scheduling, multi-language and SEO.",
    features: ["Class scheduling system", "English / Português / Español", "Custom CMS for content"],
    href: "https://capoeira-aue.vercel.app",
    result: "Classes fill from any phone, in 3 languages, with local SEO that actually ranks.",
    accent: "from-amber-800 via-rose-900 to-ink-700",
    image: "/shots/capoeira-aue.webp",
    tier: "more",
  },
  {
    name: "Above Air",
    tag: "We turn Florida heat into comfort.",
    blurb:
      "A South-Florida HVAC site with an instant-estimate flow, live comfort slider, financing and bilingual support.",
    features: ["Instant estimate flow", "First-responder rates", "English / Español"],
    href: "https://above-air-inc.vercel.app",
    result: "Turns after-hours heat emergencies into booked service calls.",
    accent: "from-emerald-800 via-teal-900 to-ink-700",
    image: "/shots/aboveair.webp",
    tier: "more",
  },
];

export const whatYouGet = {
  heading: ["Everything you need.", "Nothing you don’t."],
  items: [
    {
      icon: "code",
      title: "100% Custom",
      body: "No templates. Built from scratch for your business.",
    },
    {
      icon: "bolt",
      title: "Fast Delivery",
      body: "Most projects live in 2–4 weeks. No endless delays.",
    },
    {
      icon: "stack",
      title: "Modern Tech",
      body: "Next.js, TypeScript, Tailwind, Supabase & more.",
    },
    {
      icon: "target",
      title: "Conversion Focused",
      body: "Strategy, UX, and performance that drive results.",
    },
  ],
};

export const investment = {
  eyebrow: "Investment",
  headline: "Projects starting at",
  price: "$2,000",
  sub: "Quality builds that pay for themselves.",
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

export const howItWorks = {
  eyebrow: "How it works",
  heading: ["Live in weeks,", "not months."],
  steps: [
    {
      n: "01",
      title: "Free audit call",
      body: "We look at your site and goals together. You leave with a clear plan and honest advice — no obligation.",
    },
    {
      n: "02",
      title: "I design & build",
      body: "A custom, mobile-first site with the exact tools you need — booking, calculators, chat. You review as it comes to life.",
    },
    {
      n: "03",
      title: "Launch & grow",
      body: "We ship fast, then tune speed, SEO and conversions so the site keeps paying for itself.",
    },
  ],
};

// TODO(Tal): replace these SAMPLE testimonials with real client quotes before
// running campaigns. Keep them short, specific, and outcome-focused.
export const testimonials = [
  {
    quote:
      "He didn't just make it pretty — he built tools our buyers actually use. Leads come in warmer and more qualified now.",
    name: "Client",
    role: "Real estate · South Florida",
  },
  {
    quote:
      "Real-time booking changed our business. No more back-and-forth — customers just reserve and pay while we sleep.",
    name: "Client",
    role: "Rental marketplace · Fort Lauderdale",
  },
  {
    quote:
      "Fast, on time, and it works on every phone. Sign-ups went up the week we launched.",
    name: "Client",
    role: "Local service business",
  },
];

// NOTE(Tal): confirm these guarantee terms reflect what you actually offer.
export const guarantee = {
  eyebrow: "Zero-risk",
  heading: "You don’t pay until you love it.",
  body: "Start with a free audit. As we build, if you're not thrilled with the design before launch, you walk away owing nothing.",
  points: [
    "Free audit — no obligation",
    "Fixed price, no surprise invoices",
    "You own 100% of your site & code",
  ],
};

export const footer = {
  copyright: "© 2026 Fox Solutions LLC",
  tagline: "Built with passion. Focused on results.",
};
