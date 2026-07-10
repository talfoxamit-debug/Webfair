import type { Metadata } from "next";
import ToolLayout from "@/components/ToolLayout";
import MetaTagTool from "@/components/MetaTagTool";
import { getTool } from "@/lib/tools";

const tool = getTool("meta-tag-generator")!;

export const metadata: Metadata = {
  title: tool.metaTitle,
  description: tool.metaDescription,
  keywords: tool.keywords,
  alternates: { canonical: "/tools/meta-tag-generator" },
  openGraph: {
    title: tool.metaTitle,
    description: tool.metaDescription,
    url: "/tools/meta-tag-generator",
    type: "website",
  },
};

export default function MetaTagGeneratorPage() {
  return (
    <ToolLayout tool={tool}>
      <MetaTagTool />
    </ToolLayout>
  );
}
