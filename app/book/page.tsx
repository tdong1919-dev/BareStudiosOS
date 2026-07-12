import type { Metadata } from "next";
import Image from "next/image";
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
      <div className="mb-6 grid gap-3 md:grid-cols-[1fr_0.72fr]">
        <div className="relative min-h-[260px] overflow-hidden rounded-xl border border-border bg-linen">
          <Image src="/images/bare-studios/bare-studios-service-room.jpg" alt="Bare Studios treatment room" fill sizes="(max-width: 768px) 100vw, 58vw" className="object-cover" />
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-1">
          <div className="relative min-h-32 overflow-hidden rounded-xl border border-border bg-linen">
            <Image src="/images/bare-studios/bare-studios-gallery-02.jpg" alt="Bare Studios appointment space" fill sizes="(max-width: 768px) 50vw, 34vw" className="object-cover" />
          </div>
          <div className="relative min-h-32 overflow-hidden rounded-xl border border-border bg-linen">
            <Image src="/images/bare-studios/bare-studios-gallery-04.jpg" alt="Bare Studios beauty service" fill sizes="(max-width: 768px) 50vw, 34vw" className="object-cover" />
          </div>
        </div>
      </div>
      <BareBookingFlow />
    </PageShell>
  );
}
