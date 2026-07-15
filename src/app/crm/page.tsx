import type { Metadata } from "next";
import CrmBoard from "@/components/CrmBoard";

export const metadata: Metadata = {
  title: "Lead Pipeline (internal)",
  robots: { index: false, follow: false },
};

export default function CrmPage() {
  return (
    <div className="container-content pb-20 pt-28 sm:pt-32">
      <p className="eyebrow">Internal · CRM</p>
      <h1 className="mt-3 font-display text-4xl uppercase text-white sm:text-5xl">
        Lead pipeline
      </h1>
      <p className="mt-3 max-w-xl text-sm text-white/55">
        Every audit-form submission lands here. Track stage, keep notes on pain
        points and objections (feeds the monthly win/loss review in MARKETING.md).
      </p>
      <div className="mt-10">
        <CrmBoard />
      </div>
    </div>
  );
}
