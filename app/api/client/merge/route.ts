import { NextRequest, NextResponse } from "next/server";
import { CLIENT_MERGE_HEADERS } from "@/lib/client-records";
import { appendSheetRow } from "@/lib/sheets";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Please sign in to merge clients." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const masterKey = String(body.masterKey || "").trim();
  const duplicateKeys = Array.isArray(body.duplicateKeys)
    ? body.duplicateKeys.map((key: unknown) => String(key || "").trim()).filter(Boolean)
    : [];
  const masterName = String(body.masterName || "").trim();
  const duplicateNames = Array.isArray(body.duplicateNames)
    ? body.duplicateNames.map((name: unknown) => String(name || "").trim()).filter(Boolean)
    : [];

  if (!masterKey || duplicateKeys.length === 0) {
    return NextResponse.json({ error: "Choose a master client and at least one duplicate." }, { status: 400 });
  }

  const saved = await appendSheetRow("ClientMerges", CLIENT_MERGE_HEADERS, [
    new Date().toISOString(),
    session.salon,
    masterKey,
    masterName,
    duplicateKeys.join("|"),
    duplicateNames.join(" | "),
    "merged",
    "Append-only merge marker. Original imported rows remain in Clients.",
  ]);

  if (!saved.ok) {
    return NextResponse.json({ error: saved.error || "Couldn't save the merge." }, { status: 502 });
  }

  return NextResponse.json({ ok: true, merged: duplicateKeys.length });
}
