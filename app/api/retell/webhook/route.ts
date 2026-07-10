import { NextRequest, NextResponse } from "next/server";
import { logConciergeMessage } from "@/lib/concierge";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const call = body.call || body.data || body;
  const callId = String(call.call_id || call.id || body.call_id || "");
  const from = String(call.from_number || call.customer_number || call.from || "");
  const transcript = String(call.transcript || call.transcript_text || body.transcript || "");
  const summary = String(call.call_summary || call.summary || body.summary || "");
  const recording = String(call.recording_url || call.recording || "");

  const saved = await logConciergeMessage({
    channel: "Phone call",
    direction: "Inbound",
    clientName: String(call.customer_name || "Caller"),
    contact: from,
    message: summary || transcript || "Retell call received.",
    intent: String(call.disconnection_reason || call.intent || "Phone concierge"),
    status: "New",
    assignedTo: "AI Concierge",
    source: "Retell webhook",
    transcriptUrl: recording,
    callId,
  });

  if (!saved.ok) return NextResponse.json({ error: saved.error || "Could not log call." }, { status: 502 });
  return NextResponse.json({ ok: true });
}
