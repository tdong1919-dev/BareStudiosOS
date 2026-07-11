import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { appendSheetRows } from "@/lib/sheets";

const HEADERS = ["Added", "Salon", "Name", "Email", "Phone", "Last visit", "Service", "Interval days"];
const MAX_IMPORT_ROWS = 100;

type ImportClient = {
  name?: string;
  email?: string;
  phone?: string;
  lastVisit?: string;
  service?: string;
  intervalDays?: string;
};

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Please sign in to import clients." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const rows = Array.isArray(body.rows) ? (body.rows as ImportClient[]) : [];

  if (rows.length === 0) {
    return NextResponse.json({ error: "No client rows were found in that file." }, { status: 400 });
  }

  if (rows.length > MAX_IMPORT_ROWS) {
    return NextResponse.json(
      { error: `This importer saves ${MAX_IMPORT_ROWS} clients at a time. Please retry the import.` },
      { status: 400 },
    );
  }

  let skipped = 0;
  const now = new Date().toISOString().slice(0, 10);
  const rowsToSave: (string | number)[][] = [];

  for (const row of rows) {
    const name = String(row.name || "").trim();
    const email = String(row.email || "").trim();
    const phone = String(row.phone || "").trim();

    if (!name && !email && !phone) {
      skipped++;
    } else {
      rowsToSave.push([
        now,
        session.salon,
        name || email || phone,
        email,
        phone,
        String(row.lastVisit || "").trim(),
        String(row.service || "").trim(),
        String(row.intervalDays || "").trim(),
      ]);
    }
  }

  if (rowsToSave.length === 0) {
    return NextResponse.json({ ok: true, imported: 0, skipped });
  }

  const saved = await appendSheetRows("Clients", HEADERS, rowsToSave);

  if (!saved.ok) {
    return NextResponse.json(
      {
        error:
          saved.error ||
          "Google Sheets could not save this batch. Make sure the Apps Script has been updated to support bulk rows.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, imported: rowsToSave.length, skipped });
}
