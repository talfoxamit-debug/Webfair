import JsonLd from "./JsonLd";
import Reveal from "./Reveal";

/**
 * Home FAQ: plain-language answers to the questions buyers actually ask.
 * Doubles as AIO content: emits FAQPage schema so search + AI answer engines
 * can quote Stackwrk directly. Server component (native <details>, no JS).
 */
const FAQS: { q: string; a: string }[] = [
  {
    q: "How much does a website cost?",
    a: "Most Stackwrk projects start around $2,000 and scale with scope. You get a fixed, written quote before any work begins. No surprise invoices.",
  },
  {
    q: "How long does it take to build?",
    a: "Most sites launch in a few weeks, not months. The exact timeline depends on scope, but you'll have a clear schedule and regular updates from day one.",
  },
  {
    q: "What do I actually get?",
    a: "A fast, custom, mobile-first website designed to convert, with the tools you need (booking, calculators, AI chat, CRM), SEO fundamentals, analytics, and a build that's yours to keep.",
  },
  {
    q: "Do you offer ongoing support after launch?",
    a: "Yes. Care plans run $99 to $499/mo and cover managed hosting, updates, security, daily backups, uptime monitoring, and a set amount of changes each month.",
  },
  {
    q: "Can you redesign my existing website?",
    a: "Absolutely. Run the free instant audit to see where your current site is losing customers, then we rebuild it into something fast and conversion-focused.",
  },
  {
    q: "Will my site rank on Google?",
    a: "SEO fundamentals (fast load times, clean semantic markup, metadata, mobile-friendliness, and structured data) are built into every Stackwrk site so search engines and AI answer engines can find and cite you.",
  },
];

export default function Faq() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <section id="faq" className="relative scroll-mt-20 py-14 sm:py-20">
      <JsonLd data={jsonLd} />
      <div className="container-content">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Questions</p>
          <h2 className="mt-3 font-display text-4xl uppercase leading-[0.95] text-white sm:text-5xl">
            Answers, up front
          </h2>
        </Reveal>

        <div className="mx-auto mt-9 max-w-3xl space-y-3">
          {FAQS.map((f) => (
            <details
              key={f.q}
              className="group rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 transition-colors open:border-lime/25 hover:border-white/15"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-white marker:content-['']">
                {f.q}
                <span className="shrink-0 text-lg text-lime transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-white/60">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
