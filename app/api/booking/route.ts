import { NextRequest, NextResponse } from "next/server";
import { appendSheetRow } from "@/lib/sheets";

const BOOKING_HEADERS = [
  "Created",
  "Client Name",
  "Email",
  "Phone",
  "Service",
  "Artist",
  "Preferred Date",
  "Preferred Time",
  "Notes",
  "Status",
  "Source",
];

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const service = String(body.service ?? "").trim();
  const artist = String(body.artist ?? "").trim();
  const preferredDate = String(body.preferredDate ?? "").trim();
  const preferredTime = String(body.preferredTime ?? "").trim();
  const notes = String(body.notes ?? "").trim();

  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !phone || !service || !preferredDate || !preferredTime) {
    return NextResponse.json({ error: "Complete the required booking fields." }, { status: 400 });
  }

  const saved = await appendSheetRow("BookingRequests", BOOKING_HEADERS, [
    new Date().toISOString(),
    name,
    email,
    phone,
    service,
    artist || "First available",
    preferredDate,
    preferredTime,
    notes,
    "requested",
    "barestudios-os",
  ]);

  if (!saved.ok) {
    return NextResponse.json({ error: "Couldn't save the booking request. Check the database connection." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
