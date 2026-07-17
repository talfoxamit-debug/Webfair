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
  // TODO(Tal): drop in the real Stackwrk LinkedIn / GitHub profile URLs. Left
  // blank on purpose so the footer does not link to bare linkedin.com/github.com
  // homepages (which read as broken placeholders). Blank links are hidden.
  socials: {
    linkedin: "",
    github: "",
    email: "mailto:hello@stackwrk.com",
  },
};

export const nav = [
  { label: "Work", href: "/work" },
  { label: "Services", href: "/services" },
  { label: "Guides", href: "/guides" },
  { label: "Pricing", href: "/pricing" },
  { label: "Free tools", href: "/tools" },
  { label: "Contact", href: "/contact" },
];

// Limited-time offer surfaced in the entry popup + audit section.
export const promo = {
  badge: "Limited time",
  headline: "Free website audit + 10% off your new site",
  sub: "See exactly what's costing you jobs, then get 10% off your build when you start with us.",
  discountNote: "Your 10% founding discount is locked in.",
};

export const hero = {
  eyebrow: "Websites for fence & exterior contractors",
  // Hero mascot: transparent webp under /public (optimized from the original
  // upload). Renders via HeroMedia; falls back to the abstract gradient visual
  // if missing.
  image: "/fox.webp" as string | null,
  titleLines: ["DESIGNED TO", "GROW YOUR BUSINESS"],
  subtitle:
    "Custom, mobile-first websites that turn “near me” searches into booked jobs for your fence or exterior business, so you win more work without the busywork. Live in about two weeks.",
  primaryCta: "Get a Free Site Mockup",
  secondaryCta: "See Live Examples",
  highlights: [
    { title: "Live In ~2 Weeks", sub: "Your site up and earning fast" },
    { title: "More Booked Jobs", sub: "Built to turn visitors into leads" },
    { title: "A Team Behind You", sub: "Direct access, no agency runaround" },
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
  accent: string; // tailwind gradient class (fallback tint behind the screenshot)
  tag: string;
  result: string; // the business outcome: the "so what"
  image?: string; // real screenshot under /public/shots
  badge?: string; // overlay label on the screenshot (default "Live project")
  tier?: "featured" | "main" | "more"; // showcase prominence
  demo?: boolean; // a demo/concept build, not a client's live site (links say "View demo site")
};

export const projects: Project[] = [
  {
    name: "Apex Fence Co.",
    tag: "The fence-contractor site, done right.",
    blurb:
      "A homeowner-facing fence company site with an instant quote widget, reviews, financing and service-area pages, all built to turn searches into quote requests.",
    features: ["Instant quote form + click-to-call", "Reviews, warranty & trust signals", "Financing + service-area pages"],
    href: "/demos/apex-fence",
    result: "This is the exact site we build for fence & exterior contractors. Yours gets your name, your photos, your number.",
    accent: "from-emerald-800 via-teal-900 to-ink-700",
    image: "/shots/apexfence.webp",
    badge: "Demo site",
    tier: "featured",
    demo: true,
  },
  {
    name: "Above Air",
    tag: "South-Florida HVAC contractor.",
    blurb:
      "A contractor site with an instant-estimate flow, live comfort slider, financing and bilingual support, built to book service calls.",
    features: ["Instant estimate flow", "Click-to-call + quote form", "English / Español"],
    href: "https://above-air-inc.vercel.app",
    result: "Turns after-hours emergencies into booked service calls, using the same lead-first playbook as your fence site.",
    accent: "from-emerald-800 via-teal-900 to-ink-700",
    image: "/shots/aboveair.webp",
    tier: "main",
  },
  {
    name: "Marco's · FTL",
    tag: "Local business, booked solid.",
    blurb:
      "An upscale steakhouse experience: editorial design with reservations, menus and live events.",
    features: ["Table reservations", "Digital menus & events", "High-end editorial design"],
    href: "https://marcos-restaurant-demo.vercel.app",
    result: "A first impression that turns browsers into booked tables the moment they land.",
    accent: "from-amber-900 via-rose-950 to-ink-800",
    image: "/shots/marcos.webp",
    badge: "Demo site",
    tier: "main",
    demo: true,
  },
  {
    name: "Capoeira Auê",
    tag: "Local service, booked from any phone.",
    blurb:
      "A local-service site with online scheduling, multi-language and local SEO that ranks.",
    features: ["Online scheduling", "English / Português / Español", "Local SEO that ranks"],
    href: "https://capoeira-aue.vercel.app",
    result: "Fills the schedule from any phone, in 3 languages, with local SEO that actually shows up.",
    accent: "from-amber-800 via-rose-900 to-ink-700",
    image: "/shots/capoeira-aue.webp",
    tier: "more",
  },
  {
    name: "SeaTop Homes",
    tag: "Home services, self-qualifying leads.",
    blurb:
      "Interactive tools that help buyers make smarter decisions with confidence.",
    features: ["Flood zone checker", "ROI calculator", "Home configurator"],
    href: "https://seatophomes.com",
    result: "Buyers self-qualify with the flood-zone + ROI tools before they ever pick up the phone.",
    accent: "from-sky-800 via-indigo-900 to-ink-700",
    image: "/shots/seatophomes.webp",
    tier: "more",
  },
  {
    name: "YatHub",
    tag: "Custom booking platform, built from scratch.",
    blurb:
      "A dual-sided marketplace for verified docks, crew, yacht jobs and marinas, all bookable in real time.",
    features: ["Real-time search & booking", "Verified listings", "Custom-coded, not a template"],
    href: "https://yathub.com",
    result: "Proof we build serious, custom software (not drag-and-drop sites) when the job calls for it.",
    accent: "from-teal-800 via-cyan-900 to-ink-700",
    image: "/shots/yathub.webp",
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
      body: "Most projects go live in 2 to 4 weeks, with no drawn-out timelines or ghosting.",
    },
    {
      icon: "stack",
      title: "Custom-Coded",
      body: "Hand-built to load fast and rank, never a slow, cookie-cutter template.",
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
  sub: "Quality builds that pay for themselves in booked jobs.",
  cta: "Get a Free Site Mockup",
};

export const finalCta = {
  eyebrow: "Let’s book you more jobs",
  heading: "Ready to book more jobs?",
  body: "Send us your current site (or just your Facebook page) and we’ll rebuild your homepage from your own project photos. A free mockup, no obligation.",
  points: ["Free homepage mockup", "Built from your own photos", "No obligation"],
  formTitle: "Get a Free Site Mockup",
  formSub: "Tell us about your business, and we’ll reply within one business day.",
  formCta: "Get My Free Mockup",
  calendlyLabel: "Prefer to pick a time? Book a call",
  trust: "Trusted by contractors and local businesses across South Florida.",
};

export const howItWorks = {
  eyebrow: "How it works",
  heading: ["Live in weeks,", "not months."],
  steps: [
    {
      n: "01",
      title: "Free mockup",
      body: "We rebuild your homepage from your own project photos so you see the upgrade before you spend a dollar. No obligation.",
    },
    {
      n: "02",
      title: "We design & build",
      body: "A custom, mobile-first site with the exact tools you need: booking, calculators, chat. You review as it comes to life.",
    },
    {
      n: "03",
      title: "Launch & grow",
      body: "We ship fast, then tune speed, SEO and conversions so the site keeps paying for itself.",
    },
  ],
};

// Real client testimonials. DRAFT WORDING: confirm the exact quote with each
// client and that they're OK being named publicly, then finalize here.
export const testimonials = [
  {
    quote:
      "Tal built us a clean, fast site and made the whole process painless. It makes us look legit and it's easy for customers to reach us.",
    name: "Brian",
    role: "Above Air A/C",
  },
  {
    quote:
      "The online booking he set up saves us the constant back-and-forth. Customers just reserve online. Exactly what we needed.",
    name: "Saar",
    role: "Fort Lauderdale Dock Rental",
  },
  // TODO(Tal): add a third real, named, permission-granted client quote here.
  // The previous placeholder card (attributed to "Client") was removed because
  // an invented testimonial is a fabricated-review / FTC exposure.
];

// NOTE(Tal): confirm these guarantee terms reflect what you actually offer.
export const guarantee = {
  eyebrow: "Zero-risk",
  heading: "Love it, or your money back.",
  body: "You approve the design before we build the full site. If you're not thrilled, we refund your deposit, and you walk away owing nothing.",
  points: [
    "Free audit, no obligation",
    "Fixed price, no surprise invoices",
    "You own 100% of your site & code",
  ],
};

export const footer = {
  copyright: "© 2026 Fox Solutions LLC",
  tagline: "Built with passion. Focused on results.",
};
