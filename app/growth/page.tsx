import type { Metadata } from "next";
import PageShell from "@/components/marketing/PageShell";
import { requireSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Gift Cards & Memberships - Bare Studios OS" };

const products = [
  ["Gift card", "$100 Glow Gift", "Redeemable toward services or retail", "$3,400 sold"],
  ["Package", "3 Facial Series", "Buy 3 facials with bonus LED therapy", "18 active"],
  ["Membership", "Bare Monthly", "Monthly facial, retail perk, priority openings", "42 members"],
  ["Package", "Lash Fill Bundle", "Prepay 4 fills with cleanser add-on", "27 active"],
];

export default async function GrowthPage() {
  await requireSession();
  return (
    <PageShell eyebrow="Customers" title="Gift cards, packages, and memberships." intro="Sell prepaid value, recurring memberships, and service bundles that connect to checkout and each client profile." wide>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface p-5"><p className="font-serif text-4xl">$9.8k</p><p className="text-xs uppercase tracking-[0.14em] text-text-muted">prepaid liability</p></div>
        <div className="rounded-xl border border-border bg-surface p-5"><p className="font-serif text-4xl">87</p><p className="text-xs uppercase tracking-[0.14em] text-text-muted">active passes</p></div>
        <div className="rounded-xl border border-border bg-surface p-5"><p className="font-serif text-4xl">42</p><p className="text-xs uppercase tracking-[0.14em] text-text-muted">memberships</p></div>
      </div>
      <section className="mt-8 rounded-xl border border-border bg-surface p-6">
        <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-serif text-2xl">Catalog</h2><button className="rounded-sm bg-gradient-brand px-5 py-3 text-[12px] uppercase tracking-[0.14em] text-white">Create offer</button></div>
        <div className="mt-5 overflow-hidden rounded-lg border border-border">
          {products.map(([type, name, detail, metric], i) => <div key={name} className={`grid gap-2 bg-white p-4 text-sm md:grid-cols-4 ${i > 0 ? 'border-t border-border' : ''}`}><strong>{type}</strong><span>{name}</span><span>{detail}</span><span>{metric}</span></div>)}
        </div>
      </section>
    </PageShell>
  );
}
