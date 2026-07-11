import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { appendSheetRows } from "@/lib/sheets";

const HEADERS = [
  "Added",
  "Salon",
  "Report type",
  "Date",
  "Client",
  "Service",
  "Provider",
  "Gross sales",
  "Discounts",
  "Tips",
  "Tax",
  "Fees",
  "Net sales",
  "Payment type",
  "Source",
  "Raw",
];

const MAX_IMPORT_ROWS = 100;

type ImportFinancialRow = {
  reportType?: string;
  date?: string;
  client?: string;
  service?: string;
  provider?: string;
  grossSales?: string;
  discounts?: string;
  tips?: string;
  tax?: string;
  fees?: string;
  netSales?: string;
  paymentType?: string;
  source?: string;
  raw?: string;
};

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Please sign in to import financial reports." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const rows = Array.isArray(body.rows) ? (body.rows as ImportFinancialRow[]) : [];

  if (rows.length === 0) {
    return NextResponse.json({ error: "No financial rows were found in that file." }, { status: 400 });
  }

  if (rows.length > MAX_IMPORT_ROWS) {
    return NextResponse.json(
      { error: `This importer saves ${MAX_IMPORT_ROWS} financial rows at a time. Please resume the import.` },
      { status: 400 },
    );
  }

  let skipped = 0;
  const now = new Date().toISOString().slice(0, 10);
  const rowsToSave: (string | number)[][] = [];

  for (const row of rows) {
    const date = String(row.date || "").trim();
    const client = String(row.client || "").trim();
    const service = String(row.service || "").trim();
    const provider = String(row.provider || "").trim();
    const grossSales = String(row.grossSales || "").trim();
    const netSales = String(row.netSales || "").trim();

    if (!date && !client && !service && !provider && !grossSales && !netSales) {
      skipped++;
      continue;
    }

    rowsToSave.push([
      now,
      session.salon,
      String(row.reportType || "Financial report").trim(),
      date,
      client,
      service,
      provider,
      grossSales,
      String(row.discounts || "").trim(),
      String(row.tips || "").trim(),
      String(row.tax || "").trim(),
      String(row.fees || "").trim(),
      netSales,
      String(row.paymentType || "").trim(),
      String(row.source || "financial-import").trim(),
      String(row.raw || "").trim(),
    ]);
  }

  if (rowsToSave.length === 0) {
    return NextResponse.json({ ok: true, imported: 0, skipped });
  }

  const saved = await appendSheetRows("FinancialReports", HEADERS, rowsToSave);

  if (!saved.ok) {
    return NextResponse.json(
      {
        error:
          saved.error ||
          "Google Sheets could not save this financial batch. Make sure the Apps Script has bulk row support.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, imported: rowsToSave.length, skipped });
}
