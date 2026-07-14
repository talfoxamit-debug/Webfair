import Reveal from "./Reveal";
import CardSpotlight from "./CardSpotlight";
import { ArrowRight, Bolt, Check } from "./icons";
import { carePlans, money } from "@/lib/pricing";

/**
 * Public pricing. Care tiers sit on the market's tier boundaries ($99/$249/$499)
 * with founding-client framing. The main goal of the page is still booking a
 * free audit — so "Beyond websites" is presented as capabilities, not a menu.
 */

const capabilities = [
  {
    title: "Automations",
    blurb: "Kill the busywork: quotes, follow-ups, invoicing and reporting wired together and running on their own.",
  },
  {
    title: "AI & CRM",
    blurb: "A 24/7 site assistant that answers questions and books leads, plus a custom CRM built around your process, with no per-seat fees.",
  },
  {
    title: "Growth systems",
    blurb: "Landing pages, conversion tuning and a fractional-CTO partner on call to keep the whole thing improving.",
  },
];

export default function Plans() {
  return (
    <section id="plans" className="relative scroll-mt-20 overflow-hidden py-12 sm:py-16">
      <div className="container-content relative">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Plans &amp; pricing</p>
          <h2 className="mt-3 font-display text-4xl uppercase leading-[0.95] text-white sm:text-5xl">
            Simple plans. <span className="text-accent-glow">No surprises.</span>
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-white/60">
            Fixed prices, no hourly meters. Build once, then a care plan keeps it fast,
            secure and improving every month.
          </p>
          <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-lime/30 bg-lime/[0.08] px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-lime">
            <Bolt width={13} height={13} />
            Founding-client rates: first 5 clients only
          </p>
        </Reveal>

        {/* Care plans — the recurring core */}
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {carePlans.map((plan, i) => (
            <Reveal as="div" key={plan.id} delay={i * 110} className="relative">
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full bg-lime px-3 py-1 text-[0.75rem] font-bold uppercase tracking-widest text-ink shadow-lg">
                  Most popular
                </span>
              )}
              <article
                className={`card group relative flex h-full flex-col overflow-hidden p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-lime/40 hover:shadow-[0_28px_70px_-38px_rgba(203,255,60,0.5)] ${
                  plan.highlight ? "border-lime/35 shadow-[0_0_50px_-24px_rgba(203,255,60,0.45)]" : ""
                }`}
              >
              <CardSpotlight />
              <h3 className="relative z-10 font-display text-xl uppercase tracking-wide text-white">{plan.name}</h3>
              <p className="relative z-10 mt-1 text-sm text-white/50">{plan.tagline}</p>
              <p className="relative z-10 mt-5">
                <span className="inline-block font-display text-5xl text-white transition-transform duration-300 group-hover:scale-105">{money(plan.price)}</span>
                <span className="text-sm text-white/45">/mo</span>
              </p>
              <ul className="relative z-10 mt-6 flex-1 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-white/75">
                    <Check width={15} height={15} className="mt-0.5 shrink-0 text-lime" />
                    {f}
                  </li>
                ))}
              </ul>
              {plan.stripeUrl ? (
                <>
                  <a
                    href={plan.stripeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${plan.highlight ? "btn-primary" : "btn-ghost"} mt-7 w-full !rounded-md`}
                  >
                    Subscribe now
                    <ArrowRight width={16} height={16} />
                  </a>
                  <a
                    href="#audit"
                    className="mt-3 block text-center text-xs text-white/50 underline-offset-4 hover:text-lime hover:underline"
                  >
                    or start with a free audit
                  </a>
                </>
              ) : (
                <a
                  href="#audit"
                  className={`${plan.highlight ? "btn-primary" : "btn-ghost"} mt-7 w-full !rounded-md`}
                >
                  Start with a free audit
                  <ArrowRight width={16} height={16} />
                </a>
              )}
              </article>
            </Reveal>
          ))}
        </div>

        {/* Beyond websites — capabilities, not a price menu */}
        <Reveal className="mt-12 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/40">Beyond websites</p>
          <h3 className="mt-2 font-display text-2xl uppercase text-white/90 sm:text-3xl">
            I build the whole stack
          </h3>
        </Reveal>

        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {capabilities.map((c, i) => (
            <Reveal
              as="div"
              key={c.title}
              delay={i * 90}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.015] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-lime/25 hover:bg-white/[0.03]"
            >
              <CardSpotlight />
              <h4 className="relative z-10 font-display text-lg uppercase tracking-wide text-white transition-colors duration-300 group-hover:text-lime">{c.title}</h4>
              <p className="relative z-10 mt-2 flex-1 text-sm leading-relaxed text-white/55">{c.blurb}</p>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-8 text-center">
          <a href="#audit" className="btn-primary !rounded-md">
            Start with a free audit
            <ArrowRight width={16} height={16} />
          </a>
        </Reveal>
      </div>
    </section>
  );
}
