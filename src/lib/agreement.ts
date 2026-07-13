/**
 * Client agreement — data model + content. A personalized link is generated from
 * the CRM (config encoded in the URL), the client reviews and e-signs at
 * /agreement, and the signature is recorded server-side. Doubles as the "close
 * kit": project summary + sign + (once Stripe is live) pay, in one link.
 *
 * Not legal advice — have a Florida attorney review the template once.
 */

export type AgreementConfig = {
  clientName: string;   // client's legal / business name
  contact: string;      // contact person
  email: string;
  phone: string;
  pkg: "Launch" | "Growth" | "Market Leader";
  pages: number;
  projectFee: number;   // one-time build fee
  depositPct: number;   // % due to start
  careName: string;     // care plan name
  careMonthly: number;  // care plan $/mo
  date?: string;        // ISO; defaults to today at render
  payLink?: string;     // Stripe deposit link (optional until EIN/Stripe live)
};

export const DEFAULT_AGREEMENT: AgreementConfig = {
  clientName: "[Client Business Name]",
  contact: "",
  email: "",
  phone: "",
  pkg: "Growth",
  pages: 6,
  projectFee: 3900,
  depositPct: 50,
  careName: "Growth",
  careMonthly: 249,
  payLink: "",
};

export function resolveAgreement(cfg?: Partial<AgreementConfig>): AgreementConfig {
  return { ...DEFAULT_AGREEMENT, ...(cfg || {}) };
}

const money = (n: number) => "$" + n.toLocaleString("en-US");

/** The full agreement, with the config values filled in. */
export function buildAgreement(cfg: AgreementConfig) {
  const deposit = Math.round((cfg.projectFee * cfg.depositPct) / 100);
  const balance = cfg.projectFee - deposit;
  const clauses: { h: string; body: string[] }[] = [
    {
      h: "1. Services & Deliverables",
      body: [
        `Developer will design, build, and launch a website for Client under the ${cfg.pkg} package:`,
        `• ${cfg.pages} pages, mobile-responsive, custom design (no template resale).`,
        `• Lead capture: quote form + click-to-call, plus package-appropriate tools (booking, financing, service-area pages).`,
        `• On-page SEO basics, Google Business Profile setup assistance, and analytics.`,
        `• One (1) round of revisions at the design stage and one (1) round before launch.`,
        `• Target launch: within 10 business days of receiving all Client content (Section 4).`,
        `Anything not listed above is out of scope and quoted separately.`,
      ],
    },
    {
      h: "2. Price & Payment",
      body: [
        `Project fee: ${money(cfg.projectFee)}, payable ${cfg.depositPct}% deposit (${money(deposit)}) to start and the ${money(balance)} balance on launch.`,
        `Care plan (${cfg.careName}): ${money(cfg.careMonthly)}/month, billed monthly starting at launch — covers hosting, updates, security, backups, monitoring, and the plan's included changes. Cancel any time with 30 days' notice.`,
        `Late balances over 10 days may pause the site.`,
      ],
    },
    {
      h: "3. Guarantee",
      body: [
        `Launch guarantee: if the site isn't live within 10 business days of receiving all content, Client's first care-plan month is free.`,
        `30-day money-back: within 30 days of launch, if Client isn't satisfied and Developer can't make it right, Client may cancel for a refund of the project fee (site is taken down; care-plan fees are non-refundable).`,
      ],
    },
    {
      h: "4. Client Responsibilities",
      body: [
        `Client will provide, within 7 days of the deposit: business info, logo, project photos, service list, service area, reviews, and any copy edits. Delays extend the launch date. Client confirms it owns or has rights to all materials it provides.`,
      ],
    },
    {
      h: "5. Ownership & Intellectual Property",
      body: [
        `Upon full payment of the project fee, Developer assigns to Client all rights to the final delivered website design and content created for Client.`,
        `Developer retains rights to underlying code frameworks, tools, and generic components, and may show the finished site in its portfolio. While on a care plan, hosting and licensed third-party services remain Developer-managed.`,
      ],
    },
    {
      h: "6. Warranty",
      body: [
        `Developer warrants the site will function as described for 90 days after launch and will fix defects at no charge. This excludes issues from Client edits, third-party outages, or content changes.`,
      ],
    },
    {
      h: "7. Cancellation",
      body: [
        `Before launch: Client may cancel; the deposit is non-refundable (it covers work performed), and Client owes for any work completed beyond the deposit.`,
        `Care plan: either party may cancel with 30 days' written notice.`,
      ],
    },
    {
      h: "8. Limitation of Liability",
      body: [
        `Developer's total liability under this Agreement will not exceed the fees paid by Client in the prior 3 months. Developer is not liable for indirect or consequential damages or lost profits.`,
      ],
    },
    {
      h: "9. General",
      body: [
        `Developer is an independent contractor. This Agreement is governed by the laws of the State of Florida, is the entire agreement between the parties, and may be changed only in writing. If any part is unenforceable, the rest remains in effect.`,
      ],
    },
  ];
  return { deposit, balance, clauses, money };
}

// ---- URL-safe encode/decode (browser + Node) ----
export function encodeAgreement(cfg: Partial<AgreementConfig>): string {
  const bytes = new TextEncoder().encode(JSON.stringify(cfg));
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeAgreement(s: string): Partial<AgreementConfig> | null {
  try {
    const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
    const bin = atob(b64);
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
}
