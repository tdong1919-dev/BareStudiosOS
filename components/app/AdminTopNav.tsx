import Link from "next/link";
import type { Session } from "@/lib/auth";

const nav = [
  { href: "/dashboard", label: "Calendar" },
  { href: "/wallet?salon=Bare%20Studios", label: "Checkout" },
  { href: "/clients", label: "Customers" },
  { href: "/store?salon=Bare%20Studios", label: "Retail" },
  { href: "/promotions", label: "Marketing" },
  { href: "/reports", label: "Reports" },
  { href: "/settings/team", label: "Settings" },
];

const more = [
  { href: "/forms", label: "Forms/SOAPs" },
  { href: "/billing", label: "Invoices, refunds, IOUs" },
  { href: "/growth", label: "Gift cards & memberships" },
  { href: "/imports", label: "Import & cleanup" },
  { href: "/settings/services", label: "Service menu" },
  { href: "/messaging", label: "Messaging/billing" },
  { href: "/payroll", label: "Payroll/time card" },
  { href: "/assistants", label: "Assistance hub" },
];

export default function AdminTopNav({ session, active = "" }: { session: Session; active?: string }) {
  return (
    <header className="sticky top-0 z-30 border-b border-[#2f2f2f] bg-[#30302f] text-white">
      <div className="flex h-14 items-center gap-2 px-3 sm:px-4">
        <Link href="/dashboard" className="mr-1 shrink-0 font-serif text-2xl">B</Link>
        <nav className="flex min-w-0 flex-1 gap-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none]">
          {nav.map((item) => {
            const isActive = active ? item.label.toLowerCase().startsWith(active.toLowerCase()) : false;
            return (
              <Link key={item.href} href={item.href} className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ${isActive ? "bg-white/15" : "hover:bg-white/10"}`}>
                {item.label}
              </Link>
            );
          })}
          <details className="group relative shrink-0">
            <summary className="cursor-pointer list-none whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium hover:bg-white/10">More</summary>
            <div className="absolute right-0 top-11 z-40 w-64 overflow-hidden rounded-lg border border-black/10 bg-white py-2 text-[#30302f] shadow-xl">
              {more.map((item) => <Link key={item.href} href={item.href} className="block px-4 py-2.5 text-sm hover:bg-black/[0.04]">{item.label}</Link>)}
            </div>
          </details>
          <Link href="/book" className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ${active.toLowerCase().startsWith("booking") ? "bg-white/15" : "hover:bg-white/10"}`}>
            Booking site
          </Link>
        </nav>
        <Link href="/settings/stripe" className="hidden shrink-0 rounded-md bg-white px-3 py-2 text-xs font-medium text-[#30302f] sm:block">Connect Stripe</Link>
        <div className="hidden max-w-[180px] truncate text-sm lg:block">{session.salon || "Bare Studios"}</div>
      </div>
    </header>
  );
}
