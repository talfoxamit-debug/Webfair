/** Shared palette + reference data for the fence demo's free-tools suite. */

export const NAVY = "#0C2333";
export const GREEN = "#18894C";
export const GREEN_BRIGHT = "#1FA85E";

export type Material = {
  key: "wood" | "vinyl" | "aluminum" | "chain";
  name: string;
  costLow: number;
  costHigh: number;
  cost: string;
  maintenance: string;
  lifespan: string;
  privacy: string;
  storm: string;
  bestFor: string;
};

export const MATERIALS: Material[] = [
  { key: "wood", name: "Wood", costLow: 28, costHigh: 45, cost: "$28 to 45/ft", maintenance: "Medium: seal every 2 to 3 yrs", lifespan: "10 to 15 yrs", privacy: "Full", storm: "Good", bestFor: "Classic privacy on a budget" },
  { key: "vinyl", name: "Vinyl", costLow: 32, costHigh: 55, cost: "$32 to 55/ft", maintenance: "None", lifespan: "25 to 30 yrs", privacy: "Full", storm: "Excellent", bestFor: "Set-and-forget privacy" },
  { key: "aluminum", name: "Aluminum", costLow: 35, costHigh: 60, cost: "$35 to 60/ft", maintenance: "None", lifespan: "30+ yrs", privacy: "Open (none)", storm: "Excellent", bestFor: "Pools & curb appeal" },
  { key: "chain", name: "Chain-Link", costLow: 15, costHigh: 26, cost: "$15 to 26/ft", maintenance: "Low", lifespan: "15 to 20 yrs", privacy: "Open (none)", storm: "Good", bestFor: "Pets & perimeters, lowest cost" },
];

/** Typical South-Florida residential fence rules. Generalized: always verify with
 *  the city; that's exactly the headache we take off the homeowner's plate. */
export type CityRule = { city: string; county: string; back: string; front: string };
export const CITY_RULES: CityRule[] = [
  { city: "Fort Lauderdale", county: "Broward", back: "6 ft", front: "4 ft" },
  { city: "Coral Springs", county: "Broward", back: "6 ft", front: "4 ft" },
  { city: "Pompano Beach", county: "Broward", back: "6 ft", front: "4 ft" },
  { city: "Plantation", county: "Broward", back: "6 ft", front: "4 ft" },
  { city: "Hollywood", county: "Broward", back: "6 ft", front: "4 ft" },
  { city: "Davie", county: "Broward", back: "6 ft", front: "4 ft" },
  { city: "Pembroke Pines", county: "Broward", back: "6 ft", front: "4 ft" },
  { city: "Miramar", county: "Broward", back: "6 ft", front: "4 ft" },
  { city: "Weston", county: "Broward", back: "6 ft", front: "4 ft" },
  { city: "Sunrise", county: "Broward", back: "6 ft", front: "4 ft" },
  { city: "Deerfield Beach", county: "Broward", back: "6 ft", front: "4 ft" },
  { city: "Boca Raton", county: "Palm Beach", back: "6 ft", front: "4 ft" },
  { city: "Boynton Beach", county: "Palm Beach", back: "6 ft", front: "4 ft" },
  { city: "Wellington", county: "Palm Beach", back: "6 ft", front: "4 ft" },
  { city: "Miami", county: "Miami-Dade", back: "6 ft", front: "4 ft" },
  { city: "Hialeah", county: "Miami-Dade", back: "6 ft", front: "4 ft" },
];
