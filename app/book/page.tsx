import type { Metadata } from "next";
import BareBookingFlow from "@/components/booking/BareBookingFlow";
import PageShell from "@/components/marketing/PageShell";
import { BARE_STUDIOS } from "@/lib/bare-studios";

export const metadata: Metadata = {
  title: "Book an Appointment — Bare Studios",
  description: "Request a Bare Studios service appointment in Downtown Bel Air.",
};

export default function BookPage() {
  return (
    <PageShell
      eyebrow="Book Bare Studios"
      title="Request your appointment."
      intro={`Choose a service at ${BARE_STUDIOS.name}, share your preferred date and time, and the studio will follow up to confirm your visit.`}
      note={`${BARE_STUDIOS.address} · ${BARE_STUDIOS.phone}`}
      wide
    >
      <BareBookingFlow />
    </PageShell>
  );
}
