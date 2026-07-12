import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Phone, ArrowRight, Check, Star, Calendar, Shield, TrendUp } from "@/components/icons";

/**
 * DEMO / concept site — "Apex Fence Co." A polished, homeowner-facing fence
 * contractor site: the flagship niche proof piece on Stackwrk, and the template
 * personalized (real photos + name) for each prospect in cold outreach.
 * Bright, trust-first, conversion-focused — this is the PRODUCT Stackwrk sells,
 * not Stackwrk's own (dark) brand. Self-contained light styling. Noindex.
 */

export const metadata: Metadata = {
  title: "Apex Fence Co. — South Florida Fence Installation (Demo)",
  robots: { index: false, follow: false },
};

const NAVY = "#0C2333";
const GREEN = "#18894C";
const GREEN_BRIGHT = "#1FA85E";

/* A stylized modern horizontal-slat privacy fence, built from layered boards
   so it reads as a real material rather than a flat pattern. */
function FenceBoards({ tone = "wood" }: { tone?: "wood" | "vinyl" | "aluminum" }) {
  const palettes = {
    wood: ["#b07d45", "#9a6a38", "#a5743f", "#8f6132", "#ac7a43", "#946835"],
    vinyl: ["#f4f4f1", "#e9e9e4", "#efefea", "#e3e3dd", "#f1f1ec", "#e7e7e1"],
    aluminum: ["#3a4650", "#313c45", "#37434c", "#2c363e", "#39454e", "#2f3a42"],
  } as const;
  const p = palettes[tone];
  return (
    <div className="absolute inset-0 flex flex-col gap-[3px]">
      {p.map((c, i) => (
        <div
          key={i}
          className="flex-1"
          style={{
            background: `linear-gradient(180deg, ${c} 0%, rgba(0,0,0,0.18) 100%), ${c}`,
            boxShadow: "inset 0 2px 0 rgba(255,255,255,0.12), inset 0 -3px 6px rgba(0,0,0,0.22)",
            backgroundImage:
              "repeating-linear-gradient(90deg, rgba(0,0,0,0.05) 0 2px, transparent 2px 9px)",
          }}
        />
      ))}
    </div>
  );
}

function Step({ icon: Icon, n, t, d }: { icon: (p: { width?: number; height?: number }) => ReactNode; n: number; t: string; d: string }) {
  return (
    <div className="flex gap-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white" style={{ background: NAVY }}>
        <Icon width={20} height={20} />
      </span>
      <div>
        <p className="font-bold" style={{ color: NAVY }}>{n}. {t}</p>
        <p className="text-sm text-slate-600">{d}</p>
      </div>
    </div>
  );
}

const services = [
  { t: "Wood Fences", d: "Cedar, pine & custom privacy fencing — warm, classic, built to last.", tone: "wood" as const },
  { t: "Vinyl Fences", d: "Low-maintenance, storm-rated vinyl in white, tan & more.", tone: "vinyl" as const },
  { t: "Aluminum & Metal", d: "Sleek, rust-proof ornamental fencing for pools & yards.", tone: "aluminum" as const },
  { t: "Pool Safety Fences", d: "Code-compliant barriers that keep families safe.", tone: "aluminum" as const },
  { t: "Gates & Access", d: "Automatic driveway gates, keypads & pedestrian gates.", tone: "wood" as const },
  { t: "Chain-Link", d: "Durable, affordable perimeter and commercial fencing.", tone: "aluminum" as const },
];

const reviews = [
  { q: "Apex replaced our whole backyard fence in two days. Cleanest crew we've had — the vinyl looks incredible.", n: "Maria S.", c: "Coral Springs" },
  { q: "Got three quotes; Apex was the only one that showed up on time and put it in writing. No surprises.", n: "James T.", c: "Fort Lauderdale" },
  { q: "Our pool passed inspection first try thanks to their safety fence. Highly recommend.", n: "Dana R.", c: "Pembroke Pines" },
];

