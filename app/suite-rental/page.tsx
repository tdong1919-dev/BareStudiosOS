import type { Metadata } from "next";
import PageShell from "@/components/marketing/PageShell";
import { BARE_STUDIOS } from "@/lib/bare-studios";

export const metadata: Metadata = {
  title: "Rent + Careers — Bare Studios",
};

export default function SuiteRentalPage() {
  const careersDigits = BARE_STUDIOS.careersPhone.replace(/[^0-9]/g, "");

  return (
    <PageShell
      eyebrow="Rent + Careers"
      title="Build your beauty career at Bare Studios."
      intro="For all career, suite, and chair rental opportunities, contact Don directly. Bare Studios welcomes hair dressers, barbers, cosmetologists, estheticians, and beauty professionals looking for a supportive studio home."
      note={`${BARE_STUDIOS.address} · ${BARE_STUDIOS.phone}`}
      publicPage
      wide
    >
      <div className="grid gap-5 md:grid-cols-[1fr_0.9fr]">
        <section className="rounded-xl border border-border bg-surface p-6">
          <p className="text-[11px] uppercase tracking-[0.2em] text-text-muted">Contact Don</p>
          <h2 className="mt-3 font-serif text-3xl font-medium">Career, suite, and chair rental inquiries</h2>
          <p className="mt-4 text-sm leading-relaxed text-text-secondary">
            Text or call Don for current availability, chair rental options, suite opportunities, and commission-based
            roles inside Bare Studios.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={`tel:${careersDigits}`}
              className="rounded-sm bg-gradient-brand px-6 py-3 text-[12px] uppercase tracking-[0.14em] text-white"
            >
              Call Don
            </a>
            <a
              href={`sms:${careersDigits}`}
              className="rounded-sm border border-text-primary/30 px-6 py-3 text-[12px] uppercase tracking-[0.14em]"
            >
              Text Don
            </a>
          </div>
          <p className="mt-5 font-serif text-2xl">{BARE_STUDIOS.careersPhone}</p>
        </section>

        <section className="rounded-xl border border-border bg-surface-elevated p-6">
          <p className="text-[11px] uppercase tracking-[0.2em] text-text-muted">Commission starts at</p>
          <p className="mt-3 font-serif text-6xl font-medium">70/30</p>
          <p className="mt-4 text-sm leading-relaxed text-text-secondary">
            Hair dressers, barbers, cosmetologists, and estheticians start at 70/30 commission. Service providers keep
            70% plus tips.
          </p>
          <div className="mt-6 grid gap-2 text-sm text-text-secondary">
            <p>Hair dressers</p>
            <p>Barbers</p>
            <p>Cosmetologists</p>
            <p>Estheticians</p>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
