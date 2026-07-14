"use client";

import { useState } from "react";
import { CITY_RULES, NAVY, GREEN } from "@/lib/fence-theme";

export default function PermitChecker() {
  const [city, setCity] = useState("");
  const rule = CITY_RULES.find((r) => r.city === city);

  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Your city</label>
      <select
        value={city}
        onChange={(e) => setCity(e.target.value)}
        className="mt-2 w-full rounded-lg border border-black/10 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500"
      >
        <option value="">Select your city…</option>
        {CITY_RULES.map((r) => <option key={r.city} value={r.city}>{r.city}</option>)}
      </select>

      {rule && (
        <div className="mt-5 rounded-2xl border border-black/[0.07] bg-[#FAFAF7] p-5">
          <p className="text-sm font-bold" style={{ color: NAVY }}>{rule.city} · {rule.county} County</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white p-3 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-slate-400">Permit</p>
              <p className="text-lg font-extrabold" style={{ color: GREEN }}>Required</p>
            </div>
            <div className="rounded-xl bg-white p-3 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-slate-400">Max height</p>
              <p className="text-sm font-bold" style={{ color: NAVY }}>{rule.back} back · {rule.front} front</p>
            </div>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-slate-500">
            Corner lots, pools and HOAs have extra rules. We pull the permit, order the survey,
            and pass inspection for you. It&rsquo;s included in your quote.
          </p>
          <a href="#quote" className="mt-3 inline-flex rounded-lg px-4 py-2 text-sm font-bold text-white" style={{ background: GREEN }}>
            Get a quote, we handle the permit →
          </a>
        </div>
      )}
      {!rule && (
        <p className="mt-3 text-xs text-slate-400">Pick your city to see typical permit &amp; height rules.</p>
      )}
    </div>
  );
}
