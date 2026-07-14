import type { Metadata } from "next";
import { resolveAgreement, buildAgreement, decodeAgreement } from "@/lib/agreement";
import SignBlock from "./SignBlock";

export const runtime = "nodejs";
export const metadata: Metadata = {
  title: "Website Agreement | Stackwrk",
  robots: { index: false, follow: false },
};

const NAVY = "#0C2333";
const GREEN = "#18894C";

export default async function AgreementPage({ searchParams }: { searchParams: Promise<{ d?: string }> }) {
  const raw = (await searchParams).d;
  const cfg = resolveAgreement(raw ? decodeAgreement(raw) || {} : {});
  const { deposit, clauses, money, listFee, savings, discountPct } = buildAgreement(cfg);
  const dateStr = cfg.date
    ? new Date(cfg.date).toLocaleDateString("en-US", { dateStyle: "long" } as Intl.DateTimeFormatOptions)
    : new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      {/* branded top bar */}
      <div className="text-white" style={{ background: `linear-gradient(100deg, ${NAVY}, #123a52)` }}>
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6">
          <span className="text-lg font-extrabold tracking-tight">
            Stack<span className="text-lime">wrk</span>
          </span>
          <span className="text-xs text-white/60">Website Agreement</span>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        {/* document */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* accent header */}
          <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${GREEN}, #1FA85E)` }} />
          <div className="p-6 sm:p-9">
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl" style={{ color: NAVY }}>Website Design &amp; Development Agreement</h1>
          <p className="mt-1 text-sm text-slate-500">Fox Solutions LLC, d/b/a Stackwrk · Dated {dateStr}</p>

          {/* guarantee callout */}
          <div className="mt-5 flex items-start gap-3 rounded-xl border p-4" style={{ borderColor: "#cfe9d8", background: "#f2faf5" }}>
            <span className="text-lg">🛡️</span>
            <p className="text-sm leading-relaxed text-slate-700">
              <b style={{ color: NAVY }}>Zero-risk:</b> you approve the design before I build. Not thrilled? Full refund of your deposit — you walk away owing nothing.
            </p>
          </div>

          {/* parties */}
          <div className="mt-6 grid gap-4 rounded-xl bg-slate-50 p-5 sm:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Developer</p>
              <p className="mt-1 text-sm font-semibold" style={{ color: NAVY }}>Fox Solutions LLC (Stackwrk)</p>
              <p className="text-xs text-slate-500">hello@stackwrk.com · (754) 551-2828</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Client</p>
              <p className="mt-1 text-sm font-semibold" style={{ color: NAVY }}>{cfg.clientName}</p>
              <p className="text-xs text-slate-500">{[cfg.contact, cfg.email, cfg.phone].filter(Boolean).join(" · ") || "—"}</p>
            </div>
          </div>

          {/* project summary */}
          <div className="mt-5 rounded-xl border p-5" style={{ borderColor: "#cfe9d8", background: "#f2faf5" }}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: GREEN }}>Project summary</p>
              {savings > 0 && (
                <span className="rounded-full px-2.5 py-0.5 text-[0.75rem] font-bold text-white" style={{ background: GREEN }}>
                  You save {money(savings)} · {discountPct}% off
                </span>
              )}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <p className="text-[0.75rem] uppercase tracking-wide text-slate-400">Package</p>
                <p className="text-sm font-extrabold" style={{ color: NAVY }}>{cfg.pkg}</p>
              </div>
              <div>
                <p className="text-[0.75rem] uppercase tracking-wide text-slate-400">Project fee</p>
                <p className="text-sm font-extrabold" style={{ color: NAVY }}>
                  {savings > 0 && <span className="mr-1.5 font-semibold text-slate-400 line-through">{money(listFee)}</span>}
                  {money(cfg.projectFee)}
                </p>
              </div>
              <div>
                <p className="text-[0.75rem] uppercase tracking-wide text-slate-400">Deposit to start</p>
                <p className="text-sm font-extrabold" style={{ color: NAVY }}>{money(deposit)}</p>
              </div>
              <div>
                <p className="text-[0.75rem] uppercase tracking-wide text-slate-400">Care plan</p>
                <p className="text-sm font-extrabold" style={{ color: NAVY }}>{money(cfg.careMonthly)}/mo</p>
              </div>
            </div>
          </div>

          {/* clauses */}
          <div className="mt-7 space-y-5">
            {clauses.map((c) => (
              <section key={c.h}>
                <h2 className="text-base font-bold" style={{ color: NAVY }}>{c.h}</h2>
                <div className="mt-1.5 space-y-1.5">
                  {c.body.map((line, i) => (
                    <p key={i} className="text-[0.9rem] leading-relaxed text-slate-700">{line}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <p className="mt-8 text-xs leading-relaxed text-slate-400">
            By signing below, both parties agree to the terms above. This agreement is governed by the laws of the State of Florida.
          </p>
          </div>
        </div>

        {/* sign */}
        <div className="mt-5">
          <SignBlock config={cfg} depositLabel={money(deposit)} depositAmount={deposit} />
        </div>

        {/* trust badges */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs text-slate-400">
          <span>🔒 Secure</span>
          <span>✍️ Legally binding e-signature</span>
          <span>💳 Payments by Stripe</span>
        </div>
        <p className="mt-3 text-center text-xs text-slate-400">Questions? Reply to Tal or email hello@stackwrk.com · (754) 551-2828</p>
      </div>
    </div>
  );
}
