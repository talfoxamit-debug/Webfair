import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { ArrowRight, Bolt, TrendUp, Sparkles, Target } from "@/components/icons";
import { freeTools, type ToolIcon } from "@/lib/tools";
import { site } from "@/lib/content";

const ICONS: Record<ToolIcon, typeof Bolt> = {
  bolt: Bolt,
  trend: TrendUp,
  chat: Sparkles,
  target: Target,
};

const title = "Free Website Tools — Audit, ROI Calculator & More | Stackwrk";
const description =
  "Free tools for small-business owners: an instant website audit, a website ROI calculator, and more. No signup to get your results — see what a better site is worth.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "free website tools",
    "website audit tool",
    "website roi calculator",
    "small business website tools",
    "free seo tools",
  ],
  alternates: { canonical: "/tools" },
  openGraph: { title, description, url: "/tools", type: "website" },
};

export default function ToolsHubPage() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Free Website Tools",
      url: `https://${site.domain}/tools`,
      description,
      isPartOf: { "@type": "WebSite", name: "Stackwrk", url: `https://${site.domain}` },
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: freeTools.map((t, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: t.name,
        url: `https://${site.domain}/tools/${t.slug}`,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `https://${site.domain}` },
        { "@type": "ListItem", position: 2, name: "Free Tools", item: `https://${site.domain}/tools` },
      ],
    },
  ];

  return (
    <>
      <JsonLd data={jsonLd} />
      <div className="relative overflow-hidden pt-28 pb-10 sm:pt-32">
        <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-[42rem] -translate-x-1/2 rounded-full bg-lime/[0.06] blur-[100px]" />
        {/* Alert fox presenting the tools (desktop only) */}
        <div className="pointer-events-none absolute right-[1%] top-16 z-0 hidden w-44 opacity-90 xl:block 2xl:w-52" aria-hidden="true">
          <div className="animate-float-y">
            {/* eslint-disable-next-line @next/next/no-img-element -- static decorative asset */}
            <img src="/fox-alert.webp" alt="" loading="lazy" decoding="async" className="w-full drop-shadow-[0_0_40px_rgba(203,255,60,0.16)]" />
          </div>
        </div>
        <div className="container-content relative">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-lime/25 bg-lime/[0.06] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-lime">
              <Sparkles width={14} height={14} /> Free tools
            </span>
            <h1 className="mt-5 font-display text-4xl uppercase leading-[0.95] text-white sm:text-6xl">
              Free tools that <span className="text-accent-glow">actually help</span>
            </h1>
            <p className="mt-4 text-base leading-relaxed text-white/60">
              Practical tools for business owners — no fluff, no signup to get your results. Use them to
              see exactly where your website is losing customers and what fixing it is worth.
            </p>
          </div>

          {/* Mobile: alert fox in-flow above the tool cards (centered, no overflow). */}
          <div className="pointer-events-none mx-auto mt-8 w-40 xl:hidden" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element -- decorative */}
            <img src="/fox-alert.webp" alt="" loading="lazy" decoding="async" className="w-full animate-float-y opacity-90 drop-shadow-[0_0_35px_rgba(203,255,60,0.16)]" />
          </div>

          <div className="mx-auto mt-12 grid max-w-4xl gap-5 sm:grid-cols-2">
            {freeTools.map((t) => {
              const Icon = ICONS[t.icon];
              return (
                <Link
                  key={t.slug}
                  href={`/tools/${t.slug}`}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] p-7 transition-all hover:-translate-y-1 hover:border-lime/30 hover:bg-white/[0.03]"
                >
                  <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-lime/[0.05] opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-lime/40 text-lime shadow-[0_0_18px_-6px_rgba(203,255,60,0.5)]">
                    <Icon width={22} height={22} />
                  </span>
                  <h2 className="mt-5 font-display text-2xl uppercase text-white">{t.name}</h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-white/55">{t.blurb}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-lime">
                    {t.cta}
                    <ArrowRight width={16} height={16} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              );
            })}
          </div>

          <p className="mt-10 text-center text-sm text-white/45">
            More free tools on the way.{" "}
            <a href={site.calendlyUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-lime hover:underline">
              Book a free call
            </a>{" "}
            if you&rsquo;d rather we just handle it.
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}
