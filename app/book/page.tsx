import type { Metadata } from "next";
import BareBookingFlow from "@/components/booking/BareBookingFlow";
import PageShell from "@/components/marketing/PageShell";
import { BARE_STUDIOS } from "@/lib/bare-studios";

export const metadata: Metadata = {
  title: "Book — Bare Studios OS",
  description: "Bare Studios booking powered by the Bare Studios OS.",
};

export default function BookPage() {
  return (
    <PageShell
      eyebrow="Book Bare Studios"
      title="Request your appointment."
      intro={`Choose a service at ${BARE_STUDIOS.name}. This booking flow is the first owned replacement for the current external Vagaro handoff.`}
      note={`${BARE_STUDIOS.address} · ${BARE_STUDIOS.phone}`}
      wide
    >
      <BareBookingFlow />
    </PageShell>
  );
}
