import type { Metadata } from "next";
import SuiteApplicationForm from "@/components/booking/SuiteApplicationForm";
import PageShell from "@/components/marketing/PageShell";
import { BARE_STUDIOS } from "@/lib/bare-studios";

export const metadata: Metadata = {
  title: "Studio Suite Rentals — Bare Studios",
};

export default function SuiteRentalPage() {
  return (
    <PageShell
      eyebrow="Studio suites"
      title="Apply for a Bare Studios suite."
      intro="Independent beauty professionals can apply for a private suite inside Bare Studios, a supportive Downtown Bel Air studio community built for collaboration, freedom, and growth."
      note={`${BARE_STUDIOS.address} · ${BARE_STUDIOS.phone}`}
    >
      <SuiteApplicationForm />
    </PageShell>
  );
}
