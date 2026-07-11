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
