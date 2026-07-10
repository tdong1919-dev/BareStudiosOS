import type { Metadata } from "next";
import PageShell from "@/components/marketing/PageShell";
import ClientAdder from "@/components/agents/ClientAdder";
import { readSheetTab } from "@/lib/gviz";
import { overdueClients } from "@/lib/reengagement";
import { requireSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Re-engagement — Bare Studios OS",
  description: "A daily list of clients who are overdue to rebook, so your team can fill the calendar before chairs sit empty.",
};

export const revalidate = 300;

export default async function ClientsPage() {
  const session = await requireSession();
  const allRows = await readSheetTab("Clients");
  const rows = allRows.filter((r) => (r.Salon || "").trim().toLowerCase() === session.salon.trim().toLowerCase());
  const due = overdueClients(rows);

  return (
    <PageShell
      eyebrow="Assistant · Retention"
      title="Bring lapsed clients back."
      intro="Every day, the assistant surfaces clients who are overdue to rebook — based on each service's natural interval — so your front desk has a ready list to reach out to. A daily email digest can go to whoever runs outreach."
      note="Clients live in a Clients tab (fed by your booking system later; add them below for now). The daily digest runs at /api/reengagement/digest with CRON_SECRET. Reading the list needs SHEETS_SHEET_ID + link-view sharing."
    >
      <div className="mb-8">
        <div className="mb-4 flex items-baseline gap-3">
          <span className="font-serif text-4xl font-medium">{due.length}</span>
          <span className="text-sm text-text-secondary">due to rebook</span>
        </div>

        {due.length === 0 ? (
          <p className="rounded-xl border border-border bg-surface-elevated px-5 py-6 text-sm text-text-secondary">
            No one is overdue yet — add clients below (or connect your booking data) and they&apos;ll appear here once their rebook window passes.
          </p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border">
            {due.slice(0, 50).map((c, i) => (
              <div key={i} className={`flex items-center justify-between gap-3 bg-surface px-5 py-3 ${i > 0 ? "border-t border-border" : ""}`}>
                <div>
                  <p className="text-sm font-medium">{c.name}</p>
                  <p className="text-xs text-text-secondary">{c.service || "service"} · {c.daysSince}d since last visit{c.phone ? ` · ${c.phone}` : ""}</p>
                </div>
                <span className="rounded-full bg-[#9A7B4F]/12 px-3 py-1 text-[11px] text-[#7a6038]">{c.overdueBy}d overdue</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <h2 className="mb-3 font-serif text-2xl font-medium">Add a client</h2>
      <ClientAdder />
    </PageShell>
  );
}
