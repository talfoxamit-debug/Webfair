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
  const { deposit, clauses, money } = buildAgreement(cfg);
  const dateStr = cfg.date
    ? new Date(cfg.date).toLocaleDateString("en-US", { dateStyle: "long" } as Intl.DateTimeFormatOptions)
    : new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <div className="min-h-screen bg-slate-100 py-8 text-slate-800 sm:py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        {/* brand header */}
        <div className="flex items-center justify-between">
          <span className="text-lg font-extrabold tracking-tight" style={{ color: NAVY }}>
            Stack<span style={{ color: GREEN }}>wrk</span>
          </span>
          <span className="text-xs text-slate-400">Fox Solutions LLC, d/b/a Stackwrk</span>
        </div>

        {/* document */}
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl" style={{ color: NAVY }}>Website Design &amp; Development Agreement</h1>
          <p className="mt-1 text-sm text-slate-500">Dated {dateStr}</p>

          {/* parties */}
          <div className="mt-6 grid gap-4 rounded-xl bg-slate-50 p-5 sm:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Developer</p>
              <p className="mt-1 text-sm font-semibold" style={{ color: NAVY }}>Fox Solutions LLC (Stackwrk)</p>
              <p className="text-xs text-slate-500">hello@stackwrk.com · (754) 282-2149</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Client</p>
              <p className="mt-1 text-sm font-semibold" style={{ color: NAVY }}>{cfg.clientName}</p>
              <p className="text-xs text-slate-500">{[cfg.contact, cfg.email, cfg.phone].filter(Boolean).join(" · ") || "—"}</p>
            </div>
          </div>

          {/* project summary */}
          <div className="mt-5 rounded-xl border p-5" style={{ borderColor: "#cfe9d8", background: "#f2faf5" }}>
            <p className="text-xs font-bold uppercase tracking-wide" style={{ color: GREEN }}>Project summary</p>
            <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[["Package", cfg.pkg], ["Project fee", money(cfg.projectFee)], ["Deposit to start", money(deposit)], ["Care plan", `${money(cfg.careMonthly)}/mo`]].map(([l, v]) => (
                <div key={l}><p className="text-[0.65rem] uppercase tracking-wide text-slate-400">{l}</p><p className="text-sm font-extrabold" style={{ color: NAVY }}>{v}</p></div>
              ))}
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

        {/* sign */}
        <div className="mt-5">
          <SignBlock config={cfg} depositLabel={money(deposit)} />
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">Questions? Reply to Tal or email hello@stackwrk.com.</p>
      </div>
    </div>
  );
}
