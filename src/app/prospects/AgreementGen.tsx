"use client";

import { useState } from "react";
import { encodeAgreement, PLAN_PRESETS, type AgreementConfig } from "@/lib/agreement";
import type { Prospect } from "@/lib/prospects";

const todayISO = () => new Date().toISOString().slice(0, 10);
/** Exact founding discount for a plan, as a float so the default lands on the
 *  preset's clean fee (e.g. Growth = 30.769% → $4,500, not a rounded $4,485). */
const presetDiscount = (pkg: AgreementConfig["pkg"]) => {
  const p = PLAN_PRESETS[pkg];
  return (1 - p.fee / p.listFee) * 100;
};

/**
 * Per-client agreement link generator. Mounted with key={prospect.id} so all
 * state resets when you open a different lead, no discount bleeds between
 * clients. Fee is rounded to a clean $50 so quotes never drift off the preset.
 */
export default function AgreementGen({ prospect, onCopy }: { prospect: Prospect; onCopy: (msg: string) => void }) {
  // A FOX5-tagged lead (referred from FoxStays Docks) gets the standard founding
  // discount plus an extra 5 points, stacked. Tal still reviews and sends every
  // agreement, so this is a default to start from, not an unreviewed auto-charge.
  const promoExtra = prospect.tags?.includes("FOX5") ? 5 : 0;
  const [pkg, setPkg] = useState<AgreementConfig["pkg"]>("Growth");
  const [discount, setDiscount] = useState<number>(() => presetDiscount("Growth") + promoExtra);
  const [care, setCare] = useState<number>(PLAN_PRESETS.Growth.careMonthly);

  const list = PLAN_PRESETS[pkg].listFee;
  const fee = Math.max(0, Math.round((list * (1 - discount / 100)) / 50) * 50);
  const savings = Math.max(0, list - fee);

  function selectPlan(next: AgreementConfig["pkg"]) {
    setPkg(next);
    setDiscount(presetDiscount(next) + promoExtra);
    setCare(PLAN_PRESETS[next].careMonthly);
  }

  function copyLink() {
    const pre = PLAN_PRESETS[pkg];
    const d = encodeAgreement({
      clientName: prospect.name, contact: prospect.owner, email: prospect.email, phone: prospect.phone,
      pkg, pages: pre.pages, projectFee: fee, listFee: list,
      careName: pre.careName, careMonthly: Math.max(0, care || 0), date: todayISO(),
    });
    const url = `${window.location.origin}/agreement?d=${d}`;
    navigator.clipboard?.writeText(url);
    onCopy("Agreement link copied, send it to the client");
  }

  return (
    <div className="mt-5 rounded-lg p-3 crm-stat">
      <p className="text-xs font-bold uppercase tracking-wide crm-muted">Client agreement · auto-filled for {prospect.name}</p>
      {promoExtra > 0 && (
        <p className="mt-1 text-[0.62rem] font-semibold text-emerald-700 dark:text-lime">
          🎉 FOX5 referral: standard discount + {promoExtra}% extra applied by default
        </p>
      )}
      <div className="mt-2 grid grid-cols-2 gap-2">
        <label className="text-[0.62rem] font-semibold crm-subtle">Plan
          <select value={pkg} onChange={(e) => selectPlan(e.target.value as AgreementConfig["pkg"])} className="mt-0.5 w-full rounded-lg px-2 py-1.5 text-xs crm-input">
            <option>Launch</option><option>Growth</option><option>Market Leader</option>
          </select>
        </label>
        <label className="text-[0.62rem] font-semibold crm-subtle">Care $/mo
          <input type="number" min={0} value={care} onChange={(e) => setCare(Math.max(0, Number(e.target.value) || 0))} className="mt-0.5 w-full rounded-lg px-2 py-1.5 text-xs crm-input" />
        </label>
      </div>
      <label className="mt-2 block text-[0.62rem] font-semibold crm-subtle">Discount off list price: <b className="crm-strong">{Math.round(discount)}%</b>
        <input type="range" min={0} max={60} step={1} value={Math.round(discount)} onChange={(e) => setDiscount(Number(e.target.value))} className="mt-1 w-full accent-emerald-600 dark:accent-lime" />
      </label>
      <div className="mt-1 flex items-baseline justify-between rounded-md bg-black/5 px-2.5 py-1.5 dark:bg-white/5">
        <span className="text-[0.66rem] crm-subtle">List <span className="line-through">${list.toLocaleString()}</span></span>
        <span className="text-[0.66rem] font-bold text-emerald-700 dark:text-lime">Client pays ${fee.toLocaleString()}</span>
        <span className="text-[0.66rem] crm-subtle">saves ${savings.toLocaleString()}</span>
      </div>
      <button onClick={copyLink} className="mt-2 w-full rounded-lg bg-lime px-3 py-2 text-xs font-bold text-ink">📄 Copy e-sign agreement link</button>
      <p className="mt-1 text-[0.6rem] crm-subtle">Send the link after they say yes: they review, sign &amp; pay online. The discount shows on their agreement.</p>
    </div>
  );
}
