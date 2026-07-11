import type { Metadata } from "next";
import PageShell from "@/components/marketing/PageShell";
import { countPaidEntitlements, getBusinessProfile, listLocations, listTeamMembers } from "@/lib/account-data";
import { requireSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Team & locations — Bare Studios OS",
};

const inputClass =
  "w-full rounded-md border border-border bg-white px-3 py-2.5 text-sm text-text-primary outline-none focus:border-text-primary placeholder:text-text-muted";

export default async function TeamSettingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireSession();
  const sp = await searchParams;
  const status = typeof sp.status === "string" ? sp.status : "";
  const profile = await getBusinessProfile(session.email, session.salon);
  const members = await listTeamMembers(session.email, session.salon);
  const locations = await listLocations(session.email, session.salon);
  const paidPrimarySeats = await countPaidEntitlements(session.email, session.salon, "team_member", profile?.primaryLocation || "Primary");
  const includedSeats = 3;
  const seatLimit = includedSeats + paidPrimarySeats;
  const primaryLocation = profile?.primaryLocation || profile?.businessName || session.salon || "Primary";

  const statusCopy: Record<string, string> = {
    "member-added": "Team member added.",
    "member-error": "Couldn't add that team member yet.",
    "needs-seat-checkout": "The first 3 team members are free. Add another paid seat before adding more.",
    "billing-success": "Checkout completed. The subscription will unlock the add-on once Stripe confirms it.",
    "billing-cancelled": "Checkout cancelled.",
    "stripe-missing": "Stripe is not configured yet.",
    "price-missing": "Add the Stripe price ID before starting checkout.",
    "location-saved": "Location details saved.",
    "location-error": "Couldn't save that location yet.",
  };

  return (
    <PageShell
      eyebrow="Settings"
      title="Team & locations."
      intro="Bare Studios OS includes 3 teammates per location. Extra teammates are $5/month, and every additional location starts its own monthly subscription."
      note="Cross-location availability and inventory visibility will be controlled by manager toggles per location."
      wide
    >
      {status && statusCopy[status] && (
        <p className="mb-5 rounded-md border border-border bg-surface-elevated px-4 py-3 text-sm text-text-secondary">{statusCopy[status]}</p>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-surface p-5">
          <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted">Included seats</p>
          <p className="mt-3 font-serif text-4xl">{includedSeats}</p>
          <p className="mt-2 text-sm text-text-secondary">Per location</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-5">
          <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted">Current team</p>
          <p className="mt-3 font-serif text-4xl">{members.length}</p>
          <p className="mt-2 text-sm text-text-secondary">Across saved locations</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-5">
          <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted">Paid add-ons</p>
          <p className="mt-3 font-serif text-4xl">{paidPrimarySeats}</p>
          <p className="mt-2 text-sm text-text-secondary">$5/month each</p>
        </div>
      </div>

      <section className="mt-8 rounded-xl border border-border bg-surface p-6">
        <h2 className="font-serif text-2xl">Business profile</h2>
        <p className="mt-2 text-sm text-text-secondary">Update the location details team members and customers see. Changes are staged here for the Google Sheets MVP.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <input className={inputClass} defaultValue={profile?.businessName || session.salon} aria-label="Business name" />
          <input className={inputClass} defaultValue={profile?.phone || ""} placeholder="Business phone" aria-label="Business phone" />
          <input className={`${inputClass} sm:col-span-2`} defaultValue={profile?.address || ""} placeholder="Business address" aria-label="Business address" />
          <input className={inputClass} defaultValue="Mon-Sat 9 AM-7 PM" placeholder="Business hours" aria-label="Business hours" />
          <select className={inputClass} defaultValue="Owner approval required" aria-label="Access policy">
            <option>Owner approval required</option>
            <option>Managers can invite team</option>
            <option>Owners only</option>
          </select>
        </div>
      </section>

      <section className="mt-8 rounded-xl border border-border bg-surface p-6">
        <h2 className="font-serif text-2xl">Add a team member</h2>
        <p className="mt-2 text-sm text-text-secondary">
          {members.length < seatLimit
            ? `${Math.max(0, seatLimit - members.length)} included or paid seat${seatLimit - members.length === 1 ? "" : "s"} available.`
            : "You are at the current seat limit for this location."}
        </p>
        {members.length < seatLimit ? (
          <form action="/api/team/member" method="POST" className="mt-5 grid gap-3 sm:grid-cols-2">
            <input className={inputClass} name="name" placeholder="Team member name" aria-label="Team member name" />
            <input className={inputClass} name="email" type="email" placeholder="Email" aria-label="Team member email" />
            <select className={inputClass} name="accessLevel" aria-label="Access level" defaultValue="Team member">
              <option>Owner</option>
              <option>Manager</option>
              <option>Provider</option>
              <option>Front desk</option>
              <option>Team member</option>
            </select>
            <input className={inputClass} name="location" defaultValue={primaryLocation} aria-label="Location" />
            <input className={inputClass} name="services" placeholder="Services provided" aria-label="Services provided" />
            <input className={inputClass} name="availableHours" placeholder="Available hours, e.g. Sun 9-7" aria-label="Available hours" />
            <input className={inputClass} name="requestedTimeOff" placeholder="Requested time off" aria-label="Requested time off" />
            <input className={inputClass} name="totalHoursWorked" placeholder="Total hours worked" aria-label="Total hours worked" />
            <input className={inputClass} name="totalRevenue" placeholder="Total revenue" aria-label="Total revenue" />
            <select className={inputClass} name="compensationType" aria-label="Compensation type" defaultValue="Commission">
              <option>Hourly</option>
              <option>Salary</option>
              <option>Commission</option>
              <option>Hourly + commission</option>
              <option>Salary + commission</option>
            </select>
            <input className={inputClass} name="hourlyRate" placeholder="Hourly rate" aria-label="Hourly rate" />
            <input className={inputClass} name="salary" placeholder="Salary amount" aria-label="Salary amount" />
            <input className={inputClass} name="commissionRate" placeholder="Commission rate, e.g. 70%" aria-label="Commission rate" />
            <select className={inputClass} name="payDuration" aria-label="Pay duration" defaultValue="Biweekly">
              <option>Weekly</option>
              <option>Biweekly</option>
              <option>Semimonthly</option>
              <option>Monthly</option>
            </select>
            <button className="sm:col-span-2 rounded-sm bg-gradient-brand px-6 py-3.5 text-[12px] uppercase tracking-[0.14em] text-white">
              Add team member
            </button>
          </form>
        ) : (
          <form action="/api/billing/checkout" method="POST" className="mt-5">
            <input type="hidden" name="type" value="team_member" />
            <input type="hidden" name="quantity" value="1" />
            <input type="hidden" name="location" value={primaryLocation} />
            <button className="rounded-sm bg-gradient-brand px-6 py-3.5 text-[12px] uppercase tracking-[0.14em] text-white">
              Add $5/month teammate seat
            </button>
          </form>
        )}
      </section>

      {members.length > 0 && (
        <section className="mt-8 rounded-xl border border-border bg-surface p-6">
          <h2 className="font-serif text-2xl">Team profiles</h2>
          <p className="mt-2 text-sm text-text-secondary">Owners can review access, services, hours, time off, revenue, and compensation. These fields feed the Staff and TeamMembers sheets for payroll support.</p>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {members.map((member) => (
              <article key={`${member.email}-${member.location}`} className="rounded-lg border border-border bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-serif text-2xl font-medium">{member.name}</p>
                    <p className="text-sm text-text-secondary">{member.email} · {member.location}</p>
                  </div>
                  <span className="rounded-full bg-success/15 px-3 py-1 text-[11px] text-success">{member.status}</span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <input className={inputClass} defaultValue={member.accessLevel || member.role} aria-label="Access level" />
                  <input className={inputClass} defaultValue={member.services} placeholder="Services provided" aria-label="Services provided" />
                  <input className={inputClass} defaultValue={member.availableHours} placeholder="Available hours" aria-label="Available hours" />
                  <input className={inputClass} defaultValue={member.requestedTimeOff} placeholder="Requested time off" aria-label="Requested time off" />
                  <input className={inputClass} defaultValue={member.totalHoursWorked} placeholder="Total hours worked" aria-label="Total hours worked" />
                  <input className={inputClass} defaultValue={member.totalRevenue} placeholder="Total revenue" aria-label="Total revenue" />
                  <select className={inputClass} defaultValue={member.compensationType || "Commission"} aria-label="Compensation type">
                    <option>Hourly</option><option>Salary</option><option>Commission</option><option>Hourly + commission</option><option>Salary + commission</option>
                  </select>
                  <input className={inputClass} defaultValue={member.payDuration || "Biweekly"} aria-label="Pay duration" />
                  <input className={inputClass} defaultValue={member.hourlyRate} placeholder="Hourly rate" aria-label="Hourly rate" />
                  <input className={inputClass} defaultValue={member.salary} placeholder="Salary" aria-label="Salary" />
                  <input className={inputClass} defaultValue={member.commissionRate} placeholder="Commission rate" aria-label="Commission rate" />
                </div>
                <p className="mt-3 text-xs text-text-muted">Profile edit fields are staged here; saving changes will append updated payroll records in the next workflow pass.</p>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="mt-8 rounded-xl border border-border bg-surface p-6">
        <h2 className="font-serif text-2xl">Locations</h2>
        <p className="mt-2 text-sm text-text-secondary">Edit address, phone, hours, manager, and cross-location visibility for each location. The newest saved row is treated as the current location record.</p>
        <div className="mt-4 space-y-4">
          <form action="/api/location" method="POST" className="rounded-md border border-border bg-surface-elevated p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-medium">{primaryLocation}</p>
              <span className="rounded-full bg-success/15 px-3 py-1 text-xs text-success">Primary location · included</span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <input className={inputClass} name="location" defaultValue={primaryLocation} aria-label="Location name" />
              <input className={inputClass} name="phone" defaultValue={profile?.phone || ""} placeholder="Location phone" aria-label="Location phone" />
              <input className={`${inputClass} sm:col-span-2`} name="address" defaultValue={profile?.address || ""} placeholder="Location address" aria-label="Location address" />
              <input className={inputClass} name="hours" defaultValue="Mon-Sat 9 AM-7 PM" placeholder="Location hours" aria-label="Location hours" />
              <input className={inputClass} name="managerEmail" placeholder="Manager email" aria-label="Manager email" />
              <label className="flex items-center gap-2 rounded-md border border-border bg-white px-3 py-2.5 text-sm text-text-secondary">
                <input type="checkbox" name="shareAvailability" value="on" defaultChecked /> Share availability across locations
              </label>
              <label className="flex items-center gap-2 rounded-md border border-border bg-white px-3 py-2.5 text-sm text-text-secondary">
                <input type="checkbox" name="shareInventory" value="on" defaultChecked /> Share inventory counts
              </label>
              <input type="hidden" name="billingStatus" value="included" />
              <textarea className={`${inputClass} min-h-24 sm:col-span-2`} name="notes" placeholder="Internal location notes" aria-label="Location notes" />
              <button className="rounded-sm bg-gradient-brand px-5 py-3 text-[12px] uppercase tracking-[0.14em] text-white sm:col-span-2">
                Save location details
              </button>
            </div>
          </form>
          {locations.map((location) => (
            <form key={`${location.location}-${location.managerEmail}-${location.address}-${location.phone}`} action="/api/location" method="POST" className="rounded-md border border-border bg-surface-elevated p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-medium">{location.location}</p>
                <span className="rounded-full bg-white px-3 py-1 text-xs text-text-secondary">{location.billingStatus}</span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <input className={inputClass} name="location" defaultValue={location.location} aria-label="Location name" />
                <input className={inputClass} name="phone" defaultValue={location.phone} placeholder="Location phone" aria-label="Location phone" />
                <input className={`${inputClass} sm:col-span-2`} name="address" defaultValue={location.address} placeholder="Location address" aria-label="Location address" />
                <input className={inputClass} name="hours" defaultValue={location.hours || ""} placeholder="Location hours" aria-label="Location hours" />
                <input className={inputClass} name="managerEmail" defaultValue={location.managerEmail} placeholder="Manager email" aria-label="Manager email" />
                <label className="flex items-center gap-2 rounded-md border border-border bg-white px-3 py-2.5 text-sm text-text-secondary">
                  <input type="checkbox" name="shareAvailability" value="on" defaultChecked={location.shareAvailability !== "off"} /> Share availability across locations
                </label>
                <label className="flex items-center gap-2 rounded-md border border-border bg-white px-3 py-2.5 text-sm text-text-secondary">
                  <input type="checkbox" name="shareInventory" value="on" defaultChecked={location.shareInventory !== "off"} /> Share inventory counts
                </label>
                <input type="hidden" name="billingStatus" value={location.billingStatus || "included"} />
                <textarea className={`${inputClass} min-h-24 sm:col-span-2`} name="notes" defaultValue={location.notes || ""} placeholder="Internal location notes" aria-label="Location notes" />
                <button className="rounded-sm bg-gradient-brand px-5 py-3 text-[12px] uppercase tracking-[0.14em] text-white sm:col-span-2">
                  Save location details
                </button>
              </div>
            </form>
          ))}
        </div>
        <form action="/api/billing/checkout" method="POST" className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
          <input type="hidden" name="type" value="location" />
          <input type="hidden" name="quantity" value="1" />
          <input className={inputClass} name="location" placeholder="New location name" aria-label="New location name" />
          <button className="rounded-sm bg-gradient-brand px-6 py-3.5 text-[12px] uppercase tracking-[0.14em] text-white">
            Start location checkout
          </button>
        </form>
      </section>
    </PageShell>
  );
}
