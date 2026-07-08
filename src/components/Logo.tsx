import { site } from "@/lib/content";

/**
 * Stackwrk wordmark — typography only, no icon/mascot (per design spec).
 * `compact` renders a smaller variant used in the footer.
 */
export default function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-3">
      <svg
        viewBox="0 0 42 42"
        aria-hidden="true"
        className={`${compact ? "h-7 w-7" : "h-10 w-10"} shrink-0 text-lime drop-shadow-[0_0_18px_rgba(203,255,60,0.45)]`}
      >
        <path
          d="M8 5 21 19 34 5l-9 16 9 16L21 23 8 37l9-16L8 5Z"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3.5"
        />
        <path
          d="m13 9 9 10m7-9-8 10m-8 13 9-10m7 10-8-10"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.6"
          opacity="0.8"
        />
      </svg>
      {!compact && (
        <span className="grid">
          <span className="font-display text-2xl uppercase leading-[0.85] tracking-wide text-white">
            FOX
          </span>
          <span className="text-[0.7rem] font-black uppercase tracking-[0.24em] text-white">
            SOLUTIONS
          </span>
        </span>
      )}
      {compact && <span className="sr-only">{site.brand}</span>}
    </span>
  );
}
