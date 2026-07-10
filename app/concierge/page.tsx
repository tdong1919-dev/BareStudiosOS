import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/marketing/PageShell";
import ConciergeComposer from "@/components/concierge/ConciergeComposer";
import { requireSession } from "@/lib/auth";
import { readSheetTab } from "@/lib/gviz";

export const metadata: Metadata = { title: "AI Concierge Inbox — Bare Studios OS" };
export const revalidate = 30;

const sampleRows = [
  { Created: "Today", Channel: "Phone call", "Client Name": "New client", Contact: "(443) 555-0190", Message: "Asked for lash extension availability this Sunday.", Intent: "Booking", Status: "New", "Assigned To": "AI Concierge" },
  { Created: "Today", Channel: "Website chat", "Client Name": "Jasmine", Contact: "jasmine@example.com", Message: "Asked whether dermaplaning is good before an event.", Intent: "Pricing", Status: "New", "Assigned To": "Ciara" },
  { Created: "Yesterday", Channel: "SMS", "Client Name": "Taylor", Contact: "(443) 555-0112", Message: "Wanted to reschedule a facial.", Intent: "Reschedule", Status: "Follow up", "Assigned To": "Front desk" },
];

export default async function ConciergePage() {
  await requireSession();
  const rows = await readSheetTab("ConciergeInbox");
  const inbox = rows.length > 0 ? rows : sampleRows;

  return (
    <PageShell
      eyebrow="AI Concierge"
      title="Calls, chats, texts, and DMs in one inbox."
      intro="Route Retell phone calls, website chat, SMS, and social messages into the Bare Studios dashboard. The concierge can answer common questions, capture booking intent, and hand off anything that needs a human."
      note={rows.length === 0 ? "Showing sample inbox items. Add a ConciergeInbox tab or connect the webhook to see live records." : undefined}
      wide
    >
      <div className="mb-6 flex flex-wrap gap-3">
        <Link href="/settings/concierge" className="rounded-sm bg-gradient-brand px-6 py-3 text-[12px] uppercase tracking-[0.14em] text-white">
          Configure concierge
        </Link>
        <Link href="/book" className="rounded-sm border border-text-primary/30 px-6 py-3 text-[12px] uppercase tracking-[0.14em]">
          Test booking flow
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="overflow-hidden rounded-lg border border-border">
          {inbox.slice(0, 30).map((row, index) => (
            <div key={`${row.Created}-${index}`} className={`bg-surface p-5 ${index > 0 ? "border-t border-border" : ""}`}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-serif text-xl font-medium">{row["Client Name"] || "Guest"}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.12em] text-text-muted">{row.Channel || "Channel"} · {row.Intent || "General"}</p>
                </div>
                <span className="rounded-full bg-success/15 px-3 py-1 text-[11px] text-success">{row.Status || "New"}</span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">{row.Message || "No message captured."}</p>
              <p className="mt-3 text-xs text-text-muted">{row.Contact || "No contact"} · Assigned to {row["Assigned To"] || "AI Concierge"}</p>
            </div>
          ))}
        </div>
        <ConciergeComposer />
      </div>
    </PageShell>
  );
}
