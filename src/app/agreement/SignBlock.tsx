"use client";

import { useRef, useState } from "react";
import type { AgreementConfig } from "@/lib/agreement";

const GREEN = "#18894C";
const NAVY = "#0C2333";

export default function SignBlock({ config, depositLabel, depositAmount }: { config: AgreementConfig; depositLabel: string; depositAmount: number }) {
  const [signer, setSigner] = useState(config.contact || "");
  const [agreed, setAgreed] = useState(false);
  const [mode, setMode] = useState<"typed" | "drawn">("typed");
  const [status, setStatus] = useState<"idle" | "signing" | "signed" | "error">("idle");
  const [record, setRecord] = useState<{ when: string; ip: string }>({ when: "", ip: "" });
  const [paying, setPaying] = useState(false);
  const [payMsg, setPayMsg] = useState("");

  // --- draw signature ---
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const [hasInk, setHasInk] = useState(false);

  function ctx() { return canvasRef.current?.getContext("2d") || null; }
  function point(e: React.PointerEvent) {
    const c = canvasRef.current!; const r = c.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (c.width / r.width), y: (e.clientY - r.top) * (c.height / r.height) };
  }
  function down(e: React.PointerEvent) { const g = ctx(); if (!g) return; drawingRef.current = true; g.lineWidth = 2.5; g.lineCap = "round"; g.strokeStyle = NAVY; const p = point(e); g.beginPath(); g.moveTo(p.x, p.y); (e.target as Element).setPointerCapture?.(e.pointerId); }
  function move(e: React.PointerEvent) { if (!drawingRef.current) return; const g = ctx(); if (!g) return; const p = point(e); g.lineTo(p.x, p.y); g.stroke(); setHasInk(true); }
  function up() { drawingRef.current = false; }
  function clearInk() { const g = ctx(); const c = canvasRef.current; if (g && c) g.clearRect(0, 0, c.width, c.height); setHasInk(false); }

  const ready = agreed && signer.trim().length >= 2 && (mode === "typed" || hasInk);

  async function sign() {
    if (!ready || status === "signing") return;
    setStatus("signing");
    try {
      const drawing = mode === "drawn" ? canvasRef.current?.toDataURL("image/png") : undefined;
      const r = await fetch("/api/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config, signer: signer.trim(), method: mode, drawing }),
      });
      const j = await r.json().catch(() => ({}));
      if (j.ok) {
        setRecord({ when: new Date(j.signedAt || Date.now()).toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" }), ip: j.ip || "" });
        setStatus("signed");
      } else setStatus("error");
    } catch { setStatus("error"); }
  }

  async function payDeposit() {
    setPaying(true); setPayMsg("");
    try {
      const r = await fetch("/api/checkout", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "deposit", amount: depositAmount, label: config.pkg, client: config.clientName, email: config.email }),
      });
      const j = await r.json().catch(() => ({}));
      if (j.ok && j.url) { window.location.href = j.url; return; }
      setPayMsg("Online payment isn't set up yet — Tal will send you an invoice for the deposit.");
    } catch { setPayMsg("Couldn't start checkout — Tal will send you an invoice."); }
    setPaying(false);
  }

  if (status === "signed") {
    return (
      <div className="rounded-2xl border-2 border-emerald-500/40 bg-emerald-50 p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full text-xl text-white" style={{ background: GREEN }}>✓</div>
        <h3 className="mt-3 text-xl font-extrabold" style={{ color: NAVY }}>Agreement signed</h3>
        <p className="mt-1 text-sm text-slate-600">Signed by <b>{signer}</b> on {record.when}.</p>
        {record.ip && <p className="mt-0.5 text-xs text-slate-400">Recorded electronically{record.ip ? ` · IP ${record.ip}` : ""} — legally binding.</p>}
        {config.email && <p className="mt-0.5 text-xs text-slate-400">A copy has been emailed to {config.email}.</p>}
        <div className="mt-5">
          {config.payLink ? (
            <a href={config.payLink} target="_blank" rel="noopener noreferrer" className="inline-flex rounded-xl px-7 py-4 text-base font-bold text-white shadow-md" style={{ background: GREEN }}>Pay {depositLabel} deposit to start →</a>
          ) : payMsg ? (
            <p className="text-sm font-semibold" style={{ color: NAVY }}>{payMsg}</p>
          ) : (
            <button onClick={payDeposit} disabled={paying} className="inline-flex rounded-xl px-7 py-4 text-base font-bold text-white shadow-md disabled:opacity-60" style={{ background: GREEN }}>
              {paying ? "Starting secure checkout…" : `Pay ${depositLabel} deposit to start →`}
            </button>
          )}
          <p className="mt-2 text-xs text-slate-400">Secure payment via Stripe. A copy of this agreement has been recorded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-bold uppercase tracking-wide text-slate-500">Sign to accept &amp; pay deposit</p>
      <p className="mt-1 text-xs text-slate-500">Review the agreement above, then sign below — it&rsquo;s a legally binding electronic signature. You&rsquo;ll go straight to the {depositLabel} deposit.</p>

      <label className="mt-4 block text-xs font-semibold text-slate-600">Full legal name
        <input value={signer} onChange={(e) => setSigner(e.target.value)} placeholder="Your full name"
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-500" />
      </label>

      {/* signature: type or draw */}
      <div className="mt-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600">Signature</span>
          <div className="inline-flex rounded-lg border border-slate-300 p-0.5 text-xs">
            <button onClick={() => { setMode("typed"); setHasInk(false); }} className={`rounded px-3 py-1 font-bold ${mode === "typed" ? "bg-emerald-600 text-white" : "text-slate-500"}`}>Type</button>
            <button onClick={() => { setMode("drawn"); setHasInk(false); }} className={`rounded px-3 py-1 font-bold ${mode === "drawn" ? "bg-emerald-600 text-white" : "text-slate-500"}`}>Draw</button>
          </div>
        </div>
        {mode === "typed" ? (
          <div className="mt-2 flex h-20 items-center justify-center rounded-lg border border-slate-300 bg-slate-50 px-4">
            <span className="text-3xl text-slate-800" style={{ fontFamily: "'Segoe Script','Brush Script MT',cursive" }}>{signer || "Your signature"}</span>
          </div>
        ) : (
          <div className="mt-2">
            <canvas
              ref={canvasRef} width={600} height={160}
              onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up}
              className="h-40 w-full touch-none rounded-lg border border-slate-300 bg-slate-50"
            />
            <button onClick={clearInk} className="mt-1 text-xs font-semibold text-slate-500 hover:text-slate-700">Clear</button>
          </div>
        )}
      </div>

      <label className="mt-3 flex items-start gap-2.5 text-sm text-slate-700">
        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 h-4 w-4 accent-emerald-600" />
        I have read and agree to this Website Design &amp; Development Agreement, and consent to sign electronically.
      </label>
      {status === "error" && <p className="mt-2 text-xs text-rose-600">Something went wrong — please try again or email hello@stackwrk.com.</p>}
      <button onClick={sign} disabled={!ready || status === "signing"}
        className="mt-4 w-full rounded-lg px-5 py-3 text-sm font-bold text-white disabled:opacity-50" style={{ background: GREEN }}>
        {status === "signing" ? "Signing…" : `Sign & continue to ${depositLabel} deposit →`}
      </button>
    </div>
  );
}
