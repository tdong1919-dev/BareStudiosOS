import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/marketing/PageShell";
import NotificationRuleBuilder from "@/components/settings/NotificationRuleBuilder";
import { requireSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Notification Settings - Bare Studios OS",
  description: "Customer and team notification routing for Bare Studios OS.",
};

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

      <NotificationRuleBuilder />

      <section className="mt-6 rounded-xl border border-border bg-surface p-6">
        <p className="font-serif text-2xl font-medium">Client recommendation mapping</p>
        <p className="mt-2 text-sm text-text-secondary">These rules decide what appears inside each client profile based on the service they receive.</p>
        <div className="mt-5 overflow-hidden rounded-lg border border-border">
          {[
            ["Lashes / fills / extensions", "Recommend lash cleanser today and pre-book the next fill before they leave."],
            ["Facials / skin / dermaplaning / peel", "Check skin goals, recommend SPF or serum, and schedule the next facial window."],
            ["Barbering / haircuts", "Ask about product needs and offer the next maintenance cut before checkout."],
            ["Brows / waxing / lamination", "Confirm preferred shape notes and suggest a 4-6 week touch-up."],
          ].map(([service, recommendation], i) => (
            <div key={service} className={`grid gap-3 bg-white p-4 text-sm md:grid-cols-[0.8fr_1.2fr] ${i > 0 ? "border-t border-border" : ""}`}>
              <input className="rounded-md border border-border px-3 py-2" defaultValue={service} aria-label={`${service} service keywords`} />
              <input className="rounded-md border border-border px-3 py-2" defaultValue={recommendation} aria-label={`${service} recommendation`} />
            </div>
          ))}
        </div>
      </section>

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