const cities = ["Fort Lauderdale", "Pompano Beach", "Coral Springs", "Plantation", "Pembroke Pines", "Davie", "Hollywood", "Miramar", "Weston", "Sunrise"];

export default function ApexFenceDemo() {
  return (
    <main className="bg-[#FAFAF7] text-[#0C2333]" style={{ fontFeatureSettings: '"ss01"' }}>
      {/* NAV */}
      <header className="sticky top-0 z-50 border-b border-black/5 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 sm:px-8">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md text-white" style={{ background: GREEN }}><Shield width={17} height={17} /></span>
            <span className="text-lg font-extrabold tracking-tight" style={{ color: NAVY }}>APEX<span style={{ color: GREEN }}>FENCE</span></span>
          </div>
          <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-600 md:flex">
            <a href="#services" className="hover:text-slate-900">Services</a>
            <a href="#work" className="hover:text-slate-900">Our Work</a>
            <a href="#reviews" className="hover:text-slate-900">Reviews</a>
            <a href="#areas" className="hover:text-slate-900">Service Area</a>
          </nav>
          <div className="flex items-center gap-3">
            <a href="tel:9545550140" className="hidden items-center gap-1.5 text-sm font-bold sm:flex" style={{ color: NAVY }}>
              <Phone width={15} height={15} /> (954) 555-0140
            </a>
            <a href="#quote" className="rounded-lg px-4 py-2 text-sm font-bold text-white shadow-sm" style={{ background: GREEN }}>Free Quote</a>
          </div>
        </div>
      </header>

      {/* HERO — real photo: sunset over a fenced estate (CC-BY, credit in footer) */}
      <section className="relative min-h-[560px] overflow-hidden lg:min-h-[640px]">
        {/* eslint-disable-next-line @next/next/no-img-element -- demo asset */}
        <img
          src="/demo/fence/hero.webp"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: "center 62%" }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(8,20,30,0.82) 0%, rgba(8,20,30,0.55) 48%, rgba(8,20,30,0.28) 100%)" }} />
        <div className="absolute inset-x-0 bottom-0 h-24" style={{ background: "linear-gradient(180deg, rgba(8,20,30,0) 0%, rgba(8,20,30,0.35) 100%)" }} />

        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-16 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:pb-20 lg:pt-20">
          <div className="text-white">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
              <span className="text-amber-300">★★★★★</span>
              <span className="text-white/90">4.9 · 214 Google reviews</span>
            </div>
            <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight drop-shadow sm:text-5xl lg:text-[3.4rem]">
              South Florida&rsquo;s trusted fence builders.
            </h1>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-white/85">
              Wood, vinyl &amp; aluminum fences installed fast and built to last — backed by a 5-year workmanship warranty.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <a href="#quote" className="inline-flex items-center justify-center gap-2 rounded-lg px-7 py-4 text-base font-bold text-white shadow-lg transition-transform hover:-translate-y-0.5" style={{ background: GREEN_BRIGHT, boxShadow: `0 14px 30px -10px ${GREEN_BRIGHT}` }}>
                Get a Free Quote <ArrowRight width={18} height={18} />
              </a>
              <a href="tel:9545550140" className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/40 bg-white/10 px-7 py-4 text-base font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/20">
                <Phone width={17} height={17} /> (954) 555-0140
              </a>
            </div>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-white/85">
              <span className="flex items-center gap-1.5"><Check width={16} height={16} className="text-emerald-300" /> Licensed &amp; Insured</span>
              <span className="flex items-center gap-1.5"><Check width={16} height={16} className="text-emerald-300" /> Free on-site estimates</span>
              <span className="flex items-center gap-1.5"><Check width={16} height={16} className="text-emerald-300" /> Financing available</span>
            </div>
          </div>

          {/* glass quote widget */}
          <div className="rounded-2xl border border-white/25 bg-white/95 p-6 shadow-2xl backdrop-blur">
            <p className="text-lg font-extrabold" style={{ color: NAVY }}>Get your free quote</p>
            <p className="mt-0.5 text-sm text-slate-500">Most quotes back same day.</p>
            <div className="mt-4 space-y-2.5">
              <input placeholder="Full name" className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500" />
              <input placeholder="Phone number" className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500" />
              <select className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-600 outline-none focus:border-emerald-500">
                <option>Fence type…</option><option>Wood</option><option>Vinyl</option><option>Aluminum</option><option>Pool safety</option><option>Gate</option>
              </select>
              <button className="w-full rounded-lg py-3 text-sm font-bold text-white" style={{ background: GREEN }}>Get My Free Quote →</button>
            </div>
            <p className="mt-2 text-center text-[0.7rem] text-slate-400">No spam. We&rsquo;ll text you a quote, not a sales pitch.</p>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="border-y border-black/5 bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-5 py-6 text-center sm:grid-cols-4 sm:px-8">
          {[["25+ yrs", "in business"], ["3,000+", "fences installed"], ["5-year", "workmanship warranty"], ["4.9★", "214 Google reviews"]].map(([a, b]) => (
            <div key={b}>
              <p className="text-2xl font-extrabold" style={{ color: GREEN }}>{a}</p>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{b}</p>
            </div>
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
              <div className="relative h-32"><FenceBoards tone={s.tone} /><div className="absolute inset-0 bg-black/10" /></div>
              <div className="p-5">
                <h3 className="text-lg font-bold" style={{ color: NAVY }}>{s.t}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{s.d}</p>
                <a href="#quote" className="mt-3 inline-flex items-center gap-1 text-sm font-bold" style={{ color: GREEN }}>Get a quote <ArrowRight width={14} height={14} /></a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WHY US */}
      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 sm:px-8 lg:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: GREEN }}>Why Apex</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl" style={{ color: NAVY }}>The fence company neighbors recommend.</h2>
            <div className="mt-6 space-y-4">
              {[
                ["Written, upfront pricing", "No surprises — you get a clear quote in writing before we start."],
                ["Clean, on-time crews", "Uniformed installers who respect your yard and finish when we say."],
                ["Permits & code handled", "We pull permits and pass inspection so you don't have to think about it."],
                ["5-year workmanship warranty", "If anything shifts or fails, we come back and make it right."],
              ].map(([t, d]) => (
                <div key={t} className="flex gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white" style={{ background: GREEN }}><Check width={14} height={14} /></span>
                  <div><p className="font-bold" style={{ color: NAVY }}>{t}</p><p className="text-sm text-slate-600">{d}</p></div>
                </div>
              ))}
            </div>
          </div>
          {/* process card */}
          <div className="rounded-3xl border border-black/[0.07] p-7 shadow-sm" style={{ background: "linear-gradient(160deg,#f2f7f3,#ffffff)" }}>
            <p className="text-sm font-bold uppercase tracking-wide text-slate-500">How it works</p>
            <div className="mt-5 space-y-5">
              <Step icon={Calendar} n={1} t="Free on-site estimate" d="We measure, talk options, and hand you a written quote." />
              <Step icon={Shield} n={2} t="We build it" d="Permits pulled, materials delivered, installed in days — not weeks." />
              <Step icon={TrendUp} n={3} t="Enjoy — and it's warrantied" d="Backed for 5 years. Refer a neighbor, get $100." />
            </div>
          </div>
        </div>
      </section>

      {/* WORK GALLERY */}
      <section id="work" className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: GREEN }}>Recent work</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl" style={{ color: NAVY }}>Fences we&rsquo;re proud of.</h2>
          <p className="mt-2 text-sm text-slate-500">Demo photos — on your site, these are your real projects.</p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[["Cedar fence & custom gate", "Fort Lauderdale", "g-gate"], ["Sideyard cedar privacy", "Plantation", "g-cedar"], ["White vinyl privacy", "Weston", "g-vinyl"], ["Modern composite screen", "Davie", "g-comp"], ["Estate ranch rail", "Southwest Ranches", "g-ranch"], ["Ranch rail on the water", "Parkland", "g-rail"]].map(([t, c, img]) => (
            <div key={t} className="group relative overflow-hidden rounded-2xl border border-black/[0.07] shadow-sm">
              <div className="relative h-52 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element -- demo asset */}
                <img src={`/demo/fence/${img}.webp`} alt={t} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                <p className="text-sm font-bold">{t}</p>
                <p className="text-xs text-white/75">{c}</p>
              </div>
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
            {reviews.map((r) => (
              <figure key={r.n} className="rounded-2xl border border-black/[0.07] bg-[#FAFAF7] p-6">
                <div className="flex gap-0.5 text-amber-400">{[0, 1, 2, 3, 4].map((i) => <Star key={i} width={16} height={16} />)}</div>
                <blockquote className="mt-3 text-sm leading-relaxed text-slate-700">&ldquo;{r.q}&rdquo;</blockquote>
                <figcaption className="mt-4 text-sm font-bold" style={{ color: NAVY }}>{r.n} <span className="font-medium text-slate-400">· {r.c}</span></figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* FINANCING BANNER */}
      <section className="px-5 py-6 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 rounded-2xl px-7 py-6 text-white sm:flex-row" style={{ background: `linear-gradient(100deg,${NAVY},#123a52)` }}>
          <p className="text-center text-lg font-bold sm:text-left">$0-down financing available — spread it over 12–60 months.</p>
          <a href="#quote" className="shrink-0 rounded-lg px-6 py-3 text-sm font-bold text-white" style={{ background: GREEN_BRIGHT }}>Check my rate</a>
        </div>
      </section>

      {/* SERVICE AREA */}
      <section id="areas" className="mx-auto max-w-6xl px-5 py-14 text-center sm:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: GREEN }}>Service area</p>
        <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl" style={{ color: NAVY }}>Proudly serving South Florida</h2>
        <div className="mx-auto mt-6 flex max-w-3xl flex-wrap justify-center gap-2">
          {cities.map((c) => <span key={c} className="rounded-full border border-black/10 bg-white px-4 py-1.5 text-sm font-medium text-slate-600">{c}</span>)}
        </div>
      </section>

      {/* QUOTE CTA */}
      <section id="quote" className="px-5 pb-16 sm:px-8">
        <div className="mx-auto max-w-3xl rounded-3xl border border-black/[0.07] bg-white p-8 text-center shadow-lg sm:p-10">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl" style={{ color: NAVY }}>Get your free fence quote today.</h2>
          <p className="mx-auto mt-2 max-w-md text-slate-600">Tell us about your project and we&rsquo;ll get you a written quote — usually the same day.</p>
          <div className="mx-auto mt-7 grid max-w-lg gap-3 sm:grid-cols-2">
            <input placeholder="Full name" className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-500" />
            <input placeholder="Phone" className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-500" />
            <input placeholder="Email" className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-500 sm:col-span-2" />
            <button className="rounded-lg py-3.5 text-sm font-bold text-white shadow-md sm:col-span-2" style={{ background: GREEN }}>Get My Free Quote →</button>
          </div>
          <p className="mt-3 text-sm font-semibold" style={{ color: NAVY }}>Or call us now: <a href="tel:9545550140" className="underline">(954) 555-0140</a></p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-black/10 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 text-sm text-slate-500 sm:flex-row sm:justify-between sm:px-8">
          <div>
            <p className="text-base font-extrabold" style={{ color: NAVY }}>APEX<span style={{ color: GREEN }}>FENCE</span> CO.</p>
            <p className="mt-2">Licensed &amp; Insured · FL Lic. #CGC-000000</p>
            <p>Mon–Sat 7am–6pm · (954) 555-0140</p>
          </div>
          <div className="sm:text-right">
            <p className="font-semibold text-slate-700">Serving Broward &amp; Miami-Dade</p>
            <p className="mt-2 text-xs">© 2026 Apex Fence Co. · Demo site by Stackwrk</p>
            <p className="mt-1 text-[0.65rem] text-slate-400">
              Demo photos: nordique, okchomeseller, Field Outdoor Spaces, EliteBalustradeImages, Gareth1953 (Flickr, CC BY 2.0)
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
