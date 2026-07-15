import { site } from "@/lib/content";

/**
 * Stackwrk wordmark: typography only, no icon or mascot.
 * `compact` renders a smaller variant used in the footer.
 */
export default function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span
      className={`font-display uppercase leading-none tracking-wide text-white ${
        compact ? "text-lg" : "text-3xl"
      }`}
    >
      {site.brand}
    </span>
  );
}
