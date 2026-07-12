import type { Metadata } from "next";
import Link from "next/link";
import AdminTopNav from "@/components/app/AdminTopNav";
import InteractiveCalendar from "@/components/dashboard/InteractiveCalendar";
import MiniMonthCalendar from "@/components/dashboard/MiniMonthCalendar";
import { requireSession } from "@/lib/auth";
import { getBusinessProfile, listLocations } from "@/lib/account-data";
import { readSheetTab } from "@/lib/gviz";

export const metadata: Metadata = {
  title: "Dashboard - Bare Studios OS",
};

const staff = ["Ciara", "Na", "Andy", "Cindy"];

export default async function DashboardPage() {
  const session = await requireSession();
  const profile = await getBusinessProfile(session.email, session.salon);
  const locations = await listLocations(session.email, session.salon);
  const [bookings, concierge, clients, inventory] = await Promise.all([
    readSheetTab("BookingRequests"),
    readSheetTab("ConciergeInbox"),
    readSheetTab("Clients"),
    readSheetTab("Inventory"),
  ]);

  const businessName = profile?.businessName || session.salon || "Bare Studios";
  const locationOptions = [profile?.primaryLocation || businessName, ...locations.map((location) => location.location)].filter(Boolean);
  const uniqueLocations = Array.from(new Set(locationOptions));
  const openBookings = bookings.filter((r) => (r.Status || "requested").toLowerCase() !== "confirmed").length;
  const newConcierge = concierge.filter((r) => (r.Status || "New").toLowerCase() === "new").length;

  return (
    <main className="min-h-screen bg-[#f7f5f1] text-text-primary">
      <AdminTopNav session={session} active="Calendar" />

      <section className="border-b border-border bg-white px-5 py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted">Location</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <select className="rounded-md border border-border bg-white px-3 py-2 text-sm font-medium" defaultValue={uniqueLocations[0]} aria-label="Select location">
                {uniqueLocations.map((location) => <option key={location}>{location}</option>)}
              </select>
              <span className="text-sm text-text-secondary">Single-location today. Multi-location selection is ready as Bare Studios grows.</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/book" className="rounded-md border border-border bg-white px-4 py-2 text-sm font-medium">Request appointment</Link>
            <Link href="/wallet?salon=Bare%20Studios" className="rounded-md bg-[#171717] px-4 py-2 text-sm font-medium text-white">Checkout</Link>
            <Link href="/clients" className="rounded-md border border-border bg-white px-4 py-2 text-sm font-medium">Add customer</Link>
            <Link href="/store?salon=Bare%20Studios" className="rounded-md border border-border bg-white px-4 py-2 text-sm font-medium">Retail</Link>
          </div>
        </div>
      </section>

      <div className="grid min-h-[calc(100vh-112px)] lg:grid-cols-[260px_1fr]">
        <aside className="border-r border-border bg-[#fbfaf7] p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Calendar</h1>
            <span className="rounded-full bg-[#30302f] px-2 py-1 text-xs text-white">Today</span>
          </div>

          <MiniMonthCalendar />

          <div className="mt-5 rounded-lg border border-border bg-white p-4">
            <p className="mb-3 text-[11px] uppercase tracking-[0.14em] text-text-muted">Calendars</p>
            <div className="space-y-3 text-sm">
              {staff.map((person, i) => (
                <label key={person} className="flex items-center gap-2"><input type="checkbox" defaultChecked={i < 2} /> {person}</label>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-2 text-sm">
            <Link href="/assistants" className="rounded-md border border-border bg-white p-3"><strong>Assistance hub</strong><br /><span className="text-text-secondary">Reports, chats, assistant actions</span></Link>
            <Link href="/concierge" className="rounded-md border border-border bg-white p-3"><strong>Inbox</strong><br /><span className="text-text-secondary">{newConcierge} new concierge items</span></Link>
            <Link href="/settings/notifications" className="rounded-md border border-border bg-white p-3"><strong>Notifications</strong><br /><span className="text-text-secondary">Customer and team routing</span></Link>
          </div>
        </aside>

        <InteractiveCalendar clientsCount={clients.length} openBookings={openBookings} newConcierge={newConcierge} inventoryCount={inventory.length} />
      </div>
    </main>
  );
}
