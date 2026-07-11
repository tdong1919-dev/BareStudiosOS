import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/marketing/PageShell";
import ClientAdder from "@/components/agents/ClientAdder";
import ClientCsvImporter from "@/components/clients/ClientCsvImporter";
import ClientDirectory from "@/components/clients/ClientDirectory";
import { readSheetTab } from "@/lib/gviz";
import { overdueClients } from "@/lib/reengagement";
import { requireSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Customers - Bare Studios OS",
  description: "Client profiles, import tools, spend history, notification preferences, and rebooking reminders.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

const sampleClients: Record<string, string>[] = [
  { Name: "Jasmine Rivera", Email: "jasmine@example.com", Phone: "(443) 555-0142", "Last visit": "2026-07-02", Service: "Classic lash fill", "Interval days": "21", Spent: "$1,240", SMS: "on", EmailOptIn: "on" },
  { Name: "Sandra Miller", Email: "sandra@example.com", Phone: "(443) 555-0188", "Last visit": "2026-04-01", Service: "Custom facial", "Interval days": "90", Spent: "$680", SMS: "on", EmailOptIn: "off" },
  { Name: "John Brooks", Email: "john@example.com", Phone: "(443) 555-0199", "Last visit": "2026-03-10", Service: "Barbering", "Interval days": "30", Spent: "$410", SMS: "off", EmailOptIn: "on" },
];

const actionButtonClass = "rounded-sm border border-border bg-surface-elevated px-5 py-3 text-[12px] uppercase tracking-[0.14em] text-text-primary transition-colors hover:bg-linen";

export default async function ClientsPage() {
  const session = await requireSession();
  const allRows = await readSheetTab("Clients");
  const savedRows = allRows.filter((r) => (r.Salon || "").trim().toLowerCase() === session.salon.trim().toLowerCase());
  const rows = savedRows.length > 0 ? savedRows : sampleClients;
  const usingSampleClients = savedRows.length === 0;
  const due = overdueClients(rows);

  return (
    <PageShell
      eyebrow="Customers"
      title="Client profiles."
      intro="Import customers from Vagaro or another platform, review each profile, and give the team the reminders they need before checkout or rebooking."
      note="Batch CSV import is staged for the Google Sheets MVP. Recommendation mapping is controlled from Settings."
      wide
    >
      <div className="mb-6 flex flex-wrap gap-3">
        <ClientCsvImporter className={actionButtonClass} />
        <Link href="/settings/stripe" className={actionButtonClass}>Stripe card settings</Link>
        <Link href="/settings/notifications" className={actionButtonClass}>Notification settings</Link>
      </div>

      {usingSampleClients && (
        <p className="mb-6 rounded-md border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
          Live client rows are not loading yet. If you just imported clients, redeploy the latest Google Apps Script from <code>docs/sheets-webhook.gs</code> so the app can read the Clients tab through the same database connection it writes to.
        </p>
      )}

      <section className="mb-8">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-surface p-5"><p className="font-serif text-4xl">{rows.length}</p><p className="text-xs uppercase tracking-[0.14em] text-text-muted">clients</p></div>
          <div className="rounded-xl border border-border bg-surface p-5"><p className="font-serif text-4xl">{due.length}</p><p className="text-xs uppercase tracking-[0.14em] text-text-muted">due to rebook</p></div>
          <div className="rounded-xl border border-border bg-surface p-5"><p className="font-serif text-4xl">3</p><p className="text-xs uppercase tracking-[0.14em] text-text-muted">active reminders</p></div>
          <div className="rounded-xl border border-border bg-surface-elevated p-5 sm:col-span-3">
            <p className="font-medium">Team cue example</p>
            <p className="mt-2 text-sm text-text-secondary">Recommendation: suggest purchase new lash cleanser and book 2 weeks out before client leaves.</p>
          </div>
        </div>
      </section>

      <ClientDirectory rows={rows} />

      <h2 className="mb-3 font-serif text-2xl font-medium">Add a client manually</h2>
      <ClientAdder />
    </PageShell>
  );
}
