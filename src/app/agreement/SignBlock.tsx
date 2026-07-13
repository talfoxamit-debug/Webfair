"use client";

import { useState } from "react";
import type { AgreementConfig } from "@/lib/agreement";

const GREEN = "#18894C";
const NAVY = "#0C2333";

export default function SignBlock({ config, depositLabel }: { config: AgreementConfig; depositLabel: string }) {
  const [signer, setSigner] = useState(config.contact || "");
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState<"idle" | "signing" | "signed" | "error">("idle");
  const [when, setWhen] = useState("");

  async function sign() {
    if (!agreed || signer.trim().length < 2 || status === "signing") return;
    setStatus("signing");
    try {
      const r = await fetch("/api/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config, signer: signer.trim() }),
      });
      const j = await r.json().catch(() => ({}));
      if (j.ok) {
        setWhen(new Date().toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" }));
        setStatus("signed");
      } else setStatus("error");
    } catch { setStatus("error"); }
  }

  if (status === "signed") {
    return (
      <div className="rounded-2xl border-2 border-emerald-500/40 bg-emerald-50 p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full text-white" style={{ background: GREEN }}>✓</div>
        <h3 className="mt-3 text-xl font-extrabold" style={{ color: NAVY }}>Agreement signed</h3>
        <p className="mt-1 text-sm text-slate-600">Signed by <b>{signer}</b> on {when}.</p>
        {config.payLink ? (
          <a href={config.payLink} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex rounded-lg px-6 py-3 text-sm font-bold text-white" style={{ background: GREEN }}>
            Pay {depositLabel} deposit to start →
          </a>
        ) : (
          <p className="mt-4 text-sm font-semibold" style={{ color: NAVY }}>
            Next step: Tal will send your {depositLabel} deposit invoice to get started.
          </p>
        )}
        <p className="mt-3 text-xs text-slate-400">A copy of this agreement has been recorded. Thank you!</p>
      </div>
    );
  }

  const ready = agreed && signer.trim().length >= 2;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-bold uppercase tracking-wide text-slate-500">Sign to accept</p>
      <p className="mt-1 text-xs text-slate-500">
        Typing your name below and clicking &ldquo;Sign agreement&rdquo; is a legally binding electronic signature.
      </p>
      <label className="mt-4 block text-xs font-semibold text-slate-600">Full legal name
        <input value={signer} onChange={(e) => setSigner(e.target.value)} placeholder="Your full name"
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-500" />
      </label>
      <label className="mt-3 flex items-start gap-2.5 text-sm text-slate-700">
        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 h-4 w-4 accent-emerald-600" />
        I have read and agree to this Website Design &amp; Development Agreement.
      </label>
      {status === "error" && <p className="mt-2 text-xs text-rose-600">Something went wrong — please try again or email hello@stackwrk.com.</p>}
      <button onClick={sign} disabled={!ready || status === "signing"}
        className="mt-4 w-full rounded-lg px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
        style={{ background: GREEN }}>
        {status === "signing" ? "Signing…" : "Sign agreement"}
      </button>
    </div>
  );
}
