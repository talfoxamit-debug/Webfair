import type { Metadata } from "next";
import QuoteBuilder from "@/components/QuoteBuilder";

export const metadata: Metadata = {
  title: "Quote Builder: internal",
  robots: { index: false, follow: false },
};

export default function QuotePage() {
  return (
    <div className="container-content pb-20 pt-28 sm:pt-32">
      <p className="eyebrow">Internal · pricing software</p>
      <h1 className="mt-3 font-display text-4xl uppercase text-white sm:text-5xl">
        Quote builder
      </h1>
      <p className="mt-3 max-w-xl text-sm text-white/55">
        Build a client quote from the live price book (<code>src/lib/pricing.ts</code>).
        Founding vs standard toggle, optional discount, copy-ready output.
      </p>
      <div className="mt-10">
        <QuoteBuilder />
      </div>
    </div>
  );
}
