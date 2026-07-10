import { NextRequest, NextResponse } from "next/server";
import { appendSheetRow } from "@/lib/sheets";

const SUITE_APPLICATION_HEADERS = [
  "Created",
  "Name",
  "Email",
  "Phone",
  "Business Name",
  "Profession",
  "Desired Start",
  "Instagram",
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
  const businessName = String(body.businessName ?? "").trim();
  const profession = String(body.profession ?? "").trim();
  const desiredStart = String(body.desiredStart ?? "").trim();
  const instagram = String(body.instagram ?? "").trim();
  const notes = String(body.notes ?? "").trim();

  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !phone || !profession) {
    return NextResponse.json({ error: "Complete the required application fields." }, { status: 400 });
  }

  const saved = await appendSheetRow("SuiteApplications", SUITE_APPLICATION_HEADERS, [
    new Date().toISOString(),
    name,
    email,
    phone,
    businessName,
    profession,
    desiredStart,
    instagram,
    notes,
    "new",
    "barestudios-os",
  ]);

  if (!saved.ok) {
    return NextResponse.json({ error: "Couldn't save the suite application. Check the database connection." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
