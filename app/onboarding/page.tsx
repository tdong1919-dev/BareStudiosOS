import type { Metadata } from "next";
import { redirect } from "next/navigation";
import OnboardingForm from "@/components/auth/OnboardingForm";
import PageShell from "@/components/marketing/PageShell";
import { getBusinessProfile } from "@/lib/account-data";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Business setup — Bare Studios OS",
};

export default async function OnboardingPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const existing = await getBusinessProfile(session.email, session.salon);
  if (existing) redirect("/account");

  return (
    <PageShell
      eyebrow="Business setup"
      title="Tell us how Bare Studios runs."
      intro="Before the dashboard opens, capture the business details, feature priorities, team count, and location needs we will use for the Vagaro migration."
    >
      <OnboardingForm defaultBusinessName={session.salon || "Bare Studios"} />
    </PageShell>
  );
}
