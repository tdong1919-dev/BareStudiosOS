/**
 * POST /api/inventory — a team member flags a product as low. The item is
 * logged to an "Inventory" tab and whoever orders supplies is emailed. Pairs
 * with /api/inventory/suggest for AI reorder suggestions.
 */
import { NextRequest, NextResponse } from "next/server";
import { appendSheetRow } from "@/lib/sheets";
import { sendHelpEmail } from "@/lib/notify";
import { getSession } from "@/lib/auth";

const HEADERS = ["Flagged", "Salon", "Product", "On hand", "Threshold", "Vendor", "Flagged by", "Notes", "Status", "Category"];

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Please sign in to manage inventory." }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const product = (body.product ?? "").trim();
  const onHand = (body.onHand ?? "").toString().trim();
  const threshold = (body.threshold ?? "").toString().trim();
  const vendor = (body.vendor ?? "").trim();
  const flaggedBy = (body.flaggedBy ?? "").trim();
  const notes = (body.notes ?? "").trim();
  const category = (body.category ?? "Supplies").trim(); // COGS | Supplies — for taxes

  if (!product) {
    return NextResponse.json({ error: "What product is running low?" }, { status: 400 });
  }

  const sheet = await appendSheetRow("Inventory", HEADERS, [
    new Date().toISOString(), session.salon, product, onHand, threshold, vendor, flaggedBy, notes, "needs reorder", category,
  ]);

  const notify = await sendHelpEmail({
    name: flaggedBy || "A team member",
    email: "no-reply@unknown.invalid",
    page_name: vendor || null,
    concern_type: "Low stock",
    message:
      `Low stock flagged: ${product}\n\n` +
      `On hand: ${onHand || "?"} (threshold ${threshold || "?"})\n` +
      `Usual vendor: ${vendor || "n/a"}\n` +
      `Flagged by: ${flaggedBy || "anonymous"}\n` +
      `Category: ${category}\n\n` +
      `${notes || ""}`.trim(),
  }).catch(() => ({ ok: false as const }));

  if (!sheet.ok && !notify.ok) {
    return NextResponse.json({ error: "Couldn't record that — try again." }, { status: 502 });
  }

  return NextResponse.json({ ok: true, sheet, notification: notify });
}
