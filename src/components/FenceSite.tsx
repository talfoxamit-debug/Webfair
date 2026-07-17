import type { ReactNode } from "react";
import Link from "next/link";
import { Phone, ArrowRight, Check, Star, Calendar, Shield, TrendUp } from "@/components/icons";
import { resolveConfig, type FenceConfig } from "@/lib/fence-config";
import FenceEstimator from "@/components/FenceEstimator";
import FenceTicker from "@/components/FenceTicker";
import { GUIDES } from "@/lib/fence-guides";
import { CITY_RULES } from "@/lib/fence-theme";

const citySlug = (c: string) => c.toLowerCase().replace(/[^a-z0-9]+/g, "-");
const CITY_PAGES = new Set(CITY_RULES.map((r) => citySlug(r.city)));

const NAVY = "#0C2333";
const GREEN = "#18894C";
const GREEN_BRIGHT = "#1FA85E";

function Step({ icon: Icon, n, t, d }: { icon: (p: { width?: number; height?: number }) => ReactNode; n: number; t: string; d: string }) {
  return (
    <div className="flex gap-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white" style={{ background: NAVY }}><Icon width={20} height={20} /></span>
      <div><p className="font-bold" style={{ color: NAVY }}>{n}. {t}</p><p className="text-sm text-slate-600">{d}</p></div>
    </div>
  );
}

/** Two-tone wordmark: the "fence/fencing" word (or last word) picks up the green. */
function Wordmark({ business }: { business: string }) {
  const words = business.toUpperCase().replace(/\bCO\.?\b/, "").trim().split(/\s+/);
  return (
    <span className="text-lg font-extrabold tracking-tight" style={{ color: NAVY }}>
      {words.map((w, i) => (
        <span key={i} style={{ color: /FENC/.test(w) ? GREEN : NAVY }}>{w}{i < words.length - 1 ? " " : ""}</span>
      ))}
    </span>
  );
}

const tel = (p: string) => `tel:${p.replace(/[^0-9]/g, "")}`;

/** Services showcase: each card maps to one of our real project photos, so the
 *  labels and imagery always match (no stock-photo mismatch). */
const services = [
  { t: "Wood Privacy Fences", d: "Cedar & pine privacy fencing, warm, classic, built for South-Florida yards.", img: "/demo/fence/g-cedar.webp" },
  { t: "Vinyl Fences", d: "Low-maintenance, storm-rated vinyl in white, tan & more. Zero upkeep.", img: "/demo/fence/g-vinyl.webp" },
  { t: "Custom Gates & Access", d: "Matching walk gates, double drive gates, keypads & automation.", img: "/demo/fence/g-gate.webp" },
  { t: "Modern Composite Screens", d: "Sleek horizontal-slat privacy screens for a contemporary look.", img: "/demo/fence/g-comp.webp" },
  { t: "Ranch & Rail Fencing", d: "Classic 3- and 4-rail fencing for estates, acreage & paddocks.", img: "/demo/fence/g-ranch.webp" },
  { t: "Waterfront & Estate", d: "Elegant rail and aluminum lines that hold up to salt air and sun.", img: "/demo/fence/g-rail.webp" },
];

const faqs = [
  { q: "Do I need a permit for a fence in South Florida?", a: "Almost always, yes. Most Broward and Miami-Dade cities require a permit, and we pull it for you (plus the survey and inspection) so your install passes the first time." },
  { q: "How long does installation take?", a: "Most residential fences are installed in 1 to 3 days once materials arrive and the permit clears. We give you a firm timeline in writing before we start." },
  { q: "What does a new fence cost?", a: "Most projects land between $3,000 and $12,000 depending on material, height and length. Use our instant estimator above for a ballpark, then we confirm it free on-site." },
  { q: "Do you offer financing?", a: "Yes, $0-down plans spread over 12 to 60 months, so you can start now and pay monthly. Ask us to check your rate; it won't affect your credit." },
  { q: "Is your work warrantied?", a: "Every install is backed by a 5-year workmanship warranty on top of the manufacturer's material warranty. If anything shifts or fails, we make it right." },
  { q: "What about my HOA?", a: "We build to HOA-approved materials, colors and heights, and can provide the spec sheets your architectural committee needs for approval." },
];

