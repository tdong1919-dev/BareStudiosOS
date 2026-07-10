import { NextRequest, NextResponse } from "next/server";
import { appendBusinessProfile } from "@/lib/account-data";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Please sign in before onboarding." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const businessName = String(body.businessName ?? "").trim();
  const address = String(body.address ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const teamAccountsNeeded = String(body.teamAccountsNeeded ?? "").trim();
  const features = Array.isArray(body.features) ? body.features.map(String).join(", ") : String(body.features ?? "").trim();
  const hasMultipleLocations = body.hasMultipleLocations ? "Yes" : "No";
  const primaryLocation = String(body.primaryLocation ?? businessName ?? session.salon).trim();
  const notes = String(body.notes ?? "").trim();

  if (!businessName || !address || !phone || !teamAccountsNeeded || !features) {
    return NextResponse.json({ error: "Fill out the required business setup fields." }, { status: 400 });
  }

  const saved = await appendBusinessProfile({
    ownerEmail: session.email,
    salon: session.salon || businessName,
    businessName,
    address,
    phone,
    teamAccountsNeeded,
    features,
    hasMultipleLocations,
    primaryLocation,
    notes,
  });

  if (!saved.ok) {
    return NextResponse.json({ error: "Couldn't save the business setup. Check the database connection." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
