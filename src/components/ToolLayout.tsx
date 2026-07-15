import Link from "next/link";
import Footer from "./Footer";
import JsonLd from "./JsonLd";
import { ArrowRight, Bolt, TrendUp, Sparkles, Target } from "./icons";
import { site } from "@/lib/content";
import type { FreeTool, ToolIcon } from "@/lib/tools";

const ICONS: Record<ToolIcon, typeof Bolt> = {
  bolt: Bolt,
  trend: TrendUp,
  chat: Sparkles,
  target: Target,
};

/** Shared chrome for every /tools/[slug] page: intro, the tool, FAQ + schema. */
export default function ToolLayout({
  tool,
  children,
}: {
  tool: FreeTool;
  children: React.ReactNode;
}) {
  const Icon = ICONS[tool.icon];
  const url = `https://${site.domain}/tools/${tool.slug}`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: tool.name,
      url,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      provider: { "@type": "Organization", name: "Stackwrk", url: `https://${site.domain}` },
      description: tool.metaDescription,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: tool.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `https://${site.domain}` },
        { "@type": "ListItem", position: 2, name: "Free Tools", item: `https://${site.domain}/tools` },
        { "@type": "ListItem", position: 3, name: tool.name, item: url },
      ],
    },
  ];

  return (
    <>
      <JsonLd data={jsonLd} />
      <div className="relative overflow-hidden pt-28 sm:pt-32">
        <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-[40rem] -translate-x-1/2 rounded-full bg-lime/[0.06] blur-[100px]" />
        <div className="container-content relative">
          {/* breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-white/40">
            <Link href="/" className="transition-colors hover:text-lime">Home</Link>
            <span>/</span>
            <Link href="/tools" className="transition-colors hover:text-lime">Free tools</Link>
            <span>/</span>
            <span className="text-white/70">{tool.name}</span>
          </nav>

          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-lime/25 bg-lime/[0.06] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-lime">
              <Icon width={14} height={14} /> Free tool
            </span>
            <h1 className="mt-5 font-display text-4xl uppercase leading-[0.95] text-white sm:text-5xl">
              {tool.h1}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-white/60">{tool.intro}</p>
          </div>

          <div className="mt-9">{children}</div>
        </div>
      </div>

      {/* FAQ: visible + drives FAQPage schema for SEO/AIO */}
      <section className="relative py-14 sm:py-20">
        <div className="container-content">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center font-display text-3xl uppercase text-white sm:text-4xl">
              Frequently asked
            </h2>
            <div className="mt-8 space-y-3">
              {tool.faq.map((f) => (
                <details
                  key={f.q}
                  className="group rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 transition-colors open:border-lime/25 hover:border-white/15"
                >
                  <summary className="flex cursor-pointer items-center justify-between gap-4 text-sm font-semibold text-white marker:content-['']">
                    {f.q}
                    <span className="shrink-0 text-lime transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-white/60">{f.a}</p>
                </details>
              ))}
            </div>

            {/* CTA band */}
            <div className="mt-12 flex flex-col items-center gap-4 rounded-2xl border border-white/[0.08] bg-gradient-to-br from-violet-800/20 to-[#0b0616] p-8 text-center">
              <h3 className="font-display text-2xl uppercase text-white sm:text-3xl">
                Want the fixes done for you?
              </h3>
              <p className="max-w-md text-sm text-white/60">
                Stackwrk builds fast, conversion-focused websites, and keeps them that way. Book a free
                call and we&rsquo;ll walk through your results together.
              </p>
              <a href={site.calendlyUrl} target="_blank" rel="noopener noreferrer" className="btn-primary !rounded-md">
                Book a free call
                <ArrowRight width={18} height={18} />
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
