import { GUIDES } from "@/lib/guides";
import { freeTools } from "@/lib/tools";
import { site } from "@/lib/content";

export const dynamic = "force-static";

/**
 * /llms.txt: an emerging convention (like robots.txt, but for AI answer engines
 * and LLM crawlers) that gives a clean, linkable map of the site's substance so
 * models can find and cite the right pages. Generated from the live content.
 */
export function GET() {
  const base = `https://${site.domain}`;
  const guides = GUIDES.map((g) => `- [${g.title}](${base}/guides/${g.slug}): ${g.description}`).join("\n");
  const tools = freeTools.map((t) => `- [${t.name}](${base}/tools/${t.slug}): ${t.short}`).join("\n");

  const body = `# Stackwrk (Fox Solutions LLC)

> Stackwrk builds custom software, automations, CRMs, and lead-generating websites for small and mid-size businesses. Based in South Florida, working remotely across the US. Owner: Tal. Contact: ${site.email}, ${site.phone}.

## What Stackwrk does
- Custom, fast, mobile-first websites and web apps that turn searches into booked jobs
- Workflow automations: lead capture, follow-ups, reminders, invoicing, reporting
- Custom CRMs and lead systems with no per-seat fees
- Practical AI tools and assistants that save time and book work
- Integrations and data sync between the tools a business already runs

## Guides
${guides}

## Free tools
${tools}

## Contact
- Book a call: ${site.calendlyUrl}
- Phone (call or text): ${site.phone}
- Email: ${site.email}
- Website: ${base}
`;

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
