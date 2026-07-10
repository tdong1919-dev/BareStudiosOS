import { NextRequest, NextResponse } from "next/server";
import { appendTeamMember, countPaidEntitlements, listTeamMembers } from "@/lib/account-data";
import { getSession } from "@/lib/auth";
import { appBaseUrl } from "@/lib/stripe";

const FREE_TEAMMATES_PER_LOCATION = 3;

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const session = await getSession();
  const base = appBaseUrl(request.nextUrl.origin);
  if (!session) return NextResponse.redirect(`${base}/login`, { status: 303 });

  const form = await request.formData();
  const name = String(form.get("name") || "").trim();
  const email = String(form.get("email") || "").trim();
  const role = String(form.get("role") || "Team member").trim();
  const location = String(form.get("location") || "Primary").trim();

  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.redirect(`${base}/settings/team?status=member-error`, { status: 303 });
  }

  const members = await listTeamMembers(session.email, session.salon);
  const paidSeats = await countPaidEntitlements(session.email, session.salon, "team_member", location);
  const seatLimit = FREE_TEAMMATES_PER_LOCATION + paidSeats;

  if (members.filter((member) => member.location === location).length >= seatLimit) {
    return NextResponse.redirect(`${base}/settings/team?status=needs-seat-checkout`, { status: 303 });
  }

  const saved = await appendTeamMember({
    ownerEmail: session.email,
    salon: session.salon,
    location,
    name,
    email,
    role,
    status: "active",
    billingStatus: members.filter((member) => member.location === location).length < FREE_TEAMMATES_PER_LOCATION ? "included" : "paid",
  });

  return NextResponse.redirect(`${base}/settings/team?status=${saved.ok ? "member-added" : "member-error"}`, { status: 303 });
}
