import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/marketing/PageShell";
import ClientAdder from "@/components/agents/ClientAdder";
import { readSheetTab } from "@/lib/gviz";
import { overdueClients } from "@/lib/reengagement";
import { requireSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Customers - Bare Studios OS",
  description: "Client profiles, import tools, spend history, notification preferences, and rebooking reminders.",
};

export const revalidate = 300;

const sampleClients: Record<string, string>[] = [
  { Name: "Jasmine Rivera", Email: "jasmine@example.com", Phone: "(443) 555-0142", "Last visit": "2026-07-02", Service: "Classic lash fill", "Interval days": "21", Spent: "$1,240", SMS: "on", EmailOptIn: "on" },
  { Name: "Sandra Miller", Email: "sandra@example.com", Phone: "(443) 555-0188", "Last visit": "2026-04-01", Service: "Custom facial", "Interval days": "90", Spent: "$680", SMS: "on", EmailOptIn: "off" },
  { Name: "John Brooks", Email: "john@example.com", Phone: "(443) 555-0199", "Last visit": "2026-03-10", Service: "Barbering", "Interval days": "30", Spent: "$410", SMS: "off", EmailOptIn: "on" },
];

function money(row: Record<string, string>, index: number) {
  return row.Spent || row["Total Spent"] || row["Lifetime Spend"] || sampleClients[index % sampleClients.length].Spent;
}

export default async function ClientsPage() {
  const session = await requireSession();
  const allRows = await readSheetTab("Clients");
  const savedRows = allRows.filter((r) => (r.Salon || "").trim().toLowerCase() === session.salon.trim().toLowerCase());
  const rows = savedRows.length > 0 ? savedRows : sampleClients;
  const due = overdueClients(rows);

  return (
    <PageShell
      eyebrow="Customers"
      title="Client profiles."
      intro="Import customers from Vagaro or another platform, review each profile, and give the team the reminders they need before checkout or rebooking."
      note="CSV import is staged for the Google Sheets MVP. The next production step is mapping uploaded columns into the Clients tab automatically."
      wide
    >
      <div className="mb-6 flex flex-wrap gap-3">
        <Link href="/dashboard" className="rounded-sm border border-border px-5 py-3 text-[12px] uppercase tracking-[0.14em]">Back to calendar</Link>
        <Link href="/settings/notifications" className="rounded-sm border border-border px-5 py-3 text-[12px] uppercase tracking-[0.14em]">Notification settings</Link>
        <Link href="/settings/stripe" className="rounded-sm border border-border px-5 py-3 text-[12px] uppercase tracking-[0.14em]">Stripe card settings</Link>
      </div>

      <section className="mb-8 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-xl border border-border bg-surface p-6">
          <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted">Import customers</p>
          <p className="mt-3 font-serif text-2xl font-medium">Upload CSV from Vagaro</p>
          <p className="mt-3 text-sm leading-relaxed text-text-secondary">
            Export customers, appointment history, notes, tags, birthdays, opt-ins, and spend from the old platform, then import here during migration.
          </p>
          <div className="mt-5 rounded-md border border-dashed border-border bg-white p-5">
            <input type="file" accept=".csv" className="w-full text-sm" aria-label="Upload customer CSV" />
            <p className="mt-3 text-xs text-text-muted">Accepted columns: name, email, phone, last visit, service, spend, SMS opt-in, email opt-in, notes.</p>
          </div>
          <button className="mt-4 rounded-sm bg-gradient-brand px-6 py-3 text-[12px] uppercase tracking-[0.14em] text-white">Preview import mapping</button>
        </div>

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

      <section className="mb-8">
        <h2 className="mb-4 font-serif text-2xl font-medium">Client list</h2>
        <div className="grid gap-4 xl:grid-cols-3">
          {rows.slice(0, 12).map((client, index) => (
            <article key={`${client.Name}-${index}`} className="rounded-xl border border-border bg-surface p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-serif text-2xl font-medium">{client.Name || "Client"}</p>
                  <p className="mt-1 text-sm text-text-secondary">{client.Phone || "No phone"} · {client.Email || "No email"}</p>
                </div>
                <span className="rounded-full bg-success/15 px-3 py-1 text-[11px] text-success">active</span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-md border border-border bg-white p-3"><p className="text-text-muted">Spent</p><p className="font-medium">{money(client, index)}</p></div>
                <div className="rounded-md border border-border bg-white p-3"><p className="text-text-muted">Last visit</p><p className="font-medium">{client["Last visit"] || "Not imported"}</p></div>
                <div className="rounded-md border border-border bg-white p-3"><p className="text-text-muted">Last service</p><p className="font-medium">{client.Service || "Not imported"}</p></div>
                <div className="rounded-md border border-border bg-white p-3"><p className="text-text-muted">Card on file</p><p className="font-medium">Stripe setup</p></div>
              </div>

              <div className="mt-5 grid gap-2 text-sm">
                <label className="flex items-center justify-between rounded-md border border-border bg-white px-3 py-2">SMS notifications <input type="checkbox" defaultChecked={(client.SMS || "on") !== "off"} /></label>
                <label className="flex items-center justify-between rounded-md border border-border bg-white px-3 py-2">Email notifications <input type="checkbox" defaultChecked={(client.EmailOptIn || "on") !== "off"} /></label>
              </div>

              <div className="mt-5 rounded-md border border-border bg-surface-elevated p-4 text-sm leading-relaxed text-text-secondary">
                <p className="font-medium text-text-primary">Reminder</p>
                <p className="mt-1">Recommend a follow-up based on {client.Service || "last service"}; adjust automation rules in notification settings.</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <h2 className="mb-3 font-serif text-2xl font-medium">Add a client manually</h2>
      <ClientAdder />
    </PageShell>
  );
}
