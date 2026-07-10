/**
 * POST /api/client — add or update a client in the "Clients" tab. Used by the
 * re-engagement view to flag who's overdue to rebook. (Eventually this tab is
 * fed by the booking system; for now owners can add clients here.)
 */
import { NextRequest, NextResponse } from "next/server";
import { appendSheetRow } from "@/lib/sheets";
import { getSession } from "@/lib/auth";

const HEADERS = ["Added", "Salon", "Name", "Email", "Phone", "Last visit", "Service", "Interval days"];

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Please sign in to manage clients." }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim();
  const phone = (body.phone ?? "").trim();
  const lastVisit = (body.lastVisit ?? "").trim();
  const service = (body.service ?? "").trim();
  const intervalDays = Math.max(1, Math.round(Number(body.intervalDays) || 42));

  if (!name) {
    return NextResponse.json({ error: "Client name is required." }, { status: 400 });
  }

  const sheet = await appendSheetRow("Clients", HEADERS, [
    new Date().toISOString().slice(0, 10), session.salon, name, email, phone, lastVisit, service, String(intervalDays),
  ]);

  if (!sheet.ok) {
    return NextResponse.json({ error: "Couldn't save the client — try again." }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
