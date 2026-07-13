/** Config for the reusable fence-contractor site (demo + mockup generator). */

export type GalleryItem = { img: string; title: string; city: string };
export type Review = { q: string; n: string; c: string };

export type FenceConfig = {
  business: string;
  phone: string;
  city: string; // primary city, e.g. "Fort Lauderdale"
  region: string; // "South Florida"
  tagline: string; // hero H1
  heroImg: string;
  gallery: GalleryItem[];
  reviews: Review[];
  years: string;
  jobs: string;
  rating: string;
  reviewCount: string;
  license: string;
  areas: string[];
  photoCredit: string;
};

export const DEFAULT_CONFIG: FenceConfig = {
  business: "Apex Fence Co.",
  phone: "(954) 555-0140",
  city: "Fort Lauderdale",
  region: "South Florida",
  tagline: "South Florida’s trusted fence builders.",
  heroImg: "/demo/fence/hero.webp",
  gallery: [
    { img: "/demo/fence/g-gate.webp", title: "Cedar fence & custom gate", city: "Fort Lauderdale" },
    { img: "/demo/fence/g-cedar.webp", title: "Sideyard cedar privacy", city: "Plantation" },
    { img: "/demo/fence/g-vinyl.webp", title: "White vinyl privacy", city: "Weston" },
    { img: "/demo/fence/g-comp.webp", title: "Modern composite screen", city: "Davie" },
    { img: "/demo/fence/g-ranch.webp", title: "Estate ranch rail", city: "Southwest Ranches" },
    { img: "/demo/fence/g-rail.webp", title: "Ranch rail on the water", city: "Parkland" },
  ],
  reviews: [
    { q: "They replaced our whole backyard fence in two days. Cleanest crew we've had — the vinyl looks incredible.", n: "Maria S.", c: "Coral Springs" },
    { q: "Got three quotes; these guys were the only ones that showed up on time and put it in writing. No surprises.", n: "James T.", c: "Fort Lauderdale" },
    { q: "Our pool passed inspection first try thanks to their safety fence. Highly recommend.", n: "Dana R.", c: "Pembroke Pines" },
  ],
  years: "25+ yrs",
  jobs: "3,000+",
  rating: "4.9",
  reviewCount: "214",
  license: "FL Lic. #CGC-000000",
  areas: ["Fort Lauderdale", "Pompano Beach", "Coral Springs", "Plantation", "Pembroke Pines", "Davie", "Hollywood", "Miramar", "Weston", "Sunrise"],
  photoCredit: "Demo photos: nordique, okchomeseller, Field Outdoor Spaces, EliteBalustradeImages, Gareth1953 (Flickr, CC BY 2.0)",
};

/** URL-safe encode/decode of a partial config (works in browser + Node). */
export function encodeConfig(cfg: Partial<FenceConfig>): string {
  const json = JSON.stringify(cfg);
  const bytes = new TextEncoder().encode(json);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeConfig(s: string): Partial<FenceConfig> {
  try {
    const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
    const bin = atob(b64);
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return {};
  }
}

export function resolveConfig(partial: Partial<FenceConfig> | null | undefined): FenceConfig {
  const p = partial || {};
  return {
    ...DEFAULT_CONFIG,
    ...p,
    // if a business name is given but no tagline, derive one
    tagline: p.tagline || (p.region ? `${p.region}’s trusted fence builders.` : DEFAULT_CONFIG.tagline),
    gallery: p.gallery && p.gallery.length ? p.gallery : DEFAULT_CONFIG.gallery,
    reviews: p.reviews && p.reviews.length ? p.reviews : DEFAULT_CONFIG.reviews,
    areas: p.areas && p.areas.length ? p.areas : DEFAULT_CONFIG.areas,
    photoCredit: p.business ? "" : DEFAULT_CONFIG.photoCredit,
  };
}
