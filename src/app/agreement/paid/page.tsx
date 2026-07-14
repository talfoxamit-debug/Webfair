import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Payment received | Stackwrk", robots: { index: false, follow: false } };

const NAVY = "#0C2333";
const GREEN = "#18894C";

export default async function PaidPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const type = (await searchParams).type;
  const care = type === "care";
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 text-slate-800">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full text-2xl text-white" style={{ background: GREEN }}>✓</div>
        <h1 className="mt-4 text-2xl font-extrabold" style={{ color: NAVY }}>
          {care ? "You're all set!" : "Deposit received, thank you!"}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          {care
            ? "Your care plan is active. We'll keep your site fast, secure and improving every month."
            : "We've got your deposit. Send over your logo, photos and details and we'll get your build started, usually within a couple of business days."}
        </p>
        <p className="mt-4 text-sm font-semibold" style={{ color: NAVY }}>Questions? hello@stackwrk.com · (754) 551-2828</p>
        <Link href="/" className="mt-6 inline-flex rounded-lg px-6 py-2.5 text-sm font-bold text-white" style={{ background: GREEN }}>Back to Stackwrk</Link>
      </div>
    </div>
  );
}
