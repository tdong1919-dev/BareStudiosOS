import { NextRequest, NextResponse } from "next/server";
import { appendTeamMember, countPaidEntitlements, listTeamMembers } from "@/lib/account-data";
import { appendSheetRow } from "@/lib/sheets";
import { sendPlainEmail } from "@/lib/notify";
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
  const accessLevel = String(form.get("accessLevel") || "Team member").trim();
  const role = accessLevel;
  const location = String(form.get("location") || "Primary").trim();
  const services = form.getAll("services").map((service) => String(service).trim()).filter(Boolean).join(", ");
  const availableHours = String(form.get("availableHours") || "").trim();
  const requestedTimeOff = String(form.get("requestedTimeOff") || "").trim();
  const totalHoursScheduledWeekly = String(form.get("totalHoursScheduledWeekly") || "").trim();
  const compensationType = String(form.get("compensationType") || "Commission").trim();
  const hourlyRate = String(form.get("hourlyRate") || "").trim();
  const salary = String(form.get("salary") || "").trim();
  const commissionRate = String(form.get("commissionRate") || "").trim();
  const payDuration = String(form.get("payDuration") || "Biweekly").trim();

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
    accessLevel,
    services,
    availableHours,
    requestedTimeOff,
    totalHoursScheduledWeekly,
    compensationType,
    hourlyRate,
    salary,
    commissionRate,
    payDuration,
    status: "invited",
    billingStatus: members.filter((member) => member.location === location).length < FREE_TEAMMATES_PER_LOCATION ? "included" : "paid",
  });

  if (saved.ok) {
    await appendSheetRow("Users", ["Created", "Email", "Salon", "Role", "Status"], [
      new Date().toISOString(),
      email.toLowerCase(),
      session.salon,
      accessLevel,
      "invited",
    ]);

    await appendSheetRow("Staff", [
      "Salon",
      "Updated",
      "Name",
      "Role",
      "Services",
      "Available Hours",
      "Total Hours Scheduled Weekly",
      "Compensation Type",
      "Hourly Rate",
      "Salary",
      "Commission %",
      "Pay Duration",
      "Notes",
    ], [
      session.salon,
      new Date().toISOString(),
      name,
      role,
      services,
      availableHours,
      totalHoursScheduledWeekly,
      compensationType,
      hourlyRate,
      salary,
      commissionRate,
      payDuration,
      `Access: ${accessLevel}; time off: ${requestedTimeOff || "none"}`,
    ]);

    await sendPlainEmail({
      to: email,
      subject: `You're invited to ${session.salon} on Bare Studios OS`,
      text:
        `${name},\n\n${session.salon} invited you to Bare Studios OS. Go to ${base}/login, choose Create Account, use this email address, and finish creating your password.\n\nYour starting access level: ${accessLevel}.`,
    });
  }

  return NextResponse.redirect(`${base}/settings/team?status=${saved.ok ? "member-added" : "member-error"}`, { status: 303 });
}
