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
            <select className={inputClass} name="role" aria-label="Role" defaultValue="Team member">
              <option>Owner</option>
              <option>Manager</option>
              <option>Team member</option>
            </select>
            <input className={inputClass} name="location" defaultValue={primaryLocation} aria-label="Location" />
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

      <section className="mt-8 rounded-xl border border-border bg-surface p-6">
        <h2 className="font-serif text-2xl">Locations</h2>
        <div className="mt-4 space-y-3">
          <div className="rounded-md border border-border bg-surface-elevated p-4">
            <p className="font-medium">{primaryLocation}</p>
            <p className="mt-1 text-sm text-text-secondary">Primary location · included</p>
          </div>
          {locations.map((location) => (
            <div key={`${location.location}-${location.managerEmail}`} className="rounded-md border border-border bg-surface-elevated p-4">
              <p className="font-medium">{location.location}</p>
              <p className="mt-1 text-sm text-text-secondary">
                {location.billingStatus} · Availability sharing {location.shareAvailability} · Inventory sharing {location.shareInventory}
              </p>
            </div>
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
