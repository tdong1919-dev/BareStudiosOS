import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/marketing/PageShell";

export const metadata: Metadata = {
  title: "Vagaro migration — Bare Studios OS",
};

const MIGRATION_GROUPS = [
  {
    title: "Booking foundation",
    items: [
      "Service categories, durations, deposits, cancellation rules",
      "Artist/staff availability and business hours",
      "Client-facing booking links from barestudios.site",
    ],
  },
  {
    title: "Client data",
    items: [
      "Client profiles, visit history, notes, forms, preferences",
      "Upcoming appointments and waitlist requests",
      "Wallet balances, packages, rewards, and gift card equivalents",
    ],
  },
  {
    title: "Operations",
    items: [
      "Product catalog, vendors, inventory counts, reorder points",
      "Team roles, manager access, and multi-location permissions",
      "Stripe subscriptions for locations and paid teammate seats",
    ],
  },
  {
    title: "Reputation & marketing",
    items: [
      "Google Business reviews and legacy booking reviews",
      "Review reply rules and manager escalation for low-star reviews",
      "Rebooking, last-minute opening, and retail replenishment automations",
    ],
  },
];

const CUTOVER_STEPS = [
  "Run Bare Studios OS booking in parallel with Vagaro for internal tests.",
  "Import service menu, artists, business hours, and booking rules.",
  "Replace barestudios.site Vagaro buttons with /book.",
  "Confirm first real appointments inside Bare Studios OS.",
  "Move retention, wallet, inventory, and review workflows one by one.",
];

export default function MigrationPage() {
  return (
    <PageShell
      eyebrow="Migration"
      title="Switch Bare Studios from Vagaro."
      intro="Use this page as the operating checklist for replacing the current external booking handoff with Bare Studios OS without losing client, team, service, or inventory context."
      wide
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {MIGRATION_GROUPS.map((group) => (
          <section key={group.title} className="rounded-xl border border-border bg-surface p-5">
            <h2 className="font-serif text-2xl">{group.title}</h2>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-text-secondary">
              {group.items.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <section className="mt-8 rounded-xl border border-border bg-surface-elevated p-6">
        <h2 className="font-serif text-3xl">Cutover sequence</h2>
        <div className="mt-5 grid gap-px overflow-hidden rounded-lg border border-border bg-border">
          {CUTOVER_STEPS.map((step, index) => (
            <div key={step} className="flex gap-4 bg-surface px-5 py-4">
              <span className="font-serif text-3xl text-text-muted">{index + 1}</span>
              <p className="pt-1 text-sm leading-relaxed text-text-secondary">{step}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/book" className="rounded-sm bg-gradient-brand px-6 py-3 text-[12px] uppercase tracking-[0.14em] text-white">
            Test booking flow
          </Link>
          <Link href="/settings/team" className="rounded-sm border border-text-primary/30 px-6 py-3 text-[12px] uppercase tracking-[0.14em]">
            Set team and locations
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
