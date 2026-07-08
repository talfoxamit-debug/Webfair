import { site } from "@/lib/content";

/**
 * Stackwrk wordmark — typography only, no icon/mascot (per design spec).
 * `compact` renders a smaller variant used in the footer.
 */
export default function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span
      className={`font-display uppercase leading-none tracking-[0.02em] text-white ${
        compact ? "text-lg" : "text-2xl"
      }`}
    >
      {site.brand}
    </span>
  );
}
