import type { Metadata } from "next";
import PageShell from "@/components/marketing/PageShell";
import IntelligenceReport from "@/components/agents/IntelligenceReport";
import { requireSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Industry intelligence — Bare Studios OS",
  description: "A monthly, executive one-page briefing on what's trending and what competitors are doing in your niche.",
};

export default async function IntelligencePage() {
  await requireSession();
  return (
    <PageShell
      eyebrow="Assistant · Intelligence"
      title="Know what's next in your niche."
      intro="A monthly, executive one-pager on what's trending and what comparable businesses are doing — focused on your exact services and market, so you can move first instead of catching up."
      note="The assistant searches the live web; treat figures as directional. Connect ANTHROPIC_API_KEY to enable it."
    >
      <IntelligenceReport />
    </PageShell>
  );
}
