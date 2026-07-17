import type { Metadata } from "next";
import LegalDoc, { type LegalBlock } from "@/components/LegalDoc";

export const metadata: Metadata = {
  title: "Terms of Service | Stackwrk",
  description: "The terms that govern your use of the Stackwrk website.",
  alternates: { canonical: "https://stackwrk.com/terms" },
};

const UPDATED = "July 14, 2026";

const blocks: LegalBlock[] = [
  {
    h: "About these terms",
    p: "This website is operated by Fox Solutions LLC, doing business as Stackwrk. By using this site you agree to these terms. If you don’t agree, please don’t use the site. These terms cover the website itself. The specific work we do for a client is governed by the separate Website Design & Development Agreement you sign before a project starts.",
  },
  {
    h: "Using the site",
    p: "You may use this site to learn about our services, try our free tools, and get in touch. You agree not to misuse it: no attempting to break, overload, scrape at scale, or gain unauthorized access to the site or the systems behind it, and no using it for anything unlawful.",
  },
  {
    h: "Free tools & mockups",
    p: "Any free tools, audits, or mockups we provide are offered as-is to help you make a decision. They’re estimates and starting points, not guarantees of results, rankings, or specific outcomes. A free mockup remains our work product until you engage us and it’s delivered under a signed agreement.",
  },
  {
    h: "Our content",
    p: "The design, code, text, logos, and images on this site are owned by Fox Solutions LLC or used with permission, and are protected by law. Client names and marks shown as examples belong to their owners. Please don’t copy or reuse our site content without permission. (Note: work we build and deliver to a paying client becomes that client’s property under their project agreement. This section is about this marketing website.)",
  },
  {
    h: "Quotes & pricing",
    p: "Prices shown on this site (for example, “projects starting at $2,000”) are starting points and may change. Your actual price is the one written in your signed project agreement, and that agreement controls if anything here differs from it.",
  },
  {
    h: "Third-party links",
    p: "This site may link to other websites and to live projects we’ve built. We don’t control those sites and aren’t responsible for their content or their privacy practices.",
  },
  {
    h: "No warranty",
    p: "This website is provided “as is” and “as available,” without warranties of any kind, to the fullest extent allowed by law. We work hard to keep it accurate and online, but we don’t promise it will be error-free or uninterrupted.",
  },
  {
    h: "Limitation of liability",
    p: "To the fullest extent allowed by law, Fox Solutions LLC is not liable for any indirect, incidental, or consequential damages arising from your use of this website. This section is about the website; liability for project work is addressed in your signed project agreement.",
  },
  {
    h: "Governing law",
    p: "These terms are governed by the laws of the State of Florida, without regard to conflict-of-laws rules. Any dispute relating to this website will be handled in the state or federal courts located in Broward County, Florida.",
  },
  {
    h: "Changes",
    p: "We may update these terms from time to time. The “last updated” date at the top shows when. Continuing to use the site after a change means you accept the updated terms.",
  },
  {
    h: "Contact",
    p: "Questions about these terms? Email hello@stackwrk.com or call (754) 551-2828.",
  },
];

export default function TermsPage() {
  return (
    <LegalDoc
      title="Terms of Service"
      updated={UPDATED}
      intro="These terms govern your use of the Stackwrk website. They’re separate from the project agreement you sign when you hire us. That agreement covers the actual work."
      blocks={blocks}
    />
  );
}
