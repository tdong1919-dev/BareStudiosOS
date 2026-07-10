/**
 * POST /api/waitlist — a client opts in to be alerted about last-minute openings
 * at a salon. Public (clients aren't logged in). Stored in a Waitlist tab.
 */
import { NextRequest, NextResponse } from "next/server";
import { appendSheetRow } from "@/lib/sheets";

const HEADERS = ["Joined", "Salon", "Name", "Email", "Phone", "SMS opt-in"];

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const salon = (body.salon ?? "").trim();
  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim();
  const phone = (body.phone ?? "").trim();
  const sms = body.sms ? "yes" : "no";

  if (!salon || (!email && !phone)) {
    return NextResponse.json({ error: "A salon and an email or phone are required." }, { status: 400 });
  }

  const sheet = await appendSheetRow("Waitlist", HEADERS, [
    new Date().toISOString().slice(0, 10), salon, name, email, phone, sms,
  ]);
  if (!sheet.ok) {
    return NextResponse.json({ error: "Couldn't add you to the list — try again." }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
