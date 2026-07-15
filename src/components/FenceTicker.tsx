"use client";

import { useEffect, useState } from "react";

/**
 * Subtle "recent activity" ticker: cycles through quote/booking events to give
 * the site a sense of momentum. Purely presentational; messages are generic so
 * it's honest on both the demo and per-prospect mockups.
 */
const EVENTS = [
  "New quote requested · Vinyl privacy fence · Coral Springs",
  "Estimate booked · Aluminum pool fence · Fort Lauderdale",
  "Job scheduled · Cedar fence & gate · Plantation",
  "New quote requested · Ranch rail · Southwest Ranches",
  "5★ review just came in · Pembroke Pines",
  "Estimate booked · Composite screen · Davie",
];

export default function FenceTicker({ green = "#18894C" }: { green?: string }) {
  const [i, setI] = useState(0);
  const [show, setShow] = useState(true);

  useEffect(() => {
    const t = setInterval(() => {
      setShow(false);
      setTimeout(() => { setI((n) => (n + 1) % EVENTS.length); setShow(true); }, 350);
    }, 3400);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="border-b border-black/5 bg-white">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-5 py-2 sm:px-8">
        <span className="flex items-center gap-1.5 text-[0.75rem] font-bold uppercase tracking-wide" style={{ color: green }}>
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ background: green }} />
            <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: green }} />
          </span>
          Live
        </span>
        <p className={`truncate text-xs text-slate-600 transition-opacity duration-300 ${show ? "opacity-100" : "opacity-0"}`}>
          {EVENTS[i]}
        </p>
      </div>
    </div>
  );
}
