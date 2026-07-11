import type { Metadata } from "next";
import Link from "next/link";
import AdminTopNav from "@/components/app/AdminTopNav";
import { requireSession } from "@/lib/auth";
import { getBusinessProfile, listLocations } from "@/lib/account-data";
import { readSheetTab } from "@/lib/gviz";

export const metadata: Metadata = {
  title: "Dashboard - Bare Studios OS",
};


const staff = ["Ciara", "Na", "Andy", "Cindy"];
const week = ["Mon 6", "Tue 7", "Wed 8", "Thu 9", "Fri 10", "Sat 11", "Sun 12"];
const times = ["7 AM", "8 AM", "9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM", "7 PM", "8 PM", "9 PM", "10 PM", "11 PM", "12 AM", "1 AM", "2 AM", "3 AM", "4 AM", "5 AM", "6 AM", "7 AM"];
const appointments = [
  { day: 1, row: 1, title: "Classic fill", client: "Jasmine R.", staff: "Na", color: "bg-[#d9eadf]" },
  { day: 2, row: 3, title: "Custom facial", client: "Sandra M.", staff: "Ciara", color: "bg-[#ead9c3]" },
  { day: 4, row: 5, title: "Barber consult", client: "John B.", staff: "Andy", color: "bg-[#d8e3ef]" },
  { day: 6, row: 2, title: "Lash lift + tint", client: "Maya L.", staff: "Ciara", color: "bg-[#eadce7]" },
];

function monthDays() {
  return [28, 29, 30, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 1];
}

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

          <div className="mt-5 rounded-lg border border-border bg-white p-4">
            <div className="mb-3 flex items-center justify-between text-sm font-medium"><span>July 2026</span><span>‹ ›</span></div>
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-text-muted">
              {["S", "M", "T", "W", "TH", "F", "S"].map((d) => <span key={d}>{d}</span>)}
              {monthDays().map((day, i) => <span key={`${day}-${i}`} className={`rounded-full py-1 ${day === 10 ? "bg-[#30302f] text-white" : i < 3 || i > 33 ? "text-text-muted/50" : ""}`}>{day}</span>)}
            </div>
          </div>

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

        <section className="overflow-hidden bg-white">
          <div className="flex flex-col gap-3 border-b border-border px-5 py-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <button className="rounded-md bg-[#30302f] px-4 py-2 text-sm font-medium text-white">Today</button>
              <button className="rounded-md border border-border px-3 py-2 text-sm">‹</button>
              <button className="rounded-md border border-border px-3 py-2 text-sm">›</button>
              <h2 className="text-lg font-semibold">Jul 6, 2026 - Jul 12, 2026</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/clients" className="rounded-md border border-border px-4 py-2 text-sm">Customers: {clients.length}</Link>
              <Link href="/dashboard" className="rounded-md border border-border px-4 py-2 text-sm">Week</Link>
              <Link href="/book" className="rounded-md bg-[#30302f] px-4 py-2 text-sm font-medium text-white">Add appointment</Link>
            </div>
          </div>

          <div className="grid grid-cols-2 border-b border-border bg-[#fbfaf7] text-sm sm:grid-cols-4">
            <div className="border-r border-border p-3"><strong>{openBookings}</strong><span className="ml-2 text-text-secondary">booking requests</span></div>
            <div className="border-r border-border p-3"><strong>{newConcierge}</strong><span className="ml-2 text-text-secondary">inbox alerts</span></div>
            <div className="border-r border-border p-3"><strong>{inventory.length}</strong><span className="ml-2 text-text-secondary">inventory flags</span></div>
            <div className="p-3"><strong>Stripe</strong><span className="ml-2 text-text-secondary">ready to connect</span></div>
          </div>

          <div className="overflow-auto">
            <div className="min-w-[980px]">
              <div className="grid grid-cols-[72px_repeat(7,1fr)] border-b border-border bg-white text-center text-sm font-medium">
                <div className="border-r border-border p-3" />
                {week.map((day) => <div key={day} className="border-r border-border p-3 last:border-r-0">{day}</div>)}
              </div>
              <div className="relative grid grid-cols-[72px_repeat(7,1fr)]">
                <div className="bg-[#fbfaf7]">
                  {times.map((time) => <div key={time} className="h-20 border-b border-r border-border p-2 text-right text-xs font-medium text-text-secondary">{time}</div>)}
                </div>
                {week.map((day) => <div key={day} className="border-r border-border last:border-r-0">{times.map((time) => <div key={time} className="h-20 border-b border-border bg-white" />)}</div>)}
                {appointments.map((appt) => (
                  <div
                    key={`${appt.day}-${appt.row}-${appt.client}`}
                    className={`absolute rounded-md border border-black/10 p-2 text-xs shadow-sm ${appt.color}`}
                    style={{ left: `calc(72px + ((100% - 72px) / 7) * ${appt.day} + 8px)`, top: `${appt.row * 80 + 12}px`, width: "calc((100% - 72px) / 7 - 16px)", height: "64px" }}
                  >
                    <p className="font-semibold">{appt.title}</p>
                    <p>{appt.client}</p>
                    <p className="text-text-secondary">{appt.staff}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
