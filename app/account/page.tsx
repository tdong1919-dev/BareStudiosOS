import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import PageShell from "@/components/marketing/PageShell";
import { getSession } from "@/lib/auth";
import { getBusinessProfile } from "@/lib/account-data";

export const metadata: Metadata = {
  title: "Dashboard — Bare Studios OS",
};

export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const profile = await getBusinessProfile(session.email, session.salon);
  if (!profile) redirect("/onboarding");

  const salonQ = encodeURIComponent(session.salon);
  const links = [
    { href: `/migration`, label: "Vagaro migration", note: "Import checklist & cutover" },
    { href: `/book`, label: "Client booking", note: "Bare-owned booking flow" },
    { href: `/suite-rental`, label: "Suite applications", note: "Renter inquiry flow" },
    { href: `/settings/team`, label: "Team & locations", note: "Seats, managers, locations" },
    { href: `/settings/stripe`, label: "Connect Stripe", note: "Link your own Stripe" },
    { href: `/wallet?salon=${salonQ}`, label: "Client wallet", note: "Loads & balances" },
    { href: `/store?salon=${salonQ}`, label: "Online store", note: "Retail & checkout" },
    { href: `/financials`, label: "Financial Assistant", note: "Payroll & commissions" },
    { href: `/inventory`, label: "Inventory Assistant", note: "Low stock & reorder" },
    { href: `/intelligence`, label: "Industry intelligence", note: "Monthly briefing" },
    { href: `/clients`, label: "Re-engagement", note: "Overdue to rebook" },
    { href: `/openings`, label: "Fill openings", note: "Alert your waitlist" },
    { href: `/promotions`, label: "Rewards & promos", note: "Build & schedule" },
    { href: `/reviews`, label: "Reviews Assistant", note: "Replies & alerts" },
  ];

  return (
    <PageShell
      eyebrow="Dashboard"
      title={profile.businessName || session.salon || "Bare Studios"}
      intro={`Signed in as ${session.email}. Everything for your salon, in one place.`}
    >
      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="bg-surface p-5 transition-colors hover:bg-surface-elevated">
            <p className="font-serif text-lg font-medium">{l.label}</p>
            <p className="mt-1 text-sm text-text-secondary">{l.note}</p>
          </Link>
        ))}
      </div>

      <form action="/api/auth/logout" method="POST" className="mt-8">
        <button type="submit" className="rounded-sm border border-text-primary/30 px-6 py-2.5 text-[12px] uppercase tracking-[0.14em] text-text-primary hover:bg-black/[0.04]">
          Sign out
        </button>
      </form>
    </PageShell>
  );
}
