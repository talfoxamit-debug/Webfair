import type { Metadata } from "next";
import LegalDoc, { type LegalBlock } from "@/components/LegalDoc";

export const metadata: Metadata = {
  title: "Privacy Policy | Stackwrk",
  description: "How Stackwrk (Fox Solutions LLC) collects, uses, and protects your information.",
  alternates: { canonical: "https://stackwrk.com/privacy" },
};

const UPDATED = "July 14, 2026";

const blocks: LegalBlock[] = [
  {
    h: "Who we are",
    p: "Stackwrk is the trade name of Fox Solutions LLC, a Florida limited liability company that designs and builds websites for contractors and local businesses. When this policy says “we,” “us,” or “Stackwrk,” it means Fox Solutions LLC. You can reach us any time at hello@stackwrk.com or (754) 551-2828.",
  },
  {
    h: "Information you give us",
    p: "When you submit a form on this site, request a free mockup, or book a call, we collect the details you choose to send, typically your name, email address, phone number, business name, and your current website or social page. If you sign an agreement or pay a deposit, we also collect your signature and billing details.",
  },
  {
    h: "Information we collect automatically",
    p: "Like most websites, we collect basic technical information when you visit: your IP address, browser type, device, referring page, and the pages you view. When you sign an agreement electronically, we record your IP address, browser, and a timestamp as part of the signature record so it is legally defensible.",
  },
  {
    h: "How we use your information",
    li: [
      "Reply to your request, prepare a mockup or quote, and deliver the work you hire us for.",
      "Send you your agreement, invoices, and receipts, and communicate about your project.",
      "Operate, secure, and improve this website.",
      "Meet our legal, tax, and accounting obligations.",
    ],
  },
  {
    h: "Cold outreach",
    p: "Some businesses we contact by email did not fill out a form. We reached out because your business looked like a good fit for what we build. Every one of those emails includes a way to opt out, and if you reply “stop” or ask us not to contact you again, we won’t. You can also email hello@stackwrk.com to be removed from our list at any time.",
  },
  {
    h: "Who we share it with",
    p: "We don’t sell your personal information. We share it only with the service providers that help us run the business, and only as needed to do their job:",
    li: [
      "Vercel: website hosting and delivery.",
      "Supabase: database that stores form submissions, agreements, and signatures.",
      "Stripe: payment processing (Stripe handles your card details directly; we never see your full card number).",
      "Resend: sending transactional email such as receipts and replies.",
    ],
  },
  {
    h: "Cookies",
    p: "This site uses only the cookies required for it to work and to keep it secure (for example, the login session for our private client tools). We do not run third-party advertising or cross-site tracking cookies. You can block or delete cookies in your browser settings, though some features may stop working.",
  },
  {
    h: "How long we keep it",
    p: "We keep project records, signed agreements, and payment history for as long as we have a business relationship and for as long afterward as the law requires (for example, tax and contract records). If you asked us to stop contacting you, we keep the minimum needed to honor that request. Otherwise, email us to have your information deleted.",
  },
  {
    h: "Your choices",
    li: [
      "Ask for a copy of the personal information we hold about you.",
      "Ask us to correct or delete it.",
      "Opt out of any marketing or outreach email.",
      "Withdraw consent where we rely on it. This won’t affect work already done.",
    ],
  },
  {
    h: "Security",
    p: "We use reputable providers, encrypted connections (HTTPS), and access controls to protect your information. No method of transmission or storage is ever 100% secure, but we work to protect your data and to fix any issue quickly if one comes up.",
  },
  {
    h: "Children",
    p: "This site and our services are for businesses and adults. We don’t knowingly collect information from anyone under 18.",
  },
  {
    h: "Changes to this policy",
    p: "We may update this policy from time to time. When we do, we’ll change the “last updated” date at the top. Significant changes will be reflected here on this page.",
  },
];

export default function PrivacyPage() {
  return (
    <LegalDoc
      title="Privacy Policy"
      updated={UPDATED}
      intro="This policy explains what information Stackwrk collects when you use this website or work with us, how we use it, and the choices you have. We keep it plain-English on purpose."
      blocks={blocks}
    />
  );
}
