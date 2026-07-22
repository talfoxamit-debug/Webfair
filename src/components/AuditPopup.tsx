"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check } from "./icons";
import { promo } from "@/lib/content";
import { getAttribution } from "@/lib/attribution";
import { getPromo, getPromoForSubmit } from "@/lib/promo";
import { track } from "@/lib/track";

const SEEN_KEY = "stackwrk_audit_popup_seen";
// Module-level guard: survives any component remount within a page load, so the
// popup can never appear twice in one visit even if React re-mounts it.
let popupHandled = false;
const field =
  "w-full rounded-lg border border-white/12 bg-ink-800/70 px-4 py-3 text-sm text-white placeholder-white/35 outline-none transition-colors focus:border-lime/60 focus:ring-2 focus:ring-lime/20";

/**
 * Entry popup: a limited-time free-audit + 10%-off offer. Shows once per session
 * a few seconds after landing. Captures URL + name + email (with consent), runs
 * the audit, and drops the visitor into the CRM flagged for the founding discount.
 */
export default function AuditPopup() {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [agree, setAgree] = useState(false);
  const [company, setCompany] = useState(""); // honeypot
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [emailed, setEmailed] = useState(false); // did the report email actually send
  const [err, setErr] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const [refPromo, setRefPromo] = useState<ReturnType<typeof getPromo>>(null);
  const totalOffPct = 10 + (refPromo?.extraPercent ?? 0);

  useEffect(() => { setRefPromo(getPromo()); }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (popupHandled) return; // already shown/handled this page load
    try { if (sessionStorage.getItem(SEEN_KEY)) { popupHandled = true; return; } } catch { /* private mode */ }
    const t = setTimeout(() => {
      if (popupHandled || window.location.hash === "#mockup") return; // never stack on the mockup modal
      popupHandled = true;
      setOpen(true);
    }, 2500);
    return () => clearTimeout(t);
  }, []);

  // Accessibility: when open, lock body scroll, move focus into the dialog,
  // trap Tab inside it, close on Escape, and restore focus on close.
  useEffect(() => {
    if (!open) return;
    const prevFocus = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstFieldRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { close(); return; }
      if (e.key === "Tab" && dialogRef.current) {
        const f = dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),input:not([type="hidden"]),textarea,select,[tabindex]:not([tabindex="-1"])',
        );
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      prevFocus?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function close() {
    popupHandled = true;
    setOpen(false);
    try { sessionStorage.setItem(SEEN_KEY, "1"); } catch { /* ignore */ }
  }

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const ready = url.trim().length > 3 && name.trim().length >= 2 && emailOk && agree;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!ready || status === "sending") return;
    if (company) { close(); return; } // bot
    setStatus("sending"); setErr("");
    try {
      // 1) Run the audit (also logs the site as an inbound lead in the CRM).
      const auditRes = await fetch("/api/audit", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const audit = await auditRes.json().catch(() => ({}));

      if (auditRes.ok && audit.ok) {
        // 2) Email the report + store the lead, flagged for the 10% discount.
        const rep = await fetch("/api/audit-report", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(), email: email.trim(), result: audit,
            source: "popup_audit", note: `Popup: wants ${totalOffPct}% founding discount`,
            ...getAttribution(), ...getPromoForSubmit(),
          }),
        }).then((r) => r.json()).catch(() => ({}));
        if (rep && rep.ok) setEmailed(true);
      } else {
        // Site unreachable, still capture the lead so we can follow up.
        await fetch("/api/leads", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(), email: email.trim(), website: url.trim(),
            source: "popup_audit",
            message: `Free-audit popup: wants ${totalOffPct}% founding discount (site unreachable at submit).`,
            ...getAttribution(), ...getPromoForSubmit(),
          }),
        });
      }
      track("audit_lead", { channel: "entry_popup" });
      setStatus("done");
      try { sessionStorage.setItem(SEEN_KEY, "1"); } catch { /* ignore */ }
    } catch {
      setErr("Something went wrong. Please try again or email hello@stackwrk.com.");
      setStatus("error");
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label="Free website audit offer"
    >
      <div
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-lime/25 bg-ink shadow-2xl"
      >
        <div className="h-1.5 bg-gradient-to-r from-lime via-lime to-emerald-400" />
        <button
          onClick={close}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white"
        >
          ✕
        </button>

        {status === "done" ? (
          <div className="p-7 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-lime text-ink">
              <Check width={26} height={26} />
            </span>
            <h3 className="mt-4 font-display text-2xl uppercase text-white">You&rsquo;re all set</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/70">
              {emailed ? (
                <>Your audit is on its way to <span className="text-lime">{email.trim()}</span>. </>
              ) : (
                <>We&rsquo;ve got your details and we&rsquo;ll send your audit to <span className="text-lime">{email.trim()}</span> shortly. </>
              )}
              Your <span className="font-semibold text-lime">{totalOffPct}% founding discount</span>{refPromo ? ` (10% + ${refPromo.extraPercent}% ${refPromo.partner.split(" / ")[0]} referral)` : ""} is locked in, and we&rsquo;ll be in touch soon.
            </p>
            <button onClick={close} className="btn-primary mt-6 !rounded-md">Done</button>
          </div>
        ) : (
          <div className="p-6 sm:p-7">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-lime/30 bg-lime/[0.08] px-3 py-1 text-[0.75rem] font-bold uppercase tracking-widest text-lime">
              ⏳ {promo.badge}
            </span>
            <h2 className="mt-3 font-display text-3xl uppercase leading-[0.95] text-white">
              Free website audit
            </h2>
            <div className="mt-2 flex flex-wrap items-baseline gap-x-2 font-display uppercase leading-none">
              <span className="text-2xl text-white/55">+</span>
              <span className="text-accent-glow text-5xl">{totalOffPct}% off</span>
              <span className="text-2xl text-white">your new site</span>
            </div>
            {refPromo && (
              <p className="mt-1.5 text-xs font-semibold text-lime">
                🎉 {refPromo.partner.split(" / ")[0]} referral: 10% + an extra {refPromo.extraPercent}% off, applied automatically
              </p>
            )}
            <p className="mt-3 text-sm leading-relaxed text-white/65">
              See exactly what&rsquo;s costing you jobs, sent to your inbox. Start with us and take{" "}
              <span className="font-semibold text-white">{totalOffPct}% off your build</span>.
            </p>

            <form onSubmit={submit} className="mt-5 space-y-3">
              {/* honeypot */}
              <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
              <input ref={firstFieldRef} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Your website (e.g. yoursite.com)" aria-label="Your website" className={field} inputMode="url" />
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" aria-label="Your name" className={field} />
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email" aria-label="Your email" className={field} inputMode="email" />

              <label className="flex items-start gap-2.5 text-xs leading-relaxed text-white/60">
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-lime" />
                <span>
                  I agree to receive my free audit and occasional emails from Stackwrk, and I accept the{" "}
                  <a href="/terms" target="_blank" className="text-lime hover:underline">Terms</a> and{" "}
                  <a href="/privacy" target="_blank" className="text-lime hover:underline">Privacy Policy</a>.
                </span>
              </label>

              {err && <p className="text-xs text-rose-400">{err}</p>}

              <button type="submit" disabled={!ready || status === "sending"} className="btn-primary w-full !rounded-md disabled:cursor-not-allowed disabled:opacity-60">
                {status === "sending" ? "Sending…" : `Get my free audit + ${totalOffPct}% off`}
                {status !== "sending" && <ArrowRight width={18} height={18} />}
              </button>
              <p className="text-center text-[0.7rem] text-white/35">No spam. Unsubscribe any time. Takes 20 seconds.</p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
