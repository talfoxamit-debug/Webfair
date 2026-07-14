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
        `• Target launch: within 14 business days after Developer receives everything needed from Client (Section 4).`,
        `Anything not listed above is out of scope and quoted separately.`,
      ],
    },
    {
      h: "2. Price & Payment",
      body: [
        `Project fee: ${money(cfg.projectFee)} — a ${cfg.depositPct}% deposit (${money(deposit)}) to start, and the ${money(balance)} balance due when the site launches.`,
        `Care plan (${cfg.careName}): ${money(cfg.careMonthly)}/month, billed monthly starting at launch — covers hosting, updates, security, backups, monitoring, and the plan's included changes. Cancel any time with 30 days' notice.`,
        `Third-party costs (domain name, premium plugins/licenses, paid stock photos, etc.) are passed through to Client at cost and only with Client's approval.`,
        `Balances more than 10 days late accrue 1.5% monthly interest, and Developer may pause the site until paid.`,
      ],
    },
    {
      h: "3. Our Guarantee (Zero-Risk)",
      body: [
        `Love-the-design guarantee: Client approves the design before Developer builds the full site. If Client is not thrilled with the initial design and Developer cannot make it right, Developer refunds the deposit in full — Client walks away owing nothing.`,
        `On-time launch guarantee: If the site is not live within 14 business days after Developer has received everything needed from Client (Section 4), Client's first month of the care plan is free.`,
        `30-day money-back: Within 30 days of launch, if Client is not satisfied and Developer cannot make it right, Client may cancel for a full refund of the project fee (the site is taken down; care-plan fees already used are non-refundable).`,
      ],
    },
    {
      h: "4. Client Responsibilities",
      body: [
        `Within 7 days of the deposit, Client will provide: business info, logo, project photos, service list, service area, reviews, and any copy edits. Delays here extend the launch date and pause the on-time guarantee.`,
        `Client confirms it owns or has the rights to all materials it provides, and will indemnify Developer against any claim arising from Client-provided content.`,
      ],
    },
    {
      h: "5. Ownership — It's Yours to Keep",
      body: [
        `Upon full payment of the project fee, the final website — its design, content, and the custom code built for Client — belongs to Client. It's yours to keep.`,
        `Developer retains only its own general-purpose frameworks, tools, and reusable components (nothing unique to Client), and may show the finished site in its portfolio.`,
        `While Client is on a care plan, Developer hosts and manages the site. If Client cancels the care plan, Developer will hand over an export of the site files so Client can host it anywhere — no lock-in.`,
      ],
    },
    {
      h: "6. Warranty",
      body: [
        `Developer warrants the site will function as described for 90 days after launch and will fix defects at no charge. This excludes issues caused by Client edits, third-party outages, or content changes.`,
      ],
    },
    {
      h: "7. Cancellation",
      body: [
        `Before Client approves the design: either party may cancel and Developer refunds the deposit in full.`,
        `After design approval / during build: Client may cancel and pays only for work completed to that point (the deposit covers it; any excess is invoiced or refunded).`,
        `Care plan: either party may cancel with 30 days' written notice.`,
      ],
    },
    {
      h: "8. Limitation of Liability",
      body: [
        `Developer's total liability under this Agreement will not exceed the fees Client paid in the prior 3 months. Developer is not liable for indirect or consequential damages, or for lost profits.`,
        `Force majeure: neither party is liable for delays or failures caused by events beyond its reasonable control (outages, acts of God, etc.).`,
      ],
    },
    {
      h: "9. Electronic Signature & General",
      body: [
        `Electronic signature: By typing or drawing their name and clicking to sign below, Client agrees this is a legally binding electronic signature under the U.S. E-SIGN Act, and consents to conduct this transaction electronically.`,
        `Developer is an independent contractor. This Agreement is governed by the laws of the State of Florida, with venue in Broward County. It is the entire agreement between the parties and may be changed only in writing. If any part is unenforceable, the rest remains in effect.`,
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
