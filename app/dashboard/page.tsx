import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/marketing/PageShell";
import { requireSession } from "@/lib/auth";
import { getBusinessProfile } from "@/lib/account-data";
import { readSheetTab } from "@/lib/gviz";

export const metadata: Metadata = {
  title: "Dashboard — Bare Studios OS",
};

const assistantLinks = [
  { href: "/assistants", label: "Assistants hub", note: "All agents, reports, and chats" },
  { href: "/concierge", label: "AI Concierge inbox", note: "Phone calls, chats, SMS, DMs" },
  { href: "/financials", label: "Financial Assistant", note: "Payroll, commissions, margin" },
  { href: "/inventory", label: "Inventory Assistant", note: "Low stock and reorder drafts" },
  { href: "/reviews", label: "Reviews Assistant", note: "Google, Vagaro, review replies" },
  { href: "/intelligence", label: "Industry Intelligence", note: "Market trends and one-page execs" },
  { href: "/clients", label: "Retention Assistant", note: "Lapsed clients and rebooking" },
  { href: "/wallet?salon=Bare%20Studios", label: "Client wallet", note: "Balances, loads, lower-fee checkout" },
  { href: "/settings/stripe", label: "Stripe payments", note: "Connect Stripe and wallet billing" },
  { href: "/settings/concierge", label: "Concierge settings", note: "Retell AI setup and routing" },
  { href: "/store?salon=Bare%20Studios", label: "Retail store", note: "Product sales and inventory" },
  { href: "/book", label: "Client booking", note: "Public appointment flow" },
];

export default async function DashboardPage() {
  const session = await requireSession();
  const profile = await getBusinessProfile(session.email, session.salon);
  const [bookings, concierge, wallet, reviews, inventory] = await Promise.all([
    readSheetTab("BookingRequests"),
    readSheetTab("ConciergeInbox"),
    readSheetTab("Wallet"),
    readSheetTab("Reviews"),
    readSheetTab("Inventory"),
  ]);

  const openBookings = bookings.filter((r) => (r.Status || "requested").toLowerCase() !== "confirmed").length;
  const newConcierge = concierge.filter((r) => (r.Status || "New").toLowerCase() === "new").length;
  const reviewCount = reviews.length;
  const lowStock = inventory.length;

  return (
    <PageShell
      eyebrow="Bare Studios dashboard"
      title={profile?.businessName || "Bare Studios command center"}
      intro="Run booking, concierge, assistants, wallet payments, Stripe, reviews, inventory, and team workflows from one place. Google Sheets is the database for this Bare Studios MVP."
      wide
    >
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {[
          [openBookings, "booking requests"],
          [newConcierge, "new concierge items"],
          [reviewCount, "reviews tracked"],
          [wallet.length, "wallet ledger rows"],
          [lowStock, "inventory flags"],
        ].map(([value, label]) => (
          <div key={label} className="rounded-lg border border-border bg-surface p-5">
            <p className="font-serif text-4xl font-medium">{value}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.14em] text-text-muted">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-3">
        {assistantLinks.map((item) => (
          <Link key={item.href} href={item.href} className="bg-surface p-5 transition-colors hover:bg-surface-elevated">
            <p className="font-serif text-xl font-medium">{item.label}</p>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">{item.note}</p>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
