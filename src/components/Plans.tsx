import Reveal from "./Reveal";
import { ArrowRight, Bolt, Check } from "./icons";
import { priceItems, carePlans, money } from "@/lib/pricing";

/**
 * Public pricing. Applies the PRICING-BENCHMARKS.md research directly:
 * - Care tiers sit exactly on the market's tier boundaries ($99/$249/$499).
 * - Founding-client framing: the benchmark-informed standard rate is shown
 *   struck through as the anchor; the founding rate is the live price.
 * - CRM leads the services grid ("custom at off-the-shelf prices" wedge).
 */

const serviceOrder = [
  "custom-crm",
  "ai-assistant",
  "automation-sprint",
  "automation-program",
  "growth-retainer",
  "fractional-cto",
];

function priceLine(id: string) {
  const item = priceItems.find((p) => p.id === id)!;
  const oneTime = item.founding > 0;
  const monthly = item.monthlyFounding && item.monthlyFounding > 0;
  return {
    item,
    now: oneTime ? money(item.founding) : money(item.monthlyFounding!),
    anchor:
      oneTime && item.standard > item.founding
        ? money(item.standard)
        : !oneTime && item.monthlyStandard! > item.monthlyFounding!
          ? money(item.monthlyStandard!)
          : null,
    suffix: oneTime ? (monthly ? ` + ${money(item.monthlyFounding!)}/mo` : "") : "/mo",
  };
}

export default function Plans() {
  return (
    <section id="plans" className="relative overflow-hidden border-t border-white/[0.06] py-16 sm:py-24">
      <div className="pointer-events-none absolute inset-0 grid-backdrop opacity-15" />
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
            Founding-client rates — first 5 clients only
          </p>
        </Reveal>

        {/* Care plans — the recurring core */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {carePlans.map((plan, i) => (
            <Reveal
              as="article"
              key={plan.id}
              delay={i * 110}
              className={`card relative flex flex-col p-7 ${
                plan.highlight ? "border-lime/50 shadow-glow-lime" : ""
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-lime px-3 py-1 text-[0.6rem] font-bold uppercase tracking-widest text-ink">
                  Most popular
                </span>
              )}
              <h3 className="font-display text-xl uppercase tracking-wide text-white">{plan.name}</h3>
              <p className="mt-1 text-sm text-white/50">{plan.tagline}</p>
              <p className="mt-5">
                <span className="font-display text-5xl text-white">{money(plan.price)}</span>
                <span className="text-sm text-white/45">/mo</span>
              </p>
              <ul className="mt-6 flex-1 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-white/75">
                    <Check width={15} height={15} className="mt-0.5 shrink-0 text-lime" />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="#about"
                className={`${plan.highlight ? "btn-primary" : "btn-ghost"} mt-7 w-full !rounded-md`}
              >
                Start with a free audit
                <ArrowRight width={16} height={16} />
              </a>
            </Reveal>
          ))}
        </div>

        {/* Beyond websites — apps, automations, AI, CRM */}
        <Reveal className="mt-16 text-center">
          <h3 className="font-display text-2xl uppercase text-white sm:text-3xl">
            Beyond websites
          </h3>
          <p className="mx-auto mt-2 max-w-xl text-sm text-white/55">
            The same systems I run my own companies on — priced for businesses, not enterprises.
          </p>
        </Reveal>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {serviceOrder.map((id, i) => {
            const { item, now, anchor, suffix } = priceLine(id);
            return (
              <Reveal
                as="div"
                key={id}
                delay={i * 80}
                className="card flex flex-col p-6 transition-colors hover:border-lime/40"
              >
                <h4 className="font-display text-lg uppercase tracking-wide text-white">{item.label}</h4>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-white/55">{item.blurb}</p>
                <p className="mt-4 text-sm text-white/45">
                  {anchor && (
                    <span className="mr-2 text-white/30 line-through">{anchor}</span>
                  )}
                  <span className="font-display text-2xl text-lime">
                    {item.from ? "from " : ""}
                    {now}
                  </span>
                  <span className="text-white/45">{suffix}</span>
                </p>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
