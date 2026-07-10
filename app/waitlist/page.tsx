import type { Metadata } from "next";
import PageShell from "@/components/marketing/PageShell";
import WaitlistForm from "@/components/agents/WaitlistForm";

export const metadata: Metadata = {
  title: "Get notified of openings — Bare Studios OS",
  description: "Join the list to hear first when a last-minute appointment opens up.",
};

export default async function WaitlistPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const salon = typeof sp.salon === "string" ? sp.salon : "";

  return (
    <PageShell
      eyebrow="Client · Waitlist"
      title="Grab last-minute openings."
      intro={`Booked out? Join ${salon || "the salon's"} list and we'll alert you the moment a cancellation opens a spot — by email${"" /* SMS when configured */} — so you can snap it up.`}
      note="You can opt out anytime. SMS alerts require the salon to connect Twilio."
    >
      <WaitlistForm salon={salon} />
    </PageShell>
  );
}
