/**
 * POST /api/openings — the salon posts a last-minute opening; opted-in waitlist
 * clients are alerted. Owner-only (salon from session). Emails opted-in clients
 * (SMS would go via Twilio once configured — not wired here).
 */
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { readSheetTab } from "@/lib/gviz";
import { appendSheetRow } from "@/lib/sheets";
import { sendPlainEmail } from "@/lib/notify";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Please sign in to post an opening." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const service = (body.service ?? "").trim();
  const when = (body.when ?? "").trim();
  const note = (body.note ?? "").trim();
  if (!service || !when) {
    return NextResponse.json({ error: "Add the service and the time." }, { status: 400 });
  }

  // Log the opening.
  await appendSheetRow("Openings", ["Posted", "Salon", "Service", "When", "Note"], [
    new Date().toISOString(), session.salon, service, when, note,
  ]);

  // Find opted-in waitlist clients for this salon (with an email).
  const rows = await readSheetTab("Waitlist");
  const recipients = rows.filter(
    (r) => (r.Salon || "").trim().toLowerCase() === session.salon.trim().toLowerCase() && (r.Email || "").includes("@"),
  );

  let notified = 0;
  for (const r of recipients.slice(0, 100)) {
    const email = String(r.Email || "").trim();
    const res = await sendPlainEmail({
      to: email,
      subject: `Opening at ${session.salon}: ${service}`,
      text:
        `Hi ${r.Name || "there"},\n\n` +
        `A last-minute opening just came up at ${session.salon}:\n\n` +
        `${service} - ${when}\n${note ? note + "\n" : ""}\n` +
        `Reply or book online to grab it before someone else does.`,
    }).catch(() => ({ ok: false as const }));
    if (res.ok) notified++;
  }

  return NextResponse.json({ ok: true, waitlist: recipients.length, notified });
}
