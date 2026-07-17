import CountUp from "./CountUp";

/**
 * Thin proof strip: honest, verifiable numbers only (no invented
 * percentages). Numeric stats count up as they scroll into view.
 */
const stats: { value?: number; text?: string; label: string }[] = [
  { value: 5, label: "products live in production" },
  { value: 4, label: "companies I build & operate" },
  { text: "2 to 4", label: "weeks from kickoff to launch" },
  { text: "24/7", label: "booking & AI tools working" },
];

export default function MetricsBand() {
  return (
    <section aria-label="Track record" className="relative border-y border-white/[0.06] bg-white/[0.012] py-7">
      <div className="container-content grid grid-cols-2 gap-x-6 gap-y-6 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <p className="font-display text-4xl leading-none text-lime">
              {s.value !== undefined ? <CountUp value={s.value} /> : s.text}
            </p>
            <p className="mx-auto mt-1.5 max-w-[11rem] text-[0.75rem] font-medium uppercase tracking-wider text-white/40">
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
