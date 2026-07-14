import Link from "next/link";
import type { Metadata } from "next";
import { DEFAULT_CONFIG } from "@/lib/fence-config";
import { NAVY, GREEN } from "@/lib/fence-theme";
import FenceEstimator from "@/components/FenceEstimator";
import MaterialComparison from "@/components/tools/MaterialComparison";
import PermitChecker from "@/components/tools/PermitChecker";
import MaterialsCalculator from "@/components/tools/MaterialsCalculator";
import FinancingCalculator from "@/components/tools/FinancingCalculator";
import StainCalculator from "@/components/tools/StainCalculator";
import FenceQuiz from "@/components/tools/FenceQuiz";

export const metadata: Metadata = {
  title: "Free Fence Tools | Apex Fence Co.",
  description:
    "Free fence planning tools for South-Florida homeowners: instant cost estimator, material comparison, permit checker, materials & financing calculators, stain estimator and a fence-style quiz.",
  robots: { index: false, follow: false },
};

const TOOLS = [
  { id: "estimator", icon: "💵", title: "Cost Estimator", desc: "Ballpark your project price in seconds." },
  { id: "quiz", icon: "🧭", title: "Which Fence Quiz", desc: "Answer 4 questions, get your best material." },
  { id: "compare", icon: "⚖️", title: "Material Comparison", desc: "Wood vs vinyl vs aluminum vs chain-link." },
  { id: "permit", icon: "📋", title: "Permit Checker", desc: "Rules & height limits for your city." },
  { id: "materials", icon: "🧮", title: "Materials Calculator", desc: "Posts, panels, boards & concrete." },
  { id: "financing", icon: "🏦", title: "Financing Calculator", desc: "See your monthly payment." },
  { id: "stain", icon: "🎨", title: "Stain Calculator", desc: "How much sealer you'll need." },
];

function Tool({ id, title, desc, children }: { id: string; title: string; desc: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 rounded-3xl border border-black/[0.07] bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-2xl font-extrabold tracking-tight" style={{ color: NAVY }}>{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{desc}</p>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export default function FenceTools() {
  const c = DEFAULT_CONFIG;
  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#0C2333]">
      {/* demo banner */}
      <div className="text-white" style={{ background: `linear-gradient(90deg, ${NAVY}, #123a52)` }}>
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-5 py-2 sm:px-8">
          <p className="text-xs font-semibold sm:text-sm"><span className="mr-2 rounded bg-white/15 px-1.5 py-0.5 text-[0.75rem] font-bold uppercase">Demo</span>Sample tools built by Stackwrk.</p>
          <Link href="/" className="shrink-0 text-xs font-bold text-emerald-300 hover:text-emerald-200 sm:text-sm">Want these on your site? →</Link>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-black/5 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3 sm:px-8">
          <Link href="/demos/apex-fence" className="text-sm font-bold" style={{ color: GREEN }}>← {c.business}</Link>
          <Link href="#quote" className="rounded-lg px-4 py-2 text-sm font-bold text-white" style={{ background: GREEN }}>Free Quote</Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: GREEN }}>Free tools</p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl" style={{ color: NAVY }}>Plan your fence like a pro.</h1>
        <p className="mt-3 max-w-2xl text-slate-600">Seven free tools to price, compare and plan your project. No email, no sign-up. Built by {c.business} for South-Florida homeowners.</p>

        {/* tool grid */}
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((t) => (
            <a key={t.id} href={`#${t.id}`} className="group flex items-start gap-3 rounded-2xl border border-black/[0.07] bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
              <span className="text-2xl">{t.icon}</span>
              <span>
                <span className="block font-bold" style={{ color: NAVY }}>{t.title}</span>
                <span className="block text-xs text-slate-500">{t.desc}</span>
              </span>
            </a>
          ))}
        </div>

        {/* tools */}
        <div className="mt-10 space-y-6">
          <Tool id="estimator" title="💵 Instant Cost Estimator" desc="Move the sliders for a real ballpark in seconds.">
            <FenceEstimator phone={c.phone} />
          </Tool>
          <Tool id="quiz" title="🧭 Which Fence Is Right for You?" desc="Four quick questions, one clear recommendation.">
            <FenceQuiz />
          </Tool>
          <Tool id="compare" title="⚖️ Material Comparison" desc="See how the four materials stack up on what matters to you.">
            <MaterialComparison />
          </Tool>
          <Tool id="permit" title="📋 Permit Checker" desc="Typical permit and height rules for your South-Florida city.">
            <PermitChecker />
          </Tool>
          <Tool id="materials" title="🧮 Materials Calculator" desc="Estimate the posts, panels, boards and concrete for your run.">
            <MaterialsCalculator />
          </Tool>
          <Tool id="financing" title="🏦 Financing Calculator" desc="Turn the project price into an easy monthly payment.">
            <FinancingCalculator />
          </Tool>
          <Tool id="stain" title="🎨 Stain & Sealer Calculator" desc="How many gallons to protect a wood fence.">
            <StainCalculator />
          </Tool>
        </div>

        {/* quote CTA (target of every tool's in-page #quote link) */}
        <section id="quote" className="mt-10 scroll-mt-20 rounded-3xl border border-black/[0.07] bg-white p-8 text-center shadow-lg">
          <h2 className="text-3xl font-extrabold tracking-tight" style={{ color: NAVY }}>Ready for the real number?</h2>
          <p className="mx-auto mt-2 max-w-md text-slate-600">Get a free, written quote for your exact project, usually the same day.</p>
          <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/demos/apex-fence#quote" className="rounded-lg px-6 py-3 text-sm font-bold text-white" style={{ background: GREEN }}>Get my free quote →</Link>
            <a href={`tel:${c.phone.replace(/[^0-9]/g, "")}`} className="text-sm font-bold" style={{ color: NAVY }}>or call {c.phone}</a>
          </div>
        </section>
      </main>
    </div>
  );
}
