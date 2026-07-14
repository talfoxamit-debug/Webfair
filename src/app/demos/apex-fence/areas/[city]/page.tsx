import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Phone, ArrowRight, Check } from "@/components/icons";
import { DEFAULT_CONFIG } from "@/lib/fence-config";
import { CITY_RULES, NAVY, GREEN, GREEN_BRIGHT } from "@/lib/fence-theme";

const slug = (c: string) => c.toLowerCase().replace(/[^a-z0-9]+/g, "-");
const cityBySlug = (s: string) => CITY_RULES.find((r) => slug(r.city) === s);
const tel = (p: string) => `tel:${p.replace(/[^0-9]/g, "")}`;

export function generateStaticParams() {
  return CITY_RULES.map((r) => ({ city: slug(r.city) }));
}

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const rule = cityBySlug((await params).city);
  if (!rule) return { title: "Area not found" };
  return {
    title: `Fence Company in ${rule.city}, FL | ${DEFAULT_CONFIG.business}`,
    description: `Wood, vinyl, aluminum and gate installation in ${rule.city}, ${rule.county} County. Licensed, insured, permits handled. Free same-day quotes from ${DEFAULT_CONFIG.business}.`,
    robots: { index: false, follow: false },
    openGraph: { title: `Fence Installation in ${rule.city}, FL`, type: "website" },
  };
}

export default async function CityPage({ params }: { params: Promise<{ city: string }> }) {
  const rule = cityBySlug((await params).city);
  if (!rule) notFound();
  const c = DEFAULT_CONFIG;
  const nearby = CITY_RULES.filter((r) => r.county === rule.county && r.city !== rule.city).slice(0, 6);

  const ld = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: c.business,
    telephone: c.phone,
    areaServed: `${rule.city}, FL`,
    description: `Fence installation in ${rule.city}, ${rule.county} County: wood, vinyl, aluminum and gates.`,
    aggregateRating: { "@type": "AggregateRating", ratingValue: c.rating, reviewCount: c.reviewCount },
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#0C2333]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      <div className="text-white" style={{ background: `linear-gradient(90deg, ${NAVY}, #123a52)` }}>
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-5 py-2 sm:px-8">
          <p className="text-xs font-semibold sm:text-sm"><span className="mr-2 rounded bg-white/15 px-1.5 py-0.5 text-[0.75rem] font-bold uppercase">Demo</span>Sample local page built by Stackwrk.</p>
          <Link href="/" className="shrink-0 text-xs font-bold text-emerald-300 hover:text-emerald-200 sm:text-sm">Want a page for every city you serve? →</Link>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-black/5 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3 sm:px-8">
          <Link href="/demos/apex-fence" className="text-sm font-bold" style={{ color: GREEN }}>← {c.business}</Link>
          <a href={tel(c.phone)} className="rounded-lg px-4 py-2 text-sm font-bold text-white" style={{ background: GREEN }}>{c.phone}</a>
        </div>
      </header>

      {/* hero */}
      <section className="relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={c.heroImg} alt="" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: "center 60%" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(8,20,30,0.85) 0%, rgba(8,20,30,0.5) 100%)" }} />
        <div className="relative mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-20">
          <p className="text-sm font-bold uppercase tracking-wide text-emerald-300">Serving {rule.city} · {rule.county} County</p>
          <h1 className="mt-2 max-w-2xl text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl">Fence installation in {rule.city}, Florida.</h1>
          <p className="mt-4 max-w-lg text-lg text-white/85">Wood, vinyl, aluminum and custom gates, installed fast and built for the {rule.city} climate. Licensed, insured, and we handle the permit.</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <a href="#quote" className="inline-flex items-center justify-center gap-2 rounded-lg px-7 py-4 text-base font-bold text-white shadow-lg" style={{ background: GREEN_BRIGHT }}>Get a Free Quote <ArrowRight width={18} height={18} /></a>
            <a href={tel(c.phone)} className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/40 bg-white/10 px-7 py-4 text-base font-bold text-white backdrop-blur-sm"><Phone width={17} height={17} /> {c.phone}</a>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
        <p className="text-[0.98rem] leading-relaxed text-slate-700">
          Looking for a trusted fence company in {rule.city}? {c.business} has installed thousands of
          fences across {rule.county} County. From backyard privacy fences to pool-code aluminum and
          automated driveway gates, we build to last in South Florida&rsquo;s sun, salt and storms, and
          we pull the {rule.city} permit so you don&rsquo;t have to.
        </p>

        <h2 className="mt-10 text-2xl font-extrabold" style={{ color: NAVY }}>What we install in {rule.city}</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {["Wood privacy fences", "Vinyl fences", "Aluminum & pool fences", "Chain-link", "Custom gates & automation", "Ranch & rail fencing"].map((s) => (
            <li key={s} className="flex items-center gap-2 text-slate-700"><Check width={16} height={16} className="shrink-0" style={{ color: GREEN }} /> {s}</li>
          ))}
        </ul>

        <div className="mt-10 rounded-2xl border border-black/[0.07] bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold" style={{ color: NAVY }}>{rule.city} fence permits & height</h2>
          <p className="mt-2 text-sm text-slate-600">
            Most residential fences in {rule.city} require a permit, with typical limits of {rule.back} in
            back/side yards and {rule.front} in front. Corner lots, pools and HOAs add rules. We handle
            the survey, permit and inspection on every job.
          </p>
          <Link href="/demos/apex-fence/tools#permit" className="mt-3 inline-flex text-sm font-bold" style={{ color: GREEN }}>Check {rule.city} permit rules →</Link>
        </div>

        {nearby.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-bold" style={{ color: NAVY }}>Also serving nearby</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {nearby.map((r) => (
                <Link key={r.city} href={`/demos/apex-fence/areas/${slug(r.city)}`} className="rounded-full border border-black/10 bg-white px-4 py-1.5 text-sm font-medium text-slate-600 hover:border-emerald-500">{r.city}</Link>
              ))}
            </div>
          </div>
        )}

        {/* quote CTA */}
        <section id="quote" className="mt-12 scroll-mt-20 rounded-3xl border border-black/[0.07] bg-white p-8 text-center shadow-lg">
          <h2 className="text-2xl font-extrabold" style={{ color: NAVY }}>Get your free {rule.city} fence quote</h2>
          <p className="mx-auto mt-2 max-w-md text-slate-600">Written quote, usually the same day. No pressure, no spam.</p>
          <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/demos/apex-fence#quote" className="rounded-lg px-6 py-3 text-sm font-bold text-white" style={{ background: GREEN }}>Get my free quote →</Link>
            <a href={tel(c.phone)} className="text-sm font-bold" style={{ color: NAVY }}>or call {c.phone}</a>
          </div>
        </section>
      </main>

      <footer className="border-t border-black/10 bg-white">
        <div className="mx-auto max-w-5xl px-5 py-8 text-sm text-slate-500 sm:px-8">
          <p>© 2026 {c.business} · Serving {rule.city} & {rule.county} County · Site by Stackwrk</p>
        </div>
      </footer>
    </div>
  );
}