export default function FenceSite({ config, demo = false }: { config?: Partial<FenceConfig>; demo?: boolean }) {
  const c = resolveConfig(config);

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <div className="bg-[#FAFAF7] text-[#0C2333]" style={{ fontFeatureSettings: '"ss01"' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      {/* DEMO BANNER: only on the showcase, never on a prospect's mockup */}
      {demo && (
        <div className="text-white" style={{ background: `linear-gradient(90deg, ${NAVY}, #123a52)` }}>
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-1.5 px-5 py-2 text-center sm:flex-row sm:px-8 sm:text-left">
            <p className="text-xs font-semibold sm:text-sm">
              <span className="mr-2 rounded bg-white/15 px-1.5 py-0.5 text-[0.75rem] font-bold uppercase tracking-wide">Demo</span>
              This is a sample fencing website built by Stackwrk, not a real company.
            </p>
            <Link href="/" className="shrink-0 text-xs font-bold text-emerald-300 hover:text-emerald-200 sm:text-sm">Want one like this for your business? →</Link>
          </div>
        </div>
      )}

      {/* NAV */}
      <header className="sticky top-0 z-50 border-b border-black/5 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 sm:px-8">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md text-white" style={{ background: GREEN }}><Shield width={17} height={17} /></span>
            <Wordmark business={c.business} />
          </div>
          <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-600 md:flex">
            <a href="#services" className="hover:text-slate-900">Services</a>
            <a href="#estimate" className="hover:text-slate-900">Estimator</a>
            {demo && <Link href="/demos/apex-fence/tools" className="hover:text-slate-900">Free Tools</Link>}
            <a href="#work" className="hover:text-slate-900">Our Work</a>
            {demo && <Link href="/demos/apex-fence/guides" className="hover:text-slate-900">Guides</Link>}
            <a href="#reviews" className="hover:text-slate-900">Reviews</a>
          </nav>
          <div className="flex items-center gap-3">
            <a href={tel(c.phone)} className="hidden items-center gap-1.5 text-sm font-bold sm:flex" style={{ color: NAVY }}><Phone width={15} height={15} /> {c.phone}</a>
            <a href="#quote" className="rounded-lg px-4 py-2 text-sm font-bold text-white shadow-sm" style={{ background: GREEN }}>Free Quote</a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative min-h-[560px] overflow-hidden lg:min-h-[640px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={c.heroImg} alt="" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: "center 62%" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(8,20,30,0.82) 0%, rgba(8,20,30,0.55) 48%, rgba(8,20,30,0.28) 100%)" }} />
        <div className="absolute inset-x-0 bottom-0 h-24" style={{ background: "linear-gradient(180deg, rgba(8,20,30,0) 0%, rgba(8,20,30,0.35) 100%)" }} />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-16 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:pb-20 lg:pt-20">
          <div className="text-white">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
              <span className="text-amber-300">★★★★★</span>
              <span className="text-white/90">{c.rating} · {c.reviewCount} Google reviews</span>
            </div>
            <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight drop-shadow sm:text-5xl lg:text-[3.4rem]">{c.tagline}</h1>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-white/85">Wood, vinyl &amp; aluminum fences installed fast and built to last, backed by a 5-year workmanship warranty.</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <a href="#quote" className="inline-flex items-center justify-center gap-2 rounded-lg px-7 py-4 text-base font-bold text-white shadow-lg transition-transform hover:-translate-y-0.5" style={{ background: GREEN_BRIGHT, boxShadow: `0 14px 30px -10px ${GREEN_BRIGHT}` }}>Get a Free Quote <ArrowRight width={18} height={18} /></a>
              <a href={tel(c.phone)} className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/40 bg-white/10 px-7 py-4 text-base font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/20"><Phone width={17} height={17} /> {c.phone}</a>
            </div>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-white/85">
              <span className="flex items-center gap-1.5"><Check width={16} height={16} className="text-emerald-300" /> Licensed &amp; Insured</span>
              <span className="flex items-center gap-1.5"><Check width={16} height={16} className="text-emerald-300" /> Free on-site estimates</span>
              <span className="flex items-center gap-1.5"><Check width={16} height={16} className="text-emerald-300" /> Financing available</span>
            </div>
          </div>
          <div className="rounded-2xl border border-white/25 bg-white/95 p-6 shadow-2xl backdrop-blur">
            <p className="text-lg font-extrabold" style={{ color: NAVY }}>Get your free quote</p>
            <p className="mt-0.5 text-sm text-slate-500">Most quotes back same day.</p>
            <div className="mt-4 space-y-2.5">
              <input placeholder="Full name" className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500" />
              <input placeholder="Phone number" className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500" />
              <select className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-600 outline-none focus:border-emerald-500"><option>Fence type…</option><option>Wood</option><option>Vinyl</option><option>Aluminum</option><option>Pool safety</option><option>Gate</option></select>
              <button className="w-full rounded-lg py-3 text-sm font-bold text-white" style={{ background: GREEN }}>Get My Free Quote →</button>
            </div>
            <p className="mt-2 text-center text-[0.75rem] text-slate-400">No spam. We&rsquo;ll text you a quote, not a sales pitch.</p>
          </div>
        </div>
      </section>

      {/* LIVE ACTIVITY TICKER */}
      <FenceTicker green={GREEN} />

      {/* TRUST STRIP */}
      <section className="border-y border-black/5 bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-5 py-6 text-center sm:grid-cols-4 sm:px-8">
          {[[c.years, "in business"], [c.jobs, "fences installed"], ["5-year", "workmanship warranty"], [`${c.rating}★`, `${c.reviewCount} Google reviews`]].map(([a, b]) => (
            <div key={b}><p className="text-2xl font-extrabold" style={{ color: GREEN }}>{a}</p><p className="text-xs font-medium uppercase tracking-wide text-slate-500">{b}</p></div>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: GREEN }}>What we build</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl" style={{ color: NAVY }}>Every fence, done right.</h2>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <div key={s.t} className="group overflow-hidden rounded-2xl border border-black/[0.07] bg-white shadow-sm transition-shadow hover:shadow-lg">
              <div className="relative h-40 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.img} alt={s.t} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(12,35,51,0) 45%, rgba(12,35,51,0.72) 100%)" }} />
                <h3 className="absolute inset-x-0 bottom-0 p-4 text-lg font-bold text-white">{s.t}</h3>
              </div>
              <div className="p-5"><p className="text-sm leading-relaxed text-slate-600">{s.d}</p><a href="#quote" className="mt-3 inline-flex items-center gap-1 text-sm font-bold" style={{ color: GREEN }}>Get a quote <ArrowRight width={14} height={14} /></a></div>
            </div>
          ))}
        </div>
      </section>

      {/* ESTIMATOR */}
      <section id="estimate" className="bg-white">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
          <div className="mx-auto max-w-xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: GREEN }}>Instant estimate</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl" style={{ color: NAVY }}>What will my fence cost?</h2>
            <p className="mt-3 text-slate-600">Move the sliders for a real ballpark in seconds. No email required.</p>
          </div>
          <div className="mt-10"><FenceEstimator phone={c.phone} /></div>
          {demo && (
            <p className="mt-6 text-center text-sm">
              <Link href="/demos/apex-fence/tools" className="font-bold" style={{ color: GREEN }}>
                Explore all 7 free fence tools: comparison, permits, financing &amp; more →
              </Link>
            </p>
          )}
        </div>
      </section>

      {/* WHY US */}
      <section className="bg-[#FAFAF7]">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 sm:px-8 lg:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: GREEN }}>Why us</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl" style={{ color: NAVY }}>The fence company neighbors recommend.</h2>
            <div className="mt-6 space-y-4">
              {[["Written, upfront pricing", "No surprises. You get a clear quote in writing before we start."], ["Clean, on-time crews", "Uniformed installers who respect your yard and finish when we say."], ["Permits & code handled", "We pull permits and pass inspection so you don't have to think about it."], ["5-year workmanship warranty", "If anything shifts or fails, we come back and make it right."]].map(([t, d]) => (
                <div key={t} className="flex gap-3"><span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white" style={{ background: GREEN }}><Check width={14} height={14} /></span><div><p className="font-bold" style={{ color: NAVY }}>{t}</p><p className="text-sm text-slate-600">{d}</p></div></div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-black/[0.07] p-7 shadow-sm" style={{ background: "linear-gradient(160deg,#f2f7f3,#ffffff)" }}>
            <p className="text-sm font-bold uppercase tracking-wide text-slate-500">How it works</p>
            <div className="mt-5 space-y-5">
              <Step icon={Calendar} n={1} t="Free on-site estimate" d="We measure, talk options, and hand you a written quote." />
              <Step icon={Shield} n={2} t="We build it" d="Permits pulled, materials delivered, installed in days, not weeks." />
              <Step icon={TrendUp} n={3} t="Enjoy, and it's warrantied" d="Backed for 5 years. Refer a neighbor, get $100." />
            </div>
          </div>
        </div>
      </section>

      {/* CREW / TRUCKS */}
      <section className="mx-auto max-w-6xl px-5 pb-4 pt-2 sm:px-8">
        <div className="grid items-center gap-8 overflow-hidden rounded-3xl border border-black/[0.07] bg-white shadow-sm lg:grid-cols-2">
          <div className="relative h-64 lg:h-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/demo/fence/g-gate.webp" alt="Our crew on the job" loading="lazy" decoding="async" className="h-full w-full object-cover" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(12,35,51,0.15), rgba(12,35,51,0.55))" }} />
            <span className="absolute bottom-4 left-4 rounded-full bg-black/45 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">On the job in {c.region}</span>
          </div>
          <div className="p-7 sm:p-9">
            <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: GREEN }}>The crew</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight" style={{ color: NAVY }}>Owner-run, from quote to cleanup.</h2>
            <p className="mt-3 text-slate-600">The same local crew handles your job start to finish, no subcontractors, no surprises. Uniformed, background-checked, and we haul off every scrap before we leave.</p>
            <div className="mt-5 flex items-center gap-4">
              <div className="flex -space-x-3">
                {["from-emerald-500 to-teal-600", "from-sky-500 to-indigo-600", "from-amber-500 to-orange-600", "from-rose-500 to-pink-600"].map((g, i) => (
                  <span key={i} className={`h-11 w-11 rounded-full border-2 border-white bg-gradient-to-br ${g} shadow-sm`} />
                ))}
              </div>
              <p className="text-sm font-semibold" style={{ color: NAVY }}>{c.jobs} fences installed · {c.rating}★ across {c.reviewCount} reviews</p>
            </div>
          </div>
        </div>
      </section>

      {/* WORK GALLERY */}
      <section id="work" className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: GREEN }}>Recent work</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl" style={{ color: NAVY }}>Fences we&rsquo;re proud of.</h2>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {c.gallery.map((g) => (
            <div key={g.title} className="group relative overflow-hidden rounded-2xl border border-black/[0.07] shadow-sm">
              <div className="relative h-52 overflow-hidden bg-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={g.img} alt={g.title} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-4 text-white"><p className="text-sm font-bold">{g.title}</p><p className="text-xs text-white/75">{g.city}</p></div>
            </div>
          ))}
        </div>
      </section>

      {/* REVIEWS */}
      <section id="reviews" className="bg-white">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
          <div className="mx-auto max-w-xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: GREEN }}>Reviews</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl" style={{ color: NAVY }}>Neighbors love their new fences.</h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {c.reviews.map((r) => (
              <figure key={r.n} className="rounded-2xl border border-black/[0.07] bg-[#FAFAF7] p-6">
                <div className="flex gap-0.5 text-amber-400">{[0, 1, 2, 3, 4].map((i) => <Star key={i} width={16} height={16} />)}</div>
                <blockquote className="mt-3 text-sm leading-relaxed text-slate-700">&ldquo;{r.q}&rdquo;</blockquote>
                <figcaption className="mt-4 text-sm font-bold" style={{ color: NAVY }}>{r.n} <span className="font-medium text-slate-400">· {r.c}</span></figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* RESOURCES / BLOG: demo only */}
      {demo && (
        <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: GREEN }}>Resources</p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl" style={{ color: NAVY }}>Planning a fence? Start here.</h2>
            </div>
            <Link href="/demos/apex-fence/guides" className="hidden text-sm font-bold sm:inline" style={{ color: GREEN }}>All guides →</Link>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {GUIDES.map((g) => (
              <Link key={g.slug} href={`/demos/apex-fence/guides/${g.slug}`} className="group flex flex-col rounded-2xl border border-black/[0.07] bg-white p-6 shadow-sm transition-shadow hover:shadow-lg">
                <span className="inline-flex w-fit rounded-full bg-[#EAF6EF] px-3 py-1 text-xs font-bold" style={{ color: GREEN }}>{g.tag}</span>
                <h3 className="mt-3 text-base font-bold leading-snug" style={{ color: NAVY }}>{g.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{g.excerpt}</p>
                <span className="mt-4 text-sm font-bold" style={{ color: GREEN }}>Read the guide →</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      <section id="faq" className="bg-white">
        <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: GREEN }}>FAQ</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl" style={{ color: NAVY }}>Questions, answered.</h2>
          </div>
          <div className="mt-8 divide-y divide-black/[0.07] rounded-2xl border border-black/[0.07]">
            {faqs.map((f) => (
              <details key={f.q} className="group px-5 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold" style={{ color: NAVY }}>
                  {f.q}
                  <span className="shrink-0 text-xl leading-none transition-transform group-open:rotate-45" style={{ color: GREEN }}>+</span>
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* FINANCING */}
      <section className="px-5 py-6 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 rounded-2xl px-7 py-6 text-white sm:flex-row" style={{ background: `linear-gradient(100deg,${NAVY},#123a52)` }}>
          <p className="text-center text-lg font-bold sm:text-left">$0-down financing available. Spread it over 12 to 60 months.</p>
          <a href="#quote" className="shrink-0 rounded-lg px-6 py-3 text-sm font-bold text-white" style={{ background: GREEN_BRIGHT }}>Check my rate</a>
        </div>
      </section>

      {/* SERVICE AREA */}
      <section id="areas" className="mx-auto max-w-6xl px-5 py-14 text-center sm:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: GREEN }}>Service area</p>
        <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl" style={{ color: NAVY }}>Proudly serving {c.region}</h2>
        <div className="mx-auto mt-6 flex max-w-3xl flex-wrap justify-center gap-2">
          {c.areas.map((a) => (demo && CITY_PAGES.has(citySlug(a)))
            ? <Link key={a} href={`/demos/apex-fence/areas/${citySlug(a)}`} className="rounded-full border border-black/10 bg-white px-4 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-emerald-500 hover:text-slate-900">{a}</Link>
            : <span key={a} className="rounded-full border border-black/10 bg-white px-4 py-1.5 text-sm font-medium text-slate-600">{a}</span>)}
        </div>
        {demo && <p className="mt-4 text-xs text-slate-400">Each city links to its own local page, great for ranking in every town you serve.</p>}
      </section>

      {/* QUOTE CTA */}
      <section id="quote" className="px-5 pb-16 sm:px-8">
        <div className="mx-auto max-w-3xl rounded-3xl border border-black/[0.07] bg-white p-8 text-center shadow-lg sm:p-10">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl" style={{ color: NAVY }}>Get your free fence quote today.</h2>
          <p className="mx-auto mt-2 max-w-md text-slate-600">Tell us about your project and we&rsquo;ll get you a written quote, usually the same day.</p>
          <div className="mx-auto mt-7 grid max-w-lg gap-3 sm:grid-cols-2">
            <input placeholder="Full name" className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-500" />
            <input placeholder="Phone" className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-500" />
            <input placeholder="Email" className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-500 sm:col-span-2" />
            <button className="rounded-lg py-3.5 text-sm font-bold text-white shadow-md sm:col-span-2" style={{ background: GREEN }}>Get My Free Quote →</button>
          </div>
          <p className="mt-3 text-sm font-semibold" style={{ color: NAVY }}>Or call us now: <a href={tel(c.phone)} className="underline">{c.phone}</a></p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-black/10 bg-white pb-20 sm:pb-0">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 text-sm text-slate-500 sm:flex-row sm:justify-between sm:px-8">
          <div>
            <p className="text-base font-extrabold"><Wordmark business={c.business} /></p>
            <p className="mt-2">Licensed &amp; Insured · {c.license}</p>
            <p>Mon to Sat 7am to 6pm · {c.phone}</p>
          </div>
          <div className="sm:text-right">
            <p className="font-semibold text-slate-700">Serving {c.region}</p>
            {demo && <p className="mt-1"><Link href="/demos/apex-fence/guides" className="hover:text-slate-700">Fence guides &amp; resources</Link></p>}
            <p className="mt-2 text-xs">© 2026 {c.business} · Site by Stackwrk</p>
            {c.photoCredit && <p className="mt-1 text-[0.75rem] text-slate-400">{c.photoCredit}</p>}
          </div>
        </div>
      </footer>

      {/* STICKY MOBILE CTA */}
      <div className="fixed inset-x-0 bottom-0 z-50 flex gap-2 border-t border-black/10 bg-white/95 p-3 backdrop-blur sm:hidden">
        <a href={tel(c.phone)} className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-black/10 py-2.5 text-sm font-bold" style={{ color: NAVY }}><Phone width={16} height={16} /> Call</a>
        <a href="#quote" className="flex flex-[1.4] items-center justify-center rounded-lg py-2.5 text-sm font-bold text-white" style={{ background: GREEN }}>Get My Free Quote</a>
      </div>
    </div>
  );
}
