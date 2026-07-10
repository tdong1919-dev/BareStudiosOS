import type { Metadata } from "next";
import SuiteApplicationForm from "@/components/booking/SuiteApplicationForm";
import PageShell from "@/components/marketing/PageShell";
import { BARE_STUDIOS } from "@/lib/bare-studios";

export const metadata: Metadata = {
  title: "Suite rental application — Bare Studios OS",
};

export default function SuiteRentalPage() {
  return (
    <PageShell
      eyebrow="Studio suites"
      title="Apply for a Bare Studios suite."
      intro="Capture renter inquiries directly inside Bare Studios OS so suite leads can be reviewed, assigned, and followed up without a separate form stack."
      note={`${BARE_STUDIOS.address} · ${BARE_STUDIOS.phone}`}
    >
      <SuiteApplicationForm />
    </PageShell>
  );
}
