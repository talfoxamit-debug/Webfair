import type { Metadata } from "next";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import CardSpotlight from "@/components/CardSpotlight";
import SectionSeam from "@/components/SectionSeam";
import BrushWord from "@/components/BrushWord";
import { ArrowRight, Check, Code, Bolt, Sparkles, Stack, TrendUp, Shield } from "@/components/icons";
import { priceItems, money, type PriceItem } from "@/lib/pricing";

type IconCmp = React.ComponentType<{ width?: number; height?: number; className?: string }>;

export const metadata: Metadata = {
  title: "Services | Stackwrk",
  description:
    "Beyond websites: automations, a 24/7 AI assistant, a custom CRM, growth systems, and a fractional CTO on call. The full growth stack for local businesses.",
  alternates: { canonical: "https://stackwrk.com/services" },
};

// What the client gets, grouped for the services page. Care plans live on /pricing.
const GROUPS: { key: PriceItem["category"]; title: string; blurb: string; Icon: IconCmp }[] = [
  { key: "build", title: "Websites & Apps", Icon: Code, blurb: "Fast, custom sites and full web apps built to turn visitors into booked jobs." },
  { key: "automation", title: "Automations", Icon: Bolt, blurb: "Kill the busywork: quotes, follow-ups, invoicing and reporting, wired together and running on their own." },
  { key: "ai", title: "AI Assistant", Icon: Sparkles, blurb: "A 24/7 assistant on your site that answers questions, qualifies leads, and books appointments while you work." },
  { key: "crm", title: "Custom CRM", Icon: Stack, blurb: "Your process and your data in one place, with no per-seat fees, built around how you actually sell." },
  { key: "growth", title: "Growth Systems", Icon: TrendUp, blurb: "Landing pages and conversion tuning that keep turning more of your traffic into revenue." },
  { key: "cto", title: "Fractional CTO", Icon: Shield, blurb: "An operator-developer in your corner for strategy, vendors, and roadmap, without a full-time hire." },
];

function priceLabel(it: PriceItem): string {
  const parts: string[] = [];
  if (it.founding > 0) parts.push((it.from ? "from " : "") + money(it.founding));
  if (it.monthlyFounding) parts.push(money(it.monthlyFounding) + "/mo");
  return parts.join(" + ") || "Custom quote";
}

export default function ServicesPage() {
  return (
    <>
      {/* hero */}
      <section className="relative overflow-hidden pb-8 pt-28 sm:pt-32">
        <div className="pointer-events-none absolute inset-0 grid-backdrop opacity-[0.14]" />
        <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.18),transparent_70%)] blur-2xl" />
        <div className="pointer-events-none absolute left-[6%] top-28 h-72 w-72 rounded-full bg-lime/[0.07] blur-[90px]" />
        {/* floating fox mascot (desktop) */}
        <div className="pointer-events-none absolute -left-4 top-16 z-0 hidden w-[20%] max-w-[220px] xl:block" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element -- static decorative asset */}
          <img src="/fox-run.webp" alt="" loading="lazy" decoding="async" className="w-full animate-float-y opacity-90 drop-shadow-[0_0_40px_rgba(255,90,40,0.16)]" />
        </div>
        <div className="container-content relative z-10 text-center">
          <Reveal className="mx-auto max-w-2xl">
            <p className="eyebrow">Services</p>
            <h1 className="mt-3 font-display text-5xl uppercase leading-[0.92] text-white sm:text-6xl">
              More than a website.<br /><BrushWord>The whole stack.</BrushWord>
            </h1>
            <p className="mt-8 text-lg leading-relaxed text-white/60">
              Most clients start with a website, then grow into the systems that run the business:
              automation, AI, a CRM, and a technical partner who ships. Here&rsquo;s everything we build for you.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-white/50">
              <span className="inline-flex items-center gap-1.5"><Check width={15} height={15} className="text-lime" /> One partner, whole stack</span>
              <span className="inline-flex items-center gap-1.5"><Check width={15} height={15} className="text-lime" /> Custom-built, not templates</span>
              <span className="inline-flex items-center gap-1.5"><Check width={15} height={15} className="text-lime" /> No lock-in</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* service groups */}
      <section className="py-8 sm:py-10">
        <div className="container-content space-y-6">
          {GROUPS.map((g, gi) => {
            const items = priceItems.filter((it) => it.category === g.key);
            if (!items.length) return null;
            return (
              <Reveal as="div" key={g.key} delay={gi * 60} className="group/section rounded-2xl border border-white/[0.07] bg-white/[0.015] p-6 transition-all duration-300 hover:border-lime/20 hover:bg-white/[0.025] sm:p-7">
                <div className="sm:flex sm:items-baseline sm:justify-between sm:gap-6">
                  <h2 className="flex items-center gap-3 font-display text-2xl uppercase tracking-wide text-white">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-lime/40 bg-lime/[0.06] text-lime shadow-glow-lime transition-transform duration-300 group-hover/section:-translate-y-0.5 group-hover/section:scale-110 group-hover/section:rotate-[-6deg]">
                      <g.Icon width={20} height={20} />
                    </span>
                    {g.title}
                  </h2>
                  <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-white/55 sm:mt-0 sm:text-right">{g.blurb}</p>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {items.map((it) => (
                    <div key={it.id} className="group relative flex flex-col overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-lime/25 hover:bg-white/[0.04] hover:shadow-[0_18px_44px_-30px_rgba(203,255,60,0.5)]">
                      <CardSpotlight />
                      <div className="relative z-10 flex items-start justify-between gap-3">
                        <h3 className="text-sm font-bold text-white">{it.label}</h3>
                        <span className="shrink-0 whitespace-nowrap rounded-md border border-lime/25 bg-lime/[0.08] px-2 py-0.5 text-xs font-bold text-lime">{priceLabel(it)}</span>
                      </div>
                      <p className="relative z-10 mt-1.5 text-xs leading-relaxed text-white/55">{it.blurb}</p>
                    </div>
                  ))}
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      <div className="container-content pb-6 text-center">
        <p className="text-sm text-white/45">
          Looking for website + care-plan pricing?{" "}
          <a href="/pricing" className="text-lime underline-offset-4 hover:underline">See pricing →</a>
        </p>
        <a href="/#audit" className="btn-primary mt-5 !rounded-md">
          Start with a free audit
          <ArrowRight width={16} height={16} />
        </a>
      </div>

      <SectionSeam hue="magenta" />
      <FinalCTA />
      <Footer />
    </>
  );
}
