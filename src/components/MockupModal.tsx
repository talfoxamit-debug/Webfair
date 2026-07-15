"use client";

import { useEffect, useState } from "react";
import AuditForm from "./AuditForm";
import { site } from "@/lib/content";

/**
 * Global "Get a Free Mockup" modal. Any link to `#mockup` opens it, so the hero
 * and nav CTAs pop the request form right where the visitor is, instead of
 * scrolling them all the way to the bottom of the page. Mounted once on the home
 * page. Closing clears the hash without jumping.
 */
export default function MockupModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sync = () => setOpen(window.location.hash === "#mockup");
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open]);

  function close() {
    if (window.location.hash === "#mockup") {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm sm:items-center"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label="Get a free site mockup"
    >
      <div
        className="card relative my-8 w-full max-w-md p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={close}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-md text-white/50 transition-colors hover:bg-white/10 hover:text-white"
        >
          ✕
        </button>
        <h3 className="font-display text-2xl uppercase text-white">Get a free site mockup</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-white/60">
          Send your current site (or just your Facebook page) and we&rsquo;ll rebuild your homepage
          from your own photos. Free, no obligation.
        </p>
        <div className="mt-5">
          <AuditForm />
        </div>
        <a
          href={site.calendlyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 block text-center text-sm font-medium text-white/60 underline-offset-4 transition-colors hover:text-lime hover:underline"
        >
          Prefer to pick a time? Book a call →
        </a>
      </div>
    </div>
  );
}
