/**
 * Blog / resources content for the fence demo site. Real, SEO-shaped articles:
 * the exact questions South-Florida homeowners search before hiring. Rendered by
 * /demos/apex-fence/guides (index) and /guides/[slug] (article), with Article
 * JSON-LD for search + AI answer engines.
 */

export type Guide = {
  slug: string;
  tag: string;
  title: string;
  excerpt: string;
  readMins: number;
  date: string; // ISO
  // body: array of blocks; "h" = subheading, "p" = paragraph, "li" = bullet list
  body: Array<{ h?: string; p?: string; li?: string[] }>;
};

export const GUIDES: Guide[] = [
  {
    slug: "fence-cost-south-florida",
    tag: "Pricing",
    title: "How much does a fence cost in South Florida? (2026 guide)",
    excerpt:
      "Real installed prices per linear foot for wood, vinyl, aluminum and chain-link in Broward & Miami-Dade, plus what actually moves the number.",
    readMins: 5,
    date: "2026-02-10",
    body: [
      { p: "The honest answer: most residential fences in South Florida land between $3,000 and $12,000 installed. The spread is wide because the material, the height, and your yard all pull the price in different directions. Here's how it really breaks down in 2026." },
      { h: "Average installed cost per linear foot" },
      { p: "These are typical materials-plus-labor ranges for a standard 6-foot residential fence in Broward and Miami-Dade:" },
      { li: [
        "Chain-link: $15–$26/ft, the budget option, great for pets and perimeters.",
        "Wood privacy (cedar/pine): $28–$45/ft, warm, classic, needs sealing every few years.",
        "Vinyl: $32–$55/ft, zero maintenance and storm-rated; the most popular privacy choice here.",
        "Aluminum / ornamental: $35–$60/ft, rust-proof, pool-code friendly, upscale look.",
      ] },
      { h: "What actually changes your price" },
      { li: [
        "Height: an 8-ft fence runs ~25% more than a 6-ft; a 4-ft is ~15% less.",
        "Gates: a walk gate adds $350–$700; an automatic driveway gate is a project of its own.",
        "Terrain & access: slopes, rock, tree roots and tight backyards add labor.",
        "Demolition: removing an old fence is usually $3–$8/ft on top.",
        "Permits: most South-FL cities require one. Budget $50–$300 (a good contractor pulls it for you).",
      ] },
      { h: "Get a real number in 30 seconds" },
      { p: "Use the instant estimator on our homepage to get a ballpark for your exact length and material, then book a free on-site estimate and we'll put the real number in writing, same day." },
    ],
  },
  {
    slug: "wood-vs-vinyl-vs-aluminum",
    tag: "Materials",
    title: "Wood vs. vinyl vs. aluminum: which fence is right for you?",
    excerpt:
      "The three most popular fence materials in Florida, compared on cost, maintenance, privacy, storms and lifespan, so you pick once and pick right.",
    readMins: 4,
    date: "2026-03-02",
    body: [
      { p: "Nine out of ten homeowners we quote are deciding between wood, vinyl and aluminum. Each wins for a different reason. Here's the short version." },
      { h: "Wood: warm and classic" },
      { p: "Cedar and pine give you that timeless look and full privacy for the lowest privacy-fence price. The trade-off is upkeep: Florida sun and humidity mean you'll want to seal or stain it every 2–3 years, and it has the shortest lifespan of the three (10–15 years)." },
      { h: "Vinyl: set it and forget it" },
      { p: "Vinyl is the most popular privacy fence in South Florida for a reason: no painting, no rot, no rust, and modern panels are engineered to take hurricane-force wind loads. It costs more upfront than wood but nothing after that, and it lasts 25–30 years. If you want privacy and never want to think about it again, this is it." },
      { h: "Aluminum: upscale and pool-ready" },
      { p: "Aluminum ornamental fencing is rust-proof, powder-coated, and the go-to for pool enclosures because it meets safety code while still looking elegant. It doesn't give privacy, but for front yards, pools and estate perimeters it's the premium choice, and it can outlive your mortgage." },
      { h: "Quick pick" },
      { li: [
        "Best value privacy: wood",
        "Best low-maintenance privacy: vinyl",
        "Best for pools & curb appeal: aluminum",
        "Best for pets & budgets: chain-link",
      ] },
    ],
  },
  {
    slug: "fence-permit-broward",
    tag: "Permits",
    title: "Do you need a permit for a fence in Broward County?",
    excerpt:
      "Almost always, yes. Here's what South-Florida cities require, height limits, HOA rules, and how to avoid a stop-work order.",
    readMins: 4,
    date: "2026-03-20",
    body: [
      { p: "Short answer: in almost every South-Florida city, a new fence needs a permit, and putting one up without it can mean fines or a tear-down order. The good news is the process is routine when it's done right." },
      { h: "Typical rules across Broward & Miami-Dade" },
      { li: [
        "Height: usually 6 ft max in back and side yards, 4 ft in front yards (varies by city).",
        "Setbacks: fences generally sit inside your property line. A survey settles it.",
        "Corner lots: extra sight-line rules so you don't block traffic visibility.",
        "Pools: any pool enclosure must meet the state residential safety-barrier code.",
      ] },
      { h: "HOA approval" },
      { p: "If you're in an HOA community, you'll usually need architectural approval on top of the city permit. Material, color and style all matter. Start this early; it's the step that most often adds weeks." },
      { h: "The easy way" },
      { p: "A licensed contractor pulls the permit, handles the survey and inspection, and makes sure the install passes the first time. We do this on every job so you never deal with the county counter. It's baked into your quote." },
    ],
  },
];

export const guideBySlug = (slug: string) => GUIDES.find((g) => g.slug === slug);
