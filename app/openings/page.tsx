import type { Metadata } from "next";
import PageShell from "@/components/marketing/PageShell";
import OpeningPoster from "@/components/agents/OpeningPoster";
import { requireSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Fill an opening — Bare Studios OS",
  description: "Post a last-minute opening and instantly alert clients on your waitlist.",
};

export default async function OpeningsPage() {
  await requireSession();
  return (
    <PageShell
      eyebrow="Retention · Fill openings"
      title="Don't let a cancellation sit empty."
      intro="When a client cancels last minute, post the opening here and every opted-in client on your waitlist is alerted instantly — so the chair gets filled instead of sitting empty."
      note="Clients opt in at /waitlist?salon=YourName. Email alerts work today; SMS needs Twilio."
    >
      <OpeningPoster />
    </PageShell>
  );
}
