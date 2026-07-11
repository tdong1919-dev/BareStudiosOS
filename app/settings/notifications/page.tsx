import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/marketing/PageShell";
import { requireSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Notification Settings - Bare Studios OS",
  description: "Customer and team notification routing for Bare Studios OS.",
};

const customerRules = [
  ["Appointment confirmations", "App, text, email", "Immediately after booking"],
  ["Appointment reminders", "Text and email", "48 hours and 4 hours before"],
  ["Last-minute openings", "Text first, app second", "When an opening is posted"],
  ["Review request", "Text or email", "2 hours after checkout"],
  ["Wallet balance low", "App and email", "After checkout if balance is below visit average"],
  ["Rebook prompt", "Text", "Before the client leaves or 2 weeks before due date"],
];

const teamRules = [
  ["Booking requests", "Front desk + assigned provider", "Instant"],
  ["Concierge handoff", "Manager on duty", "Instant"],
  ["Low inventory", "Manager + purchasing owner", "Daily digest or urgent"],
  ["Retail stock below threshold", "Owner + inventory manager", "Instant or daily digest"],
  ["Upsell cue", "Assigned provider", "At check-in and checkout"],
  ["Reviews under 3 stars", "Owner + manager", "Instant"],
  ["Payroll/financial report", "Owner", "Weekly"],
];

export default async function NotificationSettingsPage() {
  await requireSession();

  return (
    <PageShell
      eyebrow="Settings"
      title="Notification routing."
      intro="Control what customers and team members receive, where they receive it, and when Bare Studios OS should send or surface each automated reminder."
      wide
    >
      <div className="mb-6 flex flex-wrap gap-3">
        <Link href="/dashboard" className="rounded-sm border border-border px-5 py-3 text-[12px] uppercase tracking-[0.14em]">Back to calendar</Link>
        <Link href="/settings/team" className="rounded-sm border border-border px-5 py-3 text-[12px] uppercase tracking-[0.14em]">Team and locations</Link>
        <Link href="/settings/concierge" className="rounded-sm border border-border px-5 py-3 text-[12px] uppercase tracking-[0.14em]">Concierge setup</Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-surface p-6">
          <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted">Customer notifications</p>
          <div className="mt-5 overflow-hidden rounded-lg border border-border">
            {customerRules.map(([event, channels, timing], i) => (
              <div key={event} className={`grid gap-3 bg-white p-4 text-sm sm:grid-cols-[1fr_0.8fr_1fr] ${i > 0 ? "border-t border-border" : ""}`}>
                <label className="flex items-start gap-3 font-medium"><input className="mt-1" type="checkbox" defaultChecked /> {event}</label>
                <select className="rounded-md border border-border bg-white px-3 py-2" defaultValue={channels} aria-label={`${event} channels`}>
                  <option>{channels}</option>
                  <option>App only</option>
                  <option>Text only</option>
                  <option>Email only</option>
                  <option>Text and email</option>
                  <option>Off</option>
                </select>
                <input className="rounded-md border border-border px-3 py-2" defaultValue={timing} aria-label={`${event} timing`} />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-border bg-surface p-6">
          <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted">Team notifications</p>
          <div className="mt-5 overflow-hidden rounded-lg border border-border">
            {teamRules.map(([event, recipient, timing], i) => (
              <div key={event} className={`grid gap-3 bg-white p-4 text-sm sm:grid-cols-[1fr_0.9fr_0.8fr] ${i > 0 ? "border-t border-border" : ""}`}>
                <label className="flex items-start gap-3 font-medium"><input className="mt-1" type="checkbox" defaultChecked /> {event}</label>
                <input className="rounded-md border border-border px-3 py-2" defaultValue={recipient} aria-label={`${event} recipients`} />
                <select className="rounded-md border border-border bg-white px-3 py-2" defaultValue={timing} aria-label={`${event} timing`}>
                  <option>{timing}</option>
                  <option>Instant</option>
                  <option>Daily digest</option>
                  <option>Weekly report</option>
                  <option>Off</option>
                </select>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-xl border border-border bg-surface-elevated p-6">
        <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <p className="font-serif text-2xl font-medium">Inventory reminder default</p>
            <p className="mt-2 text-sm text-text-secondary">Retail reminders trigger when quantity drops below this number unless a product has its own threshold.</p>
          </div>
          <div className="flex gap-2">
            <input className="w-28 rounded-md border border-border bg-white px-3 py-2 text-sm" type="number" defaultValue={10} aria-label="Default low-stock threshold" />
            <label className="flex items-center gap-2 rounded-md border border-border bg-white px-3 py-2 text-sm"><input type="checkbox" defaultChecked /> On</label>
          </div>
        </div>
        <p className="font-serif text-2xl font-medium">Automation reminders shown on client profiles</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {["Suggest purchase new lash cleanser and book 2 weeks out before client leaves.", "Invite client back for facial if it has been 90 days since last skin service.", "Ask client to leave an honest review within 24 hours after a positive checkout."].map((rule) => (
            <div key={rule} className="rounded-md border border-border bg-white p-4 text-sm leading-relaxed text-text-secondary">{rule}</div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
