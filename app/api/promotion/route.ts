/**
 * POST /api/promotion — create or schedule a rewards/promotion campaign.
 * Saved to a "Promotions" tab; the owner gets a confirmation email. A daily
 * cron could later read this tab and fire scheduled sends (out of scope here).
 */
import { NextRequest, NextResponse } from "next/server";
import { appendSheetRow } from "@/lib/sheets";
import { sendHelpEmail } from "@/lib/notify";
import { getSession } from "@/lib/auth";

const HEADERS = ["Created", "Salon", "Name", "Type", "Offer", "Audience", "Channels", "Send date", "Status", "Notes"];

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Please sign in to manage promotions." }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const name = (body.name ?? "").trim();
  const type = (body.type ?? "Promotion").trim();
  const offer = (body.offer ?? "").trim();
  const audience = (body.audience ?? "All clients").trim();
  const channels = Array.isArray(body.channels) ? body.channels.join(", ") : (body.channels ?? "").toString().trim();
  const sendDate = (body.sendDate ?? "").trim();
  const notes = (body.notes ?? "").trim();

  if (!name || !offer) {
    return NextResponse.json({ error: "Give the promotion a name and an offer." }, { status: 400 });
  }

  const scheduled = sendDate && Date.parse(sendDate) > Date.now();
  const status = scheduled ? "scheduled" : "draft";

  const sheet = await appendSheetRow("Promotions", HEADERS, [
    new Date().toISOString(), session.salon, name, type, offer, audience, channels, sendDate, status, notes,
  ]);

  const notify = await sendHelpEmail({
    name: "Promotions",
    email: "no-reply@unknown.invalid",
    concern_type: `Promotion ${status}`,
    page_name: name,
    message:
      `${status === "scheduled" ? "Scheduled" : "Drafted"} promotion: ${name}\n\n` +
      `Type: ${type}\nOffer: ${offer}\nAudience: ${audience}\nChannels: ${channels || "n/a"}\n` +
      `Send date: ${sendDate || "not set"}\n\n${notes || ""}`.trim(),
  }).catch(() => ({ ok: false as const }));

  if (!sheet.ok && !notify.ok) {
    return NextResponse.json({ error: "Couldn't save the promotion — try again." }, { status: 502 });
  }

  return NextResponse.json({ ok: true, status, sheet, notification: notify });
}
