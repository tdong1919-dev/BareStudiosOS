/**
 * POST /api/complaint — a salon client files a complaint in-app instead of
 * cornering the front desk. The ticket is saved to a "Complaints" tab and the
 * owner/manager is emailed. A separate cron (/api/complaint/reping) re-pings on
 * still-open tickets after 24h.
 */
import { NextRequest, NextResponse } from "next/server";
import { appendSheetRow } from "@/lib/sheets";
import { sendHelpEmail } from "@/lib/notify";

const HEADERS = ["Ticket", "Opened", "Status", "Name", "Email", "Phone", "Salon", "Severity", "Message", "Resolved"];

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim();
  const phone = (body.phone ?? "").trim();
  const salon = (body.salonName ?? body.salon_name ?? "").trim();
  const severity = (body.severity ?? "").trim();
  const message = (body.message ?? "").trim();

  if (!message) {
    return NextResponse.json({ error: "Please describe what happened." }, { status: 400 });
  }

  const ticket = "C" + Date.now().toString(36).toUpperCase();
  const sheet = await appendSheetRow("Complaints", HEADERS, [
    ticket, new Date().toISOString(), "open", name, email, phone, salon, severity, message, "",
  ]);

  const notify = await sendHelpEmail({
    name: name || "Salon client",
    email: email || "no-reply@unknown.invalid",
    phone: phone || null,
    page_name: salon || null,
    concern_type: `Complaint · ${severity || "unspecified"}`,
    message:
      `New complaint — ticket ${ticket}\n\n` +
      `From: ${name || "anonymous"} (${email || "no email"}, ${phone || "no phone"})\n` +
      `Severity: ${severity || "unspecified"}\n\n` +
      `${message}\n\n` +
      `Mark the ticket "resolved" in the Complaints tab once it's handled — otherwise you'll get a 24h reminder.`,
  }).catch(() => ({ ok: false as const }));

  if (!sheet.ok && !notify.ok) {
    return NextResponse.json({ error: "Couldn't file your complaint — please call the salon." }, { status: 502 });
  }

  return NextResponse.json({ ok: true, ticket, sheet, notification: notify });
}
