import type { Metadata } from "next";
import PageShell from "@/components/marketing/PageShell";
import { requireSession } from "@/lib/auth";
import { readSheetTab } from "@/lib/gviz";

export const metadata: Metadata = { title: "Billing - Bare Studios OS" };

const metrics = [["Open invoices", "7"], ["Failed payments", "3"], ["Refunds pending", "2"], ["IOUs", "$420"]];
const rows = [
  ["Invoice", "Jasmine Rivera", "$225", "Due today"],
  ["Refund", "Sandra Miller", "$40", "Manager review"],
  ["Failed payment", "John Brooks", "$78", "Retry card"],
  ["IOU", "Maya Lee", "$120", "Collect next visit"],
];

export default async function BillingPage() {
  await requireSession();
  await readSheetTab("Billing");
  return (
    <PageShell eyebrow="Checkout" title="Invoices, refunds, failed payments, and IOUs." intro="Track the money issues that happen around checkout so nothing disappears between visits, wallets, Stripe, and client balances." wide>
      <div className="grid gap-3 sm:grid-cols-4">{metrics.map(([label, value]) => <div key={label} className="rounded-xl border border-border bg-surface p-5"><p className="font-serif text-3xl">{value}</p><p className="text-xs uppercase tracking-[0.14em] text-text-muted">{label}</p></div>)}</div>
      <section className="mt-8 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-xl border border-border bg-surface p-6">
          <h2 className="font-serif text-2xl">Create billing item</h2>
          <div className="mt-5 grid gap-3">
            {['Invoice','Refund customer','Failed payment follow-up','IOU'].map((item) => <button key={item} className="rounded-md border border-border bg-white px-4 py-3 text-left text-sm hover:bg-surface-elevated">{item}</button>)}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-surface p-6">
          <h2 className="font-serif text-2xl">Billing worklist</h2>
          <div className="mt-4 overflow-hidden rounded-lg border border-border">
            {rows.map(([type, client, amount, status], i) => <div key={`${type}-${client}`} className={`grid gap-2 bg-white p-4 text-sm sm:grid-cols-4 ${i > 0 ? 'border-t border-border' : ''}`}><strong>{type}</strong><span>{client}</span><span>{amount}</span><span>{status}</span></div>)}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
