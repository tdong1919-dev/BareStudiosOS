import type { Metadata } from "next";
import PageShell from "@/components/marketing/PageShell";
import PromotionBuilder from "@/components/agents/PromotionBuilder";
import { requireSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Rewards & promotions — Bare Studios OS",
  description: "Build and schedule rewards and promotions — birthdays, Mother's Day, holidays, win-backs — targeted to the right clients.",
};

export default async function PromotionsPage() {
  await requireSession();
  return (
    <PageShell
      eyebrow="Growth · Rewards & promotions"
      title="Keep clients coming back."
      intro="Build a promotion in a minute — start from a birthday, Mother's Day, holiday, or win-back template — choose exactly who receives it and when, and schedule it for the future. Everything saves to your Promotions tab."
      note="Scheduled sends fire automatically once the campaign scheduler is connected. For now, promotions are saved and dated so nothing is forgotten."
    >
      <PromotionBuilder />
    </PageShell>
  );
}
