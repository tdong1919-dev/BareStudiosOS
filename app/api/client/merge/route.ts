import { NextRequest, NextResponse } from "next/server";
import { CLIENT_MERGE_HEADERS } from "@/lib/client-records";
import { appendSheetRow, appendSheetRows } from "@/lib/sheets";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Please sign in to merge clients." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const merges = Array.isArray(body.merges) ? body.merges : [];
  if (merges.length > 0) {
    const rows: (string | number)[][] = [];
    merges.forEach((merge: Record<string, unknown>) => {
        const masterKey = String(merge.masterKey || "").trim();
        const duplicateKeys = Array.isArray(merge.duplicateKeys)
          ? merge.duplicateKeys.map((key: unknown) => String(key || "").trim()).filter(Boolean)
          : [];
        if (!masterKey || duplicateKeys.length === 0) return;
        const duplicateNames = Array.isArray(merge.duplicateNames)
          ? merge.duplicateNames.map((name: unknown) => String(name || "").trim()).filter(Boolean)
          : [];
        rows.push([
          new Date().toISOString(),
          session.salon,
          masterKey,
          String(merge.masterName || "").trim(),
          duplicateKeys.join("|"),
          duplicateNames.join(" | "),
          "merged",
          "Bulk exact duplicate merge. Original imported rows remain in Clients.",
        ]);
      });

    if (rows.length === 0) {
      return NextResponse.json({ error: "No mergeable duplicates were selected." }, { status: 400 });
    }

    const saved = await appendSheetRows("ClientMerges", CLIENT_MERGE_HEADERS, rows);
    if (!saved.ok) {
      return NextResponse.json({ error: saved.error || "Couldn't save the bulk merge." }, { status: 502 });
    }

    const hidden = rows.reduce((count, row) => count + String(row[4] || "").split("|").filter(Boolean).length, 0);
    return NextResponse.json({ ok: true, merged: hidden, groups: rows.length });
  }

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
