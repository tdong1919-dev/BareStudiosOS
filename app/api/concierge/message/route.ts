import { NextRequest, NextResponse } from "next/server";
import { logConciergeMessage } from "@/lib/concierge";

export const runtime = "nodejs";

function inferIntent(message: string) {
  const text = message.toLowerCase();
  if (text.includes("book") || text.includes("appointment") || text.includes("available")) return "Booking";
  if (text.includes("price") || text.includes("cost")) return "Pricing";
  if (text.includes("cancel") || text.includes("reschedule")) return "Reschedule";
  if (text.includes("career") || text.includes("rent") || text.includes("suite") || text.includes("chair")) return "Rent + Careers";
  return "General question";
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const message = String(body.message ?? "").trim();
  const clientName = String(body.clientName ?? body.name ?? "").trim();
  const contact = String(body.contact ?? body.phone ?? body.email ?? "").trim();
  const channel = String(body.channel ?? "Website chat").trim();

  if (!message) return NextResponse.json({ error: "Message is required." }, { status: 400 });

  const saved = await logConciergeMessage({
    channel,
    direction: "Inbound",
    clientName: clientName || "Guest",
    contact,
    message,
    intent: inferIntent(message),
    status: "New",
    assignedTo: "AI Concierge",
    source: "Bare Studios web app",
  });

  if (!saved.ok) {
    return NextResponse.json({ error: saved.error || "Could not save to Google Sheets." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
