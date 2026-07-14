"use client";

import { useMemo, useState } from "react";
import { priceItems, money, type PriceItem } from "@/lib/pricing";

/**
 * Internal quote builder (Tal-only, /quote — noindex, unlinked).
 * Pick services → live totals (one-time, MRR, year-1 value) with a
 * founding/standard rate toggle → copy a ready-to-send quote.
 */

const CATEGORY_LABELS: Record<PriceItem["category"], string> = {
  build: "Website builds",
  care: "Care plans (monthly)",
  growth: "Growth",
  automation: "Automation",
  ai: "AI",
  crm: "CRM",
  cto: "Advisory",
};

const CATEGORY_ORDER: PriceItem["category"][] = [
  "build",
  "care",
  "automation",
  "ai",
  "crm",
  "growth",
  "cto",
];

export default function QuoteBuilder() {
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [rate, setRate] = useState<"founding" | "standard">("founding");
  const [client, setClient] = useState("");
  const [discount, setDiscount] = useState(0);
  const [copied, setCopied] = useState(false);

  const chosen = priceItems.filter((p) => selected[p.id]);

  const totals = useMemo(() => {
    const oneTimeRaw = chosen.reduce(
      (s, p) => s + (rate === "founding" ? p.founding : p.standard),
      0,
    );
    const monthly = chosen.reduce(
      (s, p) => s + (rate === "founding" ? (p.monthlyFounding ?? 0) : (p.monthlyStandard ?? 0)),
      0,
    );
    const oneTime = Math.max(0, Math.round(oneTimeRaw * (1 - discount / 100)));
    return { oneTime, monthly, yearOne: oneTime + monthly * 12 };
  }, [chosen, rate, discount]);

  const quoteText = useMemo(() => {
    if (chosen.length === 0) return "";
    const lines: string[] = [];
    lines.push(`Stackwrk: Proposal${client ? ` for ${client}` : ""}`);
    lines.push("".padEnd(46, "-"));
    for (const p of chosen) {
      const one = rate === "founding" ? p.founding : p.standard;
      const mo = rate === "founding" ? (p.monthlyFounding ?? 0) : (p.monthlyStandard ?? 0);
      const price =
        one > 0
          ? `${money(one)}${mo ? ` + ${money(mo)}/mo` : ""}`
          : `${money(mo)}/mo`;
      lines.push(`• ${p.label}: ${price}`);
      lines.push(`    ${p.blurb}`);
    }
    lines.push("".padEnd(46, "-"));
    if (discount > 0) lines.push(`Discount applied: ${discount}% (one-time fees)`);
    if (totals.oneTime > 0) lines.push(`One-time investment: ${money(totals.oneTime)}`);
    if (totals.monthly > 0) lines.push(`Monthly: ${money(totals.monthly)}/mo`);
    lines.push(`First-year total: ${money(totals.yearOne)}`);
    lines.push("");
    lines.push(
      rate === "founding"
        ? "Founding-client rate, locked in for as long as you're a client."
        : "Standard rate.",
    );
    lines.push("Fixed price. No hourly billing. You own 100% of the code.");
    return lines.join("\n");
  }, [chosen, rate, client, discount, totals]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(quoteText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable — user can select the preview text manually */
    }
  }

  const itemPrice = (p: PriceItem) => {
    const one = rate === "founding" ? p.founding : p.standard;
    const mo = rate === "founding" ? (p.monthlyFounding ?? 0) : (p.monthlyStandard ?? 0);
    if (one > 0 && mo > 0) return `${money(one)} + ${money(mo)}/mo`;
    if (one > 0) return money(one);
    return `${money(mo)}/mo`;
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
      {/* Left: item picker */}
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={client}
            onChange={(e) => setClient(e.target.value)}
            placeholder="Client / business name"
            className="w-full max-w-xs rounded-md border border-white/12 bg-ink-800/70 px-4 py-2.5 text-sm text-white placeholder-white/35 outline-none focus:border-lime/60"
          />
          <div className="flex overflow-hidden rounded-md border border-white/12 text-xs font-bold uppercase tracking-wide">
            {(["founding", "standard"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRate(r)}
                className={`px-4 py-2.5 transition-colors ${
                  rate === r ? "bg-lime text-ink" : "text-white/60 hover:text-white"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-xs text-white/60">
            Discount
            <input
              type="number"
              min={0}
              max={50}
              value={discount}
              onChange={(e) => setDiscount(Math.min(50, Math.max(0, Number(e.target.value) || 0)))}
              className="w-16 rounded-md border border-white/12 bg-ink-800/70 px-2 py-2 text-sm text-white outline-none focus:border-lime/60"
            />
            %
          </label>
        </div>

        {CATEGORY_ORDER.map((cat) => {
          const items = priceItems.filter((p) => p.category === cat);
          if (items.length === 0) return null;
          return (
            <div key={cat} className="mt-7">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-violet-400">
                {CATEGORY_LABELS[cat]}
              </h3>
              <div className="mt-3 space-y-2">
                {items.map((p) => (
                  <label
                    key={p.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
                      selected[p.id]
                        ? "border-lime/50 bg-lime/[0.06]"
                        : "border-white/[0.08] bg-ink-600/40 hover:border-white/20"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={!!selected[p.id]}
                      onChange={(e) => setSelected((s) => ({ ...s, [p.id]: e.target.checked }))}
                      className="mt-1 accent-lime"
                    />
                    <span className="flex-1">
                      <span className="flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold text-white">{p.label}</span>
                        <span className="shrink-0 font-mono text-sm text-lime">{itemPrice(p)}</span>
                      </span>
                      <span className="mt-0.5 block text-xs text-white/50">{p.blurb}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Right: live quote */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="card p-6">
          <h3 className="font-display text-xl uppercase text-white">Quote summary</h3>
          <div className="mt-5 space-y-3 border-b border-white/[0.08] pb-5">
            <div className="flex justify-between text-sm">
              <span className="text-white/55">One-time</span>
              <span className="font-mono text-white">{money(totals.oneTime)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/55">Monthly recurring</span>
              <span className="font-mono text-lime">{money(totals.monthly)}/mo</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/55">First-year value</span>
              <span className="font-mono text-white">{money(totals.yearOne)}</span>
            </div>
          </div>

          {chosen.length > 0 ? (
            <>
              <pre className="mt-5 max-h-80 overflow-auto whitespace-pre-wrap rounded-lg bg-ink-800/70 p-4 text-xs leading-relaxed text-white/75">
                {quoteText}
              </pre>
              <button onClick={copy} className="btn-primary mt-4 w-full !rounded-md">
                {copied ? "Copied ✓" : "Copy quote"}
              </button>
            </>
          ) : (
            <p className="mt-5 text-sm text-white/40">
              Select services on the left to build a quote.
            </p>
          )}
        </div>
        <p className="mt-3 text-center text-xs text-white/35">
          Internal tool. Not linked from the site, not indexed.
        </p>
      </div>
    </div>
  );
}
