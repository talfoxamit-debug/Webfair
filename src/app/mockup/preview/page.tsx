import type { Metadata } from "next";
import FenceSite from "@/components/FenceSite";
import { decodeConfig } from "@/lib/fence-config";

/**
 * Clean, prospect-facing personalized mockup. Config is carried in the ?d= param
 * (base64) so the link is shareable with no backend. This is what you send /
 * Loom to a prospect. Noindex.
 */
export const metadata: Metadata = {
  title: "Your new website — preview",
  robots: { index: false, follow: false },
};

export default async function MockupPreview({ searchParams }: { searchParams: Promise<{ d?: string }> }) {
  const { d } = await searchParams;
  const config = d ? decodeConfig(d) : {};
  return (
    <main>
      <FenceSite config={config} />
    </main>
  );
}
