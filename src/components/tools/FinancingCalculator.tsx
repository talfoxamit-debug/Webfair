"use client";

import { useMemo, useState } from "react";
import { NAVY, GREEN, GREEN_BRIGHT } from "@/lib/fence-theme";

/** Monthly-payment estimator using standard amortization. Contractors close more
 *  jobs when the homeowner sees "$X/mo" instead of a lump sum. */
export default function FinancingCalculator() {
  const [amount, setAmount] = useState(6000);
  const [term, setTerm] = useState(48);
  const apr = 9.99;

  const { monthly, total } = useMemo(() => {
    const r = apr / 100 / 12;
    const n = term;
    const monthly = r === 0 ? amount / n : (amount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return { monthly, total: monthly * n };
  }, [amount, term]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div>
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Project amount</label>
          <span className="text-sm font-bold" style={{ color: NAVY }}>${amount.toLocaleString()}</span>
        </div>
        <input type="range" min={1500} max={25000} step={250} value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="mt-2 w-full accent-emerald-600" />

        <label className="mt-5 block text-xs font-bold uppercase tracking-wide text-slate-500">Term</label>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {[12, 24, 48, 60].map((t) => (
            <button key={t} onClick={() => setTerm(t)} className="rounded-lg border px-2 py-2 text-sm font-semibold" style={term === t ? { borderColor: GREEN, background: "#EAF6EF", color: NAVY } : { borderColor: "rgba(0,0,0,0.1)", color: "#64748b" }}>{t} mo</button>
          ))}
        </div>
        <p className="mt-3 text-[0.75rem] text-slate-400">Illustrative at {apr}% APR, $0 down. Your actual rate/term depend on approval. Checking won&rsquo;t affect your credit.</p>
      </div>

      <div className="flex flex-col justify-center rounded-2xl p-6 text-white" style={{ background: `linear-gradient(160deg, ${NAVY}, #123a52)` }}>
        <p className="text-xs font-semibold uppercase tracking-wide text-white/60">Estimated monthly payment</p>
        <p className="mt-1 text-4xl font-extrabold">${Math.round(monthly).toLocaleString()}<span className="text-lg font-semibold text-white/50">/mo</span></p>
        <p className="mt-1 text-sm text-white/60">≈ ${Math.round(total).toLocaleString()} total over {term} months</p>
        <a href="#quote" className="mt-4 inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-bold text-white" style={{ background: GREEN_BRIGHT }}>Check my rate →</a>
      </div>
    </div>
  );
}
