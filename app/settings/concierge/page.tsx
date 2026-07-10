import type { Metadata } from "next";
import PageShell from "@/components/marketing/PageShell";
import { requireSession } from "@/lib/auth";
import { conciergeConfigured } from "@/lib/concierge";

export const metadata: Metadata = { title: "Concierge Settings — Bare Studios OS" };

export default async function ConciergeSettingsPage() {
  await requireSession();
  const configured = conciergeConfigured();
  const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://your-vercel-domain.com"}/api/retell/webhook`;

  return (
    <PageShell
      eyebrow="Settings · AI Concierge"
      title="Connect phone calls and chats to the dashboard."
      intro="Use Retell AI, or a similar voice agent, as Bare Studios' receptionist. Calls and chat summaries can be logged to Google Sheets and displayed in the concierge inbox."
      wide
    >
      <div className="grid gap-5 md:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-xl border border-border bg-surface p-6">
          <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted">Connection status</p>
          <p className="mt-3 font-serif text-3xl font-medium">{configured ? "Retell env ready" : "Retell setup needed"}</p>
          <p className="mt-4 text-sm leading-relaxed text-text-secondary">
            Add RETELL_API_KEY and RETELL_AGENT_ID in Vercel when the Retell account is ready. Point Retell call events to the webhook below so every call summary lands in ConciergeInbox.
          </p>
          <div className="mt-5 rounded-md border border-border bg-surface-elevated p-4">
            <p className="text-[11px] uppercase tracking-[0.14em] text-text-muted">Webhook URL</p>
            <p className="mt-2 break-all text-sm text-text-primary">{webhookUrl}</p>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-surface-elevated p-6">
          <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted">Concierge playbook</p>
          <div className="mt-4 grid gap-3 text-sm leading-relaxed text-text-secondary">
            <p>1. Answer service questions for barbering, lashes, brows, facials, waxing, and career/rental inquiries.</p>
            <p>2. Capture client name, phone/email, service interest, preferred provider, date, and time.</p>
            <p>3. Send barbering requests to Andy at (443) 559-2037.</p>
            <p>4. Send career, suite, and chair rental requests to Don at (443) 564-0030.</p>
            <p>5. Escalate complaints, refund requests, and low-star reviews to the owner or manager.</p>
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-xl border border-border bg-surface p-6">
        <p className="font-serif text-2xl font-medium">Google Sheets tabs used for Bare Studios</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 md:grid-cols-3">
          {["BookingRequests", "ConciergeInbox", "Wallet", "Stripe", "Reviews", "Inventory", "Clients", "Staff", "Payroll"].map((tab) => (
            <span key={tab} className="rounded-md border border-border bg-white px-3 py-2 text-sm text-text-secondary">{tab}</span>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
