import type { Metadata } from "next";
import PageShell from "@/components/marketing/PageShell";
import { requireSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Caption Generator - Bare Studios OS" };

export default async function CaptionsPage() {
  await requireSession();
  return (
    <PageShell eyebrow="Marketing" title="Caption generator." intro="Generate social captions from Brand Brain, reports, client segments, and active promotions." wide>
      <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-xl border border-border bg-surface p-5">
          <label className="text-xs uppercase tracking-[0.14em] text-text-muted">Platform</label>
          <select className="mt-2 w-full rounded-md border border-border bg-white px-3 py-2 text-sm" defaultValue="Instagram">
            {["Instagram", "Facebook", "YouTube", "Google Business Profile", "TikTok coming soon"].map((item) => <option key={item}>{item}</option>)}
          </select>
          <label className="mt-4 block text-xs uppercase tracking-[0.14em] text-text-muted">Goal</label>
          <textarea className="mt-2 min-h-28 w-full rounded-md border border-border bg-white px-3 py-2 text-sm" defaultValue="Fill last-minute facial openings and invite clients to book a BARE SKN Signature Facial." />
          <button className="mt-4 rounded-sm bg-gradient-brand px-5 py-3 text-[12px] uppercase tracking-[0.14em] text-white">Generate demo caption</button>
        </div>
        <div className="rounded-xl border border-border bg-surface p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-text-muted">Generated draft</p>
          <p className="mt-4 text-sm leading-7 text-text-secondary">
            Your skin does not need a reset button. It needs a little time, the right hands, and a treatment that meets it where it is. We have limited facial openings this week for BARE SKN Signature Facials. Request your appointment and leave feeling lighter, brighter, and cared for.
          </p>
        </div>
      </section>
    </PageShell>
  );
}
